'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, LayoutDashboard, Users2, Package, FolderOpen,
  Wallet, ShoppingCart, Hammer, UserCheck, Warehouse,
  Wrench, BarChart3, ChevronLeft, ChevronRight, Settings,
  HardHat
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    labelTA: 'டாஷ்போர்டு',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  { type: 'divider', label: 'Master Data / முதன்மை தரவு' },
  {
    label: 'Suppliers',
    labelTA: 'சப்ளையர்கள்',
    href: '/suppliers',
    icon: Users2,
  },
  {
    label: 'Materials',
    labelTA: 'பொருட்கள்',
    href: '/materials',
    icon: Package,
  },
  {
    label: 'Projects',
    labelTA: 'திட்டங்கள்',
    href: '/projects',
    icon: FolderOpen,
  },
  { type: 'divider', label: 'Operations / செயல்பாடுகள்' },
  {
    label: 'Financials',
    labelTA: 'நிதி',
    href: '/financials',
    icon: Wallet,
  },
  {
    label: 'Purchases',
    labelTA: 'கொள்முதல்',
    href: '/purchases',
    icon: ShoppingCart,
  },
  {
    label: 'Material Usage',
    labelTA: 'பொருள் பயன்பாடு',
    href: '/material-usage',
    icon: Hammer,
  },
  { type: 'divider', label: 'HR / மனிதவள' },
  {
    label: 'Employees',
    labelTA: 'ஊழியர்கள்',
    href: '/employees',
    icon: UserCheck,
  },
  {
    label: 'Salaries',
    labelTA: 'சம்பளம்',
    href: '/salaries',
    icon: HardHat,
  },
  { type: 'divider', label: 'Stock & Works / பொருளிருப்பு' },
  {
    label: 'Warehouse',
    labelTA: 'கிடங்கு',
    href: '/warehouse',
    icon: Warehouse,
  },
  {
    label: 'Small Works',
    labelTA: 'சிறிய வேலைகள்',
    href: '/small-works',
    icon: Wrench,
  },
  { type: 'divider', label: 'Analytics / பகுப்பாய்வு' },
  {
    label: 'Reports',
    labelTA: 'அறிக்கைகள்',
    href: '/reports',
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sidebar-dark flex flex-col h-full bg-surface-800 border-r border-surface-600 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-surface-600', collapsed && 'justify-center')}>
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center shadow-lg">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">Deivenei</p>
            <p className="text-xs text-slate-400 truncate tamil">கட்டுமான ERP</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          if ((item as any).type === 'divider') {
            if (collapsed) return <div key={idx} className="border-t border-surface-600 my-2" />
            return (
              <div key={idx} className="px-3 pt-4 pb-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest truncate">
                  {(item as any).label}
                </p>
              </div>
            )
          }
          const Icon = (item as any).icon
          const isActive = pathname === (item as any).href || pathname.startsWith((item as any).href + '/')
          return (
            <Link key={(item as any).href} href={(item as any).href}>
              <span
                className={cn(
                  'sidebar-link',
                  isActive && 'active',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? `${(item as any).label} / ${(item as any).labelTA}` : undefined}
              >
                <Icon className="sidebar-link-icon" />
                {!collapsed && (
                  <span className="truncate">
                    {(item as any).label}
                    <span className="text-slate-500 text-xs ml-1 tamil hidden xl:inline">
                      {(item as any).labelTA}
                    </span>
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-surface-600">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200',
            'hover:bg-surface-600 transition-all duration-200 text-sm',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
