import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await connectDB()

    const existing = await UserModel.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
    })

    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email }, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
