'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Calendar, Clock, User, Mail, FileText, Edit3,
  Trash2, ArrowRight, LayoutDashboard, LogOut, ChevronLeft,
  ChevronRight, AlertCircle, BookOpen, Lightbulb, Timer, Save,
  Search, Phone, Briefcase, Link2, Star, CheckCircle2,
  ExternalLink, Copy, Check
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { signOut } from 'next-auth/react'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Logo } from '@/components/Logo'

type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'principal'

interface ScheduledRoom {
  _id: string
  roomId: string
  title: string
  status: 'waiting' | 'active' | 'ended'
  createdAt: string
  scheduledAt?: string
  endedAt?: string
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidatePosition?: string
  candidateLinkedin?: string
  experienceLevel?: ExperienceLevel
  description?: string
  hintsEnabled: boolean
  maxHints: number
  durationMinutes: number
}

interface EditForm {
  title: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  candidatePosition: string
  candidateLinkedin: string
  experienceLevel: string
  description: string
  scheduledDate: string
  scheduledTime: string
  durationMinutes: number
}

interface CreatedInterview {
  roomId: string
  title: string
  inviteLink: string
}

const EXP_LABELS: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  staff: 'Staff',
  principal: 'Principal',
}

const EXP_COLORS: Record<ExperienceLevel, string> = {
  junior:    'text-info    bg-info-soft    border-info/25',
  mid:       'text-success bg-success-soft border-success/25',
  senior:    'text-accent  bg-accent-soft  border-accent/25',
  staff:     'text-warning bg-warning-soft border-warning/25',
  principal: 'text-danger  bg-danger-soft  border-danger/25',
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr).getTime() > Date.now()
}

function getRelativeTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'Past'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `in ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `in ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `in ${days}d`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

