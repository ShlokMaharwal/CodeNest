'use client'
import { useState } from 'react'
import { TestCase } from '@/types'
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react'

interface TestCasePanelProps {
  testCases: TestCase[]
  onChange: (cases: TestCase[]) => void
  readOnly?: boolean
}

function getStatusPill(tc: TestCase) {
  if (tc.passed === undefined) return <span className="text-[10px] text-subtle bg-surface-2 border border-border rounded-full px-2 py-0.5">Pending</span>
  if (tc.passed) return (
    <span className="text-[10px] text-success bg-success-soft border border-success/25 rounded-full px-2 py-0.5 flex items-center gap-1">
      <CheckCircle2 size={9} />Pass
    </span>
  )
  return (
    <span className="text-[10px] text-danger bg-danger-soft border border-danger/25 rounded-full px-2 py-0.5 flex items-center gap-1">
      <XCircle size={9} />Fail
    </span>
  )
}

export function TestCasePanel({ testCases, onChange, readOnly = false }: TestCasePanelProps) {
  const add = () => onChange([...testCases, { input: '', expectedOutput: '' }])
  const remove = (i: number) => onChange(testCases.filter((_, idx) => idx !== i))
  const update = (i: number, key: keyof TestCase, val: string) => {
    const next = [...testCases]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted">{testCases.length} test case{testCases.length !== 1 ? 's' : ''}</span>
        {!readOnly && (
          <button onClick={add} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors font-medium">
            <Plus size={12} />Add
          </button>
        )}
      </div>

      <div className="space-y-3">
        {testCases.map((tc, i) => (
          <div key={i} className="bg-surface border border-border rounded-md p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-subtle font-semibold">#{i + 1}</span>
                {getStatusPill(tc)}
              </div>
              {!readOnly && (
                <button
                  onClick={() => remove(i)}
                  disabled={testCases.length <= 1}
                  className="text-muted hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Delete test case"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <div>
              <label className="text-[10px] font-medium text-subtle uppercase tracking-wider mb-1 block">Input (stdin)</label>
              <textarea
                rows={2}
                value={tc.input}
                onChange={e => update(i, 'input', e.target.value)}
                readOnly={readOnly}
                placeholder="Input for this test case…"
                className="w-full bg-bg border border-border rounded text-xs font-mono p-2 text-text resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-subtle"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-subtle uppercase tracking-wider mb-1 block">Expected output</label>
              <textarea
                rows={2}
                value={tc.expectedOutput}
                onChange={e => update(i, 'expectedOutput', e.target.value)}
                readOnly={readOnly}
                placeholder="Expected output…"
                className="w-full bg-bg border border-border rounded text-xs font-mono p-2 text-text resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-subtle"
              />
            </div>

            {}
            {tc.passed !== undefined && tc.actualOutput !== undefined && (
              <div className={`rounded p-2 text-[10px] font-mono ${tc.passed ? 'bg-success-soft border border-success/20' : 'bg-danger-soft border border-danger/20'}`}>
                <div className={tc.passed ? 'text-success' : 'text-danger'}>
                  <strong>Got:</strong> {tc.actualOutput || '(empty)'}
                </div>
                {!tc.passed && <div className="text-muted mt-0.5"><strong>Expected:</strong> {tc.expectedOutput}</div>}
                {tc.stderr && <div className="text-danger mt-0.5 whitespace-pre-wrap">{tc.stderr}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
