'use client'
import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'

interface NotesPanelProps {
  notes: string
  onChange: (notes: string) => void
  readOnly?: boolean
}

export function NotesPanel({ notes, onChange, readOnly = false }: NotesPanelProps) {
  const [saving, setSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (v: string) => {
    if (readOnly) return
    onChange(v)
    setSaving(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSaving(false), 800)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-muted" />
          <span className="text-xs font-medium text-muted">Shared notes</span>
          <span className="text-[10px] text-subtle">· synced live</span>
        </div>
        <div className="flex items-center gap-1.5">
          {saving ? (
            <span className="text-[10px] text-muted flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-warning animate-pulse" />Saving…
            </span>
          ) : (
            <span className="text-[10px] text-subtle flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-success" />Saved
            </span>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          value={notes}
          onChange={e => handleChange(e.target.value)}
          readOnly={readOnly}
          placeholder={readOnly ? 'Notes will appear here…' : 'Type notes here… (Markdown supported)\n\n# Observations\n- …\n\n# Follow-up questions\n- …'}
          className="flex-1 w-full bg-transparent text-sm font-mono text-text placeholder:text-subtle resize-none p-3 focus:outline-none leading-relaxed"
        />
      </div>

      {}
      <div className="px-3 py-1.5 border-t border-border flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] text-subtle">{notes.length} chars</span>
        <span className="text-[10px] text-subtle">Markdown supported</span>
      </div>
    </div>
  )
}
