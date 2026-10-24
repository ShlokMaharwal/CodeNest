import { limitRequest } from '@/lib/rate-limit'
import { inputErrorResponse } from '@/lib/api'
import { roomIdSchema } from '@/lib/schemas'
import { signInviteToken, verifyInviteToken } from '@/lib/invite'
import { revokeInvite } from '../../../../../../server/invites'
import { redis } from '@/lib/redis'
import { env } from '@/lib/env'
import { authOptions } from '@/lib/auth'
import { RoomModel } from '@/lib/models/Room'
import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limited = await limitRequest('room:' + session.user.email, 60, 60)
    if (limited) return limited
    const { roomId } = await params
    roomIdSchema.parse(roomId)
    await connectDB()

    const room = (await RoomModel.findOne({ roomId, createdBy: session.user.email }).lean()) as any
    if (!room) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 })
    }

    if (room.status === 'ended')
      return NextResponse.json({ error: 'Interview ended' }, { status: 400 })
    if (!verifyInviteToken(room.inviteToken, roomId)) {
      await revokeInvite(redis, room.inviteToken, env.INVITE_TOKEN_SECRET)
      const refreshed = signInviteToken(roomId)
      await RoomModel.updateOne(
        { roomId, inviteToken: room.inviteToken },
        { $set: { inviteToken: refreshed } },
      )
      const current = (await RoomModel.findOne({ roomId }).lean()) as any
      room.inviteToken = current.inviteToken
    }
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/room/${roomId}?token=${room.inviteToken}`

    return NextResponse.json({ inviteLink, inviteToken: room.inviteToken })
  } catch (err: any) {
    const invalid = inputErrorResponse(err)
    if (invalid) return invalid
    console.error('[GET /api/rooms/[roomId]/invite]', err)
    return NextResponse.json({ error: 'Failed to get invite' }, { status: 500 })
  }
}
