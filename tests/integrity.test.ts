import { expect, it, vi } from 'vitest'
import { normalizeIntegrityEvents, recordIntegrity } from '../server/integrity'
it('uses the verified actor and server timestamp, stripping client claims', () => {
  const now = new Date('2026-10-24T00:00:00Z')
  expect(
    normalizeIntegrityEvents(
      [{ type: 'large-paste', size: 500, actor: 'forged', timestamp: 1 }],
      'verified@example.com',
      now,
    ),
  ).toEqual([{ type: 'large-paste', size: 500, actor: 'verified@example.com', timestamp: now }])
})
it('rejects unknown events and excessive batches', () => {
  expect(() => normalizeIntegrityEvents([{ type: 'keystroke' }], 'user')).toThrow()
  expect(() => normalizeIntegrityEvents(Array(21).fill({ type: 'tab-switch' }), 'user')).toThrow()
})
it('stores bounded history only for a room member in an unfinished room', async () => {
  const RoomModel = {
    updateOne: vi
      .fn()
      .mockResolvedValueOnce({ matchedCount: 1 })
      .mockResolvedValueOnce({ matchedCount: 0 }),
  }
  await recordIntegrity(RoomModel, 'abcd1234', 'user', [{ type: 'tab-switch' }])
  expect(RoomModel.updateOne).toHaveBeenCalledWith(
    expect.objectContaining({ status: { $ne: 'ended' } }),
    expect.objectContaining({
      $push: { integrityEvents: expect.objectContaining({ $slice: -1000 }) },
    }),
  )
  await expect(
    recordIntegrity(RoomModel, 'abcd1234', 'stranger', [{ type: 'tab-switch' }]),
  ).rejects.toThrow('unauthorized')
})
