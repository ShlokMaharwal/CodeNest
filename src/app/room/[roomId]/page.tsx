'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { getSocket } from '@/lib/socket'
import { RoomState, TestCase, ExecutionResult, STARTER_CODE } from '@/types'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { Toolbar } from '@/components/editor/Toolbar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TestCasePanel } from '@/components/editor/TestCasePanel'
import { OutputPanel } from '@/components/editor/OutputPanel'
import { UsersPanel } from '@/components/editor/UsersPanel'
import { NotesPanel } from '@/components/editor/NotesPanel'
import { Zap, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function RoomPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string

  const [roomState, setRoomState] = useState<RoomState>({
    code: STARTER_CODE['javascript'],
    language: 'javascript',
    users: [],
    testCases: [{ input: '', expectedOutput: '' }],
    output: null,
  })
  const [notes, setNotes] = useState('')
  const [executing, setExecuting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connected, setConnected] = useState(false)
  const [activePanel, setActivePanel] = useState<'testcases' | 'output' | 'notes'>('testcases')

  const codeRef = useRef(roomState.code)
  const languageRef = useRef(roomState.language)


  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])


  useEffect(() => {
    if (!session?.user) return

    const socket = getSocket()

    const joinRoom = () => {
      setConnected(true)
      socket.emit('join-room', {
        roomId,
        user: {
          name: session.user!.name,
          color: (session.user as any).color || '#6366f1',
        },
      })
    }

    socket.on('connect', joinRoom)
    socket.on('disconnect', () => setConnected(false))

    if (socket.connected) {
      joinRoom()
    }


    socket.on('room-state', (state: RoomState) => {
      setRoomState(state)
      codeRef.current = state.code
      languageRef.current = state.language
    })


    socket.on('code-update', ({ code }: { code: string }) => {
      codeRef.current = code
      setRoomState((prev) => ({ ...prev, code }))
    })


    socket.on('language-update', ({ language }: { language: string }) => {
      languageRef.current = language
      setRoomState((prev) => ({
        ...prev,
        language,
        code: STARTER_CODE[language] || prev.code,
      }))
    })


    socket.on('user-joined', ({ users }: any) => {
      setRoomState((prev) => ({ ...prev, users }))
    })
    socket.on('user-left', ({ users }: any) => {
      setRoomState((prev) => ({ ...prev, users }))
    })


    socket.on('test-cases-update', ({ testCases }: { testCases: TestCase[] }) => {
      setRoomState((prev) => ({ ...prev, testCases }))
    })


    socket.on('output-result', ({ output }: { output: ExecutionResult }) => {
      setRoomState((prev) => ({ ...prev, output }))
      setExecuting(false)
      setActivePanel('output')
    })


    socket.on('notes-update', ({ notes }: { notes: string }) => {
      setNotes(notes)
    })

    return () => {
      socket.off('connect', joinRoom)
      socket.off('disconnect')
      socket.off('room-state')
      socket.off('code-update')
      socket.off('language-update')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('test-cases-update')
      socket.off('output-result')
      socket.off('notes-update')
    }
  }, [session, roomId])


  const handleCodeChange = useCallback((code: string) => {
    codeRef.current = code
    setRoomState((prev) => ({ ...prev, code }))
    const socket = getSocket()
    socket.emit('code-change', { roomId, code })
  }, [roomId])


  const handleLanguageChange = useCallback((language: string) => {
    const newCode = STARTER_CODE[language] || ''
    languageRef.current = language
    codeRef.current = newCode
    setRoomState((prev) => ({ ...prev, language, code: newCode }))
    const socket = getSocket()
    socket.emit('language-change', { roomId, language })
    socket.emit('code-change', { roomId, code: newCode })
  }, [roomId])


  const handleTestCasesChange = useCallback((testCases: TestCase[]) => {
    setRoomState((prev) => ({ ...prev, testCases }))
    const socket = getSocket()
    socket.emit('test-cases-change', { roomId, testCases })
  }, [roomId])


  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
    const socket = getSocket()
    socket.emit('notes-change', { roomId, notes: value })
  }, [roomId])


  const handleRun = useCallback(async () => {
    setExecuting(true)
    setActivePanel('output')
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeRef.current,
          language: languageRef.current,
          testCases: roomState.testCases,
        }),
      })
      const data = await res.json()

      const socket = getSocket()
      socket.emit('output-update', { roomId, output: data.result })
    } catch (err) {
      setExecuting(false)
    }
  }, [roomId, roomState.testCases])


  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Zap className="text-accent animate-pulse" size={20} />
          <span className="font-mono text-sm">Connecting...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">

      <header className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5">
            <Zap className="text-accent" size={16} />
            <span className="font-mono font-semibold text-sm text-text">CodeSync</span>
          </Link>
          <div className="h-4 w-px bg-border" />

          <button
            onClick={copyRoomId}
            className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-text transition-colors bg-surface border border-border rounded px-2.5 py-1"
          >
            <span>{roomId}</span>
            {copied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green' : 'bg-yellow'} animate-pulse`} />
            <span className="text-xs text-muted">{connected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>


        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UsersPanel users={roomState.users} currentUser={session?.user} />
        </div>
      </header>


      <Toolbar
        language={roomState.language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        executing={executing}
      />


      <div className="flex-1 flex overflow-hidden">

        <div className="flex-1 overflow-hidden">
          <CodeEditor
            code={roomState.code}
            language={roomState.language}
            onChange={handleCodeChange}
          />
        </div>


        <div className="w-96 border-l border-border flex flex-col flex-shrink-0">

          <div className="flex border-b border-border flex-shrink-0">
            {(['testcases', 'output', 'notes'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                  activePanel === panel
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-muted hover:text-text'
                }`}
              >
                {panel === 'testcases' ? 'Test Cases' : panel === 'output' ? 'Output' : 'Notes'}
                {panel === 'output' && roomState.output && (
                  <span className={`ml-1.5 text-xs ${
                    roomState.output.status?.includes('Passed') ? 'text-green' : 'text-red'
                  }`}>●</span>
                )}
              </button>
            ))}
          </div>


          <div className="flex-1 overflow-hidden">
            {activePanel === 'testcases' && (
              <TestCasePanel
                testCases={roomState.testCases}
                onChange={handleTestCasesChange}
              />
            )}
            {activePanel === 'output' && (
              <OutputPanel output={roomState.output} executing={executing} />
            )}
            {activePanel === 'notes' && (
              <NotesPanel notes={notes} onChange={handleNotesChange} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
