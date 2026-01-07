'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  GSTR1Record,
  GSTR3BRecord,
  EInvoiceRecord,
  EWayBill,
  GSTMismatchAlert,
  CAProfile,
  ClientCAAccess,
  CAActivityLog,
  GSTAuditTrail,
  GSTHealthScore,
  GSTHealthScoreHistory,
  GenerateEInvoiceData,
  CreateEWayBillData,
  CreateMismatchAlertData,
  GrantCAAccessData,
  CreateAuditLogData,
  GSTR1Filter,
  GSTR3BFilter,
  EInvoiceFilter,
  EWayBillFilter,
  MismatchAlertFilter,
  AuditTrailFilter,
  GSTComplianceDashboard,
  CADashboard,
  CAClientSummary
} from './gst-advanced-types'

// =====================================================
// 1. GSTR-1 AUTO-PREP ACTIONS
// =====================================================

/**
 * Generate GSTR-1 data for a specific tax period
 */
export async function generateGSTR1Data(taxPeriod: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Call database function to generate GSTR-1
    const { data, error } = await supabase.rpc('generate_gstr1_data', {
      p_user_id: user.id,
      p_tax_period: taxPeriod
    })

    if (error) throw error

    revalidatePath('/gst/gstr1')
    return { success: true, data }
  } catch (error) {
    console.error('Error generating GSTR-1:', error)
    return { success: false, error: 'Failed to generate GSTR-1 data' }
  }
}

/**
 * Get GSTR-1 records with optional filters
 */
export async function getGSTR1Records(filter?: GSTR1Filter): Promise<GSTR1Record[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('gstr1_records')
    .select('*')
    .eq('user_id', user.id)
    .order('tax_period', { ascending: false })

  if (filter?.tax_period) {
    query = query.eq('tax_period', filter.tax_period)
  }
  if (filter?.financial_year) {
    query = query.eq('financial_year', filter.financial_year)
  }
  if (filter?.status) {
    query = query.eq('preparation_status', filter.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching GSTR-1 records:', error)
    return []
  }

  return data || []
}

/**
 * Get single GSTR-1 record
 */
export async function getGSTR1Record(id: string): Promise<GSTR1Record | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gstr1_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching GSTR-1 record:', error)
    return null
  }

  return data
}

/**
 * Mark GSTR-1 as filed
 */
