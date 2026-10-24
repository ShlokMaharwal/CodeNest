'use client'
import { CommandPaletteProvider } from '@/components/palette/CommandPalette'
import { ToastProvider } from '@/components/ui/Toast'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SessionProvider>
        <ToastProvider>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
