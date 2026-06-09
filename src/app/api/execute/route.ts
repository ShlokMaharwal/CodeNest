import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeCode } from '@/lib/wandbox'
import { incrementWithTTL } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitKey = `ratelimit:exec:${session.user.email}`
    const count = await incrementWithTTL(rateLimitKey, 60)
    if (count > 30) {
      return NextResponse.json(
        { error: 'Too many executions. Wait a moment and try again.' },
        { status: 429 }
      )
    }

    const { code, language, testCases } = await req.json()

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 })
    }

    console.log(`[API Execute] ${session.user.email} | ${language} | ${code?.length} chars | ${testCases?.length ?? 0} test cases`)

    const result = await executeCode(code, language, testCases || [])
    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Execution failed' }, { status: 500 })
  }
}