export async function markGSTR1Filed(id: string, arn: string, referenceNumber: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('gstr1_records')
    .update({
      preparation_status: 'filed',
      filed_at: new Date().toISOString(),
      arn,
      filing_reference_number: referenceNumber,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error marking GSTR-1 as filed:', error)
    return { success: false, error: 'Failed to update status' }
  }

  // Create audit log
  await createAuditLog({
    action_type: 'file',
    entity_type: 'gstr1',
    entity_id: id,
    action_description: `GSTR-1 filed with ARN: ${arn}`,
    ip_address: '0.0.0.0',  // Will be replaced by middleware
    is_critical: true
  })

  revalidatePath('/gst/gstr1')
  return { success: true }
}

/**
 * Export GSTR-1 to JSON format (for offline tool)
 */
export async function exportGSTR1JSON(id: string) {
  const record = await getGSTR1Record(id)
  if (!record) {
    return { success: false, error: 'Record not found' }
  }

  // Format data for GST offline tool
  const gstr1JSON = {
    gstin: '', // Will be filled from company settings
    ret_period: record.tax_period,
    b2b: record.b2b_invoices,
    b2cl: record.b2cl_invoices,
    b2cs: record.b2cs_summary,
    exp: record.export_invoices,
    cdnr: record.credit_debit_notes,
    hsn: record.hsn_summary,
    docs: record.documents_issued
  }

  return { success: true, data: gstr1JSON }
}

// =====================================================
// 2. GSTR-3B SUMMARY ACTIONS
// =====================================================

/**
 * Generate GSTR-3B data for a tax period
 */
export async function generateGSTR3BData(taxPeriod: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Calculate period dates
    const year = parseInt(taxPeriod.slice(2, 6))
    const month = parseInt(taxPeriod.slice(0, 2))
    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 0)

    // Get financial year
    const fy = month >= 4 
      ? `${year}-${year + 1}` 
      : `${year - 1}-${year}`

    // Fetch invoices for the period
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .gte('invoice_date', periodStart.toISOString().split('T')[0])
      .lte('invoice_date', periodEnd.toISOString().split('T')[0])

    if (invError) throw invError

    // Calculate outward supplies
    const outwardTaxableValue = invoices?.reduce((sum, inv) => sum + (inv.subtotal || 0), 0) || 0
    const outwardTaxAmount = invoices?.reduce((sum, inv) => sum + (inv.gst_amount || 0), 0) || 0

    // Calculate tax components
    const taxPayableIGST = invoices?.reduce((sum, inv) => sum + (inv.igst_amount || 0), 0) || 0
    const taxPayableCGST = invoices?.reduce((sum, inv) => sum + (inv.cgst_amount || 0), 0) || 0
    const taxPayableSGST = invoices?.reduce((sum, inv) => sum + (inv.sgst_amount || 0), 0) || 0

    // Insert or update GSTR-3B record
    const { data, error } = await supabase
      .from('gstr3b_records')
      .upsert({
        user_id: user.id,
        tax_period: taxPeriod,
        financial_year: fy,
        return_period_from: periodStart.toISOString().split('T')[0],
        return_period_to: periodEnd.toISOString().split('T')[0],
        outward_taxable_supplies: outwardTaxableValue,
        outward_tax_amount: outwardTaxAmount,
        tax_payable_igst: taxPayableIGST,
        tax_payable_cgst: taxPayableCGST,
        tax_payable_sgst: taxPayableSGST,
        preparation_status: 'ready',
        auto_generated: true,
        last_calculated_at: new Date().toISOString()
      }, { onConflict: 'user_id,tax_period' })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/gst/gstr3b')
    return { success: true, data }
  } catch (error) {
    console.error('Error generating GSTR-3B:', error)
    return { success: false, error: 'Failed to generate GSTR-3B data' }
  }
}

/**
 * Get GSTR-3B records
 */
export async function getGSTR3BRecords(filter?: GSTR3BFilter): Promise<GSTR3BRecord[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('gstr3b_records')
    .select('*')
    .eq('user_id', user.id)
    .order('tax_period', { ascending: false })

  if (filter?.tax_period) query = query.eq('tax_period', filter.tax_period)
  if (filter?.financial_year) query = query.eq('financial_year', filter.financial_year)
  if (filter?.status) query = query.eq('preparation_status', filter.status)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching GSTR-3B records:', error)
    return []
  }

  return data || []
}

/**
 * Get single GSTR-3B record
 */
export async function getGSTR3BRecord(id: string): Promise<GSTR3BRecord | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gstr3b_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

/**
 * Mark GSTR-3B as filed
 */
