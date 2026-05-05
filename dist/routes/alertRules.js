"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertRulesRouter = void 0;
const express_1 = require("express");
const alertRules_controller_1 = require("../controllers/alertRules.controller");
exports.alertRulesRouter = (0, express_1.Router)();
exports.alertRulesRouter.get('/', alertRules_controller_1.getRules);
exports.alertRulesRouter.post('/', alertRules_controller_1.createRule);
exports.alertRulesRouter.put('/:id', alertRules_controller_1.updateRule);
exports.alertRulesRouter.delete('/:id', alertRules_controller_1.deleteRule);
//# sourceMappingURL=alertRules.js.map