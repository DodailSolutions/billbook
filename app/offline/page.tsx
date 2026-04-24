import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { OfflineActions } from './OfflineActions'

export const metadata: Metadata = {
  title: 'Offline | BillBooky',
  description: 'BillBooky offline fallback page.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">You are offline</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          BillBooky could not reach the internet. Reconnect to keep invoices, reminders, and payments in sync.
        </p>
        <OfflineActions />
      </div>
    </main>
  )
}