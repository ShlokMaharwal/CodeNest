import { integrityBatchSchema } from '../../server/integrity'
import { z } from 'zod'
import { boundedText, language, executionInput } from '../../server/execution-input'

export { executionInput }
export const roomIdSchema = z.string().regex(/^[a-z0-9]{8}$/)
export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i)
export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z
    .string()
    .min(1)
    .max(72)
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password exceeds byte limit'),
})
export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(1).max(100),
  password: z
    .string()
    .min(8)
    .max(72)
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password exceeds byte limit'),
})
const optionalText = (max: number) => z.string().max(max).optional()
const roomFields = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  problemId: objectIdSchema.or(z.literal('')).optional(),
  hintsEnabled: z.boolean().optional(),
  maxHints: z.number().int().min(0).max(20).optional(),
  durationMinutes: z.number().int().min(1).max(240).optional(),
  language: language.optional(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.literal('')).nullable().optional(),
  candidateName: optionalText(100),
  candidateEmail: z.string().trim().toLowerCase().email().or(z.literal('')).optional(),
  candidatePhone: optionalText(40),
  candidatePosition: optionalText(200),
  candidateLinkedin: z.string().url().or(z.literal('')).optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'staff', 'principal']).optional(),
  description: optionalText(10000),
})
export const roomCreateSchema = roomFields
export const roomPatchSchema = roomFields
  .omit({ language: true, problemId: true })
  .extend({ integrityEvents: integrityBatchSchema.optional() })
  .strict()
export const problemsQuerySchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  tag: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
})
export const roomQuerySchema = z
  .object({ snapshots: z.enum(['true', 'false']).optional() })
  .strict()
export const hintSchema = z.object({ roomId: roomIdSchema })
export const reviewInputSchema = z.object({
  roomId: roomIdSchema,
  problemTitle: z.string().max(300).default('Coding Problem'),
  problemDescription: z.string().max(20000).default(''),
  code: boundedText(100000).default(''),
  language: language.default('javascript'),
  testResults: z
    .array(
      z.object({
        input: boundedText(16000),
        expected: boundedText(16000),
        actual: boundedText(16000),
        passed: z.boolean(),
      }),
    )
    .max(20)
    .default([]),
})
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
