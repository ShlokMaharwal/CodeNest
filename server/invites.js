const jwt = require('jsonwebtoken')
const { randomUUID } = require('node:crypto')
const { z } = require('zod')
const inviteClaims = z.object({
  roomId: z.string().regex(/^[a-z0-9]{8}$/),
  role: z.literal('candidate'),
  jti: z.string().uuid(),
  exp: z.number().int(),
  iat: z.number().int(),
})
function signInvite(roomId, secret, lifetime = 86400) {
  return jwt.sign({ roomId, role: 'candidate' }, secret, {
    expiresIn: lifetime,
    jwtid: randomUUID(),
    issuer: 'codenest',
    audience: 'codenest-room',
    algorithm: 'HS256',
  })
}
/** @param {string | undefined} [roomId] */
function verifyInvite(token, secret, roomId) {
  try {
    const data = inviteClaims.parse(
      jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'codenest',
        audience: 'codenest-room',
      }),
    )
    return !roomId || data.roomId === roomId ? data : null
  } catch {
    return null
  }
}
async function consumeInvite(redis, token, roomId, email, secret) {
  const claims = verifyInvite(token, secret, roomId)
  if (!claims) return false
  const ttl = Math.max(1, claims.exp - Math.floor(Date.now() / 1000))
  const accepted = await redis.eval(
    `if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
local owner = redis.call('GET', KEYS[1])
if owner then
  if owner == ARGV[1] then return 1 else return 0 end
end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
return 1`,
    2,
    'invite:used:' + claims.jti,
    'invite:revoked:' + claims.jti,
    email,
    ttl,
  )
  return Number(accepted) === 1
}
async function revokeInvite(redis, token, secret) {
  const claims = verifyInvite(token, secret)
  if (claims)
    await redis.setex(
      'invite:revoked:' + claims.jti,
      Math.max(1, claims.exp - Math.floor(Date.now() / 1000)),
      '1',
    )
}
module.exports = { signInvite, verifyInvite, consumeInvite, revokeInvite }
