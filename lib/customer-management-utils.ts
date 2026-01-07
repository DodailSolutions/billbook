/**
 * Customer Management Advanced Features - Utility Functions
 * Helper functions for calculations, formatting, and analytics
 */

import type {
  CustomerAgingAnalysis,
  AgingBucket,
  RiskCategory,
  CreditLimitAnalytics,
  AgingAnalytics,
  DocumentType
} from './customer-management-types'

// =====================================================
// CREDIT LIMIT UTILITIES
// =====================================================

/**
 * Calculate credit utilization percentage
 */
export function calculateCreditUtilization(
  creditUsed: number,
  creditLimit: number
): number {
  if (creditLimit === 0) return 0
  return Math.round((creditUsed / creditLimit) * 100 * 100) / 100
}

/**
 * Determine credit status color
 */
export function getCreditStatusColor(utilizationPercentage: number): string {
  if (utilizationPercentage >= 100) return 'text-red-600'
  if (utilizationPercentage >= 80) return 'text-orange-600'
  if (utilizationPercentage >= 60) return 'text-yellow-600'
  return 'text-green-600'
}

/**
 * Get credit status label
 */
export function getCreditStatusLabel(utilizationPercentage: number): string {
  if (utilizationPercentage >= 100) return 'Limit Exceeded'
  if (utilizationPercentage >= 80) return 'Near Limit'
  if (utilizationPercentage >= 60) return 'Moderate Usage'
  return 'Low Usage'
}

/**
 * Format credit limit for display
 */
