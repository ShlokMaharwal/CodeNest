import mongoose from 'mongoose'
import { env } from './env'

type MongoCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
const globalForMongo = globalThis as typeof globalThis & { mongoose?: MongoCache }
const cached = (globalForMongo.mongoose ||= { conn: null, promise: null })

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 3000 })
      .catch((error) => {
        cached.promise = null
        cached.conn = null
        throw error
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}
