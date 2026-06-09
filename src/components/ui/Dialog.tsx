'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  maxWidth?: string
}

export function Dialog({ open, onClose, children, className, maxWidth = 'max-w-md' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-overlay backdrop-blur-md"
          />
          {}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-bg-elevated border border-border rounded-xl shadow-lg',
              maxWidth, className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DialogHeader({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="font-semibold text-text text-sm">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted hover:text-text p-1 rounded-md hover:bg-surface-2 transition-colors"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export function DialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pb-5 flex items-center justify-end gap-2">
      {children}
    </div>
  )
}
