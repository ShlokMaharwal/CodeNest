import { z } from 'zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
const m = vi.hoisted(() => ({
  session: null as any,
  limited: null as any,
  room: {} as any,
  state: {} as any,
  connect: vi.fn(),
  setJSON: vi.fn(),
  getJSON: vi.fn(),
  increment: vi.fn(),
  redis: { eval: vi.fn(), setex: vi.fn(), hget: vi.fn(), get: vi.fn(), ping: vi.fn() },
  rooms: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
  },
  problems: { find: vi.fn(), findById: vi.fn(), countDocuments: vi.fn() },
  snapshots: { find: vi.fn(), findOneAndUpdate: vi.fn() },
  users: { findOne: vi.fn(), create: vi.fn() },
  execute: vi.fn(),
  gemini: vi.fn(),
  hintPrompt: vi.fn(),
  review: vi.fn(),
  verifyInvite: vi.fn(),
  signInvite: vi.fn(),
  grade: vi.fn(),
}))
vi.mock('next-auth', () => ({ getServerSession: vi.fn(async () => m.session) }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))
vi.mock('@/lib/mongodb', () => ({ connectDB: m.connect }))
vi.mock('@/lib/redis', () => ({
  redis: m.redis,
  getJSON: m.getJSON,
  setJSON: m.setJSON,
  incrementWithTTL: m.increment,
}))
vi.mock('@/lib/rate-limit', () => ({ limitRequest: vi.fn(async () => m.limited) }))
vi.mock('@/lib/models/Room', () => ({ RoomModel: m.rooms }))
vi.mock('@/lib/models/Problem', () => ({ ProblemModel: m.problems }))
vi.mock('@/lib/models/Snapshot', () => ({ SnapshotModel: m.snapshots }))
vi.mock('@/lib/models/User', () => ({ UserModel: m.users }))
vi.mock('@/lib/wandbox', () => ({ executeCode: m.execute }))
vi.mock('@/lib/gemini', () => ({
  callGemini: m.gemini,
  buildHintPrompt: m.hintPrompt,
  generateReview: m.review,
}))
vi.mock('@/lib/invite', () => ({
  signInviteToken: m.signInvite,
  verifyInviteToken: m.verifyInvite,
}))
vi.mock('@/lib/grading', () => ({ gradeSolution: m.grade }))
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn(async () => 'test-password-hash') } }))
import * as rooms from '@/app/api/rooms/route'
import * as room from '@/app/api/rooms/[roomId]/route'
import * as invite from '@/app/api/rooms/[roomId]/invite/route'
import * as problems from '@/app/api/problems/route'
import * as problem from '@/app/api/problems/[id]/route'
import * as execute from '@/app/api/execute/route'
import * as hint from '@/app/api/ai/hint/route'
import * as review from '@/app/api/ai/review/route'
import * as register from '@/app/api/auth/register/route'
import * as grade from '@/app/api/problems/[id]/grade/route'

const ROOM = 'abcd1234',
  ID = 'a'.repeat(24)