export async function markGSTR3BFiled(id: string, arn: string, referenceNumber: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('gstr3b_records')
    .update({
      preparation_status: 'filed',
      filed_at: new Date().toISOString(),
      arn,
      filing_reference_number: referenceNumber,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to update status' }
  }

  await createAuditLog({
    action_type: 'file',
    entity_type: 'gstr3b',
    entity_id: id,
    action_description: `GSTR-3B filed with ARN: ${arn}`,
    ip_address: '0.0.0.0',
    is_critical: true
  })

  revalidatePath('/gst/gstr3b')
  return { success: true }
}

// =====================================================
// 3. E-INVOICE (IRN) ACTIONS
// =====================================================

/**
 * Generate E-Invoice (IRN) for an invoice
 */
export async function generateEInvoice(invoiceData: GenerateEInvoiceData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get invoice details
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*)')
      .eq('id', invoiceData.invoice_id)
      .single()

    if (invError || !invoice) {
      return { success: false, error: 'Invoice not found' }
    }

    // Generate IRN (In production, this would call IRP API)
    const irn = generateIRN(invoice)
    const acknowledgementNumber = `ACK${Date.now()}`
    const qrCode = generateQRCode(invoice, irn)

    // Save E-Invoice record
    const { data: einvoice, error } = await supabase
      .from('einvoice_records')
      .insert({
        user_id: user.id,
        invoice_id: invoiceData.invoice_id,
        irn,
        acknowledgement_number: acknowledgementNumber,
        acknowledgement_date: new Date().toISOString(),
        signed_qr_code: qrCode,
        irp_status: 'generated',
        irp_response: {
          Status: 'Success',
          AckNo: acknowledgementNumber,
          AckDt: new Date().toISOString(),
          Irn: irn,
          SignedQRCode: qrCode
        },
        generated_at: new Date().toISOString(),
        generated_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Generate E-Way Bill if requested
    if (invoiceData.generate_eway_bill && invoiceData.distance_km) {
      await generateEWayBillFromEInvoice({
        einvoice_id: einvoice.id,
        document_number: invoice.invoice_number,
        document_date: invoice.invoice_date,
        recipient_name: invoice.customer.name,
        recipient_address: invoice.customer.address || '',
        recipient_state_code: invoice.customer.state_code || '27',
        recipient_pincode: invoice.customer.pincode || '000000',
        goods_value: invoice.subtotal,
        hsn_code: invoice.items[0]?.hsn_sac_code || '999999',
        goods_description: invoice.items[0]?.description || 'Goods',
        quantity: invoice.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        unit: 'NOS',
        approximate_distance_km: invoiceData.distance_km,
        transport_mode: invoiceData.transport_mode || 'road',
        transporter_id: invoiceData.transporter_id,
        vehicle_number: invoiceData.vehicle_number
      })
    }

    await createAuditLog({
      action_type: 'create',
      entity_type: 'einvoice',
      entity_id: einvoice.id,
      action_description: `E-Invoice generated for ${invoice.invoice_number}`,
      ip_address: '0.0.0.0',
      is_critical: true
    })

    revalidatePath('/invoices')
    return { success: true, data: einvoice }
  } catch (error) {
    console.error('Error generating E-Invoice:', error)
    return { success: false, error: 'Failed to generate E-Invoice' }
  }
}

/**
 * Get E-Invoice records
 */
export async function getEInvoiceRecords(filter?: EInvoiceFilter): Promise<EInvoiceRecord[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('einvoice_records')
    .select('*, invoice:invoices(invoice_number, invoice_date, total)')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })

  if (filter?.irp_status) query = query.eq('irp_status', filter.irp_status)
  if (filter?.has_eway_bill !== undefined) {
    query = filter.has_eway_bill 
      ? query.not('eway_bill_number', 'is', null)
      : query.is('eway_bill_number', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching E-Invoices:', error)
    return []
  }

  return data || []
}

/**
 * Cancel E-Invoice
 */
