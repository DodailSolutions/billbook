/**
 * GST Advanced Features - Utility Functions
 * Helper functions for calculations, formatting, and validations
 */

import type {
  HealthGrade,
  TransportMode
} from './gst-advanced-types'

// =====================================================
// TAX PERIOD UTILITIES
// =====================================================

/**
 * Get current tax period in MMYYYY format
 */
export function getCurrentTaxPeriod(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${month}${year}`
}

/**
 * Get previous tax period
 */
export function getPreviousTaxPeriod(taxPeriod: string): string {
  const month = parseInt(taxPeriod.slice(0, 2))
  const year = parseInt(taxPeriod.slice(2, 6))
  
  if (month === 1) {
    return `12${year - 1}`
  }
  return `${String(month - 1).padStart(2, '0')}${year}`
}

/**
 * Format tax period for display
 */
export function formatTaxPeriod(taxPeriod: string): string {
  const month = parseInt(taxPeriod.slice(0, 2))
  const year = taxPeriod.slice(2, 6)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${monthNames[month - 1]} ${year}`
}

/**
 * Get financial year from tax period
 */
export function getFinancialYear(taxPeriod: string): string {
  const month = parseInt(taxPeriod.slice(0, 2))
  const year = parseInt(taxPeriod.slice(2, 6))
  
  if (month >= 4) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

/**
 * Get tax periods for a financial year
 */
export function getTaxPeriodsForFY(financialYear: string): string[] {
  const [startYear, endYear] = financialYear.split('-').map(Number)
  const periods: string[] = []
  
  // Apr to Dec of first year
  for (let month = 4; month <= 12; month++) {
    periods.push(`${String(month).padStart(2, '0')}${startYear}`)
  }
  
  // Jan to Mar of second year
  for (let month = 1; month <= 3; month++) {
    periods.push(`${String(month).padStart(2, '0')}${endYear}`)
  }
  
  return periods
}

// =====================================================
// HEALTH SCORE UTILITIES
// =====================================================

/**
 * Get health grade color
 */
export function getHealthGradeColor(grade: HealthGrade): string {
  const colors: Record<HealthGrade, string> = {
    'A+': 'text-green-600 bg-green-50',
    'A': 'text-green-600 bg-green-50',
    'B': 'text-blue-600 bg-blue-50',
    'C': 'text-yellow-600 bg-yellow-50',
    'D': 'text-orange-600 bg-orange-50',
    'F': 'text-red-600 bg-red-50'
  }
  return colors[grade]
}

/**
 * Get health score badge color
 */
export function getHealthScoreBadgeColor(score: number): string {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 50) return 'bg-yellow-500'
  if (score >= 35) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50'
  }
  return colors[riskLevel] || 'text-gray-600 bg-gray-50'
}

/**
 * Calculate health score from components
 */
export function calculateOverallHealthScore(
  filingScore: number,
  accuracyScore: number,
  documentationScore: number,
  itcScore: number = 100
): number {
  return (
    filingScore * 0.40 +
    accuracyScore * 0.30 +
    documentationScore * 0.20 +
    itcScore * 0.10
  )
}

// =====================================================
// ALERT SEVERITY UTILITIES
// =====================================================

/**
 * Get alert severity color
 */
export function getAlertSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'text-blue-600 bg-blue-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50'
  }
  return colors[severity] || 'text-gray-600 bg-gray-50'
}

/**
 * Get alert severity icon
 */
export function getAlertSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    low: '✓',
    medium: '⚠',
    high: '⚠⚠',
    critical: '🚨'
  }
  return icons[severity] || 'ℹ'
}

// =====================================================
// E-WAY BILL UTILITIES
// =====================================================

/**
 * Calculate E-Way Bill validity in days
 */
export function calculateEWayBillValidityDays(distanceKm: number): number {
  // Standard formula: 1 day per 100 km
  return Math.max(1, Math.ceil(distanceKm / 100))
}

/**
 * Check if E-Way Bill is expiring soon (within 24 hours)
 */
export function isEWayBillExpiringSoon(validUntil: string): boolean {
  const expiry = new Date(validUntil)
  const now = new Date()
  const hoursRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursRemaining <= 24 && hoursRemaining > 0
}

