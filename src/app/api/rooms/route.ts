import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { RoomModel } from '@/lib/models/Room'
import { signInviteToken } from '@/lib/invite'
import { setJSON } from '@/lib/redis'
import { LiveRoomState } from '@/types'

function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title = 'Interview Session',
      problemId,
      hintsEnabled = true,
      maxHints = 5,
      durationMinutes = 45,
      language = 'javascript',
      scheduledAt,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidatePosition,
      candidateLinkedin,
      experienceLevel,
      description,
    } = body

    await connectDB()

    const roomId = generateRoomId()
    const inviteToken = signInviteToken(roomId)
    const now = new Date()

    let expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    if (scheduledAt) {
      const schedDate = new Date(scheduledAt)
      expiresAt = new Date(schedDate.getTime() + 48 * 60 * 60 * 1000)
    }

    const room = await RoomModel.create({
      roomId,
      title,
      createdBy: session.user.email,
      status: 'waiting',
      language,
      problemId: problemId || undefined,
      hintsEnabled,
      maxHints,
      durationMinutes,
      inviteToken,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidatePosition,
      candidateLinkedin,
      experienceLevel,
      description,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdAt: now,
      expiresAt,
    })

    let redisTTL = 24 * 60 * 60
    if (scheduledAt) {
      const schedDate = new Date(scheduledAt)
      const diffMs = schedDate.getTime() - now.getTime()
      if (diffMs > 0) {
        redisTTL = Math.ceil(diffMs / 1000) + (48 * 60 * 60)
      }
    }

    const initialState: LiveRoomState = {
      roomId,
      code: '',
      language,
      testCases: [{ input: '', expectedOutput: '' }],
      output: null,
      notes: '',
      hintsUsed: 0,
      hintsEnabled,
      maxHints,
      editorLockedBy: null,
      controlledBy: 'candidate',
      status: 'waiting',
      problemId: problemId || undefined,
      users: [],
    }
    await setJSON(`room:${roomId}`, initialState, redisTTL)

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/room/${roomId}?token=${inviteToken}`

    return NextResponse.json({
      roomId: room.roomId,
      title: room.title,
      inviteLink,
      inviteToken,
    }, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/rooms]', err)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const rooms = await RoomModel.find({ createdBy: session.user.email })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ rooms })
  } catch (err: any) {
    console.error('[GET /api/rooms]', err)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
