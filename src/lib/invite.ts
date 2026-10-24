import { env } from './env'
import { signInvite, verifyInvite } from '../../server/invites'

export function signInviteToken(roomId: string): string {
  return signInvite(roomId, env.INVITE_TOKEN_SECRET)
}
export function verifyInviteToken(token: string, roomId?: string) {
  return verifyInvite(token, env.INVITE_TOKEN_SECRET, roomId)
}
