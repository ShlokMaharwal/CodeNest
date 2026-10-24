import { afterEach, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import { signInvite, verifyInvite, consumeInvite, revokeInvite } from '../server/invites'
const secret = 'test-invite-secret-'.repeat(3)
afterEach(() => vi.useRealTimers())
describe('invite claims', () => {
  it('binds tokens to a room, role, issuer and unique identity', () => {
    const token = signInvite('abcd1234', secret)
    expect(verifyInvite(token, secret, 'abcd1234')).toMatchObject({ role: 'candidate' })
    expect(verifyInvite(token, secret, 'other123')).toBeNull()
    expect(verifyInvite(signInvite('abcd1234', secret), secret)?.jti).not.toBe(
      verifyInvite(token, secret)?.jti,
    )
  })
  it('rejects expired and tampered tokens', () => {
    vi.useFakeTimers()
    const token = signInvite('abcd1234', secret, 1)
    vi.advanceTimersByTime(2000)
    expect(verifyInvite(token, secret)).toBeNull()
    expect(verifyInvite(token + 'x', secret)).toBeNull()
    expect(
      verifyInvite(jwt.sign({ roomId: 'abcd1234', role: 'interviewer' }, secret), secret),
    ).toBeNull()
  })
  it('allows one verified identity to reconnect and blocks reuse or revocation', async () => {
    let owner: string | undefined
    let revoked = false
    const redis = {
      eval: vi.fn(
        async (_script: string, _count: number, _used: string, _revoked: string, email: string) => {
          if (revoked || (owner && owner !== email)) return 0
          owner = email
          return 1
        },
      ),
      setex: vi.fn(async () => {
        revoked = true
      }),
    }
    const token = signInvite('abcd1234', secret)
    expect(await consumeInvite(redis, token, 'abcd1234', 'a@example.com', secret)).toBe(true)
    expect(await consumeInvite(redis, token, 'abcd1234', 'a@example.com', secret)).toBe(true)
    expect(await consumeInvite(redis, token, 'abcd1234', 'b@example.com', secret)).toBe(false)
    await revokeInvite(redis, token, secret)
    expect(await consumeInvite(redis, token, 'abcd1234', 'a@example.com', secret)).toBe(false)
    expect(redis.setex).toHaveBeenCalled()
  })
})
