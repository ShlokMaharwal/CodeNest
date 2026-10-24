import { expect, it, vi } from 'vitest'
vi.mock('@/lib/wandbox', () => ({ executeCode: vi.fn() }))
import { executeCode } from '@/lib/wandbox'
import { gradeSolution } from '@/lib/grading'
import { problems } from '../scripts/problem-data'
it('ships at least twenty problems with valid input/output cases', () => {
  const supported = problems.filter((problem) => problem.testCases.length > 0)
  expect(supported.length).toBeGreaterThanOrEqual(20)
  for (const problem of supported) {
    expect(problem.testCases.length).toBeGreaterThan(0)
    for (const test of problem.testCases) {
      expect(typeof test.input).toBe('string')
      expect(typeof test.expectedOutput).toBe('string')
      expect(typeof test.isHidden).toBe('boolean')
    }
  }
})
it('grades all cases while withholding hidden inputs and outputs', async () => {
  vi.mocked(executeCode).mockResolvedValue({
    stdout: '',
    stderr: null,
    status: 'All Tests Passed',
    time: '',
    memory: 0,
    testCases: [
      { input: '1', expectedOutput: '2', actualOutput: '2', passed: true },
      { input: 'secret', expectedOutput: 'private', actualOutput: 'private', passed: true },
    ],
  })
  const result = await gradeSolution('code', 'python', [
    { input: '1', expectedOutput: '2', isHidden: false },
    { input: 'secret', expectedOutput: 'private', isHidden: true },
  ])
  expect(result).toMatchObject({
    passed: 2,
    total: 2,
    results: [{ passed: true }, { hidden: true, passed: true }],
  })
  expect(JSON.stringify(result)).not.toContain('secret')
  expect(JSON.stringify(result)).not.toContain('private')
})
it('does not grade upstream failures as wrong answers', async () => {
  vi.mocked(executeCode).mockResolvedValue({
    stdout: null,
    stderr: 'offline',
    status: 'Error',
    errorCode: 'UPSTREAM_UNAVAILABLE',
    time: '',
    memory: 0,
  })
  await expect(
    gradeSolution('code', 'python', [{ input: '1', expectedOutput: '2', isHidden: true }]),
  ).rejects.toThrow('unavailable')
})

it('rejects oversized problem configurations instead of reporting a partial grade', async () => {
  vi.mocked(executeCode).mockClear()
  await expect(
    gradeSolution(
      'code',
      'python',
      Array(21).fill({ input: '1', expectedOutput: '2', isHidden: false }),
    ),
  ).rejects.toThrow('20 case')
  expect(executeCode).not.toHaveBeenCalled()
})
