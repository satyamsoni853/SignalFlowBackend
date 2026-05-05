"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrices = generatePrices;
// Seed prices — realistic starting points
const ASSETS = [
    { symbol: 'BTC', basePrice: 65000, volatility: 0.005 },
    { symbol: 'ETH', basePrice: 3200, volatility: 0.006 },
    { symbol: 'NIFTY50', basePrice: 22500, volatility: 0.003 },
];
// Track last price per symbol for realistic random walk
const lastPrices = new Map(ASSETS.map((a) => [a.symbol, a.basePrice]));
function nextPrice(asset) {
    const last = lastPrices.get(asset.symbol);
    const swing = (Math.random() * 2 - 1) * asset.volatility; // -vol% to +vol%
    const next = parseFloat((last * (1 + swing)).toFixed(2));
    lastPrices.set(asset.symbol, next);
    return next;
}
function generatePrices() {
    const timestamp = new Date().toISOString();
    return ASSETS.map((asset) => ({
        symbol: asset.symbol,
        price: nextPrice(asset),
        timestamp,
    }));
}
//# sourceMappingURL=priceSimulator.js.map