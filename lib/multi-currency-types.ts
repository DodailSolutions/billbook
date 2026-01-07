/**
 * Multi-Currency Support with INR-First Accounting
 * Type Definitions
 */

export interface Currency {
  code: string  // ISO 4217 code
  name: string
  symbol: string
  decimal_digits: number
  is_active: boolean
}

export interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  effective_date: string
  source: 'manual' | 'api' | 'market'
  created_at: string
  updated_at: string
}

export interface MultiCurrencyInvoice {
  invoice_id: string
  
  // Original currency
  foreign_currency: string
  foreign_subtotal: number
  foreign_tax_amount: number
  foreign_total_amount: number
  
  // INR conversion (primary accounting currency)
  exchange_rate_used: number
  exchange_rate_date: string
  inr_subtotal: number
  inr_tax_amount: number
  inr_total_amount: number
  
  // Exchange rate variance tracking
  exchange_rate_at_payment?: number
  exchange_gain_loss?: number
  
  created_at: string
  updated_at: string
}

export interface MultiCurrencySettings {
  id: string
  user_id: string
  
  // Primary currency (always INR for Indian businesses)
  primary_currency: 'INR'
  
  // Enabled foreign currencies
  enabled_currencies: string[]
  
  // Exchange rate settings
  auto_fetch_rates: boolean
  exchange_rate_api?: 'exchangerate-api' | 'fixer' | 'openexchangerates' | 'manual'
  api_key?: string
  
  // Accounting preferences
  record_exchange_gain_loss: boolean
  exchange_gain_loss_account?: string
  
  // Invoice settings
  show_both_currencies: boolean
  default_payment_currency: 'invoice_currency' | 'inr'
  
  // Compliance
  export_declaration_required: boolean
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MultiCurrencyPayment {
  payment_id: string
  invoice_id: string
  
  // Payment currency
  payment_currency: string
  payment_amount: number
  
  // Converted to INR
  exchange_rate_at_payment: number
  inr_amount: number
  
  // Exchange gain/loss
  exchange_gain_loss: number
  gain_loss_recorded: boolean
  
  created_at: string
}

export interface CurrencyConversion {
  from_currency: string
  to_currency: string
  amount: number
  converted_amount: number
  exchange_rate: number
  conversion_date: string
}

export interface ExchangeRateHistory {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  date: string
  source: string
}

export interface MultiCurrencyReport {
  period_start: string
  period_end: string
  
  // Revenue by currency
  revenue_by_currency: {
    currency: string
    foreign_amount: number
    inr_amount: number
    invoice_count: number
  }[]
  
  // Total revenue in INR
  total_revenue_inr: number
  
  // Exchange gain/loss
  total_exchange_gain: number
  total_exchange_loss: number
  net_exchange_impact: number
  
  // Outstanding in foreign currencies
  outstanding_by_currency: {
    currency: string
    foreign_amount: number
    inr_equivalent: number
    invoice_count: number
  }[]
}

// Supported currencies (INR is primary)
export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    decimal_digits: 2,
    is_active: true
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimal_digits: 0,
    is_active: true
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimal_digits: 2,
    is_active: true
  }
]

export interface ExportInvoiceDeclaration {
  invoice_id: string
  export_type: 'goods' | 'services'
  port_code?: string
  shipping_bill_number?: string
  shipping_bill_date?: string
  foreign_currency: string
  foreign_amount: number
  export_duty?: number
  lut_declaration: boolean
  declared_at: string
}
