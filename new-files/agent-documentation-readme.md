# Network Manager Agent Documentation
Version 1.0.0 | Last Updated: February 2025

## 1. network-agent.js
### מטרה
קובץ זה מהווה את הליבה של ה-Agent המקומי שרץ על מחשבי הלקוחות. הוא אחראי על:
- תקשורת עם שרת הניהול המרכזי
- ביצוע פקודות מערכת
- ניטור ביצועים
- ניהול התקנת תוכנות

### קומפוננטות עיקריות
#### 1. NetworkAgent Class
```javascript
class NetworkAgent {
    constructor() {...}
}
```
- מנהל את מחזור החיים של ה-Agent
- מתחזק חיבור WebSocket לשרת
- מטפל בפקודות נכנסות
- אוסף וחולק מידע על ביצועי המערכת

#### 2. מערכת הפקודות
```javascript
commandHandlers: {
    'system': handleSystemCommand,
    'performance': handlePerformanceCommand,
    'software': handleSoftwareCommand,
    'network': handleNetworkCommand
}
```
- `handleSystemCommand`: מריץ פקודות מערכת
- `handlePerformanceCommand`: אוסף נתוני ביצועים
- `handleSoftwareCommand`: מנהל התקנות והסרות של תוכנות
- `handleNetworkCommand`: מבצע פעולות רשת

#### 3. ניהול חיבור
```javascript
async connect() {
    // מתחבר לשרת באמצעות WebSocket
}

scheduleReconnect() {
    // מנהל ניסיונות חיבור מחדש
}
```

### תלויות
- `ws`: חיבור WebSocket
- `systeminformation`: איסוף מידע מערכתי
- `log4js`: ניהול לוגים
- `node-os-utils`: ניטור משאבי מערכת

### דוגמאות שימוש
```javascript
// הפעלת ה-Agent
const agent = new NetworkAgent();
agent.start();

// ביצוע פקודה
await agent.executeCommand({
    type: 'system',
    command: 'systeminfo'
});
```

## 2. agent-config.js
### מטרה
קובץ הגדרות המגדיר את כל הפרמטרים והמדיניות של ה-Agent.

### הגדרות עיקריות
#### 1. תצורת שרת
```javascript
server: {
    url: process.env.SERVER_URL,
    timeout: 30000,
    reconnectInterval: 5000
}
```

#### 2. הגדרות אבטחה
```javascript
security: {
    allowedCommands: [...],
    blockedCommands: [...],
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h'
    }
}
```

#### 3. ניטור ביצועים
```javascript
monitoring: {
    interval: 60000,
    metrics: ['cpu', 'memory', 'disk', 'network']
}
```

### שימוש
```javascript
const config = require('./config');
console.log(config.security.allowedCommands);
```

## 3. agent-tests.js
### מטרה
מערך בדיקות מקיף לבדיקת תפקוד ה-Agent.

### סוגי בדיקות
#### 1. בדיקות אבטחה
```javascript
describe('Security Tests', () => {
    it('validates JWT correctly');
    it('blocks unauthorized commands');
    it('sanitizes inputs');
});
```

#### 2. בדיקות ביצועים
```javascript
describe('Performance Tests', () => {
    it('minimal CPU impact');
    it('memory footprint');
    it('concurrent operations');
});
```

#### 3. בדיקות אמינות
```javascript
describe('Reliability Tests', () => {
    it('reconnects after disconnection');
    it('persists data');
    it('handles errors');
});
```

### הרצת בדיקות
```bash
npm test agent-tests.js
```

## 4. system-tests.js
### מטרה
בדיקות אינטגרציה למערכת המלאה (Agent + Server + Client).

### סוגי בדיקות
#### 1. תקשורת End-to-End
```javascript
describe('E2E Communication', () => {
    it('completes full cycle');
    it('handles multiple agents');
});
```

#### 2. ניטור ביצועים
```javascript
describe('Performance Monitoring', () => {
    it('collects metrics');
    it('handles historical data');
});
```

#### 3. ניהול תוכנות
```javascript
describe('Software Management', () => {
    it('handles installation');
    it('manages updates');
});
```

### הרצת בדיקות מערכת
```bash
npm test system-tests.js
```

## התקנה והפעלה

### דרישות מוקדמות
- Node.js 18 ומעלה
- Python 3.8 ומעלה (עבור פקודות מערכת מסוימות)
- הרשאות מערכת מתאימות

### התקנה
1. התקנת תלויות:
```bash
npm install
```

2. הגדרת משתני סביבה:
```bash
export SERVER_URL=wss://your-server:8080
export JWT_SECRET=your-secret
```

3. הפעלת ה-Agent:
```bash
npm start
```

## ניטור ותחזוקה

### לוגים
- מיקום: `agent.log`
- רמות: INFO, WARN, ERROR
- רוטציה: כל 7 ימים

### ניטור
- צריכת משאבים
- סטטוס חיבור
- שגיאות וחריגות

### תחזוקה שוטפת
1. בדיקת לוגים
2. ניקוי קבצים זמניים
3. עדכון הגדרות לפי הצורך

## אבטחה

### הרשאות נדרשות
- הרצת פקודות מערכת
- קריאת מידע מערכתי
- התקנת תוכנות

### אמצעי אבטחה
1. JWT לאימות
2. TLS להצפנת תעבורה
3. סניטציה של קלט
4. רשימת פקודות מותרות

### טיפול בתקריות
1. ניתוק מיידי במקרה של חשד
2. תיעוד מפורט
3. דיווח למערכת המרכזית