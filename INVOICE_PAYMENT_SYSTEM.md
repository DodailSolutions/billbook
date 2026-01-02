# Invoice Payment System

## Overview
Invoices can be paid through cash or customer's own payment QR codes (GPay, PhonePe, Paytm, etc.). Razorpay is only used for internal subscription purchases.

## Changes Made

### 1. Database Migration
Run this SQL in Supabase SQL Editor:
```sql
-- File: supabase-invoice-payment-method-migration.sql
```

This adds:
- `payment_method` - tracks how invoice was paid (cash, gpay, phonepe, etc.)
- `payment_notes` - optional notes (transaction ID, reference number)
- `paid_at` - timestamp when marked as paid

### 2. Invoice Detail Page
- **Removed**: Razorpay PaymentButton component
- **Added**: "Mark as Paid" button for unpaid invoices
- **Shows**: Payment method and notes when invoice is paid

### 3. Payment Methods Supported
- Cash
- Google Pay
- PhonePe
- Paytm
- UPI (Other)
- Bank Transfer
- Cheque
- Other

## Usage

### For Business Owner
1. Create and send invoice to customer
2. Customer pays via cash or QR code
3. Click "Mark as Paid" button on invoice
4. Select payment method (cash, gpay, etc.)
5. Optionally add transaction reference/notes
6. Submit - invoice status changes to "paid"

### For Customers
Customers can pay invoices using:
- Cash payment
- Your GPay/PhonePe/Paytm QR code
- Bank transfer

## Future Enhancements
- Add QR code upload in settings for business owner
- Display business QR code on invoice PDF
- Payment receipt generation
- Payment history/audit log

## Razorpay Usage
Razorpay integration remains available for:
- Subscription purchases (internal use only)
- Future premium features
- Not used for regular invoice payments