export async function cancelEInvoice(id: string, reason: string, remarks: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('einvoice_records')
    .update({
      irp_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      cancellation_remarks: remarks,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to cancel E-Invoice' }
  }

  await createAuditLog({
    action_type: 'cancel',
    entity_type: 'einvoice',
    entity_id: id,
    action_description: `E-Invoice cancelled: ${reason}`,
    ip_address: '0.0.0.0',
    is_critical: true
  })

  revalidatePath('/invoices')
  return { success: true }
}

// Helper function to generate IRN (simplified - production would use actual algorithm)
function generateIRN(invoice: { id: string; invoice_number: string }): string {
  const hash = Buffer.from(`${invoice.id}${invoice.invoice_number}${Date.now()}`).toString('base64')
  return hash.substring(0, 64).toUpperCase()
}

// Helper function to generate QR Code data
function generateQRCode(invoice: { invoice_number: string; total: number }, irn: string): string {
  return Buffer.from(JSON.stringify({
    irn,
    invoice_number: invoice.invoice_number,
    total: invoice.total
  })).toString('base64')
}

// =====================================================
// 4. E-WAY BILL ACTIONS
// =====================================================

/**
 * Create E-Way Bill
 */
export async function createEWayBill(billData: CreateEWayBillData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get company GSTIN
    const { data: settings } = await supabase
      .from('company_settings')
      .select('company_gstin')
      .eq('user_id', user.id)
      .single()

    const supplierGSTIN = settings?.company_gstin || 'UNKNOWN'

    // Generate E-Way Bill Number
    const ewayBillNumber = generateEWayBillNumber()
    const validFrom = new Date()
    const validUntil = calculateEWayBillValidity(validFrom, billData.approximate_distance_km)

    // Calculate transaction type based on GSTIN
    const transactionType = billData.recipient_gstin ? 'regular' : 'bill_to_ship_to'
    const supplyType = 'outward'

    const { data: ewayBill, error } = await supabase
      .from('eway_bills')
      .insert({
        user_id: user.id,
        invoice_id: billData.invoice_id,
        einvoice_id: billData.einvoice_id,
        eway_bill_number: ewayBillNumber,
        eway_bill_date: new Date().toISOString(),
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        approximate_distance_km: billData.approximate_distance_km,
        document_type: 'inv',
        document_number: billData.document_number,
        document_date: billData.document_date,
        supplier_gstin: supplierGSTIN,
        recipient_gstin: billData.recipient_gstin,
        recipient_name: billData.recipient_name,
        recipient_address: billData.recipient_address,
        recipient_state_code: billData.recipient_state_code,
        recipient_pincode: billData.recipient_pincode,
        transaction_type: transactionType,
        supply_type: supplyType,
        goods_value: billData.goods_value,
        hsn_code: billData.hsn_code,
        goods_description: billData.goods_description,
        quantity: billData.quantity,
        unit: billData.unit,
        total_invoice_value: billData.goods_value,
        transporter_id: billData.transporter_id,
        transport_mode: billData.transport_mode,
        vehicle_number: billData.vehicle_number,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    await createAuditLog({
      action_type: 'create',
      entity_type: 'eway_bill',
      entity_id: ewayBill.id,
      action_description: `E-Way Bill ${ewayBillNumber} generated`,
      ip_address: '0.0.0.0',
      is_critical: true
    })

    revalidatePath('/eway-bills')
    return { success: true, data: ewayBill }
  } catch (error) {
    console.error('Error creating E-Way Bill:', error)
    return { success: false, error: 'Failed to create E-Way Bill' }
  }
}

/**
 * Generate E-Way Bill from E-Invoice
 */
async function generateEWayBillFromEInvoice(billData: CreateEWayBillData) {
  // Similar to createEWayBill but linked to E-Invoice
  return createEWayBill(billData)
}

/**
 * Get E-Way Bills
 */
export async function getEWayBills(filter?: EWayBillFilter): Promise<EWayBill[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('eway_bills')
    .select('*')
    .eq('user_id', user.id)
    .order('eway_bill_date', { ascending: false })

  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.transport_mode) query = query.eq('transport_mode', filter.transport_mode)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching E-Way Bills:', error)
    return []
  }

  return data || []
}

/**
 * Cancel E-Way Bill
 */
export async function cancelEWayBill(id: string, reason: string, remarks: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('eway_bills')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      cancellation_remarks: remarks,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to cancel E-Way Bill' }
  }

  revalidatePath('/eway-bills')
  return { success: true }
}

// Helper functions
function generateEWayBillNumber(): string {
  return `EWB${Date.now().toString().slice(-10)}`
}

function calculateEWayBillValidity(from: Date, distanceKm: number): Date {
  // Standard validity calculation
  // Up to 100 km = 1 day
  // For every additional 100 km = +1 day
  const days = Math.ceil(distanceKm / 100)
  const validUntil = new Date(from)
  validUntil.setDate(validUntil.getDate() + days)
  return validUntil
}

