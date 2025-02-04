// main.js
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Store = require('electron-store');
const log = require('log4js');
const { autoUpdater } = require('electron-updater');
const crypto = require('crypto');
const os = require('os');
const si = require('systeminformation');
require('dotenv').config();

class SecurityManager {
  constructor() {
    this.blockedCommands = ['rm', 'format', 'del', 'fdisk'];
    this.encryptionKey = process.env.ENCRYPTION_KEY;
  }

  validateCommand(command) {
    if (this.blockedCommands.some(cmd => command.toLowerCase().includes(cmd))) {
      throw new Error('Blocked command detected');
    }
    return this.sanitizeCommand(command);
  }

  sanitizeCommand(command) {
    return command.replace(/[;&|`$]/g, '');
  }

  async encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return {
      iv: iv.toString('hex'),
      data: encrypted.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    };
  }

  async decryptData(encryptedData) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedData.data, 'hex')),
      decipher.final()
    ]).toString();
  }
}

class ResourceManager {
  constructor() {
    this.metrics = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    };
    this.thresholds = {
      cpu: 90,
      memory: 90,
      disk: 90
    };
  }

  async collectMetrics() {
    try {
      const [cpu, mem, disk, net] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats()
      ]);

      this.metrics = {
        cpu: cpu.currentLoad,
        memory: (mem.used / mem.total) * 100,
        disk: disk[0].use,
        network: {
          rx: net[0].rx_sec,
          tx: net[0].tx_sec
        }
      };

      return this.metrics;
    } catch (error) {
      log.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  async checkThresholds() {
    const alerts = [];
    if (this.metrics.cpu > this.thresholds.cpu) {
      alerts.push(`High CPU usage: ${this.metrics.cpu}%`);
    }
    if (this.metrics.memory > this.thresholds.memory) {
      alerts.push(`High memory usage: ${this.metrics.memory}%`);
    }
    if (this.metrics.disk > this.thresholds.disk) {
      alerts.push(`High disk usage: ${this.metrics.disk}%`);
    }
    return alerts;
  }
}

class NetworkManagerClient {
  constructor() {
    // Basic initialization
    this.mainWindow = null;
    this.tray = null;
    this.ws = null;
    this.isConnected = false;
    this.store = new Store({
      encryptionKey: process.env.STORE_ENCRYPTION_KEY
    });

    // Get or generate device ID
    this.deviceId = this.store.get('deviceId') || this.generateDeviceId();
    this.store.set('deviceId', this.deviceId);

    // Initialize managers
    this.security = new SecurityManager();
    this.resources = new ResourceManager();
    this.messageQueue = [];
    this.pendingCommands = new Map();
    this.reconnectAttempts = 0;
    
    // Configure logging
    this.setupLogging();

    // Configure auto updater
    this.setupAutoUpdater();
  }

  setupLogging() {
    log.configure({
      appenders: {
        file: { 
          type: 'file', 
          filename: 'client.log',
          maxLogSize: 10 * 1024 * 1024, // 10MB
          backups: 5,
          compress: true
        },
        console: { type: 'console' }
      },
      categories: {
        default: { 
          appenders: ['file', 'console'], 
          level: process.env.LOG_LEVEL || 'info'
        }
      }
    });
    this.logger = log.getLogger();
  }

  generateDeviceId() {
    const machine = crypto
      .createHash('sha256')
      .update(os.hostname() + JSON.stringify(os.networkInterfaces()))
      .digest('hex');
    return `${os.platform()}-${machine.substring(0, 8)}`;
  }

  async initialize() {
    try {
      await app.whenReady();
      
      // Initialize all components
      this.createTray();
      this.createMainWindow();
      await this.initializeWebSocket();
      this.setupAutoUpdater();
      this.registerIpcHandlers();
      this.startMonitoring();
      
      // Prevent app from closing
      app.on('window-all-closed', (e) => {
        e.preventDefault();
      });

      // Recovery system
      await this.recover();
      
      this.logger.info('Application initialized successfully');
    } catch (error) {
      this.logger.error('Initialization error:', error);
      app.quit();
    }
  }

  async initializeWebSocket() {
    const MAX_RETRIES = 5;
    const BACKOFF_DELAY = 1000;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const serverUrl = process.env.SERVER_URL || 'wss://server:8080';
        
        this.ws = new WebSocket(serverUrl, {
          headers: {
            'Device-ID': this.deviceId,
            'Auth-Token': await this.getAuthToken(),
            'Version': app.getVersion(),
            'Platform': process.platform
          },
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        });

        this.setupWebSocketHandlers();
        
        // Send queued messages after connection
        if (this.messageQueue.length > 0) {
          this.processPendingMessages();
        }

        return;
      } catch (error) {
        this.logger.error(`Connection attempt ${attempt} failed:`, error);
        if (attempt === MAX_RETRIES) {
          throw new Error('Max connection attempts reached');
        }
        await new Promise(r => setTimeout(r, BACKOFF_DELAY * attempt));
      }
    }
  }

  setupWebSocketHandlers() {
    this.ws.on('open', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateTrayIcon('connected');
      this.sendSystemInfo();
      this.logger.info('Connected to server');
    });

    this.ws.on('message', async (data) => {
      try {
        const decryptedData = await this.security.decryptData(JSON.parse(data));
        const message = JSON.parse(decryptedData);
        await this.handleServerMessage(message);
      } catch (error) {
        this.logger.error('Error handling message:', error);
      }
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.updateTrayIcon('disconnected');
      this.logger.warn('Server connection closed');
      this.scheduleReconnect();
    });

    this.ws.on('error', (error) => {
      this.logger.error('WebSocket error:', error);
      this.updateTrayIcon('error');
    });
  }

  async handleServerMessage(message) {
    try {
      // Validate message structure
      if (!message.type || !message.id) {
        throw new Error('Invalid message format');
      }

      // Handle message with timeout
      const result = await Promise.race([
        this.processMessage(message),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Message timeout')), 
          parseInt(process.env.MESSAGE_TIMEOUT) || 5000)
        )
      ]);

      // Send acknowledgment
      await this.sendAck(message.id, result);
      
    } catch (error) {
      this.logger.error('Message handling error:', error);
      await this.sendError(message.id, error.message);
    }
  }

  async processMessage(message) {
    switch (message.type) {
      case 'command':
        // Validate and sanitize command
        const validatedCommand = await this.security.validateCommand(message.command);
        return await this.executeAgentCommand(validatedCommand);
      
      case 'update_available':
        return await this.handleUpdate(message.update);
      
      case 'get_status':
        return await this.getDetailedStatus();
      
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  async executeAgentCommand(command) {
    try {
      const response = await fetch('http://localhost:7000/command', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(command),
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (this.ws && this.isConnected) {
        const encryptedResult = await this.security.encryptData(
          JSON.stringify({
            type: 'command_result',
            deviceId: this.deviceId,
            commandId: command.id,
            result
          })
        );
        this.ws.send(JSON.stringify(encryptedResult));
      } else {
        this.messageQueue.push({
          type: 'command_result',
          deviceId: this.deviceId,
          commandId: command.id,
          result
        });
      }

      return result;
    } catch (error) {
      this.logger.error('Error executing command:', error);
      throw error;
    }
  }

  async getDetailedStatus() {
    try {
      const metrics = await this.resources.collectMetrics();
      const alerts = await this.resources.checkThresholds();
      
      return {
        deviceId: this.deviceId,
        version: app.getVersion(),
        connected: this.isConnected,
        metrics,
        alerts,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error getting status:', error);
      throw error;
    }
  }

  async backup() {
    try {
      const state = {
        deviceId: this.deviceId,
        settings: this.store.store,
        pendingCommands: Array.from(this.pendingCommands.entries()),
        messageQueue: this.messageQueue
      };

      await this.store.set('backup', {
        data: await this.security.encryptData(JSON.stringify(state)),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Backup failed:', error);
    }
  }

  async recover() {
    try {
      const backup = this.store.get('backup');
      if (backup) {
        const state = JSON.parse(
          await this.security.decryptData(backup.data)
        );
        
        // Restore state
        this.messageQueue = state.messageQueue || [];
        this.pendingCommands = new Map(state.pendingCommands || []);
        
        // Clear backup after successful recovery
        this.store.delete('backup');
      }
    } catch (error) {
      this.logger.error('Recovery failed:', error);
    }
  }

  startMonitoring() {
    // Monitor system resources
    setInterval(async () => {
      try {
        await this.resources.collectMetrics();
        const alerts = await this.resources.checkThresholds();
        
        if (alerts.length > 0) {
          this.sendAlerts(alerts);
        }

        await this.sendSystemStatus();
      } catch (error) {
        this.logger.error('Monitoring error:', error);
      }
    }, parseInt(process.env.MONITORING_INTERVAL) || 60000);

    // Periodic backup
    setInterval(() => this.backup(), 300000);
  }
}

// Start the client
const client = new NetworkManagerClient();
client.initialize().catch(error => {
  log.error('Fatal error:', error);
  app.quit();
});