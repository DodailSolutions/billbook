'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BadgeIndianRupee, Sparkles, Phone, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const publicNavRoutes = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Pricing', href: '/pricing', icon: BadgeIndianRupee },
  { label: 'Features', href: '/features', icon: Sparkles },
  { label: 'Contact', href: '/contact', icon: Phone },
  { label: 'Signup', href: '/signup', icon: UserPlus },
]

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

  const showOnPage = visiblePublicPaths.some((path) => {
    if (path === '/') {
      return pathname === '/'
    }

    return pathname === path || pathname.startsWith(`${path}/`)
  })

  if (!showOnPage) {
    return null
  }

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden="true" />
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90">
        <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {publicNavRoutes.map((route) => {
            const active = route.href === '/'
              ? pathname === '/'
              : pathname === route.href || pathname.startsWith(`${route.href}/`)

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <route.icon className={cn('mb-1 h-5 w-5', active ? 'text-blue-600' : 'text-slate-400')} />
                {route.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}