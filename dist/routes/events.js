"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRouter = void 0;
const express_1 = require("express");
const crypto_1 = require("crypto");
const jwt_1 = require("../lib/jwt");
const sseManager_1 = require("../lib/sseManager");
exports.eventsRouter = (0, express_1.Router)();
/**
 * GET /events?token=<jwt>
 *
 * SSE uses a persistent GET connection — Authorization headers can't be set
 * by EventSource in the browser, so we accept the JWT as a query param instead.
 */
exports.eventsRouter.get('/', (req, res) => {
    const token = req.query.token;
    if (!token) {
        res.status(401).json({ error: 'token query param required' });
        return;
    }
    let userId;
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        userId = payload.userId;
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
    res.flushHeaders();
    const clientId = (0, crypto_1.randomUUID)();
    (0, sseManager_1.addClient)(clientId, userId, res);
    // Heartbeat every 30s to keep the connection alive through proxies
    const heartbeat = setInterval(() => {
        try {
            res.write(': heartbeat\n\n');
        }
        catch {
            clearInterval(heartbeat);
        }
    }, 30000);
    // Send a connected confirmation event
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ clientId, userId })}\n\n`);
    req.on('close', () => {
        clearInterval(heartbeat);
        (0, sseManager_1.removeClient)(clientId);
    });
});
//# sourceMappingURL=events.js.map