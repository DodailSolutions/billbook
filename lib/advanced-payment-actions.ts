'use server'

/**
 * Advanced Payment Server Actions
 * UPI, installments, reconciliation, late fees, BNPL, follow-ups
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  UPIPaymentDetails,
  PaymentInstallment,
  BankTransaction,
  FailedPayment
} from './advanced-payment-types'

// ============================================
// UPI PAYMENT SETUP
// ============================================

export async function createUPIDetails(data: {
  upi_id: string
  business_name?: string
  is_primary?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // If setting as primary, unset other primary UPIs
  if (data.is_primary) {
    await supabase
      .from('upi_payment_details')
      .update({ is_primary: false })
      .eq('user_id', user.id)
  }

  const { data: upiDetails, error } = await supabase
    .from('upi_payment_details')
    .insert([{
      user_id: user.id,
      upi_id: data.upi_id,
      business_name: data.business_name,
      is_primary: data.is_primary ?? true
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings/payments')
  return { success: true, data: upiDetails }
}

export async function generateUPIQRCode(data: {
  upi_id: string
  amount: number
  invoice_number: string
  customer_name?: string
}) {
  // Generate UPI intent string
  const intent = `upi://pay?pa=${encodeURIComponent(data.upi_id)}&pn=${encodeURIComponent(data.customer_name || 'Customer')}&am=${data.amount}&tr=${encodeURIComponent(data.invoice_number)}&tn=${encodeURIComponent(`Payment for ${data.invoice_number}`)}&cu=INR`

  return {
    success: true,
    intent,
    qr_data: intent
  }
}

export async function getUPIDetails(): Promise<UPIPaymentDetails[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('upi_payment_details')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })

  if (error) {
    console.error('Error fetching UPI details:', error)
    return []
  }

  return data as UPIPaymentDetails[]
}

// ============================================
// PAYMENT INSTALLMENTS
// ============================================

export async function createInstallmentPlan(data: {
  invoice_id: string
  total_installments: number
  frequency: 'weekly' | 'monthly' | 'quarterly'
  start_date: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get invoice details
  const { data: invoice } = await supabase
    .from('invoices')
    .select('total, customer_id')
    .eq('id', data.invoice_id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) {
    return { success: false, error: 'Invoice not found' }
  }

  // Calculate installment amounts
  const amountPerInstallment = invoice.total / data.total_installments
  const installments: Array<Omit<PaymentInstallment, 'id' | 'created_at' | 'updated_at'>> = []

  const startDate = new Date(data.start_date)
  const frequencyDays = {
    weekly: 7,
    monthly: 30,
    quarterly: 90
  }[data.frequency]

  for (let i = 0; i < data.total_installments; i++) {
    const dueDate = new Date(startDate)
    dueDate.setDate(dueDate.getDate() + (i * frequencyDays))

    installments.push({
      invoice_id: data.invoice_id,
      installment_number: i + 1,
      total_installments: data.total_installments,
      amount: amountPerInstallment,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'pending',
      paid_amount: 0,
      late_fee: 0
    })
  }

  const { error: insertError } = await supabase
    .from('payment_installments')
    .insert(installments)

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  // Update invoice
  await supabase
    .from('invoices')
    .update({
      installment_plan: true,
      total_installments: data.total_installments,
      installment_frequency: data.frequency
    })
    .eq('id', data.invoice_id)

  revalidatePath(`/invoices/${data.invoice_id}`)
  return { success: true, installments }
}

export async function recordInstallmentPayment(data: {
  installment_id: string
  amount: number
  payment_method: string
  payment_reference?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: installment } = await supabase
    .from('payment_installments')
    .select('*, invoices!inner(user_id)')
    .eq('id', data.installment_id)
    .single()

  if (!installment || installment.invoices.user_id !== user.id) {
    return { success: false, error: 'Installment not found' }
  }

  const newPaidAmount = (installment.paid_amount || 0) + data.amount
  const status = newPaidAmount >= installment.amount ? 'paid' : 'pending'

  const { error } = await supabase
    .from('payment_installments')
    .update({
      paid_amount: newPaidAmount,
      status,
      paid_date: status === 'paid' ? new Date().toISOString() : undefined,
      payment_method: data.payment_method,
      payment_reference: data.payment_reference
    })
    .eq('id', data.installment_id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/invoices/${installment.invoice_id}`)
  return { success: true }
}

export async function getInvoiceInstallments(invoiceId: string): Promise<PaymentInstallment[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_installments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('installment_number', { ascending: true })

  if (error) {
    console.error('Error fetching installments:', error)
    return []
  }

  return data as PaymentInstallment[]
}

// ============================================
// BANK TRANSACTION RECONCILIATION
// ============================================

export async function importBankTransaction(data: {
  transaction_id?: string
  transaction_date: string
  amount: number
  transaction_type: 'credit' | 'debit'
  description?: string
  reference_number?: string
  upi_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: transaction, error } = await supabase
    .from('bank_transactions')
    .insert([{
      user_id: user.id,
      ...data
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Trigger auto-matching
  await supabase.rpc('auto_match_bank_transaction', {
    p_transaction_id: transaction.id
  })

  revalidatePath('/payments/reconciliation')
  return { success: true, transaction }
}

export async function reconcileTransaction(data: {
  transaction_id: string
  invoice_id: string
  payment_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('bank_transactions')
    .update({
      invoice_id: data.invoice_id,
      payment_id: data.payment_id,
      reconciled: true
    })
    .eq('id', data.transaction_id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/payments/reconciliation')
  return { success: true }
}

export async function getUnreconciledTransactions(): Promise<BankTransaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('reconciled', false)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data as BankTransaction[]
}

// ============================================
// LATE FEE MANAGEMENT
// ============================================

export async function createLateFeeConfig(data: {
  grace_period_days?: number
  fee_type: 'percentage' | 'fixed' | 'tiered'
  fee_value: number
  max_late_fee?: number
  compound_daily?: boolean
  auto_apply?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Deactivate existing configs
  await supabase
    .from('late_fee_config')
    .update({ is_active: false })
    .eq('user_id', user.id)

  const { data: config, error } = await supabase
    .from('late_fee_config')
    .insert([{
      user_id: user.id,
      grace_period_days: data.grace_period_days ?? 0,
      fee_type: data.fee_type,
      fee_value: data.fee_value,
      max_late_fee: data.max_late_fee,
      compound_daily: data.compound_daily ?? false,
      auto_apply: data.auto_apply ?? true,
      is_active: true
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings/payments')
  return { success: true, config }
}

export async function calculateAndApplyLateFees(invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, due_date, total, status')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (!invoice || invoice.status === 'paid') {
    return { success: false, error: 'Invalid invoice' }
  }

  const { data: lateFee } = await supabase.rpc('calculate_late_fee', {
    p_invoice_id: invoiceId,
    p_due_date: invoice.due_date,
    p_amount: invoice.total
  })

  if (lateFee && lateFee > 0) {
    await supabase
      .from('invoices')
      .update({
        late_fee_applied: lateFee,
        late_fee_last_calculated: new Date().toISOString()
      })
      .eq('id', invoiceId)

    revalidatePath(`/invoices/${invoiceId}`)
    return { success: true, late_fee: lateFee }
  }

  return { success: true, late_fee: 0 }
}

// ============================================
// FAILED PAYMENT RECOVERY
// ============================================

export async function recordFailedPayment(data: {
  invoice_id: string
  customer_id: string
  amount: number
  payment_method?: string
  failure_reason?: string
  failure_code?: string
}) {
  const supabase = await createClient()
  
  const { data: failedPayment, error } = await supabase
    .from('failed_payments')
    .insert([{
      ...data,
      retry_count: 0,
      next_retry_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: failedPayment }
}

export async function retryFailedPayment(failedPaymentId: string) {
  const supabase = await createClient()
  
  const { data: failedPayment } = await supabase
    .from('failed_payments')
    .select('*')
    .eq('id', failedPaymentId)
    .single()

  if (!failedPayment) {
    return { success: false, error: 'Failed payment not found' }
  }

  // Update retry count and next retry time
  const nextRetryHours = Math.min(24 * Math.pow(2, failedPayment.retry_count), 168) // Max 1 week
  const nextRetryAt = new Date(Date.now() + nextRetryHours * 60 * 60 * 1000)

  await supabase
    .from('failed_payments')
    .update({
      retry_count: failedPayment.retry_count + 1,
      last_retry_at: new Date().toISOString(),
      next_retry_at: nextRetryAt.toISOString()
    })
    .eq('id', failedPaymentId)

  // Here you would integrate with actual payment gateway to retry

  return { 
    success: true, 
    message: 'Payment retry initiated',
    next_retry_at: nextRetryAt.toISOString()
  }
}

export async function getFailedPayments(): Promise<FailedPayment[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('failed_payments')
    .select(`
      *,
      invoices!inner(user_id, invoice_number),
      customers(name)
    `)
    .eq('invoices.user_id', user.id)
    .eq('recovered', false)
    .order('created_at', { ascending: false })

  return (data || []) as unknown as FailedPayment[]
}

// ============================================
// BNPL (BUY NOW PAY LATER)
// ============================================

export async function initiateBNPL(data: {
  invoice_id: string
  customer_id: string
  provider: string
  requested_amount: number
  tenure_months: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: application, error } = await supabase
    .from('bnpl_applications')
    .insert([{
      invoice_id: data.invoice_id,
      customer_id: data.customer_id,
      provider: data.provider,
      requested_amount: data.requested_amount,
      tenure_months: data.tenure_months,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Here you would integrate with actual BNPL provider API
  // For now, return the application

  return { success: true, application }
}

export async function updateBNPLStatus(data: {
  application_id: string
  status: 'approved' | 'rejected'
  approved_amount?: number
  rejection_reason?: string
}) {
  const supabase = await createClient()
  
  const updateData: Record<string, unknown> = {
    status: data.status
  }

  if (data.status === 'approved') {
    updateData.approved_amount = data.approved_amount
    updateData.approval_date = new Date().toISOString()
  } else {
    updateData.rejection_reason = data.rejection_reason
  }

  const { error } = await supabase
    .from('bnpl_applications')
    .update(updateData)
    .eq('id', data.application_id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// PAYMENT FOLLOW-UPS
// ============================================

export async function schedulePaymentFollowup(data: {
  invoice_id: string
  customer_id: string
  followup_type: 'whatsapp' | 'sms' | 'email'
  scheduled_at: string
  message_content: string
  reminder_number?: number
}) {
  const supabase = await createClient()
  
  const { data: followup, error } = await supabase
    .from('payment_followups')
    .insert([{
      invoice_id: data.invoice_id,
      customer_id: data.customer_id,
      followup_type: data.followup_type,
      scheduled_at: data.scheduled_at,
      message_content: data.message_content,
      reminder_number: data.reminder_number ?? 1,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, followup }
}

export async function sendFollowupNow(followupId: string) {
  const supabase = await createClient()
  
  const { data: followup } = await supabase
    .from('payment_followups')
    .select('*')
    .eq('id', followupId)
    .single()

  if (!followup) {
    return { success: false, error: 'Follow-up not found' }
  }

  // Here you would integrate with WhatsApp/SMS/Email provider
  // For now, mark as sent

  await supabase
    .from('payment_followups')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', followupId)

  return { success: true, message: 'Follow-up sent successfully' }
}

export async function autoScheduleFollowups(invoiceId: string) {
  const supabase = await createClient()
  
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, customers(*)')
    .eq('id', invoiceId)
    .single()

  if (!invoice || !invoice.auto_followup_enabled) {
    return { success: false, error: 'Auto follow-up not enabled' }
  }

  const followupSchedule = [
    { days: 1, type: 'whatsapp' as const, message: 'Gentle reminder: Payment due tomorrow' },
    { days: 3, type: 'sms' as const, message: 'Payment overdue. Please pay at earliest' },
    { days: 7, type: 'email' as const, message: 'Final reminder: Payment overdue by 7 days' }
  ]

  const dueDate = new Date(invoice.due_date)
  const followups = followupSchedule.map(schedule => ({
    invoice_id: invoiceId,
    customer_id: invoice.customer_id,
    followup_type: schedule.type,
    scheduled_at: new Date(dueDate.getTime() + schedule.days * 24 * 60 * 60 * 1000).toISOString(),
    message_content: schedule.message,
    auto_generated: true,
    reminder_number: schedule.days / 2,
    status: 'pending' as const
  }))

  const { error } = await supabase
    .from('payment_followups')
    .insert(followups)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, count: followups.length }
}

// ============================================
// WHATSAPP PAYMENT LINKS
// ============================================

export async function createWhatsAppPaymentLink(data: {
  invoice_id: string
  customer_id: string
  whatsapp_number: string
  expires_in_hours?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get invoice details
  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, total')
    .eq('id', data.invoice_id)
    .single()

  if (!invoice) {
    return { success: false, error: 'Invoice not found' }
  }

  // Generate payment link (this would be your actual payment gateway link)
  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${data.invoice_id}`
  const expiresAt = new Date(Date.now() + (data.expires_in_hours ?? 72) * 60 * 60 * 1000)

  const { data: link, error } = await supabase
    .from('whatsapp_payment_links')
    .insert([{
      invoice_id: data.invoice_id,
      customer_id: data.customer_id,
      payment_link: paymentLink,
      whatsapp_number: data.whatsapp_number,
      expires_at: expiresAt.toISOString()
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Here you would send via WhatsApp API
  const whatsappMessage = `Hi! Please pay ₹${invoice.total} for invoice ${invoice.invoice_number}. Click: ${paymentLink}`

  return { 
    success: true, 
    link,
    whatsapp_message: whatsappMessage
  }
}

// ============================================
// PAYMENT ANALYTICS
// ============================================

export async function getPaymentBehaviorAnalytics(customerId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const query = supabase
    .from('payment_behavior_analytics')
    .select('*, customers(name, email)')
    .eq('user_id', user.id)

  if (customerId) {
    query.eq('customer_id', customerId)
  }

  const { data } = await query

  return data
}

export async function refreshPaymentBehavior(customerId: string) {
  const supabase = await createClient()
  
  await supabase.rpc('update_payment_behavior', {
    p_customer_id: customerId
  })

  return { success: true }
}