// =====================================================
// 5. GST MISMATCH ALERTS ACTIONS
// =====================================================

/**
 * Create GST mismatch alert
 */
export async function createMismatchAlert(alertData: CreateMismatchAlertData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const difference = Math.abs(alertData.expected_value - alertData.actual_value)

  const { data, error } = await supabase
    .from('gst_mismatch_alerts')
    .insert({
      user_id: user.id,
      ...alertData,
      difference,
      status: 'open',
      detected_by: 'system',
      detected_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating mismatch alert:', error)
    return { success: false, error: 'Failed to create alert' }
  }

  revalidatePath('/gst/alerts')
  return { success: true, data }
}

/**
 * Get mismatch alerts
 */
export async function getMismatchAlerts(filter?: MismatchAlertFilter): Promise<GSTMismatchAlert[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('gst_mismatch_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('detected_at', { ascending: false })

  if (filter?.alert_type) query = query.eq('alert_type', filter.alert_type)
  if (filter?.severity) query = query.eq('severity', filter.severity)
  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.tax_period) query = query.eq('tax_period', filter.tax_period)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }

  return data || []
}

/**
 * Resolve mismatch alert
 */
export async function resolveMismatchAlert(id: string, notes: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('gst_mismatch_alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: 'Failed to resolve alert' }
  }

  revalidatePath('/gst/alerts')
  return { success: true }
}

/**
 * Run automated mismatch detection
 */
export async function detectGSTMismatches(taxPeriod: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const alerts: CreateMismatchAlertData[] = []

    // Get GSTR-1 data
    const gstr1 = await supabase
      .from('gstr1_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_period', taxPeriod)
      .single()

    // Get GSTR-3B data
    const gstr3b = await supabase
      .from('gstr3b_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_period', taxPeriod)
      .single()

    if (gstr1.data && gstr3b.data) {
      // Compare taxable values
      const gstr1Value = gstr1.data.b2b_taxable_value
      const gstr3bValue = gstr3b.data.outward_taxable_supplies

      if (Math.abs(gstr1Value - gstr3bValue) > 0.01) {
        alerts.push({
          alert_type: 'gstr3b_mismatch',
          severity: 'high',
          entity_type: 'gstr3b',
          reference_number: taxPeriod,
          expected_value: gstr1Value,
          actual_value: gstr3bValue,
          field_name: 'outward_taxable_supplies',
          description: `GSTR-1 and GSTR-3B taxable values do not match for period ${taxPeriod}`,
          tax_period: taxPeriod
        })
      }
    }

    // Create alerts
    for (const alert of alerts) {
      await createMismatchAlert(alert)
    }

    return { success: true, alertsCreated: alerts.length }
  } catch (error) {
    console.error('Error detecting mismatches:', error)
    return { success: false, error: 'Failed to detect mismatches' }
  }
}

// =====================================================
// 6-7. CA COLLABORATION ACTIONS
// =====================================================

/**
 * Create or update CA profile
 */
export async function upsertCAProfile(profileData: Partial<CAProfile>) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('ca_profiles')
    .upsert({
      user_id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error upserting CA profile:', error)
    return { success: false, error: 'Failed to save CA profile' }
  }

  revalidatePath('/ca/profile')
  return { success: true, data }
}

/**
 * Get CA profile
 */
