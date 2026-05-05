import redis from '../lib/redis';
import { generatePrices, PriceSnapshot } from './priceSimulator';

const REDIS_KEY_PREFIX = 'price:';
const REDIS_ALL_KEY = 'prices:latest';
const INTERVAL_MS = 5000;

let timer: ReturnType<typeof setInterval> | null = null;

async function storePrices(snapshots: PriceSnapshot[]): Promise<void> {
  const pipeline = redis.pipeline();

  for (const snap of snapshots) {
    // Individual key per symbol: price:BTC → { price, timestamp }
    pipeline.set(`${REDIS_KEY_PREFIX}${snap.symbol}`, JSON.stringify(snap));
  }

  // All prices in one key for easy bulk reads
  const allPrices = Object.fromEntries(snapshots.map((s) => [s.symbol, s]));
  pipeline.set(REDIS_ALL_KEY, JSON.stringify(allPrices));

  await pipeline.exec();
}

async function tick(): Promise<void> {
  try {
    const snapshots = generatePrices();
    await storePrices(snapshots);
    console.log(
      `[PriceFeed] ${snapshots.map((s) => `${s.symbol}=${s.price}`).join('  ')}`
    );
  } catch (err) {
    console.error('[PriceFeed] Tick error:', err);
  }
}

export function startPriceFeed(): void {
  if (timer) return; // already running
  console.log('[PriceFeed] Starting — interval: 5s');
  tick(); // run immediately on start
  timer = setInterval(tick, INTERVAL_MS);
}

export function stopPriceFeed(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[PriceFeed] Stopped');
  }
}

// Helpers for other parts of the app to read prices
export async function getPrice(symbol: string): Promise<PriceSnapshot | null> {
  const raw = await redis.get(`${REDIS_KEY_PREFIX}${symbol.toUpperCase()}`);
  return raw ? JSON.parse(raw) : null;
}

export async function getAllPrices(): Promise<Record<string, PriceSnapshot>> {
  const raw = await redis.get(REDIS_ALL_KEY);
  return raw ? JSON.parse(raw) : {};
}
