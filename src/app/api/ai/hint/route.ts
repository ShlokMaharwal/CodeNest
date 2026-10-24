import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { callGemini, buildHintPrompt } from '@/lib/gemini'
import { redis, getJSON, incrementWithTTL } from '@/lib/redis'
import { connectDB } from '@/lib/mongodb'
import { RoomModel } from '@/lib/models/Room'
import { ProblemModel } from '@/lib/models/Problem'
import { LiveRoomState } from '@/types'
import { reserveHint, releaseHint, saveHint } from '../../../../../server/hints'

const hintInput = z.object({ roomId: z.string().regex(/^[a-z0-9]{8}$/) })

export async function POST(req: NextRequest) {
  let reserved: { roomId: string; email: string } | undefined
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const parsed = hintInput.safeParse(await req.json())
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid hint request' }, { status: 400 })
    const { roomId } = parsed.data
    const email = session.user.email
    if ((await incrementWithTTL('ratelimit:hint:' + email, 3600)) > 10) {
      return NextResponse.json({ error: 'Too many hints. Try again later.' }, { status: 429 })
    }
    await connectDB()
    const room = await RoomModel.findOne({ roomId })
    const state = await getJSON<LiveRoomState>('room:' + roomId)
    if (
      !room ||
      !state ||
      room.candidateEmail !== email ||
      !state.users.some((user) => user.email === email && user.role === 'candidate')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (room.status === 'ended' || !room.hintsEnabled)
      return NextResponse.json({ error: 'Hints unavailable' }, { status: 403 })
    const count = await reserveHint(
      redis,
      roomId,
      email,
      room.maxHints,
      state.hintsPerCandidate?.[email] || 0,
    )
    if (count < 0)
      return NextResponse.json(
        { error: 'Maximum ' + room.maxHints + ' hints reached' },
        { status: 429 },
      )
    reserved = { roomId, email }
    // The authoritative source is the room state, never client counters or code.
    const problem = room.problemId ? await ProblemModel.findById(room.problemId) : null
    const hint = await callGemini(
      buildHintPrompt({
        problemTitle: problem?.title || room.title,
        problemDescription: problem?.description || '',
        code: state.code,
        language: state.language,
        hintsUsed: count - 1,
      }),
    )
    await saveHint(redis, roomId, email, hint)
    reserved = undefined
    return NextResponse.json({ hint })
  } catch {
    if (reserved) await releaseHint(redis, reserved.roomId, reserved.email).catch(() => {})
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 503 },
    )
  }
}
