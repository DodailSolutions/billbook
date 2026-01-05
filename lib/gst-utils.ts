/**
 * GST Utilities for Indian Tax Compliance
 * Includes CGST, SGST, IGST calculations, GSTIN validation, HSN/SAC codes, and reverse charge mechanism
 */

// Standard GST rates in India
export const GST_RATES = {
  '0%': 0,
  '5%': 5,
  '12%': 12,
  '18%': 18,
  '28%': 28
} as const

// HSN/SAC Code Categories
export const HSN_SAC_CATEGORIES = {
  'services': {
    code: 'SAC',
    description: 'Service Accounting Code',
    examples: [
      { code: '9965', description: 'Professional Services' },
      { code: '9967', description: 'Business Support Services' },
      { code: '9988', description: 'IT Services' },
      { code: '9989', description: 'Temporary Staff Services' }
    ]
  },
  'goods': {
    code: 'HSN',
    description: 'Harmonized System Nomenclature',
    examples: [
      { code: '8517', description: 'Electrical Machinery' },
      { code: '3004', description: 'Pharmaceutical Products' },
      { code: '6204', description: 'Women Clothing' },
      { code: '7326', description: 'Iron or Steel Articles' }
    ]
  }
} as const

/**
 * Calculate CGST, SGST, and IGST based on supply type
 * @param amount - The taxable amount
 * @param gstRate - GST rate percentage
 * @param supplyType - Type of supply: 'intra-state' (SGST+CGST) or 'inter-state' (IGST)
 * @returns Object containing CGST, SGST, IGST amounts and total tax
 */
export function calculateGSTComponents(
  amount: number,
  gstRate: number,
  supplyType: 'intra-state' | 'inter-state' = 'intra-state'
): {
  cgst: number
  sgst: number
  igst: number
  totalTax: number
  totalAmount: number
} {
  const roundedAmount = Math.round(amount * 100) / 100

  if (supplyType === 'intra-state') {
    // For intra-state supply: CGST + SGST = Total GST
    const halfRate = gstRate / 2
    const cgst = Math.round((roundedAmount * halfRate) / 100 * 100) / 100
    const sgst = Math.round((roundedAmount * halfRate) / 100 * 100) / 100
    const totalTax = cgst + sgst

    return {
      cgst,
      sgst,
      igst: 0,
      totalTax,
      totalAmount: roundedAmount + totalTax
    }
  } else {
    // For inter-state supply: IGST only
    const igst = Math.round((roundedAmount * gstRate) / 100 * 100) / 100

    return {
      cgst: 0,
      sgst: 0,
      igst,
      totalTax: igst,
      totalAmount: roundedAmount + igst
    }
  }
}

/**
 * Validate GSTIN (Goods and Services Tax Identification Number)
 * GSTIN format: 2-digit state code + 10-digit PAN + 1-digit entity code + 1-digit check digit
 * Total: 15 characters
 * @param gstin - The GSTIN to validate
 * @returns Object with validation result and error message
 */
export function validateGSTIN(gstin: string): {
  isValid: boolean
  error?: string
} {
  // Remove spaces and convert to uppercase
  const cleanGSTIN = gstin.trim().toUpperCase()

  // Check length
  if (cleanGSTIN.length !== 15) {
    return {
      isValid: false,
      error: 'GSTIN must be 15 characters long'
    }
  }

  // Check format: 2 digits, 10 alphanumeric (PAN), 1 digit (Z), 1 letter (entity), 1 digit (check)
  const gstinPattern = /^[0-9]{2}[A-Z0-9]{13}[A-Z0-9]$/
  if (!gstinPattern.test(cleanGSTIN)) {
    return {
      isValid: false,
      error: 'GSTIN format is invalid. Expected: 2 digits + 10 character PAN + 1 digit + 1 letter + 1 check digit'
    }
  }

  // Validate state code (first 2 digits)
  const stateCode = parseInt(cleanGSTIN.substring(0, 2))
  if (stateCode < 1 || stateCode > 37) {
    return {
      isValid: false,
      error: 'Invalid state code in GSTIN'
    }
  }

  // Validate check digit using Luhn algorithm
  if (!isValidCheckDigit(cleanGSTIN)) {
    return {
      isValid: false,
      error: 'GSTIN check digit is invalid'
    }
  }

  return { isValid: true }
}

