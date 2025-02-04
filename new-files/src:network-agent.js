// src/network-agent.js
const WebSocket = require('ws');
const os = require('os');
const si = require('systeminformation');
const log4js = require('log4js');
const config = require('../config');
const jwt = require('jsonwebtoken');
const { SecurityManager } = require('./security');
const { MetricsCollector } = require('./metrics');
const { ErrorHandler } = require('./error-handler');

class NetworkAgent {
    constructor() {
        // הגדרת רכיבי המערכת
        this.security = new SecurityManager(config.security);
        this.metrics = new MetricsCollector(config.monitoring);
        this.errorHandler = new ErrorHandler(config.logging);
        
        // אתחול בסיסי
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.pendingCommands = new Map();
        
        // הגדרת לוגר
        this.setupLogger();
        
        // רשימת פקודות מותרות
        this.commandHandlers = new Map([
            ['system', this.handleSystemCommand.bind(this)],
            ['network', this.handleNetworkCommand.bind(this)],
            ['performance', this.handlePerformanceCommand.bind(this)],
            ['software', this.handleSoftwareCommand.bind(this)]
        ]);
    }

    async initialize() {
        try {
            this.logger.info('Initializing Network Agent...');

            // אתחול רכיבים
            await this.security.initialize();
            await this.metrics.initialize();
            
            // יצירת חיבור לשרת
            await this.connect();
            
            // התחלת ניטור
            this.startMonitoring();
            
            // רישום מאזינים לאירועי מערכת
            this.registerSystemHandlers();
            
            this.logger.info('Network Agent initialized successfully');
        } catch (error) {
            this.errorHandler.handleError('Initialization failed', error);
            throw error;
        }
    }

    async connect() {
        const { url, retryAttempts, retryDelay } = config.server;
        
        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                this.ws = new WebSocket(url, {
                    headers: {
                        'Authorization': await this.security.generateToken(),
                        'Device-ID': await this.security.getDeviceId(),
                        'Version': require('../package.json').version
                    }
                });

                await this.setupWebSocketHandlers();
                this.reconnectAttempts = 0;
                return;

            } catch (error) {
                this.logger.error(`Connection attempt ${attempt} failed:`, error);
                if (attempt === retryAttempts) {
                    throw new Error('Max connection attempts reached');
                }
                await new Promise(r => setTimeout(r, retryDelay * attempt));
            }
        }
    }

    async setupWebSocketHandlers() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('WebSocket connection timeout'));
            }, config.server.timeout);

            this.ws.on('open', () => {
                clearTimeout(timeout);
                this.isConnected = true;
                this.sendQueuedMessages();
                this.logger.info('Connected to server');
                resolve();
            });

            this.ws.on('message', async (data) => {
                try {
                    const message = await this.security.decryptMessage(data);
                    await this.handleMessage(message);
                } catch (error) {
                    this.errorHandler.handleError('Message handling failed', error);
                }
            });

            this.ws.on('close', () => {
                this.isConnected = false;
                this.logger.warn('Connection closed');
                this.scheduleReconnect();
            });

            this.ws.on('error', (error) => {
                this.errorHandler.handleError('WebSocket error', error);
                reject(error);
            });
        });
    }

    async handleMessage(message) {
        try {
            // וולידציה של המסר
            if (!this.security.validateMessage(message)) {
                throw new Error('Invalid message format');
            }

            // טיפול במסר עם timeout
            const result = await Promise.race([
                this.processMessage(message),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Message processing timeout')), 
                    config.security.commands.timeout)
                )
            ]);

            // שליחת אישור קבלה
            await this.sendAcknowledgment(message.id, result);

        } catch (error) {
            this.errorHandler.handleError('Message handling failed', error);
            await this.sendError(message.id, error.message);
        }
    }

    async processMessage(message) {
        const handler = this.commandHandlers.get(message.type);
        if (!handler) {
            throw new Error(`Unknown message type: ${message.type}`);
        }

        // בדיקת rate limiting
        if (!this.security.checkRateLimit(message.type)) {
            throw new Error('Rate limit exceeded');
        }

        // ביצוע הפקודה
        return await handler(message.data);
    }

    async handleSystemCommand(command) {
        // וולידציה של הפקודה
        if (!this.security.validateCommand(command)) {
            throw new Error('Invalid or blocked command');
        }

        // ביצוע הפקודה
        const result = await this.executeSystemCommand(command);
        
        // שמירת לוג
        this.logger.info(`System command executed: ${command}`);
        
        return result;
    }

    async handlePerformanceCommand() {
        return await this.metrics.collectDetailedMetrics();
    }

    async handleNetworkCommand(command) {
        switch (command.action) {
            case 'scan':
                return await this.metrics.scanNetwork();
            case 'test':
                return await this.metrics.testConnection(command.target);
            default:
                throw new Error(`Unknown network action: ${command.action}`);
        }
    }

    async sendMessage(message) {
        if (!this.isConnected) {
            this.messageQueue.push(message);
            return;
        }

        try {
            const encryptedMessage = await this.security.encryptMessage(message);
            await this.ws.send(encryptedMessage);
        } catch (error) {
            this.errorHandler.handleError('Message sending failed', error);
            this.messageQueue.push(message);
        }
    }

    startMonitoring() {
        // ניטור מטריקות
        setInterval(async () => {
            try {
                const metrics = await this.metrics.collectMetrics();
                await this.sendMessage({
                    type: 'metrics',
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.errorHandler.handleError('Metrics collection failed', error);
            }
        }, config.monitoring.metrics.collectInterval);

        // בדיקת חריגות
        setInterval(async () => {
            try {
                const anomalies = await this.metrics.checkAnomalies();
                if (anomalies.length > 0) {
                    await this.sendMessage({
                        type: 'anomaly',
                        data: anomalies,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                this.errorHandler.handleError('Anomaly detection failed', error);
            }
        }, config.monitoring.anomaly.samplingRate);
    }

    setupLogger() {
        log4js.configure({
            appenders: {
                file: { 
                    type: 'file', 
                    filename: config.logging.dir + '/agent.log',
                    maxLogSize: config.logging.rotation.maxSize,
                    backups: config.logging.rotation.maxFiles,
                    compress: config.logging.rotation.compress
                },
                console: { type: 'console' }
            },
            categories: {
                default: { 
                    appenders: ['file', 'console'], 
                    level: config.logging.level 
                }
            }
        });

        this.logger = log4js.getLogger();
    }

    registerSystemHandlers() {
        process.on('SIGTERM', () => this.cleanup('SIGTERM'));
        process.on('SIGINT', () => this.cleanup('SIGINT'));
        process.on('uncaughtException', (error) => {
            this.errorHandler.handleError('Uncaught exception', error);
            this.cleanup('uncaughtException');
        });
    }

    async cleanup(reason) {
        this.logger.info(`Cleaning up due to ${reason}...`);
        
        try {
            // שמירת מצב נוכחי
            await this.metrics.saveState();
            
            // ניתוק מהשרת
            if (this.ws) {
                this.ws.close();
            }
            
            // ניקוי משאבים
            await this.metrics.cleanup();
            await this.security.cleanup();
            
            this.logger.info('Cleanup completed');
        } catch (error) {
            this.errorHandler.handleError('Cleanup failed', error);
        } finally {
            process.exit(0);
        }
    }
}

module.exports = NetworkAgent;