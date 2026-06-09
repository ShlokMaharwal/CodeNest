'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-surface border border-border" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode · ⌘⇧L`}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-accent hover:border-border-strong transition-colors duration-[120ms] overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: isDark ? -30 : 30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: isDark ? 30 : -30 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
