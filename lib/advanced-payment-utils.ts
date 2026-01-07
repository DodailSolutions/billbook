/**
 * Advanced Payment Utilities
 * Helper functions for UPI, QR codes, payment links, analytics
 */

import type { PaymentBehaviorAnalytics } from './advanced-payment-types'

// ============================================
// UPI UTILITIES
// ============================================

/**
 * Generate UPI intent string
 */
export function generateUPIIntent(data: {
  upi_id: string
  amount: number
  name: string
  transaction_ref: string
  note?: string
}): string {
  const intent = new URLSearchParams({
    pa: data.upi_id,
    pn: data.name,
    am: data.amount.toFixed(2),
    tr: data.transaction_ref,
    tn: data.note || `Payment for ${data.transaction_ref}`,
    cu: 'INR'
  })

  return `upi://pay?${intent.toString()}`
}

/**
 * Validate UPI ID format
 */
export function isValidUPIId(upiId: string): boolean {
  // Format: username@bankname
  const upiRegex = /^[\w.-]+@[\w.-]+$/
  return upiRegex.test(upiId)
}

/**
 * Extract bank name from UPI ID
 */
export function getBankFromUPIId(upiId: string): string {
  const parts = upiId.split('@')
  if (parts.length === 2) {
    return parts[1].toUpperCase()
  }
  return 'Unknown'
}

// ============================================
// INSTALLMENT CALCULATIONS
// ============================================

/**
 * Calculate installment amounts with equal distribution
 */
export function calculateInstallmentAmounts(
  totalAmount: number,
  numberOfInstallments: number
): number[] {
  const baseAmount = Math.floor(totalAmount / numberOfInstallments * 100) / 100
  const remainder = Math.round((totalAmount - baseAmount * numberOfInstallments) * 100) / 100
  
  const amounts: number[] = new Array(numberOfInstallments).fill(baseAmount)
  // Add remainder to last installment
  amounts[amounts.length - 1] = Math.round((amounts[amounts.length - 1] + remainder) * 100) / 100
  
  return amounts
}

/**
 * Generate installment schedule
 */
export function generateInstallmentSchedule(data: {
  startDate: Date
  numberOfInstallments: number
  frequency: 'weekly' | 'monthly' | 'quarterly'
}): Date[] {
  const dates: Date[] = []
  const frequencyDays = {
    weekly: 7,
    monthly: 30,
    quarterly: 90
  }[data.frequency]

  for (let i = 0; i < data.numberOfInstallments; i++) {
    const date = new Date(data.startDate)
    date.setDate(date.getDate() + (i * frequencyDays))
    dates.push(date)
  }

  return dates
}

/**
 * Calculate remaining installment balance
 */
export function calculateRemainingBalance(installments: Array<{
  amount: number
  paid_amount: number
  status: string
}>): number {
  return installments.reduce((sum, inst) => {
    if (inst.status !== 'paid') {
      return sum + (inst.amount - inst.paid_amount)
    }
    return sum
  }, 0)
}

// ============================================
// LATE FEE CALCULATIONS
// ============================================

/**
 * Calculate late fee based on configuration
 */
export function calculateLateFee(data: {
  amount: number
  dueDate: Date
  currentDate: Date
  gracePeriodDays: number
  feeType: 'percentage' | 'fixed'
  feeValue: number
  compoundDaily: boolean
  maxLateFee?: number
}): number {
  const daysOverdue = Math.max(
    0,
    Math.floor((data.currentDate.getTime() - data.dueDate.getTime()) / (1000 * 60 * 60 * 24)) - data.gracePeriodDays
  )

  if (daysOverdue <= 0) return 0

  let lateFee = 0

  if (data.feeType === 'percentage') {
    lateFee = data.amount * (data.feeValue / 100)
    if (data.compoundDaily) {
      lateFee *= daysOverdue
    }
  } else {
    lateFee = data.feeValue
    if (data.compoundDaily) {
      lateFee *= daysOverdue
    }
  }

  if (data.maxLateFee && lateFee > data.maxLateFee) {
    lateFee = data.maxLateFee
  }

  return Math.round(lateFee * 100) / 100
}

/**
 * Calculate tiered late fee
 */
