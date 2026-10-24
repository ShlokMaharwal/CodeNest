import { beforeEach, expect, it, vi } from 'vitest'
const m = vi.hoisted(() => ({ eval: vi.fn(), connect: vi.fn(), user: vi.fn(), compare: vi.fn() }))
vi.mock('@/lib/redis', () => ({ redis: { eval: m.eval } }))
vi.mock('@/lib/mongodb', () => ({ connectDB: m.connect }))
vi.mock('@/lib/models/User', () => ({ UserModel: { findOne: m.user } }))
vi.mock('bcryptjs', () => ({ default: { compare: m.compare } }))
import { authOptions } from '@/lib/auth'
const authorize = (authOptions.providers[0] as any).options.authorize
beforeEach(() => {
  vi.resetAllMocks()
  m.eval.mockResolvedValue([1, 900])
  m.compare.mockResolvedValue(true)
  m.user.mockResolvedValue({
    _id: 'id',
    email: 'user@example.com',
    name: 'User',
    password: 'hash',
    color: '#fff',
  })
})
it('normalizes login identity and verifies a hashed password', async () => {
  expect(await authorize({ email: 'USER@EXAMPLE.COM', password: 'password' })).toMatchObject({
    id: 'id',
    email: 'user@example.com',
  })
  expect(m.user).toHaveBeenCalledWith({ email: 'user@example.com' })
  expect(m.compare).toHaveBeenCalledWith('password', 'hash')
})
it('rejects invalid, missing, throttled and incorrect credentials', async () => {
  expect(await authorize({ email: 'invalid', password: 'x' })).toBeNull()
  expect(await authorize(undefined)).toBeNull()
  m.eval.mockResolvedValueOnce([11, 900])
  expect(await authorize({ email: 'user@example.com', password: 'x' })).toBeNull()
  m.compare.mockResolvedValue(false)
  expect(await authorize({ email: 'user@example.com', password: 'x' })).toBeNull()
  m.user.mockResolvedValue(null)
  expect(await authorize({ email: 'user@example.com', password: 'x' })).toBeNull()
})
it('keeps the existing session identity fields', async () => {
  const token = await authOptions.callbacks!.jwt!({
    token: { sub: 'id' },
    user: { id: 'id', color: '#fff' },
  } as any)
  const session = await authOptions.callbacks!.session!({ session: { user: {} }, token } as any)
  expect(session.user).toMatchObject({ id: 'id', color: '#fff' })
})
