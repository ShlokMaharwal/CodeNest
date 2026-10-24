import { executeCode } from './wandbox'
import { ITestCase } from './models/Problem'

export async function gradeSolution(code: string, language: string, cases: ITestCase[]) {
  if (cases.length > 20) throw new Error('Problem exceeds the 20 case execution limit')
  const limited = cases
  const result = await executeCode(code, language, limited, true)
  if (result.errorCode) throw new Error('Execution service unavailable')
  const results = limited.map((test, index) => {
    const actual = result.testCases?.[index]
    const passed = Boolean(
      actual?.passed && actual.actualOutput?.trim() === test.expectedOutput.trim(),
    )
    return {
      index: index + 1,
      passed,
      hidden: test.isHidden,
      ...(!test.isHidden
        ? {
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: actual?.actualOutput || '',
          }
        : {}),
    }
  })
  return { passed: results.filter((test) => test.passed).length, total: results.length, results }
}
