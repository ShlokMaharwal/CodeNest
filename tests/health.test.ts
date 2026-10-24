import { beforeEach, expect, it, vi } from 'vitest'
const m = vi.hoisted(() => ({ connect: vi.fn(), ping: vi.fn(), mongoPing: vi.fn() }))
vi.mock('@/lib/mongodb', () => ({ connectDB: m.connect }))
vi.mock('@/lib/redis', () => ({ redis: { ping: m.ping } }))
import { GET } from '@/app/api/health/route'
beforeEach(() => {
  vi.resetAllMocks()
  m.connect.mockResolvedValue({ connection: { db: { admin: () => ({ ping: m.mongoPing }) } } })
  m.ping.mockResolvedValue('PONG')
})
it('checks both backing services and reports uptime', async () => {
  const response = await GET()
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({
    status: 'ok',
    mongo: true,
    redis: true,
    uptime: expect.any(Number),
  })
  expect(m.mongoPing).toHaveBeenCalled()
  expect(response.headers.get('cache-control')).toBe('no-store')
})
it.each(['mongo', 'redis'])('returns degraded health when %s is unavailable', async (service) => {
  if (service === 'mongo') m.connect.mockRejectedValue(new Error('private credentials'))
  else m.ping.mockRejectedValue(new Error('private credentials'))
  const response = await GET()
  expect(response.status).toBe(503)
  expect(JSON.stringify(await response.json())).not.toContain('credentials')
})
