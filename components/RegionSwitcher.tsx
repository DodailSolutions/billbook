'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RegionOption {
  code: string
  label: string
  currency: string
  symbol: string
  flag: string
  path: string
}

export const REGIONS: RegionOption[] = [
  {
    code: 'US',
    label: 'United States & Global',
    currency: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    path: '/us',
  },
  {
    code: 'AE',
    label: 'UAE & Middle East',
    currency: 'AED',
    symbol: 'AED',
    flag: '🇦🇪',
    path: '/ae',
  },
  {
    code: 'IN',
    label: 'India (GST Ready)',
    currency: 'INR',
    symbol: '₹',
    flag: '🇮🇳',
    path: '/',
  },
]

interface RegionSwitcherProps {
  variant?: 'header' | 'footer' | 'pill'
  className?: string
}

export function RegionSwitcher({ variant = 'header', className }: RegionSwitcherProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine current active region based on pathname
  const currentRegion = (() => {
    if (pathname.startsWith('/ae')) return REGIONS[1] // UAE
    if (pathname.startsWith('/us')) return REGIONS[0] // US
    return REGIONS[2] // IN (default)
  })()

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'footer') {
    return (
      <div className={cn('flex flex-wrap items-center gap-3 text-xs', className)}>
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Region:
        </span>
        {REGIONS.map((r) => {
          const isActive = r.code === currentRegion.code
          return (
            <Link
              key={r.code}
              href={r.path}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <span>{r.flag}</span>
              <span>{r.label}</span>
              <span className="opacity-75 font-normal">({r.currency})</span>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
          'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800',
          'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200',
          'shadow-2xs active:scale-95'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Country or Region"
      >
        <span className="text-sm leading-none">{currentRegion.flag}</span>
        <span className="hidden sm:inline font-semibold">{currentRegion.currency}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
            Select Country & Currency
          </div>
          <div className="py-1 space-y-0.5">
            {REGIONS.map((r) => {
              const isSelected = r.code === currentRegion.code
              return (
                <Link
                  key={r.code}
                  href={r.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{r.flag}</span>
                    <div>
                      <div className="leading-tight">{r.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        Prices in {r.currency} ({r.symbol})
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
