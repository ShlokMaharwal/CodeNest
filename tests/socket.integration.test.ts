import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { io as clientIO, Socket } from 'socket.io-client'
import { registerSocketHandlers } from '../server/socket-handlers'
import { signInvite } from '../server/invites'

const ROOM = 'abcd1234',
  OTHER = 'other123',
  PROBLEM = 'a'.repeat(24)
const SECRET = 'integration-invite-secret-with-at-least-32-characters'
class MemoryRedis {
  values = new Map<string, string>()
  ttls = new Map<string, number>()
  hashes = new Map<string, Map<string, string>>()
  async get(key: string) {
    return this.values.get(key) ?? null
  }
  async setex(key: string, ttl: number, value: string) {
    this.values.set(key, value)
    this.ttls.set(key, ttl)
    return 'OK'
  }
  async ttl(key: string) {
    return this.ttls.get(key) ?? -2
  }
  async hget(key: string, field: string) {
    return this.hashes.get(key)?.get(field) ?? null
  }
  async hgetall(key: string) {
    return Object.fromEntries(this.hashes.get(key) || [])
  }
  async eval(script: string, count: number, ...args: any[]) {
    const keys = args.slice(0, count),
      argv = args.slice(count)
    if (script.includes("redis.call('INCR'")) {
      const n = Number(this.values.get(keys[0]) || 0) + 1
      this.values.set(keys[0], String(n))
      this.ttls.set(keys[0], Number(argv[0]))
      return [n, Number(argv[0])]
    }
    if (script.includes("redis.call('EXISTS'")) {
      if (this.values.has(keys[1])) return 0
      const owner = this.values.get(keys[0])
      if (owner && owner !== argv[0]) return 0
      this.values.set(keys[0], argv[0])
      this.ttls.set(keys[0], Number(argv[1]))
      return 1
    }
    throw new Error('Unexpected Redis script in socket integration')
  }
}
let io: Server, http: ReturnType<typeof createServer>, redis: MemoryRedis, url: string
let clients: Socket[], room: any, states: any, controller: any, snapshots: any[], records: any[]
function event(socket: Socket, name: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(name, receive)
      reject(new Error('Missing socket event: ' + name))
    }, 5000)
    function receive(value: any) {
      clearTimeout(timer)
      resolve(value)
    }
    socket.once(name, receive)
  })
}
async function join(identity: string, token?: string, extra: Record<string, unknown> = {}) {
  const client = clientIO(url, {
    transports: ['websocket'],
    reconnection: false,
    auth: { identity },
  })
  clients.push(client)
  await event(client, 'connect')
  const restored = event(client, 'room-state')
  const problem = event(client, 'problem-updated')
  client.emit('join-room', { roomId: ROOM, inviteToken: token, ...extra })
  return { client, state: await restored, problem: await problem }
}
beforeEach(async () => {
  clients = []
  redis = new MemoryRedis()
  snapshots = []
  records = []
  const token = signInvite(ROOM, SECRET)
  room = {
    roomId: ROOM,
    createdBy: 'owner@example.com',
    candidateEmail: '',
    status: 'waiting',
    inviteToken: token,
    integrityEvents: records,
  }
  states = {
    roomId: ROOM,
    code: 'initial code',
    language: 'javascript',
    problemId: PROBLEM,
    notes: '',
    output: null,
    users: [],
    status: 'waiting',
    editorLockedBy: null,
    controlledBy: 'candidate',
    hintsEnabled: true,
    maxHints: 5,
  }
  await redis.setex('room:' + ROOM, 604800, JSON.stringify(states))
  await redis.setex('room:' + OTHER, 604800, JSON.stringify({ ...states, roomId: OTHER }))
  const RoomModel = {
    findOne: vi.fn(async () => room),
    findOneAndUpdate: vi.fn(async (_query, update) => Object.assign(room, update)),
    updateOne: vi.fn(async (_query, update) => {
      if (update.$push) records.push(...update.$push.integrityEvents.$each)
      return { matchedCount: 1 }
    }),
    db: {
      collection: () => ({
        findOne: async () => ({
          _id: PROBLEM,
          title: 'Sum',
          starterCode: { javascript: 'starter' },
          testCases: [
            { input: 'secret', expectedOutput: 'answer', isHidden: true },
            { input: '1', expectedOutput: '2', isHidden: false },
          ],
        }),
      }),
    },
  }
  http = createServer()
  io = new Server(http)
  // Supply verified identities at the authentication boundary; production verifies NextAuth JWTs.
  io.use((socket, next) => {
    const identities: Record<string, string> = {
      owner: 'owner@example.com',
      candidate: 'candidate@example.com',
      stranger: 'stranger@example.com',
    }
    const email = identities[socket.handshake.auth.identity]
    if (!email) {
      next(new Error('Unauthorized'))
      return
    }
    socket.data.user = { id: email, email, name: email, color: '#fff' }
    next()
  })
  controller = registerSocketHandlers(io, {
    redis,
    RoomModel,
    SnapshotModel: {
      create: async (snapshot: any) => {
        snapshots.push(snapshot)
      },
    },
    env: { INVITE_TOKEN_SECRET: SECRET, NEXTAUTH_URL: 'http://localhost:3000' },
  })
  await new Promise<void>((resolve) => http.listen(0, '127.0.0.1', resolve))
  url = 'http://127.0.0.1:' + (http.address() as any).port
})
afterEach(async () => {
  controller.stopAll()
  clients.forEach((client) => client.disconnect())
  await new Promise<void>((resolve) => io.close(() => resolve()))
})

