/**
 * Smart Pricing Suggestion Engine - Server Actions
 * Auto-suggest pricing based on past invoices using AI
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  PricingSuggestion,
  PricingSuggestionRequest,
  PricingRule,
  PricingAnalytics,
  DynamicPricingConfig,
  PriceOptimizationInsight
} from './pricing-suggestion-types'

/**
 * Get AI-powered pricing suggestion for an item
 */
export async function getPricingSuggestion(
  request: PricingSuggestionRequest
): Promise<{ success: boolean; suggestion?: PricingSuggestion; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Normalize item description for matching
    const normalized = normalizeItemDescription(request.item_description)

    // Get historical pricing data
    const { data: history, error: historyError } = await supabase
      .from('invoice_items')
      .select(`
        description,
        unit_price,
        quantity,
        invoice:invoices!inner(
          invoice_date,
          customer_id,
          customers!inner(name)
        )
      `)
      .eq('invoices.user_id', user.id)
      .ilike('description', `%${normalized}%`)
      .order('invoices.invoice_date', { ascending: false })
      .limit(100)

    if (historyError) throw historyError

    type HistoryItem = {
      description: string
      unit_price: number
      quantity: number
      invoice: {
        invoice_date: string
        customer_id: string
        customers: { name: string }[]
      }
    }

    if (!history || history.length === 0) {
      // No history - check for pricing rules
      const rulePrice = await checkPricingRules(user.id, request)
      if (rulePrice) {
        return {
          success: true,
          suggestion: {
            item_description: request.item_description,
            suggested_price: rulePrice.price,
            price_range: {
              min: rulePrice.price,
              max: rulePrice.price,
              average: rulePrice.price,
              median: rulePrice.price
            },
            confidence_score: 90,
            based_on_count: 0,
            last_used_date: new Date().toISOString(),
            last_used_price: rulePrice.price,
            price_trend: 'stable',
            reasons: [rulePrice.reason]
          }
        }
      }

      return {
        success: false,
        error: 'No historical pricing data found for this item'
      }
    }

    // Calculate statistics
    const typedHistory = history as unknown as HistoryItem[]
    const prices = typedHistory.map(h => h.unit_price)
    const sortedPrices = [...prices].sort((a, b) => a - b)
    
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)]

    // Get most recent price
    const lastUsed = typedHistory[0]
    const lastUsedPrice = lastUsed.unit_price
    const lastUsedDate = lastUsed.invoice?.invoice_date || new Date().toISOString()

    // Calculate price trend
    const recentPrices = prices.slice(0, Math.min(5, prices.length))
    const olderPrices = prices.slice(5, Math.min(10, prices.length))
    
    let priceTrend: 'stable' | 'increasing' | 'decreasing' = 'stable'
    let trendPercentage = 0

    if (olderPrices.length > 0) {
      const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length
      const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length
      const change = ((recentAvg - olderAvg) / olderAvg) * 100

      if (Math.abs(change) > 5) {
        priceTrend = change > 0 ? 'increasing' : 'decreasing'
        trendPercentage = Math.abs(change)
      }
    }

    // Calculate confidence score
    const baseConfidence = Math.min(100, (typedHistory.length / 10) * 100)
    const variabilityPenalty = calculateVariabilityPenalty(prices)
    const confidenceScore = Math.round(Math.max(0, baseConfidence - variabilityPenalty))

    // Determine suggested price
    let suggestedPrice = average

    // Adjust for customer-specific pricing
    if (request.customer_id) {
      const customerHistory = typedHistory.filter(
        h => h.invoice?.customer_id === request.customer_id
      )
      if (customerHistory.length > 0) {
        const customerAvg = customerHistory.reduce((sum: number, h: HistoryItem) => sum + h.unit_price, 0) / customerHistory.length
        suggestedPrice = customerAvg
      }
    }

    // Adjust for quantity discounts
    if (request.quantity && request.quantity > 10) {
      suggestedPrice *= 0.95  // 5% discount for bulk
    }

    // Round to nearest 10
    suggestedPrice = Math.round(suggestedPrice / 10) * 10

    // Generate reasons
    const reasons: string[] = []
    reasons.push(`Based on ${typedHistory.length} past invoice(s)`)
    reasons.push(`Average price across all customers: ₹${Math.round(average)}`)
    
    if (priceTrend !== 'stable') {
      reasons.push(`Price trend: ${priceTrend} by ${trendPercentage.toFixed(1)}%`)
    }

    if (request.customer_id) {
      const customerHistory = typedHistory.filter(h => h.invoice?.customer_id === request.customer_id)
      if (customerHistory.length > 0) {
        reasons.push(`Customer-specific pricing based on ${customerHistory.length} past order(s)`)
      }
    }

    const suggestion: PricingSuggestion = {
      item_description: request.item_description,
      suggested_price: suggestedPrice,
      price_range: { min, max, average, median },
      confidence_score: confidenceScore,
      based_on_count: typedHistory.length,
      last_used_date: lastUsedDate,
      last_used_price: lastUsedPrice,
      price_trend: priceTrend,
      trend_percentage: trendPercentage > 0 ? trendPercentage : undefined,
      reasons
    }

    return { success: true, suggestion }
  } catch (error) {
    console.error('Error getting pricing suggestion:', error)
    return { success: false, error: 'Failed to get pricing suggestion' }
  }
}

