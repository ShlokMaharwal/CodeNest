import { consumeRateLimit } from '../../server/rate-limit'
import { env } from './env'
import Redis from 'ioredis'

const getRedisUrl = () => {
  const url = env.REDIS_URL
  if (!url) {
    throw new Error('REDIS_URL environment variable is not defined')
  }
  return url
}

const globalForRedis = global as unknown as { redis: Redis }

export const redis: Redis =
  globalForRedis.redis ||
  new Redis(getRedisUrl(), {
    lazyConnect: true,
    commandTimeout: 3000,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000)
      return delay
    },
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED']
      if (targetErrors.some((e) => err.message.includes(e))) return true
      return false
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

redis.on('connect', () => console.log('[Redis] Connected'))
redis.on('error', (err) => console.error('[Redis] Error:', err.message))

export async function setJSON(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const json = JSON.stringify(value)
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, json)
  } else {
    await redis.set(key, json)
  }
}

export async function getJSON<T = unknown>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function incrementWithTTL(key: string, ttlSeconds: number): Promise<number> {
  return (await consumeRateLimit(redis, key, Number.MAX_SAFE_INTEGER, ttlSeconds)).count
}
