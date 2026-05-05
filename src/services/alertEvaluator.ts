import { Condition } from '../generated/prisma';

/**
 * Returns true if the current price satisfies the alert rule condition.
 */
export function isTriggered(
  condition: Condition,
  currentPrice: number,
  targetPrice: number
): boolean {
  if (condition === Condition.GREATER_THAN) return currentPrice > targetPrice;
  if (condition === Condition.LESS_THAN)    return currentPrice < targetPrice;
  return false;
}
