import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { ProblemModel } from '@/lib/models/Problem'
import { readJSON, inputErrorResponse } from '@/lib/api'
import { executionInput, objectIdSchema } from '@/lib/schemas'
import { limitRequest } from '@/lib/rate-limit'
import { gradeSolution } from '@/lib/grading'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const limited = await limitRequest('grading:' + session.user.email, 10, 60)
    if (limited) return limited
    const { id } = await params
    objectIdSchema.parse(id)
    const { code, language } = await readJSON(req, executionInput.omit({ testCases: true }))
    await connectDB()
    const problem = (await ProblemModel.findById(id).lean()) as any
    if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    if (!problem.testCases?.length)
      return NextResponse.json({ error: 'No test cases configured' }, { status: 400 })
    return NextResponse.json(await gradeSolution(code, language, problem.testCases))
  } catch (error) {
    return (
      inputErrorResponse(error) ||
      NextResponse.json({ error: 'Execution service temporarily unavailable' }, { status: 503 })
    )
  }
}
