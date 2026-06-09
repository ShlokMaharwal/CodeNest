import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { redis } from '@/lib/redis'

export async function GET() {
  const health = {
    status: 'ok',
    mongo: false,
    redis: false,
    timestamp: new Date().toISOString(),
  }

  try {
    await connectDB()
    health.mongo = true
  } catch {}

  try {
    await redis.ping()
    health.redis = true
  } catch {}

  health.status = health.mongo && health.redis ? 'ok' : 'degraded'

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
  })
}
