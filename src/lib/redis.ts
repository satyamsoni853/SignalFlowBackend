import IORedis from 'ioredis';

const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false, // Fail fast if disconnected
  commandTimeout: 5000,
};

export const redis = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, redisOptions)
  : new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ...redisOptions
    });

redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));

export default redis;
