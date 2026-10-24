import { z } from 'zod'
import { ExecutionResult, TestCase } from '@/types'
import { executionInput } from '../../server/execution-input'

const WANDBOX_URL = 'https://wandbox.org/api/compile.json'
const COMPILERS: Record<string, string> = {
  javascript: 'nodejs-20.17.0',
  typescript: 'typescript-5.6.2',
  python: 'cpython-3.12.7',
  java: 'openjdk-jdk-22+36',
  cpp: 'gcc-13.2.0',
  c: 'gcc-13.2.0-c',
  go: 'go-1.23.2',
  rust: 'rust-1.82.0',
}
const responseSchema = z
  .object({
    status: z.union([z.string(), z.number()]).optional(),
    program_output: z.string().max(256000).optional(),
    program_error: z.string().max(256000).optional(),
    compiler_error: z.string().max(256000).optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.compiler_error !== undefined,
    'Missing execution status',
  )
export class ExecutionError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable = false,
  ) {
    super(message)
  }
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function runCode(code: string, language: string, stdin: string, deadline: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const remaining = deadline - Date.now()
    if (remaining <= 0)
      throw new ExecutionError('TIMEOUT', 'Execution timed out. Try simplifying your code.')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), Math.min(10000, remaining))
    let failure: ExecutionError
    try {
      const response = await fetch(WANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, compiler: COMPILERS[language], stdin }),
        signal: controller.signal,
      })
      if (response.status === 429)
        throw new ExecutionError('RATE_LIMITED', 'Too many requests. Wait a moment and try again.')
      if (!response.ok)
        throw new ExecutionError(
          'UPSTREAM_UNAVAILABLE',
          'Execution server is temporarily unavailable.',
          response.status >= 500,
        )
      const reader = response.body?.getReader()
      if (!reader)
        throw new ExecutionError(
          'UPSTREAM_RESPONSE',
          'Execution server returned an invalid response.',
        )
      const chunks: Uint8Array[] = []
      let size = 0
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          size += value.byteLength
          if (size > 1000000) {
            await reader.cancel()
            throw new ExecutionError('OUTPUT_LIMIT', 'Execution output exceeded the size limit.')
          }
          chunks.push(value)
        }
      } finally {
        reader.releaseLock()
      }
      const parsed = responseSchema.safeParse(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      if (!parsed.success)
        throw new ExecutionError(
          'UPSTREAM_RESPONSE',
          'Execution server returned an invalid response.',
        )
      const data = parsed.data
      return {
        stdout: data.program_output || '',
        stderr: data.compiler_error || data.program_error || '',
        code: String(data.status) === '0' && !data.compiler_error ? 0 : 1,
      }
    } catch (error) {
      failure =
        error instanceof ExecutionError
          ? error
          : error instanceof Error && error.name === 'AbortError'
            ? new ExecutionError('TIMEOUT', 'Execution timed out. Try simplifying your code.', true)
            : error instanceof SyntaxError
              ? new ExecutionError(
                  'UPSTREAM_RESPONSE',
                  'Execution server returned an invalid response.',
                )
              : new ExecutionError(
                  'UPSTREAM_UNAVAILABLE',
                  'Could not reach execution server. Try again later.',
                  true,
                )
    } finally {
      clearTimeout(timer)
    }
    if (!failure.retryable || attempt === 2 || Date.now() >= deadline) throw failure
    await delay(Math.min(250 * 2 ** attempt, Math.max(0, deadline - Date.now())))
  }
  throw new ExecutionError('UPSTREAM_UNAVAILABLE', 'Execution unavailable')
}

export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[] = [],
  grade = false,
): Promise<ExecutionResult> {
  const started = performance.now()
  try {
    const parsed = executionInput.safeParse({ code, language, testCases })
    if (!parsed.success)
      throw new ExecutionError('INVALID_INPUT', 'Invalid execution input or size limit exceeded')
    const deadline = Date.now() + 20000
    const hasCases = grade || testCases.some((test) => test.input || test.expectedOutput)
    if (!hasCases) {
      const result = await runCode(code, language, '', deadline)
      return {
        stdout: result.stdout || '(no output)',
        stderr: result.stderr || null,
        status: result.code === 0 ? 'Accepted' : 'Runtime Error',
        time: (performance.now() - started).toFixed(0) + ' ms',
        memory: 0,
      }
    }
    const results: TestCase[] = []
    // Bounded concurrency and a shared deadline cap provider load and total latency.
    for (let offset = 0; offset < testCases.length; offset += 2) {
      results.push(
        ...(await Promise.all(
          testCases.slice(offset, offset + 2).map(async (test) => {
            const result = await runCode(code, language, test.input, deadline)
            const actualOutput = result.stdout.trim()
            const isCustomInput = !grade && !test.expectedOutput.trim()
            return {
              ...test,
              actualOutput,
              isCustomInput,
              passed:
                result.code === 0 && (isCustomInput || actualOutput === test.expectedOutput.trim()),
              stderr: result.stderr,
            }
          }),
        )),
      )
    }
    const graded = results.filter((test) => !test.isCustomInput)
    const passed = graded.filter((test) => test.passed).length
    return {
      stdout: results
        .map((test, index) =>
          test.isCustomInput
            ? 'Case ' +
              (index + 1) +
              ' (Custom Input):\n  Output: ' +
              (test.actualOutput || '(no output)')
            : test.passed
              ? 'Test ' + (index + 1) + ': ✅ Passed'
              : 'Test ' +
                (index + 1) +
                ': ❌ Failed\n  Expected: ' +
                test.expectedOutput +
                '\n  Got:      ' +
                test.actualOutput,
        )
        .join('\n\n'),
      stderr: results.find((test) => test.stderr)?.stderr || null,
      status: graded.length
        ? passed === graded.length
          ? 'All Tests Passed'
          : passed + '/' + graded.length + ' Tests Passed'
        : 'Execution Completed',
      time: (performance.now() - started).toFixed(0) + ' ms',
      memory: 0,
      testCases: results,
    }
  } catch (error) {
    return {
      stdout: null,
      stderr: error instanceof Error ? error.message : 'Execution failed',
      status: 'Error',
      time: (performance.now() - started).toFixed(0) + ' ms',
      memory: 0,
      errorCode: error instanceof ExecutionError ? error.code : 'EXECUTION_FAILED',
    }
  }
}
