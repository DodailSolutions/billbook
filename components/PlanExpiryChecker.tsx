'use client'

import { useEffect, useState } from 'react'
import { PlanExpiryModal } from './PlanExpiryModal'
import { getExpiryStatus } from '@/app/(dashboard)/plan-actions'

export function PlanExpiryChecker() {
    const [expiryStatus, setExpiryStatus] = useState<{
        needsRenewal: boolean
        isExpired: boolean
        daysUntilExpiry: number | null
        planName: string
    } | null>(null)

    useEffect(() => {
        async function checkPlan() {
            const status = await getExpiryStatus()
            if (status.needsRenewal) {
                setExpiryStatus(status)
            }
        }
        checkPlan()
    }, [])

    if (!expiryStatus || !expiryStatus.needsRenewal) {
        return null
    }

    return (
        <PlanExpiryModal
            isExpired={expiryStatus.isExpired}
            daysUntilExpiry={expiryStatus.daysUntilExpiry}
            planName={expiryStatus.planName}
        />
    )
}
