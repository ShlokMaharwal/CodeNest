'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { v4 as uuidv4 } from 'uuid'
import { Zap, Users, Code2, Play, Plus, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roomInput, setRoomInput] = useState('')
  const [loading, setLoading] = useState(false)

  const createRoom = async () => {
    if (!session) return router.push('/login')
    setLoading(true)
    try {
      const roomId = uuidv4().slice(0, 8)
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, title: 'New Interview Session' }),
      })
      const data = await res.json()
      router.push(`/room/${data.roomId}`)
    } catch {
      setLoading(false)
    }
  }

  const joinRoom = () => {
    const id = roomInput.trim()
    if (!id) return
    if (!session) return router.push('/login')
    router.push(`/room/${id}`)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="text-accent" size={22} />
          <span className="font-mono font-semibold text-lg text-text">CodeSync</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: (session.user as any)?.color || '#6366f1' }}
                >
                  {session.user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-muted hidden sm:block">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogIn size={15} /> Sign in
            </Link>
          )}
        </div>
      </nav>


      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 mb-8 text-xs text-muted font-mono">
          <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
          Real-time collaborative coding
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-text mb-5 leading-tight">
          Code together,{' '}
          <span className="text-accent">live.</span>
        </h1>

        <p className="text-muted text-lg max-w-xl mb-12 leading-relaxed">
          Create a room, share the link, and conduct technical interviews with real-time code sync,
          multi-language support, and instant execution.
        </p>


        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={createRoom}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            {loading ? 'Creating...' : 'Create Room'}
          </button>

          <div className="flex-1 flex gap-2">
            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              placeholder="Enter room ID"
              className="flex-1 bg-surface border border-border text-text placeholder-muted rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={joinRoom}
              className="bg-surface border border-border hover:border-accent text-text px-4 py-3.5 rounded-xl transition-colors"
            >
              Join
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full max-w-3xl">
          {[
            { icon: Users, title: 'Live Collaboration', desc: 'Both users see code changes instantly. Cursors sync in real time.' },
            { icon: Code2, title: '8 Languages', desc: 'JS, TS, Python, Java, C++, C, Go, Rust — all supported.' },
            { icon: Play, title: 'Instant Execution', desc: 'Run code and test against custom test cases in one click.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface border border-border rounded-xl p-5 text-left">
              <Icon size={20} className="text-accent mb-3" />
              <h3 className="font-semibold text-text text-sm mb-1.5">{title}</h3>
              <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted font-mono">
        Built with Next.js · TypeScript · Socket.io · MongoDB
      </footer>
    </div>
  )
}
