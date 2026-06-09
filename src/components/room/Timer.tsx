'use client'
import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface TimerProps {
  startedAt?: number
  durationMs?: number
}

export function Timer({ startedAt, durationMs }: TimerProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  if (!startedAt || !durationMs) return null

  const remaining = Math.max(0, durationMs - (Date.now() - startedAt))
  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  const display = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  const ended   = remaining === 0
  const danger  = remaining <= 60 * 1000 && !ended
  const warning = remaining <= 5 * 60 * 1000 && !danger && !ended

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 border rounded-md px-2.5 py-1 text-xs font-mono transition-all',
        ended   && 'bg-danger-soft  border-danger/30  text-danger',
        danger  && 'bg-danger-soft  border-danger/30  text-danger  animate-pulse-slow',
        warning && 'bg-warning-soft border-warning/30 text-warning animate-pulse-slow',
        !warning && !danger && !ended && 'bg-surface-2 border-border text-muted',
      )}
      aria-live="polite"
      aria-label={ended ? "Time's up" : `${display} remaining`}
    >
      {(warning || danger) ? <AlertTriangle size={11} /> : <Clock size={11} />}
      {ended ? "Time's up" : display}
    </div>
  )
}
