'use client'
import { ActiveUser } from '@/types'

interface UsersPanelProps {
  users: ActiveUser[]
  currentUser: any
}

export function UsersPanel({ users, currentUser }: UsersPanelProps) {
  return (
    <div className="flex items-center gap-1.5">
      {users.length > 0 && (
        <span className="text-xs text-muted mr-1 hidden sm:block">
          {users.length} online
        </span>
      )}
      <div className="flex -space-x-2">
        {users.slice(0, 4).map((user) => (
          <div
            key={user.id}
            title={user.name}
            className="w-7 h-7 rounded-full border-2 border-bg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: user.color }}
          >
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        ))}
        {users.length > 4 && (
          <div className="w-7 h-7 rounded-full border-2 border-bg bg-surface flex items-center justify-center text-xs text-muted flex-shrink-0">
            +{users.length - 4}
          </div>
        )}
      </div>
    </div>
  )
}
