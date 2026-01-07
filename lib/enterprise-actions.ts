/**
 * Enterprise Features - Server Actions
 * Server-side actions for inventory, expenses, dashboards, access control, client portal, and WhatsApp
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  InventoryItem,
  InventoryBatch,
  JobInventoryAllocation,
  InventoryAlert,
  ExpenseCategory,
  Expense,
  Asset,
  AssetDepreciationLog,
  BusinessMetrics,
  UserRole,
  Branch,
  ActivityLog,
  ClientPortalUser,
  InvoiceDispute,
  WhatsAppTemplate,
  WhatsAppMessage,
  PaymentNudgeSettings,
  ApiResponse,
  InventoryItemFilters,
  ExpenseFilters,
  AssetFilters,
  AlertFilters,
  ActivityLogFilters,
  DisputeFilters,
  WhatsAppMessageFilters,
  InventoryDashboard,
  ExpenseDashboard,
  ClientPortalDashboard,
  WhatsAppDashboard,
  CreateInventoryItemRequest,
  CreateExpenseRequest,
  CreateAssetRequest,
  CreateClientPortalUserRequest,
  CreateDisputeRequest,
  CreateWhatsAppTemplateRequest,
  SendWhatsAppMessageRequest,
  GSTLiabilityTracker,
  BusinessHealthIndex,
  MISReport,
  AIInsight,
  ProfitabilityReport
} from './enterprise-types'

// =====================================================
// INVENTORY+ ACTIONS
// =====================================================

export async function createInventoryItem(data: CreateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    await logActivity({
      action_type: 'create',
      entity_type: 'inventory_item',
      entity_id: item.id,
      entity_name: item.item_name
    })

    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getInventoryItems(filters?: InventoryItemFilters): Promise<InventoryItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.item_type) {
    query = query.eq('item_type', filters.item_type)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }
  if (filters?.search) {
    query = query.or(`item_name.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%`)
  }

  const { data } = await query
  return data || []
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function createBatch(data: Omit<InventoryBatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<InventoryBatch>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: batch, error } = await supabase
      .from('inventory_batches')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: batch }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getBatches(inventoryItemId: string): Promise<InventoryBatch[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('inventory_batches')
    .select('*')
    .eq('user_id', user.id)
    .eq('inventory_item_id', inventoryItemId)
    .order('expiry_date', { ascending: true })

  return data || []
}

export async function allocateInventoryToJob(data: Omit<JobInventoryAllocation, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'total_cost'>): Promise<ApiResponse<JobInventoryAllocation>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: allocation, error } = await supabase
      .from('job_inventory_allocations')
      .insert([{ ...data, user_id: user.id, allocated_by: user.id }])
      .select()
      .single()

    if (error) throw error

    // Update batch reserved stock if batch_id is provided
    if (data.batch_id) {
      await supabase.rpc('update_batch_reserved_stock', {
        p_batch_id: data.batch_id,
        p_quantity: data.allocated_quantity
      })
    }

    return { success: true, data: allocation }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getJobAllocations(jobCode?: string): Promise<JobInventoryAllocation[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('job_inventory_allocations')
    .select('*')
    .eq('user_id', user.id)
    .order('allocation_date', { ascending: false })

  if (jobCode) {
    query = query.eq('job_code', jobCode)
  }

  const { data } = await query
  return data || []
}

export async function getInventoryAlerts(filters?: AlertFilters): Promise<InventoryAlert[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('inventory_alerts')
    .select('*, inventory_items!inner(item_name, item_code)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.alert_type) {
    query = query.eq('alert_type', filters.alert_type)
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }
  if (filters?.alert_status) {
    query = query.eq('alert_status', filters.alert_status)
  }

  const { data } = await query
  return data || []
}

export async function acknowledgeAlert(alertId: string): Promise<ApiResponse<InventoryAlert>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: alert, error } = await supabase
      .from('inventory_alerts')
      .update({
        alert_status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id
      })
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: alert }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function resolveAlert(alertId: string, resolutionNotes: string): Promise<ApiResponse<InventoryAlert>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: alert, error } = await supabase
      .from('inventory_alerts')
      .update({
        alert_status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes
      })
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: alert }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getInventoryDashboard(): Promise<InventoryDashboard | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [items, alerts, batches] = await Promise.all([
    supabase.from('inventory_items').select('*').eq('user_id', user.id),
    supabase.from('inventory_alerts').select('*').eq('user_id', user.id).eq('alert_status', 'active'),
    supabase.from('inventory_batches').select('*').eq('user_id', user.id).eq('batch_status', 'active')
  ])

  const itemsData = items.data || []
  const alertsData = alerts.data || []
  const batchesData = batches.data || []

  const totalStockValue = itemsData.reduce((sum, item) => {
    return sum + (item.current_stock * (item.selling_price || 0))
  }, 0)

  const lowStockItems = itemsData.filter(item => 
    item.reorder_level && item.current_stock <= item.reorder_level
  ).length

  const expiringBatches = batchesData.filter(batch => {
    if (!batch.expiry_date) return false
    const daysToExpiry = Math.floor((new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysToExpiry <= 30 && daysToExpiry > 0
  }).length

  return {
    total_items: itemsData.length,
    total_stock_value: totalStockValue,
    low_stock_items: lowStockItems,
    expiring_soon_batches: expiringBatches,
    active_alerts: alertsData.length,
    service_items: itemsData.filter(i => i.item_type === 'service').length,
    product_items: itemsData.filter(i => i.item_type === 'product').length
  }
}

// =====================================================
// EXPENSE MANAGEMENT ACTIONS
// =====================================================

export async function createExpenseCategory(data: Omit<ExpenseCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ExpenseCategory>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: category, error } = await supabase
      .from('expense_categories')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('category_name', { ascending: true })

  return data || []
}

export async function createExpense(data: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([{ ...data, user_id: user.id, submitted_by: user.id }])
      .select()
      .single()

    if (error) throw error

    await logActivity({
      action_type: 'create',
      entity_type: 'expense',
      entity_id: expense.id,
      entity_name: expense.expense_number
    })

    return { success: true, data: expense }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('expenses')
    .select('*, expense_categories!inner(category_name)')
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false })

  if (filters?.expense_type) {
    query = query.eq('expense_type', filters.expense_type)
  }
  if (filters?.expense_category_id) {
    query = query.eq('expense_category_id', filters.expense_category_id)
  }
  if (filters?.approval_status) {
    query = query.eq('approval_status', filters.approval_status)
  }
  if (filters?.from_date) {
    query = query.gte('expense_date', filters.from_date)
  }
  if (filters?.to_date) {
    query = query.lte('expense_date', filters.to_date)
  }
  if (filters?.is_reimbursable !== undefined) {
    query = query.eq('is_reimbursable', filters.is_reimbursable)
  }
  if (filters?.search) {
    query = query.or(`expense_number.ilike.%${filters.search}%,payee_name.ilike.%${filters.search}%`)
  }

  const { data } = await query
  return data || []
}

export async function approveExpense(expenseId: string): Promise<ApiResponse<Expense>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    await logActivity({
      action_type: 'approve',
      entity_type: 'expense',
      entity_id: expense.id,
      action_description: `Expense ${expense.expense_number} approved`
    })

    return { success: true, data: expense }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function rejectExpense(expenseId: string, reason: string): Promise<ApiResponse<Expense>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        approval_status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', expenseId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: expense }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function createAsset(data: CreateAssetRequest): Promise<ApiResponse<Asset>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Calculate annual depreciation
    const depreciableValue = data.purchase_value - (data.salvage_value || 0)
    const annualDepreciation = depreciableValue / data.useful_life_years

    const { data: asset, error } = await supabase
      .from('assets')
      .insert([{ 
        ...data, 
        user_id: user.id,
        annual_depreciation: annualDepreciation,
        current_book_value: data.purchase_value
      }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: asset }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getAssets(filters?: AssetFilters): Promise<Asset[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)
    .order('purchase_date', { ascending: false })

  if (filters?.asset_status) {
    query = query.eq('asset_status', filters.asset_status)
  }
  if (filters?.asset_category) {
    query = query.eq('asset_category', filters.asset_category)
  }
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }
  if (filters?.search) {
    query = query.or(`asset_name.ilike.%${filters.search}%,asset_code.ilike.%${filters.search}%`)
  }

  const { data } = await query
  return data || []
}

export async function calculateAssetDepreciation(assetId: string, period: string): Promise<ApiResponse<AssetDepreciationLog>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get asset
    const { data: asset } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single()

    if (!asset) {
      return { success: false, error: 'Asset not found' }
    }

    // Calculate monthly depreciation
    const monthlyDepreciation = (asset.annual_depreciation || 0) / 12
    const openingBookValue = asset.current_book_value || asset.purchase_value
    const closingBookValue = Math.max(openingBookValue - monthlyDepreciation, asset.salvage_value)
    const depreciationAmount = openingBookValue - closingBookValue
    const accumulatedDepreciation = (asset.accumulated_depreciation || 0) + depreciationAmount

    // Create depreciation log
    const { data: log, error } = await supabase
      .from('asset_depreciation_log')
      .insert([{
        asset_id: assetId,
        user_id: user.id,
        depreciation_period: period,
        financial_year: period.split('-')[0],
        opening_book_value: openingBookValue,
        depreciation_amount: depreciationAmount,
        accumulated_depreciation: accumulatedDepreciation,
        closing_book_value: closingBookValue,
        calculation_method: asset.depreciation_method,
        is_posted: false
      }])
      .select()
      .single()

    if (error) throw error

    // Update asset
    await supabase
      .from('assets')
      .update({
        current_book_value: closingBookValue,
        accumulated_depreciation: accumulatedDepreciation
      })
      .eq('id', assetId)

    return { success: true, data: log }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getExpenseDashboard(): Promise<ExpenseDashboard | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, expense_categories!inner(category_name)')
    .eq('user_id', user.id)

  const expensesData = expenses || []

  const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.total_amount, 0)
  const pendingApprovals = expensesData.filter(e => e.approval_status === 'pending').length
  const pendingReimbursements = expensesData.filter(e => e.is_reimbursable && e.reimbursement_status === 'pending').length

  // Category-wise expenses
  const categoryMap = new Map<string, number>()
  expensesData.forEach(exp => {
    const category = exp.expense_categories?.category_name || 'Uncategorized'
    categoryMap.set(category, (categoryMap.get(category) || 0) + exp.total_amount)
  })

  const categoryWiseExpenses = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalExpenses) * 100
  }))

  return {
    total_expenses: totalExpenses,
    pending_approvals: pendingApprovals,
    pending_reimbursements: pendingReimbursements,
    monthly_expense_trend: [],
    category_wise_expenses: categoryWiseExpenses
  }
}

// =====================================================
// DASHBOARD & METRICS ACTIONS
// =====================================================

export async function getBusinessMetrics(date?: string): Promise<BusinessMetrics | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const metricDate = date || new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('user_id', user.id)
    .eq('metric_date', metricDate)
    .eq('metric_period', 'daily')
    .single()

  return data
}

export async function generateBusinessMetrics(date: string): Promise<ApiResponse<BusinessMetrics>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Call database function
    const { error } = await supabase.rpc('generate_daily_business_metrics', {
      p_user_id: user.id,
      p_date: date
    })

    if (error) throw error

    // Fetch generated metrics
    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('metric_date', date)
      .single()

    return { success: true, data: metrics }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCashFlowRealtime() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('cash_flow_realtime')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function getCollectionEfficiency() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('collection_efficiency_view')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function getGSTLiabilityTracker() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Calculate GST liability from invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('cgst_amount, sgst_amount, igst_amount, invoice_date, status')
    .eq('user_id', user.id)
    .gte('invoice_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
    .eq('status', 'paid')

  if (!invoices) return null

  const totalCGST = invoices.reduce((sum, inv) => sum + (inv.cgst_amount || 0), 0)
  const totalSGST = invoices.reduce((sum, inv) => sum + (inv.sgst_amount || 0), 0)
  const totalIGST = invoices.reduce((sum, inv) => sum + (inv.igst_amount || 0), 0)
  const totalGSTCollected = totalCGST + totalSGST + totalIGST

  // Get expenses with input GST (if available from expenses table)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('gst_amount')
    .eq('user_id', user.id)
    .gte('expense_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())

  const totalGSTPaid = expenses?.reduce((sum, exp) => sum + (exp.gst_amount || 0), 0) || 0
  const itcAvailable = totalGSTPaid * 0.9 // Assuming 90% ITC available
  const netGSTPayable = totalGSTCollected - itcAvailable

  return {
    user_id: user.id,
    period: new Date().toISOString().slice(0, 7),
    total_gst_collected: totalGSTCollected,
    total_gst_paid: totalGSTPaid,
    net_gst_payable: Math.max(netGSTPayable, 0),
    itc_available: itcAvailable,
    gst_liability: Math.max(netGSTPayable, 0),
    output_gst_breakdown: {
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST
    },
    input_gst_breakdown: {
      cgst: totalGSTPaid * 0.45,
      sgst: totalGSTPaid * 0.45,
      igst: totalGSTPaid * 0.10
    },
    filing_status: 'pending' as const,
    due_date: new Date(new Date().setDate(20)).toISOString()
  }
}

export async function getBusinessHealthIndex() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get invoices for calculations
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, invoice_date, status, paid_date')
    .eq('user_id', user.id)
    .gte('invoice_date', new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString())

  if (!invoices || invoices.length === 0) return null

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  
  // Calculate collection days
  const collectionDays = paidInvoices.reduce((sum, inv) => {
    if (inv.paid_date && inv.invoice_date) {
      const days = (new Date(inv.paid_date).getTime() - new Date(inv.invoice_date).getTime()) / (1000 * 60 * 60 * 24)
      return sum + days
    }
    return sum
  }, 0) / (paidInvoices.length || 1)

  // Get expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('expense_date', new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString())

  const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
  const grossProfit = totalRevenue - totalExpenses
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  const netProfitMargin = grossProfitMargin * 0.8 // Simplified

  // Calculate scores (0-100)
  const liquidityScore = Math.min(100, (totalPaid / totalRevenue) * 100)
  const profitabilityScore = Math.min(100, Math.max(0, grossProfitMargin * 2))
  const efficiencyScore = Math.min(100, Math.max(0, 100 - collectionDays))
  const growthScore = 75 // Placeholder - would need historical data
  const complianceScore = 85 // Placeholder - would check GST filing status

  const overallScore = (liquidityScore + profitabilityScore + efficiencyScore + growthScore + complianceScore) / 5

  const getCategory = (score: number) => {
    if (score >= 80) return 'excellent' as const
    if (score >= 60) return 'good' as const
    if (score >= 40) return 'fair' as const
    if (score >= 20) return 'needs_attention' as const
    return 'critical' as const
  }

  const recommendations: Array<{ category: string; priority: 'high' | 'medium' | 'low'; message: string; action: string }> = []
  const riskFactors: string[] = []

  if (collectionDays > 30) {
    recommendations.push({
      category: 'collections',
      priority: 'high',
      message: 'Average collection period is too high',
      action: 'Enable automated payment reminders'
    })
    riskFactors.push('Slow collections affecting cash flow')
  }

  if (grossProfitMargin < 20) {
    recommendations.push({
      category: 'profitability',
      priority: 'high',
      message: 'Gross profit margin is below healthy levels',
      action: 'Review pricing strategy and reduce expenses'
    })
    riskFactors.push('Low profitability margins')
  }

  return {
    user_id: user.id,
    calculated_at: new Date().toISOString(),
    overall_score: Math.round(overallScore),
    category: getCategory(overallScore),
    scores: {
      liquidity_score: Math.round(liquidityScore),
      profitability_score: Math.round(profitabilityScore),
      efficiency_score: Math.round(efficiencyScore),
      growth_score: growthScore,
      compliance_score: complianceScore
    },
    indicators: {
      current_ratio: totalPaid / (totalRevenue - totalPaid || 1),
      quick_ratio: totalPaid / (totalRevenue - totalPaid || 1),
      gross_profit_margin: grossProfitMargin,
      net_profit_margin: netProfitMargin,
      collection_days: Math.round(collectionDays),
      inventory_turnover: 12, // Placeholder
      revenue_growth: 15, // Placeholder
      gst_compliance_rate: 95 // Placeholder
    },
    recommendations,
    risk_factors: riskFactors
  }
}

export async function generateMISReport(config: { report_type: string; period_start: string; period_end: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    let reportData: any = {}

    switch (config.report_type) {
      case 'profit_loss':
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total_amount, gst_amount, subtotal')
          .eq('user_id', user.id)
          .gte('invoice_date', config.period_start)
          .lte('invoice_date', config.period_end)

        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, category')
          .eq('user_id', user.id)
          .gte('expense_date', config.period_start)
          .lte('expense_date', config.period_end)

        const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
        const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
        const grossProfit = totalRevenue - totalExpenses

        reportData = {
          revenue: totalRevenue,
          expenses: totalExpenses,
          gross_profit: grossProfit,
          gross_margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
          expense_breakdown: expenses?.reduce((acc: any, exp) => {
            acc[exp.category || 'Other'] = (acc[exp.category || 'Other'] || 0) + exp.amount
            return acc
          }, {})
        }
        break

      case 'cash_flow':
        const cashFlow = await getCashFlowRealtime()
        reportData = cashFlow || {}
        break

      case 'gst_summary':
        const gstData = await getGSTLiabilityTracker()
        reportData = gstData || {}
        break

      default:
        reportData = { message: 'Report type not implemented' }
    }

    return {
      success: true,
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        report_name: `${config.report_type.replace('_', ' ')} Report`,
        report_type: config.report_type,
        period_start: config.period_start,
        period_end: config.period_end,
        generated_at: new Date().toISOString(),
        data: reportData,
        format: 'json' as const
      }
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function buildCustomReport(config: {
  report_name: string
  data_sources: string[]
  filters?: Array<{ field: string; operator: string; value: any }>
  date_range?: { start: string; end: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    const results: any[] = []

    for (const source of config.data_sources) {
      let query = supabase.from(source).select('*').eq('user_id', user.id)

      // Apply date range filter
      if (config.date_range) {
        const dateField = source === 'invoices' ? 'invoice_date' : 
                         source === 'expenses' ? 'expense_date' : 'created_at'
        query = query.gte(dateField, config.date_range.start).lte(dateField, config.date_range.end)
      }

      const { data } = await query
      if (data) results.push(...data)
    }

    // Apply filters
    let filteredData = results
    if (config.filters) {
      filteredData = results.filter(row => {
        return config.filters!.every(filter => {
          const value = row[filter.field]
          switch (filter.operator) {
            case 'equals': return value === filter.value
            case 'greater_than': return value > filter.value
            case 'less_than': return value < filter.value
            case 'contains': return String(value).includes(String(filter.value))
            default: return true
          }
        })
      })
    }

    return {
      success: true,
      data: {
        report_name: config.report_name,
        generated_at: new Date().toISOString(),
        total_rows: filteredData.length,
        data: filteredData,
        summary: {
          total_records: filteredData.length
        }
      }
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getAIInsights() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const insights: any[] = []

  // Get recent business metrics
  const healthIndex = await getBusinessHealthIndex()
  const cashFlow = await getCashFlowRealtime()
  const collectionEfficiency = await getCollectionEfficiency()

  // Generate insights based on data
  if (healthIndex) {
    if (healthIndex.overall_score < 40) {
      insights.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        insight_date: new Date().toISOString(),
        category: 'general' as const,
        priority: 'critical' as const,
        title: 'Business Health Needs Attention',
        description: `Your overall business health score is ${healthIndex.overall_score}/100, which is below healthy levels.`,
        impact: 'May affect business sustainability and growth',
        recommendation: 'Focus on improving profitability and collection efficiency',
        data_points: { score: healthIndex.overall_score },
        created_at: new Date().toISOString()
      })
    }

    if (healthIndex.indicators.collection_days > 45) {
      insights.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        insight_date: new Date().toISOString(),
        category: 'collections' as const,
        priority: 'high' as const,
        title: 'Slow Payment Collections',
        description: `Average collection period is ${healthIndex.indicators.collection_days} days, which is affecting cash flow.`,
        impact: `₹${((healthIndex.indicators.collection_days - 30) * 1000).toLocaleString('en-IN')} tied up in receivables`,
        recommendation: 'Enable automated payment reminders and offer early payment discounts',
        data_points: { collection_days: healthIndex.indicators.collection_days },
        created_at: new Date().toISOString()
      })
    }
  }

  if (cashFlow && cashFlow.closing_cash_balance < 50000) {
    insights.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      insight_date: new Date().toISOString(),
      category: 'cash_flow' as const,
      priority: 'critical' as const,
      title: 'Low Cash Balance',
      description: `Current cash balance is ₹${cashFlow.closing_cash_balance.toLocaleString('en-IN')}, which is below recommended levels.`,
      impact: 'Risk of cash crunch in next 15 days',
      recommendation: 'Follow up on pending receivables and delay non-critical expenses',
      data_points: { cash_balance: cashFlow.closing_cash_balance },
      created_at: new Date().toISOString()
    })
  }

  return insights
}

export async function getProfitabilityReport(breakdown_by: 'city' | 'state' | 'gst_type' = 'city') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get invoices with customer details
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      total_amount,
      subtotal,
      supply_type,
      invoice_date,
      customer:customers (
        name,
        city,
        state_code,
        gstin
      )
    `)
    .eq('user_id', user.id)
    .gte('invoice_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())

  if (!invoices) return null

  // Group by dimension
  const groupedData = new Map<string, any>()

  invoices.forEach((inv: any) => {
    let dimension = ''
    
    switch (breakdown_by) {
      case 'city':
        dimension = inv.customer?.city || 'Unknown'
        break
      case 'state':
        dimension = inv.customer?.state_code || 'Unknown'
        break
      case 'gst_type':
        dimension = inv.supply_type || 'Unknown'
        break
    }

    if (!groupedData.has(dimension)) {
      groupedData.set(dimension, {
        dimension,
        revenue: 0,
        expenses: 0,
        gross_profit: 0,
        gross_margin: 0,
        invoice_count: 0,
        customer_count: new Set(),
        average_invoice_value: 0
      })
    }

    const group = groupedData.get(dimension)
    group.revenue += inv.total_amount || 0
    group.expenses += (inv.total_amount - inv.subtotal) || 0 // GST as expense for simplification
    group.invoice_count++
    if (inv.customer?.name) group.customer_count.add(inv.customer.name)
  })

  // Calculate derived metrics
  const data = Array.from(groupedData.values()).map(item => {
    item.gross_profit = item.revenue - item.expenses
    item.gross_margin = item.revenue > 0 ? (item.gross_profit / item.revenue) * 100 : 0
    item.average_invoice_value = item.revenue / item.invoice_count
    item.customer_count = item.customer_count.size
    return item
  })

  const total_revenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const total_profit = data.reduce((sum, item) => sum + item.gross_profit, 0)
  const overall_margin = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0

  return {
    user_id: user.id,
    report_period: new Date().toISOString().slice(0, 7),
    breakdown_by,
    data: data.sort((a, b) => b.revenue - a.revenue),
    total_revenue,
    total_profit,
    overall_margin
  }
}

// =====================================================
// ACCESS CONTROL ACTIONS
// =====================================================

export async function createUserRole(data: Omit<UserRole, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserRole>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: role, error } = await supabase
      .from('user_roles')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: role }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getUserRoles(): Promise<UserRole[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  return data || []
}

export async function createBranch(data: Omit<Branch, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Branch>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: branch, error } = await supabase
      .from('branches')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: branch }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getBranches(): Promise<Branch[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('branches')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  return data || []
}

export async function logActivity(activity: {
  action_type: string
  entity_type: string
  entity_id?: string
  entity_name?: string
  action_description?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
}): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      performed_by: user.id,
      performed_by_email: user.email,
      ...activity,
      action_status: 'success'
    }])
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

export async function getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filters?.action_type) {
    query = query.eq('action_type', filters.action_type)
  }
  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type)
  }
  if (filters?.performed_by) {
    query = query.eq('performed_by', filters.performed_by)
  }
  if (filters?.from_date) {
    query = query.gte('created_at', filters.from_date)
  }
  if (filters?.to_date) {
    query = query.lte('created_at', filters.to_date)
  }

  const { data } = await query
  return data || []
}

// =====================================================
// CLIENT PORTAL ACTIONS
// =====================================================

export async function createClientPortalUser(data: CreateClientPortalUserRequest): Promise<ApiResponse<ClientPortalUser>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: portalUser, error } = await supabase
      .from('client_portal_users')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: portalUser }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getClientPortalUsers(): Promise<ClientPortalUser[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('client_portal_users')
    .select('*, customers!inner(name, email)')
    .eq('user_id', user.id)

  return data || []
}

export async function createInvoiceDispute(data: CreateDisputeRequest): Promise<ApiResponse<InvoiceDispute>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: dispute, error } = await supabase
      .from('invoice_disputes')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    await logActivity({
      action_type: 'create',
      entity_type: 'invoice_dispute',
      entity_id: dispute.id,
      action_description: `Dispute raised for invoice`
    })

    return { success: true, data: dispute }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getInvoiceDisputes(filters?: DisputeFilters): Promise<InvoiceDispute[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('invoice_disputes')
    .select('*, invoices!inner(invoice_number)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.dispute_status) {
    query = query.eq('dispute_status', filters.dispute_status)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters?.dispute_type) {
    query = query.eq('dispute_type', filters.dispute_type)
  }
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }

  const { data } = await query
  return data || []
}

export async function resolveDispute(disputeId: string, resolutionNotes: string, resolutionType: string): Promise<ApiResponse<InvoiceDispute>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: dispute, error } = await supabase
      .from('invoice_disputes')
      .update({
        dispute_status: 'resolved',
        resolution_notes: resolutionNotes,
        resolution_type: resolutionType,
        resolved_at: new Date().toISOString()
      })
      .eq('id', disputeId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data: dispute }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getClientPortalDashboard(): Promise<ClientPortalDashboard | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [clients, approvals, disputes, chats] = await Promise.all([
    supabase.from('client_portal_users').select('*').eq('user_id', user.id),
    supabase.from('client_invoice_approvals').select('*').eq('user_id', user.id).eq('approval_status', 'pending'),
    supabase.from('invoice_disputes').select('*').eq('user_id', user.id).eq('dispute_status', 'open'),
    supabase.from('client_support_chats').select('*').eq('user_id', user.id).eq('chat_status', 'open')
  ])

  const clientsData = clients.data || []

  return {
    total_clients: clientsData.length,
    active_clients: clientsData.filter(c => c.portal_access_enabled).length,
    pending_approvals: approvals.data?.length || 0,
    open_disputes: disputes.data?.length || 0,
    open_support_tickets: chats.data?.length || 0,
    client_satisfaction_avg: 4.5 // Placeholder
  }
}

// =====================================================
// WHATSAPP AUTOMATION ACTIONS
// =====================================================

export async function createWhatsAppTemplate(data: CreateWhatsAppTemplateRequest): Promise<ApiResponse<WhatsAppTemplate>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: template, error } = await supabase
      .from('whatsapp_templates')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data: template }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  return data || []
}

export async function sendWhatsAppMessage(request: SendWhatsAppMessageRequest): Promise<ApiResponse<WhatsAppMessage>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: message, error } = await supabase
      .from('whatsapp_messages')
      .insert([{ 
        ...request, 
        user_id: user.id,
        message_status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    // TODO: Integrate with WhatsApp Business API
    // For now, just mark as sent
    await supabase
      .from('whatsapp_messages')
      .update({
        message_status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', message.id)

    return { success: true, data: message }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getWhatsAppMessages(filters?: WhatsAppMessageFilters): Promise<WhatsAppMessage[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.message_status) {
    query = query.eq('message_status', filters.message_status)
  }
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }
  if (filters?.from_date) {
    query = query.gte('created_at', filters.from_date)
  }
  if (filters?.to_date) {
    query = query.lte('created_at', filters.to_date)
  }

  const { data } = await query
  return data || []
}

export async function getPaymentNudgeSettings(): Promise<PaymentNudgeSettings | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('payment_nudge_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function updatePaymentNudgeSettings(settings: Partial<PaymentNudgeSettings>): Promise<ApiResponse<PaymentNudgeSettings>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('payment_nudge_settings')
      .upsert([{ ...settings, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getWhatsAppDashboard(): Promise<WhatsAppDashboard | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('user_id', user.id)

  const messagesData = messages || []

  const totalSent = messagesData.length
  const delivered = messagesData.filter(m => m.message_status === 'delivered' || m.message_status === 'read').length
  const read = messagesData.filter(m => m.message_status === 'read').length
  const failed = messagesData.filter(m => m.message_status === 'failed').length

  return {
    total_messages_sent: totalSent,
    delivery_rate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
    read_rate: totalSent > 0 ? (read / totalSent) * 100 : 0,
    failed_messages: failed,
    cost_this_month: messagesData.reduce((sum, m) => sum + (m.message_cost || 0), 0),
    template_performance: []
  }
}
