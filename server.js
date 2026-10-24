process.env.NEXT_PRIVATE_DISABLE_TURBOPACK = '1'

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })
const { validateEnv } = require('./src/lib/env-schema')
const env = validateEnv(process.env)

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { getToken } = require('next-auth/jwt')
const Redis = require('ioredis')
const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  title: { type: String, required: true, default: 'Interview Session' },
  createdBy: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  language: { type: String, default: 'javascript' },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: false },
  hintsEnabled: { type: Boolean, default: true },
  maxHints: { type: Number, default: 5 },
  durationMinutes: { type: Number, default: 45 },
  inviteToken: { type: String, required: true },
  candidateName: { type: String },
  candidateEmail: { type: String },
  candidatePhone: { type: String },
  candidatePosition: { type: String },
  candidateLinkedin: { type: String },
  experienceLevel: { type: String, enum: ['junior', 'mid', 'senior', 'staff', 'principal'] },
  description: { type: String },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  endedAt: { type: Date },
  integrityEvents: [
    {
      _id: false,
      type: { type: String, enum: ['tab-switch', 'large-paste'] },
      size: Number,
      actor: String,
      timestamp: Date,
    },
  ],
  aiReview: { type: String },
  aiReviewData: { type: mongoose.Schema.Types.Mixed },
})
RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
const RoomModel = mongoose.models.Room || mongoose.model('Room', RoomSchema)

const TestResultSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expected: { type: String, default: '' },
    actual: { type: String, default: '' },
    passed: { type: Boolean, default: false },
  },
  { _id: false },
)
const SnapshotSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  hintsUsed: { type: Number, default: 0 },
  testResults: [TestResultSchema],
  aiReview: { type: String },
  timestamp: { type: Date, default: Date.now },
  trigger: { type: String, enum: ['auto', 'execution', 'manual', 'end'], default: 'auto' },
})
const SnapshotModel = mongoose.models.Snapshot || mongoose.model('Snapshot', SnapshotSchema)

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 3000),
})
redis.on('connect', () => console.log('[Redis] Connected'))
redis.on('error', (err) => console.error('[Redis] Error:', err.message))

async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return
  await mongoose.connect(env.MONGODB_URI)
  console.log('[MongoDB] Connected')
}

app.prepare().then(async () => {
  await connectMongo()

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const { allowedOrigins, isAllowedOrigin } = require('./server/origins')
  const io = new Server(httpServer, {
    maxHttpBufferSize: 256000,
    allowRequest: (req, callback) => callback(null, isAllowedOrigin(req.headers.origin, env)),
    cors: {
      origin: allowedOrigins(env),
      methods: ['GET', 'POST'],
    },
  })

  io.use(async (socket, next) => {
    try {
      const req = socket.request
      req.cookies = Object.fromEntries(
        (socket.handshake.headers.cookie || '')
          .split(';')
          .filter(Boolean)
          .map((c) => c.trim().split('=').map(decodeURIComponent)),
      )

      const token = await getToken({
        req,
        secret: env.NEXTAUTH_SECRET,
      })

      if (!token) {
        return next(new Error('Unauthorized'))
      }

      socket.data.user = {
        id: token.sub,
        name: token.name,
        email: token.email,
        color: token.color || '#6366f1',
      }

      next()
    } catch (_err) {
      next(new Error('Auth error'))
    }
  })

  require('./server/socket-handlers').registerSocketHandlers(io, {
    redis,
    RoomModel,
    SnapshotModel,
    env,
  })

  const PORT = env.PORT
  httpServer.listen(PORT, () => {
    console.log(`\nCodeNest running on http://localhost:${PORT}`)
    console.log(`   WebSocket server active\n`)
  })
})
