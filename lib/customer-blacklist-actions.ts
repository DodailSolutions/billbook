/**
 * Customer Blacklist & Auto-Suspension System
 * Automatically blacklist chronic defaulters and enforce credit restrictions
 */

'use server'

import { createClient } from '@/lib/supabase/server'

export interface BlacklistEntry {
  id: string
  user_id: string
  customer_id: string
  customer_name: string
  
  // Blacklist details
  blacklist_status: 'active' | 'temporary' | 'removed'
  blacklist_type: 'payment_default' | 'fraud' | 'multiple_bounced_checks' | 'legal_dispute' | 'manual'
  blacklist_reason: string
  
  // Metrics at time of blacklisting
  total_outstanding: number
  overdue_invoices_count: number
  average_delay_days: number
  total_bounced_payments: number
  
  // Restrictions
  credit_suspended: boolean
  advance_payment_required: boolean
  cash_only: boolean
  
  // Actions
  blacklisted_by?: string
  blacklisted_at: string
  auto_blacklisted: boolean
  
  // Review
  review_scheduled_at?: string
  reviewed_at?: string
  reviewed_by?: string
  review_notes?: string
  
  // Removal
  removed_at?: string
  removed_by?: string
  removal_reason?: string
  
  created_at: string
  updated_at: string
}

export interface BlacklistRule {
  id: string
  user_id: string
  rule_name: string
  
  // Trigger conditions (all must be met)
  min_overdue_amount?: number
  min_overdue_days?: number
  min_overdue_invoices?: number
  min_bounced_payments?: number
  payment_default_percentage?: number  // % of invoices that are overdue
  
  // Actions when triggered
  action: 'blacklist' | 'suspend_credit' | 'require_advance' | 'notify_only'
  auto_apply: boolean
  require_manual_approval: boolean
  
