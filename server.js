process.env.NEXT_PRIVATE_DISABLE_TURBOPACK = '1'

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { getToken } = require('next-auth/jwt')
const Redis = require('ioredis')
const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  roomId:            { type: String, required: true, unique: true },
  title:             { type: String, required: true, default: 'Interview Session' },
  createdBy:         { type: String, required: true },
  status:            { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  language:          { type: String, default: 'javascript' },
  problemId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: false },
  hintsEnabled:      { type: Boolean, default: true },
  maxHints:          { type: Number, default: 5 },
  durationMinutes:   { type: Number, default: 45 },
  inviteToken:       { type: String, required: true },
  candidateName:     { type: String },
  candidateEmail:    { type: String },
  candidatePhone:    { type: String },
  candidatePosition: { type: String },
  candidateLinkedin: { type: String },
  experienceLevel:   { type: String, enum: ['junior', 'mid', 'senior', 'staff', 'principal'] },
  description:       { type: String },
  scheduledAt:       { type: Date },
  createdAt:         { type: Date, default: Date.now },
  expiresAt:         { type: Date, required: true },
  endedAt:           { type: Date },
})
RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
const RoomModel = mongoose.models.Room || mongoose.model('Room', RoomSchema)

const TestResultSchema = new mongoose.Schema({
  input:    { type: String, default: '' },
  expected: { type: String, default: '' },
  actual:   { type: String, default: '' },
  passed:   { type: Boolean, default: false },
}, { _id: false })
const SnapshotSchema = new mongoose.Schema({
  roomId:      { type: String, required: true, index: true },
  code:        { type: String, default: '' },
  language:    { type: String, default: 'javascript' },
  hintsUsed:   { type: Number, default: 0 },
  testResults: [TestResultSchema],
  aiReview:    { type: String },
  timestamp:   { type: Date, default: Date.now },
  trigger:     { type: String, enum: ['auto', 'execution', 'manual', 'end'], default: 'auto' },
})
const SnapshotModel = mongoose.models.Snapshot || mongoose.model('Snapshot', SnapshotSchema)

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 3000),
})
redis.on('connect', () => console.log('[Redis] Connected'))
redis.on('error', (err) => console.error('[Redis] Error:', err.message))

async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('[MongoDB] Connected')
}

async function getRoomState(roomId) {
  const raw = await redis.get(`room:${roomId}`)
  return raw ? JSON.parse(raw) : null
}

async function setRoomState(roomId, state) {
  await redis.setex(`room:${roomId}`, 24 * 60 * 60, JSON.stringify(state))
}

async function saveSnapshot(roomId, state, trigger) {
  try {
    await SnapshotModel.create({
      roomId,
      code: state.code || '',
      language: state.language || 'javascript',
      hintsUsed: state.hintsUsed || 0,
      testResults: [],
      timestamp: new Date(),
      trigger,
    })
  } catch (err) {
    console.error('[Snapshot] Failed to save:', err.message)
  }
}

const snapshotIntervals = new Map()

function startAutoSnapshot(roomId, io) {
  if (snapshotIntervals.has(roomId)) return
  const interval = setInterval(async () => {
    const state = await getRoomState(roomId)
    if (!state || state.status === 'ended') {
      clearInterval(interval)
      snapshotIntervals.delete(roomId)
      return
    }
    await saveSnapshot(roomId, state, 'auto')
  }, 60_000)
  snapshotIntervals.set(roomId, interval)
}

function stopAutoSnapshot(roomId) {
  if (snapshotIntervals.has(roomId)) {
    clearInterval(snapshotIntervals.get(roomId))
    snapshotIntervals.delete(roomId)
  }
}

