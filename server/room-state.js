const ACTIVE_TTL = 7 * 24 * 60 * 60
const ENDED_TTL = 90 * 24 * 60 * 60
function roomTTL(state, existingTTL, now = Date.now()) {
  if (state.status === 'ended')
    return Math.max(1, Math.ceil(((state.endedAtMs || now) + ENDED_TTL * 1000 - now) / 1000))
  return existingTTL > 0 ? existingTTL : ACTIVE_TTL
}
function restoreRoomState(state, role, socketId) {
  return {
    ...state,
    editorLockedBy:
      role === 'interviewer' && state.editorLockedBy ? socketId : state.editorLockedBy,
  }
}
function createRoomQueue() {
  const pending = new Map()
  return {
    run(roomId, task) {
      const result = (pending.get(roomId) || Promise.resolve()).catch(() => {}).then(task)
      pending.set(roomId, result)
      const clear = () => {
        if (pending.get(roomId) === result) pending.delete(roomId)
      }
      result.then(clear, clear)
      return result
    },
  }
}
module.exports = { roomTTL, restoreRoomState, createRoomQueue, ENDED_TTL }
