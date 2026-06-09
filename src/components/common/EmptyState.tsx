'use client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void; icon?: React.ReactNode }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-20 px-6', className)}>
      <div className="w-14 h-14 bg-accent-soft text-accent rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-medium text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
      {action && (
        <Button variant="primary" size="default" onClick={action.onClick} className="mt-5" icon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
