/**
 * Advanced GST Utilities
 * Smart auto-classification, HSN/SAC suggestions, compliance checks, round-off
 */

import { GST_STATE_CODES } from './gst-utils'
import type { HSNSACSuggestion, ComplianceWarning } from './types'

// ============================================
// SMART GST AUTO-CLASSIFICATION
// ============================================

/**
 * Automatically determine supply type (IGST vs CGST/SGST) based on state codes
 */
export function autoClassifyGSTType(
  companyStateCode: string,
  customerStateCode?: string | null
): {
  supplyType: 'intra-state' | 'inter-state'
  reason: string
  shouldUseCGSTSGST: boolean
  shouldUseIGST: boolean
} {
  // If customer state is not available, default to intra-state
  if (!customerStateCode || customerStateCode.trim() === '') {
    return {
      supplyType: 'intra-state',
      reason: 'Customer state not specified, defaulting to intra-state supply',
      shouldUseCGSTSGST: true,
      shouldUseIGST: false
    }
  }

  const company = companyStateCode.trim()
  const customer = customerStateCode.trim()

  if (company === customer) {
    return {
      supplyType: 'intra-state',
      reason: `Both parties in same state (${GST_STATE_CODES[company as keyof typeof GST_STATE_CODES]})`,
      shouldUseCGSTSGST: true,
      shouldUseIGST: false
    }
  } else {
    return {
      supplyType: 'inter-state',
      reason: `Different states: Company in ${GST_STATE_CODES[company as keyof typeof GST_STATE_CODES]}, Customer in ${GST_STATE_CODES[customer as keyof typeof GST_STATE_CODES]}`,
      shouldUseCGSTSGST: false,
      shouldUseIGST: true
    }
  }
}

/**
 * Extract state code from GSTIN or address
 */
export function extractStateCode(gstin?: string, address?: string): string | null {
  if (gstin && gstin.length >= 2) {
    const stateCode = gstin.substring(0, 2)
    if (GST_STATE_CODES[stateCode as keyof typeof GST_STATE_CODES]) {
      return stateCode
    }
  }

  // Fallback: Try to extract from address (basic implementation)
  if (address) {
    const addressLower = address.toLowerCase()
    const stateMapping: Record<string, string> = {
      'maharashtra': '27',
      'mumbai': '27',
      'delhi': '07',
      'karnataka': '29',
      'bangalore': '29',
      'tamil nadu': '33',
      'chennai': '33',
      'gujarat': '24',
      'ahmedabad': '24',
      'rajasthan': '08',
      'jaipur': '08',
      'west bengal': '19',
      'kolkata': '19',
      'telangana': '36',
      'hyderabad': '36',
      'andhra pradesh': '37',
      'uttar pradesh': '09',
      'haryana': '06',
      'punjab': '03',
      'madhya pradesh': '23',
      'kerala': '32',
      'odisha': '21',
      'assam': '18',
      'bihar': '10',
      'jharkhand': '20'
    }

    for (const [state, code] of Object.entries(stateMapping)) {
      if (addressLower.includes(state)) {
        return code
      }
    }
  }

  return null
}

// ============================================
// HSN/SAC INTELLIGENT SUGGESTION ENGINE
// ============================================

/**
 * Search HSN/SAC codes based on description keywords
 */