export function formatCreditLimit(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

// =====================================================
// AGING & RISK SCORE UTILITIES
// =====================================================

/**
 * Get aging buckets from analysis
 */
export function getAgingBuckets(analysis: CustomerAgingAnalysis): AgingBucket[] {
  const total = analysis.total_outstanding

  return [
    {
      label: 'Current',
      days_range: '0-30 days',
      amount: analysis.current_amount,
      percentage: total > 0 ? (analysis.current_amount / total) * 100 : 0,
      invoice_count: 0
    },
    {
      label: '31-60 Days',
      days_range: '31-60 days',
      amount: analysis.days_30_amount,
      percentage: total > 0 ? (analysis.days_30_amount / total) * 100 : 0,
      invoice_count: 0
    },
    {
      label: '61-90 Days',
      days_range: '61-90 days',
      amount: analysis.days_60_amount,
      percentage: total > 0 ? (analysis.days_60_amount / total) * 100 : 0,
      invoice_count: 0
    },
    {
      label: '91-120 Days',
      days_range: '91-120 days',
      amount: analysis.days_90_amount,
      percentage: total > 0 ? (analysis.days_90_amount / total) * 100 : 0,
      invoice_count: 0
    },
    {
      label: '120+ Days',
      days_range: '120+ days',
      amount: analysis.days_120_plus_amount,
      percentage: total > 0 ? (analysis.days_120_plus_amount / total) * 100 : 0,
      invoice_count: 0
    }
  ]
}

/**
 * Get risk category color
 */
export function getRiskCategoryColor(category: RiskCategory): string {
  switch (category) {
    case 'low':
      return 'text-green-600 bg-green-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'high':
      return 'text-orange-600 bg-orange-50'
    case 'critical':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Get risk score color (for numeric display)
 */
export function getRiskScoreColor(score: number): string {
  if (score >= 75) return 'text-red-600'
  if (score >= 50) return 'text-orange-600'
  if (score >= 25) return 'text-yellow-600'
  return 'text-green-600'
}

/**
 * Get reliability score color
 */
export function getReliabilityScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Generate risk recommendation
 */
export function getRiskRecommendation(
  riskCategory: RiskCategory,
  overdue_count: number,
  average_days_to_pay: number
): string {
  switch (riskCategory) {
    case 'low':
      return 'Customer has excellent payment history. Continue current terms.'
    case 'medium':
      return 'Monitor payment patterns. Consider friendly payment reminders.'
    case 'high':
      return `Customer has ${overdue_count} overdue invoice(s). Send payment reminders and consider reducing credit limit.`
    case 'critical':
      return `URGENT: Customer has ${overdue_count} overdue invoice(s) averaging ${Math.round(average_days_to_pay)} days late. Consider suspending credit and demanding immediate payment.`
    default:
      return 'Insufficient data for recommendation.'
  }
}

/**
 * Calculate Days Sales Outstanding (DSO)
 */
export function calculateDSO(
  totalReceivables: number,
  totalSales: number,
  numberOfDays: number = 365
): number {
  if (totalSales === 0) return 0
  return Math.round((totalReceivables / totalSales) * numberOfDays)
}

/**
 * Calculate collection effectiveness index (CEI)
 */
export function calculateCEI(
  beginningReceivables: number,
  sales: number,
  endingReceivables: number
): number {
  const denominator = beginningReceivables + sales - endingReceivables
  if (denominator === 0) return 100
  
  const cei = ((beginningReceivables + sales - endingReceivables) / 
                (beginningReceivables + sales)) * 100
  
  return Math.round(cei * 100) / 100
}

// =====================================================
// VENDOR & PAYABLES UTILITIES
// =====================================================

/**
 * Calculate vendor payment score (0-100)
 * Based on payment history and timeliness
 */
export function calculateVendorPaymentScore(
  totalBills: number,
  paidOnTime: number,
  averageDelayDays: number
): number {
  if (totalBills === 0) return 100

  const timelinessScore = (paidOnTime / totalBills) * 60
  const delayPenalty = Math.min(averageDelayDays * 2, 40)
  
  return Math.max(0, Math.min(100, timelinessScore + (40 - delayPenalty)))
}

/**
 * Calculate payable days outstanding (PDO)
 */
export function calculatePDO(
  totalPayables: number,
  totalPurchases: number,
  numberOfDays: number = 365
): number {
  if (totalPurchases === 0) return 0
  return Math.round((totalPayables / totalPurchases) * numberOfDays)
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-50'
    case 'unpaid':
      return 'text-yellow-600 bg-yellow-50'
    case 'partially_paid':
      return 'text-blue-600 bg-blue-50'
    case 'overdue':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Calculate days until/past due date
 */
export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get overdue status label
 */
export function getOverdueLabel(daysOverdue: number): string {
  if (daysOverdue <= 0) return 'Not overdue'
  if (daysOverdue <= 7) return `${daysOverdue} days overdue`
  if (daysOverdue <= 30) return `${daysOverdue} days overdue`
  if (daysOverdue <= 60) return `${Math.floor(daysOverdue / 30)} month(s) overdue`
  return `${Math.floor(daysOverdue / 30)} months overdue (CRITICAL)`
}

// =====================================================
// GST SUMMARY UTILITIES
// =====================================================

/**
 * Calculate GST tax rate summary
 */
export function aggregateGSTByRate(
  gstRateBreakdown: Array<{
    gst_rate: number
    taxable_value: number
    gst_amount: number
  }>
): Array<{ rate: number; value: number; tax: number; percentage: number }> {
  const totalValue = gstRateBreakdown.reduce((sum, item) => sum + item.taxable_value, 0)

  return gstRateBreakdown.map(item => ({
    rate: item.gst_rate,
    value: item.taxable_value,
    tax: item.gst_amount,
    percentage: totalValue > 0 ? (item.taxable_value / totalValue) * 100 : 0
  }))
}

/**
 * Calculate effective GST rate
 */
export function calculateEffectiveGSTRate(
  totalTaxableValue: number,
  totalGST: number
): number {
  if (totalTaxableValue === 0) return 0
  return Math.round((totalGST / totalTaxableValue) * 100 * 100) / 100
}

/**
 * Format GST summary for export
 */
export function formatGSTSummaryForExport(summary: {
  total_invoices: number
  total_taxable_value: number
  total_cgst: number
  total_sgst: number
  total_igst: number
  intra_state_value: number
  inter_state_value: number
}) {
  return {
    'Total Invoices': summary.total_invoices,
    'Taxable Value': formatIndianCurrency(summary.total_taxable_value),
    'CGST': formatIndianCurrency(summary.total_cgst),
    'SGST': formatIndianCurrency(summary.total_sgst),
    'IGST': formatIndianCurrency(summary.total_igst),
    'Total GST': formatIndianCurrency(
      summary.total_cgst + summary.total_sgst + summary.total_igst
    ),
    'Intra-State': formatIndianCurrency(summary.intra_state_value),
    'Inter-State': formatIndianCurrency(summary.inter_state_value)
  }
}

// =====================================================
// DOCUMENT VAULT UTILITIES
// =====================================================

/**
 * Get document type label
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    contract: 'Contract',
    pan: 'PAN Card',
    gst_certificate: 'GST Certificate',
    agreement: 'Agreement',
    msme: 'MSME Certificate',
    other: 'Other'
  }
  return labels[type] || type
}

/**
 * Get document type icon
 */
export function getDocumentTypeIcon(type: DocumentType): string {
  const icons: Record<DocumentType, string> = {
    contract: '📄',
    pan: '🆔',
    gst_certificate: '📋',
    agreement: '📝',
    msme: '🏢',
    other: '📎'
  }
  return icons[type] || '📄'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if document is expiring soon
 */
export function isDocumentExpiringSoon(
  expiryDate: string,
  daysThreshold: number = 30
): boolean {
  if (!expiryDate) return false
  
  const expiry = new Date(expiryDate)
  const today = new Date()
  const threshold = new Date()
  threshold.setDate(today.getDate() + daysThreshold)
  
  return expiry >= today && expiry <= threshold
}

/**
 * Get document status
 */
export function getDocumentStatus(
  isExpired: boolean,
  expiryDate?: string,
  isVerified?: boolean
): {
  label: string
  color: string
  urgent: boolean
} {
  if (isExpired) {
    return { label: 'Expired', color: 'text-red-600 bg-red-50', urgent: true }
  }
  
  if (expiryDate && isDocumentExpiringSoon(expiryDate, 30)) {
    return { label: 'Expiring Soon', color: 'text-orange-600 bg-orange-50', urgent: true }
  }
  
  if (!isVerified) {
    return { label: 'Unverified', color: 'text-yellow-600 bg-yellow-50', urgent: false }
  }
  
  return { label: 'Active', color: 'text-green-600 bg-green-50', urgent: false }
}

// =====================================================
// ANALYTICS & DASHBOARD UTILITIES
// =====================================================

/**
 * Calculate credit limit analytics
 */
export function calculateCreditLimitAnalytics(
  customers: Array<{
    credit_limit: number
    credit_used: number
    credit_limit_enabled: boolean
    credit_limit_exceeded: boolean
    credit_utilization_percentage: number
    name: string
    credit_available: number | null
  }>
): CreditLimitAnalytics {
  const withLimit = customers.filter(c => c.credit_limit_enabled)
  const totalExtended = withLimit.reduce((sum, c) => sum + c.credit_limit, 0)
  const totalUsed = withLimit.reduce((sum, c) => sum + c.credit_used, 0)
  const exceeded = withLimit.filter(c => c.credit_limit_exceeded)
  const nearLimit = withLimit
    .filter(c => !c.credit_limit_exceeded && c.credit_utilization_percentage >= 80)
    .map(c => ({
      customer_name: c.name,
      utilization_percentage: c.credit_utilization_percentage,
      available_credit: c.credit_available || 0
    }))
    .sort((a, b) => b.utilization_percentage - a.utilization_percentage)
    .slice(0, 10)

  return {
    total_customers_with_limit: withLimit.length,
    total_credit_extended: totalExtended,
    total_credit_used: totalUsed,
    average_utilization: withLimit.length > 0 
      ? totalUsed / totalExtended * 100 
      : 0,
    exceeded_limit_count: exceeded.length,
    exceeded_limit_amount: exceeded.reduce((sum, c) => sum + (c.credit_used - c.credit_limit), 0),
    customers_near_limit: nearLimit
  }
}

/**
 * Calculate aging analytics
 */
export function calculateAgingAnalytics(
  agingData: CustomerAgingAnalysis[]
): AgingAnalytics {
  const totalOutstanding = agingData.reduce((sum, a) => sum + a.total_outstanding, 0)
  const withOutstanding = agingData.filter(a => a.total_outstanding > 0)

  const riskDistribution = {
    low: agingData.filter(a => a.risk_category === 'low').length,
    medium: agingData.filter(a => a.risk_category === 'medium').length,
    high: agingData.filter(a => a.risk_category === 'high').length,
    critical: agingData.filter(a => a.risk_category === 'critical').length
  }

  const topRisky = agingData
    .filter(a => a.total_outstanding > 0)
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10)
    .map(a => ({
      customer_id: a.customer_id,
      customer_name: '', // Would need to join with customers
      risk_score: a.risk_score,
      risk_category: a.risk_category,
      reliability_score: a.payment_reliability_score,
      total_outstanding: a.total_outstanding,
      overdue_count: a.overdue_count,
      average_delay_days: a.average_days_to_pay,
      recommendation: getRiskRecommendation(
        a.risk_category,
        a.overdue_count,
        a.average_days_to_pay
      )
    }))

  return {
    total_outstanding: totalOutstanding,
    customers_with_outstanding: withOutstanding.length,
    aging_distribution: {
      current: agingData.reduce((sum, a) => sum + a.current_amount, 0),
      days_30: agingData.reduce((sum, a) => sum + a.days_30_amount, 0),
      days_60: agingData.reduce((sum, a) => sum + a.days_60_amount, 0),
      days_90: agingData.reduce((sum, a) => sum + a.days_90_amount, 0),
      days_120_plus: agingData.reduce((sum, a) => sum + a.days_120_plus_amount, 0)
    },
    risk_distribution: riskDistribution,
    top_risky_customers: topRisky
  }
}

// =====================================================
// FORMATTING UTILITIES
// =====================================================

/**
 * Format Indian currency
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Get current financial year
 */
export function getCurrentFinancialYear(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  if (month >= 4) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

/**
 * Get financial year options for dropdown
 */
export function getFinancialYearOptions(yearsBack: number = 5): string[] {
  const options: string[] = []
  const currentFY = getCurrentFinancialYear()
  const [startYear] = currentFY.split('-').map(Number)

  for (let i = 0; i < yearsBack; i++) {
    const year = startYear - i
    options.push(`${year}-${year + 1}`)
  }

  return options
}

/**
 * Parse financial year to date range
 */
export function getFinancialYearDateRange(financialYear: string): {
  start: Date
  end: Date
} {
  const [startYear, endYear] = financialYear.split('-').map(Number)
  
  return {
    start: new Date(startYear, 3, 1), // April 1st
    end: new Date(endYear, 2, 31)     // March 31st
  }
}

/**
 * Export data as CSV
 */
export function exportToCSV(
  data: Record<string, string | number>[],
  filename: string
): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
