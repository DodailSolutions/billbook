/**
 * Multi-Currency Support - Server Actions
 * Convert and manage invoices in multiple currencies with INR as primary
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  ExchangeRate,
  MultiCurrencyInvoice,
  MultiCurrencySettings,
  CurrencyConversion,
  MultiCurrencyReport
} from './multi-currency-types'

/**
 * Get current exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string = 'INR'
): Promise<{ success: boolean; rate?: number; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // If same currency, rate is 1
    if (fromCurrency === toCurrency) {
      return { success: true, rate: 1 }
    }

    // Check for recent rate (within last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)

    const { data: recentRate } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .gte('effective_date', oneDayAgo.toISOString())
      .order('effective_date', { ascending: false })
      .limit(1)
      .single()

    if (recentRate) {
      return { success: true, rate: recentRate.rate }
    }

    // Fetch from API if auto-fetch is enabled
    const settings = await getMultiCurrencySettings()
    if (settings.settings?.auto_fetch_rates) {
      const apiRate = await fetchExchangeRateFromAPI(fromCurrency, toCurrency, settings.settings)
      if (apiRate.success && apiRate.rate) {
        // Save to database
        await supabase.from('exchange_rates').insert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: apiRate.rate,
          effective_date: new Date().toISOString(),
          source: 'api'
        })

        return { success: true, rate: apiRate.rate }
      }
    }

    return { success: false, error: 'No exchange rate available. Please add manually.' }
  } catch (error) {
    console.error('Error getting exchange rate:', error)
    return { success: false, error: 'Failed to get exchange rate' }
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'INR'
): Promise<{ success: boolean; conversion?: CurrencyConversion; error?: string }> {
  try {
    const rateResult = await getExchangeRate(fromCurrency, toCurrency)
    
    if (!rateResult.success || !rateResult.rate) {
      return { success: false, error: rateResult.error }
    }

    const convertedAmount = amount * rateResult.rate

    const conversion: CurrencyConversion = {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount,
      converted_amount: convertedAmount,
      exchange_rate: rateResult.rate,
      conversion_date: new Date().toISOString()
    }

    return { success: true, conversion }
  } catch (error) {
    console.error('Error converting currency:', error)
    return { success: false, error: 'Failed to convert currency' }
  }
}

/**
 * Create multi-currency invoice
 */
export async function createMultiCurrencyInvoice(
  invoiceId: string,
  foreignCurrency: string,
  foreignSubtotal: number,
  foreignTaxAmount: number,
  foreignTotalAmount: number
): Promise<{ success: boolean; multiCurrencyInvoice?: MultiCurrencyInvoice; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get exchange rate
    const rateResult = await getExchangeRate(foreignCurrency, 'INR')
    if (!rateResult.success || !rateResult.rate) {
      return { success: false, error: 'Failed to get exchange rate' }
    }

    const exchangeRate = rateResult.rate

    // Convert to INR
    const inrSubtotal = foreignSubtotal * exchangeRate
    const inrTaxAmount = foreignTaxAmount * exchangeRate
    const inrTotalAmount = foreignTotalAmount * exchangeRate

    const multiCurrencyData: Partial<MultiCurrencyInvoice> = {
      invoice_id: invoiceId,
      foreign_currency: foreignCurrency,
      foreign_subtotal: foreignSubtotal,
      foreign_tax_amount: foreignTaxAmount,
      foreign_total_amount: foreignTotalAmount,
      exchange_rate_used: exchangeRate,
      exchange_rate_date: new Date().toISOString(),
      inr_subtotal: inrSubtotal,
      inr_tax_amount: inrTaxAmount,
      inr_total_amount: inrTotalAmount
    }

    const { data, error } = await supabase
      .from('multi_currency_invoices')
      .insert(multiCurrencyData)
      .select()
      .single()

    if (error) throw error

    // Update main invoice with INR amounts
    await supabase
      .from('invoices')
      .update({
        subtotal: inrSubtotal,
        tax_amount: inrTaxAmount,
        total_amount: inrTotalAmount,
        currency: foreignCurrency,
        exchange_rate: exchangeRate
      })
      .eq('id', invoiceId)

    return { success: true, multiCurrencyInvoice: data }
  } catch (error) {
    console.error('Error creating multi-currency invoice:', error)
    return { success: false, error: 'Failed to create multi-currency invoice' }
  }
}

