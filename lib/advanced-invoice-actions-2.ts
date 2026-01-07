'use server'

/**
 * Advance Payment and Approval Actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateGSTComponents } from '@/lib/gst-utils'
import { calculateRoundOff, checkApprovalRequired } from '@/lib/advanced-gst-utils'
import type { InvoiceApproval, AdvancePaymentAdjustment } from '@/lib/types'

// ============================================
// ADVANCE PAYMENT INVOICES
// ============================================

export async function createAdvancePaymentInvoice(data: {
  customer_id: string
  project_name?: string
  advance_percentage: number
  final_invoice_estimated_value: number
  invoice_date: string
  gst_percentage: number
  supply_type: 'intra-state' | 'inter-state'
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Calculate advance amount
  const advanceAmount = (data.final_invoice_estimated_value * data.advance_percentage) / 100

  // Calculate GST
  const gstComponents = calculateGSTComponents(
    advanceAmount,
    data.gst_percentage,
    data.supply_type
  )

  const roundOff = calculateRoundOff(gstComponents.totalAmount)

  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  const advanceNumber = `ADV-${invoiceNumber}`

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: data.customer_id,
      invoice_number: advanceNumber,
      invoice_type: 'advance',
      lifecycle_stage: 'draft',
      is_advance_payment: true,
      advance_percentage: data.advance_percentage,
      project_name: data.project_name,
      invoice_date: data.invoice_date,
      subtotal: advanceAmount,
      gst_percentage: data.gst_percentage,
      gst_amount: gstComponents.totalTax,
      cgst_amount: gstComponents.cgst,
      sgst_amount: gstComponents.sgst,
      igst_amount: gstComponents.igst,
      supply_type: data.supply_type,
      total_before_round_off: gstComponents.totalAmount,
      round_off_amount: roundOff.roundOffAmount,
      total: roundOff.roundedAmount,
      notes: data.notes || `Advance payment (${data.advance_percentage}%)`,
      status: 'draft'
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Add item
  await supabase.from('invoice_items').insert([{
    invoice_id: invoice.id,
    description: `Advance Payment (${data.advance_percentage}%)${data.project_name ? ` - ${data.project_name}` : ''}`,
    quantity: 1,
    unit_price: advanceAmount,
    amount: advanceAmount
  }])

  revalidatePath('/invoices')
  return { success: true, invoice, invoice_id: invoice.id }
}

export async function adjustAdvancePayment(data: {
  final_invoice_id: string
  advance_invoice_ids: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get final invoice
  const { data: finalInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', data.final_invoice_id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !finalInvoice) {
    return { success: false, error: 'Final invoice not found' }
  }

  // Get advance invoices
  const { data: advanceInvoices, error: advError } = await supabase
    .from('invoices')
    .select('*')
    .in('id', data.advance_invoice_ids)
    .eq('user_id', user.id)
    .eq('is_advance_payment', true)
    .eq('status', 'paid')

  if (advError || !advanceInvoices || advanceInvoices.length === 0) {
    return { success: false, error: 'No valid paid advance invoices found' }
  }

  // Calculate total advance amount
  const totalAdvanceAmount = advanceInvoices.reduce((sum, inv) => sum + inv.total, 0)

  // Create adjustment records
  const adjustments = advanceInvoices.map(adv => ({
    advance_invoice_id: adv.id,
    final_invoice_id: data.final_invoice_id,
    adjusted_amount: adv.total,
    adjustment_date: new Date().toISOString().split('T')[0],
    notes: `Adjusted against invoice ${finalInvoice.invoice_number}`
  }))

  const { error: adjError } = await supabase
    .from('advance_payment_adjustments')
    .insert(adjustments)

  if (adjError) {
    return { success: false, error: adjError.message }
  }

  // Update final invoice with advance adjustments
  const newTotal = finalInvoice.total - totalAdvanceAmount

  await supabase
    .from('invoices')
    .update({
      advance_adjusted_amount: totalAdvanceAmount,
      advance_invoice_ids: data.advance_invoice_ids,
      total: newTotal
    })
    .eq('id', data.final_invoice_id)

  revalidatePath('/invoices')
  return { 
    success: true, 
    adjusted_amount: totalAdvanceAmount,
    new_total: newTotal
  }
}

export async function getAdvancePaymentAdjustments(invoiceId: string): Promise<AdvancePaymentAdjustment[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('advance_payment_adjustments')
    .select('*')
    .or(`advance_invoice_id.eq.${invoiceId},final_invoice_id.eq.${invoiceId}`)
    .order('adjustment_date', { ascending: false })

  if (error) {
    console.error('Error fetching adjustments:', error)
    return []
  }

  return data as AdvancePaymentAdjustment[]
}

// ============================================
// INVOICE APPROVAL WORKFLOW
// ============================================

export async function submitInvoiceForApproval(invoiceId: string, approverId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get invoice
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !invoice) {
    return { success: false, error: 'Invoice not found' }
  }

  // Check if approval is required
  const approvalCheck = checkApprovalRequired(invoice.total)

  if (!approvalCheck.required) {
    return { success: false, error: 'Invoice does not require approval' }
  }

  // Create approval record
  const { data: approval, error: approvalError } = await supabase
    .from('invoice_approvals')
    .insert([{
      invoice_id: invoiceId,
      submitted_by: user.id,
      current_approver: approverId,
      approval_level: 1,
      required_approvals: approvalCheck.levels,
      approval_status: 'pending',
      comments: approvalCheck.reason
    }])
    .select()
    .single()

  if (approvalError) {
    return { success: false, error: approvalError.message }
  }

  // Update invoice
  await supabase
    .from('invoices')
    .update({
      requires_approval: true,
      approval_status: 'pending',
      lifecycle_stage: 'draft'
    })
    .eq('id', invoiceId)

  revalidatePath('/invoices')
  return { success: true, approval }
}

export async function approveInvoice(approvalId: string, comments?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get approval
  const { data: approval, error: fetchError } = await supabase
    .from('invoice_approvals')
    .select('*')
    .eq('id', approvalId)
    .eq('current_approver', user.id)
    .eq('approval_status', 'pending')
    .single()

  if (fetchError || !approval) {
    return { success: false, error: 'Approval not found or unauthorized' }
  }

  // Update approval
  await supabase
    .from('invoice_approvals')
    .update({
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      comments
    })
    .eq('id', approvalId)

  // Add to history
  await supabase
    .from('approval_history')
    .insert([{
      approval_id: approvalId,
      approver_id: user.id,
      action: 'approved',
      comments
    }])

  // Update invoice
  await supabase
    .from('invoices')
    .update({
      approval_status: 'approved',
      lifecycle_stage: 'approved'
    })
    .eq('id', approval.invoice_id)

  revalidatePath('/invoices')
  return { success: true }
}

export async function rejectInvoice(approvalId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get approval
  const { data: approval, error: fetchError } = await supabase
    .from('invoice_approvals')
    .select('*')
    .eq('id', approvalId)
    .eq('current_approver', user.id)
    .eq('approval_status', 'pending')
    .single()

  if (fetchError || !approval) {
    return { success: false, error: 'Approval not found or unauthorized' }
  }

  // Update approval
  await supabase
    .from('invoice_approvals')
    .update({
      approval_status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', approvalId)

  // Add to history
  await supabase
    .from('approval_history')
    .insert([{
      approval_id: approvalId,
      approver_id: user.id,
      action: 'rejected',
      comments: reason
    }])

  // Update invoice
  await supabase
    .from('invoices')
    .update({
      approval_status: 'rejected',
      lifecycle_stage: 'draft'
    })
    .eq('id', approval.invoice_id)

  revalidatePath('/invoices')
  return { success: true }
}

export async function getPendingApprovals(): Promise<InvoiceApproval[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('invoice_approvals')
    .select('*, invoice:invoices(*)')
    .eq('current_approver', user.id)
    .eq('approval_status', 'pending')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching approvals:', error)
    return []
  }

  return data as InvoiceApproval[]
}

export async function getApprovalHistory(invoiceId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invoice_approvals')
    .select(`
      *,
      approval_history(
        *,
        approver:auth.users(email)
      )
    `)
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching approval history:', error)
    return []
  }

  return data
}

// ============================================
// HSN/SAC PREFERENCES
// ============================================

export async function trackHSNSACUsage(hsnSacCode: string, description?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // Upsert usage tracking
  await supabase
    .from('user_hsn_sac_preferences')
    .upsert([{
      user_id: user.id,
      hsn_sac_code: hsnSacCode,
      custom_description: description,
      usage_count: 1,
      last_used_at: new Date().toISOString()
    }], {
      onConflict: 'user_id,hsn_sac_code',
      ignoreDuplicates: false
    })

  // Also increment in master table
  await supabase
    .from('hsn_sac_master')
    .update({ 
      usage_count: supabase.rpc('increment_usage_count')
    })
    .eq('code', hsnSacCode)
}

export async function getUserFrequentHSNSAC(limit: number = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('user_hsn_sac_preferences')
    .select('*')
    .eq('user_id', user.id)
    .order('usage_count', { ascending: false })
    .order('last_used_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching frequent HSN/SAC:', error)
    return []
  }

  return data
}

// ============================================
// COMPLIANCE LOGGING
// ============================================

export async function logComplianceCheck(
  invoiceId: string,
  checkType: string,
  status: 'pass' | 'warning' | 'error',
  message: string,
  details?: Record<string, unknown>
) {
  const supabase = await createClient()

  await supabase
    .from('invoice_compliance_log')
    .insert([{
      invoice_id: invoiceId,
      check_type: checkType,
      status,
      message,
      details
    }])
}

export async function getComplianceLogs(invoiceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice_compliance_log')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('checked_at', { ascending: false })

  if (error) {
    console.error('Error fetching compliance logs:', error)
    return []
  }

  return data
}
