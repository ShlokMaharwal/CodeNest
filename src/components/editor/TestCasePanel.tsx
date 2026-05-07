'use client'
import { TestCase } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

interface TestCasePanelProps {
  testCases: TestCase[]
  onChange: (testCases: TestCase[]) => void
}

export function TestCasePanel({ testCases, onChange }: TestCasePanelProps) {
  const addTestCase = () => {
    onChange([...testCases, { input: '', expectedOutput: '' }])
  }

  const removeTestCase = (index: number) => {
    onChange(testCases.filter((_, i) => i !== index))
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updated = testCases.map((tc, i) =>
      i === index ? { ...tc, [field]: value } : tc
    )
    onChange(updated)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <span className="text-xs text-muted">{testCases.length} test case{testCases.length !== 1 ? 's' : ''}</span>
        <button
          onClick={addTestCase}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {testCases.map((tc, index) => (
          <div key={index} className="bg-bg border border-border rounded-xl p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono text-muted">Case {index + 1}</span>
              {testCases.length > 1 && (
                <button
                  onClick={() => removeTestCase(index)}
                  className="text-muted hover:text-red transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <label className="text-xs text-muted block mb-1">stdin / Input</label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                  placeholder="e.g. 5\n3 1 4 1 5"
                  rows={2}
                  className="w-full bg-surface border border-border text-text placeholder-muted rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent resize-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Expected Output</label>
                <textarea
                  value={tc.expectedOutput}
                  onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                  placeholder="e.g. 14"
                  rows={2}
                  className="w-full bg-surface border border-border text-text placeholder-muted rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent resize-none transition-colors"
                />
              </div>


              {tc.actualOutput !== undefined && (
                <div className={`rounded-lg px-3 py-2 text-xs font-mono border ${
                  tc.isCustomInput
                    ? 'bg-accent/5 border-accent/20 text-accent'
                    : tc.passed
                    ? 'bg-green/5 border-green/20 text-green'
                    : 'bg-red/5 border-red/20 text-red'
                }`}>
                  {tc.isCustomInput 
                    ? `Output: ${tc.actualOutput || '(empty)'}` 
                    : tc.passed 
                      ? '✅ Passed' 
                      : `❌ Got: ${tc.actualOutput}`}
                </div>
              )}
            </div>
          </div>
        ))}

        {testCases.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted text-xs text-center">
            <div>
              <p>No test cases yet.</p>
              <button onClick={addTestCase} className="text-accent mt-1">Add one</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
