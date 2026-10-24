import { NextResponse } from 'next/server'
import { redis } from './redis'
import { consumeRateLimit } from '../../server/rate-limit'

export async function limitRequest(key: string, limit: number, seconds: number) {
  const result = await consumeRateLimit(redis, 'ratelimit:' + key, limit, seconds)
  return result.allowed
    ? null
    : NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfter) },
        },
      )
}
