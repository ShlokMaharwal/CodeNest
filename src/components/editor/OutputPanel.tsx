'use client'
import { ExecutionResult } from '@/types'
import { Loader2, CheckCircle2, XCircle, Clock, Cpu } from 'lucide-react'

interface OutputPanelProps {
  output: ExecutionResult | null
  executing: boolean
}

export function OutputPanel({ output, executing }: OutputPanelProps) {
  if (executing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="text-xs font-mono">Executing code...</span>
        </div>
      </div>
    )
  }

  if (!output) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted">
          <div className="text-3xl mb-3">▶</div>
          <p className="text-xs">Run your code to see output</p>
          <p className="text-xs mt-1 text-muted/60">Press ⌘↵ or click Run</p>
        </div>
      </div>
    )
  }

  const isSuccess = output.status === 'Accepted' || output.status?.includes('Passed')
  const isError = output.stderr || output.status === 'Error'

  return (
    <div className="h-full flex flex-col overflow-hidden">

      <div className={`flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0 ${
        isError ? 'bg-red/5' : isSuccess ? 'bg-green/5' : 'bg-yellow/5'
      }`}>
        <div className="flex items-center gap-2">
          {isError ? (
            <XCircle size={14} className="text-red" />
          ) : isSuccess ? (
            <CheckCircle2 size={14} className="text-green" />
          ) : (
            <XCircle size={14} className="text-yellow" />
          )}
          <span className={`text-xs font-semibold ${
            isError ? 'text-red' : isSuccess ? 'text-green' : 'text-yellow'
          }`}>
            {output.status}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          {output.time && (
            <span className="flex items-center gap-1">
              <Clock size={10} /> {output.time}s
            </span>
          )}
          {output.memory > 0 && (
            <span className="flex items-center gap-1">
              <Cpu size={10} /> {(output.memory / 1024).toFixed(1)}MB
            </span>
          )}
        </div>
      </div>


      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

        {output.stdout && (
          <div>
            <p className="text-xs text-muted mb-1.5 font-mono uppercase tracking-wider">stdout</p>
            <pre className="bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text whitespace-pre-wrap break-words leading-relaxed">
              {output.stdout}
            </pre>
          </div>
        )}


        {output.stderr && (
          <div>
            <p className="text-xs text-red mb-1.5 font-mono uppercase tracking-wider">stderr</p>
            <pre className="bg-red/5 border border-red/20 rounded-lg p-3 text-xs font-mono text-red whitespace-pre-wrap break-words leading-relaxed">
              {output.stderr}
            </pre>
          </div>
        )}


        {output.testCases && output.testCases.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted font-mono uppercase tracking-wider">Test Cases</p>
            {output.testCases.map((tc, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 border text-xs font-mono ${
                  tc.passed
                    ? 'bg-green/5 border-green/20'
                    : 'bg-red/5 border-red/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={tc.passed ? 'text-green' : 'text-red'}>
                    {tc.passed ? '✅ Test ' : '❌ Test '}{i + 1}
                  </span>
                </div>
                {!tc.passed && (
                  <div className="flex flex-col gap-1 text-muted mt-1">
                    <span>Expected: <span className="text-text">{tc.expectedOutput}</span></span>
                    <span>Got: <span className="text-red">{tc.actualOutput}</span></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
