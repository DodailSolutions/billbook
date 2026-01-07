/**
 * Voice-to-Invoice Utilities
 * Client-side utilities for voice recognition and processing
 */

import type { 
  VoiceInvoiceConfig,
  VoiceParsedInvoiceData,
  VoiceParsedInvoiceItem,
  EntityExtraction 
} from './voice-invoice-types'

// ============================================
// SPEECH RECOGNITION SETUP
// ============================================

/**
 * Check if browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

/**
 * Get Speech Recognition API
 */
export function getSpeechRecognitionAPI(): BrowserSpeechRecognition | null {
  const SpeechRecognition = (window as typeof window & { 
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition 
  }).SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: new () => BrowserSpeechRecognition }).webkitSpeechRecognition
  return SpeechRecognition ? new SpeechRecognition() : null
}

interface BrowserSpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  onstart: ((ev: Event) => void) | null
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

/**
 * Initialize Speech Recognition with config
 */
export function initializeSpeechRecognition(config: VoiceInvoiceConfig) {
  const recognition = getSpeechRecognitionAPI()
  
  if (!recognition) {
    throw new Error('Speech Recognition not supported in this browser')
  }

  recognition.lang = config.language
  recognition.continuous = config.continuous
  recognition.interimResults = config.interimResults
  recognition.maxAlternatives = config.maxAlternatives

  return recognition
}

/**
 * Default voice invoice configuration
 */
export const defaultVoiceConfig: VoiceInvoiceConfig = {
  language: 'en-IN', // Indian English
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  autoSubmit: false,
  confirmationRequired: true
}

// ============================================
// TRANSCRIPT PROCESSING
// ============================================

/**
 * Clean and normalize transcript text
 */
export function normalizeTranscript(transcript: string): string {
  return transcript
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s₹$,.-]/g, '')
}

/**
 * Extract numbers from text (handles Indian numbering)
 */
export function extractNumbers(text: string): number[] {
  const patterns = [
    /₹\s*([0-9,]+\.?[0-9]*)/g, // Rupee symbol
    /rupees?\s*([0-9,]+\.?[0-9]*)/gi, // "rupees"
    /rs\.?\s*([0-9,]+\.?[0-9]*)/gi, // "Rs."
    /([0-9,]+\.?[0-9]*)\s*rupees?/gi, // Number before "rupees"
  ]

  const numbers: number[] = []
  
  patterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const numStr = match[1].replace(/,/g, '')
      const num = parseFloat(numStr)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  })

  return numbers
}

/**
 * Extract customer name from transcript
 */
export function extractCustomerName(transcript: string): string | null {
  const patterns = [
    /(?:customer|client|for)\s+(?:is\s+)?(?:named\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:invoice|bill)\s+for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:company|pvt|ltd|inc)/i
  ]

  for (const pattern of patterns) {
    const match = transcript.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return null
}

/**
 * Extract date from transcript
 */
export function extractDate(transcript: string): Date | null {
  const today = new Date()
  
  // Today
  if (/\btoday\b/i.test(transcript)) {
    return today
  }

  // Tomorrow
  if (/\btomorrow\b/i.test(transcript)) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  // Yesterday
  if (/\byesterday\b/i.test(transcript)) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  }

  // Specific dates: "15th January", "January 15", "15/01/2025"
  const datePatterns = [
    /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/
  ]

  for (const pattern of datePatterns) {
    const match = transcript.match(pattern)
    if (match) {
      // Parse based on pattern type
      try {
        if (match[3]) {
          // DD/MM/YYYY format
          const day = parseInt(match[1])
          const month = parseInt(match[2]) - 1
          let year = parseInt(match[3])
          if (year < 100) year += 2000
          return new Date(year, month, day)
        } else if (typeof match[2] === 'string' && isNaN(parseInt(match[2]))) {
          // DD Month format
          const day = parseInt(match[1])
          const month = new Date(Date.parse(match[2] + " 1, 2000")).getMonth()
          return new Date(today.getFullYear(), month, day)
        } else {
          // Month DD format
          const month = new Date(Date.parse(match[1] + " 1, 2000")).getMonth()
          const day = parseInt(match[2])
          return new Date(today.getFullYear(), month, day)
        }
      } catch {
        continue
      }
    }
  }

  return null
}