export async function getCAProfile(): Promise<CAProfile | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data, error } = await supabase
    .from('ca_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}

/**
 * Grant CA access to client data
 */
export async function grantCAAccess(accessData: GrantCAAccessData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Find CA by email
  const { data: caUser, error: caError } = await supabase
    .from('ca_profiles')
    .select('user_id')
    .eq('email', accessData.ca_email)
    .single()

  if (caError || !caUser) {
    return { success: false, error: 'CA not found with this email' }
  }

  // Generate invitation token
  const invitationToken = Buffer.from(`${user.id}:${caUser.user_id}:${Date.now()}`).toString('base64')

  const { data, error } = await supabase
    .from('client_ca_access')
    .insert({
      client_user_id: user.id,
      ca_user_id: caUser.user_id,
      access_level: accessData.access_level,
      allowed_modules: accessData.allowed_modules,
      can_view_invoices: accessData.allowed_modules.includes('invoices'),
      can_view_reports: accessData.allowed_modules.includes('reports'),
      can_file_returns: accessData.allowed_modules.includes('gst_filing'),
      valid_from: accessData.valid_from,
      valid_until: accessData.valid_until,
      client_notes: accessData.client_notes,
      status: 'pending',
      invitation_token: invitationToken,
      invitation_sent_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error granting CA access:', error)
    return { success: false, error: 'Failed to grant access' }
  }

  // TODO: Send email invitation to CA

  await createAuditLog({
    action_type: 'create',
    entity_type: 'user',
    action_description: `CA access granted to ${accessData.ca_email}`,
    ip_address: '0.0.0.0',
    is_critical: true
  })

  revalidatePath('/settings/ca-access')
  return { success: true, data, invitationToken }
}

/**
 * Accept CA invitation
 */
export async function acceptCAInvitation(token: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('client_ca_access')
    .update({
      status: 'active',
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('invitation_token', token)
    .eq('ca_user_id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Invalid or expired invitation' }
  }

  revalidatePath('/ca/clients')
  return { success: true, data }
}

/**
 * Revoke CA access
 */
export async function revokeCAAccess(accessId: string, reason: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('client_ca_access')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
      revocation_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', accessId)
    .eq('client_user_id', user.id)

  if (error) {
    return { success: false, error: 'Failed to revoke access' }
  }

  await createAuditLog({
    action_type: 'delete',
    entity_type: 'user',
    entity_id: accessId,
    action_description: `CA access revoked: ${reason}`,
    ip_address: '0.0.0.0',
    is_critical: true
  })

  revalidatePath('/settings/ca-access')
  return { success: true }
}

/**
 * Get CA's clients
 */
export async function getCAClients(): Promise<CAClientSummary[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  const { data, error } = await supabase
    .from('ca_clients_dashboard')
    .select('*')
    .eq('ca_user_id', user.id)
    .order('health_score', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching CA clients:', error)
    return []
  }

  return data || []
}

/**
 * Get client's CA access list
 */
export async function getClientCAAccess(): Promise<ClientCAAccess[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  const { data, error } = await supabase
    .from('client_ca_access')
    .select('*, ca_profile:ca_profiles!ca_user_id(*)')
    .eq('client_user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching CA access:', error)
    return []
  }

  return data || []
}

/**
 * Log CA activity
 */
export async function logCAActivity(
  clientUserId: string,
  activityType: string,
  entityType: string | undefined,
  entityId: string | undefined,
  description: string
) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return

  await supabase
    .from('ca_activity_log')
    .insert({
      ca_user_id: user.id,
      client_user_id: clientUserId,
      activity_type: activityType,
      entity_type: entityType,
      entity_id: entityId,
      activity_description: description,
      ip_address: '0.0.0.0',  // Will be replaced by middleware
      performed_at: new Date().toISOString()
    })
}

/**
 * Get CA activity log
 */
export async function getCAActivityLog(clientUserId?: string): Promise<CAActivityLog[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('ca_activity_log')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(100)

  if (clientUserId) {
    query = query.eq('client_user_id', clientUserId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching CA activity:', error)
    return []
  }

  return data || []
}

/**
 * Get CA Dashboard data
 */
export async function getCADashboard(): Promise<CADashboard | null> {
  const caProfile = await getCAProfile()
  if (!caProfile) return null

  const clients = await getCAClients()
  const recentActivity = await getCAActivityLog()

  // Count alerts across all clients
  const supabase = await createClient()
  const { data: alerts } = await supabase
    .from('gst_mismatch_alerts')
    .select('severity, user_id')
    .in('user_id', clients.map(c => c.client_user_id))
    .eq('status', 'open')

  const totalAlerts = alerts?.length || 0
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0

  return {
    ca_profile: caProfile,
    total_clients: clients.length,
    active_clients: clients.filter(c => c.access_status === 'active').length,
    clients_summary: clients,
    total_alerts: totalAlerts,
    critical_alerts: criticalAlerts,
    pending_returns: clients.reduce((sum, c) => sum + c.pending_gstr1 + c.pending_gstr3b, 0),
    recent_activity: recentActivity.slice(0, 10)
  }
}

// =====================================================
// 8. AUDIT TRAIL ACTIONS
// =====================================================

/**
 * Create audit log entry
 */
export async function createAuditLog(logData: CreateAuditLogData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return

  await supabase
    .from('gst_audit_trail')
    .insert({
      user_id: user.id,
      performed_by: user.id,
      performed_by_type: 'owner',
      ...logData,
      performed_at: new Date().toISOString()
    })
}

/**
 * Get audit trail
 */
export async function getAuditTrail(filter?: AuditTrailFilter): Promise<GSTAuditTrail[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  let query = supabase
    .from('gst_audit_trail')
    .select('*')
    .eq('user_id', user.id)
    .order('performed_at', { ascending: false })
    .limit(100)

  if (filter?.action_type) query = query.eq('action_type', filter.action_type)
  if (filter?.entity_type) query = query.eq('entity_type', filter.entity_type)
  if (filter?.performed_by) query = query.eq('performed_by', filter.performed_by)
  if (filter?.is_critical !== undefined) query = query.eq('is_critical_action', filter.is_critical)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching audit trail:', error)
    return []
  }

  return data || []
}

/**
 * Export audit trail for compliance
 */
export async function exportAuditTrail(fromDate: string, toDate: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('gst_audit_trail')
    .select('*')
    .eq('user_id', user.id)
    .gte('performed_at', fromDate)
    .lte('performed_at', toDate)
    .order('performed_at', { ascending: false })

  if (error) {
    return { success: false, error: 'Failed to export audit trail' }
  }

  return { success: true, data }
}

// =====================================================
// 9. GST HEALTH SCORE ACTIONS
// =====================================================

/**
 * Calculate GST health score
 */
export async function calculateHealthScore(periodFrom: string, periodTo: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Call database function
    const { data, error } = await supabase.rpc('calculate_gst_health_score', {
      p_user_id: user.id,
      p_period_from: periodFrom,
      p_period_to: periodTo
    })

    if (error) throw error

    revalidatePath('/gst/health')
    return { success: true, score: data }
  } catch (error) {
    console.error('Error calculating health score:', error)
    return { success: false, error: 'Failed to calculate health score' }
  }
}

