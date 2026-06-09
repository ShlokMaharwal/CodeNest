'use client'
import { cn } from '@/lib/cn'

type Status = 'waiting' | 'scheduled' | 'active' | 'ended' | 'draft' | 'live'
type Difficulty = 'Easy' | 'Medium' | 'Hard'
type Experience = 'junior' | 'mid' | 'senior' | 'staff' | 'principal'

const STATUS_CLASSES: Record<Status, string> = {
  waiting:   'text-warning   bg-warning-soft   border-warning/25',
  scheduled: 'text-info      bg-info-soft      border-info/25',
  active:    'text-success   bg-success-soft   border-success/25',
  live:      'text-success   bg-success-soft   border-success/25',
  ended:     'text-subtle    bg-surface-2      border-border',
  draft:     'text-subtle    bg-surface-2      border-border',
}

const STATUS_LABELS: Record<Status, string> = {
  waiting:   'Waiting',
  scheduled: 'Scheduled',
  active:    'Live',
  live:      'Live',
  ended:     'Ended',
  draft:     'Draft',
}

const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  Easy:   'text-success bg-success-soft border-success/25',
  Medium: 'text-warning bg-warning-soft border-warning/25',
  Hard:   'text-danger  bg-danger-soft  border-danger/25',
}

const EXP_CLASSES: Record<Experience, string> = {
  junior:    'text-info    bg-info-soft    border-info/25',
  mid:       'text-success bg-success-soft border-success/25',
  senior:    'text-accent  bg-accent-soft  border-accent/25',
  staff:     'text-warning bg-warning-soft border-warning/25',
  principal: 'text-danger  bg-danger-soft  border-danger/25',
}

const EXP_LABELS: Record<Experience, string> = {
  junior:    'Junior',
  mid:       'Mid-level',
  senior:    'Senior',
  staff:     'Staff',
  principal: 'Principal',
}

interface PillProps {
  children?: React.ReactNode
  className?: string
}

const base = 'inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-xs font-medium'

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={cn(base, STATUS_CLASSES[status])}>
      {status === 'active' || status === 'live' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
      ) : null}
      {STATUS_LABELS[status]}
    </span>
  )
}

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={cn(base, DIFFICULTY_CLASSES[difficulty])}>
      {difficulty}
    </span>
  )
}

export function ExperiencePill({ level }: { level: Experience }) {
  return (
    <span className={cn(base, EXP_CLASSES[level])}>
      {EXP_LABELS[level]}
    </span>
  )
}

export function Pill({ children, className }: PillProps) {
  return <span className={cn(base, 'bg-surface-2 border-border text-muted', className)}>{children}</span>
}
