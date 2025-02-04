// src/agent/security.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const os = require('os');
const { promisify } = require('util');
const config = require('../../config');

class SecurityManager {
    constructor(securityConfig) {
        this.config = securityConfig;
        this.rateLimits = new Map();
        this.blockedIPs = new Set();
        this.deviceId = null;
        this.encryptionKey = null;
    }

    async initialize() {
        // Generate or load device ID
        this.deviceId = await this.generateDeviceId();
        
        // Initialize encryption key
        this.encryptionKey = await this.initializeEncryptionKey();
        
        // Start key rotation timer
        if (this.config.encryption.keyRotationInterval) {
            setInterval(() => this.rotateEncryptionKey(), 
                this.config.encryption.keyRotationInterval);
        }

        // Initialize rate limiting cleanup
        setInterval(() => this.cleanupRateLimits(), 
            this.config.protection.rateLimiting.timeWindow);
    }

    async generateDeviceId() {
        try {
            const systemInfo = [
                os.hostname(),
                JSON.stringify(os.networkInterfaces()),
                process.env.COMPUTERNAME || process.env.HOSTNAME,
                os.platform(),
                os.release()
            ].join('|');

            return crypto
                .createHash('sha256')
                .update(systemInfo)
                .digest('hex')
                .substring(0, 16);
        } catch (error) {
            throw new Error('Failed to generate device ID: ' + error.message);
        }
    }

    async initializeEncryptionKey() {
        try {
            if (this.config.encryption.key) {
                return Buffer.from(this.config.encryption.key, 'hex');
            }
            // Generate new key if none exists
            return crypto.randomBytes(32);
        } catch (error) {
            throw new Error('Failed to initialize encryption key: ' + error.message);
        }
    }

    async generateToken() {
        try {
            return jwt.sign(
                { 
                    deviceId: this.deviceId,
                    timestamp: Date.now()
                },
                this.config.jwt.secret,
                {
                    expiresIn: this.config.jwt.expiresIn,
                    algorithm: this.config.jwt.algorithms[0]
                }
            );
        } catch (error) {
            throw new Error('Failed to generate token: ' + error.message);
        }
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwt.secret, {
                algorithms: this.config.jwt.algorithms
            });
            return decoded.deviceId === this.deviceId;
        } catch (err