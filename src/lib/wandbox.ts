import { ExecutionResult, TestCase } from '@/types'

const WANDBOX_URL = 'https://wandbox.org/api/compile.json'

const WANDBOX_COMPILER: Record<string, string> = {
  javascript: 'nodejs-20.17.0',
  typescript: 'typescript-5.6.2',
  python:     'cpython-3.12.7',
  java:       'openjdk-jdk-22+36',
  cpp:        'gcc-13.2.0',
  c:          'gcc-13.2.0-c',
  go:         'go-1.23.2',
  rust:       'rust-1.82.0',
}

async function runCode(
  code: string,
  language: string,
  stdin: string = ''
): Promise<{ stdout: string; stderr: string; code: number }> {
  const compiler = WANDBOX_COMPILER[language] || WANDBOX_COMPILER['javascript']

  const response = await fetch(WANDBOX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      compiler,
      stdin,
    }),
  })

  if (!response.ok) throw new Error(`Execution API error: ${response.status}`)

  const data = await response.json()

  const stdout = data.program_output || ''
  const stderr = data.compiler_error || data.program_error || ''
  const exitCode = data.status === '0' ? 0 : 1

  return { stdout, stderr, code: exitCode }
}

export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[] = []
): Promise<ExecutionResult> {
  try {
    const hasTestCases = testCases.length > 0 && testCases.some((tc) => tc.input || tc.expectedOutput)

    if (!hasTestCases) {
      const result = await runCode(code, language)
      return {
        stdout: result.stdout || '(no output)',
        stderr: result.stderr || null,
        status: result.code === 0 ? 'Accepted' : 'Runtime Error',
        time: '—',
        memory: 0,
      }
    }

    const results = await Promise.all(
      testCases.map(async (tc) => {
        const result = await runCode(code, language, tc.input)
        const actual = result.stdout.trim()
        
        if (!tc.expectedOutput || tc.expectedOutput.trim() === '') {
          return { ...tc, actualOutput: actual, passed: true, isCustomInput: true, stderr: result.stderr }
        }

        const expected = tc.expectedOutput.trim()
        return { ...tc, actualOutput: actual, passed: actual === expected, isCustomInput: false, stderr: result.stderr }
      })
    )

    const passedCount = results.filter((r) => r.passed && !r.isCustomInput).length
    const totalWithExpectation = results.filter((r) => !r.isCustomInput).length
    const allPassed = totalWithExpectation > 0 && passedCount === totalWithExpectation

    let status = 'Execution Completed'
    if (totalWithExpectation > 0) {
      status = allPassed ? 'All Tests Passed' : `${passedCount}/${totalWithExpectation} Tests Passed`
    }

    return {
      stdout: results.map((r, i) => {
        if (r.isCustomInput) {
          return `Case ${i + 1} (Custom Input):\n  Output: ${r.actualOutput || '(no output)'}`
        }
        return r.passed
          ? `Test ${i + 1}: ✅ Passed`
          : `Test ${i + 1}: ❌ Failed\n  Expected: ${r.expectedOutput}\n  Got:      ${r.actualOutput}`
      }).join('\n\n'),
      stderr: results.find((r) => r.stderr)?.stderr || null,
      status,
      time: '—',
      memory: 0,
      testCases: results,
    }
  } catch (error: any) {
    return {
      stdout: null,
      stderr: error.message || 'Execution failed',
      status: 'Error',
      time: '—',
      memory: 0,
    }
  }
}