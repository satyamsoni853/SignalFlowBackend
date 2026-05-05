export interface AssetConfig {
  symbol: string;
  basePrice: number;
  volatility: number; // max % swing per tick
}

export interface PriceSnapshot {
  symbol: string;
  price: number;
  timestamp: string;
}

// Seed prices — realistic starting points
const ASSETS: AssetConfig[] = [
  { symbol: 'BTC',    basePrice: 65000, volatility: 0.005 },
  { symbol: 'ETH',    basePrice: 3200,  volatility: 0.006 },
  { symbol: 'NIFTY50', basePrice: 22500, volatility: 0.003 },
];

// Track last price per symbol for realistic random walk
const lastPrices = new Map<string, number>(
  ASSETS.map((a) => [a.symbol, a.basePrice])
);

function nextPrice(asset: AssetConfig): number {
  const last = lastPrices.get(asset.symbol)!;
  const swing = (Math.random() * 2 - 1) * asset.volatility; // -vol% to +vol%
  const next = parseFloat((last * (1 + swing)).toFixed(2));
  lastPrices.set(asset.symbol, next);
  return next;
}

export function generatePrices(): PriceSnapshot[] {
  const timestamp = new Date().toISOString();
  return ASSETS.map((asset) => ({
    symbol: asset.symbol,
    price: nextPrice(asset),
    timestamp,
  }));
}
