'use server'

/**
 * Advanced Invoice Actions
 * Handles invoice series, milestones, approvals, conversions, etc.
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  calculateRoundOff
} from '@/lib/advanced-gst-utils'
import { calculateGSTComponents } from '@/lib/gst-utils'
import type { 
  InvoiceSeries, 
  InvoiceMilestone, 
  CompanyGSTSettings 
} from '@/lib/types'

// ============================================
// INVOICE SERIES MANAGEMENT
// ============================================

export async function createInvoiceSeries(data: {
  series_name: string
  series_code: string
  prefix: string
  suffix?: string
  financial_year_based: boolean
  branch_id?: string
  number_format?: string
  padding_length?: number
  is_default?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: series, error } = await supabase
    .from('invoice_series')
    .insert([{
      user_id: user.id,
      series_name: data.series_name,
      series_code: data.series_code,
      prefix: data.prefix,
      suffix: data.suffix,
      financial_year_based: data.financial_year_based,
      branch_id: data.branch_id,
      number_format: data.number_format || '{PREFIX}-{FY}-{NUM}',
      padding_length: data.padding_length || 4,
      is_default: data.is_default || false,
      is_active: true,
      current_number: 0,
      reset_annually: true
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating invoice series:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/invoices')
  return { success: true, series }
}

export async function getInvoiceSeries(): Promise<InvoiceSeries[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('invoice_series')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching invoice series:', error)
    return []
  }

  return data as InvoiceSeries[]
}

export async function updateInvoiceSeries(seriesId: string, updates: Partial<InvoiceSeries>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('invoice_series')
    .update(updates)
    .eq('id', seriesId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/invoices')
  return { success: true, series: data }
}

// ============================================
// COMPANY GST SETTINGS
// ============================================

export async function saveCompanyGSTSettings(settings: {
  company_gstin: string
  company_state_code: string
  company_state_name?: string
  default_place_of_supply?: string
  is_composition_scheme?: boolean
  composition_rate?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('company_gst_settings')
    .upsert([{
      user_id: user.id,
      ...settings
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  return { success: true, settings: data }
}

export async function getCompanyGSTSettings(): Promise<CompanyGSTSettings | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('company_gst_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching company GST settings:', error)
    return null
  }

  return data as CompanyGSTSettings
}

// ============================================
// PROFORMA INVOICE
// ============================================

export async function createProformaInvoice(invoiceData: {
  customer_id: string
  invoice_date: string
  proforma_valid_until?: string
  gst_percentage: number
  supply_type: 'intra-state' | 'inter-state'
  notes?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  const proformaNumber = `PRO-${invoiceNumber}`

  // Calculate GST
  const subtotal = invoiceData.items.reduce((sum: number, item) => 
    sum + (item.quantity * item.unit_price), 0)
  
  const gstComponents = calculateGSTComponents(
    subtotal, 
    invoiceData.gst_percentage, 
    invoiceData.supply_type
  )

  const roundOff = calculateRoundOff(gstComponents.totalAmount)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: invoiceData.customer_id,
      invoice_number: proformaNumber,
      invoice_type: 'proforma',
      lifecycle_stage: 'proforma',
      invoice_date: invoiceData.invoice_date,
      proforma_valid_until: invoiceData.proforma_valid_until,
      subtotal,
      gst_percentage: invoiceData.gst_percentage,
      gst_amount: gstComponents.totalTax,
      cgst_amount: gstComponents.cgst,
      sgst_amount: gstComponents.sgst,
      igst_amount: gstComponents.igst,
      supply_type: invoiceData.supply_type,
      total_before_round_off: gstComponents.totalAmount,
      round_off_amount: roundOff.roundOffAmount,
      total: roundOff.roundedAmount,
      notes: invoiceData.notes,
      status: 'draft'
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Add items
  const itemsToInsert = invoiceData.items.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.quantity * item.unit_price,
    hsn_sac_code: item.hsn_sac_code,
    hsn_sac_type: item.hsn_sac_type,
    gst_rate: item.gst_rate
  }))

  await supabase.from('invoice_items').insert(itemsToInsert)

  revalidatePath('/invoices')
  return { success: true, invoice, invoice_id: invoice.id }
}

export async function convertProformaToInvoice(proformaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get proforma invoice
  const { data: proforma, error: fetchError } = await supabase
    .from('invoices')
    .select('*, invoice_items(*), customer:customers(*)')
    .eq('id', proformaId)
    .eq('user_id', user.id)
    .eq('invoice_type', 'proforma')
    .single()

  if (fetchError || !proforma) {
    return { success: false, error: 'Proforma invoice not found' }
  }

  if (proforma.lifecycle_stage === 'converted') {
    return { success: false, error: 'Proforma already converted' }
  }

  // Generate new invoice number
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  // Create standard invoice from proforma
  const { data: newInvoice, error: createError } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: proforma.customer_id,
      invoice_number: invoiceNumber,
      invoice_type: 'standard',
      lifecycle_stage: 'draft',
      parent_invoice_id: proforma.id,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: proforma.subtotal,
      gst_percentage: proforma.gst_percentage,
      gst_amount: proforma.gst_amount,
      cgst_amount: proforma.cgst_amount,
      sgst_amount: proforma.sgst_amount,
      igst_amount: proforma.igst_amount,
      supply_type: proforma.supply_type,
      total_before_round_off: proforma.total_before_round_off,
      round_off_amount: proforma.round_off_amount,
      total: proforma.total,
      notes: proforma.notes,
      status: 'draft'
    }])
    .select()
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  // Copy items
  const itemsToInsert = (proforma.invoice_items as Array<{
    description: string
    quantity: number
    unit_price: number
    amount: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
  }>).map((item) => ({
    invoice_id: newInvoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.amount,
    hsn_sac_code: item.hsn_sac_code,
    hsn_sac_type: item.hsn_sac_type,
    gst_rate: item.gst_rate
  }))

  await supabase.from('invoice_items').insert(itemsToInsert)

  // Update proforma status
  await supabase
    .from('invoices')
    .update({ 
      lifecycle_stage: 'converted',
      converted_to_invoice_id: newInvoice.id,
      status: 'cancelled'
    })
    .eq('id', proformaId)

  revalidatePath('/invoices')
  return { success: true, invoice_id: newInvoice.id }
}

// ============================================
// CREDIT NOTE
// ============================================

export async function createCreditNote(data: {
  original_invoice_id: string
  reason: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
  }>
  gst_percentage: number
  supply_type: 'intra-state' | 'inter-state'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get original invoice
  const { data: originalInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', data.original_invoice_id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !originalInvoice) {
    return { success: false, error: 'Original invoice not found' }
  }

  // Generate credit note number
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  const creditNoteNumber = `CN-${invoiceNumber}`

  // Calculate totals (negative amounts for credit note)
  const subtotal = data.items.reduce((sum, item) => 
    sum + (item.quantity * item.unit_price), 0)
  
  const gstComponents = calculateGSTComponents(
    subtotal, 
    data.gst_percentage, 
    data.supply_type
  )

  const roundOff = calculateRoundOff(gstComponents.totalAmount)

  const { data: creditNote, error: createError } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: originalInvoice.customer_id,
      invoice_number: creditNoteNumber,
      invoice_type: 'credit_note',
      lifecycle_stage: 'approved',
      parent_invoice_id: data.original_invoice_id,
      credit_note_reason: data.reason,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: -subtotal, // Negative for credit note
      gst_percentage: data.gst_percentage,
      gst_amount: -gstComponents.totalTax,
      cgst_amount: -gstComponents.cgst,
      sgst_amount: -gstComponents.sgst,
      igst_amount: -gstComponents.igst,
      supply_type: data.supply_type,
      total_before_round_off: -gstComponents.totalAmount,
      round_off_amount: -roundOff.roundOffAmount,
      total: -roundOff.roundedAmount,
      status: 'sent'
    }])
    .select()
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  // Add items
  const itemsToInsert = data.items.map((item) => ({
    invoice_id: creditNote.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: -item.unit_price, // Negative for credit note
    amount: -(item.quantity * item.unit_price),
    hsn_sac_code: item.hsn_sac_code,
    hsn_sac_type: item.hsn_sac_type,
    gst_rate: item.gst_rate
  }))

  await supabase.from('invoice_items').insert(itemsToInsert)

  revalidatePath('/invoices')
  return { success: true, credit_note_id: creditNote.id }
}

// ============================================
// MILESTONE BILLING
// ============================================

export async function createMilestoneInvoice(data: {
  customer_id: string
  project_name: string
  project_total_value: number
  milestones: Array<{
    milestone_name: string
    description: string
    percentage: number
    due_date?: string
    completion_criteria?: string
  }>
  gst_percentage: number
  supply_type: 'intra-state' | 'inter-state'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Generate invoice number for parent
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  const milestoneNumber = `MIL-${invoiceNumber}`

  // Create parent invoice (placeholder)
  const { data: parentInvoice, error: createError } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: data.customer_id,
      invoice_number: milestoneNumber,
      invoice_type: 'milestone',
      lifecycle_stage: 'draft',
      is_milestone_based: true,
      project_name: data.project_name,
      project_total_value: data.project_total_value,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      gst_percentage: data.gst_percentage,
      gst_amount: 0,
      total: 0,
      supply_type: data.supply_type,
      status: 'draft'
    }])
    .select()
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  // Create milestone records
  const milestonesToInsert = data.milestones.map((milestone, index) => {
    const amount = (data.project_total_value * milestone.percentage) / 100
    return {
      parent_invoice_id: parentInvoice.id,
      milestone_number: index + 1,
      milestone_name: milestone.milestone_name,
      description: milestone.description,
      percentage: milestone.percentage,
      amount,
      due_date: milestone.due_date,
      completion_criteria: milestone.completion_criteria,
      status: 'pending'
    }
  })

  const { error: milestoneError } = await supabase
    .from('invoice_milestones')
    .insert(milestonesToInsert)

  if (milestoneError) {
    return { success: false, error: milestoneError.message }
  }

  revalidatePath('/invoices')
  return { success: true, parent_invoice_id: parentInvoice.id }
}

export async function getMilestones(parentInvoiceId: string): Promise<InvoiceMilestone[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invoice_milestones')
    .select('*')
    .eq('parent_invoice_id', parentInvoiceId)
    .order('milestone_number', { ascending: true })

  if (error) {
    console.error('Error fetching milestones:', error)
    return []
  }

  return data as InvoiceMilestone[]
}

export async function generateMilestoneInvoice(milestoneId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get milestone and parent invoice
  const { data: milestone, error: fetchError } = await supabase
    .from('invoice_milestones')
    .select('*, parent_invoice:invoices(*)')
    .eq('id', milestoneId)
    .single()

  if (fetchError || !milestone) {
    return { success: false, error: 'Milestone not found' }
  }

  if (milestone.status !== 'pending') {
    return { success: false, error: 'Milestone already invoiced' }
  }

  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  // Calculate GST on milestone amount
  const parentInvoice = milestone.parent_invoice as { gst_percentage: number; supply_type: 'intra-state' | 'inter-state'; customer_id: string; project_name?: string }
  const gstComponents = calculateGSTComponents(
    milestone.amount,
    parentInvoice.gst_percentage,
    parentInvoice.supply_type
  )

  const roundOff = calculateRoundOff(gstComponents.totalAmount)

  // Create milestone invoice
  const { data: newInvoice, error: createError } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: parentInvoice.customer_id,
      invoice_number: invoiceNumber,
      invoice_type: 'milestone',
      lifecycle_stage: 'draft',
      parent_invoice_id: milestone.parent_invoice_id,
      milestone_id: milestone.id,
      project_name: parentInvoice.project_name,
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: milestone.amount,
      gst_percentage: parentInvoice.gst_percentage,
      gst_amount: gstComponents.totalTax,
      cgst_amount: gstComponents.cgst,
      sgst_amount: gstComponents.sgst,
      igst_amount: gstComponents.igst,
      supply_type: parentInvoice.supply_type,
      total_before_round_off: gstComponents.totalAmount,
      round_off_amount: roundOff.roundOffAmount,
      total: roundOff.roundedAmount,
      notes: `Milestone ${milestone.milestone_number}: ${milestone.milestone_name}`,
      status: 'draft'
    }])
    .select()
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  // Add item
  await supabase.from('invoice_items').insert([{
    invoice_id: newInvoice.id,
    description: `${milestone.milestone_name} - ${milestone.description || ''}`,
    quantity: 1,
    unit_price: milestone.amount,
    amount: milestone.amount
  }])

  // Update milestone status
  await supabase
    .from('invoice_milestones')
    .update({ 
      status: 'invoiced',
      milestone_invoice_id: newInvoice.id
    })
    .eq('id', milestoneId)

  revalidatePath('/invoices')
  return { success: true, invoice_id: newInvoice.id }
}

// Continue in next file...
