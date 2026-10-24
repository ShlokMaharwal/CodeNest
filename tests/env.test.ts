import { describe, expect, it } from 'vitest'
import { validateEnv } from '@/lib/env-schema'

const valid = {
  MONGODB_URI: 'mongodb://localhost:27017/codenest',
  REDIS_URL: 'redis://localhost:6379',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'a'.repeat(32),
  INVITE_TOKEN_SECRET: 'b'.repeat(32),
}
describe('startup environment', () => {
  it('supplies runtime defaults and allows AI to be unavailable', () => {
    expect(validateEnv(valid)).toMatchObject({ PORT: 3000, NODE_ENV: 'development' })
  })
  it.each(['MONGODB_URI', 'REDIS_URL', 'NEXTAUTH_SECRET', 'INVITE_TOKEN_SECRET', 'NEXTAUTH_URL'])(
    'requires %s without exposing values',
    (field) => {
      expect(() => validateEnv({ ...valid, [field]: undefined })).toThrow(field)
      expect(() => validateEnv({ ...valid, NEXTAUTH_SECRET: 'private' })).not.toThrow('private')
    },
  )
  it('rejects invalid ports, protocols and shared secrets', () => {
    expect(() => validateEnv({ ...valid, PORT: 70000 })).toThrow('PORT')
    expect(() => validateEnv({ ...valid, REDIS_URL: 'https://localhost' })).toThrow('REDIS_URL')
    expect(() => validateEnv({ ...valid, INVITE_TOKEN_SECRET: valid.NEXTAUTH_SECRET })).toThrow(
      'INVITE_TOKEN_SECRET',
    )
  })
})