it('derives the role from authenticated ownership and invite claims', async () => {
  const owner = await join('owner')
  const candidate = await join('candidate', room.inviteToken, { role: 'interviewer' })
  expect(owner.state.myRole).toBe('interviewer')
  expect(candidate.state.myRole).toBe('candidate')
  expect(candidate.problem.problem.testCases).toEqual([
    { input: '1', expectedOutput: '2', isHidden: false },
  ])
})
it.each([
  'editor-lock',
  'editor-unlock',
  'take-control',
  'return-control',
  'problem-change',
  'timer-start',
  'interview-end',
])('rejects candidate %s', async (name) => {
  await join('owner')
  const { client } = await join('candidate', room.inviteToken)
  const denied = event(client, 'error')
  client.emit(name, { roomId: ROOM, problemId: PROBLEM, durationMinutes: 5, role: 'interviewer' })
  expect(await denied).toMatchObject({ message: 'Forbidden' })
})
it('rejects cross-room writes even from an interviewer', async () => {
  const { client } = await join('owner')
  const denied = event(client, 'error')
  client.emit('editor-lock', { roomId: OTHER })
  expect(await denied).toMatchObject({ message: 'Forbidden' })
  expect(JSON.parse((await redis.get('room:' + OTHER))!).editorLockedBy).toBeNull()
})
it('honors locking, control and source updates over actual socket connections', async () => {
  const owner = await join('owner')
  const candidate = await join('candidate', room.inviteToken)
  let changed = event(candidate.client, 'editor-locked')
  owner.client.emit('editor-lock', { roomId: ROOM })
  await changed
  const denied = event(candidate.client, 'error')
  candidate.client.emit('code-change', { roomId: ROOM, code: 'forged' })
  await denied
  changed = event(candidate.client, 'control-changed')
  owner.client.emit('take-control', { roomId: ROOM })
  await changed
  changed = event(candidate.client, 'code-update')
  owner.client.emit('code-change', { roomId: ROOM, code: 'interviewer code' })
  expect(await changed).toEqual({ code: 'interviewer code' })
})
it('restores source, problem, timer and lock state after reconnecting', async () => {
  const owner = await join('owner')
  const candidate = await join('candidate', room.inviteToken)
  let synced = event(candidate.client, 'timer-synced')
  owner.client.emit('timer-start', { roomId: ROOM, durationMinutes: 5 })
  const timer = await synced
  synced = event(candidate.client, 'editor-locked')
  owner.client.emit('editor-lock', { roomId: ROOM })
  await synced
  const left = event(owner.client, 'user-left')
  candidate.client.disconnect()
  await left
  const restored = await join('candidate', room.inviteToken)
  expect(restored.state).toMatchObject({
    code: 'initial code',
    problemId: PROBLEM,
    editorLockedBy: owner.client.id,
    timerStartedAt: timer.timerStartedAt,
    timerDurationMs: 300000,
  })
})
it('allows same-identity reconnects and rejects invite reuse by another identity', async () => {
  const owner = await join('owner')
  const candidate = await join('candidate', room.inviteToken)
  const left = event(owner.client, 'user-left')
  candidate.client.disconnect()
  await left
  expect((await join('candidate', room.inviteToken)).state.myRole).toBe('candidate')
  const stranger = clientIO(url, {
    transports: ['websocket'],
    reconnection: false,
    auth: { identity: 'stranger' },
  })
  clients.push(stranger)
  await event(stranger, 'connect')
  const invalid = event(stranger, 'invite-invalid')
  stranger.emit('join-room', { roomId: ROOM, inviteToken: room.inviteToken })
  await invalid
})
it('expires a finished room, saves a final snapshot and revokes its invite', async () => {
  const owner = await join('owner')
  const candidate = await join('candidate', room.inviteToken)
  const ended = event(candidate.client, 'interview-ended')
  owner.client.emit('interview-end', { roomId: ROOM })
  await ended
  expect(await redis.ttl('room:' + ROOM)).toBeGreaterThan(89 * 86400)
  expect(room.status).toBe('ended')
  expect(snapshots.at(-1).trigger).toBe('end')
  expect(Array.from(redis.values.keys()).some((key) => key.startsWith('invite:revoked:'))).toBe(
    true,
  )
})
it('persists optional integrity reports with the verified actor', async () => {
  await join('owner')
  const { client } = await join('candidate', room.inviteToken)
  client.emit('integrity-event', {
    roomId: ROOM,
    event: { type: 'large-paste', size: 500, actor: 'forged', timestamp: 1 },
  })
  await vi.waitFor(() => expect(records).toHaveLength(1))
  expect(records[0]).toMatchObject({
    actor: 'candidate@example.com',
    timestamp: expect.any(Date),
    type: 'large-paste',
  })
})
