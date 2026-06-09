'use client'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

interface ConnectionStatusProps {
  state: ConnectionState
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  if (state === 'connected') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-success" aria-live="polite" aria-label="Connected">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
        <span className="hidden sm:inline">Live</span>
      </div>
    )
  }
  if (state === 'reconnecting') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-warning" aria-live="polite" aria-label="Reconnecting">
        <Loader2 size={13} className="animate-spin" />
        <span className="hidden sm:inline">Reconnecting…</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-danger" aria-live="polite" aria-label="Disconnected">
      <WifiOff size={13} />
      <span className="hidden sm:inline">Offline</span>
    </div>
  )
}
