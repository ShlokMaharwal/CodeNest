'use client'
import { StopCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface EndedBannerProps {
  roomId: string
  endedAt?: Date | string
}

function timeAgo(date?: Date | string): string {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function EndedBanner({ roomId, endedAt }: EndedBannerProps) {
  return (
    <div className="bg-danger-soft border-b border-danger/30 px-4 py-2 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2 text-danger text-sm">
        <StopCircle size={14} />
        <span>Interview ended{endedAt ? ` ${timeAgo(endedAt)}` : ''}</span>
      </div>
      <Link
        href={`/room/${roomId}/replay`}
        className="flex items-center gap-1.5 text-xs text-danger hover:text-danger/80 font-medium transition-colors"
      >
        View replay <ExternalLink size={12} />
      </Link>
    </div>
  )
}