  // Notifications
  notify_customer: boolean
  notify_team: boolean
  
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlacklistAlert {
  id: string
  user_id: string
  customer_id: string
  customer_name: string
  
  alert_type: 'threshold_reached' | 'payment_failed' | 'check_bounced' | 'legal_notice'
  alert_message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  current_outstanding: number
  days_overdue: number
  
  recommended_action: string
  auto_action_taken?: string
  
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  
  created_at: string
}

/**
 * Check and auto-blacklist customers based on rules
 */
export async function autoCheckBlacklistRules(): Promise<{
  success: boolean
  blacklisted?: number
  alerts?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get active blacklist rules
    const { data: rules, error: rulesError } = await supabase
      .from('blacklist_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('auto_apply', true)
      .order('priority', { ascending: false })

    if (rulesError) throw rulesError

    if (!rules || rules.length === 0) {
      return { success: true, blacklisted: 0, alerts: 0 }
    }

    // Get customer aging analysis
    const { data: customers, error: customersError } = await supabase
      .from('customer_aging_analysis')
      .select(`
        *,
        customer:customers!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('customer.user_id', user.id)
      .gt('total_outstanding', 0)

    if (customersError) throw customersError

    let blacklistedCount = 0
    let alertsCount = 0

    for (const customer of customers || []) {
      // Check if already blacklisted
      const { data: existing } = await supabase
        .from('customer_blacklist')
        .select('*')
        .eq('customer_id', customer.customer_id)
        .eq('blacklist_status', 'active')
        .single()

      if (existing) continue

      // Check each rule
      for (const rule of rules) {
        const triggered = await checkIfRuleTriggered(customer, rule)

        if (triggered) {
          if (rule.action === 'blacklist') {
            await blacklistCustomer(
              customer.customer_id,
              'payment_default',
              `Auto-blacklisted: ${rule.rule_name}`,
              {
                total_outstanding: customer.total_outstanding,
                overdue_invoices_count: customer.overdue_count,
                average_delay_days: customer.average_days_to_pay,
                auto_blacklisted: true,
                credit_suspended: true,
                advance_payment_required: true
              }
            )
            blacklistedCount++
          } else if (rule.action === 'notify_only') {
            await createBlacklistAlert(
              customer.customer_id,
              customer.customer?.name || 'Unknown',
              'threshold_reached',
              `Customer meets blacklist criteria: ${rule.rule_name}`,
              'high',
              customer.total_outstanding,
              customer.longest_overdue_days,
              'Consider blacklisting or suspending credit'
            )
            alertsCount++
          } else if (rule.action === 'suspend_credit') {
            await suspendCustomerCredit(customer.customer_id, rule.rule_name)
            alertsCount++
          }

          break // Only trigger first matching rule
        }
      }
    }

    return { success: true, blacklisted: blacklistedCount, alerts: alertsCount }
  } catch (error) {
    console.error('Error auto-checking blacklist rules:', error)
    return { success: false, error: 'Failed to auto-check blacklist rules' }
  }
}

/**
 * Manually blacklist a customer
 */
export async function blacklistCustomer(
  customerId: string,
  blacklistType: BlacklistEntry['blacklist_type'],
  reason: string,
  options?: {
    total_outstanding?: number
    overdue_invoices_count?: number
    average_delay_days?: number
    total_bounced_payments?: number
    auto_blacklisted?: boolean
    credit_suspended?: boolean
    advance_payment_required?: boolean
    cash_only?: boolean
  }
): Promise<{ success: boolean; blacklistEntry?: BlacklistEntry; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return { success: false, error: 'Customer not found' }
    }

    // Check if already blacklisted
    const { data: existing } = await supabase
      .from('customer_blacklist')
      .select('*')
      .eq('customer_id', customerId)
      .eq('blacklist_status', 'active')
      .single()

    if (existing) {
      return { success: false, error: 'Customer is already blacklisted' }
    }

    // Create blacklist entry
    const blacklistData: Partial<BlacklistEntry> = {
      user_id: user.id,
      customer_id: customerId,
      customer_name: customer.name,
      blacklist_status: 'active',
      blacklist_type: blacklistType,
      blacklist_reason: reason,
      total_outstanding: options?.total_outstanding || 0,
      overdue_invoices_count: options?.overdue_invoices_count || 0,
      average_delay_days: options?.average_delay_days || 0,
      total_bounced_payments: options?.total_bounced_payments || 0,
      credit_suspended: options?.credit_suspended ?? true,
      advance_payment_required: options?.advance_payment_required ?? true,
      cash_only: options?.cash_only ?? false,
      blacklisted_by: options?.auto_blacklisted ? undefined : user.id,
      blacklisted_at: new Date().toISOString(),
      auto_blacklisted: options?.auto_blacklisted ?? false
    }

    const { data, error } = await supabase
      .from('customer_blacklist')
      .insert(blacklistData)
      .select()
      .single()

    if (error) throw error

    // Update customer status
    await supabase
      .from('customers')
      .update({
        blacklisted: true,
        blacklist_reason: reason
      })
      .eq('id', customerId)

    // Suspend credit limit
    if (options?.credit_suspended) {
      await supabase
        .from('customer_credit_limits')
        .update({
          credit_limit_enabled: false
        })
        .eq('customer_id', customerId)
    }

    // Create alert
    await createBlacklistAlert(
      customerId,
      customer.name,
      'threshold_reached',
      `Customer blacklisted: ${reason}`,
      'critical',
      options?.total_outstanding || 0,
      options?.average_delay_days || 0,
      'Customer credit has been suspended. Advance payment required for new orders.'
    )

    return { success: true, blacklistEntry: data }
  } catch (error) {
    console.error('Error blacklisting customer:', error)
    return { success: false, error: 'Failed to blacklist customer' }
  }
}

/**
 * Remove customer from blacklist
 */
export async function removeFromBlacklist(
  customerId: string,
  removalReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('customer_blacklist')
      .update({
        blacklist_status: 'removed',
        removed_at: new Date().toISOString(),
        removed_by: user.id,
        removal_reason: removalReason
      })
      .eq('customer_id', customerId)
      .eq('blacklist_status', 'active')

    if (error) throw error

    // Update customer status
    await supabase
      .from('customers')
      .update({
        blacklisted: false,
        blacklist_reason: null
      })
      .eq('id', customerId)

    return { success: true }
  } catch (error) {
    console.error('Error removing from blacklist:', error)
    return { success: false, error: 'Failed to remove from blacklist' }
  }
}

/**
 * Get all blacklisted customers
 */
export async function getBlacklistedCustomers(): Promise<{
  success: boolean
  customers?: BlacklistEntry[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('customer_blacklist')
      .select('*')
      .eq('user_id', user.id)
      .eq('blacklist_status', 'active')
      .order('blacklisted_at', { ascending: false })

    if (error) throw error

    return { success: true, customers: data }
  } catch (error) {
    console.error('Error fetching blacklisted customers:', error)
    return { success: false, error: 'Failed to fetch blacklisted customers' }
  }
}

/**
 * Get blacklist alerts
 */
export async function getBlacklistAlerts(
  unacknowledgedOnly: boolean = false
): Promise<{
  success: boolean
  alerts?: BlacklistAlert[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    let query = supabase
      .from('blacklist_alerts')
      .select('*')
      .eq('user_id', user.id)

    if (unacknowledgedOnly) {
      query = query.eq('acknowledged', false)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, alerts: data }
  } catch (error) {
    console.error('Error fetching blacklist alerts:', error)
    return { success: false, error: 'Failed to fetch alerts' }
  }
}

/**
 * Create blacklist rule
 */
export async function createBlacklistRule(
  rule: Omit<BlacklistRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; rule?: BlacklistRule; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('blacklist_rules')
      .insert({ ...rule, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    return { success: true, rule: data }
  } catch (error) {
    console.error('Error creating blacklist rule:', error)
    return { success: false, error: 'Failed to create rule' }
  }
}

// Helper functions

async function checkIfRuleTriggered(
  customer: { total_outstanding: number; longest_overdue_days: number; overdue_count: number; total_invoices: number },
  rule: BlacklistRule
): Promise<boolean> {
  let triggered = true

  if (rule.min_overdue_amount && customer.total_outstanding < rule.min_overdue_amount) {
    triggered = false
  }

  if (rule.min_overdue_days && customer.longest_overdue_days < rule.min_overdue_days) {
    triggered = false
  }

  if (rule.min_overdue_invoices && customer.overdue_count < rule.min_overdue_invoices) {
    triggered = false
  }

  if (rule.payment_default_percentage) {
    const defaultPercentage = (customer.overdue_count / customer.total_invoices) * 100
    if (defaultPercentage < rule.payment_default_percentage) {
      triggered = false
    }
  }

  return triggered
}

async function createBlacklistAlert(
  customerId: string,
  customerName: string,
  alertType: BlacklistAlert['alert_type'],
  alertMessage: string,
  severity: BlacklistAlert['severity'],
  currentOutstanding: number,
  daysOverdue: number,
  recommendedAction: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('blacklist_alerts').insert({
    user_id: user.id,
    customer_id: customerId,
    customer_name: customerName,
    alert_type: alertType,
    alert_message: alertMessage,
    severity,
    current_outstanding: currentOutstanding,
    days_overdue: daysOverdue,
    recommended_action: recommendedAction,
    acknowledged: false
  })
}

async function suspendCustomerCredit(
  customerId: string,
  reason: string
): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('customer_credit_limits')
    .update({
      credit_limit_enabled: false
    })
    .eq('customer_id', customerId)

  await supabase
    .from('customers')
    .update({
      credit_suspended: true,
      credit_suspension_reason: reason
    })
    .eq('id', customerId)
}
