# Razorpay Payment Setup - Quick Start

## Installation

```bash
npm install razorpay
# or
pnpm add razorpay
# or
yarn add razorpay
```

## Environment Variables

Add these to your `.env.local`:

```env
# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Public Key (for client-side)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

## Database Setup

Run this migration in Supabase SQL Editor:

```bash
# Execute: supabase-payment-schema.sql
```

This creates:
- `payments` table for tracking all payments
- `refunds` table for refund management
- Necessary indexes and policies
- Auto-update triggers for invoice status

## Razorpay Dashboard Setup

### 1. Get API Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate Test/Live keys
4. Copy Key ID and Key Secret to `.env.local`

### 2. Setup Webhooks

1. Go to **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. Enter URL: `https://your-domain.com/api/webhooks/razorpay`
4. Select Events:
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ refund.processed
   - ✅ refund.failed
5. Copy Webhook Secret to `.env.local`

## Usage

### Customer Payment Flow

1. User navigates to invoice detail page
2. Clicks "Pay Invoice" button
3. Razorpay checkout modal opens
4. Completes payment with card/UPI/net banking
5. Invoice automatically marked as "Paid"

### Admin Refund Flow

1. Navigate to `/admin/refunds`
2. View pending refund requests
3. Review details
4. Approve or reject
5. Approved refunds processed automatically

## Testing

### Test Cards

For testing in test mode:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

### Test UPI

```
UPI ID: success@razorpay
```

## Features

✅ Secure payment collection with Razorpay
✅ Automatic invoice status updates
✅ Payment verification
✅ Refund management (admin)
✅ Webhook integration
✅ Full payment history
✅ Support for all Razorpay payment methods

## Documentation

For complete documentation, see:
- [RAZORPAY_INTEGRATION.md](./RAZORPAY_INTEGRATION.md) - Full integration guide
- [Razorpay Docs](https://razorpay.com/docs/) - Official documentation

## Support

- **Test Mode**: Use test keys for development
- **Production**: Switch to live keys when ready
- **Issues**: Check webhook logs in Razorpay dashboard

## Next Steps

1. Install package: `npm install razorpay`
2. Add environment variables
3. Run database migration
4. Configure webhooks
5. Test with test cards
6. Deploy and switch to live keys
