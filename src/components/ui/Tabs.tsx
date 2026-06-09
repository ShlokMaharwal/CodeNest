'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface TabItem {
  id: string
  label: React.ReactNode
  badge?: React.ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  layoutId?: string
  className?: string
  size?: 'sm' | 'default'
}

export function Tabs({ tabs, active, onChange, layoutId = 'tab-underline', className, size = 'default' }: TabsProps) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-1.5 transition-colors duration-[120ms] flex-shrink-0',
            size === 'sm' ? 'px-3 py-2 text-xs' : 'px-3 py-2.5 text-sm',
            active === tab.id ? 'text-text font-medium' : 'text-muted hover:text-text'
          )}
        >
          {tab.label}
          {tab.badge}
          {active === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}


interface SegmentedProps {
  options: { value: string; label: React.ReactNode }[]
  value: string
  onChange: (v: string) => void
  className?: string
}

export function Segmented({ options, value, onChange, className }: SegmentedProps) {
  return (
    <div className={cn('flex bg-surface-2 border border-border rounded-md p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 h-7 text-xs rounded-[5px] transition-colors duration-[120ms] flex-1',
            value === opt.value
              ? 'bg-bg text-text shadow-sm font-medium'
              : 'text-muted hover:text-text'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
