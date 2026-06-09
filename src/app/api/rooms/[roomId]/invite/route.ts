import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { RoomModel } from '@/lib/models/Room'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await params
    await connectDB()

    const room = await RoomModel.findOne({ roomId, createdBy: session.user.email }).lean() as any
    if (!room) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/room/${roomId}?token=${room.inviteToken}`

    return NextResponse.json({ inviteLink, inviteToken: room.inviteToken })
  } catch (err: any) {
    console.error('[GET /api/rooms/[roomId]/invite]', err)
    return NextResponse.json({ error: 'Failed to get invite' }, { status: 500 })
  }
}
