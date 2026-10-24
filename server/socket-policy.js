const interviewerEvents = new Set([
  'editor-lock',
  'editor-unlock',
  'take-control',
  'return-control',
  'problem-change',
  'timer-start',
  'interview-end',
])

function authorizeEvent(socket, event, payload, state) {
  const { roomId, role, user } = socket.data
  if (!state || state.status === 'ended' || payload.roomId !== roomId || !socket.rooms.has(roomId))
    return false
  if (!['interviewer', 'candidate'].includes(role) || !user?.email) return false
  if (
    !state.users?.some(
      (member) =>
        member.socketId === socket.id && member.email === user.email && member.role === role,
    )
  )
    return false
  if (interviewerEvents.has(event) && role !== 'interviewer') return false
  if (event === 'code-change') {
    if (typeof payload.code !== 'string') return false
    if (role === 'interviewer') return state.controlledBy === 'interviewer'
    return !state.editorLockedBy && state.controlledBy !== 'interviewer'
  }
  return true
}

module.exports = { authorizeEvent, interviewerEvents }
