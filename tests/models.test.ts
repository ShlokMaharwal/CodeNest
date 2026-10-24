import { expect, it } from 'vitest'
import { ProblemModel } from '@/lib/models/Problem'
import { RoomModel } from '@/lib/models/Room'
import { UserModel } from '@/lib/models/User'
import { SnapshotModel } from '@/lib/models/Snapshot'
import { problems } from '../scripts/problem-data'
it('validates every seeded problem with the actual Mongoose schema', () => {
  for (const data of problems)
    expect(new ProblemModel(data).validateSync(), data.title).toBeUndefined()
})
it('supports empty stdin and expected output in a graded case', () => {
  const model = new ProblemModel({
    ...problems[0],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
  })
  expect(model.validateSync()).toBeUndefined()
})
it('requires room identity and expiry, and indexes expiry for deletion', () => {
  const room = new RoomModel({
    roomId: 'abcd1234',
    createdBy: 'owner@example.com',
    inviteToken: 'token',
    expiresAt: new Date(Date.now() + 1000),
  })
  expect(room.validateSync()).toBeUndefined()
  expect(room.status).toBe('waiting')
  expect(RoomModel.schema.indexes()).toEqual(
    expect.arrayContaining([
      [{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })],
    ]),
  )
  expect(new RoomModel({}).validateSync()).toBeDefined()
})
it('stores room reviews and timestamped integrity events', () => {
  const room = new RoomModel({
    roomId: 'abcd1234',
    createdBy: 'owner@example.com',
    inviteToken: 'token',
    expiresAt: new Date(),
    aiReview: 'Review',
    aiReviewData: { correctness: 'Good' },
    integrityEvents: [
      { type: 'tab-switch', actor: 'candidate@example.com', timestamp: new Date() },
    ],
  })
  expect(room.validateSync()).toBeUndefined()
  expect(room.aiReview).toBe('Review')
  expect(room.integrityEvents).toHaveLength(1)
})
it('validates user and snapshot defaults without a database connection', () => {
  const user = new UserModel({
    name: 'Candidate',
    email: 'candidate@example.com',
    password: 'hashed-value',
  })
  expect(user.validateSync()).toBeUndefined()
  expect(user.color).toBeTruthy()
  const snapshot = new SnapshotModel({ roomId: 'abcd1234', code: 'x' })
  expect(snapshot.validateSync()).toBeUndefined()
  expect(snapshot.hintsUsed).toBe(0)
  expect(new SnapshotModel({}).validateSync()).toBeDefined()
})
