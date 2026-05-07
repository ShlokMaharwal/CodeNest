
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { RoomModel } from '@/lib/models/Room'


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, title } = await req.json()
    await connectDB()

    const room = await RoomModel.create({
      roomId,
      title: title || 'Interview Session',
      createdBy: session.user.email,
      language: 'javascript',
    })

    return NextResponse.json({ roomId: room.roomId, title: room.title }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const rooms = await RoomModel.find({ createdBy: session.user.email })
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json({ rooms })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
