import { beforeEach, expect, it, vi } from 'vitest'
const m = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  eval: vi.fn(),
  on: vi.fn(),
}))
vi.mock('ioredis', () => ({
  default: class {
    get = m.get
    set = m.set
    setex = m.setex
    eval = m.eval
    on = m.on
  },
}))
import { getJSON, setJSON, incrementWithTTL } from '@/lib/redis'
beforeEach(() => vi.clearAllMocks())
it('serializes values with optional expiry', async () => {
  await setJSON('room', { code: 'x' }, 60)
  expect(m.setex).toHaveBeenCalledWith('room', 60, '{"code":"x"}')
  await setJSON('room', { code: 'x' })
  expect(m.set).toHaveBeenCalledWith('room', '{"code":"x"}')
})
it('returns null for missing or malformed cached JSON', async () => {
  m.get
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce('{broken')
    .mockResolvedValueOnce('{"code":"x"}')
  expect(await getJSON('room')).toBeNull()
  expect(await getJSON('room')).toBeNull()
  expect(await getJSON('room')).toEqual({ code: 'x' })
})
it('uses atomic counters with an expiry window', async () => {
  m.eval.mockResolvedValue([2, 60])
  expect(await incrementWithTTL('rate', 60)).toBe(2)
  expect(m.eval).toHaveBeenCalledWith(expect.any(String), 1, 'rate', 60)
})
