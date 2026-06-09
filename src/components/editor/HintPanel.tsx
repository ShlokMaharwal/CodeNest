'use client'
import { useState } from 'react'
import { Lightbulb, Loader2, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HintPanelProps {
  
  roomId?: string
  problemTitle?: string
  problemDescription?: string
  code?: string
  language?: string
  onHintUsed?: (hint: string) => void
  
  hints?: string[]
  hintsEnabled: boolean
  maxHints: number
  hintsUsed?: number
  onRequestHint?: () => void
  loading?: boolean
  error?: string
}

export function HintPanel({
  roomId, problemTitle, problemDescription, code, language,
  onHintUsed, hints: externalHints, hintsEnabled, maxHints,
  hintsUsed: externalHintsUsed, onRequestHint, loading: externalLoading, error: externalError,
}: HintPanelProps) {
  const [internalHints, setInternalHints] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  
  const hints        = externalHints !== undefined ? externalHints : internalHints
  const hintsUsedNum = externalHintsUsed !== undefined ? externalHintsUsed : hints.length
  const isLoading    = externalLoading !== undefined ? externalLoading : loading
  const displayError = externalError || error

  const requestHint = async () => {
    if (onRequestHint) { onRequestHint(); return }
    if (!roomId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, problemTitle, problemDescription, code, language, hintsUsed: hintsUsedNum }),
      })
      const data = await res.json()
      if (data.hint) {
        setInternalHints(prev => [...prev, data.hint])
        onHintUsed?.(data.hint)
      } else {
        setError(data.error || 'Failed to generate hint')
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  if (!hintsEnabled) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <Lock size={20} className="text-subtle mb-2" />
        <p className="text-sm font-medium text-text mb-1">Hints disabled</p>
        <p className="text-xs text-muted">The interviewer has disabled hints for this session.</p>
      </div>
    )
  }

  const exhausted = hintsUsedNum >= maxHints

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Lightbulb size={13} className="text-warning" />
          <span className="text-xs font-medium text-muted">Hints</span>
        </div>
        <span className="text-[10px] font-mono bg-surface border border-border rounded px-1.5 py-0.5 text-muted">
          {hintsUsedNum}/{maxHints}
        </span>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {hints.length === 0 && (
          <p className="text-xs text-muted text-center pt-6">No hints yet. Request your first hint below.</p>
        )}
        <AnimatePresence>
          {hints.map((hint, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-warning-soft border border-warning/30 rounded-md p-3"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb size={11} className="text-warning" />
                <span className="text-[10px] font-semibold text-warning uppercase tracking-wider">Hint {i + 1}</span>
              </div>
              <p className="text-xs text-text leading-relaxed">{hint}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {displayError && <p className="text-xs text-danger text-center">{displayError}</p>}
      </div>

      {}
      <div className="p-3 border-t border-border flex-shrink-0">
        <button
          onClick={requestHint}
          disabled={isLoading || exhausted}
          className="w-full flex items-center justify-center gap-2 bg-warning-soft hover:bg-warning/15 border border-warning/30 text-warning text-xs font-medium h-9 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 size={13} className="animate-spin" />Requesting…</>
          ) : exhausted ? (
            <><Lock size={13} />No hints remaining</>
          ) : (
            <><Lightbulb size={13} />Request hint ({maxHints - hintsUsedNum} left)</>
          )}
        </button>
      </div>
    </div>
  )
}