export function calculateTieredLateFee(
  daysOverdue: number,
  tiers: Array<{ days: number; fee: number }>
): number {
  const sortedTiers = [...tiers].sort((a, b) => a.days - b.days)
  
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (daysOverdue >= sortedTiers[i].days) {
      return sortedTiers[i].fee
    }
  }
  
  return 0
}

// ============================================
// PAYMENT BEHAVIOR SCORING
// ============================================

/**
 * Calculate payment reliability score (0-100)
 */
export function calculateReliabilityScore(data: {
  totalInvoices: number
  paidInvoices: number
  overdueInvoices: number
  avgDelayDays: number
  failedPaymentCount: number
}): number {
  if (data.totalInvoices === 0) return 50 // Neutral for new customers

  let score = 100

  // Payment rate (40 points)
  const paymentRate = data.paidInvoices / data.totalInvoices
  score = paymentRate * 40

  // Delay penalty (30 points)
  const delayPenalty = Math.min(30, data.avgDelayDays * 2)
  score -= delayPenalty

  // Overdue penalty (20 points)
  const overdueRate = data.overdueInvoices / data.totalInvoices
  score -= overdueRate * 20

  // Failed payment penalty (10 points)
  const failedPenalty = Math.min(10, data.failedPaymentCount * 2)
  score -= failedPenalty

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Determine payment pattern
 */
export function determinePaymentPattern(avgDelayDays: number): string {
  if (avgDelayDays <= 0) return 'early_payer'
  if (avgDelayDays <= 3) return 'on_time'
  if (avgDelayDays <= 10) return 'occasional_late'
  if (avgDelayDays <= 30) return 'chronic_late'
  return 'defaulter'
}

/**
 * Determine risk category
 */
export function determineRiskCategory(score: number): 'low' | 'medium' | 'high' {
  if (score >= 80) return 'low'
  if (score >= 50) return 'medium'
  return 'high'
}

/**
 * Get risk color
 */
export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'green'
    case 'medium': return 'yellow'
    case 'high': return 'red'
    default: return 'gray'
  }
}

// ============================================
// PAYMENT LINK GENERATION
// ============================================

/**
 * Generate shortened payment link
 */
export function generateShortLink(fullUrl: string): string {
  // In production, use a URL shortening service
  // For now, create a simple hash
  const hash = Buffer.from(fullUrl).toString('base64').substring(0, 8)
  return `${process.env.NEXT_PUBLIC_APP_URL}/p/${hash}`
}

/**
 * Generate WhatsApp payment message
 */
export function generateWhatsAppPaymentMessage(data: {
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  paymentLink: string
}): string {
  return `Hi ${data.customerName}!

Your invoice *${data.invoiceNumber}* for ₹${data.amount.toLocaleString('en-IN')} is due on ${new Date(data.dueDate).toLocaleDateString('en-IN')}.

Pay now: ${data.paymentLink}

Thank you!`
}

/**
 * Generate SMS payment message
 */
export function generateSMSPaymentMessage(data: {
  invoiceNumber: string
  amount: number
  paymentLink: string
}): string {
  return `Payment due for invoice ${data.invoiceNumber}: Rs.${data.amount}. Pay: ${data.paymentLink}`
}

/**
 * Generate email payment message
 */
export function generateEmailPaymentMessage(data: {
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  paymentLink: string
  businessName: string
}): { subject: string; body: string } {
  return {
    subject: `Payment Reminder: Invoice ${data.invoiceNumber}`,
    body: `
      <p>Dear ${data.customerName},</p>
      
      <p>This is a friendly reminder that your payment for invoice <strong>${data.invoiceNumber}</strong> 
      is due on ${new Date(data.dueDate).toLocaleDateString('en-IN')}.</p>
      
      <p><strong>Amount Due:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
      
      <p><a href="${data.paymentLink}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a></p>
      
      <p>Thank you for your business!</p>
      
      <p>Best regards,<br>${data.businessName}</p>
    `
  }
}

// ============================================
// BANK RECONCILIATION MATCHING
// ============================================

/**
 * Calculate match confidence between transaction and invoice
 */
