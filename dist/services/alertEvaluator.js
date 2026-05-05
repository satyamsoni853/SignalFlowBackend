"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTriggered = isTriggered;
const prisma_1 = require("../generated/prisma");
/**
 * Returns true if the current price satisfies the alert rule condition.
 */
function isTriggered(condition, currentPrice, targetPrice) {
    if (condition === prisma_1.Condition.GREATER_THAN)
        return currentPrice > targetPrice;
    if (condition === prisma_1.Condition.LESS_THAN)
        return currentPrice < targetPrice;
    return false;
}
//# sourceMappingURL=alertEvaluator.js.map