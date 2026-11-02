'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BadgeIndianRupee, Sparkles, Phone, LayoutDashboard, FileText, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const visiblePublicPaths = [
  '/',
  '/pricing',
  '/features',
  '/faq',
  '/about',
  '/contact',
  '/support',
  '/terms',
  '/privacy',
  '/refund',
  '/for-cas',
  '/ca-marketplace',
]

export function PublicMobileNav() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        setIsAuthenticated(!!user)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session?.user)
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.warn('Could not check auth status in PublicMobileNav:', err)
    }
  }, [])

  const showOnPage = visiblePublicPaths.some((path) => {
    if (path === '/') {
      return pathname === '/'
    }

    return pathname === path || pathname.startsWith(`${path}/`)
  })

  if (!showOnPage) {
    return null
  }

  const navRoutes = isAuthenticated
    ? [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Invoices', href: '/invoices', icon: FileText },
        { label: 'Pricing', href: '/pricing', icon: BadgeIndianRupee },
        { label: 'Contact', href: '/contact', icon: Phone },
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isPrimary: true },
      ]
    : [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Pricing', href: '/pricing', icon: BadgeIndianRupee },
        { label: 'Features', href: '/features', icon: Sparkles },
        { label: 'Contact', href: '/contact', icon: Phone },
        { label: 'Sign In', href: '/login', icon: LogIn, isPrimary: true },
      ]

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden="true" />
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
          {navRoutes.map((route) => {
            const active = route.href === '/'
              ? pathname === '/'
              : pathname === route.href || pathname.startsWith(`${route.href}/`)

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex flex-col items-center justify-center rounded-2xl py-1.5 min-h-[48px] text-[11px] font-bold transition-all duration-200 active:scale-95 select-none',
                  active
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900',
                  route.isPrimary && !active && 'text-blue-600'
                )}
              >
                <route.icon 
                  className={cn(
                    'mb-1 h-5 w-5 transition-transform duration-200',
                    active 
                      ? 'text-blue-600 scale-110' 
                      : route.isPrimary 
                        ? 'text-blue-600' 
                        : 'text-slate-400'
                  )} 
                />
                <span className="truncate max-w-[56px] text-center leading-none tracking-tight">
                  {route.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
