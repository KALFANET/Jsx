// src/security.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

class SecurityManager {
    constructor(securityConfig) {
        this.config = securityConfig;
        this.rateLimits = new Map();
        this.blockedIPs = new Set();
        this.encryptionKey = Buffer.from(securityConfig.encryption.key, 'hex');
    }

    async initialize() {
        // אתחול מערכת האבטחה
        this.deviceId = await this.generateDeviceId();
        
        // ניקוי תקופתי של rate limits
        setInterval(() => this.cleanupRateLimits(), 
            this.config.protection.rateLimiting.timeWindow);
    }

    async generateDeviceId() {
        const systemInfo = [
            require('os').hostname(),
            JSON.stringify(require('os').networkInterfaces()),
            process.env.COMPUTERNAME || process.env.HOSTNAME
        ].join('|');

        return crypto
            .createHash('sha256')
            .update(systemInfo)
            .digest('hex')
            .substring(0, 16);
    }

    async generateToken() {
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
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwt.secret, {
                algorithms: this.config.jwt.algorithms
            });
            return decoded.deviceId === this.deviceId;
        } catch (error) {
            return false;
        }
    }

    validateCommand(command) {
        // בדיקת אורך הפקודה
        if (!command || 
            command.length > this.config.protection.maxCommandLength) {
            return false;
        }

        // בדיקה מול רשימה שחורה
        const isBlocked = this.config.commands.blocked.some(
            pattern => new RegExp(pattern).test(command)
        );
        if (isBlocked) {
            return false;
        }

        // בדיקת הרשאות
        const isAllowed = this.config.commands.allowed.some(
            cmd => command.startsWith(cmd)
        );
        if (!isAllowed) {
            return false;
        }

        return true;
    }

    checkRateLimit(actionType) {
        const now = Date.now();
        const windowMs = this.config.protection.rateLimiting.timeWindow;
        const maxRequests = this.config.protection.rateLimiting.maxRequests;

        // איסוף היסטוריית פעולות
        const history = this.rateLimits.get(actionType) || [];
        const recentRequests = history.filter(time => now - time < windowMs);

        // עדכון היסטוריה
        recentRequests.push(now);
        this.rateLimits.set(actionType, recentRequests);

        return recentRequests.length <= maxRequests;
    }

    cleanupRateLimits() {
        const now = Date.now();
        const windowMs = this.config.protection.rateLimiting.timeWindow;

        for (const [action, history] of this.rateLimits.entries()) {
            const recentRequests = history.filter(time => now - time < windowMs);
            if (recentRequests.length === 0) {
                this.rateLimits.delete(action);
            } else {
                this.rateLimits.set(action, recentRequests);
            }
        }
    }

    async encryptMessage(message) {
        const iv = crypto.randomBytes(this.config.encryption.ivLength);
        const cipher = crypto.createCipheriv(
            this.config.encryption.algorithm,
            this.encryptionKey,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(JSON.stringify(message)),
            cipher.final()
        ]);

        return JSON.stringify({
            iv: iv.toString('hex'),
            data: encrypted.toString('hex'),
            tag: cipher.getAuthTag().toString('hex')
        });
    }

    async decryptMessage(encryptedMessage) {
        const { iv, data, tag } = JSON.parse(encryptedMessage);
        
        const decipher = crypto.createDecipheriv(
            this.config.encryption.algorithm,
            this.encryptionKey,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(tag, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(data, 'hex')),
            decipher.final()
        ]);

        return JSON.parse(decrypted.toString());
    }

    async cleanup() {
        // ניקוי נתונים רגישים מהזיכרון
        this.rateLimits.clear();
        this.blockedIPs.clear();
    }
}

module.exports = { SecurityManager };