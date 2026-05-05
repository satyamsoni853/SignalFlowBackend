"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.authRouter = (0, express_1.Router)();
// POST /api/auth/register
exports.authRouter.post('/register', auth_controller_1.register);
// POST /api/auth/login
exports.authRouter.post('/login', auth_controller_1.login);
// GET /api/auth/me  (protected)
exports.authRouter.get('/me', authenticate_1.authenticate, auth_controller_1.me);
//# sourceMappingURL=auth.js.map