'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import { processRefund as baseProcessRefund } from '@/app/(dashboard)/invoices/payment-actions'

export async function processAdminRefund(refundId: string, approve: boolean, notes?: string) {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) throw new Error('Unauthorized')

    const res = await baseProcessRefund(refundId, approve, notes)
    await createAuditLog(
        approve ? 'refund_approved' : 'refund_rejected',
        'refund',
        refundId,
        { approve, notes }
    )
    revalidatePath('/admin/refunds')
    revalidatePath('/admin/payments')
    return res
}

export async function createManualRefund(paymentId: string, amount: number, reason: string) {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Find payment
    const { data: payment, error: pErr } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .maybeSingle()

    if (pErr || !payment) {
        throw new Error('Payment transaction not found')
    }

    const { data: newRefund, error: rErr } = await supabase
        .from('refunds')
        .insert({
            payment_id: payment.id,
            user_id: payment.user_id,
            invoice_id: payment.invoice_id || null,
            amount: Number(amount) || payment.amount,
            currency: payment.currency || 'INR',
            reason: reason || 'Manual refund issued by Super Admin',
            status: 'pending',
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (rErr) {
        console.error('Error creating manual refund:', rErr)
        throw new Error(rErr.message || 'Failed to create refund record')
    }

    await createAuditLog('manual_refund_created', 'refund', newRefund.id, {
        payment_id: paymentId,
        amount,
        reason
    })

    revalidatePath('/admin/refunds')
    return { success: true, refund: newRefund }
}

export async function getRecentPaymentsForRefund() {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) return []

        const supabase = await createClient()
        const { data: payments } = await supabase
            .from('payments')
            .select('id, amount, currency, status, gateway_payment_id, description, created_at, user_id')
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(30)

        return payments || []
    } catch (e) {
        console.error('Error fetching recent payments:', e)
        return []
    }
}
