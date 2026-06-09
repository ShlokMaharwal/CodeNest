'use client'
import Link from 'next/link'
import { Users, ArrowLeft } from 'lucide-react'

export default function RoomFullPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-accent-soft border border-accent/20 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Users className="text-accent" size={24} />
        </div>
        <h1 className="text-2xl font-semibold text-text mb-3 tracking-tight">Room is full</h1>
        <p className="text-muted text-sm leading-relaxed mb-2">
          This interview room already has 2 participants.
        </p>
        <p className="text-subtle text-xs leading-relaxed mb-8">
          Each room supports exactly one interviewer and one candidate. The session is currently in progress.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-[#1a2a0e] px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          <ArrowLeft size={15} />Back to home
        </Link>
      </div>
    </div>
  )
}