/**
 * Validate GSTIN check digit using Luhn algorithm
 * @param gstin - The 15-character GSTIN
 * @returns Boolean indicating validity
 */
function isValidCheckDigit(gstin: string): boolean {
  const factor = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  const total = gstin.substring(0, 14)
    .split('')
    .map((char, idx) => {
      const digit = parseInt(char, 36)
      const product = digit * factor[idx]
      return product > 9 ? Math.floor(product / 10) + (product % 10) : product
    })
    .reduce((sum, val) => sum + val, 0)

  const checkDigit = (10 - (total % 10)) % 10
  return checkDigit === parseInt(gstin[14], 36)
}

/**
 * Get all Indian states and their GST state codes
 */
export const GST_STATE_CODES = {
  '01': 'Andaman and Nicobar Islands',
  '02': 'Andhra Pradesh',
  '03': 'Arunachal Pradesh',
  '04': 'Assam',
  '05': 'Bihar',
  '06': 'Chhattisgarh',
  '07': 'Dadra and Nagar Haveli',
  '08': 'Daman and Diu',
  '09': 'Delhi',
  '10': 'Goa',
  '11': 'Gujarat',
  '12': 'Haryana',
  '13': 'Himachal Pradesh',
  '14': 'Jharkhand',
  '15': 'Karnataka',
  '16': 'Kerala',
  '17': 'Ladakh',
  '18': 'Lakshadweep',
  '19': 'Madhya Pradesh',
  '20': 'Maharashtra',
  '21': 'Manipur',
  '22': 'Meghalaya',
  '23': 'Mizoram',
  '24': 'Nagaland',
  '25': 'Odisha',
  '26': 'Puducherry',
  '27': 'Punjab',
  '28': 'Rajasthan',
  '29': 'Sikkim',
  '30': 'Tamil Nadu',
  '31': 'Telangana',
  '32': 'Tripura',
  '33': 'Uttar Pradesh',
  '34': 'Uttarakhand',
  '35': 'West Bengal',
  '36': 'Other Territory',
  '37': 'Unassigned'
} as const

/**
 * Extract state information from GSTIN
 */
export function extractStateFromGSTIN(gstin: string): {
  stateCode: string
  stateName: string
} {
  const stateCode = gstin.substring(0, 2)
  const stateName = GST_STATE_CODES[stateCode as keyof typeof GST_STATE_CODES] || 'Unknown'
  return { stateCode, stateName }
}

/**
 * Reverse Charge Mechanism (RCM)
 * RCM is applicable when:
 * 1. Recipient is a registered taxpayer
 * 2. Supplier is not registered (or supply is outside GST ambit)
 * 3. Specific categories of services are supplied
 * 
 * Under RCM, the recipient (and not the supplier) becomes liable to pay GST
 */
export interface ReverseChargeDetails {
  applicable: boolean
  reason?: string
  notes?: string
}

/**
 * Determine if reverse charge mechanism is applicable
 * Categories where RCM is applicable:
 * - Unregistered suppliers (below threshold)
 * - Import of services from non-GST jurisdiction
 * - Supplies of specific services like construction, renting of immovable property
 */
