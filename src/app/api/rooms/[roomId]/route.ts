import { recordIntegrity } from '../../../../../server/integrity'
import { limitRequest } from '@/lib/rate-limit'
import { roomQuerySchema } from '@/lib/schemas'
import { roomIdSchema } from '@/lib/schemas'
import { readJSON, inputErrorResponse } from '@/lib/api'
import { roomPatchSchema } from '@/lib/schemas'
import { revokeInvite } from '../../../../../server/invites'
import { redis } from '@/lib/redis'
import { env } from '@/lib/env'
import { authOptions } from '@/lib/auth'
import { RoomModel } from '@/lib/models/Room'
import { SnapshotModel } from '@/lib/models/Snapshot'
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

    const room = await RoomModel.findOne({ roomId }).lean()
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (
      (room as any).createdBy !== session.user.email &&
      (room as any).candidateEmail !== session.user.email
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    delete (room as any).inviteToken
    const { searchParams } = new URL(req.url)
    const query = roomQuerySchema.parse(Object.fromEntries(searchParams))
    const includeSnapshots = query.snapshots === 'true'

    let snapshots = null
    if (includeSnapshots) {
      snapshots = await SnapshotModel.find({ roomId }).sort({ timestamp: 1 }).lean()
    }

    return NextResponse.json({ room, snapshots })
  } catch (err: any) {
    const invalid = inputErrorResponse(err)
    if (invalid) return invalid
    console.error('[GET /api/rooms/[roomId]]', err)
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
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

    const room = await RoomModel.findOne({ roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const body = await readJSON(req, roomPatchSchema)
    const onlyIntegrity = Object.keys(body).length === 1 && Boolean(body.integrityEvents)
    if (
      room.createdBy !== session.user.email &&
      !(room.candidateEmail === session.user.email && onlyIntegrity)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      title,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidatePosition,
      candidateLinkedin,
      experienceLevel,
      description,
      scheduledAt,
      durationMinutes,
      hintsEnabled,
      maxHints,
    } = body

    if (body.integrityEvents)
      await recordIntegrity(RoomModel, roomId, session.user.email, body.integrityEvents)
    const updates: Record<string, any> = {}
    if (title !== undefined) updates.title = title
    if (candidateName !== undefined) updates.candidateName = candidateName
    if (candidateEmail !== undefined) updates.candidateEmail = candidateEmail
    if (candidatePhone !== undefined) updates.candidatePhone = candidatePhone
    if (candidatePosition !== undefined) updates.candidatePosition = candidatePosition
    if (candidateLinkedin !== undefined) updates.candidateLinkedin = candidateLinkedin
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel
    if (description !== undefined) updates.description = description
    if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes
    if (hintsEnabled !== undefined) updates.hintsEnabled = hintsEnabled
    if (maxHints !== undefined) updates.maxHints = maxHints
    if (scheduledAt !== undefined) {
      updates.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
      if (scheduledAt) {
        updates.expiresAt = new Date(new Date(scheduledAt).getTime() + 48 * 60 * 60 * 1000)
      }
    }

    const updated = await RoomModel.findOneAndUpdate(
      { roomId },
      { $set: updates },
      { new: true },
    ).lean()

    return NextResponse.json({ room: updated })
  } catch (err: any) {
    const invalid = inputErrorResponse(err)
    if (invalid) return invalid
    console.error('[PATCH /api/rooms/[roomId]]', err)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
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

    const room = await RoomModel.findOne({ roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.createdBy !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (room.status === 'active') {
      return NextResponse.json({ error: 'Cannot delete an active room' }, { status: 400 })
    }

    await revokeInvite(redis, room.inviteToken, env.INVITE_TOKEN_SECRET)
    await RoomModel.deleteOne({ roomId })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const invalid = inputErrorResponse(err)
    if (invalid) return invalid
    console.error('[DELETE /api/rooms/[roomId]]', err)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}
