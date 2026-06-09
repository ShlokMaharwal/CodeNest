'use client'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/ui/Toast'
import { CommandPaletteProvider } from '@/components/palette/CommandPalette'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SessionProvider>
        <ToastProvider>
          <CommandPaletteProvider>
            {children}
          </CommandPaletteProvider>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
