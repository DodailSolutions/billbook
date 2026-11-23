import { DollarSign, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllPayments } from './actions'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import PaymentsClientView from './PaymentsClientView'

export const metadata = {
    title: 'Payments & Revenue Journal | Super Admin',
    description: 'Audited log of platform subscription revenues, gateway settlements, and invoice collections.'
}

export default async function PaymentsManagementPage() {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) {
        redirect('/dashboard')
    }

    const payments = await getAllPayments()

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Payments & Platform Revenue
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Real-time transaction tracking across subscriptions, gateway settlements, and refunds.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Admin Overview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Interactive Payments Client View */}
            <PaymentsClientView payments={payments} />
        </div>
    )
}
