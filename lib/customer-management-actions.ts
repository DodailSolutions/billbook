'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  CreditLimitHistory,
  CreditLimitUpdate,
  CustomerAgingAnalysis,
  Vendor,
  VendorBill,
  VendorBillWithDetails,
  CreateVendorData,
  CreateVendorBillData,
  RecordVendorPaymentData,
  CustomerGSTSummary,
  CustomerDocument,
  DocumentUpload,
  CustomerFinancialOverview,
  VendorPayablesSummary,
  CustomerCreditRiskPrediction,
  CreditRiskPredictionHistory,
  CustomerBlacklist,
  BlacklistRule,
  CreateBlacklistRuleData,
  BlacklistCustomerData,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppMessageTemplate,
  SendWhatsAppMessageData,
  WhatsAppConversationSummary,
  HighRiskCustomer
} from './customer-management-types'

// =====================================================
// 1. CUSTOMER CREDIT LIMITS
// =====================================================

export async function updateCustomerCreditLimit(data: CreditLimitUpdate) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get current limit
    const { data: customer } = await supabase
      .from('customers')
      .select('credit_limit, name')
      .eq('id', data.customer_id)
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    // Log the change
    await supabase.from('customer_credit_limit_history').insert({
      customer_id: data.customer_id,
      user_id: user.id,
      previous_limit: customer.credit_limit,
      new_limit: data.new_limit,
      reason: data.reason,
      changed_by: user.id
    })

    // Update customer
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        credit_limit: data.new_limit,
        credit_limit_enabled: data.new_limit > 0,
        credit_limit_updated_at: new Date().toISOString(),
        credit_limit_updated_by: user.id
      })
      .eq('id', data.customer_id)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error('Error updating credit limit:', error)
    return { success: false, error: 'Failed to update credit limit' }
  }
}

export async function getCreditLimitHistory(customerId: string): Promise<CreditLimitHistory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_credit_limit_history')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getCustomersExceedingCreditLimit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customers')
    .select('id, name, email, credit_limit, credit_used, credit_utilization_percentage')
    .eq('user_id', user.id)
    .eq('credit_limit_exceeded', true)
    .order('credit_utilization_percentage', { ascending: false })

  return data || []
}

// =====================================================
// 2. CUSTOMER AGING & RISK SCORE
// =====================================================

export async function calculateCustomerAging(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Call the database function
    const { error } = await supabase.rpc('calculate_customer_aging_risk', {
      p_customer_id: customerId,
      p_user_id: user.id
    })

    if (error) throw error

    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error('Error calculating aging:', error)
    return { success: false, error: 'Failed to calculate aging' }
  }
}

export async function getCustomerAgingAnalysis(customerId: string): Promise<CustomerAgingAnalysis | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('customer_aging_analysis')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .single()

  return data
}

export async function getAllCustomerAging(): Promise<CustomerAgingAnalysis[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_aging_analysis')
    .select('*')
    .eq('user_id', user.id)
    .order('risk_score', { ascending: false })

  return data || []
}

export async function getCustomersByRiskCategory(category: 'low' | 'medium' | 'high' | 'critical') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_aging_analysis')
    .select(`
      *,
      customers:customer_id (
        id,
        name,
        email,
        phone
      )
    `)
    .eq('user_id', user.id)
    .eq('risk_category', category)
    .order('risk_score', { ascending: false })

  return data || []
}

export async function recalculateAllCustomerAging() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get all customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)

    if (!customers) return { success: true, count: 0 }

    // Calculate aging for each customer
    for (const customer of customers) {
      await supabase.rpc('calculate_customer_aging_risk', {
        p_customer_id: customer.id,
        p_user_id: user.id
      })
    }

    revalidatePath('/customers')
    return { success: true, count: customers.length }
  } catch (error) {
    console.error('Error recalculating aging:', error)
    return { success: false, error: 'Failed to recalculate aging' }
  }
}

// =====================================================
// 3. VENDOR BILLS & PAYABLE TRACKING
// =====================================================

// Vendor Management
export async function createVendor(data: CreateVendorData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/vendors')
    return { success: true, data: vendor }
  } catch (error) {
    console.error('Error creating vendor:', error)
    return { success: false, error: 'Failed to create vendor' }
  }
}

export async function updateVendor(vendorId: string, data: Partial<CreateVendorData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('vendors')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/vendors')
    return { success: true }
  } catch (error) {
    console.error('Error updating vendor:', error)
    return { success: false, error: 'Failed to update vendor' }
  }
}