/**
 * Record exchange gain/loss on payment
 */
export async function recordExchangeGainLoss(
  invoiceId: string,
  paymentAmount: number,
  paymentCurrency: string
): Promise<{ success: boolean; gainLoss?: number; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get original invoice currency data
    const { data: multiCurrencyInvoice, error } = await supabase
      .from('multi_currency_invoices')
      .select('*')
      .eq('invoice_id', invoiceId)
      .single()

    if (error || !multiCurrencyInvoice) {
      return { success: false, error: 'Multi-currency invoice not found' }
    }

    // Get exchange rate at payment
    const rateResult = await getExchangeRate(paymentCurrency, 'INR')
    if (!rateResult.success || !rateResult.rate) {
      return { success: false, error: 'Failed to get payment date exchange rate' }
    }

    const paymentDateRate = rateResult.rate

    // Calculate INR amount at payment
    const inrAtPayment = paymentAmount * paymentDateRate

    // Calculate INR amount at invoice
    const inrAtInvoice = paymentAmount * multiCurrencyInvoice.exchange_rate_used

    // Calculate gain/loss (positive = gain, negative = loss)
    const gainLoss = inrAtPayment - inrAtInvoice

    // Update multi-currency invoice
    await supabase
      .from('multi_currency_invoices')
      .update({
        exchange_rate_at_payment: paymentDateRate,
        exchange_gain_loss: gainLoss
      })
      .eq('invoice_id', invoiceId)

    return { success: true, gainLoss }
  } catch (error) {
    console.error('Error recording exchange gain/loss:', error)
    return { success: false, error: 'Failed to record exchange gain/loss' }
  }
}

/**
 * Get multi-currency report
 */
export async function getMultiCurrencyReport(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; report?: MultiCurrencyReport; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get all multi-currency invoices in period
    const { data: invoices, error } = await supabase
      .from('multi_currency_invoices')
      .select(`
        *,
        invoice:invoices!inner(
          invoice_date,
          payment_status,
          user_id
        )
      `)
      .eq('invoice.user_id', user.id)
      .gte('invoice.invoice_date', startDate)
      .lte('invoice.invoice_date', endDate)

    if (error) throw error

    // Group by currency
    const revenueByCurrency = new Map<string, {
      currency: string
      foreign_amount: number
      inr_amount: number
      invoice_count: number
    }>()

    let totalExchangeGain = 0
    let totalExchangeLoss = 0

    invoices?.forEach(inv => {
      const currency = inv.foreign_currency
      
      if (!revenueByCurrency.has(currency)) {
        revenueByCurrency.set(currency, {
          currency,
          foreign_amount: 0,
          inr_amount: 0,
          invoice_count: 0
        })
      }

      const stats = revenueByCurrency.get(currency)!
      stats.foreign_amount += inv.foreign_total_amount
      stats.inr_amount += inv.inr_total_amount
      stats.invoice_count += 1

      // Track exchange gains/losses
      if (inv.exchange_gain_loss) {
        if (inv.exchange_gain_loss > 0) {
          totalExchangeGain += inv.exchange_gain_loss
        } else {
          totalExchangeLoss += Math.abs(inv.exchange_gain_loss)
        }
      }
    })

    // Get outstanding invoices
    const { data: outstanding } = await supabase
      .from('multi_currency_invoices')
      .select(`
        *,
        invoice:invoices!inner(
          payment_status,
          user_id
        )
      `)
      .eq('invoice.user_id', user.id)
      .in('invoice.payment_status', ['unpaid', 'partially_paid'])

    const outstandingByCurrency = new Map<string, {
      currency: string
      foreign_amount: number
      inr_equivalent: number
      invoice_count: number
    }>()

    outstanding?.forEach(inv => {
      const currency = inv.foreign_currency
      
      if (!outstandingByCurrency.has(currency)) {
        outstandingByCurrency.set(currency, {
          currency,
          foreign_amount: 0,
          inr_equivalent: 0,
          invoice_count: 0
        })
      }

      const stats = outstandingByCurrency.get(currency)!
      stats.foreign_amount += inv.foreign_total_amount
      stats.inr_equivalent += inv.inr_total_amount
      stats.invoice_count += 1
    })

    const totalRevenueInr = Array.from(revenueByCurrency.values())
      .reduce((sum, curr) => sum + curr.inr_amount, 0)

    const report: MultiCurrencyReport = {
      period_start: startDate,
      period_end: endDate,
      revenue_by_currency: Array.from(revenueByCurrency.values()),
      total_revenue_inr: totalRevenueInr,
      total_exchange_gain: totalExchangeGain,
      total_exchange_loss: totalExchangeLoss,
      net_exchange_impact: totalExchangeGain - totalExchangeLoss,
      outstanding_by_currency: Array.from(outstandingByCurrency.values())
    }

    return { success: true, report }
  } catch (error) {
    console.error('Error generating multi-currency report:', error)
    return { success: false, error: 'Failed to generate report' }
  }
}