/**
 * Get detailed pricing analytics for an item
 */
export async function getPricingAnalytics(
  itemDescription: string
): Promise<{ success: boolean; analytics?: PricingAnalytics; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const normalized = normalizeItemDescription(itemDescription)

    // Get all historical data for this item
    const { data: history, error } = await supabase
      .from('invoice_items')
      .select(`
        unit_price,
        quantity,
        amount,
        invoice:invoices!inner(
          invoice_date,
          customer_id,
          customers!inner(name)
        )
      `)
      .eq('invoices.user_id', user.id)
      .ilike('description', `%${normalized}%`)
      .order('invoices.invoice_date', { ascending: false })

    if (error) throw error

    type AnalyticsHistoryItem = {
      unit_price: number
      quantity: number
      amount: number
      invoice: {
        invoice_date: string
        customer_id: string
        customers: { name: string }[]
      }
    }

    if (!history || history.length === 0) {
      return { success: false, error: 'No data found for analytics' }
    }

    const typedHistory = history as unknown as AnalyticsHistoryItem[]
    const prices = typedHistory.map(h => h.unit_price)
    const totalRevenue = typedHistory.reduce((sum: number, h: AnalyticsHistoryItem) => sum + h.amount, 0)
    const uniqueCustomers = new Set(typedHistory.map(h => h.invoice?.customer_id)).size
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length

    // Calculate price volatility (standard deviation)
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - averagePrice, 2), 0) / prices.length
    const priceVolatility = Math.sqrt(variance)

    // Last 30 and 90 days averages
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const last30Days = typedHistory.filter(h => new Date(h.invoice?.invoice_date || '') >= thirtyDaysAgo)
    const last90Days = typedHistory.filter(h => new Date(h.invoice?.invoice_date || '') >= ninetyDaysAgo)

    const last30DaysAverage = last30Days.length > 0
      ? last30Days.reduce((sum: number, h: AnalyticsHistoryItem) => sum + h.unit_price, 0) / last30Days.length
      : averagePrice

    const last90DaysAverage = last90Days.length > 0
      ? last90Days.reduce((sum: number, h: AnalyticsHistoryItem) => sum + h.unit_price, 0) / last90Days.length
      : averagePrice

    const analytics: PricingAnalytics = {
      item_description: itemDescription,
      total_times_sold: typedHistory.length,
      total_revenue: totalRevenue,
      unique_customers: uniqueCustomers,
      average_price: averagePrice,
      price_volatility: priceVolatility,
      last_30_days_average: last30DaysAverage,
      last_90_days_average: last90DaysAverage
    }

    return { success: true, analytics }
  } catch (error) {
    console.error('Error getting pricing analytics:', error)
    return { success: false, error: 'Failed to get analytics' }
  }
}

/**
 * Save a pricing rule
 */
export async function savePricingRule(
  rule: Omit<PricingRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; rule?: PricingRule; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('pricing_rules')
      .insert({ ...rule, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    return { success: true, rule: data }
  } catch (error) {
    console.error('Error saving pricing rule:', error)
    return { success: false, error: 'Failed to save pricing rule' }
  }
}

/**
 * Get all pricing rules
 */
export async function getPricingRules(): Promise<{
  success: boolean
  rules?: PricingRule[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error) throw error

    return { success: true, rules: data }
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return { success: false, error: 'Failed to fetch pricing rules' }
  }
}

/**
 * Get price optimization insights
 */
