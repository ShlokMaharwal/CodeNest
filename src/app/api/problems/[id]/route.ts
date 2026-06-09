import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ProblemModel } from '@/lib/models/Problem'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const problem = await ProblemModel.findById(id).lean() as any
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    const publicProblem = {
      ...problem,
      testCases: (problem.testCases || []).filter((tc: any) => !tc.isHidden),
    }

    return NextResponse.json({ problem: publicProblem })
  } catch (err: any) {
    console.error('[GET /api/problems/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch problem' }, { status: 500 })
  }
}
