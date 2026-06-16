'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Users, Code2, Play, Plus, LogOut, LogIn,
  Brain, Shield, LayoutDashboard, X, Clock, Lightbulb,
  ChevronRight, Calendar, History, Check, Copy, ArrowRight
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Segmented } from '@/components/ui/Tabs'
import { motion } from 'framer-motion'
import { useCommandPalette } from '@/components/palette/CommandPalette'

interface CreateRoomForm {
  title: string
  durationMinutes: number
  hintsEnabled: boolean
  maxHints: number
  isScheduled: boolean
  scheduledDate: string
  scheduledTime: string
  candidateName: string
  candidateEmail: string
  description: string
}

const DURATION_OPTIONS = [
  { value: '30', label: '30m' },
  { value: '45', label: '45m' },
  { value: '60', label: '60m' },
  { value: '90', label: '90m' },
]

const STEPS = [
  { icon: Plus,   num: '01', title: 'Create room',    desc: 'Set the problem, timer, and hint config.' },
  { icon: Users,  num: '02', title: 'Share invite',   desc: 'One-click link to your candidate.' },
  { icon: Code2,  num: '03', title: 'Code together',  desc: 'Watch live, lock editor, take control.' },
  { icon: Brain,  num: '04', title: 'AI assessment',  desc: 'Instant complexity analysis + hire verdict.' },
]

const FEATURES = [
  { icon: Shield,   label: 'Invite-only access' },
  { icon: Clock,    label: 'Countdown timer' },
  { icon: Lightbulb,label: 'Gemini AI hints' },
  { icon: Play,     label: '8 language support' },
  { icon: Brain,    label: 'Hire / No-hire review' },
  { icon: History,  label: 'Full session replay' },
]

const FEATURES_DETAILED = [
  { num: '01', title: 'Invite-only access',   desc: 'Tokenized, expiring room links.' },
  { num: '02', title: 'Countdown timer',       desc: 'Synchronized server-side clock.' },
  { num: '03', title: 'Gemini AI hints',       desc: 'Tiered nudges, not solutions.' },
  { num: '04', title: '8 language runtimes',   desc: 'JS, TS, Python, Go, Java, C++, Rust, SQL.' },
  { num: '05', title: 'Hire / No-hire review', desc: 'Structured rubric + AI summary.' },
  { num: '06', title: 'Full session replay',   desc: 'Keystroke-level timeline scrub.' },
]


const HERO_CODE = `#include <vector>
#include <algorithm>
using namespace std;

// Coin Change — minimum coins to reach amount
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i && dp[i - coin] != INT_MAX)
                dp[i] = min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}

// coins = [1,5,11], amount = 15  →  3`

function HeroMockup() {
  return (
    <div className="relative mt-16 max-w-3xl mx-auto">
      {}
      <div className="absolute inset-x-12 -bottom-4 h-24 bg-accent/25 blur-3xl rounded-full" />
      {}
      <div
        className="relative bg-bg-elevated border border-border rounded-xl shadow-lg overflow-hidden"
        style={{ transform: 'perspective(1200px) rotateX(2deg) rotateY(-3deg)' }}
      >
        {}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
          <div className="flex-1" />
          <span className="text-xs font-mono text-subtle px-2 py-0.5 bg-surface border border-border rounded">C++</span>
          <span className="text-xs text-subtle">Coin Change · Medium</span>
        </div>
        {}
        <div className="p-5 font-mono text-[13px] leading-relaxed text-text overflow-hidden">
          <pre className="whitespace-pre" style={{ tabSize: 2 }}>
            {HERO_CODE.split('\n').map((line, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-subtle select-none w-5 text-right flex-shrink-0">{i + 1}</span>
                <span>{colorize(line)}</span>
              </div>
            ))}
          </pre>
        </div>
        {}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-2">
          <div className="flex items-center gap-3 text-xs text-subtle font-mono">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />Live</span>
            <span>2 users</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <Check size={12} />
            All tests passed
          </div>
        </div>
      </div>
    </div>
  )
}

