const { z } = require('zod')

const httpUrl = z
  .string()
  .url()
  .refine((value) => /^https?:/.test(value), 'Use an HTTP or HTTPS URL')
const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
    REDIS_URL: z
      .string()
      .url()
      .regex(/^rediss?:\/\//),
    NEXTAUTH_SECRET: z.string().min(32),
    INVITE_TOKEN_SECRET: z.string().min(32),
    NEXTAUTH_URL: httpUrl,
    NEXT_PUBLIC_APP_URL: httpUrl.optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
  })
  .refine((value) => value.NEXTAUTH_SECRET !== value.INVITE_TOKEN_SECRET, {
    message: 'Use a separate secret for invite tokens',
    path: ['INVITE_TOKEN_SECRET'],
  })

function validateEnv(source) {
  const result = environmentSchema.safeParse(source)
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))]
    throw new Error('Invalid CodeNest environment: ' + fields.join(', ') + '. Check .env.example')
  }
  return result.data
}

module.exports = { validateEnv, environmentSchema }
