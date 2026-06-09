'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-text">{label}</div>}
          {description && <div className="text-xs text-muted mt-0.5">{description}</div>}
        </div>
      )}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative w-9 h-5 rounded-full transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg flex-shrink-0',
          checked ? 'bg-accent' : 'bg-border-strong',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  )
}
