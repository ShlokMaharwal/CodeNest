'use client'
import { FileText } from 'lucide-react'

interface NotesPanelProps {
  notes: string
  onChange: (notes: string) => void
}

export function NotesPanel({ notes, onChange }: NotesPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <FileText size={13} className="text-muted" />
        <span className="text-xs text-muted">Shared notes — synced live with your partner</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Use this space for:\n• Problem breakdown\n• Complexity analysis\n• Edge cases\n• Approach notes\n\nBoth users see changes in real time...`}
        className="flex-1 bg-transparent text-text placeholder-muted text-sm font-mono p-4 resize-none focus:outline-none leading-relaxed"
      />
      <div className="px-4 py-2 border-t border-border flex-shrink-0">
        <span className="text-xs text-muted">{notes.length} chars</span>
      </div>
    </div>
  )
}
