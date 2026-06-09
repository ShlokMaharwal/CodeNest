import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ProblemModel } from '@/lib/models/Problem'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get('difficulty')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const query: any = {}

    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty
    }

    if (tag) {
      query.tags = { $in: [tag] }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    const [problems, total] = await Promise.all([
      ProblemModel.find(query)
        .select('title difficulty tags description')
        .sort({ difficulty: 1, title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProblemModel.countDocuments(query),
    ])

    return NextResponse.json({
      problems,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err: any) {
    console.error('[GET /api/problems]', err)
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 })
  }
}
