"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricesRouter = void 0;
const express_1 = require("express");
const priceFeed_service_1 = require("../services/priceFeed.service");
exports.pricesRouter = (0, express_1.Router)();
// GET /api/prices — all latest prices
exports.pricesRouter.get('/', async (_req, res) => {
    const prices = await (0, priceFeed_service_1.getAllPrices)();
    res.json(prices);
});
// GET /api/prices/:symbol — single asset
exports.pricesRouter.get('/:symbol', async (req, res) => {
    const snap = await (0, priceFeed_service_1.getPrice)(req.params.symbol);
    if (!snap) {
        res.status(404).json({ error: 'Symbol not found or feed not started' });
        return;
    }
    res.json(snap);
});
//# sourceMappingURL=prices.js.map