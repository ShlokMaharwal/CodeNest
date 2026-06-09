'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Search, Home, LayoutDashboard, Calendar, Code2, Play,
  Plus, X, Moon, Sun, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface CommandPaletteContextValue {
  open: () => void
  close: () => void
}
const CommandPaletteContext = createContext<CommandPaletteContextValue>({ open: () => {}, close: () => {} })
export const useCommandPalette = () => useContext(CommandPaletteContext)

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  group: string
  shortcut?: string
  href?: string
  action?: () => void
}

const ACTIONS: Action[] = [
  { id: 'home',      label: 'Go to Home',      icon: <Home size={15} />,             group: 'Pages',    href: '/' },
  { id: 'dashboard', label: 'My Interviews',    icon: <LayoutDashboard size={15} />, group: 'Pages',    href: '/dashboard' },
  { id: 'schedule',  label: 'Interview Schedule', icon: <Calendar size={15} />,       group: 'Pages',    href: '/schedule' },
  { id: 'run',       label: 'Run code',          icon: <Play size={15} />,            group: 'Actions',  shortcut: '⌘↵' },
  { id: 'create',    label: 'Create interview room', icon: <Plus size={15} />,         group: 'Actions' },
]

function useActions(query: string) {
  if (!query.trim()) return ACTIONS
  const q = query.toLowerCase()
  return ACTIONS.filter(a => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q))
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open  = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <CommandPaletteContext.Provider value={{ open, close }}>
      {children}
      <CommandPaletteModal open={isOpen} onClose={close} />
    </CommandPaletteContext.Provider>
  )
}

function CommandPaletteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const router = useRouter()
  const results = useActions(query)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setSelectedIdx(0) }, [query])

  const handleSelect = useCallback((action: Action) => {
    onClose()
    if (action.href) router.push(action.href)
    else if (action.action) action.action()
  }, [onClose, router])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[selectedIdx]) handleSelect(results[selectedIdx])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, selectedIdx, handleSelect, onClose])

  const groups = Array.from(new Set(results.map(a => a.group)))

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-center pt-[10vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-overlay backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-bg-elevated border border-border rounded-xl shadow-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={15} className="text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands, pages, actions…"
                className="flex-1 bg-transparent text-text text-sm placeholder:text-subtle outline-none"
              />
              <button onClick={onClose} className="text-muted hover:text-text p-0.5 rounded">
                <X size={14} />
              </button>
            </div>

            {}
            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted">No results for "{query}"</div>
              ) : (
                groups.map(group => (
                  <div key={group}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold text-subtle uppercase tracking-wider">
                      {group}
                    </div>
                    {results.filter(a => a.group === group).map((action) => {
                      const idx = results.indexOf(action)
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-[80ms]',
                            idx === selectedIdx ? 'bg-accent-soft text-text' : 'text-muted hover:text-text hover:bg-surface-2'
                          )}
                        >
                          <span className={idx === selectedIdx ? 'text-accent' : ''}>{action.icon}</span>
                          <span className="flex-1">{action.label}</span>
                          {action.shortcut && (
                            <kbd className="text-[10px] text-subtle bg-surface-2 border border-border rounded px-1.5 py-0.5 font-mono">
                              {action.shortcut}
                            </kbd>
                          )}
                          {action.href && <ArrowRight size={12} className="text-subtle" />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {}
            <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[10px] text-subtle">
              <span><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> select</span>
              <span><kbd className="font-mono">Esc</kbd> close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
