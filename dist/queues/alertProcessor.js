"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAlertProcessor = startAlertProcessor;
const bullmq_1 = require("bullmq");
const redis_1 = require("../lib/redis");
const prisma_1 = __importDefault(require("../lib/prisma"));
const alertQueue_1 = require("./alertQueue");
const sseManager_1 = require("../lib/sseManager");
async function processAlertJob(job) {
    const { ruleId, userId, assetSymbol, condition, targetPrice, triggeredPrice, triggeredAt, } = job.data;
    console.log(`[AlertProcessor] Processing job ${job.id} — ` +
        `${assetSymbol} ${condition} ${targetPrice} (hit ${triggeredPrice})`);
    // Verify the rule still exists (may have been deleted between enqueue and process)
    const rule = await prisma_1.default.alertRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
        console.warn(`[AlertProcessor] Rule ${ruleId} no longer exists — skipping`);
        return;
    }
    // Ensure the AlertLog exists (written by alertWorker in transaction).
    // If for any reason it's missing (e.g. partial failure), create it here.
    const existingLog = await prisma_1.default.alertLog.findFirst({
        where: {
            rule_id: ruleId,
            timestamp: { gte: new Date(new Date(triggeredAt).getTime() - 10000) },
        },
    });
    if (!existingLog) {
        await prisma_1.default.alertLog.create({
            data: {
                rule_id: ruleId,
                triggered_price: triggeredPrice,
                timestamp: new Date(triggeredAt),
            },
        });
        console.log(`[AlertProcessor] AlertLog created for rule ${ruleId} (recovery path)`);
    }
    // Push real-time notification to connected SSE clients for this user
    (0, sseManager_1.sendToUser)(userId, 'alert', {
        ruleId,
        assetSymbol,
        condition,
        targetPrice,
        triggeredPrice,
        triggeredAt,
    });
    console.log(`[AlertProcessor] Alert processed — user ${userId}, ` +
        `${assetSymbol} ${condition} ${targetPrice}, triggered at ${triggeredPrice}`);
}
function startAlertProcessor() {
    const worker = new bullmq_1.Worker(alertQueue_1.ALERT_QUEUE_NAME, processAlertJob, {
        connection: redis_1.redis,
        concurrency: 5,
    });
    worker.on('completed', (job) => {
        console.log(`[AlertProcessor] Job ${job.id} done`);
    });
    worker.on('failed', (job, err) => {
        const attempt = job?.attemptsMade ?? '?';
        const max = job?.opts?.attempts ?? '?';
        console.error(`[AlertProcessor] Job ${job?.id} failed (attempt ${attempt}/${max}): ${err.message}`);
    });
    worker.on('error', (err) => {
        console.error('[AlertProcessor] Worker error:', err.message);
    });
    console.log('[AlertProcessor] Worker started');
    return worker;
}
//# sourceMappingURL=alertProcessor.js.map