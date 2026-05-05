export interface AssetConfig {
    symbol: string;
    basePrice: number;
    volatility: number;
}
export interface PriceSnapshot {
    symbol: string;
    price: number;
    timestamp: string;
}
export declare function generatePrices(): PriceSnapshot[];