export async function getVendors(): Promise<Vendor[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .order('vendor_name')

  return data || []
}

export async function getVendor(vendorId: string): Promise<Vendor | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .eq('user_id', user.id)
    .single()

  return data
}

// Vendor Bill Management
export async function createVendorBill(data: CreateVendorBillData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    )

    const cgst = data.cgst_amount || 0
    const sgst = data.sgst_amount || 0
    const igst = data.igst_amount || 0
    const tds = data.tds_amount || 0
    const otherCharges = data.other_charges || 0

    const total = subtotal + cgst + sgst + igst + otherCharges - tds

    // Create bill
    const { data: bill, error: billError } = await supabase
      .from('vendor_bills')
      .insert({
        user_id: user.id,
        vendor_id: data.vendor_id,
        bill_number: data.bill_number,
        bill_date: data.bill_date,
        due_date: data.due_date,
        subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        tds_amount: tds,
        other_charges: otherCharges,
        total_amount: total,
        supply_type: data.supply_type,
        reverse_charge_applicable: data.reverse_charge_applicable || false,
        purchase_order_number: data.purchase_order_number,
        grn_number: data.grn_number,
        description: data.description,
        notes: data.notes
      })
      .select()
      .single()

    if (billError) throw billError

    // Create bill items
    const items = data.items.map(item => {
      const itemAmount = item.quantity * item.unit_price
      const itemGst = itemAmount * (item.gst_rate || 0) / 100
      
      return {
        bill_id: bill.id,
        description: item.description,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        unit: item.unit || 'unit',
        unit_price: item.unit_price,
        amount: itemAmount,
        gst_rate: item.gst_rate || 0,
        gst_amount: itemGst
      }
    })

    const { error: itemsError } = await supabase
      .from('vendor_bill_items')
      .insert(items)

    if (itemsError) throw itemsError

    revalidatePath('/vendors')
    return { success: true, data: bill }
  } catch (error) {
    console.error('Error creating vendor bill:', error)
    return { success: false, error: 'Failed to create vendor bill' }
  }
}

export async function getVendorBills(vendorId?: string): Promise<VendorBill[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('vendor_bills')
    .select('*')
    .eq('user_id', user.id)

  if (vendorId) {
    query = query.eq('vendor_id', vendorId)
  }

  const { data } = await query.order('bill_date', { ascending: false })

  return data || []
}

export async function getVendorBillWithDetails(billId: string): Promise<VendorBillWithDetails | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: bill } = await supabase
    .from('vendor_bills')
    .select(`
      *,
      vendor:vendors(*),
      items:vendor_bill_items(*),
      payments:vendor_payments(*)
    `)
    .eq('id', billId)
    .eq('user_id', user.id)
    .single()

  return bill as unknown as VendorBillWithDetails
}

export async function recordVendorPayment(data: RecordVendorPaymentData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data: payment, error } = await supabase
      .from('vendor_payments')
      .insert({
        user_id: user.id,
        vendor_id: data.vendor_id,
        bill_id: data.bill_id,
        payment_date: data.payment_date,
        amount: data.amount,
        payment_method: data.payment_method,
        transaction_reference: data.transaction_reference,
        cheque_number: data.cheque_number,
        bank_account: data.bank_account,
        tds_deducted: data.tds_deducted || 0,
        tds_percentage: data.tds_percentage || 0,
        notes: data.notes
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/vendors')
    return { success: true, data: payment }
  } catch (error) {
    console.error('Error recording payment:', error)
    return { success: false, error: 'Failed to record payment' }
  }
}

export async function getVendorPayablesSummary(): Promise<VendorPayablesSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('vendor_payables_summary')
    .select('*')
    .eq('user_id', user.id)
    .order('total_outstanding', { ascending: false })

  return data || []
}

export async function getOverdueVendorBills(): Promise<VendorBill[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('vendor_bills')
    .select('*')
    .eq('user_id', user.id)
    .in('payment_status', ['unpaid', 'partially_paid'])
    .lt('due_date', today)
    .order('due_date')

  return data || []
}

// =====================================================
// 4. CUSTOMER-WISE GST SUMMARY
// =====================================================

export async function updateCustomerGSTSummary(
  customerId: string,
  financialYear: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase.rpc('update_customer_gst_summary', {
      p_customer_id: customerId,
      p_user_id: user.id,
      p_financial_year: financialYear
    })

    if (error) throw error

    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error('Error updating GST summary:', error)
    return { success: false, error: 'Failed to update GST summary' }
  }
}

