import { useState, useEffect, useCallback } from 'react'
import { Search, BookOpen, Plus, Trash2, Code2 } from 'lucide-react'
import { Problem } from '@/types'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProblemPickerProps {
  onSelect: (problem: Problem) => void
  onClose: () => void
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const
const DIFF_COLORS = {
  Easy: 'text-success bg-success-soft border-success/25',
  Medium: 'text-warning bg-warning-soft border-warning/25',
  Hard: 'text-danger bg-danger-soft border-danger/25',
}

export function ProblemPicker({ onSelect, onClose }: ProblemPickerProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  
  const [mode, setMode] = useState<'picker' | 'custom'>('picker')
  const [customTitle, setCustomTitle] = useState('')
  const [customDifficulty, setCustomDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [customDesc, setCustomDesc] = useState('')
  const [customStarter, setCustomStarter] = useState(`// JavaScript\nfunction solution() {\n  // Your code here\n}`)
  const [customTestcases, setCustomTestcases] = useState<{ input: string; expectedOutput: string; isHidden: boolean }[]>([
    { input: '', expectedOutput: '', isHidden: false }
  ])

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (difficulty !== 'All') params.set('difficulty', difficulty)

      const res = await fetch(`/api/problems?${params}`)
      const data = await res.json()
      setProblems(data.problems || [])
      setTotal(data.total || 0)
    } catch {
      setProblems([])
    } finally {
      setLoading(false)
    }
  }, [search, difficulty])

  useEffect(() => {
    const timer = setTimeout(fetchProblems, 300)
    return () => clearTimeout(timer)
  }, [fetchProblems])

  const addTestcase = () => {
    setCustomTestcases((prev) => [...prev, { input: '', expectedOutput: '', isHidden: false }])
  }

  const removeTestcase = (index: number) => {
    if (customTestcases.length <= 1) return
    setCustomTestcases((prev) => prev.filter((_, i) => i !== index))
  }

  const updateTestcase = (index: number, key: 'input' | 'expectedOutput', value: string) => {
    setCustomTestcases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [key]: value } : tc))
    )
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTitle.trim() || !customDesc.trim()) return

    const customProblem: Problem = {
      _id: 'custom-' + Date.now(),
      title: customTitle.trim(),
      difficulty: customDifficulty,
      tags: ['Custom'],
      description: customDesc.trim(),
      starterCode: {
        javascript: customStarter,
        typescript: customStarter,
        python: customStarter,
        java: customStarter,
        cpp: customStarter,
        go: customStarter,
      },
      testCases: customTestcases.map((tc) => ({
        input: tc.input.trim(),
        expectedOutput: tc.expectedOutput.trim(),
        isHidden: tc.isHidden,
      })),
      hints: [],
    }

    onSelect(customProblem)
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <BookOpen size={16} className="text-accent" />
          <span className="font-semibold text-text text-sm">Choose a Problem</span>
          <div className="flex bg-surface-2 border border-border rounded-lg p-0.5 ml-2">
            <button
              type="button"
              onClick={() => setMode('picker')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-[120ms] ${
                mode === 'picker' ? 'bg-accent text-[#1a2a0e] shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Select Built-in
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-[120ms] ${
                mode === 'custom' ? 'bg-accent text-[#1a2a0e] shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              Create Custom
            </button>
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="p-0 flex flex-col overflow-hidden max-h-[70vh]">
        {mode === 'picker' ? (
          <>
            {}
            <div className="p-4 border-b border-border flex gap-3 flex-shrink-0 bg-surface/30">
              <div className="flex-1">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search problems by name or tag..."
                  iconLeft={<Search size={14} />}
                  autoFocus
                />
              </div>
              <div className="flex gap-1 items-end">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`h-9 px-3 rounded-md text-xs font-medium transition-all duration-[120ms] ${
                      difficulty === d
                        ? 'bg-accent text-[#1a2a0e] shadow-sm'
                        : 'text-muted hover:text-text bg-surface border border-border hover:border-border-strong'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : problems.length === 0 ? (
                <div className="text-center py-12 text-muted text-sm">No problems found.</div>
              ) : (
                problems.map((problem) => (
                  <button
                    key={problem._id}
                    onClick={() => onSelect(problem)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors duration-[120ms] group border border-transparent hover:border-border/40"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-text group-hover:text-accent transition-colors duration-[120ms] truncate mb-1">
                        {problem.title}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono uppercase tracking-wider text-muted bg-surface-2 border border-border/60 px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium border rounded-full px-2 py-0.5 flex-shrink-0 ${
                        DIFF_COLORS[problem.difficulty as keyof typeof DIFF_COLORS]
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateCustom} className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    required
                    label="Question Title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Reverse a LinkedList"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Difficulty</label>
                  <div className="flex gap-1 bg-surface border border-border rounded-md p-1 h-9 items-center">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setCustomDifficulty(diff)}
                        className={`flex-1 py-1 rounded text-xs font-medium transition-all duration-[120ms] ${
                          customDifficulty === diff
                            ? diff === 'Easy'
                              ? 'bg-success-soft text-success border border-success/20 font-medium'
                              : diff === 'Medium'
                              ? 'bg-warning-soft text-warning border border-warning/20 font-medium'
                              : 'bg-danger-soft text-danger border border-danger/20 font-medium'
                            : 'text-muted hover:text-text border border-transparent'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {}
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Problem Description / Rules</label>
                <textarea
                  required
                  rows={4}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Type the problem requirements, constraints, and edge cases here..."
                  className="w-full bg-surface border border-border text-text rounded-md px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms] resize-none leading-relaxed font-sans"
                />
              </div>

              {}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted font-sans">Starter Code Template</label>
                  <span className="text-[10px] font-mono text-muted bg-surface-2 border border-border rounded px-1.5 py-0.5 select-none">JS / Generic</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={customStarter}
                  onChange={(e) => setCustomStarter(e.target.value)}
                  className="w-full bg-surface border border-border text-text rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent focus:shadow-glow transition-colors duration-[120ms] font-mono resize-none leading-relaxed"
                />
              </div>

              {}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <label className="text-xs font-semibold text-text">Test Cases</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addTestcase}
                    icon={<Plus size={12} />}
                    className="text-accent hover:text-accent-hover hover:bg-accent-soft"
                  >
                    Add Test Case
                  </Button>
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {customTestcases.map((tc, index) => (
                    <div key={index} className="flex gap-2 items-center bg-surface-2 border border-border/60 rounded-md p-2">
                      <span className="text-[11px] font-mono text-muted select-none w-5 text-center">#{index + 1}</span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          required
                          value={tc.input}
                          onChange={(e) => updateTestcase(index, 'input', e.target.value)}
                          placeholder="Input (e.g. [2, 7], 9)"
                          className="bg-surface border border-border text-text text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-accent focus:shadow-glow font-mono"
                        />
                        <input
                          required
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestcase(index, 'expectedOutput', e.target.value)}
                          placeholder="Expected Output (e.g. [0, 1])"
                          className="bg-surface border border-border text-text text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-accent focus:shadow-glow font-mono"
                        />
                      </div>
                      {customTestcases.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestcase(index)}
                          icon={<Trash2 size={13} />}
                          className="text-muted hover:text-danger hover:bg-danger-soft p-1 rounded-md h-8 w-8"
                          title="Delete test case"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {}
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode('picker')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Code2 size={13} />}
              >
                Set Live Custom Question
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogBody>
    </Dialog>
  )
}
