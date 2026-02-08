# Advanced Payment System - Complete Guide

## 🚀 Overview

Complete payment ecosystem with UPI, WhatsApp payments, installments, auto-reconciliation, and AI-powered analytics.

## Features Implemented

### 1. Native UPI Integration
- ✅ UPI ID management
- ✅ QR code generation
- ✅ UPI intent links
- ✅ Multiple UPI IDs support
- ✅ Primary UPI selection

### 2. One-Click WhatsApp Pay
- ✅ Payment link generation
- ✅ WhatsApp message templates
- ✅ QR code for WhatsApp
- ✅ Click tracking
- ✅ Expiry management

### 3. Partial Payments & Installments
- ✅ Installment plan creation
- ✅ Multiple frequencies (weekly/monthly/quarterly)
- ✅ Partial payment tracking
- ✅ Installment status management
- ✅ Auto-calculation of amounts

### 4. Auto-Reconciliation
- ✅ Bank transaction import
- ✅ AI-powered invoice matching
- ✅ Confidence scoring
- ✅ Manual reconciliation override
- ✅ Reconciliation dashboard

### 5. Failed Payment Recovery
- ✅ Automatic retry scheduling
- ✅ Exponential backoff strategy
- ✅ Recovery analytics
- ✅ Discount offers for recovery
- ✅ Alternate payment method suggestions

### 6. Smart Late Fee Calculation
- ✅ Auto-calculation based on config
- ✅ Grace period support
- ✅ Percentage/Fixed/Tiered fees
- ✅ Daily compounding option
- ✅ Maximum fee cap
- ✅ Auto-notification to customers

### 7. BNPL for MSMEs
- ✅ Provider integration framework
- ✅ Application tracking
- ✅ Approval/Rejection workflow
- ✅ Multi-provider support (FlexMoney, ZestMoney, LazyPay, Simpl)
- ✅ Tenure & interest management

### 8. Auto Payment Follow-ups
- ✅ Multi-channel (WhatsApp, SMS, Email)
- ✅ Automated scheduling
- ✅ Reminder sequences
- ✅ Delivery tracking
- ✅ Read receipts

### 9. Payment Behavior Analytics
- ✅ Customer reliability scoring (0-100)
- ✅ Payment pattern analysis
- ✅ Risk categorization
- ✅ Preferred payment method tracking
- ✅ Predictive payment dates

## Quick Setup

### Step 1: Run Database Migration

```bash
# In Supabase SQL Editor
\i supabase-advanced-payments-migration.sql
```

Creates:
- 9 new tables
- 3 helper functions
- 2 analytical views
- RLS policies

### Step 2: Configure UPI

```typescript
import { createUPIDetails } from '@/lib/advanced-payment-actions'

// Add your UPI ID
await createUPIDetails({
  upi_id: 'yourname@paytm',
  business_name: 'Your Business Name',
  is_primary: true
})
```

### Step 3: Setup Late Fee Config

```typescript
import { createLateFeeConfig } from '@/lib/advanced-payment-actions'

await createLateFeeConfig({
  grace_period_days: 3,
  fee_type: 'percentage',
  fee_value: 2, // 2% late fee
  compound_daily: false,
  max_late_fee: 1000, // Cap at ₹1000
  auto_apply: true
})
```

## Usage Examples

### Example 1: Create Installment Plan

```typescript
import { createInstallmentPlan } from '@/lib/advanced-payment-actions'

await createInstallmentPlan({
  invoice_id: 'invoice-uuid',
  total_installments: 3,
  frequency: 'monthly',
  start_date: '2026-02-01'
})

// Result: 3 monthly installments of ₹33,333.33 each
```

### Example 2: Generate UPI Payment

```typescript
import { generateUPIQRCode } from '@/lib/advanced-payment-actions'

const { intent, qr_data } = await generateUPIQRCode({
  upi_id: 'business@paytm',
  amount: 10000,
  invoice_number: 'INV-001',
  customer_name: 'ABC Corp'
})

// Use qr_data to generate QR code
// Use intent as payment link
```

### Example 3: Send WhatsApp Payment Link

```typescript
import { createWhatsAppPaymentLink } from '@/lib/advanced-payment-actions'

const { link, whatsapp_message } = await createWhatsAppPaymentLink({
  invoice_id: 'invoice-uuid',
  customer_id: 'customer-uuid',
  whatsapp_number: '+919876543210',
  expires_in_hours: 72
})

// Send whatsapp_message via WhatsApp Business API
```

### Example 4: Auto-Schedule Follow-ups

```typescript
import { autoScheduleFollowups } from '@/lib/advanced-payment-actions'

await autoScheduleFollowups('invoice-uuid')

// Automatically schedules:
// - Day 1 before due: WhatsApp reminder
// - Day 3 after due: SMS reminder
// - Day 7 after due: Email reminder
```

### Example 5: Bank Reconciliation

