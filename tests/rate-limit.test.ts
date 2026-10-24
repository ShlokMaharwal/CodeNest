import { expect, it, vi } from 'vitest'
import { consumeRateLimit } from '../server/rate-limit'
import { executionInput } from '../server/execution-input'
it('allows the limit, denies the next request and supplies a retry time', async () => {
  let count = 0
  const redis = { eval: vi.fn(async () => [++count, 60]) }
  expect(await consumeRateLimit(redis, 'user:a', 2, 60)).toMatchObject({
    allowed: true,
    remaining: 1,
  })
  expect(await consumeRateLimit(redis, 'user:a', 2, 60)).toMatchObject({
    allowed: true,
    remaining: 0,
  })
  expect(await consumeRateLimit(redis, 'user:a', 2, 60)).toMatchObject({
    allowed: false,
    retryAfter: 60,
  })
  expect(redis.eval).toHaveBeenCalledWith(
    expect.stringContaining("redis.call('EXPIRE'"),
    1,
    'user:a',
    60,
  )
})
it('fails closed when Redis is unavailable', async () => {
  const redis = { eval: vi.fn().mockRejectedValue(new Error('offline')) }
  await expect(consumeRateLimit(redis, 'user:a', 2, 60)).rejects.toThrow('offline')
})
it('caps source bytes, stdin bytes, case count and languages', () => {
  const valid = { code: 'print(1)', language: 'python' }
  expect(executionInput.safeParse(valid).success).toBe(true)
  for (const body of [
    { ...valid, code: '😀'.repeat(30000) },
    { ...valid, language: 'shell' },
    { ...valid, testCases: [{ input: 'x'.repeat(16001), expectedOutput: '' }] },
    { ...valid, testCases: Array(21).fill({ input: '', expectedOutput: '' }) },
  ])
    expect(executionInput.safeParse(body).success).toBe(false)
})
