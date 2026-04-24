'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, Users, Building2, BarChart3 } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet'
import { AdminSidebar } from './AdminSidebar'
import { cn } from '@/lib/utils'

const mobileAdminTabs = [
  {
    label: 'Home',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/admin/users',
  },
  {
    label: 'Biz',
    icon: Building2,
    href: '/admin/businesses',
  },
  {
    label: 'Stats',
    icon: BarChart3,
    href: '/admin/analytics',
  },
]

export function MobileAdminSidebar() {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-slate-700">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center justify-center absolute left-0 right-0 top-3 pointer-events-none">
          <h1 className="text-lg font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Super Admin
          </h1>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-900/95 backdrop-blur supports-backdrop-filter:bg-slate-900/90">
        <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {mobileAdminTabs.map((tab) => {
            const active = isActive(tab.href)

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-linear-to-r from-blue-500/20 to-violet-500/20 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <tab.icon className={cn('h-5 w-5 mb-1', active ? 'text-blue-300' : 'text-slate-500')} />
                {tab.label}
              </Link>
            )
          })}

          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-1.5 text-[11px] font-medium transition-colors',
              isOpen
                ? 'bg-linear-to-r from-blue-500/20 to-violet-500/20 text-white'
                : 'text-slate-400 hover:text-slate-200'
            )}
            aria-label="Open admin menu"
          >
            <Menu className={cn('h-5 w-5 mb-1', isOpen ? 'text-blue-300' : 'text-slate-500')} />
            Menu
          </button>
        </div>
      </nav>
    </>
  )
}
