'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  window.fetch = async (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = '/web/deivenei' + input
    }
    return originalFetch(input, init)
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/web/deivenei/api/auth">
      {children}
      <Toaster />
    </SessionProvider>
  )
}
