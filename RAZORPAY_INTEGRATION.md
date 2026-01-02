# Razorpay Payment Integration

Complete payment processing and refund management system using Razorpay payment gateway.

## Features

### ✅ Payment Processing
- **Create Payment Orders**: Generate Razorpay orders for invoices
- **Secure Payment Collection**: Razorpay checkout integration
- **Payment Verification**: Signature verification for security
- **Automatic Invoice Updates**: Invoices marked as paid automatically
- **Payment Tracking**: Complete payment history and metadata

### ✅ Refund Management
- **User Refund Requests**: Customers can request refunds
- **Admin Review System**: Super admins review and process refunds
- **Razorpay Refund Processing**: Automated refund creation
- **Full/Partial Refunds**: Support for both refund types
- **Status Tracking**: Real-time refund status updates
- **Audit Trail**: Complete refund processing history

### ✅ Webhooks
- **Payment Captured**: Automatic payment confirmation
- **Payment Failed**: Handle failed payments
- **Refund Processed**: Update refund status
- **Refund Failed**: Handle refund failures
- **Signature Verification**: Secure webhook processing

## Setup Instructions

### 1. Install Razorpay Package

```bash
npm install razorpay
# or
pnpm add razorpay
```

### 2. Setup Razorpay Account

1. Create account at [razorpay.com](https://razorpay.com)
2. Get your API credentials from Dashboard
3. Generate webhook secret for production

### 3. Environment Variables

Add to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Public key for client-side (Next.js)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

**Important:** 
- Use test keys (`rzp_test_`) for development
- Use live keys (`rzp_live_`) for production
- Never commit secrets to version control

### 4. Database Migration

Run the payment schema migration in Supabase SQL Editor:

```sql
-- Execute this file in Supabase
-- File: supabase-payment-schema.sql
```

This creates:
- `payments` table - All payment records
- `refunds` table - Refund requests and status
- Indexes for performance
- RLS policies for security
- Triggers for automatic invoice updates

### 5. Configure Razorpay Webhooks

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
3. Select these events:
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
   - `refund.failed`
4. Copy the webhook secret to `.env.local`

## Usage

### For Users: Making Payments

1. Navigate to an invoice detail page
2. If invoice is unpaid, you'll see "Pay Invoice" button
3. Click to open Razorpay checkout
4. Complete payment using:
   - Cards (Credit/Debit)
   - UPI
   - Net Banking
   - Wallets
5. Invoice automatically marked as paid

### For Users: Requesting Refunds

```typescript
import { requestRefund } from '@/app/(dashboard)/invoices/payment-actions'

// Request refund for a payment
await requestRefund(paymentId, 'Reason for refund')
```

### For Admins: Processing Refunds

1. Navigate to `/admin/refunds`
2. View all refund requests with status
3. Review refund details
4. Approve or reject refunds
5. Approved refunds automatically processed via Razorpay

## API Reference

### Payment Actions

```typescript
// Create payment order
const order = await createPaymentOrder(invoiceId)
// Returns: { orderId, amount, currency, paymentId }

// Verify and complete payment
await verifyAndCompletePayment({
    orderId: 'order_xxx',
    paymentId: 'pay_xxx',
    signature: 'signature_xxx'
})

// Get payment details
const payment = await getPayment(paymentId)

// Get invoice payments
const payments = await getInvoicePayments(invoiceId)
```

### Refund Actions

```typescript
// Request refund (user)
await requestRefund(paymentId, reason)

// Process refund (admin)
await processRefund(refundId, approve, notes)

// Get all refunds (admin)
const refunds = await getAllRefunds()

// Get user refunds
const myRefunds = await getUserRefunds()
```

### Razorpay Utilities

```typescript
import { 
    createRazorpayOrder,
    verifyPaymentSignature,
    fetchPaymentDetails,
    createRefund,
    fetchRefundDetails 
} from '@/lib/razorpay'

// Create order
const order = await createRazorpayOrder({
    amount: 1000, // in rupees
    currency: 'INR',
    receipt: 'receipt_001',
    notes: { key: 'value' }
})

// Verify signature
const isValid = verifyPaymentSignature(orderId, paymentId, signature)

// Create refund
const refund = await createRefund(paymentId, {
    amount: 500, // optional, for partial refund
    speed: 'normal',
    notes: { reason: 'Customer request' }
})
```

## Database Schema

### Payments Table

```sql
payments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    invoice_id UUID REFERENCES invoices,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50) DEFAULT 'razorpay',
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    status VARCHAR(50), -- pending, completed, failed, refunded, partial_refund
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### Refunds Table

```sql
refunds (
    id UUID PRIMARY KEY,
    payment_id UUID REFERENCES payments,
    user_id UUID REFERENCES auth.users,
    invoice_id UUID REFERENCES invoices,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    reason TEXT,
    status VARCHAR(50), -- pending, processing, completed, failed
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    gateway_refund_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

## Payment Flow

1. **Order Creation**
   ```
   User clicks "Pay" → createPaymentOrder() 
   → Razorpay order created → Payment record saved
   ```

2. **Payment Collection**
   ```
   Razorpay checkout opens → User completes payment 
   → Payment captured → Webhook fires
   ```

3. **Verification**
   ```
   Frontend receives response → verifyAndCompletePayment() 
   → Signature verified → Payment marked completed
   ```

4. **Invoice Update**
   ```
   Payment completed → Database trigger 
   → Invoice status updated to 'paid'
   ```

## Refund Flow

1. **Request**
   ```
   User requests refund → requestRefund() 
   → Refund record created with status 'pending'
   ```

2. **Admin Review**
   ```
   Admin views in /admin/refunds 
   → Reviews request → Approves/Rejects
   ```

3. **Processing**
   ```
   Admin approves → processRefund() 
   → Razorpay API called → Refund initiated
   ```

4. **Completion**
   ```
   Webhook received → Refund marked completed 
   → Payment status updated → Invoice cancelled
   ```

## Security Features

- ✅ Signature verification for all payments
- ✅ Webhook signature validation
- ✅ Row Level Security (RLS) policies
- ✅ Admin-only refund processing
- ✅ Secure environment variables
- ✅ HTTPS required for production

## Testing

### Test Mode

Use Razorpay test credentials:
- Key ID: `rzp_test_xxxxxxxxxx`
- Key Secret: Test secret from dashboard

### Test Cards

```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

### Test UPI

```
UPI ID: success@razorpay
```

### Webhook Testing

Use Razorpay Dashboard webhook tester or ngrok for local testing:

```bash
ngrok http 3000
# Use ngrok URL in Razorpay webhook settings
```

## Troubleshooting

### Payment Not Completing

1. Check Razorpay keys are correct
2. Verify webhook is configured
3. Check browser console for errors
4. Ensure HTTPS in production

### Refund Failing

1. Verify payment is captured
2. Check Razorpay balance
3. Ensure payment is not already refunded
4. Check refund amount doesn't exceed payment

### Webhook Not Firing

1. Verify webhook URL is accessible
2. Check webhook secret matches
3. Test webhook from Razorpay dashboard
4. Check server logs for errors

## Support

- **Razorpay Docs**: [docs.razorpay.com](https://razorpay.com/docs/)
- **Support**: [razorpay.com/support](https://razorpay.com/support/)
- **Status**: [status.razorpay.com](https://status.razorpay.com/)

## Future Enhancements

- [ ] Recurring payments/subscriptions
- [ ] Payment links
- [ ] Partial payments
- [ ] Multi-currency support
- [ ] Payment analytics dashboard
- [ ] Automatic receipt generation
- [ ] SMS/Email payment notifications
- [ ] QR code payments
