import { authOptions } from '@/lib/auth'
import { buildReviewPrompt, callGemini } from '@/lib/gemini'
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

    const {
      roomId,
      problemTitle = 'Coding Problem',
      problemDescription = '',
      code = '',
      language = 'javascript',
      testResults = [],
    } = await req.json()

    const prompt = buildReviewPrompt({
      problemTitle,
      problemDescription,
      code,
      language,
      testResults,
    })
    const review = await callGemini(prompt)

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
    console.error('[POST /api/ai/review]', err)
    return NextResponse.json(
      { error: 'Failed to generate review. Please try again.' },
      { status: 500 },
    )
  }
}
