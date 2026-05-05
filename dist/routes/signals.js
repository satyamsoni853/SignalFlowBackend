"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const queue_1 = require("../lib/queue");
exports.signalRouter = (0, express_1.Router)();
// GET /api/signals
exports.signalRouter.get('/', async (_req, res) => {
    try {
        const signals = await prisma_1.default.signal.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(signals);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch signals' });
    }
});
// POST /api/signals
exports.signalRouter.post('/', async (req, res) => {
    const { name, payload } = req.body;
    if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    try {
        const signal = await prisma_1.default.signal.create({ data: { name, payload } });
        // Enqueue a job for this signal
        await queue_1.defaultQueue.add('process-signal', { signalId: signal.id });
        res.status(201).json(signal);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create signal' });
    }
});
// DELETE /api/signals/:id
exports.signalRouter.delete('/:id', async (req, res) => {
    try {
        await prisma_1.default.signal.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(404).json({ error: 'Signal not found' });
    }
});
//# sourceMappingURL=signals.js.map