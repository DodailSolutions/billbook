/**
 * Enterprise Features - Utility Functions
 * Helper functions for formatting, validation, and calculations
 */

// =====================================================
// INVENTORY UTILITIES
// =====================================================

export function getStockStatusColor(currentStock: number, reorderLevel?: number, maxLevel?: number): string {
  if (!reorderLevel) return 'bg-gray-500'
  
  if (currentStock <= 0) return 'bg-red-600' // Out of stock
  if (currentStock <= reorderLevel * 0.5) return 'bg-red-500' // Critical
  if (currentStock <= reorderLevel) return 'bg-orange-500' // Low
  if (maxLevel && currentStock >= maxLevel) return 'bg-blue-500' // Overstock
  return 'bg-green-500' // Good
}

export function getStockStatus(currentStock: number, reorderLevel?: number, maxLevel?: number): string {
  if (!reorderLevel) return 'Unknown'
  
  if (currentStock <= 0) return 'Out of Stock'
  if (currentStock <= reorderLevel * 0.5) return 'Critical'
  if (currentStock <= reorderLevel) return 'Low Stock'
  if (maxLevel && currentStock >= maxLevel) return 'Overstock'
  return 'In Stock'
}

export function calculateStockValue(stock: number, price: number): number {
  return stock * price
}

export function calculateReorderQuantity(
  currentStock: number,
  reorderLevel: number,
  maxLevel: number,
  safetyStock: number = 0
): number {
  return Math.max(0, maxLevel - currentStock + safetyStock)
}

export function getBatchExpiryStatus(expiryDate: string): 'expired' | 'expiring_soon' | 'good' {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysToExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysToExpiry < 0) return 'expired'
  if (daysToExpiry <= 30) return 'expiring_soon'
  return 'good'
}

export function getDaysToExpiry(expiryDate: string): number {
  const today = new Date()
  const expiry = new Date(expiryDate)
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getExpiryColor(status: 'expired' | 'expiring_soon' | 'good'): string {
  switch (status) {
    case 'expired':
      return 'bg-red-500'
    case 'expiring_soon':
      return 'bg-orange-500'
    case 'good':
      return 'bg-green-500'
  }
}

export function getAlertSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50'
    case 'high':
      return 'text-orange-600 bg-orange-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'low':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getAlertTypeLabel(alertType: string): string {
  const labels: Record<string, string> = {
    'low_stock': 'Low Stock',
    'expiry_warning': 'Expiring Soon',
    'expired': 'Expired',
    'reorder_point': 'Reorder Point Reached',
    'overstock': 'Overstock',
    'negative_stock': 'Negative Stock'
  }
  return labels[alertType] || alertType
}

// =====================================================
// EXPENSE UTILITIES
// =====================================================

export function getExpenseTypeIcon(expenseType: string): string {
  const icons: Record<string, string> = {
    'cash': '💵',
    'card': '💳',
    'bank_transfer': '🏦',
    'cheque': '📝',
    'mileage': '🚗',
    'asset_purchase': '🏢'
  }
  return icons[expenseType] || '💰'
}

export function getApprovalStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'text-green-600 bg-green-50'
    case 'rejected':
      return 'text-red-600 bg-red-50'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'cancelled':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function calculateMileageExpense(distanceKm: number, ratePerKm: number): number {
  return distanceKm * ratePerKm
}

export function calculateDepreciation(
  purchaseValue: number,
  salvageValue: number,
  usefulLifeYears: number,
  method: 'straight_line' | 'declining_balance' = 'straight_line',
  rate?: number
): number {
  if (method === 'straight_line') {
    return (purchaseValue - salvageValue) / usefulLifeYears
  } else {
    // Declining balance
    const depreciationRate = rate || (1 / usefulLifeYears) * 2 // Double declining
    return purchaseValue * depreciationRate
  }
}

export function getAssetStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'under_maintenance':
      return 'text-yellow-600 bg-yellow-50'
    case 'disposed':
    case 'sold':
    case 'written_off':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function formatOCRConfidence(score: number): string {
  if (score >= 90) return 'High'
  if (score >= 70) return 'Medium'
  return 'Low'
}

// =====================================================
// DASHBOARD & METRICS UTILITIES
// =====================================================

export function calculateHealthScore(
  liquidityScore: number,
  profitabilityScore: number,
  efficiencyScore: number,
  growthScore: number
): number {
  return (
    liquidityScore * 0.30 +
    profitabilityScore * 0.30 +
    efficiencyScore * 0.25 +
    growthScore * 0.15
  )
}

