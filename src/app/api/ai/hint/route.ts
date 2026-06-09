import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { callGemini, buildHintPrompt } from '@/lib/gemini'
import { incrementWithTTL } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      problemTitle = 'Coding Problem',
      problemDescription = '',
      code = '',
      language = 'javascript',
      hintsUsed = 0,
      maxHints = 5,
    } = await req.json()

    if (hintsUsed >= maxHints) {
      return NextResponse.json({ error: `Maximum ${maxHints} hints reached` }, { status: 429 })
    }

    const rateLimitKey = `ratelimit:hint:${session.user.email}`
    const count = await incrementWithTTL(rateLimitKey, 60 * 60)
    if (count > 10) {
      return NextResponse.json({ error: 'Too many hints. Try again later.' }, { status: 429 })
    }

    const prompt = buildHintPrompt({ problemTitle, problemDescription, code, language, hintsUsed })
    const hint = await callGemini(prompt)

    return NextResponse.json({ hint })
  } catch (err: any) {
    console.error('[POST /api/ai/hint]', err)
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'AI service is temporarily rate limited. Please wait a moment and try again.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'AI service is currently experiencing high demand or is temporarily unavailable. Please try again in a few seconds.' },
      { status: 503 }
    )
  }
}
