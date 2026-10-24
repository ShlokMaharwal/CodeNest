import { expect, it } from 'vitest'
import { registerSchema, roomCreateSchema, problemsQuerySchema, escapeRegex } from '@/lib/schemas'
import { validateSocketInput } from '../server/socket-schemas'
import { isAllowedOrigin } from '../server/origins'
it('normalizes credentials and bounds room settings', () => {
  expect(
    registerSchema.parse({ name: ' Name ', email: 'A@EXAMPLE.COM', password: 'password123' }).email,
  ).toBe('a@example.com')
  expect(roomCreateSchema.safeParse({ maxHints: -1 }).success).toBe(false)
  expect(roomCreateSchema.safeParse({ durationMinutes: 9999 }).success).toBe(false)
  expect(problemsQuerySchema.safeParse({ page: '-2' }).success).toBe(false)
})
it('treats search strings literally and rejects malformed socket input', () => {
  expect(new RegExp(escapeRegex('a.*')).test('abcd')).toBe(false)
  expect(new RegExp(escapeRegex('a.*')).test('a.*')).toBe(true)
  expect(
    validateSocketInput('timer-start', { roomId: 'abcd1234', durationMinutes: -1 }).success,
  ).toBe(false)
})
it('allows exact configured socket origins', () => {
  const env = {
    NEXTAUTH_URL: 'https://codenest.example',
    SOCKET_ALLOWED_ORIGINS: 'https://codenest.example,https://preview.example',
  }
  expect(isAllowedOrigin('https://preview.example', env)).toBe(true)
  expect(isAllowedOrigin('https://codenest.example.evil.test', env)).toBe(false)
  expect(isAllowedOrigin(undefined, env)).toBe(false)
})
