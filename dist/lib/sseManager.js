"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClient = addClient;
exports.removeClient = removeClient;
exports.sendToUser = sendToUser;
exports.broadcast = broadcast;
// In-memory registry: clientId → SSEClient
const clients = new Map();
function addClient(clientId, userId, res) {
    clients.set(clientId, { userId, res });
    console.log(`[SSE] Client connected — userId=${userId} clientId=${clientId} (total: ${clients.size})`);
}
function removeClient(clientId) {
    clients.delete(clientId);
    console.log(`[SSE] Client disconnected — clientId=${clientId} (total: ${clients.size})`);
}
function sendToUser(userId, event, data) {
    for (const [, client] of clients) {
        if (client.userId !== userId)
            continue;
        writeEvent(client.res, event, data);
    }
}
function broadcast(event, data) {
    for (const [, client] of clients) {
        writeEvent(client.res, event, data);
    }
}
function writeEvent(res, event, data) {
    try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    catch {
        // Client likely disconnected mid-write — harmless
    }
}
//# sourceMappingURL=sseManager.js.map