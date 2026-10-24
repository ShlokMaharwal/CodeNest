const { integrityEventSchema } = require('./integrity')
const { z } = require('zod')
const { boundedText, language, testCase } = require('./execution-input')
const base = z.object({ roomId: z.string().regex(/^[a-z0-9]{8}$/) })
const schemas = {
  'integrity-event': base.extend({ event: integrityEventSchema }),
  'output-update': base.extend({
    output: z.object({
      stdout: boundedText(256000).nullable(),
      stderr: boundedText(256000).nullable(),
      status: z.string().max(100),
      time: z.string().max(100),
      memory: z.number().finite().min(0).max(1000000000),
      errorCode: z.string().max(100).optional(),
      testCases: z
        .array(
          testCase.extend({
            actualOutput: boundedText(256000).optional(),
            passed: z.boolean().optional(),
            isCustomInput: z.boolean().optional(),
            stderr: boundedText(256000).optional(),
          }),
        )
        .max(20)
        .optional(),
    }),
  }),
  'join-room': base.extend({ inviteToken: z.string().max(4096).nullable().optional() }),
  'code-change': base.extend({ code: boundedText(100000) }),
  'language-change': base.extend({ language }),
  'test-cases-change': base.extend({ testCases: z.array(testCase).max(20) }),
  'notes-change': base.extend({ notes: boundedText(20000) }),
  'problem-change': base.extend({ problemId: z.string().regex(/^[a-f0-9]{24}$/i) }),
  'timer-start': base.extend({ durationMinutes: z.number().int().min(1).max(240) }),
  'cursor-move': base.extend({
    position: z.object({
      lineNumber: z.number().int().min(1).max(100000),
      column: z.number().int().min(1).max(100000),
    }),
  }),
}
function validateSocketInput(event, input) {
  return (schemas[event] || base).safeParse(input)
}
module.exports = { validateSocketInput }
