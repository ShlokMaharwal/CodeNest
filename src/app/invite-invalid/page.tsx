'use client'
import Link from 'next/link'
import { Link2Off, ArrowLeft } from 'lucide-react'

export default function InviteInvalidPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-danger-soft border border-danger/20 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Link2Off className="text-danger" size={24} />
        </div>
        <h1 className="text-2xl font-semibold text-text mb-3 tracking-tight">Invalid invite link</h1>
        <p className="text-muted text-sm leading-relaxed mb-2">
          This invite link is invalid or has expired.
        </p>
        <p className="text-subtle text-xs leading-relaxed mb-8">
          Invite links are valid for 24 hours. Ask the interviewer to share a fresh link from their dashboard.
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
