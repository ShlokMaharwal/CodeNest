'use client'
import { ExecutionResult } from '@/types'
import { Play, Loader2, CheckCircle2, XCircle, Clock, Cpu, AlertTriangle } from 'lucide-react'

interface OutputPanelProps {
  output: ExecutionResult | null
  executing: boolean
}

export function OutputPanel({ output, executing }: OutputPanelProps) {
  if (executing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
        <Loader2 size={22} className="animate-spin text-accent" />
        <span className="text-sm font-mono">Executing…</span>
      </div>
    )
  }

  if (!output) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 text-muted">
        <Play size={22} className="text-subtle mb-3 opacity-50" />
        <p className="text-sm font-medium text-text mb-1">Run your code</p>
        <p className="text-xs text-muted">Press <kbd className="font-mono bg-surface border border-border rounded px-1.5 py-0.5 text-[10px]">⌘↵</kbd> to execute</p>
      </div>
    )
  }

  const allTestsPassed = output.testCases && output.testCases.length > 0 && output.testCases.every(tc => tc.passed)
  const anyTestFailed  = output.testCases && output.testCases.some(tc => tc.passed === false)
  const hasError = output.stderr && !anyTestFailed

  const statusBar = () => {
    if (allTestsPassed) return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-success-soft border-b border-success/20 text-success text-xs font-medium">
        <CheckCircle2 size={14} />
        <span>All {output.testCases!.length} tests passed</span>
        <span className="ml-auto flex items-center gap-3 text-success/70">
          <span className="flex items-center gap-1"><Clock size={10} />{output.time}s</span>
          <span className="flex items-center gap-1"><Cpu size={10} />{output.memory} KB</span>
        </span>
      </div>
    )
    if (anyTestFailed) return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-danger-soft border-b border-danger/20 text-danger text-xs font-medium">
        <XCircle size={14} />
        <span>{output.testCases!.filter(tc => tc.passed === false).length}/{output.testCases!.length} tests failed</span>
        <span className="ml-auto flex items-center gap-3 text-danger/70">
          <span className="flex items-center gap-1"><Clock size={10} />{output.time}s</span>
        </span>
      </div>
    )
    if (hasError) return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-soft border-b border-warning/20 text-warning text-xs font-medium">
        <AlertTriangle size={14} /><span>{output.status}</span>
      </div>
    )
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border-b border-border text-muted text-xs">
        <span className="font-mono">{output.status}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1"><Clock size={10} />{output.time}s</span>
          <span className="flex items-center gap-1"><Cpu size={10} />{output.memory} KB</span>
        </span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {statusBar()}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {output.stdout && (
          <div>
            <div className="text-[10px] font-medium text-subtle uppercase tracking-wider mb-1">Stdout</div>
            <pre className="bg-surface-2 border border-border rounded-md p-3 font-mono text-xs overflow-x-auto whitespace-pre-wrap text-text">{output.stdout}</pre>
          </div>
        )}
        {output.stderr && (
          <div>
            <div className="text-[10px] font-medium text-danger uppercase tracking-wider mb-1">Stderr</div>
            <pre className="bg-danger-soft border border-danger/20 rounded-md p-3 font-mono text-xs overflow-x-auto whitespace-pre-wrap text-danger">{output.stderr}</pre>
          </div>
        )}
        {output.testCases && output.testCases.length > 0 && (
          <div>
            <div className="text-[10px] font-medium text-subtle uppercase tracking-wider mb-2">Test results</div>
            <div className="space-y-1.5">
              {output.testCases.map((tc, i) => (
                <div key={i} className={`rounded-md p-2.5 text-xs border ${tc.passed ? 'bg-success-soft border-success/20' : 'bg-danger-soft border-danger/20'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {tc.passed ? <CheckCircle2 size={11} className="text-success" /> : <XCircle size={11} className="text-danger" />}
                    <span className={`font-semibold ${tc.passed ? 'text-success' : 'text-danger'}`}>Test {i + 1}</span>
                  </div>
                  {!tc.passed && (
                    <div className="font-mono text-[10px] space-y-0.5 text-muted mt-1">
                      <div><span className="text-text">Expected:</span> {tc.expectedOutput}</div>
                      <div><span className="text-text">Got:</span> {tc.actualOutput || '(empty)'}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