export function searchHSNSAC(
  query: string,
  category?: 'HSN' | 'SAC',
  limit: number = 5
): HSNSACSuggestion[] {
  const queryLower = query.toLowerCase().trim()
  
  // This is a client-side demo implementation
  // In production, this should query the hsn_sac_master table via API
  const commonCodes: HSNSACSuggestion[] = [
    // Services
    { code: '9954', description: 'Consultancy Services', category: 'SAC', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    { code: '9965', description: 'Other Professional, Technical and Business Services', category: 'SAC', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    { code: '9973', description: 'Software Implementation Services', category: 'SAC', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    { code: '9982', description: 'Computer and Information Services', category: 'SAC', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    { code: '9985', description: 'Education and Training Services', category: 'SAC', gst_rate: 18, relevance_score: 0, is_frequently_used: false },
    { code: '9986', description: 'Health Services', category: 'SAC', gst_rate: 12, relevance_score: 0, is_frequently_used: false },
    { code: '9989', description: 'Maintenance, repair and installation services', category: 'SAC', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    // Goods
    { code: '8517', description: 'Telephone sets, mobile phones', category: 'HSN', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    { code: '8471', description: 'Computers, laptops, hardware', category: 'HSN', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
    { code: '6204', description: 'Women clothing, garments', category: 'HSN', gst_rate: 12, relevance_score: 0, is_frequently_used: false },
    { code: '7326', description: 'Iron or steel articles', category: 'HSN', gst_rate: 18, relevance_score: 0, is_frequently_used: false },
    { code: '3004', description: 'Medicines, pharmaceutical products', category: 'HSN', gst_rate: 12, relevance_score: 0, is_frequently_used: false },
    { code: '4901', description: 'Printed books, publications', category: 'HSN', gst_rate: 12, relevance_score: 0, is_frequently_used: false },
    { code: '8544', description: 'Insulated wire, cable', category: 'HSN', gst_rate: 18, relevance_score: 0, is_frequently_used: false },
    { code: '9403', description: 'Furniture and parts', category: 'HSN', gst_rate: 18, relevance_score: 0, is_frequently_used: true },
  ]

  // Filter by category if specified
  let filtered = category 
    ? commonCodes.filter(c => c.category === category)
    : commonCodes

  // Calculate relevance score based on keyword matching
  filtered = filtered.map(code => {
    const descLower = code.description.toLowerCase()
    let score = 0

    // Exact match
    if (descLower.includes(queryLower)) {
      score += 10
    }

    // Word matching
    const queryWords = queryLower.split(/\s+/)
    queryWords.forEach(word => {
      if (word.length > 2 && descLower.includes(word)) {
        score += 5
      }
    })

    // Boost frequently used
    if (code.is_frequently_used) {
      score += 3
    }

    return { ...code, relevance_score: score }
  })

  // Filter only relevant results and sort
  const results = filtered
    .filter(c => c.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit)

  return results
}

/**
 * Get HSN/SAC suggestions based on item description
 */
export async function getHSNSACSuggestions(
  description: string,
  category?: 'HSN' | 'SAC',
  userFrequentCodes?: string[]
): Promise<HSNSACSuggestion[]> {
  // Search in master database
  const suggestions = searchHSNSAC(description, category, 10)

  // Boost user's frequently used codes
  if (userFrequentCodes && userFrequentCodes.length > 0) {
    suggestions.forEach(s => {
      if (userFrequentCodes.includes(s.code)) {
        s.relevance_score += 15
        s.is_frequently_used = true
      }
    })

    // Re-sort after boosting
    suggestions.sort((a, b) => b.relevance_score - a.relevance_score)
  }

  return suggestions.slice(0, 5)
}

/**
 * Validate and get GST rate for HSN/SAC code
 */
export function getGSTRateForHSNSAC(code: string): number | null {
  const suggestions = searchHSNSAC(code, undefined, 1)
  if (suggestions.length > 0 && suggestions[0].code === code) {
    return suggestions[0].gst_rate
  }
  return null
}

// ============================================
// AUTO ROUND-OFF
// ============================================

export interface RoundOffCalculation {
  originalAmount: number
  roundedAmount: number
  roundOffAmount: number
  roundOffType: 'up' | 'down' | 'none'
}

/**
 * Calculate round-off to nearest rupee
 */
export function calculateRoundOff(amount: number): RoundOffCalculation {
  const rounded = Math.round(amount)
  const roundOff = rounded - amount
  
  return {
    originalAmount: amount,
    roundedAmount: rounded,
    roundOffAmount: Math.round(roundOff * 100) / 100,
    roundOffType: roundOff > 0 ? 'up' : roundOff < 0 ? 'down' : 'none'
  }
}

/**
 * Apply round-off with configurable options
 */
export function applyRoundOff(
  amount: number,
  options: {
    enabled: boolean
    method: 'nearest' | 'up' | 'down'
    precision: number // 0 = rupee, 2 = paisa
  } = { enabled: true, method: 'nearest', precision: 0 }
): RoundOffCalculation {
  if (!options.enabled) {
    return {
      originalAmount: amount,
      roundedAmount: amount,
      roundOffAmount: 0,
      roundOffType: 'none'
    }
  }

  let rounded: number
  const multiplier = Math.pow(10, options.precision)

  switch (options.method) {
    case 'up':
      rounded = Math.ceil(amount * multiplier) / multiplier
      break
    case 'down':
      rounded = Math.floor(amount * multiplier) / multiplier
      break
    default:
      rounded = Math.round(amount * multiplier) / multiplier
  }

  const roundOff = rounded - amount

  return {
    originalAmount: amount,
    roundedAmount: rounded,
    roundOffAmount: Math.round(roundOff * 100) / 100,
    roundOffType: roundOff > 0.01 ? 'up' : roundOff < -0.01 ? 'down' : 'none'
  }
}

// ============================================
// COMPLIANCE CHECKS
// ============================================

/**
 * Perform comprehensive GST compliance checks on invoice data
 */
export function performComplianceChecks(invoiceData: {
  invoice_number?: string
  customer_gstin?: string
  company_gstin?: string
  subtotal: number
  gst_amount: number
  total: number
  supply_type: 'intra-state' | 'inter-state'
  cgst_amount?: number
  sgst_amount?: number
  igst_amount?: number
  invoice_date: string
  items: Array<{
    hsn_sac_code?: string
    gst_rate?: number
    amount: number
  }>
  reverse_charge_applicable?: boolean
  is_export?: boolean
}): ComplianceWarning[] {
  const warnings: ComplianceWarning[] = []

  // 1. Invoice Number Format Check
  if (!invoiceData.invoice_number || invoiceData.invoice_number.trim() === '') {
    warnings.push({
      type: 'invoice_number',
      severity: 'error',
      message: 'Invoice number is required',
      field: 'invoice_number'
    })
  }

  // 2. GSTIN Validation
  if (invoiceData.customer_gstin && invoiceData.customer_gstin.length > 0) {
    if (invoiceData.customer_gstin.length !== 15) {
      warnings.push({
        type: 'gstin',
        severity: 'warning',
        message: 'Customer GSTIN should be 15 characters',
        field: 'customer_gstin'
      })
    }
  }

  // 3. GST Calculation Verification
  const calculatedGST = (invoiceData.subtotal * (invoiceData.gst_amount / invoiceData.subtotal)) * 100
  const difference = Math.abs(invoiceData.gst_amount - calculatedGST)
  
  if (difference > 0.5) {
    warnings.push({
      type: 'gst_calculation',
      severity: 'warning',
      message: 'GST amount calculation may be incorrect',
      field: 'gst_amount'
    })
  }

  // 4. Supply Type Validation
  if (invoiceData.supply_type === 'intra-state') {
    // Should have CGST and SGST
    if (!invoiceData.cgst_amount || !invoiceData.sgst_amount) {
      warnings.push({
        type: 'supply_type',
        severity: 'error',
        message: 'Intra-state supply must have CGST and SGST',
        field: 'supply_type'
      })
    }

    if (invoiceData.cgst_amount && invoiceData.sgst_amount) {
      const diff = Math.abs(invoiceData.cgst_amount - invoiceData.sgst_amount)
      if (diff > 0.01) {
        warnings.push({
          type: 'cgst_sgst',
          severity: 'warning',
          message: 'CGST and SGST should be equal for intra-state supply',
          field: 'cgst_amount'
        })
      }
    }

    if (invoiceData.igst_amount && invoiceData.igst_amount > 0) {
      warnings.push({
        type: 'igst',
        severity: 'error',
        message: 'Intra-state supply should not have IGST',
        field: 'igst_amount'
      })
    }
  } else {
    // Inter-state: Should have IGST only
    if (!invoiceData.igst_amount || invoiceData.igst_amount === 0) {
      warnings.push({
        type: 'supply_type',
        severity: 'error',
        message: 'Inter-state supply must have IGST',
        field: 'igst_amount'
      })
    }

    if ((invoiceData.cgst_amount && invoiceData.cgst_amount > 0) || 
        (invoiceData.sgst_amount && invoiceData.sgst_amount > 0)) {
      warnings.push({
        type: 'cgst_sgst',
        severity: 'error',
        message: 'Inter-state supply should not have CGST/SGST',
        field: 'supply_type'
      })
    }
  }

  // 5. HSN/SAC Code Check
  const itemsWithoutCode = invoiceData.items.filter(item => !item.hsn_sac_code || item.hsn_sac_code.trim() === '')
  if (itemsWithoutCode.length > 0 && invoiceData.total > 50000) {
    warnings.push({
      type: 'hsn_sac',
      severity: 'warning',
      message: `${itemsWithoutCode.length} item(s) missing HSN/SAC code. Required for invoices over ₹50,000`,
      field: 'items'
    })
  }

  // 6. Total Calculation Check
  const expectedTotal = invoiceData.subtotal + invoiceData.gst_amount
  const totalDiff = Math.abs(invoiceData.total - expectedTotal)
  
  if (totalDiff > 1) {
    warnings.push({
      type: 'total',
      severity: 'warning',
      message: `Total amount mismatch. Expected: ₹${expectedTotal.toFixed(2)}, Got: ₹${invoiceData.total.toFixed(2)}`,
      field: 'total'
    })
  }

  // 7. Reverse Charge Check
  if (invoiceData.reverse_charge_applicable) {
    warnings.push({
      type: 'reverse_charge',
      severity: 'info',
      message: 'Reverse charge mechanism applicable. Ensure compliance with GST rules',
      field: 'reverse_charge_applicable'
    })
  }

  // 8. Export Check
  if (invoiceData.is_export) {
    warnings.push({
      type: 'export',
      severity: 'info',
      message: 'Export invoice. Ensure shipping bill and port details are provided',
      field: 'is_export'
    })
  }

  // 9. Date Validation
  const invoiceDate = new Date(invoiceData.invoice_date)
  const futureLimit = new Date()
  futureLimit.setDate(futureLimit.getDate() + 30)

  if (invoiceDate > futureLimit) {
    warnings.push({
      type: 'date',
      severity: 'warning',
      message: 'Invoice date is more than 30 days in the future',
      field: 'invoice_date'
    })
  }

  const pastLimit = new Date()
  pastLimit.setFullYear(pastLimit.getFullYear() - 2)

  if (invoiceDate < pastLimit) {
    warnings.push({
      type: 'date',
      severity: 'warning',
      message: 'Invoice date is more than 2 years old. May affect GST filing',
      field: 'invoice_date'
    })
  }

  return warnings
}

/**
 * Check if invoice requires approval based on amount or other criteria
 */
export function checkApprovalRequired(
  invoiceAmount: number,
  thresholds: {
    requireApprovalAbove?: number
    requireMultipleApprovalsAbove?: number
  } = {}
): {
  required: boolean
  levels: number
  reason?: string
} {
  const { requireApprovalAbove = 100000, requireMultipleApprovalsAbove = 500000 } = thresholds

  if (invoiceAmount > requireMultipleApprovalsAbove) {
    return {
      required: true,
      levels: 2,
      reason: `Invoice amount (₹${invoiceAmount.toLocaleString()}) exceeds ₹${requireMultipleApprovalsAbove.toLocaleString()} - requires 2-level approval`
    }
  }

  if (invoiceAmount > requireApprovalAbove) {
    return {
      required: true,
      levels: 1,
      reason: `Invoice amount (₹${invoiceAmount.toLocaleString()}) exceeds ₹${requireApprovalAbove.toLocaleString()} - requires approval`
    }
  }

  return {
    required: false,
    levels: 0
  }
}

// ============================================
// PROFORMA TO INVOICE CONVERSION
// ============================================

export interface ProformaConversionData {
  proforma_invoice_id: string
  convert_to_standard: boolean
  new_invoice_date?: string
  adjust_amounts?: boolean
}

/**
 * Validate proforma invoice before conversion
 */
export function validateProformaConversion(proforma: {
  status: string
  proforma_valid_until?: string
  total: number
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (proforma.status === 'converted') {
    errors.push('Proforma invoice has already been converted')
  }

  if (proforma.status === 'cancelled') {
    errors.push('Cannot convert cancelled proforma invoice')
  }

  if (proforma.proforma_valid_until) {
    const validUntil = new Date(proforma.proforma_valid_until)
    if (validUntil < new Date()) {
      errors.push('Proforma invoice has expired')
    }
  }

  if (proforma.total <= 0) {
    errors.push('Proforma invoice total must be greater than zero')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// ============================================
// FINANCIAL YEAR HELPERS
// ============================================

/**
 * Get current Indian financial year (April to March)
 */
export function getCurrentFinancialYear(): string {
  const now = new Date()
  const month = now.getMonth() + 1 // JavaScript months are 0-indexed
  const year = now.getFullYear()

  if (month >= 4) {
    // April onwards - current FY
    return `${year}-${(year + 1).toString().slice(2)}`
  } else {
    // Jan to March - previous FY
    return `${year - 1}-${year.toString().slice(2)}`
  }
}

/**
 * Get financial year for a specific date
 */
export function getFinancialYearForDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const month = d.getMonth() + 1
  const year = d.getFullYear()

  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(2)}`
  } else {
    return `${year - 1}-${year.toString().slice(2)}`
  }
}

/**
 * Format invoice number with financial year
 */
export function formatInvoiceNumber(
  prefix: string,
  number: number,
  options: {
    includeFinancialYear: boolean
    padding: number
    separator: string
  } = { includeFinancialYear: true, padding: 4, separator: '-' }
): string {
  const fy = getCurrentFinancialYear()
  const paddedNumber = number.toString().padStart(options.padding, '0')

  if (options.includeFinancialYear) {
    return `${prefix}${options.separator}${fy}${options.separator}${paddedNumber}`
  } else {
    return `${prefix}${options.separator}${paddedNumber}`
  }
}
