'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: ('ADMIN' | 'SUPERVISOR' | 'ACCOUNTANT')[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8" />
      </div>
    )
  }

  const user = session?.user as any
  const role = user?.role ?? 'ADMIN'

  if (!allowedRoles.includes(role)) {
    return (
      <div className="card max-w-md mx-auto mt-12 text-center p-8 border border-red-500/20 bg-red-500/5">
        <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl font-bold">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Access Denied / அனுமதி இல்லை</h2>
        <p className="text-slate-400 text-sm mb-1">
          You do not have permission to access this page.
        </p>
        <p className="text-slate-500 text-xs tamil">
          இந்தப் பக்கத்தை அணுக உங்களுக்கு அனுமதி இல்லை.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
