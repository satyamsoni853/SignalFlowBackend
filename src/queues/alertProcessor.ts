import { Job, Worker } from 'bullmq';
import { redis } from '../lib/redis';
import prisma from '../lib/prisma';
import { ALERT_QUEUE_NAME, AlertJobData } from './alertQueue';
import { sendToUser } from '../lib/sseManager';

async function processAlertJob(job: Job<AlertJobData>): Promise<void> {
  const {
    ruleId,
    userId,
    assetSymbol,
    condition,
    targetPrice,
    triggeredPrice,
    triggeredAt,
  } = job.data;

  console.log(
    `[AlertProcessor] Processing job ${job.id} — ` +
    `${assetSymbol} ${condition} ${targetPrice} (hit ${triggeredPrice})`
  );

  // Verify the rule still exists (may have been deleted between enqueue and process)
  const rule = await prisma.alertRule.findUnique({ where: { id: ruleId } });
  if (!rule) {
    console.warn(`[AlertProcessor] Rule ${ruleId} no longer exists — skipping`);
    return;
  }

  // Ensure the AlertLog exists (written by alertWorker in transaction).
  // If for any reason it's missing (e.g. partial failure), create it here.
  const existingLog = await prisma.alertLog.findFirst({
    where: {
      rule_id: ruleId,
      timestamp: { gte: new Date(new Date(triggeredAt).getTime() - 10_000) },
    },
  });

  if (!existingLog) {
    await prisma.alertLog.create({
      data: {
        rule_id:         ruleId,
        triggered_price: triggeredPrice,
        timestamp:       new Date(triggeredAt),
      },
    });
    console.log(`[AlertProcessor] AlertLog created for rule ${ruleId} (recovery path)`);
  }

  // Push real-time notification to connected SSE clients for this user
  sendToUser(userId, 'alert', {
    ruleId,
    assetSymbol,
    condition,
    targetPrice,
    triggeredPrice,
    triggeredAt,
  });

  console.log(
    `[AlertProcessor] Alert processed — user ${userId}, ` +
    `${assetSymbol} ${condition} ${targetPrice}, triggered at ${triggeredPrice}`
  );
}

export function startAlertProcessor(): Worker<AlertJobData> {
  const worker = new Worker<AlertJobData>(
    ALERT_QUEUE_NAME,
    processAlertJob,
    {
      connection: redis,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[AlertProcessor] Job ${job.id} done`);
  });

  worker.on('failed', (job, err) => {
    const attempt = job?.attemptsMade ?? '?';
    const max     = job?.opts?.attempts ?? '?';
    console.error(
      `[AlertProcessor] Job ${job?.id} failed (attempt ${attempt}/${max}): ${err.message}`
    );
  });

  worker.on('error', (err) => {
    console.error('[AlertProcessor] Worker error:', err.message);
  });

  console.log('[AlertProcessor] Worker started');
  return worker;
}
