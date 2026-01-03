'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, Crown } from 'lucide-react'
import { getPlanStatus } from '@/app/(dashboard)/plan-actions'
import type { PlanStatus } from '@/lib/plan-utils'

export function PlanBanner() {
    const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPlan() {
            try {
                const status = await getPlanStatus()
                setPlanStatus(status)
            } catch (error) {
                console.error('Error loading plan status:', error)
            } finally {
                setLoading(false)
            }
        }
        loadPlan()
    }, [])

    if (loading || !planStatus) return null

    // Lifetime plans - show special badge
    if (planStatus.isLifetime) {
        return (
            <div className="px-3 pb-4">
                <div className="bg-linear-to-r from-amber-500 to-orange-500 rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-white" />
                        <p className="text-xs font-bold text-white">LIFETIME PRO</p>
                    </div>
                    <p className="text-xs text-white/90">Unlimited invoices forever</p>
                </div>
            </div>
        )
    }

    // Free plan - show upgrade prompt
    if (planStatus.planSlug === 'free') {
        return (
            <Link href="/pricing" className="px-3 pb-4 block">
                <div className="bg-linear-to-r from-emerald-500 to-blue-500 rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-white" />
                        <p className="text-xs font-bold text-white">FREE PLAN</p>
                    </div>
                    <p className="text-xs text-white/90 mb-2">Up to 300 invoices</p>
                    <div className="bg-white/20 rounded px-2 py-1">
                        <p className="text-xs text-white font-semibold">Upgrade →</p>
                    </div>
                </div>
            </Link>
        )
    }

    // Paid plans - show status and expiry
    const isExpiringSoon = planStatus.daysUntilExpiry !== null && planStatus.daysUntilExpiry <= 7
    const bgColor = isExpiringSoon ? 'from-orange-500 to-red-500' : 'from-blue-500 to-violet-500'

    return (
        <div className="px-3 pb-4">
            <Link href="/pricing">
                <div className={`bg-linear-to-r ${bgColor} rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-white uppercase">{planStatus.planName}</p>
                        {planStatus.hasActivePlan && <span className="text-xs text-white/90">●</span>}
                    </div>
                    {planStatus.daysUntilExpiry !== null && (
                        <p className="text-xs text-white/90">
                            {isExpiringSoon ? '⚠️ ' : ''}
                            {planStatus.daysUntilExpiry} days left
                        </p>
                    )}
                    {isExpiringSoon && (
                        <div className="bg-white/20 rounded px-2 py-1 mt-2">
                            <p className="text-xs text-white font-semibold">Renew Now →</p>
                        </div>
                    )}
                </div>
            </Link>
        </div>
    )
}