export function getHealthScoreGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function calculateCollectionEfficiency(invoiced: number, collected: number): number {
  if (invoiced === 0) return 0
  return (collected / invoiced) * 100
}

export function calculateAverageCollectionDays(
  totalDays: number,
  numberOfInvoices: number
): number {
  if (numberOfInvoices === 0) return 0
  return Math.round(totalDays / numberOfInvoices)
}

export function calculateGrossProfit(revenue: number, costOfGoodsSold: number): number {
  return revenue - costOfGoodsSold
}

export function calculateGrossProfitMargin(revenue: number, grossProfit: number): number {
  if (revenue === 0) return 0
  return (grossProfit / revenue) * 100
}

export function calculateNetProfit(revenue: number, totalExpenses: number): number {
  return revenue - totalExpenses
}

export function calculateNetProfitMargin(revenue: number, netProfit: number): number {
  if (revenue === 0) return 0
  return (netProfit / revenue) * 100
}

export function formatMetricChange(current: number, previous: number): {
  change: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
} {
  const change = current - previous
  const percentage = previous !== 0 ? (change / previous) * 100 : 0
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(percentage) > 1) {
    trend = change > 0 ? 'up' : 'down'
  }
  
  return { change, percentage, trend }
}

export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '📈'
    case 'down':
      return '📉'
    case 'stable':
      return '➡️'
  }
}

// =====================================================
// ACCESS CONTROL UTILITIES
// =====================================================