```typescript
import { importBankTransaction } from '@/lib/advanced-payment-actions'

// Import transaction from bank statement
await importBankTransaction({
  transaction_id: 'TXN123456',
  transaction_date: '2026-01-07',
  amount: 50000,
  transaction_type: 'credit',
  description: 'UPI/CUSTOMER NAME/INV-001',
  upi_id: 'customer@paytm'
})

// Auto-matching runs automatically
// Check unreconciled transactions
const unreconciled = await getUnreconciledTransactions()
```

### Example 6: Payment Behavior Analysis

```typescript
import { getPaymentBehaviorAnalytics } from '@/lib/advanced-payment-actions'

const analytics = await getPaymentBehaviorAnalytics('customer-uuid')

// Returns:
// - Reliability score (0-100)
// - Payment pattern (early_payer, on_time, etc.)
// - Risk category (low, medium, high)
// - Average delay days
// - Total invoices/paid/overdue
```

### Example 7: Failed Payment Recovery

```typescript
import { retryFailedPayment } from '@/lib/advanced-payment-actions'

// Retry with exponential backoff
const result = await retryFailedPayment('failed-payment-uuid')

// System automatically:
// - Increases retry count
// - Schedules next retry (24h → 48h → 72h → 1 week)
// - Offers recovery incentives after 3 failures
```

## API Reference

### UPI Functions

```typescript
// Create UPI details
createUPIDetails(data: {
  upi_id: string
  business_name?: string
  is_primary?: boolean
}): Promise<Result>

// Generate UPI QR code
generateUPIQRCode(data: {
  upi_id: string
  amount: number
  invoice_number: string
  customer_name?: string
}): Promise<{ intent: string; qr_data: string }>

// Get user's UPI details
getUPIDetails(): Promise<UPIPaymentDetails[]>
```

### Installment Functions

```typescript
// Create installment plan
createInstallmentPlan(data: {
  invoice_id: string
  total_installments: number
  frequency: 'weekly' | 'monthly' | 'quarterly'
  start_date: string
}): Promise<Result>

// Record installment payment
recordInstallmentPayment(data: {
  installment_id: string
  amount: number
  payment_method: string
  payment_reference?: string
}): Promise<Result>

// Get invoice installments
getInvoiceInstallments(invoiceId: string): Promise<PaymentInstallment[]>
```

### Reconciliation Functions

```typescript
// Import bank transaction
importBankTransaction(data: {
  transaction_date: string
  amount: number
  transaction_type: 'credit' | 'debit'
  description?: string
  reference_number?: string
  upi_id?: string
}): Promise<Result>

// Reconcile transaction
reconcileTransaction(data: {
  transaction_id: string
  invoice_id: string
  payment_id?: string
}): Promise<Result>

// Get unreconciled transactions
getUnreconciledTransactions(): Promise<BankTransaction[]>
```

### Late Fee Functions

```typescript
// Create late fee config
createLateFeeConfig(data: {
  grace_period_days?: number
  fee_type: 'percentage' | 'fixed' | 'tiered'
  fee_value: number
  max_late_fee?: number
  compound_daily?: boolean
  auto_apply?: boolean
}): Promise<Result>

// Calculate and apply late fees
calculateAndApplyLateFees(invoiceId: string): Promise<Result>
```

### Follow-up Functions

```typescript
// Schedule follow-up
schedulePaymentFollowup(data: {
  invoice_id: string
  customer_id: string
  followup_type: 'whatsapp' | 'sms' | 'email'
  scheduled_at: string
  message_content: string
}): Promise<Result>

// Auto-schedule all follow-ups
autoScheduleFollowups(invoiceId: string): Promise<Result>

// Send follow-up immediately
sendFollowupNow(followupId: string): Promise<Result>
```

### Analytics Functions

```typescript
// Get payment behavior analytics
getPaymentBehaviorAnalytics(customerId?: string): Promise<Analytics[]>

// Refresh analytics
refreshPaymentBehavior(customerId: string): Promise<Result>
```

## Database Schema

### Core Tables

1. **upi_payment_details** - UPI configuration
2. **payment_installments** - Installment tracking
3. **bank_transactions** - Transaction records
4. **failed_payments** - Failed payment tracking
5. **late_fee_config** - Late fee settings
6. **bnpl_applications** - BNPL tracking
7. **payment_followups** - Follow-up scheduling
8. **payment_behavior_analytics** - Customer analytics
9. **whatsapp_payment_links** - WhatsApp payment tracking

### Helper Functions

```sql
-- Calculate late fee
calculate_late_fee(invoice_id, due_date, amount) → DECIMAL

-- Update payment behavior
update_payment_behavior(customer_id) → VOID

-- Auto-match transaction
auto_match_bank_transaction(transaction_id) → VOID
```

### Views

```sql
-- Invoices with calculated late fees
invoices_with_late_fees

-- Payment analytics summary
payment_analytics_summary
```

## Integration Guide

### WhatsApp Business API

