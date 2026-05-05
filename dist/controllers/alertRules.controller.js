"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = getRules;
exports.createRule = createRule;
exports.updateRule = updateRule;
exports.deleteRule = deleteRule;
const prisma_1 = require("../generated/prisma");
const prisma_2 = __importDefault(require("../lib/prisma"));
const VALID_CONDITIONS = Object.values(prisma_1.Condition);
const VALID_STATUSES = Object.values(prisma_1.AlertStatus);
// GET /api/alert-rules
async function getRules(req, res) {
    try {
        const rules = await prisma_2.default.alertRule.findMany({
            where: { user_id: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(rules);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch alert rules' });
    }
}
// POST /api/alert-rules
async function createRule(req, res) {
    const { asset_symbol, condition, target_price } = req.body;
    if (!asset_symbol || !condition || target_price === undefined) {
        res.status(400).json({ error: 'asset_symbol, condition, and target_price are required' });
        return;
    }
    if (!VALID_CONDITIONS.includes(condition)) {
        res.status(400).json({ error: `condition must be one of: ${VALID_CONDITIONS.join(', ')}` });
        return;
    }
    const price = parseFloat(target_price);
    if (isNaN(price) || price <= 0) {
        res.status(400).json({ error: 'target_price must be a positive number' });
        return;
    }
    try {
        const rule = await prisma_2.default.alertRule.create({
            data: {
                user_id: req.user.userId,
                asset_symbol: asset_symbol.toUpperCase(),
                condition,
                target_price: price,
                status: prisma_1.AlertStatus.active,
            },
        });
        res.status(201).json(rule);
    }
    catch {
        res.status(500).json({ error: 'Failed to create alert rule' });
    }
}
// PUT /api/alert-rules/:id
async function updateRule(req, res) {
    const id = req.params.id;
    const { asset_symbol, condition, target_price, status } = req.body;
    // Validate optional fields if provided
    if (condition !== undefined && !VALID_CONDITIONS.includes(condition)) {
        res.status(400).json({ error: `condition must be one of: ${VALID_CONDITIONS.join(', ')}` });
        return;
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
        return;
    }
    if (target_price !== undefined) {
        const price = parseFloat(target_price);
        if (isNaN(price) || price <= 0) {
            res.status(400).json({ error: 'target_price must be a positive number' });
            return;
        }
    }
    try {
        // Verify ownership before updating
        const existing = await prisma_2.default.alertRule.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Alert rule not found' });
            return;
        }
        if (existing.user_id !== req.user.userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const updated = await prisma_2.default.alertRule.update({
            where: { id },
            data: {
                ...(asset_symbol && { asset_symbol: asset_symbol.toUpperCase() }),
                ...(condition && { condition }),
                ...(target_price !== undefined && { target_price: parseFloat(target_price) }),
                ...(status && { status }),
            },
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ error: 'Failed to update alert rule' });
    }
}
// DELETE /api/alert-rules/:id
async function deleteRule(req, res) {
    const id = req.params.id;
    try {
        // Verify ownership before deleting
        const existing = await prisma_2.default.alertRule.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Alert rule not found' });
            return;
        }
        if (existing.user_id !== req.user.userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await prisma_2.default.alertRule.delete({ where: { id } });
        res.status(204).send();
    }
    catch {
        res.status(500).json({ error: 'Failed to delete alert rule' });
    }
}
//# sourceMappingURL=alertRules.controller.js.map