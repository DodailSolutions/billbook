'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function OfflineActions() {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button onClick={() => window.location.reload()}>
        Try again
      </Button>
      <Link href="/" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        Go home
      </Link>
    </div>
  )
}