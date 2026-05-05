import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { redis } from '../lib/redis';

export const ALERT_QUEUE_NAME = 'alert-triggered';

export interface AlertJobData {
  ruleId:         string;
  userId:         string;
  assetSymbol:    string;
  condition:      string;
  targetPrice:    number;
  triggeredPrice: number;
  triggeredAt:    string;
}

// Dedicated queue for alert jobs
export const alertQueue = new Queue<AlertJobData>(ALERT_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 }, // keep last 100 completed
    removeOnFail:     { count: 200 }, // keep last 200 failed for inspection
  },
});

export const alertQueueEvents = new QueueEvents(ALERT_QUEUE_NAME, { connection: redis });

alertQueueEvents.on('completed', ({ jobId }) => {
  console.log(`[AlertQueue] Job ${jobId} completed`);
});

alertQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[AlertQueue] Job ${jobId} failed: ${failedReason}`);
});
