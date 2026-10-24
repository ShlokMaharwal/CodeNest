import { readJSON, inputErrorResponse } from '@/lib/api'
import { executionInput } from '../../../../server/execution-input'
import { authOptions } from '@/lib/auth'
import { incrementWithTTL } from '@/lib/redis'
import { executeCode } from '@/lib/wandbox'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

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
        { status: 429 },
      )
    }

    const parsed = executionInput.safeParse(await readJSON(req, executionInput))
    if (!parsed.success)
      return NextResponse.json(
        { error: 'Invalid execution input or size limit exceeded' },
        { status: 400 },
      )
    const { code, language, testCases } = parsed.data

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 })
    }

    console.log(
      `[API Execute] ${session.user.email} | ${language} | ${code?.length} chars | ${testCases?.length ?? 0} test cases`,
    )

    const result = await executeCode(code, language, testCases || [])
    return NextResponse.json({ result })
  } catch (err: any) {
    const invalid = inputErrorResponse(err)
    if (invalid) return invalid
    return NextResponse.json({ error: err.message || 'Execution failed' }, { status: 500 })
  }
}
