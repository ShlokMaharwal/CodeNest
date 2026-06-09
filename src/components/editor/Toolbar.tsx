'use client'
import { useEffect } from 'react'
import { Play, Loader2, ChevronDown } from 'lucide-react'
import { LANGUAGE_LABELS } from '@/types'

interface ToolbarProps {
  language: string
  onLanguageChange: (lang: string) => void
  onRun: () => void
  executing: boolean
  readOnly?: boolean
}

export function Toolbar({ language, onLanguageChange, onRun, executing, readOnly = false }: ToolbarProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!executing) onRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onRun, executing])

  return (
    <div className="h-10 border-b border-border bg-surface flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs text-subtle">Language</span>
        <div className="relative">
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
            disabled={readOnly}
            className="bg-bg border border-border text-text text-xs font-mono rounded-md pl-2.5 pr-7 py-1.5 appearance-none focus:outline-none focus:border-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={executing}
        className="flex items-center gap-2 bg-success-soft hover:bg-success/15 border border-success/30 text-success text-xs font-semibold h-8 px-4 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {executing ? (
          <><Loader2 size={12} className="animate-spin" />Running…</>
        ) : (
          <>
            <Play size={12} className="fill-success" />
            Run code
            <kbd className="text-success/50 font-mono text-[10px] hidden sm:inline">⌘↵</kbd>
          </>
        )}
      </button>
    </div>
  )
}