/**
 * Save or update exchange rate manually
 */
export async function saveExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  effectiveDate?: string
): Promise<{ success: boolean; exchangeRate?: ExchangeRate; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate,
        effective_date: effectiveDate || new Date().toISOString(),
        source: 'manual'
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, exchangeRate: data }
  } catch (error) {
    console.error('Error saving exchange rate:', error)
    return { success: false, error: 'Failed to save exchange rate' }
  }
}

/**
 * Get multi-currency settings
 */
export async function getMultiCurrencySettings(): Promise<{
  success: boolean
  settings?: MultiCurrencySettings
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('multi_currency_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, settings: data || undefined }
  } catch (error) {
    console.error('Error fetching multi-currency settings:', error)
    return { success: false, error: 'Failed to fetch settings' }
  }
}

/**
 * Save multi-currency settings
 */
export async function saveMultiCurrencySettings(
  settings: Omit<MultiCurrencySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; settings?: MultiCurrencySettings; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('multi_currency_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let data, error

    if (existing) {
      ({ data, error } = await supabase
        .from('multi_currency_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single())
    } else {
      ({ data, error } = await supabase
        .from('multi_currency_settings')
        .insert({ ...settings, user_id: user.id })
        .select()
        .single())
    }

    if (error) throw error

    return { success: true, settings: data }
  } catch (error) {
    console.error('Error saving multi-currency settings:', error)
    return { success: false, error: 'Failed to save settings' }
  }
}

// Helper function to fetch from external API
async function fetchExchangeRateFromAPI(
  fromCurrency: string,
  toCurrency: string,
  settings: MultiCurrencySettings
): Promise<{ success: boolean; rate?: number; error?: string }> {
  try {
    if (!settings.exchange_rate_api || !settings.api_key) {
      return { success: false, error: 'API not configured' }
    }

    // Example for exchangerate-api.com
    if (settings.exchange_rate_api === 'exchangerate-api') {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${settings.api_key}/pair/${fromCurrency}/${toCurrency}`
      )
      
      const data = await response.json()
      
      if (data.result === 'success') {
        return { success: true, rate: data.conversion_rate }
      }
    }

    return { success: false, error: 'Failed to fetch from API' }
  } catch (error) {
    console.error('Error fetching exchange rate from API:', error)
    return { success: false, error: 'API request failed' }
  }
}
