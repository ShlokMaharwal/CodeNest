'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ iconLeft, iconRight, error, label, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full h-9 bg-surface border border-border rounded-md text-sm text-text placeholder:text-subtle transition-colors duration-[120ms]',
              'focus:outline-none focus:border-accent focus:shadow-glow',
              'disabled:bg-surface-2 disabled:opacity-60 disabled:cursor-not-allowed',
              error && 'border-danger focus:border-danger focus:shadow-none',
              iconLeft  && 'pl-9',
              iconRight && 'pr-9',
              !iconLeft && 'px-3',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
