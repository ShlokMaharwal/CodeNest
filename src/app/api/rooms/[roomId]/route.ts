import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { RoomModel } from '@/lib/models/Room'
import { SnapshotModel } from '@/lib/models/Snapshot'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await params
    await connectDB()

    const room = await RoomModel.findOne({ roomId }).lean()
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const includeSnapshots = searchParams.get('snapshots') === 'true'

    let snapshots = null
    if (includeSnapshots) {
      snapshots = await SnapshotModel.find({ roomId })
        .sort({ timestamp: 1 })
        .lean()
    }

    return NextResponse.json({ room, snapshots })
  } catch (err: any) {
    console.error('[GET /api/rooms/[roomId]]', err)
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await params
    await connectDB()

    const room = await RoomModel.findOne({ roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.createdBy !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
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
      { new: true }
    ).lean()

    return NextResponse.json({ room: updated })
  } catch (err: any) {
    console.error('[PATCH /api/rooms/[roomId]]', err)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await params
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

    await RoomModel.deleteOne({ roomId })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[DELETE /api/rooms/[roomId]]', err)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}