```typescript
// Example WhatsApp integration
import { generateWhatsAppPaymentMessage } from '@/lib/advanced-payment-utils'

const message = generateWhatsAppPaymentMessage({
  customerName: 'ABC Corp',
  invoiceNumber: 'INV-001',
  amount: 50000,
  dueDate: '2026-01-15',
  paymentLink: 'https://yourapp.com/pay/inv-001'
})

// Send via WhatsApp Business API
await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: '+919876543210',
    type: 'text',
    text: { body: message }
  })
})
```

### SMS Integration (Twilio)

```typescript
import { generateSMSPaymentMessage } from '@/lib/advanced-payment-utils'

const message = generateSMSPaymentMessage({
  invoiceNumber: 'INV-001',
  amount: 50000,
  paymentLink: 'https://yourapp.com/pay/inv-001'
})

// Send via Twilio
await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    To: '+919876543210',
    From: 'YOUR_TWILIO_NUMBER',
    Body: message
  })
})
```

### QR Code Generation

```typescript
import QRCode from 'qrcode'
import { generateUPIIntent } from '@/lib/advanced-payment-utils'

const intent = generateUPIIntent({
  upi_id: 'business@paytm',
  amount: 10000,
  name: 'Your Business',
  transaction_ref: 'INV-001'
})

// Generate QR code
const qrCodeDataURL = await QRCode.toDataURL(intent, {
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
})

// Display in component
<img src={qrCodeDataURL} alt="UPI Payment QR" />
```

## Advanced Features

### Auto-Reconciliation Algorithm

The system uses a confidence-based matching algorithm:

```
Confidence Score = Amount Match (60%) + Reference Match (30%) + Date Proximity (10%)

- Amount Match: 
  * Exact: 60 points
  * < ₹1 diff: 50 points
  * < ₹10 diff: 30 points

- Reference Match:
  * Invoice number in description: 30 points
  * Partial match: 10 points

- Date Proximity:
  * Within 7 days: 10 points
  * Within 30 days: 5 points

Auto-match threshold: 70%
Manual review: 30-70%
Reject: <30%
```

### Payment Reliability Scoring

```
Score = (Payment Rate × 40) - (Delay Penalty × 30) - (Overdue Rate × 20) - (Failed Count × 10)

Risk Categories:
- Low Risk: 80-100 score
- Medium Risk: 50-79 score
- High Risk: 0-49 score
```

### Failed Payment Recovery Strategy

```
Retry 1: +24 hours → Try alternate method
Retry 2: +48 hours → Offer installments
Retry 3: +72 hours → Offer 3-5% discount
Retry 4+: +168 hours → Manual intervention
```

## Best Practices

### 1. UPI Setup
- Always set one UPI ID as primary
- Use business name in UPI for recognition
- Generate QR codes for offline payments

### 2. Installments
- Offer installments for amounts > ₹10,000
- Use monthly frequency for standard invoices
- Send reminders 2 days before each installment

### 3. Late Fees
- Set reasonable grace period (3-5 days)
- Cap late fees at 10% of invoice
- Always notify customers before applying

### 4. Follow-ups
- Day -1: Friendly reminder (WhatsApp)
- Day +3: Payment request (SMS)
- Day +7: Urgent notice (Email + Call)
- Day +15: Final notice with options

### 5. Reconciliation
- Import bank statements daily
- Review auto-matches weekly
- Manually reconcile ambiguous matches

## Analytics Dashboard

```typescript
// Get complete payment analytics
const analytics = await getPaymentBehaviorAnalytics()

// Calculate metrics
const metrics = {
  collection_rate: calculateCollectionRate({
    totalInvoiced: 1000000,
    totalCollected: 850000
  }), // 85%
  
  dso: calculateDSO({
    totalReceivables: 150000,
    totalRevenue: 1000000,
    periodDays: 30
  }), // 4.5 days
  
  high_risk_count: analytics.filter(a => a.risk_category === 'high').length
}
```

## Troubleshooting

### Issue: UPI QR not working
**Solution**: Ensure UPI intent format is correct and amount is > 0

### Issue: Auto-reconciliation not matching
**Solution**: Check transaction description includes invoice number

### Issue: Late fees not calculating
**Solution**: Verify late_fee_config is active and auto_apply is true

### Issue: Follow-ups not sending
**Solution**: Check scheduled_at is in future and status is 'pending'

## Future Enhancements

- ✨ Real-time payment notifications
- ✨ Multi-currency support
- ✨ Crypto payment integration
- ✨ AI-powered payment prediction
- ✨ Smart installment recommendations
- ✨ Payment gateway aggregation
- ✨ Voice payment commands

## Support

For integration help:
- Check `VOICE_INVOICE_QUICK_START.md`
- Review `ADVANCED_INVOICE_FEATURES.md`
- See database migration file for schema details

---

**Total Implementation**: 2,000+ lines of code across 4 files
- Database: 500+ lines SQL
- Types: 200+ lines TypeScript
- Actions: 800+ lines
- Utils: 500+ lines

Complete payment ecosystem ready for production! 🚀