export async function getCustomerGSTSummary(
  customerId: string,
  financialYear?: string
): Promise<CustomerGSTSummary | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Default to current financial year if not provided
  const fy = financialYear || getCurrentFinancialYear()

  const { data } = await supabase
    .from('customer_gst_summary')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .eq('financial_year', fy)
    .single()

  return data
}

export async function getAllCustomerGSTSummaries(
  financialYear?: string
): Promise<CustomerGSTSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const fy = financialYear || getCurrentFinancialYear()

  const { data } = await supabase
    .from('customer_gst_summary')
    .select('*')
    .eq('user_id', user.id)
    .eq('financial_year', fy)
    .order('total_gst', { ascending: false })

  return data || []
}

// =====================================================
// 5. CUSTOMER DOCUMENT VAULT
// =====================================================

export async function uploadCustomerDocument(data: Omit<DocumentUpload, 'file'> & { file_url: string, file_size_bytes?: number, file_type?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data: document, error } = await supabase
      .from('customer_documents')
      .insert({
        customer_id: data.customer_id,
        user_id: user.id,
        document_type: data.document_type,
        document_name: data.document_name,
        file_url: data.file_url,
        file_size_bytes: data.file_size_bytes,
        file_type: data.file_type,
        document_number: data.document_number,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        is_confidential: data.is_confidential || false,
        description: data.description,
        tags: data.tags,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/customers')
    return { success: true, data: document }
  } catch (error) {
    console.error('Error uploading document:', error)
    return { success: false, error: 'Failed to upload document' }
  }
}

export async function getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_documents')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getExpiringDocuments(daysAhead: number = 30): Promise<CustomerDocument[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)

  const { data } = await supabase
    .from('customer_documents')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('expiry_date', 'is', null)
    .lte('expiry_date', futureDate.toISOString())
    .gte('expiry_date', new Date().toISOString())
    .order('expiry_date')

  return data || []
}

export async function verifyDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('customer_documents')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user.id
      })
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error('Error verifying document:', error)
    return { success: false, error: 'Failed to verify document' }
  }
}

export async function logDocumentAccess(
  documentId: string,
  accessType: 'view' | 'download' | 'share' | 'delete',
  ipAddress?: string,
  userAgent?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase.from('customer_document_access_log').insert({
    document_id: documentId,
    accessed_by: user.id,
    access_type: accessType,
    ip_address: ipAddress,
    user_agent: userAgent
  })
}

// =====================================================
// COMPREHENSIVE VIEWS
// =====================================================

export async function getCustomerFinancialOverview(customerId?: string): Promise<CustomerFinancialOverview[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('customer_financial_overview')
    .select('*')
    .eq('user_id', user.id)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data } = await query

  return data || []
}

// =====================================================
// 6. AI CREDIT RISK PREDICTION
// =====================================================

export async function calculateAICreditRisk(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Call the database function to calculate risk
    const { data, error } = await supabase.rpc('calculate_ai_credit_risk', {
      p_customer_id: customerId,
      p_user_id: user.id
    })

    if (error) throw error

    if (data && data.length > 0) {
      const result = data[0]
      
      // Save prediction history
      await supabase.from('credit_risk_prediction_history').insert({
        customer_id: customerId,
        user_id: user.id,
        default_probability: result.default_probability,
        credit_risk_score: result.credit_risk_score,
        predicted_risk_level: result.predicted_risk_level,
        prediction_confidence: result.prediction_confidence,
        model_version: 'v1.0',
        prediction_date: new Date().toISOString()
      })

      // Determine action required
      const actionRequired = result.predicted_risk_level in ['high', 'very_high']
      const actionType = result.predicted_risk_level === 'very_high' ? 'blacklist' : 
                        result.predicted_risk_level === 'high' ? 'reduce_limit' : 'review'

      // Upsert prediction
      const { error: upsertError } = await supabase
        .from('customer_credit_risk_predictions')
        .upsert({
          customer_id: customerId,
          user_id: user.id,
          default_probability: result.default_probability,
          credit_risk_score: result.credit_risk_score,
          predicted_risk_level: result.predicted_risk_level,
          prediction_confidence: result.prediction_confidence,
          model_version: 'v1.0',
          prediction_date: new Date().toISOString(),
          recommended_credit_limit: result.recommended_credit_limit,
          action_required: actionRequired,
          action_type: actionType
        })

      if (upsertError) throw upsertError
    }

    revalidatePath('/customers')
    return { success: true, data }
  } catch (error) {
    console.error('Error calculating credit risk:', error)
    return { success: false, error: 'Failed to calculate credit risk' }
  }
}

