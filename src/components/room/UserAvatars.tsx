'use client'
import { Crown, User } from 'lucide-react'
import { ActiveUser } from '@/types'
import { hashColor } from '@/components/common/Avatar'
import { useState } from 'react'

interface UserAvatarsProps {
  users: ActiveUser[]
  currentUserId?: string
}

export function UserAvatars({ users, currentUserId }: UserAvatarsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const MAX_VISIBLE = 3
  const visible  = users.slice(0, MAX_VISIBLE)
  const overflow = users.length - MAX_VISIBLE

  return (
    <div className="flex items-center" aria-label={`${users.length} user${users.length !== 1 ? 's' : ''} in session`}>
      {visible.map((user, i) => (
        <div
          key={user.socketId}
          className="relative group"
          style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: visible.length - i }}
          onMouseEnter={() => setHoveredId(user.socketId)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white ring-2 ring-bg cursor-default transition-transform hover:scale-110"
            style={{ backgroundColor: user.color || hashColor(user.name) }}
          >
            {user.name?.[0]?.toUpperCase()}
          </div>

          {}
          {hoveredId === user.socketId && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-text text-bg rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md pointer-events-none z-50">
              <div className="flex items-center gap-1.5 font-medium">
                {user.role === 'interviewer' ? <Crown size={10} /> : <User size={10} />}
                {user.name}
                {user.socketId === currentUserId && <span className="text-accent font-normal">(you)</span>}
              </div>
              <div className="text-[10px] opacity-70 mt-0.5 capitalize">{user.role}</div>
            </div>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px] font-semibold text-muted ring-2 ring-bg" style={{ marginLeft: '-8px' }}>
          +{overflow}
        </div>
      )}
    </div>
  )
}
