"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueEvents = exports.createWorker = exports.defaultQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.defaultQueue = new bullmq_1.Queue('signal-flow-queue', {
    connection: redis_1.redis,
});
const createWorker = (name, processor) => {
    return new bullmq_1.Worker(name, processor, { connection: redis_1.redis });
};
exports.createWorker = createWorker;
exports.queueEvents = new bullmq_1.QueueEvents('signal-flow-queue', { connection: redis_1.redis });
//# sourceMappingURL=queue.js.map