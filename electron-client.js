// main.js
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Store = require('electron-store');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

class NetworkManagerClient {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.ws = null;
    this.isConnected = false;
    this.store = new Store();
    this.deviceId = this.store.get('deviceId') || uuidv4();
    this.store.set('deviceId', this.deviceId);

    // Configure logging
    log.transports.file.level = 'info';
    log.info('Application Starting...');

    // Configure auto updater
    autoUpdater.logger = log;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
  }

  async initialize() {
    // Wait for app to be ready
    await app.whenReady();

    // Create tray icon and context menu
    this.createTray();

    // Create hidden window for background processes
    this.createMainWindow();

    // Initialize WebSocket connection
    this.initializeWebSocket();

    // Set up auto-updater
    this.setupAutoUpdater();

    // Register IPC handlers
    this.registerIpcHandlers();

    // Start monitoring system status
    this.startMonitoring();

    app.on('window-all-closed', (e) => {
      e.preventDefault(); // Prevent app from closing
    });
  }

  createTray() {
    this.tray = new Tray(path.join(__dirname, 'assets', 'tray-disconnected.png'));
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show Status',
        click: () => this.mainWindow.show()
      },
      { type: 'separator' },
      {
        label: 'Connection Status',
        enabled: false,
        label: 'Disconnected'
      },
      { type: 'separator' },
      {
        label: 'Check for Updates',
        click: () => autoUpdater.checkForUpdates()
      },
      {
        label: 'Restart Connection',
        click: () => this.restartConnection()
      },
      {
        label: 'Debug Mode',
        type: 'checkbox',
        checked: this.store.get('debugMode', false),
        click: (menuItem) => {
          this.store.set('debugMode', menuItem.checked);
          log.transports.file.level = menuItem.checked ? 'debug' : 'info';
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]);

    this.tray.setToolTip('Network Manager Client');
    this.tray.setContextMenu(contextMenu);
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 300,
      height: 400,
      show: false,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.mainWindow.loadFile('index.html');

    // Hide window when losing focus
    this.mainWindow.on('blur', () => {
      this.mainWindow.hide();
    });
  }

  async initializeWebSocket() {
    try {
      this.ws = new WebSocket('wss://server:8080', {
        headers: {
          'Device-ID': this.deviceId
        }
      });

      this.ws.on('open', () => {
        this.isConnected = true;
        this.updateTrayIcon('connected');
        this.sendSystemInfo();
        log.info('Connected to server');
      });

      this.ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleServerMessage(message);
        } catch (err) {
          log.error('Error handling message:', err);
        }
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        this.updateTrayIcon('disconnected');
        log.warn('Server connection closed');
        setTimeout(() => this.initializeWebSocket(), 5000);
      });

      this.ws.on('error', (error) => {
        log.error('WebSocket error:', error);
        this.updateTrayIcon('error');
      });

    } catch (err) {
      log.error('Connection error:', err);
      this.updateTrayIcon('error');
      setTimeout(() => this.initializeWebSocket(), 5000);
    }
  }

  async handleServerMessage(message) {
    switch (message.type) {
      case 'command':
        await this.executeAgentCommand(message.command);
        break;
      
      case 'update_available':
        await autoUpdater.downloadUpdate();
        break;
      
      case 'get_status':
        await this.sendSystemStatus();
        break;

      default:
        log.warn('Unknown message type:', message.type);
    }
  }

  async executeAgentCommand(command) {
    try {
      // Send command to local Agent via HTTP
      const response = await fetch('http://localhost:7000/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });

      const result = await response.json();
      
      // Send result back to server
      if (this.ws && this.isConnected) {
        this.ws.send(JSON.stringify({
          type: 'command_result',
          deviceId: this.deviceId,
          commandId: command.id,
          result
        }));
      }

    } catch (err) {
      log.error('Error executing command:', err);
    }
  }

  async sendSystemStatus() {
    if (!this.ws || !this.isConnected) return;

    const status = await this.getSystemStatus();
    this.ws.send(JSON.stringify({
      type: 'status_update',
      deviceId: this.deviceId,
      status
    }));
  }

  async getSystemStatus() {
    try {
      // Get status from local Agent
      const response = await fetch('http://localhost:7000/status');
      return await response.json();
    } catch (err) {
      log.error('Error getting system status:', err);
      return {
        error: 'Cannot get system status',
        timestamp: new Date().toISOString()
      };
    }
  }

  updateTrayIcon(status) {
    const icons = {
      connected: 'tray-connected.png',
      disconnected: 'tray-disconnected.png',
      error: 'tray-error.png',
      updating: 'tray-updating.png'
    };

    this.tray.setImage(path.join(__dirname, 'assets', icons[status]));
    
    const contextMenu = this.tray.getContextMenu();
    const statusItem = contextMenu.items.find(item => item.label === 'Connection Status');
    if (statusItem) {
      statusItem.label = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
  }

  setupAutoUpdater() {
    autoUpdater.on('checking-for-update', () => {
      this.updateTrayIcon('updating');
    });

    autoUpdater.on('update-available', () => {
      this.sendToWindow('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
      this.sendToWindow('update-ready');
      // Install on next restart
    });

    autoUpdater.on('error', (err) => {
      log.error('Update error:', err);
      this.updateTrayIcon('error');
    });

    // Check for updates every 6 hours
    setInterval(() => autoUpdater.checkForUpdates(), 6 * 60 * 60 * 1000);
  }

  registerIpcHandlers() {
    ipcMain.handle('get-status', async () => {
      return {
        connected: this.isConnected,
        deviceId: this.deviceId,
        version: app.getVersion(),
        debugMode: this.store.get('debugMode', false)
      };
    });

    ipcMain.handle('restart-connection', async () => {
      await this.restartConnection();
    });

    ipcMain.handle('toggle-debug', async (event, enabled) => {
      this.store.set('debugMode', enabled);
      log.transports.file.level = enabled ? 'debug' : 'info';
    });
  }

  sendToWindow(channel, data) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  async restartConnection() {
    if (this.ws) {
      this.ws.close();
    }
    await this.initializeWebSocket();
  }

  startMonitoring() {
    // Send status update every minute
    setInterval(() => this.sendSystemStatus(), 60 * 1000);
  }
}

const client = new NetworkManagerClient();
client.initialize().catch(err => {
  log.error('Initialization error:', err);
  app.quit();
});