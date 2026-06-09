'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { LiveRoomState, TestCase, ExecutionResult, STARTER_CODE, Problem, UserRole, ActiveUser } from '@/types'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { Toolbar } from '@/components/editor/Toolbar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TestCasePanel } from '@/components/editor/TestCasePanel'
import { OutputPanel } from '@/components/editor/OutputPanel'
import { NotesPanel } from '@/components/editor/NotesPanel'
import { HintPanel } from '@/components/editor/HintPanel'
import { ReviewPanel } from '@/components/editor/ReviewPanel'
import { InterviewerBar } from '@/components/room/InterviewerBar'
import { ProblemPanel } from '@/components/room/ProblemPanel'
import { Timer } from '@/components/room/Timer'
import { ConnectionStatus } from '@/components/room/ConnectionStatus'
import { UserAvatars } from '@/components/room/UserAvatars'
import { EndedBanner } from '@/components/room/EndedBanner'
import { StatusBar } from '@/components/room/StatusBar'
import { ProblemPicker } from '@/components/ProblemPicker'
import { Tabs } from '@/components/ui/Tabs'
import { Copy, Check, LogOut, Link2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

type ConnectionStatusType = 'connected' | 'reconnecting' | 'disconnected'
type SidePanel = 'testcases' | 'output' | 'notes' | 'hints' | 'review'

export default function RoomPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const inviteToken = searchParams.get('token') || ''

  
  const [role, setRole] = useState<UserRole>('candidate')
  const [users, setUsers] = useState<ActiveUser[]>([])
  const [code, setCode] = useState(STARTER_CODE['javascript'])
  const [language, setLanguage] = useState('javascript')
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', expectedOutput: '' }])
  const [output, setOutput] = useState<ExecutionResult | null>(null)
  const [notes, setNotes] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hints, setHints] = useState<string[]>([])
  const [maxHints, setMaxHints] = useState(5)
  const [hintsEnabled, setHintsEnabled] = useState(true)
  const [editorLockedBy, setEditorLockedBy] = useState<string | null>(null)
  const [controlledBy, setControlledBy] = useState<'interviewer' | 'candidate'>('candidate')
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'ended'>('waiting')
  const [problem, setProblem] = useState<Problem | null>(null)
  const [timerStartedAt, setTimerStartedAt] = useState<number | undefined>()
  const [timerDurationMs, setTimerDurationMs] = useState<number | undefined>()
  const [inviteLink, setInviteLink] = useState('')

  
  const [executing, setExecuting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connStatus, setConnStatus] = useState<ConnectionStatusType>('disconnected')
  const [activePanel, setActivePanel] = useState<SidePanel>('testcases')
  const [showProblemPicker, setShowProblemPicker] = useState(false)
  const [replayLink, setReplayLink] = useState('')
  const [showEndedBanner, setShowEndedBanner] = useState(false)

  const codeRef = useRef(code)
  const languageRef = useRef(language)
  const testCasesRef = useRef(testCases)
  const roleRef = useRef<UserRole>('candidate')
  const socketIdRef = useRef<string>('')

  
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  
  const fetchInviteLink = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/invite`)
      if (res.ok) {
        const data = await res.json()
        setInviteLink(data.inviteLink)
      }
    } catch {}
  }, [roomId])

  
  useEffect(() => {
    if (!session?.user) return

    const socket = getSocket()
    socketIdRef.current = socket.id || ''

    const joinRoom = () => {
      setConnStatus('connected')
      socket.emit('join-room', { roomId, inviteToken })
    }

    socket.on('connect', () => {
      setConnStatus('connected')
      socketIdRef.current = socket.id || ''
      joinRoom()
    })
    socket.on('disconnect', () => setConnStatus('disconnected'))
    socket.on('connect_error', () => setConnStatus('reconnecting'))

    if (socket.connected) joinRoom()

    

    socket.on('room-state', (state: LiveRoomState & { myRole: UserRole }) => {
      setRole(state.myRole)
      roleRef.current = state.myRole
      setUsers(state.users)
      setCode(state.code || STARTER_CODE[state.language] || '')
      setLanguage(state.language)
      setTestCases(state.testCases || [{ input: '', expectedOutput: '' }])
      setOutput(state.output)
      setNotes(state.notes || '')
      setHintsUsed(state.hintsUsed || 0)
      setHintsEnabled(state.hintsEnabled ?? true)
      setMaxHints(state.maxHints ?? 5)
      setEditorLockedBy(state.editorLockedBy)
      setControlledBy(state.controlledBy || 'candidate')
      setRoomStatus(state.status)
      if (state.timerStartedAt) setTimerStartedAt(state.timerStartedAt)
      if (state.timerDurationMs) setTimerDurationMs(state.timerDurationMs)

      codeRef.current = state.code || ''
      languageRef.current = state.language
      testCasesRef.current = state.testCases || []

      if (state.myRole === 'interviewer') fetchInviteLink()
    })

    socket.on('code-update', ({ code: newCode }: { code: string }) => {
      codeRef.current = newCode
      setCode(newCode)
    })

    socket.on('language-update', ({ language: lang }: { language: string }) => {
      languageRef.current = lang
      setLanguage(lang)
    })

    socket.on('user-joined', ({ users: u }: { users: ActiveUser[] }) => setUsers(u))
    socket.on('user-left', ({ users: u }: { users: ActiveUser[] }) => setUsers(u))

    socket.on('test-cases-update', ({ testCases: tc }: { testCases: TestCase[] }) => {
      testCasesRef.current = tc
      setTestCases(tc)
    })

    socket.on('output-result', ({ output: o }: { output: ExecutionResult }) => {
      setOutput(o)
      setExecuting(false)
      setActivePanel('output')
    })

    socket.on('notes-update', ({ notes: n }: { notes: string }) => setNotes(n))

    socket.on('editor-locked', () => {
      setEditorLockedBy('locked')
    })
    socket.on('editor-unlocked', () => setEditorLockedBy(null))

    socket.on('control-changed', ({ controlledBy: cb }: { controlledBy: 'interviewer' | 'candidate' }) => {
      setControlledBy(cb)
    })

    socket.on('hint-count-update', ({ hintsUsed: h }: { hintsUsed: number }) => {
      setHintsUsed(h)
    })

    socket.on('problem-updated', ({ problem: p, code: c }: { problem: Problem; code: string }) => {
      setProblem(p)
      setCode(c)
      codeRef.current = c
    })

    socket.on('timer-synced', ({ timerStartedAt: tsa, timerDurationMs: tdm }: any) => {
      setTimerStartedAt(tsa)
      setTimerDurationMs(tdm)
    })

    socket.on('interview-ended', ({ replayLink: rl }: { replayLink: string }) => {
      setRoomStatus('ended')
      setReplayLink(rl)
      setShowEndedBanner(true)
    })

    socket.on('room-full', () => router.push('/room-full'))
    socket.on('invite-invalid', () => router.push('/invite-invalid'))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('room-state')
      socket.off('code-update')
      socket.off('language-update')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('test-cases-update')
      socket.off('output-result')
      socket.off('notes-update')
      socket.off('editor-locked')
      socket.off('editor-unlocked')
      socket.off('control-changed')
      socket.off('hint-count-update')
      socket.off('problem-updated')
      socket.off('timer-synced')
      socket.off('interview-ended')
      socket.off('room-full')
      socket.off('invite-invalid')
    }
  }, [session, roomId, inviteToken, fetchInviteLink, router])

  

  const handleCodeChange = useCallback((newCode: string) => {
    codeRef.current = newCode
    setCode(newCode)
    getSocket().emit('code-change', { roomId, code: newCode })
  }, [roomId])

  const handleLanguageChange = useCallback((lang: string) => {
    const newCode = STARTER_CODE[lang] || ''
    languageRef.current = lang
    codeRef.current = newCode
    setLanguage(lang)
    setCode(newCode)
    const socket = getSocket()
    socket.emit('language-change', { roomId, language: lang })
    socket.emit('code-change', { roomId, code: newCode })
  }, [roomId])

  const handleTestCasesChange = useCallback((tc: TestCase[]) => {
    testCasesRef.current = tc
    setTestCases(tc)
    getSocket().emit('test-cases-change', { roomId, testCases: tc })
  }, [roomId])

  const handleNotesChange = useCallback((n: string) => {
    setNotes(n)
    getSocket().emit('notes-change', { roomId, notes: n })
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
          testCases: testCasesRef.current,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setOutput({ stdout: null, stderr: data.error, status: 'Error', time: '—', memory: 0 })
        setExecuting(false)
        return
      }
      getSocket().emit('output-update', { roomId, output: data.result })
    } catch {
      setExecuting(false)
    }
  }, [roomId])

  const handleLockEditor = useCallback(() => {
    getSocket().emit('editor-lock', { roomId })
  }, [roomId])

  const handleUnlockEditor = useCallback(() => {
    getSocket().emit('editor-unlock', { roomId })
  }, [roomId])

  const handleTakeControl = useCallback(() => {
    getSocket().emit('take-control', { roomId })
  }, [roomId])

  const handleReturnControl = useCallback(() => {
    getSocket().emit('return-control', { roomId })
  }, [roomId])

  const handleEndInterview = useCallback(() => {
    getSocket().emit('interview-end', { roomId })
  }, [roomId])

  const handleStartTimer = useCallback((durationMinutes: number) => {
    getSocket().emit('timer-start', { roomId, durationMinutes })
  }, [roomId])

  const handleSelectProblem = useCallback((p: Problem) => {
    setProblem(p)
    setShowProblemPicker(false)
    const starterCode = p.starterCode?.[language as keyof typeof p.starterCode] || STARTER_CODE[language] || ''
    getSocket().emit('problem-change', { roomId, problemId: p._id, problem: p })
  }, [roomId, language])

  const handleHintUsed = useCallback((hint: string) => {
    setHints((prev) => [...prev, hint])
    getSocket().emit('hint-used', { roomId })
  }, [roomId])

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLeaveSession = () => {
    if (confirm('Are you sure you want to leave the interview session?')) {
      disconnectSocket()
      router.push('/dashboard')
    }
  }

  
  const isCandidate = role === 'candidate'
  const isInterviewer = role === 'interviewer'
  const editorIsLocked = !!editorLockedBy && isCandidate
  const editorIsReadOnly = isCandidate && (editorIsLocked || controlledBy === 'interviewer')

  
  const candidatePanels: SidePanel[] = ['testcases', 'output', 'notes', 'hints']
  const interviewerPanels: SidePanel[] = ['testcases', 'output', 'notes', 'review']
  const availablePanels = isInterviewer ? interviewerPanels : candidatePanels

  const PANEL_LABELS: Record<SidePanel, string> = {
    testcases: 'Test Cases',
    output: 'Output',
    notes: 'Notes',
    hints: 'Hints',
    review: 'AI Review',
  }

  const PANEL_TABS = availablePanels.map(panel => ({
    id: panel,
    label: PANEL_LABELS[panel],
    badge: panel === 'output' && output ? (
      <span className={`w-1.5 h-1.5 rounded-full ${output.status?.toLowerCase().includes('pass') ? 'bg-success' : 'bg-danger'}`} />
    ) : panel === 'hints' && hintsUsed > 0 ? (
      <span className="text-[10px] text-warning font-mono bg-warning-soft rounded-full px-1.5">{hintsUsed}</span>
    ) : undefined,
  }))

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Logo height={18} linked={false} className="opacity-60 animate-pulse" />
          <span className="font-mono text-sm">Connecting…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">

      {}
      <header className="h-12 border-b border-border flex items-center justify-between px-3 gap-3 flex-shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <Logo height={16} />
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-mono text-muted truncate max-w-[140px]" title={roomId}>{roomId}</span>
          <ConnectionStatus state={connStatus} />
        </div>

        <div className="flex items-center gap-2">
          <Timer startedAt={timerStartedAt} durationMs={timerDurationMs} />

          {isInterviewer && inviteLink && (
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-text bg-bg border border-border hover:border-border-strong rounded-md px-2.5 py-1.5 transition-all"
              title="Copy invite link"
            >
              {copied ? <Check size={12} className="text-success" /> : <Link2 size={12} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Invite'}</span>
            </button>
          )}

          {isCandidate && (
            <button
              onClick={handleLeaveSession}
              className="flex items-center gap-1.5 text-xs text-danger hover:text-danger bg-danger-soft border border-danger/30 hover:border-danger/50 rounded-md px-2.5 py-1.5 transition-all font-medium"
              title="Leave interview session"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}

          <UserAvatars users={users} currentUserId={socketIdRef.current} />
          <ThemeToggle />
        </div>
      </header>

      {}
      {isInterviewer && (
        <InterviewerBar
          editorLocked={!!editorLockedBy}
          controlledBy={controlledBy}
          onLockEditor={handleLockEditor}
          onUnlockEditor={handleUnlockEditor}
          onTakeControl={handleTakeControl}
          onReturnControl={handleReturnControl}
          onChangeProblem={() => setShowProblemPicker(true)}
          onEndInterview={handleEndInterview}
          timerStartedAt={timerStartedAt}
          timerDurationMs={timerDurationMs}
          onStartTimer={handleStartTimer}
        />
      )}

      {}
      {showEndedBanner && (
        <EndedBanner roomId={roomId} />
      )}

      {}
      <Toolbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        executing={executing}
        readOnly={isCandidate && controlledBy === 'interviewer'}
      />

      {}
      <div className="flex-1 flex overflow-hidden">

        {}
        {problem && (
          <div className="w-80 border-r border-border flex-shrink-0 overflow-hidden">
            <ProblemPanel problem={problem} />
          </div>
        )}

        {}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            readOnly={editorIsReadOnly}
            locked={editorIsLocked}
            lockedMessage={
              controlledBy === 'interviewer'
                ? '✏️ Interviewer is typing'
                : '🔒 Editor locked by interviewer'
            }
          />
        </div>

        {}
        <div className="w-96 border-l border-border flex flex-col flex-shrink-0">
          <Tabs
            tabs={PANEL_TABS}
            active={activePanel}
            onChange={(id) => setActivePanel(id as SidePanel)}
            layoutId="room-panel-tabs"
            size="sm"
          />

          <div className="flex-1 overflow-hidden">
            {activePanel === 'testcases' && (
              <TestCasePanel testCases={testCases} onChange={handleTestCasesChange} />
            )}
            {activePanel === 'output' && (
              <OutputPanel output={output} executing={executing} />
            )}
            {activePanel === 'notes' && (
              <NotesPanel notes={notes} onChange={handleNotesChange} />
            )}
            {activePanel === 'hints' && isCandidate && (
              <HintPanel
                roomId={roomId}
                problemTitle={problem?.title}
                problemDescription={problem?.description}
                code={code}
                language={language}
                hintsUsed={hintsUsed}
                maxHints={maxHints}
                hintsEnabled={hintsEnabled}
                hints={hints}
                onHintUsed={handleHintUsed}
              />
            )}
            {activePanel === 'review' && isInterviewer && (
              <ReviewPanel
                roomId={roomId}
                problemTitle={problem?.title}
                problemDescription={problem?.description}
                code={code}
                language={language}
                testResults={(output?.testCases || []).map((tc) => ({
                  input: tc.input || '',
                  expected: tc.expectedOutput || '',
                  actual: tc.actualOutput || '',
                  passed: tc.passed || false,
                }))}
              />
            )}
          </div>
        </div>
      </div>

      {}
      <StatusBar language={language} />

      {}
      {showProblemPicker && (
        <ProblemPicker
          onSelect={handleSelectProblem}
          onClose={() => setShowProblemPicker(false)}
        />
      )}
    </div>
  )
}
