import { Redis } from '@upstash/redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('Missing REDIS_URL in environment variables');
}

export const redis = Redis.fromEnv();