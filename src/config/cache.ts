import Redis from 'ioredis';
import { env } from './env';

const redis = new Redis({
  port: env.REDIS_PORT,
  host: env.REDIS_HOST,
  db: env.REDIS_DB,
});

export async function testCacheConnection() {
  try {
    const reply = await redis.ping();
    return reply === 'PONG';
  } catch (e) {
    console.error(e)
    return false;
  }
}

export async function closeCacheConnection() {
  await redis.quit();
}

export const cache = () => redis;
