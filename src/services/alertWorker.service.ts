import prisma from '../lib/prisma';
import { alertQueue } from '../queues/alertQueue';
import { getAllPrices } from './priceFeed.service';
import { isTriggered } from './alertEvaluator';
import { AlertStatus } from '@prisma/client';

const INTERVAL_MS = 5000;
let timer: ReturnType<typeof setInterval> | null = null;

async function evaluate(): Promise<void> {
  try {
    // 1. Fetch all latest prices from Redis
    const prices = await getAllPrices();
    if (Object.keys(prices).length === 0) {
      console.warn('[AlertWorker] No prices in Redis yet — skipping tick');
      return;
    }

  // 2. Fetch all active rules from DB, grouped by symbol
  const activeRules = await prisma.alertRule.findMany({
    where: { status: AlertStatus.active },
  });

  if (activeRules.length === 0) return;

  // 3. Evaluate each rule
  const triggered = activeRules.filter((rule) => {
    const snap = prices[rule.asset_symbol];
    if (!snap) return false;
    return isTriggered(rule.condition, snap.price, Number(rule.target_price));
  });

  if (triggered.length === 0) return;

  console.log(`[AlertWorker] ${triggered.length} rule(s) triggered`);

  // 4. Process all triggered rules in parallel
  await Promise.all(
    triggered.map(async (rule) => {
      const currentPrice = prices[rule.asset_symbol].price;

      try {
        // Update rule status and create AlertLog in a transaction
        await prisma.$transaction([
          prisma.alertRule.update({
            where: { id: rule.id },
            data: { status: AlertStatus.triggered },
          }),
          prisma.alertLog.create({
            data: {
              rule_id: rule.id,
              triggered_price: currentPrice,
            },
          }),
        ]);

        // Push notification job to BullMQ
        await alertQueue.add(
          'alert-triggered',
          {
            ruleId:       rule.id,
            userId:       rule.user_id,
            assetSymbol:  rule.asset_symbol,
            condition:    rule.condition,
            targetPrice:  Number(rule.target_price),
            triggeredPrice: currentPrice,
            triggeredAt:  new Date().toISOString(),
          }
        );

        console.log(
          `[AlertWorker] Rule ${rule.id} triggered — ` +
          `${rule.asset_symbol} ${rule.condition} ${rule.target_price} ` +
          `(current: ${currentPrice})`
        );
      } catch (err) {
        console.error(`[AlertWorker] Failed to process rule ${rule.id}:`, err);
      }
    })
  );
  } catch (err) {
    console.error('[AlertWorker] Evaluate error (Redis down?):', err);
  }
}

export function startAlertWorker(): void {
  if (timer) return;
  console.log('[AlertWorker] Starting — interval: 5s');
  evaluate(); // run immediately
  timer = setInterval(evaluate, INTERVAL_MS);
}

export function stopAlertWorker(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[AlertWorker] Stopped');
  }
}
