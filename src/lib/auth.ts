import { redis } from './redis'
import { consumeRateLimit } from '../../server/rate-limit'
import { env } from './env'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserModel } from './models/User'
import { connectDB } from './mongodb'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = credentials.email.trim().toLowerCase()
        if (!(await consumeRateLimit(redis, 'ratelimit:login:' + normalizedEmail, 10, 900)).allowed)
          return null
        await connectDB()
        const user = await UserModel.findOne({ email: normalizedEmail })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          color: user.color,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.color = (user as any).color
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any
        u.id = token.sub
        u.color = token.color
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: env.NEXTAUTH_SECRET,
}
