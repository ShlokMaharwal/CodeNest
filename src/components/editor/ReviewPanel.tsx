'use client'
import { useState } from 'react'
import { Brain, Loader2, ChevronDown, ChevronRight, Copy, RotateCcw } from 'lucide-react'

interface ReviewPanelProps {
  
  roomId?: string
  problemTitle?: string
  problemDescription?: string
  code?: string
  language?: string
  testResults?: { input: string; expected: string; actual: string; passed: boolean }[]
  
  onGenerateReview?: () => void
  loading?: boolean
  review?: string
  error?: string
}

type Verdict = 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Borderline' | 'No Hire'

const VERDICT_COLORS: Record<Verdict, string> = {
  'Strong Hire': 'text-success bg-success-soft border-success/25',
  'Hire':        'text-success bg-success-soft border-success/25',
  'Lean Hire':   'text-info    bg-info-soft    border-info/25',
  'Borderline':  'text-warning bg-warning-soft border-warning/25',
  'No Hire':     'text-danger  bg-danger-soft  border-danger/25',
}

const SECTIONS = ['Correctness', 'Code Quality', 'Problem Solving', 'Communication', 'Recommendation']

function extractSection(review: string, section: string): string {
  const patterns = [
    new RegExp(`\\*\\*${section}\\*\\*:?\\s*([^*]+?)(?=\\*\\*|$)`, 'is'),
    new RegExp(`${section}:?\\s*([^\\n]+(?:\\n(?!\\n)[^\\n]+)*)`, 'i'),
    new RegExp(`#+\\s*${section}:?\\s*([\\s\\S]+?)(?=\\n#+|$)`, 'i'),
  ]
  for (const pat of patterns) {
    const m = review.match(pat)
    if (m) return m[1].trim().replace(/\*\*/g, '')
  }
  return ''
}

function extractVerdict(review: string): Verdict | null {
  const verdicts: Verdict[] = ['Strong Hire', 'No Hire', 'Lean Hire', 'Borderline', 'Hire']
  for (const v of verdicts) {
    if (review.toLowerCase().includes(v.toLowerCase())) return v
  }
  return null
}

function SectionBlock({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(title === 'Recommendation')
  if (!content) return null
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-2 transition-colors">
        <span className="text-xs font-semibold text-text">{title}</span>
        {open ? <ChevronDown size={13} className="text-muted" /> : <ChevronRight size={13} className="text-muted" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-border">
          <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed mt-2">{content}</p>
        </div>
      )}
    </div>
  )
}

export function ReviewPanel({
  roomId, problemTitle, problemDescription, code, language, testResults,
  onGenerateReview, loading: externalLoading, review: externalReview, error: externalError,
}: ReviewPanelProps) {
  const [internalReview, setInternalReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const review     = externalReview !== undefined ? externalReview : internalReview
  const isLoading  = externalLoading !== undefined ? externalLoading : loading
  const displayErr = externalError || error

  const generateReview = async () => {
    if (onGenerateReview) { onGenerateReview(); return }
    if (!roomId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, problemTitle, problemDescription, code, language, testResults }),
      })
      const data = await res.json()
      if (data.review) setInternalReview(data.review)
      else setError(data.error || 'Failed to generate review')
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  const verdict    = review ? extractVerdict(review) : null
  const hasReview  = !!review && review.length > 20
  const copyMarkdown = () => navigator.clipboard.writeText(review)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-accent" />
          <span className="text-xs font-medium text-muted">AI Review</span>
        </div>
        {verdict && (
          <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${VERDICT_COLORS[verdict]}`}>
            {verdict}
          </span>
        )}
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!hasReview && !displayErr && (
          <p className="text-xs text-muted text-center pt-6 leading-relaxed max-w-[200px] mx-auto">
            Generate an AI review of the candidate's solution, approach, and communication.
          </p>
        )}
        {displayErr && <p className="text-xs text-danger text-center">{displayErr}</p>}
        {hasReview && (
          <>
            {SECTIONS.map(section => (
              <SectionBlock key={section} title={section} content={extractSection(review, section)} />
            ))}
            {SECTIONS.every(s => !extractSection(review, s)) && (
              <div className="bg-surface border border-border rounded-md p-3">
                <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">{review}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex-shrink-0 flex gap-2">
        <button
          onClick={generateReview}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-[#1a2a0e] text-xs font-medium h-9 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 size={13} className="animate-spin" />Generating…</>
          ) : hasReview ? (
            <><RotateCcw size={13} />Regenerate review</>
          ) : (
            <><Brain size={13} />Generate review</>
          )}
        </button>
        {hasReview && (
          <button onClick={copyMarkdown} className="flex items-center gap-1.5 text-xs text-muted hover:text-text border border-border hover:border-border-strong rounded-md px-3 h-9 transition-colors">
            <Copy size={12} />Copy
          </button>
        )}
      </div>
    </div>
  )
}