/**
 * Extract invoice items from transcript
 */
export function extractInvoiceItems(transcript: string): VoiceParsedInvoiceItem[] {
  const items: VoiceParsedInvoiceItem[] = []
  
  // Pattern: "quantity of item at price"
  // e.g., "5 laptops at 50000 rupees each"
  const itemPattern = /(\d+)\s+([a-z\s]+?)\s+(?:at|for|@)\s+(?:₹|rs\.?|rupees?)?\s*([0-9,]+\.?[0-9]*)\s*(?:each|per|rupees?)?/gi
  
  let match
  while ((match = itemPattern.exec(transcript)) !== null) {
    const quantity = parseInt(match[1])
    const description = match[2].trim()
    const unitPrice = parseFloat(match[3].replace(/,/g, ''))
    
    items.push({
      description,
      quantity,
      unit_price: unitPrice,
      amount: quantity * unitPrice
    })
  }

  // If no items found with pattern, try simple item description
  if (items.length === 0) {
    const simplePattern = /(?:for|item|product)\s+([a-z\s]{3,30})/gi
    const simpleMatch = simplePattern.exec(transcript)
    if (simpleMatch) {
      items.push({
        description: simpleMatch[1].trim(),
        quantity: 1,
        unit_price: 0,
        amount: 0
      })
    }
  }

  return items
}

/**
 * Extract GST information
 */
export function extractGSTInfo(transcript: string): { gst_percentage?: number; gstin?: string } {
  const result: { gst_percentage?: number; gstin?: string } = {}

  // GST percentage
  const gstPattern = /(?:gst|tax)\s+(?:of|@|is)?\s*(\d+)\s*(?:percent|%)/i
  const gstMatch = transcript.match(gstPattern)
  if (gstMatch) {
    result.gst_percentage = parseInt(gstMatch[1])
  }

  // GSTIN
  const gstinPattern = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1})\b/
  const gstinMatch = transcript.match(gstinPattern)
  if (gstinMatch) {
    result.gstin = gstinMatch[1]
  }

  return result
}

// ============================================
// NATURAL LANGUAGE PROCESSING
// ============================================

/**
 * Parse complete invoice from transcript using NLP
 */
export function parseInvoiceFromTranscript(transcript: string): Partial<VoiceParsedInvoiceData> {
  const invoiceData: Partial<VoiceParsedInvoiceData> = {
    items: []
  }

  // Extract customer
  const customerName = extractCustomerName(transcript)
  if (customerName) {
    invoiceData.customer_name = customerName
  }

  // Extract dates
  const date = extractDate(transcript)
  if (date) {
    invoiceData.invoice_date = date.toISOString().split('T')[0]
  }

  // Extract items
  const items = extractInvoiceItems(transcript)
  if (items.length > 0) {
    invoiceData.items = items
  }

  // Extract GST
  const gstInfo = extractGSTInfo(transcript)
  if (gstInfo.gst_percentage) {
    invoiceData.gst_percentage = gstInfo.gst_percentage
  }

  // Extract total
  const numbers = extractNumbers(transcript)
  if (numbers.length > 0) {
    // If we have items, the largest number is likely the total
    // Otherwise, use the first/only number
    if (items.length > 0) {
      invoiceData.total = Math.max(...numbers)
    } else {
      invoiceData.total = numbers[0]
    }
  }

  // Calculate subtotal if we have total and GST
  if (invoiceData.total && invoiceData.gst_percentage) {
    invoiceData.subtotal = invoiceData.total / (1 + invoiceData.gst_percentage / 100)
  }

  return invoiceData
}

