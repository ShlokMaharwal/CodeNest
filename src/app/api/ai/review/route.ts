import { RoomModel } from '@/lib/models/Room'
import { readJSON, inputErrorResponse, InputError } from '@/lib/api'
import { reviewInputSchema } from '@/lib/schemas'
import { limitRequest } from '@/lib/rate-limit'
import { authOptions } from '@/lib/auth'
import { generateReview } from '@/lib/gemini'
import { SnapshotModel } from '@/lib/models/Snapshot'
import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limited = await limitRequest('ai-review:' + session.user.email, 5, 60)
    if (limited) return limited
    const {
      roomId,
      problemTitle = 'Coding Problem',
      problemDescription = '',
      code = '',
      language = 'javascript',
      testResults = [],
    } = await readJSON(req, reviewInputSchema)

    await connectDB()
    const room = await RoomModel.findOne({ roomId })
    if (!room || room.createdBy !== session.user.email)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { review, structured } = await generateReview({
      problemTitle,
      problemDescription,
      code,
      language,
      testResults,
    })
    await RoomModel.updateOne({ roomId }, { $set: { aiReview: review, aiReviewData: structured } })

    if (roomId) {
      try {
        await connectDB()
        await SnapshotModel.findOneAndUpdate(
          { roomId },
          { $set: { aiReview: review } },
          { sort: { timestamp: -1 } },
        )
      } catch (e: any) {
        console.error('[POST /api/ai/review] Failed to persist aiReview to snapshot:', e.message)
      }
    }

    return NextResponse.json({ review })
  } catch (err: any) {
    const invalid = err instanceof InputError ? inputErrorResponse(err) : null
    if (invalid) return invalid
    console.error('[POST /api/ai/review]', err)
    return NextResponse.json(
      { error: 'Failed to generate review. Please try again.' },
      { status: 503 },
    )
  }
}
