import { Condition } from '../generated/prisma';
/**
 * Returns true if the current price satisfies the alert rule condition.
 */
export declare function isTriggered(condition: Condition, currentPrice: number, targetPrice: number): boolean;
