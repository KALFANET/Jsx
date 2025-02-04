# 📌 אפיון מערכת מלא – PC & MAC Network Manager
גרסה: 2.0.0 | תאריך: פברואר 2025

## 📂 1. סקירת המערכת

### 1.1 מטרת המערכת
- ניהול מרכזי של מחשבי PC ו-MAC ברשת
- מתן יכולות שליטה מרחוק מאובטחות
- ניטור ביצועים ואיסוף מטריקות
- אבטחת המערכת והתקשורת

### 1.2 רכיבים מרכזיים
1. **Client (Electron.js Application)**
   - ממשק ניהול למנהל המערכת
   - תצוגת סטטוס וביצועים
   - ממשק שליטה מרחוק

2. **Agent (Node.js Service)**
   - רץ על כל מחשב מנוהל
   - אוסף מידע ומבצע פקודות
   - מתקשר עם השרת המרכזי

3. **Backend Server**
   - מקבל נתונים מה-Agents
   - מנהל אימות והרשאות
   - שומר היסטוריית פעילות

## 📁 2. מבנה הפרויקט

### 2.1 מבנה תיקיות
```
network-manager/
├── src/
│   ├── client/          # Electron.js client
│   │   ├── main.js
│   │   ├── renderer.js
│   │   └── preload.js
│   ├── agent/           # Local agent
│   │   ├── network-agent.js
│   │   ├── security.js
│   │   ├── metrics.js
│   │   └── error-handler.js
│   └── server/          # Backend server
│       ├── app.js
│       └── websocket.js
├── config/
│   ├── index.js         # Main configuration
│   ├── security.js      # Security settings
│   └── monitoring.js    # Monitoring config
├── tests/
│   ├── system-tests.js
│   ├── agent-tests.js
│   └── client-tests.js
├── docs/
│   └── agent-documentation.md
└── logs/
    └── .gitkeep
```

### 2.2 תלויות ראשיות
```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "express": "^4.18.0",
    "ws": "^8.0.0",
    "systeminformation": "^5.21.0",
    "log4js": "^6.9.0",
    "jwt": "^9.0.0",
    "node-os-utils": "^1.3.7"
  }
}
```

## 🔧 3. רכיב Agent

### 3.1 קובץ network-agent.js
```javascript
class NetworkAgent {
    constructor() {
        this.security = new SecurityManager();
        this.metrics = new MetricsCollector();
        this.errorHandler = new ErrorHandler();
        
        // ניהול מצב
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
    }

    async initialize() {
        await this.security.initialize();
        await this.connect();
        this.startMonitoring();
    }

    // יתר הפונקציות כפי שהוגדרו בקובץ המקורי
}
```

### 3.2 קובץ security.js
```javascript
class SecurityManager {
    constructor(config) {
        this.config = config;
        this.rateLimits = new Map();
        this.encryptionKey = Buffer.from(config.encryption.key, 'hex');
    }

    // פונקציות אבטחה כפי שהוגדרו בקובץ המקורי
}
```

### 3.3 קובץ metrics.js
```javascript
class MetricsCollector {
    constructor(config) {
        this.config = config;
        this.metrics = {
            cpu: 0,
            memory: 0,
            disk: 0,
            network: 0
        };
    }

    // פונקציות ניטור כפי שהוגדרו בקובץ המקורי
}
```

## 🖥 4. רכיב Client

### 4.1 קובץ main.js (Electron)
```javascript
class NetworkManagerClient {
    constructor() {
        this.mainWindow = null;
        this.tray = null;
        this.ws = null;
        this.isConnected = false;
        this.store = new Store();
    }

    // פונקציות ניהול ממשק כפי שהוגדרו בקובץ המקורי
}
```

### 4.2 ממשק משתמש
- System Tray Icon עם תפריט
- חלון סטטוס צף
- דשבורד מרכזי
- מסכי ניהול שונים

## 🔒 5. אבטחה

### 5.1 הצפנה ואימות
```javascript
const securityConfig = {
    encryption: {
        algorithm: 'aes-256-gcm',
        keyRotationInterval: 86400000
    },
    authentication: {
        type: 'jwt',
        expiresIn: '1h'
    },
    commands: {
        allowed: [...],
        blocked: [...]
    }
};
```

### 5.2 ניהול הרשאות
- RBAC (Role Based Access Control)
- הגדרות לפי קבוצות משתמשים
- לוג פעולות מלא

## 📊 6. ניטור וביצועים

### 6.1 מטריקות
```javascript
const monitoringConfig = {
    intervals: {
        collection: 60000,  // כל דקה
        reporting: 300000   // כל 5 דקות
    },
    thresholds: {
        cpu: 90,
        memory: 85,
        disk: 90
    },
    anomalyDetection: {
        enabled: true,
        sensitivity: 2.0
    }
};
```

### 6.2 התראות
- חריגה בביצועים
- בעיות אבטחה
- ניתוקי תקשורת

## 🔄 7. תהליכי עבודה

### 7.1 התקנה
1. התקנת Node.js ותלויות
2. הגדרת משתני סביבה
3. אתחול מזהה מכשיר
4. הפעלת שירות

### 7.2 עדכונים
- בדיקת עדכונים אוטומטית
- התקנה שקטה
- גיבוי לפני עדכון

## 📝 8. בדיקות

### 8.1 קובץ system-tests.js
```javascript
describe('System Integration Tests', () => {
    // בדיקות מערכת כפי שהוגדרו בקובץ המקורי
});
```

### 8.2 קובץ agent-tests.js
```javascript
describe('Agent Unit Tests', () => {
    // בדיקות יחידה כפי שהוגדרו בקובץ המקורי
});
```

## 📋 9. תיעוד API

### 9.1 WebSocket Events
```javascript
// חיבור
{
    type: 'connect',
    deviceId: string,
    token: string
}

// מטריקות
{
    type: 'metrics',
    data: MetricsData
}

// פקודות
{
    type: 'command',
    data: CommandData
}
```

### 9.2 REST Endpoints
```javascript
GET  /api/status
POST /api/command
GET  /api/metrics
```

## 🎯 10. יעדים ושלבי פיתוח

### 10.1 שלב נוכחי
- ✅ אפיון מפורט
- ✅ פיתוח Agent בסיסי
- ✅ מערכת אבטחה

### 10.2 שלבים הבאים
1. השלמת פיתוח Client
2. בדיקות אינטגרציה
3. פיילוט ראשוני
4. השקה מלאה

## 📚 11. נספחים

### 11.1 משתני סביבה
```env
SERVER_URL=wss://server:8080
JWT_SECRET=your-secret
LOG_LEVEL=info
ENCRYPTION_KEY=your-key
```

### 11.2 פתרון תקלות נפוצות
1. בעיות חיבור
2. שגיאות אימות
3. בעיות ביצועים

### 11.3 תיעוד שינויים
- 2.0.0: גרסה נוכחית
- 1.9.0: שיפורי אבטחה
- 1.8.0: תמיכה ב-Mac