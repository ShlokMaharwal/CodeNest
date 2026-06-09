'use client'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={15} className="text-success flex-shrink-0" />,
  error:   <XCircle     size={15} className="text-danger  flex-shrink-0" />,
  info:    <Info        size={15} className="text-accent  flex-shrink-0" />,
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 4000)
  }, [toast.id, onRemove])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    startTimer()
    return pauseTimer
  }, [startTimer, pauseTimer])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className="flex items-center gap-2.5 bg-surface border border-border rounded-lg shadow-md px-3 py-2.5 text-sm text-text max-w-sm w-full"
    >
      {icons[toast.variant]}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-muted hover:text-text ml-1">
        <X size={13} />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