app.prepare().then(async () => {
  await connectMongo()

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
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
          .map((c) => c.trim().split('=').map(decodeURIComponent))
      )

      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
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
    } catch (err) {
      next(new Error('Auth error'))
    }
  })

  io.on('connection', (socket) => {
    const { user } = socket.data
    console.log(`[Socket] Connected: ${socket.id} (${user?.name})`)

    socket.on('join-room', async ({ roomId, inviteToken }) => {
      try {
        let state = await getRoomState(roomId)

        if (!state) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        let role = 'candidate'
        const room = await RoomModel.findOne({ roomId })

        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        const isCreator = user.email === room.createdBy

        if (isCreator) {
          role = 'interviewer'
        } else {
          if (!inviteToken) {
            socket.emit('invite-invalid')
            socket.disconnect()
            return
          }
          const jwt = require('jsonwebtoken')
          try {
            const payload = jwt.verify(inviteToken, process.env.INVITE_TOKEN_SECRET)
            if (payload.roomId !== roomId) throw new Error('Token room mismatch')
          } catch {
            socket.emit('invite-invalid')
            socket.disconnect()
            return
          }
          role = 'candidate'
        }

        const existingUsers = state.users || []
        const alreadyInRoom = existingUsers.find((u) => u.email === user.email)

        if (!alreadyInRoom && existingUsers.length >= 2) {
          socket.emit('room-full')
          socket.disconnect()
          return
        }

        state.users = existingUsers.filter((u) => u.email !== user.email)

        const activeUser = {
          socketId: socket.id,
          name: user.name,
          color: user.color,
          role,
          email: user.email,
        }
        state.users.push(activeUser)

        if (state.status === 'waiting' && state.users.length === 2) {
          state.status = 'active'
          await RoomModel.findOneAndUpdate({ roomId }, { status: 'active' })
        }

        if (role === 'candidate' && !room.candidateEmail) {
          await RoomModel.findOneAndUpdate({ roomId }, { candidateEmail: user.email })
        }

        await setRoomState(roomId, state)

        socket.join(roomId)
        socket.data.roomId = roomId
        socket.data.role = role

        const myHintsUsed = role === 'candidate'
          ? ((state.hintsPerCandidate || {})[user.email] || 0)
          : 0
        socket.emit('room-state', { ...state, myRole: role, hintsUsed: myHintsUsed })

        socket.to(roomId).emit('user-joined', {
          user: activeUser,
          users: state.users,
        })

        if (state.status === 'active') {
          startAutoSnapshot(roomId, io)
        }

        console.log(`[Room ${roomId}] ${user.name} joined as ${role}. Total: ${state.users.length}`)
      } catch (err) {
        console.error('[join-room] Error:', err)
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    socket.on('code-change', async ({ roomId, code }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      const { role } = socket.data
      const isControlledByInterviewer = state.controlledBy === 'interviewer'

      if (role === 'interviewer' && !isControlledByInterviewer) return
      if (role === 'candidate' && (state.editorLockedBy || isControlledByInterviewer)) return

      state.code = code
      await setRoomState(roomId, state)
      socket.to(roomId).emit('code-update', { code })
    })

    socket.on('language-change', async ({ roomId, language }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.language = language
      await setRoomState(roomId, state)
      io.to(roomId).emit('language-update', { language })
    })

    socket.on('test-cases-change', async ({ roomId, testCases }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.testCases = testCases
      await setRoomState(roomId, state)
      socket.to(roomId).emit('test-cases-update', { testCases })
    })

    socket.on('output-update', async ({ roomId, output }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.output = output
      await setRoomState(roomId, state)
      io.to(roomId).emit('output-result', { output })

      await saveSnapshot(roomId, state, 'execution')
    })

    socket.on('notes-change', async ({ roomId, notes }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.notes = notes
      await setRoomState(roomId, state)
      socket.to(roomId).emit('notes-update', { notes })
    })

    socket.on('editor-lock', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.editorLockedBy = socket.id
      await setRoomState(roomId, state)
      io.to(roomId).emit('editor-locked', { lockedBy: socket.id })
    })

    socket.on('editor-unlock', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.editorLockedBy = null
      await setRoomState(roomId, state)
      io.to(roomId).emit('editor-unlocked')
    })

    socket.on('take-control', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.controlledBy = 'interviewer'
      await setRoomState(roomId, state)
      io.to(roomId).emit('control-changed', { controlledBy: 'interviewer' })
    })

    socket.on('return-control', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.controlledBy = 'candidate'
      await setRoomState(roomId, state)
      io.to(roomId).emit('control-changed', { controlledBy: 'candidate' })
    })

    socket.on('hint-used', async ({ roomId }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      if (!state.hintsPerCandidate) state.hintsPerCandidate = {}
      const email = socket.data.user?.email
      if (email) {
        state.hintsPerCandidate[email] = (state.hintsPerCandidate[email] || 0) + 1
      }
      await setRoomState(roomId, state)

      const personalCount = email ? (state.hintsPerCandidate[email] || 0) : 0
      socket.emit('hint-count-update', { hintsUsed: personalCount })
    })

    socket.on('problem-change', async ({ roomId, problemId, problem }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.problemId = problemId
      state.code = problem?.starterCode?.[state.language] || ''
      await setRoomState(roomId, state)

      await RoomModel.findOneAndUpdate({ roomId }, { problemId })

      io.to(roomId).emit('problem-updated', { problem, code: state.code })
    })

    socket.on('timer-start', async ({ roomId, durationMinutes }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.timerStartedAt = Date.now()
      state.timerDurationMs = durationMinutes * 60 * 1000
      await setRoomState(roomId, state)
      io.to(roomId).emit('timer-synced', {
        timerStartedAt: state.timerStartedAt,
        timerDurationMs: state.timerDurationMs,
      })
    })

    socket.on('interview-end', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return

      try {
        const state = await getRoomState(roomId)
        if (!state) return

        state.status = 'ended'
        await setRoomState(roomId, state)

        await saveSnapshot(roomId, state, 'end')

        await RoomModel.findOneAndUpdate({ roomId }, { status: 'ended', endedAt: new Date() })

        stopAutoSnapshot(roomId)

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const replayLink = `${baseUrl}/room/${roomId}/replay`

        io.to(roomId).emit('interview-ended', { replayLink })
        console.log(`[Room ${roomId}] Interview ended. Replay: ${replayLink}`)
      } catch (err) {
        console.error('[interview-end] Error:', err)
      }
    })

    socket.on('cursor-move', ({ roomId, position }) => {
      socket.to(roomId).emit('cursor-update', { userId: socket.id, position })
    })

    socket.on('disconnect', async () => {
      const { roomId, user: socketUser } = socket.data
      if (!roomId) return

      try {
        const state = await getRoomState(roomId)
        if (!state) return

        state.users = state.users.filter((u) => u.socketId !== socket.id)
        await setRoomState(roomId, state)

        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          users: state.users,
        })

        if (state.users.length === 0) {
          stopAutoSnapshot(roomId)
        }

        console.log(`[Room ${roomId}] ${socketUser?.name || 'Unknown'} left. Remaining: ${state.users.length}`)
      } catch (err) {
        console.error('[disconnect] Error:', err)
      }
    })
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`\nCodeNest running on http://localhost:${PORT}`)
    console.log(`   WebSocket server active\n`)
  })
})
