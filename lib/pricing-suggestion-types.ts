/**
 * Smart Pricing Suggestion Engine - Type Definitions
 * Auto-suggest pricing based on past invoices using AI
 */

export interface PricingSuggestion {
  item_description: string
  suggested_price: number
  price_range: {
    min: number
    max: number
    average: number
    median: number
  }
  confidence_score: number  // 0-100
  based_on_count: number
  last_used_date: string
  last_used_price: number
  price_trend: 'stable' | 'increasing' | 'decreasing'
  trend_percentage?: number
  reasons: string[]
}

export interface PriceHistory {
  id: string
  user_id: string
  item_description: string
  normalized_description: string
  unit_price: number
  quantity: number
  customer_id: string
  customer_name: string
  invoice_id: string
  invoice_date: string
  created_at: string
}

export interface PricingRule {
  id: string
  user_id: string
  item_pattern: string  // Regex pattern or keyword
  rule_type: 'fixed' | 'markup' | 'customer_specific' | 'quantity_based'
  
  // Fixed price
  fixed_price?: number
  
  // Markup on cost
  cost_price?: number
  markup_percentage?: number
  
  // Customer-specific pricing
  customer_id?: string
  customer_tier?: 'regular' | 'premium' | 'enterprise'
  
  // Quantity-based pricing
  quantity_breaks?: QuantityBreak[]
  
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuantityBreak {
  min_quantity: number
  max_quantity?: number
  unit_price: number
  discount_percentage?: number
}

export interface PricingSuggestionRequest {
  item_description: string
  customer_id?: string
  quantity?: number
  category?: string
  hsn_sac_code?: string
}

export interface PricingAnalytics {
  item_description: string
  total_times_sold: number
  total_revenue: number
  unique_customers: number
  average_price: number
  price_volatility: number  // Standard deviation
  last_30_days_average: number
  last_90_days_average: number
  seasonal_pattern?: SeasonalPattern
  customer_segments?: CustomerSegmentPricing[]
}

export interface SeasonalPattern {
  has_pattern: boolean
  peak_months?: number[]
  low_months?: number[]
  average_variation_percentage?: number
}

export interface CustomerSegmentPricing {
  segment: 'regular' | 'premium' | 'enterprise'
  average_price: number
  customer_count: number
  price_difference_percentage: number
}

export interface PricingRecommendation {
  recommended_price: number
  min_recommended_price: number
  max_recommended_price: number
  rationale: string
  profit_margin_estimate?: number
  competitive_position?: 'below_market' | 'market_rate' | 'premium'
  confidence: 'high' | 'medium' | 'low'
}

export interface DynamicPricingConfig {
  id: string
  user_id: string
  
  // Enable features
  ai_suggestions_enabled: boolean
  auto_apply_suggestions: boolean
  customer_tier_pricing: boolean
  quantity_discounts: boolean
  seasonal_pricing: boolean
  
  // Thresholds
  min_confidence_score: number
  min_historical_count: number
  
  // Constraints
  max_price_increase_percentage: number
  max_price_decrease_percentage: number
  
  // Rules
  always_show_suggestions: boolean
  require_approval_for_changes: boolean
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PriceOptimizationInsight {
  item_description: string
  current_average_price: number
  optimized_price: number
  potential_revenue_increase: number
  potential_revenue_increase_percentage: number
  rationale: string
  confidence_score: number
  action: 'increase_price' | 'decrease_price' | 'maintain_price'
}
