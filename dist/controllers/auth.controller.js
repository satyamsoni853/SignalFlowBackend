"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const jwt_1 = require("../lib/jwt");
const SALT_ROUNDS = 12;
async function register(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'password must be at least 8 characters' });
        return;
    }
    try {
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const password_hash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        const user = await prisma_1.default.user.create({
            data: { email, password_hash },
            select: { id: true, email: true, createdAt: true },
        });
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        res.status(201).json({ user, token });
    }
    catch {
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        // Constant-time comparison to prevent user enumeration
        const dummyHash = '$2a$12$invalidhashfortimingprotection000000000000000000000000';
        const hash = user?.password_hash ?? dummyHash;
        const valid = await bcryptjs_1.default.compare(password, hash);
        if (!user || !valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        res.json({ token, user: { id: user.id, email: user.email } });
    }
    catch {
        res.status(500).json({ error: 'Login failed' });
    }
}
async function me(req, res) {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}
//# sourceMappingURL=auth.controller.js.map