/**
 * Identify command type from transcript
 */
export function identifyCommandType(transcript: string): string {
  const commandPatterns: Record<string, RegExp> = {
    create_invoice: /\b(create|new|make|generate)\s+(invoice|bill)\b/,
    add_item: /\b(add|include|put)\s+(item|product|service)\b/,
    update_customer: /\b(change|update|modify)\s+customer\b/,
    set_date: /\b(date|dated|on)\b/,
    set_amount: /\b(amount|total|price)\b/,
    add_note: /\b(note|remark|comment)\b/,
    apply_discount: /\b(discount|off|reduction)\b/,
    finalize_invoice: /\b(finish|finalize|complete|done|submit)\b/,
    cancel_invoice: /\b(cancel|discard|delete|remove)\b/
  }

  for (const [type, pattern] of Object.entries(commandPatterns)) {
    if (pattern.test(transcript.toLowerCase())) {
      return type
    }
  }

  return 'create_invoice' // Default
}

/**
 * Extract entities from transcript
 */
export function extractEntities(transcript: string): EntityExtraction[] {
  const entities: EntityExtraction[] = []
  
  // Customer names
  const customerMatch = transcript.match(/(?:customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  if (customerMatch) {
    entities.push({
      entity_type: 'customer_name',
      value: customerMatch[1],
      confidence: 0.8,
      position: {
        start: customerMatch.index || 0,
        end: (customerMatch.index || 0) + customerMatch[0].length
      }
    })
  }

  // Amounts
  const amounts = extractNumbers(transcript)
  amounts.forEach(amount => {
    entities.push({
      entity_type: 'amount',
      value: amount.toString(),
      confidence: 0.9,
      position: { start: 0, end: 0 } // Would need full text analysis for exact position
    })
  })

  // Dates
  const date = extractDate(transcript)
  if (date) {
    entities.push({
      entity_type: 'date',
      value: date.toISOString().split('T')[0],
      confidence: 0.85,
      position: { start: 0, end: 0 }
    })
  }

  return entities
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate parsed invoice data
 */
export function validateParsedInvoice(data: Partial<VoiceParsedInvoiceData>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.customer_name && !data.customer_id) {
    errors.push('Customer name or ID is required')
  }

  if (!data.items || data.items.length === 0) {
    errors.push('At least one invoice item is required')
  }

  if (!data.total && !data.subtotal) {
    errors.push('Invoice total or subtotal is required')
  }

  // Warnings
  if (!data.invoice_date) {
    warnings.push('Invoice date not specified, will use today\'s date')
  }

  if (!data.gst_percentage) {
    warnings.push('GST percentage not specified, will use default 18%')
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.description) {
        errors.push(`Item ${index + 1} is missing description`)
      }
      if (!item.unit_price || item.unit_price === 0) {
        warnings.push(`Item ${index + 1} has no price specified`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================
// FORMATTING
// ============================================

/**
 * Format transcript for display
 */
export function formatTranscript(transcript: string, highlight: boolean = false): string {
  if (!highlight) {
    return transcript
  }

  // Highlight entities
  let formatted = transcript
  
  // Highlight amounts in bold
  formatted = formatted.replace(/(₹\s*[0-9,]+\.?[0-9]*)/g, '<strong>$1</strong>')
  
  // Highlight customer names (capitalized words)
  formatted = formatted.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, '<em>$1</em>')
  
  return formatted
}

/**
 * Generate voice command suggestions
 */
export function getVoiceCommandSuggestions(): string[] {
  return [
    'Create invoice for ABC Company for 50000 rupees',
    'New invoice for John Smith, 5 laptops at 45000 each, GST 18%',
    'Make bill for XYZ Ltd dated today for 25000',
    'Invoice for Acme Corp, consulting services 100000, date 15th January',
    'Generate invoice, customer Tech Solutions, amount 75000 plus GST',
    'Create bill, 3 licenses at 20000 rupees each for Beta Industries'
  ]
}
