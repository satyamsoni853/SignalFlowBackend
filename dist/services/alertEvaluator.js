"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTriggered = isTriggered;
const client_1 = require("@prisma/client");
/**
 * Returns true if the current price satisfies the alert rule condition.
 */
function isTriggered(condition, currentPrice, targetPrice) {
    if (condition === client_1.Condition.GREATER_THAN)
        return currentPrice > targetPrice;
    if (condition === client_1.Condition.LESS_THAN)
        return currentPrice < targetPrice;
    return false;
}
//# sourceMappingURL=alertEvaluator.js.map