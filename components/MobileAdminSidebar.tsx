'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, Users, Building2, BarChart3, Shield } from 'lucide-react'
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
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="text-slate-700 dark:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          <Link href="/admin" className="flex items-center gap-2">
            <Image 
              src="/logo-icon.svg" 
              alt="BillBooky" 
              width={26} 
              height={26}
            />
            <span className="font-black text-slate-900 dark:text-white text-base">
              Bill<span className="text-blue-600">Booky</span>
            </span>
          </Link>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
          <Shield className="w-2.5 h-2.5 text-purple-600" />
          Admin
        </span>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
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
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                <tab.icon className={cn('h-4 w-4 mb-1', active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />
                {tab.label}
              </Link>
            )
          })}

          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
              isOpen
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
            aria-label="Open full admin menu"
          >
            <Menu className={cn('h-4 w-4 mb-1', isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />
            Menu
          </button>
        </div>
      </nav>
    </>
  )
}
