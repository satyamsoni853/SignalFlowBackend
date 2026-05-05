"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = require("express");
const queue_1 = require("../lib/queue");
exports.jobRouter = (0, express_1.Router)();
// GET /api/jobs — list recent jobs
exports.jobRouter.get('/', async (_req, res) => {
    try {
        const [waiting, active, completed, failed] = await Promise.all([
            queue_1.defaultQueue.getWaiting(),
            queue_1.defaultQueue.getActive(),
            queue_1.defaultQueue.getCompleted(0, 20),
            queue_1.defaultQueue.getFailed(0, 20),
        ]);
        res.json({ waiting, active, completed, failed });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
// POST /api/jobs — manually enqueue a job
exports.jobRouter.post('/', async (req, res) => {
    const { name, data } = req.body;
    if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    try {
        const job = await queue_1.defaultQueue.add(name, data || {});
        res.status(201).json({ jobId: job.id });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to enqueue job' });
    }
});
//# sourceMappingURL=jobs.js.map