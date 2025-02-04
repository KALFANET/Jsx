// config/index.js
require('dotenv').config();
const path = require('path');
const crypto = require('crypto');

/**
 * קובץ הגדרות מרכזי לסוכן הרשת
 * כולל תצורה מלאה והגדרות אבטחה
 */
module.exports = {
    // הגדרות בסיסיות
    server: {
        url: process.env.SERVER_URL || 'wss://localhost:8080',
        timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
        retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 5,
        retryDelay: parseInt(process.env.RETRY_DELAY) || 5000
    },

    // אבטחה
    security: {
        // הצפנה ואימות
        encryption: {
            algorithm: 'aes-256-gcm',
            key: process.env.ENCRYPTION_KEY,
            ivLength: 16
        },
        
        // הגדרות JWT
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: '1h',
            algorithms: ['HS256']
        },

        // פקודות מותרות וחסומות
        commands: {
            allowed: [
                'systeminfo',
                'ipconfig',
                'netstat',
                'tasklist',
                'ps',
                'top',
                'df'
            ],
            blocked: [
                'rm -rf',
                'format',
                'mkfs',
                'dd'
            ],
            timeout: 30000
        },

        // הגנות נוספות
        protection: {
            maxCommandLength: 1000,
            maxPayloadSize: 1024 * 1024, // 1MB
            rateLimiting: {
                maxRequests: 100,
                timeWindow: 60000 // 1 minute
            }
        }
    },

    // ניטור וביצועים
    monitoring: {
        // הגדרות מטריקות
        metrics: {
            collectInterval: 60000, // 1 minute
            sendInterval: 300000,   // 5 minutes
            retention: 86400000,    // 24 hours
            
            thresholds: {
                cpu: {
                    warning: 80,
                    critical: 90
                },
                memory: {
                    warning: 80,
                    critical: 90
                },
                disk: {
                    warning: 85,
                    critical: 95
                }
            }
        },

        // זיהוי חריגות
        anomaly: {
            enabled: true,
            samplingRate: 60000,
            deviationThreshold: 2.0, // standard deviations
            minSamples: 30
        },

        // התראות
        alerts: {
            channels: ['log', 'websocket', 'webhook'],
            throttling: {
                maxAlerts: 10,
                timeWindow: 300000 // 5 minutes
            }
        }
    },

    // תיעוד ולוגים
    logging: {
        // הגדרות כלליות
        dir: path.join(__dirname, '../logs'),
        level: process.env.LOG_LEVEL || 'info',
        
        // רוטציה
        rotation: {
            maxFiles: 5,
            maxSize: '10M',
            compress: true
        },

        // פורמט
        format: '[%timestamp] [%level] %message',
        timestamp: () => new Date().toISOString()
    },

    // התאוששות וגיבוי
    recovery: {
        // גיבוי אוטומטי
        backup: {
            enabled: true,
            interval: 3600000, // 1 hour
            location: path.join(__dirname, '../backups'),
            keep: 24 // שמירת 24 גיבויים אחרונים
        },

        // התאוששות מקריסה
        crash: {
            enabled: true,
            maxAttempts: 3,
            backoffDelay: 5000
        }
    },

    // ניהול משאבים
    resources: {
        // מגבלות מערכת
        limits: {
            maxCpuPercent: 10,
            maxMemoryMB: 200,
            maxDiskUsageMB: 500
        },

        // ניקוי אוטומטי
        cleanup: {
            enabled: true,
            interval: 86400000, // 24 hours
            threshold: {
                logs: '100M',
                temp: '200M'
            }
        }
    },

    // פונקציות עזר
    utils: {
        // יצירת מזהה מכשיר ייחודי
        generateDeviceId: () => {
            const machine = crypto
                .createHash('sha256')
                .update(`${os.hostname()}${JSON.stringify(os.networkInterfaces())}`)
                .digest('hex');
            return `${os.platform()}-${machine.substring(0, 8)}`;
        },

        // אימות פקודה
        validateCommand: (command) => {
            if (!command || typeof command !== 'string') {
                return false;
            }
            const blocked = module.exports.security.commands.blocked;
            return !blocked.some(pattern => command.includes(pattern));
        },

        // טיפול בשגיאות
        handleError: (error) => {
            console.error('Error:', error);
            logger.error(error);
            // הוספת טיפול בשגיאות ספציפיות
        }
    }
};
