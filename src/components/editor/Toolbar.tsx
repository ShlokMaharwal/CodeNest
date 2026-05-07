'use client'
import { useEffect } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { LANGUAGE_LABELS } from '@/types'

interface ToolbarProps {
  language: string
  onLanguageChange: (lang: string) => void
  onRun: () => void
  executing: boolean
}

export function Toolbar({ language, onLanguageChange, onRun, executing }: ToolbarProps) {
  useEffect(() => {
    const handler = () => { if (!executing) onRun() }
    window.addEventListener('run-code', handler)
    return () => window.removeEventListener('run-code', handler)
  }, [onRun, executing])

  return (
    <div className="h-10 border-b border-border bg-surface flex items-center justify-between px-4 flex-shrink-0">

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Language</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-bg border border-border text-text text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-accent transition-colors cursor-pointer"
        >
          {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>


      <button
        onClick={onRun}
        disabled={executing}
        className="flex items-center gap-2 bg-green/10 hover:bg-green/20 border border-green/30 text-green text-xs font-semibold px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {executing ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play size={13} className="fill-green" />
            Run Code
            <span className="text-green/50 font-normal ml-0.5 hidden sm:inline">⌘↵</span>
          </>
        )}
      </button>
    </div>
  )
}
