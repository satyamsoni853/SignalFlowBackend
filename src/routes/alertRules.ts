import { Router } from 'express';
import { getRules, createRule, updateRule, deleteRule } from '../controllers/alertRules.controller';

export const alertRulesRouter = Router();

alertRulesRouter.get('/', getRules);
alertRulesRouter.post('/', createRule);
alertRulesRouter.put('/:id', updateRule);
alertRulesRouter.delete('/:id', deleteRule);