const context = () => ({ params: Promise.resolve({ roomId: ROOM }) })
const problemContext = (id = ID) => ({ params: Promise.resolve({ id }) })
function request(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') {
  return new NextRequest(
    'http://localhost:3000/api/' + path,
    body === undefined
      ? { method }
      : { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) },
  )
}
function query(value: any) {
  const result: any = {
    select: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    lean: vi.fn(async () => value),
    then: (resolve: any, reject: any) => Promise.resolve(value).then(resolve, reject),
  }
  for (const key of ['select', 'sort', 'skip', 'limit']) result[key].mockReturnValue(result)
  return result
}
beforeEach(() => {
  vi.resetAllMocks()
  m.session = { user: { email: 'owner@example.com' } }
  m.limited = null
  m.room = {
    roomId: ROOM,
    title: 'Interview',
    createdBy: 'owner@example.com',
    candidateEmail: 'candidate@example.com',
    inviteToken: 'signed-token',
    status: 'active',
    hintsEnabled: true,
    maxHints: 2,
    integrityEvents: [],
  }
  m.state = {
    roomId: ROOM,
    code: 'stored code',
    language: 'javascript',
    users: [{ email: 'candidate@example.com', role: 'candidate' }],
  }
  m.rooms.find.mockImplementation(() => query([m.room]))
  m.rooms.findOne.mockImplementation(() => query(m.room))
  m.rooms.create.mockResolvedValue(m.room)
  m.rooms.findOneAndUpdate.mockImplementation(() => query(m.room))
  m.rooms.updateOne.mockResolvedValue({ matchedCount: 1 })
  m.rooms.deleteOne.mockResolvedValue({ deletedCount: 1 })
  m.problems.find.mockImplementation(() => query([]))
  m.problems.countDocuments.mockResolvedValue(0)
  m.problems.findById.mockImplementation(() => query(null))
  m.snapshots.find.mockImplementation(() => query([]))
  m.getJSON.mockImplementation(async () => m.state)
  m.increment.mockResolvedValue(1)
  m.redis.eval.mockResolvedValue(1)
  m.signInvite.mockReturnValue('signed-token')
  m.verifyInvite.mockReturnValue({ roomId: ROOM })
  m.execute.mockResolvedValue({
    stdout: '42',
    stderr: null,
    status: 'Accepted',
    time: '1 ms',
    memory: 0,
  })
  m.hintPrompt.mockImplementation((value) => JSON.stringify(value))
  m.gemini.mockResolvedValue('Consider a map')
  m.review.mockResolvedValue({
    review: '**Correctness**: Good',
    structured: { correctness: 'Good' },
  })
  m.users.findOne.mockResolvedValue(null)
  m.users.create.mockResolvedValue({ _id: 'user-id', name: 'User', email: 'new@example.com' })
  m.grade.mockResolvedValue({
    passed: 1,
    total: 1,
    results: [{ index: 1, hidden: true, passed: true }],
  })
})

describe('room API', () => {
  it('creates a room with a server invite and persistent initial state', async () => {
    const response = await rooms.POST(request('rooms', { title: 'Interview', maxHints: 2 }))
    expect(response.status).toBe(201)
    expect(m.rooms.create).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'owner@example.com', maxHints: 2 }),
    )
    expect(m.setJSON).toHaveBeenCalledWith(
      expect.stringMatching(/^room:/),
      expect.objectContaining({ code: '', users: [] }),
      expect.any(Number),
    )
  })
  it('lists only the authenticated creator rooms', async () => {
    expect((await rooms.GET(request('rooms'))).status).toBe(200)
    expect(m.rooms.find).toHaveBeenCalledWith({ createdBy: 'owner@example.com' })
  })
  it('rejects invalid room settings before persistence', async () => {
    expect((await rooms.POST(request('rooms', { durationMinutes: -1 }))).status).toBe(400)
    expect(m.rooms.create).not.toHaveBeenCalled()
  })
  it('rejects anonymous reads and writes', async () => {
    m.session = null
    expect((await rooms.GET(request('rooms'))).status).toBe(401)
    expect((await rooms.POST(request('rooms', {}))).status).toBe(401)
    expect((await room.GET(request('rooms/' + ROOM), context())).status).toBe(401)
  })
  it('applies Redis-backed request limits', async () => {
    m.limited = NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    expect((await rooms.POST(request('rooms', {}))).status).toBe(429)
    expect(m.rooms.create).not.toHaveBeenCalled()
  })
  it('keeps room details private and hides invite credentials', async () => {
    let response = await room.GET(request('rooms/' + ROOM + '?snapshots=true'), context())
    expect(response.status).toBe(200)
    expect((await response.json()).room.inviteToken).toBeUndefined()
    m.session = { user: { email: 'stranger@example.com' } }
    response = await room.GET(request('rooms/' + ROOM), context())
    expect(response.status).toBe(403)
  })
  it('returns 404 for missing rooms', async () => {
    m.rooms.findOne.mockReturnValue(query(null))
    expect((await room.GET(request('rooms/' + ROOM), context())).status).toBe(404)
  })
  it('permits a creator update and rejects candidate settings changes', async () => {
    expect(
      (await room.PATCH(request('rooms/' + ROOM, { maxHints: 3 }, 'PATCH'), context())).status,
    ).toBe(200)
    expect(m.rooms.findOneAndUpdate).toHaveBeenCalledWith(
      { roomId: ROOM },
      { $set: { maxHints: 3 } },
      { new: true },
    )
    m.session = { user: { email: 'candidate@example.com' } }
    expect(
      (await room.PATCH(request('rooms/' + ROOM, { title: 'forged' }, 'PATCH'), context())).status,
    ).toBe(403)
  })
  it('accepts optional integrity reports from the verified candidate', async () => {
    m.session = { user: { email: 'candidate@example.com' } }
    const response = await room.PATCH(
      request(
        'rooms/' + ROOM,
        { integrityEvents: [{ type: 'tab-switch', timestamp: 1 }] },
        'PATCH',
      ),
      context(),
    )
    expect(response.status).toBe(200)
    expect(m.rooms.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $push: {
          integrityEvents: expect.objectContaining({
            $each: [
              expect.objectContaining({
                actor: 'candidate@example.com',
                timestamp: expect.any(Date),
              }),
            ],
          }),
        },
      }),
    )
  })
  it('prevents deletion of active rooms and allows ended-room cleanup', async () => {
    expect(
      (await room.DELETE(request('rooms/' + ROOM, undefined, 'DELETE'), context())).status,
    ).toBe(400)
    m.room.status = 'ended'
    expect(
      (await room.DELETE(request('rooms/' + ROOM, undefined, 'DELETE'), context())).status,
    ).toBe(200)
    expect(m.rooms.deleteOne).toHaveBeenCalledWith({ roomId: ROOM })
  })
  it('returns the creator invite without exposing another room', async () => {
    expect((await invite.GET(request('rooms/' + ROOM + '/invite'), context())).status).toBe(200)
    expect(m.rooms.findOne).toHaveBeenCalledWith({ roomId: ROOM, createdBy: 'owner@example.com' })
  })
  it('reports persistence failures without exposing internal details', async () => {
    m.rooms.find.mockImplementation(() => {
      throw new Error('private database string')
    })
    const response = await rooms.GET(request('rooms'))
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain('private database string')
  })
})