export async function getCustomerRiskPrediction(customerId: string): Promise<CustomerCreditRiskPrediction | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('customer_credit_risk_predictions')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .single()

  return data
}

export async function getRiskPredictionHistory(customerId: string): Promise<CreditRiskPredictionHistory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('credit_risk_prediction_history')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .order('prediction_date', { ascending: false })
    .limit(50)

  return data || []
}

export async function getCustomersRequiringAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_credit_risk_predictions')
    .select(`
      *,
      customers:customer_id (
        id,
        name,
        email,
        phone
      )
    `)
    .eq('user_id', user.id)
    .eq('action_required', true)
    .order('credit_risk_score', { ascending: false })

  return data || []
}

export async function bulkCalculateRisk() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get all customers
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)

    if (!customers) return { success: true, count: 0 }

    let successCount = 0
    for (const customer of customers) {
      const result = await calculateAICreditRisk(customer.id)
      if (result.success) successCount++
    }

    return { success: true, count: successCount, total: customers.length }
  } catch (error) {
    console.error('Error bulk calculating risk:', error)
    return { success: false, error: 'Failed to calculate risk for all customers' }
  }
}

// =====================================================
// 7. AUTO BLACKLIST CHRONIC DEFAULTERS
// =====================================================

export async function createBlacklistRule(data: CreateBlacklistRuleData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data: rule, error } = await supabase
      .from('blacklist_rules')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/settings')
    return { success: true, data: rule }
  } catch (error) {
    console.error('Error creating blacklist rule:', error)
    return { success: false, error: 'Failed to create blacklist rule' }
  }
}

export async function getBlacklistRules(): Promise<BlacklistRule[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('blacklist_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function updateBlacklistRule(ruleId: string, updates: Partial<BlacklistRule>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('blacklist_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', ruleId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating blacklist rule:', error)
    return { success: false, error: 'Failed to update blacklist rule' }
  }
}

export async function blacklistCustomer(data: BlacklistCustomerData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get customer aging data
    const { data: aging } = await supabase
      .from('customer_aging_analysis')
      .select('*')
      .eq('customer_id', data.customer_id)
      .eq('user_id', user.id)
      .single()

    const { data: blacklist, error } = await supabase
      .from('customer_blacklist')
      .upsert({
        customer_id: data.customer_id,
        user_id: user.id,
        is_blacklisted: true,
        blacklist_type: data.blacklist_type,
        reason: data.reason,
        reason_code: data.reason_code,
        total_overdue_amount: aging?.total_outstanding || 0,
        overdue_invoice_count: aging?.overdue_count || 0,
        longest_overdue_days: aging?.longest_overdue_days || 0,
        block_new_invoices: data.block_new_invoices ?? true,
        block_credit_sales: data.block_credit_sales ?? true,
        require_advance_payment: data.require_advance_payment ?? false,
        review_date: data.review_date,
        blacklisted_by: user.id,
        blacklisted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await supabase.from('blacklist_action_log').insert({
      customer_id: data.customer_id,
      user_id: user.id,
      action_type: 'blacklisted',
      action_reason: data.reason,
      triggered_by: data.blacklist_type === 'auto' ? 'auto' : 'manual',
      performed_by: user.id
    })

    revalidatePath('/customers')
    return { success: true, data: blacklist }
  } catch (error) {
    console.error('Error blacklisting customer:', error)
    return { success: false, error: 'Failed to blacklist customer' }
  }
}

export async function removeFromBlacklist(customerId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('customer_blacklist')
      .update({
        is_blacklisted: false,
        removed_at: new Date().toISOString(),
        removed_by: user.id,
        removal_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', customerId)
      .eq('user_id', user.id)

    if (error) throw error

    // Log the action
    await supabase.from('blacklist_action_log').insert({
      customer_id: customerId,
      user_id: user.id,
      action_type: 'removed',
      action_reason: reason,
      triggered_by: 'manual',
      performed_by: user.id
    })

    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    console.error('Error removing from blacklist:', error)
    return { success: false, error: 'Failed to remove from blacklist' }
  }
}

export async function checkAutoBlacklist(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase.rpc('check_auto_blacklist', {
      p_customer_id: customerId,
      p_user_id: user.id
    })

    if (error) throw error

    return { success: true, blacklisted: data }
  } catch (error) {
    console.error('Error checking auto blacklist:', error)
    return { success: false, error: 'Failed to check auto blacklist' }
  }
}

export async function getBlacklistedCustomers(): Promise<CustomerBlacklist[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_blacklist')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_blacklisted', true)
    .order('blacklisted_at', { ascending: false })

  return data || []
}

