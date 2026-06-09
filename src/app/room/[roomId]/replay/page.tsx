'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { Snapshot } from '@/types'
import {
  SkipBack, SkipForward, Play, Pause, Clock,
  CheckCircle2, XCircle, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function formatRelative(baseTime: string, timestamp: string): string {
  const ms = new Date(timestamp).getTime() - new Date(baseTime).getTime()
  if (ms < 0) return '0:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ReplayPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string

  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [roomInfo, setRoomInfo] = useState<any>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch(`/api/rooms/${roomId}?snapshots=true`)
      .then((r) => r.json())
      .then((data) => {
        setRoomInfo(data.room)
        setSnapshots(data.snapshots || [])
        setCurrentIdx((data.snapshots?.length || 1) - 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, roomId])

  
  useEffect(() => {
    if (!playing) return
    if (currentIdx >= snapshots.length - 1) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      setCurrentIdx((i) => i + 1)
    }, 2000)
    return () => clearTimeout(timer)
  }, [playing, currentIdx, snapshots.length])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Logo height={20} linked={false} className="opacity-60 animate-pulse" />
      </div>
    )
  }

  const snapshot = snapshots[currentIdx]
  const firstTimestamp = snapshots[0]?.timestamp

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      {}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-surface">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm">
            <ArrowLeft size={15} />Dashboard
          </Link>
          <div className="h-4 w-px bg-border" />
          <Logo height={16} linked={false} />
          <span className="font-mono text-sm font-semibold text-text">
            Replay — {roomInfo?.title || roomId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{snapshots.length} snapshots</span>
          <ThemeToggle />
        </div>
      </header>

      {}
      <div className="border-b border-border bg-surface px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {}
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40 transition-colors text-muted hover:text-text"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => setPlaying(!playing)}
            disabled={snapshots.length === 0}
            className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40 transition-colors"
          >
            {playing
              ? <Pause size={15} className="text-accent" />
              : <Play size={15} className="text-accent" />
            }
          </button>

          <button
            onClick={() => setCurrentIdx(Math.min(snapshots.length - 1, currentIdx + 1))}
            disabled={currentIdx === snapshots.length - 1}
            className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40 transition-colors text-muted hover:text-text"
          >
            <SkipForward size={15} />
          </button>

          {}
          {snapshot && (
            <div className="flex items-center gap-1.5 text-xs text-muted ml-2">
              <Clock size={12} />
              <span className="font-mono">
                {firstTimestamp ? formatRelative(String(firstTimestamp), String(snapshot.timestamp)) : '—'}
              </span>
              <span className="text-border">·</span>
              <span className="capitalize text-accent">{snapshot.trigger}</span>
            </div>
          )}

          <div className="flex-1" />
          <span className="text-xs text-muted font-mono">{currentIdx + 1} / {snapshots.length}</span>
        </div>

        {}
        <input
          type="range"
          min={0}
          max={Math.max(0, snapshots.length - 1)}
          value={currentIdx}
          onChange={(e) => {
            setPlaying(false)
            setCurrentIdx(parseInt(e.target.value))
          }}
          className="w-full accent-accent"
        />

        {}
        {snapshots.length > 0 && (
          <div className="relative mt-1 h-3">
            {snapshots.map((s, i) => (
              <button
                key={i}
                onClick={() => { setPlaying(false); setCurrentIdx(i) }}
                className={`absolute top-0 w-1 h-3 rounded-sm transition-colors ${
                  i === currentIdx ? 'bg-accent' :
                  s.trigger === 'end' ? 'bg-danger/70' :
                  s.trigger === 'execution' ? 'bg-success/70' :
                  'bg-border hover:bg-accent/50'
                }`}
                style={{ left: `${snapshots.length > 1 ? (i / (snapshots.length - 1)) * 100 : 0}%` }}
                title={`${s.trigger} — ${formatTime(String(s.timestamp))}`}
              />
            ))}
          </div>
        )}
      </div>

      {}
      <div className="flex-1 flex overflow-hidden">
        {}
        <div className="flex-1 overflow-hidden">
          {snapshot ? (
            <CodeEditor
              code={snapshot.code}
              language={snapshot.language}
              readOnly={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm">
              No snapshots available for this session.
            </div>
          )}
        </div>

        {}
        <div className="w-72 border-l border-border flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Snapshot Info</h3>
            {snapshot ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Time</span>
                  <span className="font-mono text-text">{formatTime(String(snapshot.timestamp))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Language</span>
                  <span className="text-text capitalize">{snapshot.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Trigger</span>
                  <span className="text-accent capitalize">{snapshot.trigger}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Hints used</span>
                  <span className="text-text">{snapshot.hintsUsed}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted">No snapshot selected</p>
            )}
          </div>

          {}
          {snapshot?.testResults && snapshot.testResults.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Test Results</h3>
              <div className="space-y-2">
                {snapshot.testResults.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {r.passed
                      ? <CheckCircle2 size={12} className="text-success flex-shrink-0 mt-0.5" />
                      : <XCircle size={12} className="text-danger flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <div className="text-muted truncate">Input: {r.input || '—'}</div>
                      {!r.passed && <div className="text-danger truncate">Got: {r.actual || '—'}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {snapshot?.aiReview && (
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">AI Review</h3>
              <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">{snapshot.aiReview}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