/**
 * Check if E-Way Bill is expired
 */
export function isEWayBillExpired(validUntil: string): boolean {
  return new Date(validUntil) < new Date()
}

/**
 * Get transport mode display name
 */
export function getTransportModeName(mode: TransportMode): string {
  const names: Record<TransportMode, string> = {
    road: 'Road',
    rail: 'Rail',
    air: 'Air',
    ship: 'Ship'
  }
  return names[mode]
}

// =====================================================
// FILING STATUS UTILITIES
// =====================================================

/**
 * Get filing status color
 */
export function getFilingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-gray-600 bg-gray-50',
    ready: 'text-blue-600 bg-blue-50',
    filed: 'text-green-600 bg-green-50',
    accepted: 'text-green-700 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-50',
    rejected: 'text-red-600 bg-red-50'
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

/**
 * Check if return filing is overdue
 */
export function isFilingOverdue(taxPeriod: string, returnType: 'gstr1' | 'gstr3b'): boolean {
  const month = parseInt(taxPeriod.slice(0, 2))
  const year = parseInt(taxPeriod.slice(2, 6))
  
  // GSTR-1 due: 11th of next month
  // GSTR-3B due: 20th of next month
  const dueDay = returnType === 'gstr1' ? 11 : 20
  
  const dueDate = new Date(year, month, dueDay)
  return new Date() > dueDate
}

/**
 * Get filing due date
 */
export function getFilingDueDate(taxPeriod: string, returnType: 'gstr1' | 'gstr3b'): Date {
  const month = parseInt(taxPeriod.slice(0, 2))
  const year = parseInt(taxPeriod.slice(2, 6))
  const dueDay = returnType === 'gstr1' ? 11 : 20
  return new Date(year, month, dueDay)
}

/**
 * Format due date with status
 */
export function formatDueDateWithStatus(taxPeriod: string, returnType: 'gstr1' | 'gstr3b'): string {
  const dueDate = getFilingDueDate(taxPeriod, returnType)
  const isOverdue = isFilingOverdue(taxPeriod, returnType)
  
  const formatted = dueDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  
  if (isOverdue) {
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    return `${formatted} (${daysOverdue} days overdue)`
  }
  
  return formatted
}

// =====================================================
// CA ACCESS UTILITIES
// =====================================================

/**
 * Get access level display name
 */
export function getAccessLevelName(level: string): string {
  const names: Record<string, string> = {
    view_only: 'View Only',
    edit: 'Edit Access',
    full: 'Full Access'
  }
  return names[level] || level
}

/**
 * Get access level color
 */
export function getAccessLevelColor(level: string): string {
  const colors: Record<string, string> = {
    view_only: 'text-blue-600 bg-blue-50',
    edit: 'text-yellow-600 bg-yellow-50',
    full: 'text-green-600 bg-green-50'
  }
  return colors[level] || 'text-gray-600 bg-gray-50'
}

/**
 * Check if CA access is valid
 */
export function isCAAccessValid(validUntil: string | null | undefined): boolean {
  if (!validUntil) return true  // No expiry
  return new Date(validUntil) > new Date()
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
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with Indian comma system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Format date in Indian format
 */
export function formatIndianDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatIndianDate(d)
}

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validate ICAI membership number format
 */
export function validateICAIMembership(number: string): boolean {
  // ICAI membership numbers are typically 6 digits
  return /^\d{6}$/.test(number)
}

/**
 * Validate vehicle number format
 */
export function validateVehicleNumber(number: string): boolean {
  // Indian vehicle number format: XX00XX0000
  return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i.test(number.replace(/\s/g, ''))
}

/**
 * Validate HSN code format
 */
export function validateHSNCode(code: string): boolean {
  // HSN codes are 4, 6, or 8 digits
  return /^\d{4}$|^\d{6}$|^\d{8}$/.test(code)
}

/**
 * Validate SAC code format
 */
export function validateSACCode(code: string): boolean {
  // SAC codes are 6 digits
  return /^\d{6}$/.test(code)
}

// =====================================================
// EXPORT UTILITIES
// =====================================================

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: Record<string, string | number>[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
