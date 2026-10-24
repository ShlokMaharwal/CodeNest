import { describe, expect, it } from 'vitest'
import { authorizeEvent, interviewerEvents } from '../server/socket-policy'

function fixture(role = 'candidate') {
  const socket = {
    id: 'socket',
    rooms: new Set(['abcd1234']),
    data: { roomId: 'abcd1234', role, user: { email: 'candidate@example.com' } },
  }
  const state = {
    status: 'active',
    controlledBy: 'candidate',
    editorLockedBy: null,
    users: [{ socketId: socket.id, role, email: socket.data.user.email }],
  }
  return { socket, state }
}
describe('socket authorization', () => {
  it.each(Array.from(interviewerEvents))('restricts %s to the room interviewer', (event) => {
    const candidate = fixture()
    expect(authorizeEvent(candidate.socket, event, { roomId: 'abcd1234' }, candidate.state)).toBe(
      false,
    )
    const interviewer = fixture('interviewer')
    expect(
      authorizeEvent(interviewer.socket, event, { roomId: 'abcd1234' }, interviewer.state),
    ).toBe(true)
  })
  it('rejects cross-room, stale membership and spoofed payload roles', () => {
    const { socket, state } = fixture()
    expect(authorizeEvent(socket, 'notes-change', { roomId: 'other123' }, state)).toBe(false)
    expect(
      authorizeEvent(socket, 'interview-end', { roomId: 'abcd1234', role: 'interviewer' }, state),
    ).toBe(false)
    state.users = []
    expect(authorizeEvent(socket, 'code-change', { roomId: 'abcd1234', code: 'x' }, state)).toBe(
      false,
    )
  })
  it('honors editing locks and control', () => {
    const { socket, state } = fixture()
    expect(authorizeEvent(socket, 'code-change', { roomId: 'abcd1234', code: 'x' }, state)).toBe(
      true,
    )
    state.controlledBy = 'interviewer'
    expect(authorizeEvent(socket, 'code-change', { roomId: 'abcd1234', code: 'x' }, state)).toBe(
      false,
    )
  })
  it('rejects updates after the interview ends', () => {
    const { socket, state } = fixture('interviewer')
    state.status = 'ended'
    expect(authorizeEvent(socket, 'timer-start', { roomId: 'abcd1234' }, state)).toBe(false)
  })
})