export function checkReverseCharge(
  supplierGSTIN: string | null,
  supplierState: string,
  recipientGSTIN: string,
  serviceCategory?: string
): ReverseChargeDetails {
  // RCM applies when supplier is not registered or outside GST
  if (!supplierGSTIN || supplierGSTIN.trim() === '') {
    return {
      applicable: true,
      reason: 'Supplier is unregistered',
      notes: 'Recipient is liable to pay GST under Reverse Charge Mechanism'
    }
  }

  // RCM for inter-state supplies from unregistered suppliers
  const supplierStateCode = supplierGSTIN.substring(0, 2)
  const recipientStateCode = recipientGSTIN.substring(0, 2)

  if (supplierStateCode !== recipientStateCode) {
    // Check if supplier is registered in their state
    if (supplierGSTIN === '') {
      return {
        applicable: true,
        reason: 'Inter-state supply from unregistered supplier',
        notes: 'Recipient is liable to pay GST under Reverse Charge Mechanism'
      }
    }
  }

  // RCM for specific service categories
  const rcmServiceCategories = [
    'construction',
    'renting',
    'immovable_property',
    'transportation'
  ]

  if (serviceCategory && rcmServiceCategories.includes(serviceCategory.toLowerCase())) {
    // Check if conditions for RCM are met
    if (!supplierGSTIN) {
      return {
        applicable: true,
        reason: `RCM applicable for ${serviceCategory} services from unregistered supplier`,
        notes: 'Recipient is liable to pay GST under Reverse Charge Mechanism'
      }
    }
  }

  return {
    applicable: false
  }
}

/**
 * Format currency with proper rupee symbol
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Validate HSN/SAC code format
 * HSN: 6 digits for goods
 * SAC: 6 digits for services
 */
export function validateHSNSAC(code: string, type: 'HSN' | 'SAC'): {
  isValid: boolean
  error?: string
} {
  if (!code || code.trim().length === 0) {
    return {
      isValid: true // Optional field
    }
  }

  const cleanCode = code.trim()

  // Both HSN and SAC should be numeric and 4 or 6 digits
  if (!/^\d{4,6}$/.test(cleanCode)) {
    return {
      isValid: false,
      error: `${type} code must be 4 or 6 digits`
    }
  }

  return { isValid: true }
}

/**
 * Get applicable GST rate for a product/service based on HSN/SAC
 * This is a simplified version - actual rates depend on product classification
 */
export function getApplicableGSTRate(hsnSacCode: string): number {
  // This is a simplified implementation
  // In production, this should query a comprehensive HSN/SAC rate database
  const code = hsnSacCode.substring(0, 2)

  const rateMap: Record<string, number> = {
    '01': 0,      // Agricultural products
    '03': 5,      // Cereals
    '04': 5,      // Dairy products
    '05': 12,     // Meat and fish
    '06': 5,      // Sugar
    '07': 5,      // Mineral products
    '08': 5,      // Ceramics
    '10': 5,      // Plastics
    '12': 12,     // Footwear
    '15': 18,     // Base metals
    '17': 18,     // Machinery
    '18': 5,      // Instruments
    '19': 18,     // Arms
    '20': 5,      // Miscellaneous
    '82': 18,     // Tools
    '85': 5,      // Electrical machinery
    '87': 5,      // Vehicles
    '88': 18,     // Aircraft
    '89': 18,     // Ships
    '90': 18,     // Optical instruments
    '94': 18,     // Furniture
    '96': 18,     // Miscellaneous articles
    '99': 18      // Other services
  }

  return rateMap[code] || 18 // Default to 18% if not found
}

/**
 * Calculate tax summary for compliance reporting
 */
export interface TaxSummary {
  subtotal: number
  cgst: number
  sgst: number
  igst: number
  totalTax: number
  totalAmount: number
  effectiveRate: number
}

export function calculateTaxSummary(
  subtotal: number,
  gstRate: number,
  supplyType: 'intra-state' | 'inter-state' = 'intra-state'
): TaxSummary {
  const gst = calculateGSTComponents(subtotal, gstRate, supplyType)
  const effectiveRate = (gst.totalTax / subtotal) * 100

  return {
    subtotal,
    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    totalTax: gst.totalTax,
    totalAmount: gst.totalAmount,
    effectiveRate: Math.round(effectiveRate * 100) / 100
  }
}
