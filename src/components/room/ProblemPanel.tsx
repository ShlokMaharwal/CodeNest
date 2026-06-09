'use client'
import { Problem } from '@/types'
import { Hash } from 'lucide-react'
import { DifficultyPill } from '@/components/common/Pill'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ProblemPanelProps {
  problem: Problem | null
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  if (!problem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-3">
          <Hash className="text-subtle" size={20} />
        </div>
        <p className="text-sm font-medium text-text mb-1">No problem selected</p>
        <p className="text-xs text-muted">The interviewer can choose a problem using the toolbar above.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h2 className="text-sm font-semibold text-text leading-snug">{problem.title}</h2>
          <DifficultyPill difficulty={problem.difficulty} />
        </div>
        <div className="flex flex-wrap gap-1">
          {problem.tags.map(tag => (
            <span key={tag} className="text-xs text-subtle bg-surface-2 border border-border rounded px-1.5 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-text leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {problem.description}
          </ReactMarkdown>
        </div>

        {}
        {problem.testCases && problem.testCases.filter(tc => !tc.isHidden).length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">Examples</h3>
            <div className="space-y-2">
              {problem.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-md p-3 text-xs font-mono">
                  <div className="text-subtle mb-1">
                    <span className="text-text font-medium">Input:</span>{' '}{tc.input}
                  </div>
                  <div className="text-subtle">
                    <span className="text-text font-medium">Output:</span>{' '}{tc.expectedOutput}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