export function getRoleTypeColor(roleType: string): string {
  switch (roleType) {
    case 'super_admin':
      return 'text-purple-600 bg-purple-50'
    case 'admin':
      return 'text-blue-600 bg-blue-50'
    case 'accounts':
      return 'text-green-600 bg-green-50'
    case 'sales':
      return 'text-orange-600 bg-orange-50'
    case 'inventory':
      return 'text-yellow-600 bg-yellow-50'
    case 'viewer':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function hasPermission(
  userRole: { can_create?: boolean; can_edit?: boolean; can_delete?: boolean; can_approve?: boolean },
  action: 'create' | 'edit' | 'delete' | 'approve'
): boolean {
  switch (action) {
    case 'create':
      return userRole.can_create || false
    case 'edit':
      return userRole.can_edit || false
    case 'delete':
      return userRole.can_delete || false
    case 'approve':
      return userRole.can_approve || false
    default:
      return false
  }
}

export function checkIPAccess(
  clientIP: string,
  rules: Array<{
    rule_type: 'allow' | 'deny'
    ip_address?: string
    ip_range_start?: string
    ip_range_end?: string
    priority: number
  }>
): boolean {
  // Sort by priority (lower number = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)
  
  for (const rule of sortedRules) {
    if (rule.ip_address && rule.ip_address === clientIP) {
      return rule.rule_type === 'allow'
    }
    // Add more IP matching logic for ranges and CIDR if needed
  }
  
  // Default: allow if no rules match
  return true
}

export function getActionTypeIcon(actionType: string): string {
  const icons: Record<string, string> = {
    'create': '➕',
    'update': '✏️',
    'delete': '🗑️',
    'view': '👁️',
    'export': '📥',
    'approve': '✅',
    'reject': '❌'
  }
  return icons[actionType] || '📝'
}

// =====================================================
// CLIENT PORTAL UTILITIES
// =====================================================

export function getVerificationStatusColor(status: string): string {
  switch (status) {
    case 'verified':
      return 'text-green-600 bg-green-50'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'suspended':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getDisputeStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'text-red-600 bg-red-50'
    case 'under_review':
      return 'text-yellow-600 bg-yellow-50'
    case 'resolved':
      return 'text-green-600 bg-green-50'
    case 'closed':
      return 'text-gray-600 bg-gray-50'
    case 'escalated':
      return 'text-purple-600 bg-purple-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getDisputePriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-red-600 bg-red-50'
    case 'high':
      return 'text-orange-600 bg-orange-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'low':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getChatStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'text-red-600 bg-red-50'
    case 'in_progress':
      return 'text-yellow-600 bg-yellow-50'
    case 'waiting_on_client':
    case 'waiting_on_business':
      return 'text-blue-600 bg-blue-50'
    case 'resolved':
      return 'text-green-600 bg-green-50'
    case 'closed':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function formatSatisfactionRating(rating: number): string {
  const stars = '⭐'.repeat(rating)
  return `${stars} (${rating}/5)`
}

export function getDisputeTypeLabel(disputeType: string): string {
  const labels: Record<string, string> = {
    'amount_mismatch': 'Amount Mismatch',
    'quality_issue': 'Quality Issue',
    'delivery_issue': 'Delivery Issue',
    'pricing_error': 'Pricing Error',
    'duplicate_invoice': 'Duplicate Invoice',
    'service_not_rendered': 'Service Not Rendered',
    'other': 'Other'
  }
  return labels[disputeType] || disputeType
}

// =====================================================
// WHATSAPP UTILITIES
// =====================================================

export function getMessageStatusColor(status: string): string {
  switch (status) {
    case 'sent':
      return 'text-blue-600 bg-blue-50'
    case 'delivered':
      return 'text-green-600 bg-green-50'
    case 'read':
      return 'text-green-700 bg-green-100'
    case 'failed':
      return 'text-red-600 bg-red-50'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getMessageStatusIcon(status: string): string {
  switch (status) {
    case 'sent':
      return '✓'
    case 'delivered':
      return '✓✓'
    case 'read':
      return '✓✓' // With blue color
    case 'failed':
      return '❌'
    case 'pending':
      return '⏳'
    default:
      return '○'
  }
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template
  
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  })
  
  return result
}

export function calculateMessageCost(messageType: string, hasMedia: boolean): number {
  // Simplified pricing (actual costs vary by country and WhatsApp Business API provider)
  let baseCost = 0.005 // $0.005 per message
  
  if (hasMedia) {
    baseCost += 0.003 // Additional cost for media
  }
  
  if (messageType === 'template') {
    baseCost += 0.002 // Template messages cost more
  }
  
  return baseCost
}

export function shouldSendPaymentNudge(
  dueDate: string,
  lastNudgeSent?: string,
  minHoursBetweenNudges: number = 48
): boolean {
  const today = new Date()
  const due = new Date(dueDate)
  
  // Check if invoice is overdue
  if (due < today) {
    // Check last nudge timing
    if (lastNudgeSent) {
      const lastNudge = new Date(lastNudgeSent)
      const hoursSinceLastNudge = (today.getTime() - lastNudge.getTime()) / (1000 * 60 * 60)
      
      return hoursSinceLastNudge >= minHoursBetweenNudges
    }
    return true
  }
  
  // Check if it's time for pre-due-date nudge
  const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return daysUntilDue <= 7 && daysUntilDue > 0
}

export function generatePaymentReminderMessage(
  customerName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  paymentLink?: string
): string {
  const formattedAmount = formatIndianCurrency(amount)
  const formattedDate = formatDate(dueDate)
  
  const overdue = new Date(dueDate) < new Date()
  
  let message = `Dear ${customerName},\n\n`
  
  if (overdue) {
    message += `This is a friendly reminder that invoice ${invoiceNumber} for ${formattedAmount} was due on ${formattedDate}.\n\n`
    message += `We request you to kindly make the payment at your earliest convenience.\n\n`
  } else {
    message += `Your invoice ${invoiceNumber} for ${formattedAmount} is due on ${formattedDate}.\n\n`
  }
  
  if (paymentLink) {
    message += `You can make the payment here: ${paymentLink}\n\n`
  }
  
  message += `If you have already made the payment, please ignore this message.\n\n`
  message += `Thank you for your business!`
  
  return message
}

export function generatePaymentThankYouMessage(
  customerName: string,
  invoiceNumber: string,
  amount: number
): string {
  const formattedAmount = formatIndianCurrency(amount)
  
  return `Dear ${customerName},\n\n` +
    `Thank you for your payment of ${formattedAmount} for invoice ${invoiceNumber}! ✅\n\n` +
    `We appreciate your prompt payment.\n\n` +
    `Looking forward to serving you again!`
}

// =====================================================
// GENERAL FORMATTING UTILITIES
// =====================================================

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals: number = 0): string {
  return value.toFixed(decimals)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// =====================================================
// VALIDATION UTILITIES
// =====================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Indian phone number format
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin)
}

export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan)
}

export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// =====================================================
// EXPORT UTILITIES
// =====================================================

export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return ''
  
  const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }))
  
  // Header
  const header = cols.map(col => col.label).join(',')
  
  // Rows
  const rows = data.map(row => {
    return cols.map(col => {
      const value = row[col.key]
      const stringValue = value === null || value === undefined ? '' : String(value)
      
      // Escape commas and quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  }).join('\n')
  
  return `${header}\n${rows}`
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  const csv = convertToCSV(data)
  downloadFile(csv, `${filename}.csv`, 'text/csv')
  // Note: For true Excel format, integrate a library like xlsx
}

// =====================================================
// MISCELLANEOUS UTILITIES
// =====================================================

export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateUniqueCode(prefix: string = '', length: number = 8): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, length)
  return `${prefix}${timestamp}${random}`.toUpperCase()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
