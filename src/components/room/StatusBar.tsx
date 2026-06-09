'use client'

interface StatusBarProps {
  language: string
  cursorLine?: number
  cursorCol?: number
  latencyMs?: number
}

const LANG_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', cpp: 'C++', c: 'C', go: 'Go', rust: 'Rust',
}

export function StatusBar({ language, cursorLine = 1, cursorCol = 1, latencyMs }: StatusBarProps) {
  const latencyColor = !latencyMs ? 'bg-muted' : latencyMs < 100 ? 'bg-success' : latencyMs < 300 ? 'bg-warning' : 'bg-danger'

  return (
    <div className="h-7 border-t border-border bg-surface-2 px-3 flex items-center gap-4 text-[11px] text-subtle font-mono flex-shrink-0">
      <span>{LANG_DISPLAY[language] || language}</span>
      <span>LF</span>
      <span>UTF-8</span>
      <span>Spaces: 2</span>
      <span className="ml-auto">Ln {cursorLine}, Col {cursorCol}</span>
      {latencyMs !== undefined && (
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${latencyColor}`} />
          {latencyMs}ms
        </span>
      )}
    </div>
  )
}
