'use server'

import { checkPlanExpiry, getUserPlanStatus, checkInvoiceLimit } from '@/lib/plan-utils'

/**
 * Server action to get current user's plan status
 */
export async function getPlanStatus() {
    return await getUserPlanStatus()
}

/**
 * Server action to check if plan needs renewal
 */
export async function getExpiryStatus() {
    return await checkPlanExpiry()
}

/**
 * Server action to check invoice creation limits
 */
export async function getInvoiceLimitStatus() {
    return await checkInvoiceLimit()
}
