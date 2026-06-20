'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { Session } from 'next-auth'
import { useState } from 'react'

export function TopBar({ session }: { session: Session }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const user = session.user as any

  return (
    <header className="h-14 border-b border-surface-600 bg-surface-800 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-surface-600 transition-all">
          <Bell className="w-5 h-5" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-600 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-slate-200">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-slate-500">{user?.role ?? 'ADMIN'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-700 border border-surface-500 rounded-xl shadow-2xl z-50 py-1">
              <div className="px-3 py-2 border-b border-surface-500">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out / வெளியேறு
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
