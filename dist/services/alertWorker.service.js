"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAlertWorker = startAlertWorker;
exports.stopAlertWorker = stopAlertWorker;
const prisma_1 = __importDefault(require("../lib/prisma"));
const alertQueue_1 = require("../queues/alertQueue");
const priceFeed_service_1 = require("./priceFeed.service");
const alertEvaluator_1 = require("./alertEvaluator");
const prisma_2 = require("../generated/prisma");
const INTERVAL_MS = 5000;
let timer = null;
async function evaluate() {
    // 1. Fetch all latest prices from Redis
    const prices = await (0, priceFeed_service_1.getAllPrices)();
    if (Object.keys(prices).length === 0) {
        console.warn('[AlertWorker] No prices in Redis yet — skipping tick');
        return;
    }
    // 2. Fetch all active rules from DB, grouped by symbol
    const activeRules = await prisma_1.default.alertRule.findMany({
        where: { status: prisma_2.AlertStatus.active },
    });
    if (activeRules.length === 0)
        return;
    // 3. Evaluate each rule
    const triggered = activeRules.filter((rule) => {
        const snap = prices[rule.asset_symbol];
        if (!snap)
            return false;
        return (0, alertEvaluator_1.isTriggered)(rule.condition, snap.price, Number(rule.target_price));
    });
    if (triggered.length === 0)
        return;
    console.log(`[AlertWorker] ${triggered.length} rule(s) triggered`);
    // 4. Process all triggered rules in parallel
    await Promise.all(triggered.map(async (rule) => {
        const currentPrice = prices[rule.asset_symbol].price;
        try {
            // Update rule status and create AlertLog in a transaction
            await prisma_1.default.$transaction([
                prisma_1.default.alertRule.update({
                    where: { id: rule.id },
                    data: { status: prisma_2.AlertStatus.triggered },
                }),
                prisma_1.default.alertLog.create({
                    data: {
                        rule_id: rule.id,
                        triggered_price: currentPrice,
                    },
                }),
            ]);
            // Push notification job to BullMQ
            await alertQueue_1.alertQueue.add('alert-triggered', {
                ruleId: rule.id,
                userId: rule.user_id,
                assetSymbol: rule.asset_symbol,
                condition: rule.condition,
                targetPrice: Number(rule.target_price),
                triggeredPrice: currentPrice,
                triggeredAt: new Date().toISOString(),
            });
            console.log(`[AlertWorker] Rule ${rule.id} triggered — ` +
                `${rule.asset_symbol} ${rule.condition} ${rule.target_price} ` +
                `(current: ${currentPrice})`);
        }
        catch (err) {
            console.error(`[AlertWorker] Failed to process rule ${rule.id}:`, err);
        }
    }));
}
function startAlertWorker() {
    if (timer)
        return;
    console.log('[AlertWorker] Starting — interval: 5s');
    evaluate(); // run immediately
    timer = setInterval(evaluate, INTERVAL_MS);
}
function stopAlertWorker() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        console.log('[AlertWorker] Stopped');
    }
}
//# sourceMappingURL=alertWorker.service.js.map