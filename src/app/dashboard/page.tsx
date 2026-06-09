'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Play, Brain, Copy, Check, Clock, Lightbulb,
  LayoutDashboard, LogOut, ArrowRight, Calendar, BookOpen,
  Search
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { StatusPill } from '@/components/common/Pill'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonRoom } from '@/components/common/Skeleton'
import { useCommandPalette } from '@/components/palette/CommandPalette'
import { signOut } from 'next-auth/react'

interface RoomSummary {
  _id: string; roomId: string; title: string
  status: 'waiting' | 'active' | 'ended'
  createdAt: string; endedAt?: string
  candidateName?: string; candidateEmail?: string
  description?: string; scheduledAt?: string
  hintsEnabled: boolean; maxHints: number; durationMinutes: number
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatDuration(start: string, end?: string) {
  if (!end) return '—'
  const m = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return `${m} min`
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { open: openPalette } = useCommandPalette()
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all')

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])
  useEffect(() => {
    if (!session) return
    fetch('/api/rooms').then(r => r.json()).then(d => { setRooms(d.rooms || []); setLoading(false) }).catch(() => setLoading(false))
  }, [session])

  const copyInvite = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/invite`)
      const data = await res.json()
      await navigator.clipboard.writeText(data.inviteLink)
      setCopiedId(roomId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.title.toLowerCase().includes(q) || (r.candidateName || '').toLowerCase().includes(q)
    const matchFilter = filter === 'all' || (filter === 'active' && r.status !== 'ended') || (filter === 'ended' && r.status === 'ended')
    return matchSearch && matchFilter
  })

  const displayStatus = (r: RoomSummary): any => {
    if (r.scheduledAt && new Date(r.scheduledAt).getTime() > Date.now() && r.status === 'waiting') return 'scheduled'
    return r.status
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <nav className="h-14 border-b border-border px-6 flex items-center justify-between bg-bg/80 backdrop-blur-xl sticky top-0 z-40">
          <Logo height={20} linked={false} />
        </nav>
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-3">
          <div className="h-8 w-48 skeleton rounded-md mb-6" />
          {[1,2,3].map(i => <SkeletonRoom key={i} />)}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {}
      <nav className="h-14 sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border flex items-center px-6 gap-4">
        <Logo height={20} />
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted flex items-center gap-1.5"><LayoutDashboard size={14} />My interviews</span>
        <div className="flex-1" />
        <button onClick={openPalette} className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-surface border border-border rounded-md text-xs text-subtle hover:text-text transition-colors">
          <Search size={13} /><span>Search</span><kbd className="font-mono bg-surface-2 px-1 rounded text-[10px]">⌘K</kbd>
        </button>
        <ThemeToggle />
        <Link href="/schedule" className="text-sm text-muted hover:text-text flex items-center gap-1.5 transition-colors">
          <Calendar size={14} />
          <span className="hidden sm:inline">Schedule</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: (session?.user as any)?.color || 'var(--accent)' }}>
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
        <button onClick={() => signOut()} className="text-sm text-muted hover:text-text flex items-center gap-1 transition-colors">
          <LogOut size={14} />
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {}
        <div className="flex items-end justify-between mb-6 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-semibold text-text tracking-tight">Interviews</h1>
            <p className="text-sm text-muted mt-1">
              {rooms.length} total · {rooms.filter(r => r.status === 'active').length} active
            </p>
          </div>
          <Link href="/">
            <Button variant="primary" icon={<Plus size={15} />}>New interview</Button>
          </Link>
        </div>

        {}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search interviews…"
              className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-md text-sm text-text placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex bg-surface-2 border border-border rounded-md p-0.5 gap-0.5">
            {(['all','active','ended'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 h-7 text-xs rounded-[5px] capitalize transition-colors ${filter === f ? 'bg-bg text-text shadow-sm font-medium' : 'text-muted hover:text-text'}`}
              >{f}</button>
            ))}
          </div>
        </div>

        {}
        {filtered.length === 0 ? (
          rooms.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No interviews yet"
              description="Create your first interview room to get started."
              action={{ label: 'Create room', onClick: () => router.push('/'), icon: <Plus size={14} /> }}
            />
          ) : (
            <div className="text-center py-16 text-sm text-muted">No interviews match your search.</div>
          )
        ) : (
          <div className="space-y-2">
            {filtered.map(room => (
              <div
                key={room._id}
                className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:border-border-strong hover:shadow-sm transition-all duration-[120ms]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-text text-sm truncate">{room.title}</h3>
                    <StatusPill status={displayStatus(room)} />
                  </div>
                  {room.candidateName && (
                    <p className="text-xs text-muted mb-1.5 font-medium">{room.candidateName}{room.candidateEmail ? ` · ${room.candidateEmail}` : ''}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-subtle flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {room.scheduledAt ? `Scheduled: ${formatDateTime(room.scheduledAt)}` : formatDate(room.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {room.status === 'ended' ? formatDuration(room.createdAt, room.endedAt) : `${room.durationMinutes} min planned`}
                    </span>
                    {room.hintsEnabled && (
                      <span className="flex items-center gap-1 text-warning"><Lightbulb size={11} />Hints: {room.maxHints}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {room.status !== 'ended' && (
                    <Button variant="ghost" size="sm" onClick={() => copyInvite(room.roomId)}
                      icon={copiedId === room.roomId ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    >
                      {copiedId === room.roomId ? 'Copied' : 'Copy invite'}
                    </Button>
                  )}
                  {room.status !== 'ended' && (
                    <Link href={`/room/${room.roomId}`}>
                      <Button variant="secondary" size="sm" icon={<ArrowRight size={11} />}>Enter room</Button>
                    </Link>
                  )}
                  {room.status === 'ended' && (
                    <Link href={`/room/${room.roomId}/replay`}>
                      <Button variant="ghost" size="sm" icon={<Play size={11} />}>View replay</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