function colorize(line: string): React.ReactNode {
  
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  
  const TOKEN_RE = /(\/\/[^\n]*|"[^"]*"|'[^']*')|(#\w+)|(\b(?:int|return|for|if|using|namespace|std|auto|void|bool|while|else|new|delete)\b)|(\b(?:vector|string|INT_MAX|min|max|sort|dp|coins|coin|amount)\b)|(\b\d+\b)|(\b(?:coinChange|i)\b)/g

  const html = escaped.replace(TOKEN_RE, (_match, str, pre, kw, type, num, id) => {
    if (str)  return `<span style="color:var(--success)">${_match}</span>`
    if (pre)  return `<span style="color:var(--danger)">${_match}</span>`
    if (kw)   return `<span style="color:var(--accent)">${_match}</span>`
    if (type) return `<span style="color:var(--info)">${_match}</span>`
    if (num)  return `<span style="color:var(--warning)">${_match}</span>`
    if (id)   return `<span style="color:var(--text-muted)">${_match}</span>`
    return _match
  })

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

const TREE_CODE = `function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const level = [];
    const len = queue.length;

    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`

function colorizeJS(line: string) {
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const JS_RE = /(\/\/[^\n]*|"[^"]*"|'[^']*')|(\b(?:function|const|let|var|return|if|else|for|while|of|in|new|null|true|false)\b)|(\b(?:push|shift|length|val|left|right)\b)|(\b\d+\b)/g
  const html = escaped.replace(JS_RE, (_match, str, kw, method, num) => {
    if (str)    return `<span style="color:var(--success)">${_match}</span>`
    if (kw)     return `<span style="color:var(--accent)">${_match}</span>`
    if (method) return `<span style="color:var(--info)">${_match}</span>`
    if (num)    return `<span style="color:var(--warning)">${_match}</span>`
    return _match
  })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function ThreePanesMockup() {
  const lines = TREE_CODE.split('\n')
  return (
    <div className="relative w-full">
      <div className="absolute inset-x-24 -bottom-4 h-20 bg-accent/15 blur-3xl rounded-full" />
      <div
        className="relative border border-border rounded-xl shadow-lg overflow-hidden bg-bg"
        style={{ transform: 'perspective(1200px) rotateX(1deg) rotateY(-1deg)' }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <div className="text-[11px] text-subtle font-mono flex items-center gap-2">
            <span>Problem</span>
            <span className="text-border">·</span>
            <span>Editor</span>
            <span className="text-border">·</span>
            <span>Tests</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-subtle font-mono">
            <span className="text-text font-semibold">IS AK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
            <span>2 online</span>
          </div>
        </div>
        <div className="grid text-[11px] font-mono" style={{ gridTemplateColumns: '210px 1fr 185px', minHeight: 320 }}>
          <div className="border-r border-border p-4 bg-surface flex flex-col gap-2.5 overflow-hidden">
            <span className="text-text font-semibold text-[12px] font-sans leading-snug">
              Binary Tree Level Order Traversal
            </span>
            <span className="text-warning text-[10px] font-semibold font-sans px-1.5 py-0.5 bg-warning/10 rounded w-fit">
              Medium
            </span>
            <p className="text-muted text-[10px] leading-relaxed font-sans">
              Given the{' '}
              <code className="bg-surface-2 px-1 rounded text-text">root</code>{' '}
              of a binary tree, return the{' '}
              <span className="text-text">level order traversal</span>{' '}
              of its nodes&#39; values (left to right, level by level).
            </p>
            <div className="bg-surface-2 border border-border rounded p-2 text-[10px] font-sans">
              <div className="text-subtle mb-1 tracking-wider">EXAMPLE 1</div>
              <div className="text-muted">root = [3,9,20,null,null,15,7]</div>
              <div className="text-success mt-0.5">Output: [[3],[9,20],[15,7]]</div>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-auto">
              {['Tree', 'BFS', 'Queue'].map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-surface-2 border border-border rounded text-[10px] text-muted font-sans">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 bg-bg overflow-hidden">
            <div className="flex gap-3 leading-[1.75]">
              <div className="text-subtle select-none text-right shrink-0" style={{ minWidth: 18 }}>
                {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <div className="overflow-hidden">
                {lines.map((line, i) => (
                  <div key={i} className="whitespace-pre">{line ? colorizeJS(line) : '\u00A0'}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-l border-border p-4 bg-surface flex flex-col gap-2.5">
            <div className="text-[10px] font-semibold text-subtle tracking-widest font-sans mb-1">TEST RESULTS</div>
            {[
              { label: 'Case 1',       time: '1ms' },
              { label: 'Case 2',       time: '0ms' },
              { label: 'Case 3',       time: '1ms' },
              { label: 'Edge: empty',  time: '0ms' },
            ].map(({ label, time }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-success font-sans">
                  <Check size={9} />
                  {label}
                </span>
                <span className="text-subtle text-[10px] font-sans">{time}</span>
              </div>
            ))}
            <div className="mt-auto pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-success font-semibold text-[12px] font-sans">12/12 passed</span>
                <span className="text-subtle text-[10px] font-sans">93ms</span>
              </div>
              <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 px-4 py-2.5 border-t border-border bg-surface-2">
          <Code2 size={13} className="text-subtle" />
          <Brain  size={13} className="text-subtle" />
          <Play   size={13} className="text-subtle" />
          <Users  size={13} className="text-subtle" />
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────
export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { open: openPalette } = useCommandPalette()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<{ roomId: string; inviteLink: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState<CreateRoomForm>({
    title: 'Interview session',
    durationMinutes: 45,
    hintsEnabled: true,
    maxHints: 3,
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
    candidateName: '',
    candidateEmail: '',
    description: '',
  })

  const openCreateModal = () => {
    if (!session) return router.push('/login')
    setCreatedRoom(null)
    setShowModal(true)
  }

  const createRoom = async () => {
    setLoading(true)
    try {
      let scheduledAt: string | undefined
      if (form.isScheduled && form.scheduledDate && form.scheduledTime) {
        scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString()
      }
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          durationMinutes: form.durationMinutes,
          hintsEnabled: form.hintsEnabled,
          maxHints: form.maxHints,
          scheduledAt,
          candidateName:  form.isScheduled ? form.candidateName  : undefined,
          candidateEmail: form.candidateEmail || undefined,
          description:    form.isScheduled ? form.description : undefined,
        }),
      })
      const data = await res.json()
      if (data.roomId) {
        if (form.isScheduled) {
          setShowModal(false)
          router.push('/dashboard')
        } else {
          // Fetch invite link
          const inv = await fetch(`/api/rooms/${data.roomId}/invite`)
          const invData = await inv.json()
          setCreatedRoom({ roomId: data.roomId, inviteLink: invData.inviteLink || '' })
        }
      }
    } catch {}
    setLoading(false)
  }

  const copyInvite = () => {
    if (!createdRoom) return
    navigator.clipboard.writeText(createdRoom.inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const set = (key: keyof CreateRoomForm, val: any) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Navbar ── */}
      <nav className="h-14 sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border flex items-center px-6 gap-6">
        <Logo height={20} />

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {session && <>
            <Link href="/dashboard" className="px-3 py-1.5 text-sm text-muted hover:text-text rounded-md hover:bg-surface-2 transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={14} />Dashboard
            </Link>
            <Link href="/schedule" className="px-3 py-1.5 text-sm text-muted hover:text-text rounded-md hover:bg-surface-2 transition-colors flex items-center gap-1.5">
              <Calendar size={14} />Schedule
            </Link>
          </>}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* ⌘K */}
          <button
            onClick={openPalette}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-surface border border-border rounded-md text-xs text-subtle hover:text-text hover:border-border-strong transition-colors"
          >
            <span>Search</span>
            <kbd className="font-mono bg-surface-2 px-1 rounded text-[10px]">⌘K</kbd>
          </button>

          <ThemeToggle />

          {session ? (
            <>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: (session.user as any)?.color || 'var(--accent)' }}
                title={session.user?.name || ''}
              >
                {session.user?.name?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm text-muted hover:text-text flex items-center gap-1 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm bg-accent hover:bg-accent-hover text-[#1a2a0e] px-4 h-9 rounded-md transition-colors font-semibold"
            >
              <LogIn size={14} />Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center px-6 pt-24 pb-16 text-center">


        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl font-semibold text-text leading-[1.05] tracking-[-0.035em] mb-5 max-w-3xl"
        >
          Run coding interviews{' '}
          <span className="text-accent">you'd actually want to take.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-muted text-lg max-w-lg mb-10 leading-relaxed"
        >
          Shared Monaco editor, live test execution, AI hints for candidates,
          AI hire-review for interviewers — all in one seamless room.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button variant="primary" size="lg" onClick={openCreateModal} icon={<Plus size={16} />}>
            Create interview room
          </Button>
          {session && (
            <Button variant="secondary" size="lg" onClick={() => router.push('/dashboard')} icon={<LayoutDashboard size={15} />}>
              My interviews
            </Button>
          )}
        </motion.div>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl"
        >
          <HeroMockup />
        </motion.div>

        {/* How it works */}
        <div className="w-full max-w-4xl mt-24">
          <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
            {STEPS.map(({ icon: Icon, num, title, desc }) => (
              <div key={title} className="bg-surface p-6 text-left relative overflow-hidden">
                <div className="absolute top-3 right-3 text-4xl font-mono font-black text-border select-none leading-none">{num}</div>
                <Icon size={20} className="text-accent mb-3" />
                <h3 className="font-semibold text-text text-sm mb-1.5">{title}</h3>
                <p className="text-muted text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-4xl mt-24">
          <h2 className="text-2xl sm:text-3xl font-semibold text-text text-left mb-10 tracking-tight">
            Everything an interview loop actually needs.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {FEATURES_DETAILED.map(({ num, title, desc }) => (
              <div key={title} className="bg-surface p-6 text-left relative">
                <div className="text-[10px] font-mono text-subtle mb-4">{num}</div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent absolute top-6 right-6" />
                <h3 className="font-semibold text-text mb-1.5">{title}</h3>
                <p className="text-sm text-accent leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-4xl mt-24">
          <div className="flex items-start justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              Three panes. One verdict.
            </h2>
            <span className="hidden sm:flex items-center gap-2 text-xs text-subtle font-mono mt-2">
              Problem
              <span className="text-border mx-0.5">·</span>
              Editor
              <span className="text-border mx-0.5">·</span>
              Tests
            </span>
          </div>
          <ThreePanesMockup />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo height={16} linked={false} />
          <p className="font-mono text-xs text-subtle">
            Made by <span className="text-accent">Shlok</span> · © {new Date().getFullYear()} CodeNest
          </p>
        </div>
      </footer>

      {/* ── Create room modal ── */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogHeader onClose={() => setShowModal(false)}>
          {createdRoom ? 'Room created 🎉' : 'New interview room'}
        </DialogHeader>

        {createdRoom ? (
          /* ── Success state ── */
          <DialogBody>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success-soft flex items-center justify-center">
                <Check size={22} className="text-success" />
              </div>
              <div>
                <p className="font-medium text-text mb-1">Your room is ready</p>
                <p className="text-sm text-muted">Share the invite link with your candidate</p>
              </div>
              <div className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 flex items-center gap-2">
                <span className="flex-1 font-mono text-xs text-muted truncate">{createdRoom.inviteLink}</span>
                <button onClick={copyInvite} className="text-muted hover:text-accent flex-shrink-0">
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Close
                </Button>
                <Button variant="primary" className="flex-1" onClick={() => router.push(`/room/${createdRoom.roomId}`)} icon={<ArrowRight size={14} />}>
                  Enter room
                </Button>
              </div>
            </div>
          </DialogBody>
        ) : (
          /* ── Form ── */
          <>
            <DialogBody className="space-y-5">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Session title</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer — Round 2"
                  className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  Duration <span className="text-accent">{form.durationMinutes}m</span>
                </label>
                <Segmented
                  options={DURATION_OPTIONS}
                  value={String(form.durationMinutes)}
                  onChange={v => set('durationMinutes', parseInt(v))}
                />
              </div>

              {/* Hints */}
              <Switch
                checked={form.hintsEnabled}
                onChange={v => set('hintsEnabled', v)}
                label="AI hints"
                description="Allow candidate to request Gemini hints"
              />

              {form.hintsEnabled && (
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">
                    Max hints <span className="text-accent">{form.maxHints}</span>
                  </label>
                  <input
                    type="range" min={1} max={10} step={1}
                    value={form.maxHints}
                    onChange={e => set('maxHints', parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              )}

              {/* Schedule toggle */}
              <div className="border-t border-border pt-4">
                <Switch
                  checked={form.isScheduled}
                  onChange={v => set('isScheduled', v)}
                  label="Schedule for later"
                  description="Set a date, time and candidate details"
                />
              </div>

              {form.isScheduled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 bg-surface-2 border border-border/60 rounded-xl p-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted block mb-1">Date</label>
                      <input type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)}
                        className="w-full bg-surface border border-border text-text rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted block mb-1">Time</label>
                      <input type="time" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)}
                        className="w-full bg-surface border border-border text-text rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted block mb-1">Candidate name</label>
                      <input type="text" value={form.candidateName} onChange={e => set('candidateName', e.target.value)}
                        placeholder="Full name" className="w-full bg-surface border border-border text-text rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted block mb-1">Candidate email</label>
                      <input type="email" value={form.candidateEmail} onChange={e => set('candidateEmail', e.target.value)}
                        placeholder="candidate@email.com" className="w-full bg-surface border border-border text-text rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-accent" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted block mb-1">Notes</label>
                    <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Interview notes, focus areas…"
                      className="w-full bg-surface border border-border text-text rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent resize-none" />
                  </div>
                </motion.div>
              )}
            </DialogBody>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" loading={loading} onClick={createRoom} icon={<Plus size={14} />}>
                {form.isScheduled ? 'Schedule interview' : 'Create room & get invite link'}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  )
}
