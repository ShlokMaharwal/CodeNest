import { afterEach, expect, it, vi } from 'vitest'
import { executeCode } from '@/lib/wandbox'
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status })
it('returns the existing result shape and matches expected output', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(response({ status: '0', program_output: '42\n' })),
  )
  expect(
    await executeCode('print(42)', 'python', [{ input: 'x', expectedOutput: '42' }]),
  ).toMatchObject({ status: 'All Tests Passed', testCases: [{ passed: true, actualOutput: '42' }] })
})
it('does not mark runtime errors with matching output as passing', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(response({ status: '1', program_output: '42', program_error: 'crashed' })),
  )
  expect(await executeCode('x', 'python', [{ input: '', expectedOutput: '42' }])).toMatchObject({
    testCases: [{ passed: false }],
  })
})
it('retries transient server errors with backoff', async () => {
  vi.useFakeTimers()
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response({}, 503))
    .mockResolvedValueOnce(response({ status: '0', program_output: 'ok' }))
  vi.stubGlobal('fetch', fetch)
  const result = executeCode('x', 'javascript')
  await vi.runAllTimersAsync()
  expect(await result).toMatchObject({ status: 'Accepted' })
  expect(fetch).toHaveBeenCalledTimes(2)
})
it('reports upstream rate limits without retrying', async () => {
  const fetch = vi.fn().mockResolvedValue(response({}, 429))
  vi.stubGlobal('fetch', fetch)
  expect(await executeCode('x', 'javascript')).toMatchObject({
    status: 'Error',
    errorCode: 'RATE_LIMITED',
  })
  expect(fetch).toHaveBeenCalledTimes(1)
})
it('rejects malformed responses and oversized input', async () => {
  const fetch = vi.fn().mockResolvedValue(response({ surprise: true }))
  vi.stubGlobal('fetch', fetch)
  expect(await executeCode('x', 'javascript')).toMatchObject({ errorCode: 'UPSTREAM_RESPONSE' })
  expect(await executeCode('x'.repeat(100001), 'javascript')).toMatchObject({
    errorCode: 'INVALID_INPUT',
  })
  expect(fetch).toHaveBeenCalledTimes(1)
})
it('aborts timed out requests within the shared deadline', async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          )
        }),
    ),
  )
  const result = executeCode('x', 'javascript')
  await vi.runAllTimersAsync()
  expect(await result).toMatchObject({ errorCode: 'TIMEOUT', status: 'Error' })
})
