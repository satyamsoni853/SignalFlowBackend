import { PriceSnapshot } from './priceSimulator';
export declare function startPriceFeed(): void;
export declare function stopPriceFeed(): void;
export declare function getPrice(symbol: string): Promise<PriceSnapshot | null>;
export declare function getAllPrices(): Promise<Record<string, PriceSnapshot>>;
