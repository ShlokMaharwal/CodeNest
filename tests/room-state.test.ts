import { expect, it } from 'vitest'
import { roomTTL, restoreRoomState, createRoomQueue, ENDED_TTL } from '../server/room-state'
it('restores code, timer, problem and control while rebinding the interviewer lock', () => {
  const state = {
    code: 'solution',
    timerStartedAt: 123,
    timerDurationMs: 60000,
    problemId: 'problem',
    controlledBy: 'interviewer',
    editorLockedBy: 'old-socket',
  }
  expect(restoreRoomState(state, 'interviewer', 'new-socket')).toEqual({
    ...state,
    editorLockedBy: 'new-socket',
  })
  expect(restoreRoomState(state, 'candidate', 'candidate-socket')).toEqual(state)
})
it('keeps scheduled expiry and never extends a finished room on reconnect', () => {
  expect(roomTTL({ status: 'waiting' }, 1000000)).toBe(1000000)
  expect(roomTTL({ status: 'ended', endedAtMs: 1000 }, 0, 2000)).toBe(ENDED_TTL - 1)
})
it('serializes room writes and recovers after a rejected task', async () => {
  const queue = createRoomQueue()
  const values: number[] = []
  await Promise.all([
    queue.run('room', async () => {
      await Promise.resolve()
      values.push(1)
    }),
    queue.run('room', async () => {
      values.push(2)
    }),
  ])
  expect(values).toEqual([1, 2])
  await expect(
    queue.run('room', async () => {
      throw new Error('failure')
    }),
  ).rejects.toThrow('failure')
  await queue.run('room', async () => {
    values.push(3)
  })
  expect(values).toEqual([1, 2, 3])
})
