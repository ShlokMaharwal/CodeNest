'use client'
import { cn } from '@/lib/cn'

interface AvatarProps {
  name: string
  color?: string
  size?: 'sm' | 'default' | 'lg'
  showRing?: boolean
  className?: string
}

const sizes = { sm: 'w-6 h-6 text-[10px]', default: 'w-7 h-7 text-xs', lg: 'w-9 h-9 text-sm' }


export function hashColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 65%, 52%)`
}

export function Avatar({ name, color, size = 'default', showRing = false, className }: AvatarProps) {
  const bg = color || hashColor(name)
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none transition-all duration-[120ms]',
        sizes[size],
        showRing && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
        className
      )}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  )
}