/**
 * Get current health score
 */
export async function getHealthScore(): Promise<GSTHealthScore | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data, error } = await supabase
    .from('gst_health_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

/**
 * Get health score history
 */
export async function getHealthScoreHistory(): Promise<GSTHealthScoreHistory[]> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return []

  const { data, error } = await supabase
    .from('gst_health_score_history')
    .select('*')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(12)  // Last 12 calculations

  if (error) {
    console.error('Error fetching health score history:', error)
    return []
  }

  return data || []
}

// =====================================================
// DASHBOARD & ANALYTICS ACTIONS
// =====================================================

/**
 * Get comprehensive GST compliance dashboard
 */
export async function getGSTComplianceDashboard(): Promise<GSTComplianceDashboard | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  try {
    // Get health score
    const healthScore = await getHealthScore()
    if (!healthScore) {
      // Calculate if not exists
      const today = new Date()
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
      await calculateHealthScore(
        threeMonthsAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      )
    }

    // Get GSTR-1 summary
    const { data: gstr1Records } = await supabase
      .from('gstr1_records')
      .select('preparation_status')
      .eq('user_id', user.id)

    const gstr1Pending = gstr1Records?.filter(r => r.preparation_status === 'draft').length || 0
    const gstr1Filed = gstr1Records?.filter(r => r.preparation_status === 'filed').length || 0
    const gstr1Overdue = 0  // TODO: Calculate based on due dates

    // Get GSTR-3B summary
    const { data: gstr3bRecords } = await supabase
      .from('gstr3b_records')
      .select('preparation_status')
      .eq('user_id', user.id)

    const gstr3bPending = gstr3bRecords?.filter(r => r.preparation_status === 'draft').length || 0
    const gstr3bFiled = gstr3bRecords?.filter(r => r.preparation_status === 'filed').length || 0
    const gstr3bOverdue = 0

    // Get E-Invoice summary
    const { data: einvoices } = await supabase
      .from('einvoice_records')
      .select('irp_status')
      .eq('user_id', user.id)

    const einvoicesGenerated = einvoices?.filter(e => e.irp_status === 'generated').length || 0
    const einvoicesFailed = einvoices?.filter(e => e.irp_status === 'failed').length || 0
    const einvoicesPending = einvoices?.filter(e => e.irp_status === 'pending').length || 0

    // Get E-Way Bills
    const { data: ewayBills } = await supabase
      .from('eway_bills')
      .select('status, valid_until')
      .eq('user_id', user.id)

    const ewayBillsActive = ewayBills?.filter(e => e.status === 'active').length || 0
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const ewayBillsExpiringSoon = ewayBills?.filter(e => 
      e.status === 'active' && new Date(e.valid_until) < tomorrow
    ).length || 0

    // Get alerts
    const alerts = await getMismatchAlerts({ status: 'open' })
    const openAlerts = alerts.length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    
    const alertsByType: Record<string, number> = {}
    alerts.forEach(a => {
      alertsByType[a.alert_type] = (alertsByType[a.alert_type] || 0) + 1
    })

    // Get CA access
    const caAccess = await getClientCAAccess()
    const activeCAAccess = caAccess.filter(ca => ca.status === 'active').length

    // Get recent activity
    const recentAuditLogs = await getAuditTrail()
    const recentAlerts = alerts.slice(0, 5)

    // Get health trend
    const healthHistory = await getHealthScoreHistory()
    const healthScoreTrend = healthHistory.map(h => ({
      period: h.calculation_period_to,
      score: h.overall_score,
      grade: h.health_grade
    }))

    return {
      health_score: healthScore!,
      gstr1_pending: gstr1Pending,
      gstr1_filed: gstr1Filed,
      gstr1_overdue: gstr1Overdue,
      gstr3b_pending: gstr3bPending,
      gstr3b_filed: gstr3bFiled,
      gstr3b_overdue: gstr3bOverdue,
      einvoices_generated: einvoicesGenerated,
      einvoices_failed: einvoicesFailed,
      einvoices_pending: einvoicesPending,
      eway_bills_active: ewayBillsActive,
      eway_bills_expiring_soon: ewayBillsExpiringSoon,
      open_alerts: openAlerts,
      critical_alerts: criticalAlerts,
      alerts_by_type: alertsByType as Record<'tax_calculation' | 'gstr1_mismatch' | 'gstr3b_mismatch' | 'itc_mismatch' | 'hsn_mismatch' | 'invoice_missing' | 'duplicate_invoice' | 'amount_mismatch' | 'gstin_invalid', number>,
      active_ca_access: activeCAAccess,
      ca_activity_count: 0,  // TODO: Get count
      recent_audit_logs: recentAuditLogs.slice(0, 10),
      recent_alerts: recentAlerts,
      health_score_trend: healthScoreTrend
    }
  } catch (error) {
    console.error('Error fetching GST dashboard:', error)
    return null
  }
}

/**
 * Get GST compliance summary
 */
export async function getGSTComplianceSummary(financialYear: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('gst_compliance_summary')
    .select('*')
    .eq('user_id', user.id)
    .eq('financial_year', financialYear)
    .single()

  if (error) {
    console.error('Error fetching compliance summary:', error)
    return { success: false, error: 'Failed to fetch summary' }
  }

  return { success: true, data }
}