const DEFAULT_CREATE_FORM = {
  title: 'Interview Session',
  durationMinutes: 45,
  hintsEnabled: true,
  maxHints: 5,
  scheduledDate: '',
  scheduledTime: '',
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  candidatePosition: '',
  candidateLinkedin: '',
  experienceLevel: '',
  description: '',
}

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [rooms, setRooms] = useState<ScheduledRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  
  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  
  const [editRoom, setEditRoom] = useState<ScheduledRoom | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  
  const [copiedId, setCopiedId] = useState<string | null>(null)

  
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  
  const [createdInterview, setCreatedInterview] = useState<CreatedInterview | null>(null)
  const [copiedInvite, setCopiedInvite] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const fetchRooms = useCallback(async () => {
    if (!session) return
    try {
      const res = await fetch('/api/rooms')
      const data = await res.json()
      setRooms(data.rooms || [])
    } catch {}
    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const scheduledRooms = rooms.filter(r => r.scheduledAt)
  const unscheduledActive = rooms.filter(r => !r.scheduledAt && r.status !== 'ended')

  const filteredRooms = scheduledRooms.filter(r => {
    const q = searchQuery.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      (r.candidateName || '').toLowerCase().includes(q) ||
      (r.candidateEmail || '').toLowerCase().includes(q) ||
      (r.candidatePosition || '').toLowerCase().includes(q)
    )
  })

  const displayRooms = selectedDate
    ? filteredRooms.filter(r => r.scheduledAt && new Date(r.scheduledAt).toDateString() === selectedDate)
    : filteredRooms

  const sortedRooms = [...displayRooms].sort((a, b) => {
    if (!a.scheduledAt) return 1
    if (!b.scheduledAt) return -1
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  })

  const upcomingRooms = sortedRooms.filter(r => r.scheduledAt && isUpcoming(r.scheduledAt))
  const pastScheduledRooms = sortedRooms.filter(r => r.scheduledAt && !isUpcoming(r.scheduledAt))

  const scheduledDates = new Set(
    scheduledRooms
      .filter(r => r.scheduledAt)
      .map(r => {
        const d = new Date(r.scheduledAt!)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      })
  )

  const openEdit = (room: ScheduledRoom) => {
    setEditRoom(room)
    const d = room.scheduledAt ? new Date(room.scheduledAt) : null
    setEditForm({
      title: room.title,
      candidateName: room.candidateName || '',
      candidateEmail: room.candidateEmail || '',
      candidatePhone: room.candidatePhone || '',
      candidatePosition: room.candidatePosition || '',
      candidateLinkedin: room.candidateLinkedin || '',
      experienceLevel: room.experienceLevel || '',
      description: room.description || '',
      scheduledDate: d ? d.toISOString().slice(0, 10) : '',
      scheduledTime: d ? d.toTimeString().slice(0, 5) : '',
      durationMinutes: room.durationMinutes,
    })
    setEditError('')
  }

  const saveEdit = async () => {
    if (!editRoom || !editForm) return
    setEditSaving(true)
    setEditError('')
    try {
      let scheduledAt: string | undefined
      if (editForm.scheduledDate && editForm.scheduledTime) {
        scheduledAt = new Date(`${editForm.scheduledDate}T${editForm.scheduledTime}`).toISOString()
      }
      const res = await fetch(`/api/rooms/${editRoom.roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          candidateName: editForm.candidateName,
          candidateEmail: editForm.candidateEmail,
          candidatePhone: editForm.candidatePhone,
          candidatePosition: editForm.candidatePosition,
          candidateLinkedin: editForm.candidateLinkedin,
          experienceLevel: editForm.experienceLevel || undefined,
          description: editForm.description,
          scheduledAt,
          durationMinutes: editForm.durationMinutes,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setEditError(err.error || 'Failed to save')
        setEditSaving(false)
        return
      }
      setEditRoom(null)
      setEditForm(null)
      await fetchRooms()
    } catch {
      setEditError('Network error')
    }
    setEditSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteRoomId) return
    setDeleting(true)
    try {
      await fetch(`/api/rooms/${deleteRoomId}`, { method: 'DELETE' })
      setDeleteRoomId(null)
      await fetchRooms()
    } catch {}
    setDeleting(false)
  }

  const copyInvite = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/invite`)
      const data = await res.json()
      await navigator.clipboard.writeText(data.inviteLink)
      setCopiedId(roomId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  const createInterview = async () => {
    if (!createForm.scheduledDate || !createForm.scheduledTime) {
      setCreateError('Please select a date and time for the interview.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const scheduledAt = new Date(`${createForm.scheduledDate}T${createForm.scheduledTime}`).toISOString()
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createForm.title,
          durationMinutes: createForm.durationMinutes,
          hintsEnabled: createForm.hintsEnabled,
          maxHints: createForm.maxHints,
          scheduledAt,
          candidateName: createForm.candidateName || undefined,
          candidateEmail: createForm.candidateEmail || undefined,
          candidatePhone: createForm.candidatePhone || undefined,
          candidatePosition: createForm.candidatePosition || undefined,
          candidateLinkedin: createForm.candidateLinkedin || undefined,
          experienceLevel: createForm.experienceLevel || undefined,
          description: createForm.description || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setShowCreate(false)
        setCreateForm(DEFAULT_CREATE_FORM)
        setCreatedInterview({
          roomId: data.roomId,
          title: createForm.title,
          inviteLink: data.inviteLink,
        })
        await fetchRooms()
      } else {
        const err = await res.json()
        setCreateError(err.error || 'Failed to schedule interview')
      }
    } catch {
      setCreateError('Network error. Please try again.')
    }
    setCreating(false)
  }

  const copyCreatedInvite = async () => {
    if (!createdInterview) return
    await navigator.clipboard.writeText(createdInterview.inviteLink)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2500)
  }

  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth)
    const firstDay = getFirstDayOfMonth(calYear, calMonth)
    const cells: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    return (
      <div className="bg-surface border border-border rounded-2xl p-4 flex-shrink-0">
        {}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
              else setCalMonth(m => m - 1)
            }}
            className="p-1.5 rounded-lg hover:bg-bg text-muted hover:text-text transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-text">
            {MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button
            onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
              else setCalMonth(m => m + 1)
            }}
            className="p-1.5 rounded-lg hover:bg-bg text-muted hover:text-text transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-muted py-1">{d}</div>
          ))}
        </div>

        {}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const dateStr = new Date(calYear, calMonth, day).toDateString()
            const hasEvent = scheduledDates.has(`${calYear}-${calMonth}-${day}`)
            const isToday = today.getDate() === day && today.getMonth() === calMonth && today.getFullYear() === calYear
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-accent text-[#1a2a0e] font-semibold'
                    : isToday
                    ? 'bg-accent/15 text-accent font-semibold border border-accent/40'
                    : 'hover:bg-bg text-text'
                }`}
              >
                {day}
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </button>
            )
          })}
        </div>

        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="mt-3 w-full text-xs text-muted hover:text-text text-center transition-colors"
          >
            Clear filter
          </button>
        )}

        {}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Upcoming</span>
            <span className="font-semibold text-accent">{upcomingRooms.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Total scheduled</span>
            <span className="font-semibold text-text">{scheduledRooms.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">In progress</span>
            <span className="font-semibold text-success">{rooms.filter(r => r.status === 'active').length}</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Logo height={20} linked={false} className="opacity-60 animate-pulse" />
          <span className="font-mono text-sm">Loading schedule...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {}
      <nav className="border-b border-border px-6 py-3.5 flex items-center justify-between sticky top-0 bg-bg/95 backdrop-blur z-40">
        <div className="flex items-center gap-3">
        <Logo height={20} />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted flex items-center gap-1.5">
            <Calendar size={14} />
            Schedule
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-text flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: (session?.user as any)?.color || '#6366f1' }}
          >
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm text-muted hover:text-text flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Interview Schedule</h1>
            <p className="text-sm text-muted mt-1">
              {selectedDate
                ? `Showing interviews on ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                : 'Manage and track all your scheduled interviews'}
            </p>
          </div>
          <Button
            id="schedule-interview-btn"
            onClick={() => { setShowCreate(true); setCreateError('') }}
            variant="primary"
            icon={<Plus size={15} />}
          >
            Schedule Interview
          </Button>
        </div>

        <div className="flex gap-6 items-start">
          {}
          <div className="w-56 flex-shrink-0 space-y-4 hidden lg:block">
            {renderCalendar()}

            {}
            {unscheduledActive.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                  Active Rooms
                </h3>
                <div className="space-y-2">
                  {unscheduledActive.map(room => (
                    <Link
                      key={room.roomId}
                      href={`/room/${room.roomId}`}
                      className="flex items-center justify-between text-xs text-text hover:text-accent transition-colors group"
                    >
                      <span className="truncate">{room.title}</span>
                      <ArrowRight size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <div className="flex-1 min-w-0">
            {}
            <div className="relative mb-5">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, candidate, email or position..."
                className="w-full bg-surface border border-border text-text text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent transition-colors placeholder:text-muted/60"
              />
            </div>

            {sortedRooms.length === 0 && scheduledRooms.length === 0 ? (
              
              <div className="text-center py-20 bg-surface border border-border rounded-2xl">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-accent" size={28} />
                </div>
                <h2 className="text-lg font-semibold text-text mb-2">No interviews scheduled</h2>
                <p className="text-muted text-sm mb-6 max-w-xs mx-auto">
                  Schedule your first interview to start managing candidates and dates.
                </p>
                <Button
                  onClick={() => { setShowCreate(true); setCreateError('') }}
                  variant="primary"
                  icon={<Plus size={15} />}
                >
                  Schedule Interview
                </Button>
              </div>
            ) : displayRooms.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <BookOpen size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No interviews match your search or filter</p>
              </div>
            ) : (
              <div className="space-y-8">
                {}
                {upcomingRooms.length > 0 && (
                  <section>
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      Upcoming ({upcomingRooms.length})
                    </h2>
                    <div className="space-y-3">
                      {upcomingRooms.map(room => (
                        <InterviewCard
                          key={room.roomId}
                          room={room}
                          copiedId={copiedId}
                          onCopyInvite={copyInvite}
                          onEdit={openEdit}
                          onDelete={setDeleteRoomId}
                          isUpcoming={true}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {}
                {pastScheduledRooms.length > 0 && (
                  <section>
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                      Past Scheduled ({pastScheduledRooms.length})
                    </h2>
                    <div className="space-y-3">
                      {pastScheduledRooms.map(room => (
                        <InterviewCard
                          key={room.roomId}
                          room={room}
                          copiedId={copiedId}
                          onCopyInvite={copyInvite}
                          onEdit={openEdit}
                          onDelete={setDeleteRoomId}
                          isUpcoming={false}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {}
      {editRoom && editForm && (
        <Dialog open={true} onClose={() => { setEditRoom(null); setEditForm(null) }} maxWidth="max-w-lg">
          <DialogHeader onClose={() => { setEditRoom(null); setEditForm(null) }}>
            <div>
              <h2 className="font-semibold text-text">Edit Interview</h2>
              <p className="text-xs text-muted mt-0.5">{editRoom.roomId}</p>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-5 max-h-[70vh] overflow-y-auto">
            {}
            <div>
              <Input
                label="Session Title"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            {}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  <Calendar size={11} className="inline mr-1" />Date
                </label>
                <input
                  type="date"
                  value={editForm.scheduledDate}
                  onChange={e => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                  className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  <Clock size={11} className="inline mr-1" />Time
                </label>
                <input
                  type="time"
                  value={editForm.scheduledTime}
                  onChange={e => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                  className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms]"
                />
              </div>
            </div>

            {}
            <div>
              <label className="text-xs font-medium text-muted block mb-1.5">
                Duration: <span className="text-accent font-semibold">{editForm.durationMinutes} min</span>
              </label>
              <input
                type="range"
                min={15} max={120} step={15}
                value={editForm.durationMinutes}
                onChange={e => setEditForm({ ...editForm, durationMinutes: parseInt(e.target.value) })}
                className="w-full accent-accent bg-surface-3 rounded-lg h-2 appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted mt-1 px-1">
                <span>15m</span><span>30m</span><span>45m</span><span>60m</span><span>90m</span><span>120m</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Candidate Information</p>

              {}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
                  value={editForm.candidateName}
                  onChange={e => setEditForm({ ...editForm, candidateName: e.target.value })}
                  placeholder="Enter name"
                  iconLeft={<User size={12} />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={editForm.candidateEmail}
                  onChange={e => setEditForm({ ...editForm, candidateEmail: e.target.value })}
                  placeholder="example@gmail.com"
                  iconLeft={<Mail size={12} />}
                />
              </div>

              {}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone"
                  type="tel"
                  value={editForm.candidatePhone}
                  onChange={e => setEditForm({ ...editForm, candidatePhone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  iconLeft={<Phone size={12} />}
                />
                <Input
                  label="Position Applied"
                  value={editForm.candidatePosition}
                  onChange={e => setEditForm({ ...editForm, candidatePosition: e.target.value })}
                  placeholder="e.g. Frontend Engineer"
                  iconLeft={<Briefcase size={12} />}
                />
              </div>

              {}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="LinkedIn / Portfolio"
                  type="url"
                  value={editForm.candidateLinkedin}
                  onChange={e => setEditForm({ ...editForm, candidateLinkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  iconLeft={<Link2 size={12} />}
                />
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">
                    <Star size={11} className="inline mr-1" />Experience Level
                  </label>
                  <select
                    value={editForm.experienceLevel}
                    onChange={e => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                    className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 text-sm focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms]"
                  >
                    <option value="">Select level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="staff">Staff</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
              </div>

              {}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  <FileText size={11} className="inline mr-1" />Notes / Details
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer, discuss system design..."
                  className="w-full bg-surface border border-border text-text rounded-md px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms] resize-none leading-relaxed"
                />
              </div>
            </div>

            {editError && (
              <div className="flex items-center gap-2 text-xs text-danger bg-danger-soft border border-danger/20 rounded-md px-3 py-2">
                <AlertCircle size={13} />
                {editError}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={() => { setEditRoom(null); setEditForm(null) }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              loading={editSaving}
              variant="primary"
              icon={<Save size={14} />}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {}
      {deleteRoomId && (
        <Dialog open={true} onClose={() => setDeleteRoomId(null)} maxWidth="max-w-sm">
          <DialogBody className="p-6 text-center">
            <div className="w-12 h-12 bg-danger-soft rounded-full flex items-center justify-center mx-auto mb-4 border border-danger/20">
              <Trash2 className="text-danger" size={22} />
            </div>
            <h2 className="font-semibold text-text text-center mb-2">Cancel Interview?</h2>
            <p className="text-sm text-muted text-center mb-6">
              This will permanently delete the scheduled interview and cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteRoomId(null)}
                className="flex-1"
                variant="secondary"
              >
                Keep it
              </Button>
              <Button
                onClick={confirmDelete}
                loading={deleting}
                className="flex-1"
                variant="danger"
              >
                Yes, delete
              </Button>
            </div>
          </DialogBody>
        </Dialog>
      )}

      {}
      {showCreate && (
        <Dialog open={true} onClose={() => setShowCreate(false)} maxWidth="max-w-lg">
          <DialogHeader onClose={() => setShowCreate(false)}>
            <div>
              <h2 className="font-semibold text-text">Schedule New Interview</h2>
              <p className="text-xs text-muted mt-0.5">Fill in the candidate details and pick a time</p>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-5 max-h-[70vh] overflow-y-auto">
            {}
            <div>
              <Input
                required
                label="Session Title *"
                value={createForm.title}
                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer Round 2"
              />
            </div>

            {}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={11} />Schedule
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={createForm.scheduledDate}
                    onChange={e => setCreateForm({ ...createForm, scheduledDate: e.target.value })}
                    className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Time *</label>
                  <input
                    type="time"
                    value={createForm.scheduledTime}
                    onChange={e => setCreateForm({ ...createForm, scheduledTime: e.target.value })}
                    className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms]"
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <label className="text-xs font-medium text-muted block mb-1.5">
                Duration: <span className="text-accent font-semibold">{createForm.durationMinutes} min</span>
              </label>
              <input
                type="range"
                min={15} max={120} step={15}
                value={createForm.durationMinutes}
                onChange={e => setCreateForm({ ...createForm, durationMinutes: parseInt(e.target.value) })}
                className="w-full accent-accent bg-surface-3 rounded-lg h-2 appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted mt-1 px-1">
                <span>15m</span><span>30m</span><span>45m</span><span>60m</span><span>90m</span><span>120m</span>
              </div>
            </div>

            {}
            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <User size={11} />Candidate Information
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
                  value={createForm.candidateName}
                  onChange={e => setCreateForm({ ...createForm, candidateName: e.target.value })}
                  placeholder="Enter candidate name"
                  iconLeft={<User size={12} />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={createForm.candidateEmail}
                  onChange={e => setCreateForm({ ...createForm, candidateEmail: e.target.value })}
                  placeholder="example@gmail.com"
                  iconLeft={<Mail size={12} />}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone"
                  type="tel"
                  value={createForm.candidatePhone}
                  onChange={e => setCreateForm({ ...createForm, candidatePhone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  iconLeft={<Phone size={12} />}
                />
                <Input
                  label="Position Applied"
                  value={createForm.candidatePosition}
                  onChange={e => setCreateForm({ ...createForm, candidatePosition: e.target.value })}
                  placeholder="e.g. Frontend Engineer"
                  iconLeft={<Briefcase size={12} />}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="LinkedIn / Portfolio"
                  type="url"
                  value={createForm.candidateLinkedin}
                  onChange={e => setCreateForm({ ...createForm, candidateLinkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  iconLeft={<Link2 size={12} />}
                />
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">
                    <Star size={11} className="inline mr-1" />Experience Level
                  </label>
                  <select
                    value={createForm.experienceLevel}
                    onChange={e => setCreateForm({ ...createForm, experienceLevel: e.target.value })}
                    className="w-full h-9 bg-surface border border-border text-text rounded-md px-3 text-sm focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms]"
                  >
                    <option value="">Select level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="staff">Staff</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Notes / Details</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="e.g. Discuss React performance and system design..."
                  className="w-full bg-surface border border-border text-text rounded-md px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms] resize-none leading-relaxed"
                />
              </div>
            </div>

            {}
            <div className="border-t border-border pt-4">
              <Switch
                checked={createForm.hintsEnabled}
                onChange={v => setCreateForm({ ...createForm, hintsEnabled: v })}
                label="AI Hints"
                description="Allow candidate to request hints"
              />
            </div>

            {createError && (
              <div className="flex items-center gap-2 text-xs text-danger bg-danger-soft border border-danger/20 rounded-md px-3 py-2">
                <AlertCircle size={13} />
                {createError}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <div className="w-full space-y-3">
              <Button
                id="schedule-submit-btn"
                onClick={createInterview}
                disabled={creating}
                className="w-full"
                variant="primary"
                icon={<Calendar size={15} />}
              >
                {creating ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
              <p className="text-xs text-muted text-center">
                An invite link will be generated. Share it with the candidate.
              </p>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {}
      {createdInterview && (
        <Dialog open={true} onClose={() => setCreatedInterview(null)} maxWidth="max-w-md">
          <DialogBody className="p-8 text-center">
            <div className="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-5 border border-success/20">
              <CheckCircle2 className="text-success" size={32} />
            </div>
            <h2 className="text-xl font-bold text-text mb-1">Interview Scheduled!</h2>
            <p className="text-sm text-muted mb-6">
              <span className="font-medium text-text">{createdInterview.title}</span> has been scheduled. Share the invite link with your candidate.
            </p>

            {}
            <div className="bg-surface-2 border border-border rounded-xl p-4 mb-6 text-left">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">Candidate Invite Link</p>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs text-text font-mono truncate">{createdInterview.inviteLink}</p>
                <Button
                  onClick={copyCreatedInvite}
                  variant={copiedInvite ? 'success' : 'primary'}
                  size="sm"
                  className="flex-shrink-0"
                  icon={copiedInvite ? <Check size={12} /> : <Copy size={12} />}
                >
                  {copiedInvite ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCreatedInterview(null)}
                className="flex-1"
                variant="secondary"
              >
                Done
              </Button>
              <Link
                href={`/room/${createdInterview.roomId}`}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 px-4 text-sm rounded-md bg-accent hover:bg-accent-hover text-[#1a2a0e] font-medium transition-colors"
              >
                <ArrowRight size={14} /> Enter Room
              </Link>
            </div>
          </DialogBody>
        </Dialog>
      )}
    </div>
  )
}


function InterviewCard({
  room,
  copiedId,
  onCopyInvite,
  onEdit,
  onDelete,
  isUpcoming,
}: {
  room: ScheduledRoom
  copiedId: string | null
  onCopyInvite: (id: string) => void
  onEdit: (room: ScheduledRoom) => void
  onDelete: (id: string) => void
  isUpcoming: boolean
}) {
  const statusColor = room.status === 'active'
    ? 'text-success bg-success-soft border-success/25'
    : room.status === 'ended'
    ? 'text-muted bg-surface border-border'
    : isUpcoming
    ? 'text-accent bg-accent-soft border-accent/25'
    : 'text-muted bg-surface border-border'

  const statusLabel = room.status === 'active'
    ? 'Active'
    : room.status === 'ended'
    ? 'Ended'
    : isUpcoming
    ? 'Scheduled'
    : 'Past'

  return (
    <div className={`bg-surface border rounded-xl p-5 transition-all hover:shadow-sm ${
      isUpcoming ? 'border-border hover:border-accent/40' : 'border-border opacity-75 hover:opacity-100'
    }`}>
      <div className="flex items-start gap-4">
        {}
        {room.scheduledAt && (
          <div className={`flex-shrink-0 w-14 text-center rounded-xl py-2 border ${
            isUpcoming ? 'bg-accent-soft border-accent/25' : 'bg-surface border-border'
          }`}>
            <div className={`text-xs font-medium ${isUpcoming ? 'text-accent' : 'text-muted'}`}>
              {new Date(room.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className={`text-xl font-bold leading-none mt-0.5 ${isUpcoming ? 'text-accent' : 'text-muted'}`}>
              {new Date(room.scheduledAt).getDate()}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-semibold text-text text-sm truncate">{room.title}</h3>
            <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 flex-shrink-0 ${statusColor}`}>
              {statusLabel}
            </span>
            {room.experienceLevel && (
              <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 flex-shrink-0 ${
                (EXP_COLORS as any)[room.experienceLevel] || 'text-muted bg-surface border-border'
              }`}>
                {(EXP_LABELS as any)[room.experienceLevel]}
              </span>
            )}
            {isUpcoming && room.scheduledAt && (
              <span className="text-[10px] text-muted flex-shrink-0 bg-surface border border-border rounded-full px-2 py-0.5">
                {getRelativeTime(room.scheduledAt)}
              </span>
            )}
          </div>

          {}
          {room.scheduledAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
              <Clock size={11} />
              <span>{formatTime(room.scheduledAt)}</span>
              <span className="text-border">·</span>
              <Timer size={11} />
              <span>{room.durationMinutes} min</span>
            </div>
          )}

          {}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
            {room.candidateName && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <User size={11} className="text-accent" />
                {room.candidateName}
              </span>
            )}
            {room.candidateEmail && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Mail size={11} className="text-accent" />
                {room.candidateEmail}
              </span>
            )}
            {room.candidatePhone && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Phone size={11} className="text-accent" />
                {room.candidatePhone}
              </span>
            )}
            {room.candidatePosition && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Briefcase size={11} className="text-accent" />
                {room.candidatePosition}
              </span>
            )}
            {room.candidateLinkedin && (
              <a
                href={room.candidateLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-accent hover:underline"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={11} />
                Profile
              </a>
            )}
          </div>

          {}
          {room.description && (
            <p className="text-xs text-muted italic line-clamp-1 border-l-2 border-border pl-2 mt-1">
              {room.description}
            </p>
          )}

          {}
          {room.hintsEnabled && (
            <div className="flex items-center gap-1 text-xs text-muted mt-2">
              <Lightbulb size={11} className="text-warning" />
              <span>AI hints: up to {room.maxHints}</span>
            </div>
          )}
        </div>

        {}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {room.status !== 'ended' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyInvite(room.roomId)}
                title="Copy invite link"
                className="h-8 w-8 p-0"
                icon={copiedId === room.roomId ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(room)}
                title="Edit details"
                className="h-8 w-8 p-0 hover:text-accent hover:bg-accent-soft"
                icon={<Edit3 size={14} />}
              />
              <Link
                href={`/room/${room.roomId}`}
                title="Enter room"
                className="inline-flex items-center justify-center text-muted hover:text-text hover:bg-surface-2 h-8 w-8 rounded-md transition-colors"
              >
                <ArrowRight size={14} />
              </Link>
            </>
          )}
          {room.status === 'ended' && (
            <Link
              href={`/room/${room.roomId}/replay`}
              className="flex items-center gap-1.5 text-xs text-text hover:text-accent bg-surface border border-border hover:border-accent rounded-lg px-2.5 py-1.5 transition-all"
            >
              View Replay
            </Link>
          )}
          {room.status !== 'active' && room.status !== 'ended' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(room.roomId)}
              title="Delete interview"
              className="h-8 w-8 p-0 hover:text-danger hover:bg-danger-soft"
              icon={<Trash2 size={14} />}
            />
          )}
        </div>
      </div>
    </div>
  )
}
