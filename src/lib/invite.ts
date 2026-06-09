import jwt from 'jsonwebtoken'

const SECRET = process.env.INVITE_TOKEN_SECRET!
const EXPIRY = '24h'

export interface InvitePayload {
  roomId: string
  role: 'candidate'
}


export function signInviteToken(roomId: string): string {
  if (!SECRET) throw new Error('INVITE_TOKEN_SECRET is not set')
  const payload: InvitePayload = { roomId, role: 'candidate' }
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY })
}


export function verifyInviteToken(token: string): InvitePayload | null {
  if (!SECRET) return null
  try {
    const payload = jwt.verify(token, SECRET) as InvitePayload
    return payload
  } catch {
    return null
  }
}
