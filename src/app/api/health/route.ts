import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'
export async function GET() {
  const checks = await Promise.allSettled([
    connectDB().then(async (mongo) => {
      if (!mongo.connection.db) throw new Error('MongoDB unavailable')
      await mongo.connection.db.admin().ping()
    }),
    redis.ping().then((reply) => {
      if (reply !== 'PONG') throw new Error('Redis unavailable')
    }),
  ])
  const mongo = checks[0].status === 'fulfilled',
    redisHealthy = checks[1].status === 'fulfilled'
  return NextResponse.json(
    {
      status: mongo && redisHealthy ? 'ok' : 'degraded',
      mongo,
      redis: redisHealthy,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      status: mongo && redisHealthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