describe('problem API', () => {
  it('paginates and escapes regular-expression metacharacters', async () => {
    const response = await problems.GET(request('problems?search=a.*&page=2'))
    expect(response.status).toBe(200)
    expect(m.problems.find.mock.calls[0][0].$or[0].title.$regex).toBe('a\\.\\*')
    expect((await response.json()).page).toBe(2)
  })
  it.each(['page=-1', 'page=abc', 'difficulty=Impossible'])(
    'rejects invalid query %s',
    async (query) => {
      expect((await problems.GET(request('problems?' + query))).status).toBe(400)
    },
  )
  it('filters hidden cases from public problem data', async () => {
    m.problems.findById.mockReturnValue(
      query({
        title: 'Sum',
        testCases: [
          { input: 'public', isHidden: false },
          { input: 'secret', isHidden: true },
        ],
      }),
    )
    const response = await problem.GET(request('problems/' + ID), problemContext())
    expect((await response.json()).problem.testCases).toEqual([
      { input: 'public', isHidden: false },
    ])
  })
  it('validates identifiers and returns missing-resource errors', async () => {
    expect((await problem.GET(request('problems/bad'), problemContext('bad'))).status).toBe(400)
    expect((await problem.GET(request('problems/' + ID), problemContext())).status).toBe(404)
  })
  it('runs backend grading for an authenticated solution', async () => {
    m.problems.findById.mockReturnValue(
      query({ testCases: [{ input: '1', expectedOutput: '2', isHidden: true }] }),
    )
    const response = await grade.POST(
      request('problems/' + ID + '/grade', { code: 'x', language: 'python' }),
      problemContext(),
    )
    expect(response.status).toBe(200)
    expect((await response.json()).passed).toBe(1)
  })
})

