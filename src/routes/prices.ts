import { Router, Request, Response } from 'express';
import { getAllPrices, getPrice } from '../services/priceFeed.service';

export const pricesRouter = Router();

// Helper to timeout promises
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
};

// GET /api/prices — all latest prices
pricesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const prices = await withTimeout(getAllPrices(), 2000, {});
    res.json(prices);
  } catch (err) {
    res.json({});
  }
});

// GET /api/prices/:symbol — single asset
pricesRouter.get('/:symbol', async (req: Request, res: Response) => {
  try {
    const snap = await withTimeout(getPrice(req.params.symbol as string), 2000, null);
    if (!snap) {
      res.status(404).json({ error: 'Symbol not found or feed not started' });
      return;
    }
    res.json(snap);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});
