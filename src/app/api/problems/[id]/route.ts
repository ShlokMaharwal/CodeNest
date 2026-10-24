import { inputErrorResponse } from '@/lib/api'
import { objectIdSchema } from '@/lib/schemas'
import { ProblemModel } from '@/lib/models/Problem'
import { connectDB } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    objectIdSchema.parse(id)

    const problem = (await ProblemModel.findById(id).lean()) as any
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const publicProblem = {
      ...problem,
      testCases: (problem.testCases || []).filter((tc: any) => !tc.isHidden),
    }

    return NextResponse.json({ problem: publicProblem })
  } catch (err: any) {
    const invalid = inputErrorResponse(err)
    if (invalid) return invalid
    console.error('[GET /api/problems/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch problem' }, { status: 500 })
  }
}
