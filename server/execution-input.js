const { z } = require('zod')
const boundedText = (max) =>
  z
    .string()
    .max(max)
    .refine((value) => Buffer.byteLength(value, 'utf8') <= max, 'Input exceeds byte limit')
const language = z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust'])
const testCase = z.object({ input: boundedText(16000), expectedOutput: boundedText(16000) })
const executionInput = z.object({
  code: boundedText(100000).refine((value) => value.length > 0, 'Source is required'),
  language,
  testCases: z.array(testCase).max(20).default([]),
})
module.exports = { boundedText, language, testCase, executionInput }
