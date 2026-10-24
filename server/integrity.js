const { z } = require('zod')
const integrityEventSchema = z.object({
  type: z.enum(['tab-switch', 'large-paste']),
  size: z.number().int().min(0).max(100000).optional(),
})
const integrityBatchSchema = z.array(integrityEventSchema).min(1).max(20)
function normalizeIntegrityEvents(events, actor, now = new Date()) {
  return integrityBatchSchema.parse(events).map((event) => ({ ...event, actor, timestamp: now }))
}
async function recordIntegrity(RoomModel, roomId, actor, events) {
  const normalized = normalizeIntegrityEvents(events, actor)
  const result = await RoomModel.updateOne(
    { roomId, status: { $ne: 'ended' }, $or: [{ createdBy: actor }, { candidateEmail: actor }] },
    {
      $push: { integrityEvents: { $each: normalized, $slice: -1000 } },
    },
  )
  if (!result.matchedCount) throw new Error('Room unavailable or unauthorized')
  return normalized
}
module.exports = {
  integrityEventSchema,
  integrityBatchSchema,
  normalizeIntegrityEvents,
  recordIntegrity,
}
