'use client'
import { useState } from 'react'
import {
  Lock, Unlock, Edit3, RotateCcw, BookOpen, StopCircle, Clock, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InterviewerBarProps {
  editorLocked: boolean
  controlledBy: 'interviewer' | 'candidate'
  onLockEditor: () => void
  onUnlockEditor: () => void
  onTakeControl: () => void
  onReturnControl: () => void
  onChangeProblem: () => void
  onEndInterview: () => void
  timerStartedAt?: number
  timerDurationMs?: number
  onStartTimer?: (durationMinutes: number) => void
}

const DURATIONS = [5, 15, 30, 45, 60, 90, 120]

export function InterviewerBar({
  editorLocked, controlledBy,
  onLockEditor, onUnlockEditor, onTakeControl, onReturnControl,
  onChangeProblem, onEndInterview,
  timerStartedAt, timerDurationMs, onStartTimer,
}: InterviewerBarProps) {
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(45)

  const handleEndClick = () => {
    if (confirmEnd) { onEndInterview(); setConfirmEnd(false) }
    else { setConfirmEnd(true); setTimeout(() => setConfirmEnd(false), 3000) }
  }

  const ghostBtn = 'flex items-center gap-1.5 text-xs text-muted hover:text-text hover:bg-surface-3 rounded-md px-2.5 py-1.5 transition-colors duration-[120ms]'
  const activeBtn = 'flex items-center gap-1.5 text-xs text-accent bg-accent-soft border border-accent/25 rounded-md px-2.5 py-1.5 transition-colors'
  const warnBtn   = 'flex items-center gap-1.5 text-xs text-warning bg-warning-soft border border-warning/25 rounded-md px-2.5 py-1.5 transition-colors'

  return (
    <div className="h-10 bg-surface-2 border-b border-border flex items-center px-3 gap-1.5 flex-shrink-0">
      {}
      <div className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent-soft border border-accent/25 rounded-full px-2.5 py-0.5 mr-1 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
        Interviewer
      </div>
      <div className="h-4 w-px bg-border" />

      {}
      {editorLocked ? (
        <button onClick={onUnlockEditor} className={warnBtn} title="Unlock editor">
          <Unlock size={12} />Unlock editor
        </button>
      ) : (
        <button onClick={onLockEditor} className={ghostBtn} title="Lock editor">
          <Lock size={12} />Lock editor
        </button>
      )}

      {}
      {controlledBy === 'candidate' ? (
        <button onClick={onTakeControl} className={ghostBtn} title="Take control">
          <Edit3 size={12} />Take control
        </button>
      ) : (
        <button onClick={onReturnControl} className={activeBtn} title="Return control to candidate">
          <RotateCcw size={12} />Return control
        </button>
      )}

      {}
      <button onClick={onChangeProblem} className={ghostBtn} title="Change problem">
        <BookOpen size={12} />Change problem
      </button>
      <div className="h-4 w-px bg-border" />

      {}
      {!timerStartedAt ? (
        <div className="flex items-center gap-1 bg-bg border border-border rounded-md px-1.5 py-0.5">
          <Clock size={11} className="text-subtle" />
          <div className="relative">
            <select
              value={selectedDuration}
              onChange={e => setSelectedDuration(Number(e.target.value))}
              className="bg-transparent text-xs text-text border-none focus:outline-none cursor-pointer pr-4 py-0.5 font-mono appearance-none"
            >
              {DURATIONS.map(d => <option key={d} value={d} className="bg-bg">{d}m</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
          </div>
          <button
            onClick={() => onStartTimer?.(selectedDuration)}
            className="bg-accent hover:bg-accent-hover text-[#1a2a0e] text-[10px] font-semibold px-2 py-0.5 rounded transition-colors uppercase tracking-wider"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-success bg-success-soft border border-success/25 rounded-md px-2.5 py-1">
          <Clock size={11} className="animate-pulse-slow" />
          <span>Timer running</span>
          <button
            onClick={() => confirm('Reset current timer?') && onStartTimer?.(selectedDuration)}
            className="text-[10px] text-subtle hover:text-text hover:underline ml-1"
          >Reset</button>
        </div>
      )}

      <div className="flex-1" />

      {}
      <AnimatePresence mode="wait">
        <motion.button
          key={String(confirmEnd)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          onClick={handleEndClick}
          className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-1.5 transition-all ${
            confirmEnd
              ? 'bg-danger text-white border border-danger animate-pulse-slow'
              : 'text-danger border border-danger/30 hover:bg-danger-soft'
          }`}
        >
          <StopCircle size={12} />
          {confirmEnd ? 'Click again to confirm' : 'End interview'}
        </motion.button>
      </AnimatePresence>
    </div>
  )
}
