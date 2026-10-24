import { expect, it, vi } from 'vitest'
import { getCandidateHints, reserveHint, releaseHint, saveHint } from '../server/hints'
import { registerSocketHandlers } from '../server/socket-handlers'
it('reserves a server hint slot and releases it on provider failure', async () => {
  const redis = {
    eval: vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(-1).mockResolvedValue(0),
  }
  expect(await reserveHint(redis, 'abcd1234', 'a@example.com', 1)).toBe(1)
  expect(await reserveHint(redis, 'abcd1234', 'a@example.com', 1)).toBe(-1)
  await releaseHint(redis, 'abcd1234', 'a@example.com')
  await saveHint(redis, 'abcd1234', 'a@example.com', 'A real hint')
  expect(redis.eval).toHaveBeenCalledTimes(4)
})
it('restores server counts and texts with a legacy state fallback', async () => {
  const redis = { hget: vi.fn().mockResolvedValueOnce('2').mockResolvedValueOnce('["hint"]') }
  expect(await getCandidateHints(redis, 'abcd1234', 'a@example.com')).toEqual({
    count: 2,
    texts: ['hint'],
  })
  redis.hget.mockResolvedValue(null)
  expect(
    await getCandidateHints(redis, 'abcd1234', 'a@example.com', {
      hintsPerCandidate: { 'a@example.com': 1 },
    }),
  ).toMatchObject({ count: 1 })
})
it('ignores forged hint-used payloads and only synchronizes authoritative values', async () => {
  const handlers: Record<string, (payload: unknown) => Promise<void>> = {}
  const user = { email: 'a@example.com' }
  const state = {
    status: 'active',
    users: [{ socketId: 'socket', email: user.email, role: 'candidate' }],
  }
  const redis = {
    get: vi.fn().mockResolvedValue(JSON.stringify(state)),
    hget: vi.fn().mockResolvedValueOnce('1').mockResolvedValueOnce('["real"]'),
    eval: vi.fn(),
  }
  const socket = {
    id: 'socket',
    rooms: new Set(['abcd1234']),
    data: { user, roomId: 'abcd1234', role: 'candidate' },
    on: (event: string, handler: (typeof handlers)[string]) => {
      handlers[event] = handler
    },
    emit: vi.fn(),
  }
  const io = { on: (_event: string, connect: (socket: unknown) => void) => connect(socket) }
  registerSocketHandlers(io, { redis, env: {}, RoomModel: {}, SnapshotModel: {} })
  await handlers['hint-used']({ roomId: 'abcd1234', hintText: 'forged', hintsUsed: 0 })
  expect(redis.eval).not.toHaveBeenCalled()
  expect(socket.emit).toHaveBeenCalledWith('hint-count-update', { hintsUsed: 1 })
  expect(socket.emit).toHaveBeenCalledWith('hints-text-update', { hints: ['real'] })
})
