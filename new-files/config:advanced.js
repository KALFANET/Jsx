// config/advanced.js
module.exports = {
    // Performance Monitoring
    monitoring: {
        // CPU Monitoring
        cpu: {
            checkInterval: 5000,
            thresholds: {
                warning: 80,
                critical: 90,
                sustainedWarning: 70,
                sustainedDuration: 300000 // 5 minutes
            },
            samplingRate: 1000
        },

        // Memory Monitoring
        memory: {
            checkInterval: 10000,
            thresholds: {
                warning: 80,
                critical: 90,
                leakDetection: {
                    increaseRate: 5, // 5% increase per minute
                    duration: 600000 // 10 minutes
                }
            }
        },

        // Network Monitoring
        network: {
            checkInterval: 15000,
            thresholds: {
                bandwidth: {
                    warning: 50000000, // 50 MB/s
                    critical: 100000000 // 100 MB/s
                },
                connections: {
                    warning: 1000,
                    critical: 2000
                },
                anomalyDetection: {
                    deviationFactor: 2.0, // Standard deviations from mean
                    samplingPeriod: 3600000 // 1 hour
                }
            }
        }
    },

    // Security Configuration
    security: {
        // Command Validation
        commands: {
            maxLength: 1000,
            timeout: 30000,
            blockedPatterns: [
                'rm\\s+-rf\\s+[/\\\\]',
                'format\\s+[c-z]:', 
                'mkfs',
                'dd\\s+if=/dev/zero',
                '>[\\s/\\\\]dev\\\\s*\\\\[a-z]'
            ],
            allowedCommands: [
                'systeminfo',
                'ipconfig',
                'netstat',
                'tasklist',
                'wmic',
                'ps',
                'top',
                'df',
                'free'
            ]
        },

        // Encryption
        encryption: {
            algorithm: 'aes-256-gcm',
            keyRotationInterval: 86400000, // 24 hours
            backupKeys: 3 // Keep last 3 keys for rotation
        },

        // Authentication
        auth: {
            tokenExpiration: 3600, // 1 hour
            refreshThreshold: 300, // 5 minutes before expiration
            maxFailedAttempts: 5,
            lockoutDuration: 900000 // 15 minutes
        }
    },

    // Recovery Configuration
    recovery: {
        backup: {
            interval: 300000, // 5 minutes
            maxBackups: 5,
            compressionLevel: 9
        },
        autoRecover: {
            enabled: true,
            maxAttempts: 3,
            backoffInterval: 5000 // 5 seconds
        },
        persistentStorage: {
            path: './storage',
            maxSize: 100 * 1024 * 1024, // 100MB
            cleanup: {
                maxAge: 604800000, // 7 days
                interval: 86400000 // 24 hours
            }
        }
    },

    // Communication
    communication: {
        websocket: {
            reconnect: {
                maxAttempts: 10,
                initialDelay: 1000,
                maxDelay: 30000,
                factor: 1.5
            },
            keepalive: {
                enabled: true,
                interval: 30000,
                timeout: 5000
            },
            compression: {
                enabled: true,
                threshold: 1024 // Compress messages larger than 1KB
            }
        },
        messageQueue: {
            maxSize: 1000,
            retryDelay: 5000,
            retentionPeriod: 3600000 // 1 hour
        }
    },

    // System Integration
    system: {
        startup: {
            delay: 5000,
            priority: 'high',
            dependencies: ['network']
        },
        resources: {
            maxCpuPercent: 10,
            maxMemoryMB: 200,
            maxDiskM