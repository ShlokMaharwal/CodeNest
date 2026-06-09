'use client'
import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-md', className)} />
}

export function SkeletonRoom() {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}
