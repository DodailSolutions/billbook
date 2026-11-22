/**
 * Automated WhatsApp Payment Reminders & 1-Click UPI Pay Engine
 */

export interface InvoiceReminderPayload {
  invoiceId: string
  invoiceNumber: string
  customerName: string
  customerPhone: string
  totalAmount: number
  dueDate: string
  currency?: string
  upiVpa?: string // Merchant UPI ID e.g. business@okaxis
  businessName: string
  paymentPortalUrl?: string
}

export type ReminderStage = 'pre_due' | 'due_date' | 'overdue'

/**
 * Generates an interoperable UPI payment deep-link
 * Follows NPCI UPI standard URI specifications
 */
export function generateUpiPaymentUri(
  vpa: string,
  payeeName: string,
  amount: number,
  invoiceNumber: string
): string {
  const cleanVpa = encodeURIComponent(vpa.trim())
  const cleanName = encodeURIComponent(payeeName.trim())
  const cleanNote = encodeURIComponent(`BillBook Inv ${invoiceNumber}`)
  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${amount.toFixed(2)}&cu=INR&tn=${cleanNote}`
}

/**
 * Builds localized, high-converting WhatsApp reminder text with 1-click payment links
 */
export function buildWhatsAppReminderMessage(
  payload: InvoiceReminderPayload,
  stage: ReminderStage = 'pre_due'
): { message: string; waLink: string; upiUri?: string } {
  const formattedAmount = `₹${payload.totalAmount.toLocaleString('en-IN')}`
  const dueDateStr = new Date(payload.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const upiUri = payload.upiVpa 
    ? generateUpiPaymentUri(payload.upiVpa, payload.businessName, payload.totalAmount, payload.invoiceNumber)
    : undefined

  let message = ''

  if (stage === 'pre_due') {
    message = 
      `*Payment Reminder from ${payload.businessName}*\n\n` +
      `Hello ${payload.customerName},\n` +
      `This is a friendly reminder that Invoice *#${payload.invoiceNumber}* for *${formattedAmount}* is scheduled for payment on *${dueDateStr}*.\n\n` +
      `🔗 *Quick 1-Click UPI Payment Link:*\n` +
      `${payload.paymentPortalUrl || (upiUri || 'Please reply to receive payment QR')}\n\n` +
      `Thank you for your business! Please disregard if already settled.`
  } else if (stage === 'due_date') {
    message = 
      `*Payment Due Today — ${payload.businessName}*\n\n` +
      `Hello ${payload.customerName},\n` +
      `Invoice *#${payload.invoiceNumber}* for *${formattedAmount}* is due today (*${dueDateStr}*).\n\n` +
      `⚡ *Pay Instantly via UPI / QR:*\n` +
      `${payload.paymentPortalUrl || (upiUri || 'Please reply for bank transfer details')}\n\n` +
      `Your instant digital receipt will be sent upon payment confirmation.`
  } else {
    message = 
      `*Overdue Payment Notice — ${payload.businessName}*\n\n` +
      `Dear ${payload.customerName},\n` +
      `Our records show that Invoice *#${payload.invoiceNumber}* for *${formattedAmount}* was due on *${dueDateStr}* and remains pending.\n\n` +
      `Kindly settle at your earliest convenience using the link below:\n` +
      `👉 ${payload.paymentPortalUrl || (upiUri || 'Please reply to settle via UPI')}\n\n` +
      `If you have any questions regarding this invoice, please feel free to message us here.`
  }

  // Format clean phone number without spaces or symbols
  const cleanPhone = payload.customerPhone.replace(/\D/g, '')
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
  const waLink = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`

  return { message, waLink, upiUri }
}
