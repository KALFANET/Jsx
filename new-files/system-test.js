// tests/system-tests.js
const { expect } = require('chai');
const sinon = require('sinon');
const WebSocket = require('ws');
const NetworkAgent = require('../src/network-agent');
const config = require('../config');
const si = require('systeminformation');
const jwt = require('jsonwebtoken');

describe('System Integration Tests', () => {
    let agent;
    let mockServer;
    let sandbox;
    let metrics = [];
    let commandResults = [];

    before(async () => {
        // הקמת שרת בדיקות
        mockServer = new WebSocket.Server({ port: 8080 });
        
        mockServer.on('connection', (ws) => {
            ws.on('message', async (data) => {
                const message = JSON.parse(data);
                handleServerMessage(ws, message);
            });
        });
    });

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        agent = new NetworkAgent();
        metrics = [];
        commandResults = [];
        await agent.initialize();
    });

    afterEach(() => {
        sandbox.restore();
        if (agent) {
            agent.cleanup('test cleanup');
        }
    });

    after(async () => {
        await new Promise(resolve => mockServer.close(resolve));
    });

    describe('חיבור והתאוששות', () => {
        it('צריך להתחבר בהצלחה לשרת', async () => {
            expect(agent.isConnected).to.be.true;
            expect(agent.reconnectAttempts).to.equal(0);
        });

        it('צריך להתחבר מחדש אחרי ניתוק', async () => {
            // ניתוק מאולץ
            agent.ws.close();
            expect(agent.isConnected).to.be.false;

            // המתנה לחיבור מחדש
            await new Promise(r => setTimeout(r, config.server.retryDelay * 2));
            expect(agent.isConnected).to.be.true;
        });

        it('צריך לטפל בניתוקים מרובים', async () => {
            for (let i = 0; i < 3; i++) {
                agent.ws.close();
                await new Promise(r => setTimeout(r, config.server.retryDelay));
                expect(agent.isConnected).to.be.true;
            }
        });
    });

    describe('ניטור וביצועים', () => {
        it('צריך לאסוף ולשלוח מטריקות', async () => {
            // Mock למטריקות מערכת
            sandbox.stub(si, 'currentLoad').resolves({ currentLoad: 50 });
            sandbox.stub(si, 'mem').resolves({ total: 16000, used: 8000 });
            
            // המתנה לאיסוף מטריקות
            await new Promise(r => setTimeout(r, config.monitoring.metrics.collectInterval + 100));
            
            expect(metrics.length).to.be.greaterThan(0);
            expect(metrics[0]).to.have.property('cpu');
            expect(metrics[0]).to.have.property('memory');
        });

        it('צריך לזהות חריגות במטריקות', async () => {
            // Mock לחריגות
            sandbox.stub(si, 'currentLoad').resolves({ currentLoad: 95 });
            sandbox.stub(si, 'mem').resolves({ total: 16000, used: 15000 });
            
            // המתנה לבדיקת חריגות
            await new Promise(r => setTimeout(r, config.monitoring.anomaly.samplingRate + 100));
            
            const anomalyMessages = metrics.filter(m => m.type === 'anomaly');
            expect(anomalyMessages.length).to.be.greaterThan(0);
        });
    });

    describe('ביצוע פקודות', () => {
        it('צריך לבצע פקודות מערכת מותרות', async () => {
            const command = { type: 'system', command: 'systeminfo' };
            const result = await agent.handleSystemCommand(command.command);
            
            expect(result).to.have.property('status', 'success');
        });

        it('צריך לחסום פקודות מסוכנות', async () => {
            const dangerousCommands = [
                'rm -rf /',
                'format c:',
                'dd if=/dev/zero'
            ];

            for (const cmd of dangerousCommands) {
                try {
                    await agent.handleSystemCommand(cmd);
                    expect.fail('Should block dangerous commands');
                } catch (error) {
                    expect(error.message).to.include('Invalid or blocked command');
                }
            }
        });

        it('צריך לטפל בריבוי פקודות במקביל', async () => {
            const commands = Array(10).fill().map(() => ({
                type: 'system',
                command: 'systeminfo'
            }));

            const results = await Promise.all(
                commands.map(cmd => agent.handleSystemCommand(cmd.command))
            const results = await Promise.all(
                commands.map(cmd => agent.handleSystemCommand(cmd.command))
            );

            expect(results).to.have.lengthOf(10);
            results.forEach(result => {
                expect(result).to.have.property('status', 'success');
            });
        });
    });

    describe('אבטחה ואימות', () => {
        it('צריך לאמת טוקנים בצורה נכונה', async () => {
            const validToken = jwt.sign(
                { deviceId: agent.security.deviceId }, 
                config.security.jwt.secret
            );
            const invalidToken = 'invalid.token.here';

            expect(await agent.security.validateToken(validToken)).to.be.true;
            expect(await agent.security.validateToken(invalidToken)).to.be.false;
        });

        it('צריך להצפין ולפענח הודעות', async () => {
            const originalMessage = { type: 'test', data: 'sensitive data' };
            
            // הצפנה
            const encrypted = await agent.security.encryptMessage(originalMessage);
            expect(encrypted).to.not.include('sensitive');

            // פענוח
            const decrypted = await agent.security.decryptMessage(encrypted);
            expect(decrypted).to.deep.equal(originalMessage);
        });

        it('צריך לעמוד במגבלות Rate Limiting', async () => {
            const maxRequests = config.security.protection.rateLimiting.maxRequests;
            const requests = Array(maxRequests + 1).fill().map(() => ({
                type: 'system',
                command: 'systeminfo'
            }));

            const results = await Promise.allSettled(
                requests.map(req => agent.handleMessage(req))
            );

            const rejected = results.filter(r => r.status === 'rejected');
            expect(rejected.length).to.equal(1);
            expect(rejected[0].reason.message).to.include('Rate limit exceeded');
        });
    });

    describe('ניהול משאבים', () => {
        it('צריך לנטר צריכת משאבים', async () => {
            const metrics = await agent.metrics.collectDetailedMetrics();
            
            expect(metrics).to.have.property('cpu');
            expect(metrics).to.have.property('memory');
            expect(metrics).to.have.property('disk');
            expect(metrics.cpu).to.be.within(0, 100);
            expect(metrics.memory.used).to.be.lessThan(metrics.memory.total);
        });

        it('צריך לבצע ניקוי משאבים בזמן', async () => {
            // יצירת קבצי לוג לדוגמה
            const fs = require('fs').promises;
            const logPath = config.logging.dir + '/test.log';
            await fs.writeFile(logPath, 'test log');

            // הרצת ניקוי
            await agent.metrics.cleanup();

            // בדיקה שהקבצים הישנים נמחקו
            try {
                await fs.access(logPath);
                expect.fail('Old log file should be deleted');
            } catch (error) {
                expect(error.code).to.equal('ENOENT');
            }
        });
    });

    describe('התאוששות מתקלות', () => {
        it('צריך לשמור מצב בזמן קריסה', async () => {
            // הכנת מצב לבדיקה
            const testState = {
                messageQueue: [{ type: 'test', data: 'important' }],
                pendingCommands: new Map([['cmd1', { status: 'pending' }]])
            };
            Object.assign(agent, testState);

            // סימולציה של קריסה
            await agent.cleanup('test crash');

            // יצירת אינסטנס חדש ובדיקת שחזור
            const newAgent = new NetworkAgent();
            await newAgent.initialize();

            expect(newAgent.messageQueue).to.deep.equal(testState.messageQueue);
            expect(Array.from(newAgent.pendingCommands.entries()))
                .to.deep.equal(Array.from(testState.pendingCommands.entries()));
        });

        it('צריך לטפל בשגיאות רשת', async () => {
            // סימולציה של בעיות רשת
            const networkErrors = [
                new Error('ECONNREFUSED'),
                new Error('ETIMEDOUT'),
                new Error('ENOTFOUND')
            ];

            for (const error of networkErrors) {
                agent.ws.emit('error', error);
                expect(agent.reconnectAttempts).to.be.above(0);
                await new Promise(r => setTimeout(r, config.server.retryDelay));
                expect(agent.isConnected).to.be.true;
            }
        });
    });

    // פונקציות עזר לבדיקות
    function handleServerMessage(ws, message) {
        switch (message.type) {
            case 'metrics':
                metrics.push(message.data);
                break;
            case 'command_result':
                commandResults.push(message.data);
                break;
            case 'error':
                console.error('Client error:', message.data);
                break;
        }
    }
});
            