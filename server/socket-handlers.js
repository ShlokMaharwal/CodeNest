const { consumeRateLimit } = require('./rate-limit')
const { consumeInvite, revokeInvite } = require('./invites')
const { getCandidateHints } = require('./hints')
const { authorizeEvent } = require('./socket-policy')

function registerSocketHandlers(io, dependencies) {
  const { redis, RoomModel, SnapshotModel, env } = dependencies
  async function getRoomState(roomId) {
    const raw = await redis.get(`room:${roomId}`)
    return raw ? JSON.parse(raw) : null
  }

  async function setRoomState(roomId, state) {
    await redis.setex(`room:${roomId}`, 7 * 24 * 60 * 60, JSON.stringify(state))
  }

  async function saveSnapshot(roomId, state, trigger) {
    try {
      // Extract test results from the last execution output
      const rawTestCases = state.output?.testCases || []
      const testResults = rawTestCases.map((tc) => ({
        input: tc.input || '',
        expected: tc.expectedOutput || '',
        actual: tc.actualOutput || '',
        passed: tc.passed || false,
      }))

      // Sum hint usage across all candidates (hintsUsed is not a top-level field in Redis state)
      const storedCounts = await redis.hgetall('room:' + roomId + ':hints')
      const hintsPerCandidate = Object.keys(storedCounts).length
        ? storedCounts
        : state.hintsPerCandidate || {}
      const hintsUsed = Object.values(hintsPerCandidate).reduce((sum, n) => sum + Number(n || 0), 0)

      await SnapshotModel.create({
        roomId,
        code: state.code || '',
        language: state.language || 'javascript',
        hintsUsed,
        testResults,
        timestamp: new Date(),
        trigger,
      })
    } catch (err) {
      console.error('[Snapshot] Failed to save:', err.message)
    }
  }

  const snapshotIntervals = new Map()

  function startAutoSnapshot(roomId, _io) {
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

  io.on('connection', (socket) => {
    const { user } = socket.data
    function on(event, handler) {
      socket.on(event, async (payload) => {
        try {
          if (event !== 'disconnect') {
            if (
              !payload ||
              typeof payload.roomId !== 'string' ||
              !/^[a-z0-9]{8}$/.test(payload.roomId)
            ) {
              socket.emit('error', { message: 'Invalid room' })
              return
            }
            if (event !== 'join-room') {
              if (
                event === 'code-change' &&
                (typeof payload.code !== 'string' ||
                  Buffer.byteLength(payload.code) > 100000 ||
                  !(
                    await consumeRateLimit(
                      redis,
                      'ratelimit:socket:' + payload.roomId + ':' + user.email,
                      50,
                      1,
                    )
                  ).allowed)
              ) {
                socket.emit('error', { message: 'Code update limit exceeded' })
                return
              }
              const state = await getRoomState(payload.roomId)
              if (!authorizeEvent(socket, event, payload, state)) {
                socket.emit('error', { message: 'Forbidden' })
                return
              }
            }
          }
          await handler(payload)
        } catch (error) {
          console.error('[Socket event]', event, error.message)
          socket.emit('error', { message: 'Unable to process room event' })
        }
      })
    }
    console.log(`[Socket] Connected: ${socket.id} (${user?.name})`)

    on('join-room', async ({ roomId, inviteToken }) => {
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
        if (!isCreator && room.candidateEmail && room.candidateEmail !== user.email) {
          socket.emit('invite-invalid')
          return
        }
        if (socket.data.roomId && socket.data.roomId !== roomId) {
          socket.emit('error', { message: 'Already joined another room' })
          return
        }

        if (isCreator) {
          role = 'interviewer'
        } else {
          if (!inviteToken) {
            socket.emit('invite-invalid')
            socket.disconnect()
            return
          }
          if (
            inviteToken !== room.inviteToken ||
            !(await consumeInvite(redis, inviteToken, roomId, user.email, env.INVITE_TOKEN_SECRET))
          ) {
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

        const personal =
          role === 'candidate'
            ? await getCandidateHints(redis, roomId, user.email, state)
            : { count: 0, texts: [] }
        socket.emit('room-state', {
          ...state,
          myRole: role,
          hintsUsed: personal.count,
          myHintTexts: personal.texts,
        })

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

    on('code-change', async ({ roomId, code }) => {
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

    on('language-change', async ({ roomId, language }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.language = language
      await setRoomState(roomId, state)
      io.to(roomId).emit('language-update', { language })
    })

    on('test-cases-change', async ({ roomId, testCases }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.testCases = testCases
      await setRoomState(roomId, state)
      socket.to(roomId).emit('test-cases-update', { testCases })
    })

    on('output-update', async ({ roomId, output }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.output = output
      await setRoomState(roomId, state)
      io.to(roomId).emit('output-result', { output })

      await saveSnapshot(roomId, state, 'execution')
    })

    on('notes-change', async ({ roomId, notes }) => {
      const state = await getRoomState(roomId)
      if (!state) return

      state.notes = notes
      await setRoomState(roomId, state)
      socket.to(roomId).emit('notes-update', { notes })
    })

    on('editor-lock', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.editorLockedBy = socket.id
      await setRoomState(roomId, state)
      io.to(roomId).emit('editor-locked', { lockedBy: socket.id })
    })

    on('editor-unlock', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.editorLockedBy = null
      await setRoomState(roomId, state)
      io.to(roomId).emit('editor-unlocked')
    })

    on('take-control', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.controlledBy = 'interviewer'
      await setRoomState(roomId, state)
      io.to(roomId).emit('control-changed', { controlledBy: 'interviewer' })
    })

    on('return-control', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.controlledBy = 'candidate'
      await setRoomState(roomId, state)
      io.to(roomId).emit('control-changed', { controlledBy: 'candidate' })
    })

    on('hint-used', async ({ roomId }) => {
      const personal = await getCandidateHints(
        redis,
        roomId,
        socket.data.user.email,
        await getRoomState(roomId),
      )
      socket.emit('hint-count-update', { hintsUsed: personal.count })
      socket.emit('hints-text-update', { hints: personal.texts })
    })

    on('problem-change', async ({ roomId, problemId, problem }) => {
      if (socket.data.role !== 'interviewer') return
      const state = await getRoomState(roomId)
      if (!state) return

      state.problemId = problemId
      state.code = problem?.starterCode?.[state.language] || ''
      await setRoomState(roomId, state)

      await RoomModel.findOneAndUpdate({ roomId }, { problemId })

      io.to(roomId).emit('problem-updated', { problem, code: state.code })
    })

    on('timer-start', async ({ roomId, durationMinutes }) => {
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

    on('interview-end', async ({ roomId }) => {
      if (socket.data.role !== 'interviewer') return

      try {
        const state = await getRoomState(roomId)
        if (!state) return

        await revokeInvite(
          redis,
          (await RoomModel.findOne({ roomId })).inviteToken,
          env.INVITE_TOKEN_SECRET,
        )
        state.status = 'ended'
        await setRoomState(roomId, state)

        await saveSnapshot(roomId, state, 'end')

        // Extend TTL so the room is preserved for 90 days after ending
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        await RoomModel.findOneAndUpdate(
          { roomId },
          { status: 'ended', endedAt: new Date(), expiresAt },
        )

        stopAutoSnapshot(roomId)

        const baseUrl = env.NEXTAUTH_URL
        const replayLink = `${baseUrl}/room/${roomId}/replay`

        io.to(roomId).emit('interview-ended', { replayLink })
        console.log(`[Room ${roomId}] Interview ended. Replay: ${replayLink}`)
      } catch (err) {
        console.error('[interview-end] Error:', err)
      }
    })

    on('cursor-move', ({ roomId, position }) => {
      socket.to(roomId).emit('cursor-update', { userId: socket.id, position })
    })

    on('disconnect', async () => {
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

        console.log(
          `[Room ${roomId}] ${socketUser?.name || 'Unknown'} left. Remaining: ${state.users.length}`,
        )
      } catch (err) {
        console.error('[disconnect] Error:', err)
      }
    })
  })

  return {
    stopAll: () => {
      for (const id of snapshotIntervals.keys()) stopAutoSnapshot(id)
    },
  }
}

module.exports = { registerSocketHandlers }
