import { Router, Request, Response } from 'express';
import { getAllPrices, getPrice } from '../services/priceFeed.service';

export const pricesRouter = Router();

// GET /api/prices — all latest prices
pricesRouter.get('/', async (_req: Request, res: Response) => {
  const prices = await getAllPrices();
  res.json(prices);
});

// GET /api/prices/:symbol — single asset
pricesRouter.get('/:symbol', async (req: Request, res: Response) => {
  const snap = await getPrice(req.params.symbol as string);
  if (!snap) {
    res.status(404).json({ error: 'Symbol not found or feed not started' });
    return;
  }
  res.json(snap);
});
