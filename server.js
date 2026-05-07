process.env.NEXT_PRIVATE_DISABLE_TURBOPACK = '1'

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const rooms = new Map()

app.prepare().then(() => {
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

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`)

    socket.on('join-room', ({ roomId, user }) => {
      socket.join(roomId)
      socket.data.roomId = roomId
      socket.data.user = user

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          code: '// Start coding here...\n',
          language: 'javascript',
          users: new Map(),
          testCases: [{ input: '', expectedOutput: '' }],
          output: null,
        })
      }

      const room = rooms.get(roomId)
      room.users.set(socket.id, { id: socket.id, name: user.name, color: user.color })

      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        users: Array.from(room.users.values()),
        testCases: room.testCases,
        output: room.output,
      })

      socket.to(roomId).emit('user-joined', {
        user: { id: socket.id, name: user.name, color: user.color },
        users: Array.from(room.users.values()),
      })

      console.log(`[Room ${roomId}] ${user.name} joined. Total: ${room.users.size}`)
    })

    socket.on('code-change', ({ roomId, code }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.code = code
        socket.to(roomId).emit('code-update', { code })
      }
    })

    socket.on('language-change', ({ roomId, language }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.language = language
        socket.to(roomId).emit('language-update', { language })
      }
    })

    socket.on('cursor-move', ({ roomId, position }) => {
      socket.to(roomId).emit('cursor-update', {
        userId: socket.id,
        position,
      })
    })

    socket.on('test-cases-change', ({ roomId, testCases }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.testCases = testCases
        socket.to(roomId).emit('test-cases-update', { testCases })
      }
    })

    socket.on('output-update', ({ roomId, output }) => {
      const room = rooms.get(roomId)
      if (room) {
        room.output = output
        io.to(roomId).emit('output-result', { output })
      }
    })

    socket.on('notes-change', ({ roomId, notes }) => {
      socket.to(roomId).emit('notes-update', { notes })
    })

    socket.on('disconnect', () => {
      const { roomId, user } = socket.data
      if (roomId && rooms.has(roomId)) {
        const room = rooms.get(roomId)
        room.users.delete(socket.id)

        if (room.users.size === 0) {
          setTimeout(() => {
            if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
              rooms.delete(roomId)
              console.log(`[Room ${roomId}] Cleaned up (empty)`)
            }
          }, 30 * 60 * 1000)
        } else {
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            users: Array.from(room.users.values()),
          })
        }

        console.log(`[Room ${roomId}] ${user?.name} left. Remaining: ${room.users.size}`)
      }
    })
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 CodeSync running on http://localhost:${PORT}`)
    console.log(`   WebSocket server active\n`)
  })
})
