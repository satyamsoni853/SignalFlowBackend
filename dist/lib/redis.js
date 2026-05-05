"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});
exports.redis.on('connect', () => console.log('[Redis] Connected'));
exports.redis.on('error', (err) => console.error('[Redis] Error:', err.message));
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map