'use client'
import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'icon'
type Size    = 'sm' | 'default' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-accent text-[#1a2a0e] hover:bg-accent-hover shadow-sm font-semibold',
  secondary: 'bg-surface border border-border hover:border-border-strong text-text',
  ghost:     'text-muted hover:text-text hover:bg-surface-2',
  danger:    'bg-danger-soft text-danger border border-danger/30 hover:bg-danger/15',
  success:   'bg-success-soft text-success border border-success/30 hover:bg-success/15',
  warning:   'bg-warning-soft text-warning border border-warning/30 hover:bg-warning/15',
  icon:      'text-muted hover:text-text hover:bg-surface-2',
}

const sizeClasses: Record<Size, string> = {
  sm:      'h-7  px-2.5 text-xs  rounded-md',
  default: 'h-9  px-4   text-sm  rounded-md',
  lg:      'h-11 px-5   text-sm  rounded-md',
}

const iconSizeClasses: Record<Size, string> = {
  sm:      'h-7  w-7  rounded-md',
  default: 'h-9  w-9  rounded-md',
  lg:      'h-11 w-11 rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'default', loading, icon, children, className, disabled, ...props }, ref) => {
    const isIcon = variant === 'icon'
    const base = 'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-[120ms] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
    const sz   = isIcon ? iconSizeClasses[size] : sizeClasses[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variantClasses[variant], sz, className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {!isIcon && children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