export function calculateMatchConfidence(transaction: {
  amount: number
  description?: string
  reference_number?: string
  transaction_date: string
}, invoice: {
  total: number
  invoice_number: string
  due_date: string
}): number {
  let confidence = 0

  // Amount match (60 points)
  const amountDiff = Math.abs(transaction.amount - invoice.total)
  if (amountDiff === 0) {
    confidence += 60
  } else if (amountDiff < 1) {
    confidence += 50
  } else if (amountDiff < 10) {
    confidence += 30
  }

  // Reference/description match (30 points)
  const description = (transaction.description || '').toLowerCase()
  const reference = (transaction.reference_number || '').toLowerCase()
  const invoiceNum = invoice.invoice_number.toLowerCase()

  if (description.includes(invoiceNum) || reference.includes(invoiceNum)) {
    confidence += 30
  } else if (description || reference) {
    confidence += 10
  }

  // Date proximity (10 points)
  const daysDiff = Math.abs(
    (new Date(transaction.transaction_date).getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysDiff <= 7) {
    confidence += 10
  } else if (daysDiff <= 30) {
    confidence += 5
  }

  return Math.min(100, confidence) / 100
}

/**
 * Find potential invoice matches for a transaction
 */
export function findPotentialMatches(
  transaction: { amount: number; description?: string; reference_number?: string },
  invoices: Array<{ id: string; invoice_number: string; total: number }>
): Array<{ invoice_id: string; confidence: number }> {
  return invoices
    .map(invoice => ({
      invoice_id: invoice.id,
      confidence: calculateMatchConfidence(
        { ...transaction, transaction_date: new Date().toISOString() },
        { ...invoice, due_date: new Date().toISOString() }
      )
    }))
    .filter(match => match.confidence > 0.3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
}

// ============================================
// PAYMENT RECOVERY STRATEGIES
// ============================================

/**
 * Determine retry strategy based on failure count
 */
export function getRetryStrategy(failureCount: number): {
  retryInHours: number
  shouldOffer: 'discount' | 'installment' | 'alternate_method' | null
} {
  if (failureCount === 0) {
    return { retryInHours: 24, shouldOffer: null }
  } else if (failureCount === 1) {
    return { retryInHours: 48, shouldOffer: 'alternate_method' }
  } else if (failureCount === 2) {
    return { retryInHours: 72, shouldOffer: 'installment' }
  } else {
    return { retryInHours: 168, shouldOffer: 'discount' }
  }
}

/**
 * Calculate recovery discount offer
 */
export function calculateRecoveryDiscount(
  amount: number,
  failureCount: number,
  daysOverdue: number
): number {
  // Offer 2-10% discount based on situation
  let discountPercent = 0

  if (failureCount >= 3) discountPercent += 3
  if (daysOverdue > 30) discountPercent += 2
  if (amount > 10000) discountPercent += 2

  discountPercent = Math.min(10, discountPercent)
  
  return Math.round(amount * (discountPercent / 100) * 100) / 100
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format currency in Indian format
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format days overdue
 */
export function formatDaysOverdue(days: number): string {
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day overdue'
  if (days > 1) return `${days} days overdue`
  if (days === -1) return '1 day remaining'
  return `${Math.abs(days)} days remaining`
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'green'
    case 'pending': return 'yellow'
    case 'overdue': return 'red'
    case 'cancelled': return 'gray'
    case 'failed': return 'red'
    default: return 'gray'
  }
}

// ============================================
// ANALYTICS HELPERS
// ============================================

/**
 * Calculate payment collection rate
 */
export function calculateCollectionRate(data: {
  totalInvoiced: number
  totalCollected: number
}): number {
  if (data.totalInvoiced === 0) return 0
  return Math.round((data.totalCollected / data.totalInvoiced) * 100)
}

/**
 * Calculate average collection period (DSO)
 */
export function calculateDSO(data: {
  totalReceivables: number
  totalRevenue: number
  periodDays: number
}): number {
  if (data.totalRevenue === 0) return 0
  return Math.round((data.totalReceivables / data.totalRevenue) * data.periodDays)
}

/**
 * Predict payment date based on customer behavior
 */
export function predictPaymentDate(
  analytics: PaymentBehaviorAnalytics,
  dueDate: Date
): Date {
  const avgDelay = analytics.avg_payment_delay_days || 0
  const predictedDate = new Date(dueDate)
  predictedDate.setDate(predictedDate.getDate() + Math.ceil(avgDelay))
  return predictedDate
}