export async function getPriceOptimizationInsights(): Promise<{
  success: boolean
  insights?: PriceOptimizationInsight[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get top items by frequency
    const { data: topItems, error } = await supabase
      .from('invoice_items')
      .select(`
        description,
        unit_price,
        quantity,
        amount,
        invoice:invoices!inner(user_id, invoice_date)
      `)
      .eq('invoices.user_id', user.id)
      .order('invoices.invoice_date', { ascending: false })
      .limit(1000)

    if (error) throw error

    // Group by item description
    const itemGroups = new Map<string, typeof topItems>()
    
    topItems?.forEach(item => {
      const normalized = normalizeItemDescription(item.description)
      if (!itemGroups.has(normalized)) {
        itemGroups.set(normalized, [])
      }
      itemGroups.get(normalized)!.push(item)
    })

    // Analyze each item group
    const insights: PriceOptimizationInsight[] = []

    for (const [description, items] of itemGroups) {
      if (items.length < 5) continue  // Need sufficient data

      const prices = items.map(i => i.unit_price)
      const currentAvg = prices.reduce((sum, p) => sum + p, 0) / prices.length

      // Simple optimization logic
      const sortedPrices = [...prices].sort((a, b) => a - b)
      const median = sortedPrices[Math.floor(sortedPrices.length / 2)]
      const top25Percentile = sortedPrices[Math.floor(sortedPrices.length * 0.75)]

      let optimizedPrice = currentAvg
      let action: 'increase_price' | 'decrease_price' | 'maintain_price' = 'maintain_price'
      let rationale = 'Current pricing is optimal'

      // If most recent prices are lower than historical median, suggest increase
      const recentPrices = prices.slice(0, Math.min(5, prices.length))
      const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length

      if (recentAvg < median * 0.9) {
        optimizedPrice = median
        action = 'increase_price'
        rationale = 'Recent prices are below historical median. Consider increasing to match past performance.'
      } else if (recentAvg > top25Percentile * 1.1) {
        optimizedPrice = median
        action = 'decrease_price'
        rationale = 'Prices may be too high. Consider aligning with market median.'
      }

      const potentialIncrease = (optimizedPrice - currentAvg) * items.length
      const potentialIncreasePercentage = ((optimizedPrice - currentAvg) / currentAvg) * 100

      if (Math.abs(potentialIncreasePercentage) > 2) {  // Only significant changes
        insights.push({
          item_description: description,
          current_average_price: currentAvg,
          optimized_price: optimizedPrice,
          potential_revenue_increase: potentialIncrease,
          potential_revenue_increase_percentage: potentialIncreasePercentage,
          rationale,
          confidence_score: Math.min(100, (items.length / 10) * 100),
          action
        })
      }
    }

    // Sort by potential revenue increase
    insights.sort((a, b) => Math.abs(b.potential_revenue_increase) - Math.abs(a.potential_revenue_increase))

    return { success: true, insights: insights.slice(0, 10) }
  } catch (error) {
    console.error('Error getting optimization insights:', error)
    return { success: false, error: 'Failed to get insights' }
  }
}

/**
 * Configure dynamic pricing settings
 */
export async function saveDynamicPricingConfig(
  config: Omit<DynamicPricingConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; config?: DynamicPricingConfig; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if config exists
    const { data: existing } = await supabase
      .from('dynamic_pricing_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let data, error

    if (existing) {
      ({ data, error } = await supabase
        .from('dynamic_pricing_config')
        .update(config)
        .eq('id', existing.id)
        .select()
        .single())
    } else {
      ({ data, error } = await supabase
        .from('dynamic_pricing_config')
        .insert({ ...config, user_id: user.id })
        .select()
        .single())
    }

    if (error) throw error

    return { success: true, config: data }
  } catch (error) {
    console.error('Error saving pricing config:', error)
    return { success: false, error: 'Failed to save config' }
  }
}

// Helper functions

function normalizeItemDescription(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

function calculateVariabilityPenalty(prices: number[]): number {
  if (prices.length < 2) return 0

  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = (stdDev / average) * 100

  // Penalize high variability
  if (coefficientOfVariation > 30) return 40
  if (coefficientOfVariation > 20) return 25
  if (coefficientOfVariation > 10) return 10
  
  return 0
}

async function checkPricingRules(
  userId: string,
  request: PricingSuggestionRequest
): Promise<{ price: number; reason: string } | null> {
  const supabase = await createClient()
  
  const { data: rules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: false })

  if (!rules || rules.length === 0) return null

  for (const rule of rules) {
    // Check if rule matches
    const pattern = new RegExp(rule.item_pattern, 'i')
    if (pattern.test(request.item_description)) {
      if (rule.rule_type === 'fixed' && rule.fixed_price) {
        return {
          price: rule.fixed_price,
          reason: `Fixed price rule applied: ${rule.item_pattern}`
        }
      }

      if (rule.rule_type === 'markup' && rule.cost_price && rule.markup_percentage) {
        const price = rule.cost_price * (1 + rule.markup_percentage / 100)
        return {
          price,
          reason: `Markup rule applied: ${rule.markup_percentage}% on cost`
        }
      }

      if (rule.rule_type === 'customer_specific' && rule.customer_id === request.customer_id && rule.fixed_price) {
        return {
          price: rule.fixed_price,
          reason: 'Customer-specific pricing rule applied'
        }
      }

      if (rule.rule_type === 'quantity_based' && rule.quantity_breaks && request.quantity) {
        const applicableBreak = rule.quantity_breaks.find(
          (qb: { min_quantity: number; max_quantity?: number; unit_price: number }) => 
            request.quantity! >= qb.min_quantity && (!qb.max_quantity || request.quantity! <= qb.max_quantity)
        )
        if (applicableBreak) {
          return {
            price: applicableBreak.unit_price,
            reason: `Quantity-based pricing: ${request.quantity} units`
          }
        }
      }
    }
  }

  return null
}