export async function getCustomerBlacklistStatus(customerId: string): Promise<CustomerBlacklist | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('customer_blacklist')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .single()

  return data
}

// =====================================================
// 8. CUSTOMER WHATSAPP CHAT HISTORY
// =====================================================

export async function createWhatsAppConversation(
  customerId: string,
  whatsappNumber: string,
  relatedInvoiceId?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase
      .from('customer_whatsapp_conversations')
      .insert({
        customer_id: customerId,
        user_id: user.id,
        whatsapp_number: whatsappNumber,
        related_invoice_id: relatedInvoiceId,
        conversation_status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating conversation:', error)
    return { success: false, error: 'Failed to create conversation' }
  }
}

export async function sendWhatsAppMessage(data: SendWhatsAppMessageData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get or create conversation
    let conversationId = data.conversation_id
    
    if (!conversationId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('phone')
        .eq('id', data.customer_id)
        .single()

      const { data: conversation } = await supabase
        .from('customer_whatsapp_conversations')
        .select('id')
        .eq('customer_id', data.customer_id)
        .eq('user_id', user.id)
        .single()

      if (conversation) {
        conversationId = conversation.id
      } else {
        const result = await createWhatsAppConversation(
          data.customer_id,
          customer?.phone || '',
          data.related_invoice_id
        )
        if (result.success && result.data) {
          conversationId = result.data.id
        }
      }
    }

    if (!conversationId) {
      throw new Error('Failed to create conversation')
    }

    // Process template if provided
    let messageText = data.message_text || ''
    if (data.template_id && data.template_variables) {
      const { data: template } = await supabase
        .from('whatsapp_message_templates')
        .select('template_text')
        .eq('id', data.template_id)
        .single()

      if (template) {
        messageText = template.template_text
        Object.entries(data.template_variables).forEach(([key, value]) => {
          messageText = messageText.replace(`{{${key}}}`, value)
        })

        // Update template usage
        await supabase.rpc('increment', {
          table_name: 'whatsapp_message_templates',
          row_id: data.template_id,
          column_name: 'usage_count'
        })
      }
    }

    // Save message
    const { data: message, error } = await supabase
      .from('customer_whatsapp_messages')
      .insert({
        conversation_id: conversationId,
        customer_id: data.customer_id,
        user_id: user.id,
        message_type: data.message_type || 'text',
        message_direction: 'outbound',
        message_text: messageText,
        media_url: data.media_url,
        related_invoice_id: data.related_invoice_id,
        message_status: 'sent',
        whatsapp_timestamp: new Date().toISOString(),
        is_automated_response: !!data.template_id,
        response_template_id: data.template_id
      })
      .select()
      .single()

    if (error) throw error

    // Here you would integrate with WhatsApp Business API
    // await sendToWhatsAppAPI(message)

    revalidatePath('/whatsapp')
    return { success: true, data: message }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

export async function getWhatsAppConversations(): Promise<WhatsAppConversation[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_whatsapp_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })

  return data || []
}

export async function getConversationMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('customer_whatsapp_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('whatsapp_timestamp', { ascending: true })

  return data || []
}

export async function markConversationAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('customer_whatsapp_conversations')
      .update({ unread_messages: 0 })
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/whatsapp')
    return { success: true }
  } catch (error) {
    console.error('Error marking as read:', error)
    return { success: false, error: 'Failed to mark as read' }
  }
}

export async function createMessageTemplate(
  name: string,
  category: string,
  text: string,
  variables?: string[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase
      .from('whatsapp_message_templates')
      .insert({
        user_id: user.id,
        template_name: name,
        template_category: category,
        template_text: text,
        template_variables: variables
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/whatsapp')
    return { success: true, data }
  } catch (error) {
    console.error('Error creating template:', error)
    return { success: false, error: 'Failed to create template' }
  }
}

export async function getMessageTemplates(): Promise<WhatsAppMessageTemplate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('whatsapp_message_templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  return data || []
}

export async function getWhatsAppConversationSummary(): Promise<WhatsAppConversationSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('whatsapp_conversation_summary')
    .select('*')
    .eq('user_id', user.id)

  return data || []
}

export async function getHighRiskCustomers(): Promise<HighRiskCustomer[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('high_risk_customers')
    .select('*')
    .eq('user_id', user.id)

  return data || []
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getCurrentFinancialYear(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  // Financial year in India starts from April
  if (month >= 4) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