describe('execution and AI API', () => {
  it('preserves the execution result envelope', async () => {
    const response = await execute.POST(
      request('execute', { code: 'print(42)', language: 'python' }),
    )
    expect(await response.json()).toMatchObject({ result: { stdout: '42', status: 'Accepted' } })
  })
  it('rejects unsupported languages and enforces execution request rates', async () => {
    expect((await execute.POST(request('execute', { code: 'x', language: 'shell' }))).status).toBe(
      400,
    )
    m.increment.mockResolvedValue(31)
    expect((await execute.POST(request('execute', { code: 'x', language: 'python' }))).status).toBe(
      429,
    )
  })
  it('ignores candidate hint counters and uses stored room code', async () => {
    m.session = { user: { email: 'candidate@example.com' } }
    const response = await hint.POST(
      request('ai/hint', { roomId: ROOM, code: 'forged', hintsUsed: -100, maxHints: 999 }),
    )
    expect(response.status).toBe(200)
    expect(m.hintPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'stored code', hintsUsed: 0 }),
    )
    expect(m.redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'room:' + ROOM + ':hints',
      'candidate@example.com',
      2,
      0,
    )
  })
  it('restricts hint access to the assigned active candidate', async () => {
    expect((await hint.POST(request('ai/hint', { roomId: ROOM }))).status).toBe(403)
    m.session = { user: { email: 'candidate@example.com' } }
    m.room.hintsEnabled = false
    expect((await hint.POST(request('ai/hint', { roomId: ROOM }))).status).toBe(403)
  })
  it('stops exhausted hints before calling AI and degrades on provider failure', async () => {
    m.session = { user: { email: 'candidate@example.com' } }
    m.redis.eval.mockResolvedValueOnce(-1)
    expect((await hint.POST(request('ai/hint', { roomId: ROOM }))).status).toBe(429)
    expect(m.gemini).not.toHaveBeenCalled()
    m.gemini.mockRejectedValue(new Error('provider offline'))
    expect((await hint.POST(request('ai/hint', { roomId: ROOM }))).status).toBe(503)
  })
  it('saves a validated review on the room and keeps its markdown envelope', async () => {
    const response = await review.POST(request('ai/review', { roomId: ROOM }))
    expect(response.status).toBe(200)
    expect((await response.json()).review).toContain('**Correctness**')
    expect(m.rooms.updateOne).toHaveBeenCalledWith(
      { roomId: ROOM },
      { $set: expect.objectContaining({ aiReviewData: { correctness: 'Good' } }) },
    )
  })
  it('treats invalid model output as a provider failure rather than a bad user request', async () => {
    m.review.mockRejectedValue(new z.ZodError([]))
    expect((await review.POST(request('ai/review', { roomId: ROOM }))).status).toBe(503)
  })
  it('restricts reviews to the interviewer and handles AI downtime', async () => {
    m.session = { user: { email: 'candidate@example.com' } }
    expect((await review.POST(request('ai/review', { roomId: ROOM }))).status).toBe(403)
    m.session = { user: { email: 'owner@example.com' } }
    m.review.mockRejectedValue(new Error('offline'))
    expect((await review.POST(request('ai/review', { roomId: ROOM }))).status).toBe(503)
  })
})

describe('registration', () => {
  it('normalizes account input and returns a public user', async () => {
    const response = await register.POST(
      request('auth/register', {
        name: ' User ',
        email: 'NEW@EXAMPLE.COM',
        password: 'password123',
      }),
    )
    expect(response.status).toBe(201)
    expect(m.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'User',
        email: 'new@example.com',
        password: 'test-password-hash',
      }),
    )
    expect(JSON.stringify(await response.json())).not.toContain('hash')
  })
  it('rejects invalid and duplicate accounts', async () => {
    expect(
      (
        await register.POST(
          request('auth/register', { name: 'User', email: 'bad', password: 'short' }),
        )
      ).status,
    ).toBe(400)
    m.users.findOne.mockResolvedValue({ email: 'new@example.com' })
    expect(
      (
        await register.POST(
          request('auth/register', {
            name: 'User',
            email: 'new@example.com',
            password: 'password123',
          }),
        )
      ).status,
    ).toBe(409)
  })
})
