"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPriceFeed = startPriceFeed;
exports.stopPriceFeed = stopPriceFeed;
exports.getPrice = getPrice;
exports.getAllPrices = getAllPrices;
const redis_1 = __importDefault(require("../lib/redis"));
const priceSimulator_1 = require("./priceSimulator");
const REDIS_KEY_PREFIX = 'price:';
const REDIS_ALL_KEY = 'prices:latest';
const INTERVAL_MS = 5000;
let timer = null;
async function storePrices(snapshots) {
    const pipeline = redis_1.default.pipeline();
    for (const snap of snapshots) {
        // Individual key per symbol: price:BTC → { price, timestamp }
        pipeline.set(`${REDIS_KEY_PREFIX}${snap.symbol}`, JSON.stringify(snap));
    }
    // All prices in one key for easy bulk reads
    const allPrices = Object.fromEntries(snapshots.map((s) => [s.symbol, s]));
    pipeline.set(REDIS_ALL_KEY, JSON.stringify(allPrices));
    await pipeline.exec();
}
async function tick() {
    try {
        const snapshots = (0, priceSimulator_1.generatePrices)();
        await storePrices(snapshots);
        console.log(`[PriceFeed] ${snapshots.map((s) => `${s.symbol}=${s.price}`).join('  ')}`);
    }
    catch (err) {
        console.error('[PriceFeed] Tick error:', err);
    }
}
function startPriceFeed() {
    if (timer)
        return; // already running
    console.log('[PriceFeed] Starting — interval: 5s');
    tick(); // run immediately on start
    timer = setInterval(tick, INTERVAL_MS);
}
function stopPriceFeed() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        console.log('[PriceFeed] Stopped');
    }
}
// Helpers for other parts of the app to read prices
async function getPrice(symbol) {
    const raw = await redis_1.default.get(`${REDIS_KEY_PREFIX}${symbol.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
}
async function getAllPrices() {
    const raw = await redis_1.default.get(REDIS_ALL_KEY);
    return raw ? JSON.parse(raw) : {};
}
//# sourceMappingURL=priceFeed.service.js.map