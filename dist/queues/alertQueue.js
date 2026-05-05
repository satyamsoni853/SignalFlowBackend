"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertQueueEvents = exports.alertQueue = exports.ALERT_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../lib/redis");
exports.ALERT_QUEUE_NAME = 'alert-triggered';
// Dedicated queue for alert jobs
exports.alertQueue = new bullmq_1.Queue(exports.ALERT_QUEUE_NAME, {
    connection: redis_1.redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 }, // keep last 100 completed
        removeOnFail: { count: 200 }, // keep last 200 failed for inspection
    },
});
exports.alertQueueEvents = new bullmq_1.QueueEvents(exports.ALERT_QUEUE_NAME, { connection: redis_1.redis });
exports.alertQueueEvents.on('completed', ({ jobId }) => {
    console.log(`[AlertQueue] Job ${jobId} completed`);
});
exports.alertQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`[AlertQueue] Job ${jobId} failed: ${failedReason}`);
});
//# sourceMappingURL=alertQueue.js.map