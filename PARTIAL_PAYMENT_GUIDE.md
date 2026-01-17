# Partial Payment & Print Margin Fixes

## Recent Updates

### 1. Print Margins Fixed ✅

**Issue**: Invoices were printing without proper margins, causing content to extend to the edges of the page.

**Solution**: 
- Added proper `@page` margins (1cm top/bottom, 1.5cm left/right) in print media queries
- Updated both the PDF generation library (`lib/pdf.ts`) and the PDF route (`app/api/invoices/[id]/pdf/route.ts`)
- Added proper padding and spacing for print output

**Files Modified**:
- `/lib/pdf.ts` - Print media query updated with proper @page margins
- `/app/api/invoices/[id]/pdf/route.ts` - Preview print styles updated

**Testing**:
- Print any invoice using Ctrl/Cmd+P or the "Download PDF" button
- Verify proper margins on all sides
- Check that content doesn't get cut off

---

### 2. Partial Payment Support Added ✅

**Feature**: Full support for partial/installment payments on invoices.

**What's New**:

#### Database Changes
Run the migration: `supabase-partial-payment-migration.sql`

**New Columns in `invoices` table**:
- `amount_paid` - Tracks total amount paid so far
- `amount_remaining` - Remaining balance to be paid
- `is_partial_payment` - Flag indicating if invoice has partial payments

**New Table**: `invoice_payments`
- Tracks individual payment transactions
- Stores payment method, notes, and timestamp for each payment
- Automatically updates invoice status when payments are recorded

#### UI Components

**New Component**: `PartialPaymentButton`
- Located at: `/app/(dashboard)/invoices/[id]/PartialPaymentButton.tsx`
- Allows recording partial payments
- Shows payment summary (total, paid, remaining)
- Validates payment amounts
- Supports all payment methods (Cash, UPI, Bank Transfer, etc.)

**Updated Components**:
- Invoice detail page now shows:
  - Payment progress bar for partial payments
  - Breakdown of total, paid, and remaining amounts
  - Percentage of invoice paid
  - Both "Record Payment" and "Mark as Paid" buttons

#### API Endpoints

**New Endpoint**: `/api/invoices/partial-payment`

**POST** - Record a partial payment
```json
{
  "invoiceId": "uuid",
  "amount": 5000.00,
  "paymentMethod": "gpay",
  "paymentNotes": "Transaction ID: 12345"
}
```

**GET** - Retrieve payment history
```
GET /api/invoices/partial-payment?invoiceId=uuid
```

Returns array of all payments for the invoice.

#### PDF/Print Updates
- Partial payment info now displays on printed invoices
- Shows "Amount Paid" in green
- Shows "Amount Due" in orange for remaining balance

---

## Usage Guide

### Recording a Partial Payment

1. Open any invoice in draft or sent status
2. Click "Record Payment" button
3. Enter the payment amount (max: remaining balance)
4. Select payment method
5. Add optional notes (transaction ID, reference, etc.)
6. Click "Record Payment"

The system will:
- ✅ Record the payment transaction
- ✅ Update invoice totals automatically
- ✅ Change status to "paid" if fully paid
- ✅ Show payment progress on invoice

### Recording Multiple Payments

You can record multiple partial payments:
- First payment: ₹5,000 via Cash
- Second payment: ₹3,000 via GPay
- Final payment: ₹2,000 via Bank Transfer

Each payment is tracked separately with its own:
- Amount
- Payment method
- Notes
- Timestamp

### Marking as Fully Paid

If you want to mark the entire remaining balance as paid:
1. Click "Mark as Paid" button (instead of "Record Payment")
2. This will record the full remaining amount as paid

---

## Technical Details

### Database Triggers

The system uses a PostgreSQL trigger (`update_invoice_on_payment`) that automatically:
1. Calculates total `amount_paid` from all payment records
2. Updates `amount_remaining` 
3. Sets `is_partial_payment` flag
4. Changes invoice status to 'paid' when fully paid

### Type Definitions

Updated in `/lib/types.ts`:

```typescript
export interface Invoice {
  // ... existing fields
  amount_paid?: number
  amount_remaining?: number
  is_partial_payment?: boolean
}

export interface InvoicePayment {
  id: string
  invoice_id: string
  user_id: string
  amount: number
  payment_method?: string
  payment_notes?: string
  payment_date: string
  created_at: string
}
```

### Security

- All payment operations require authentication
- Row Level Security (RLS) policies ensure users can only:
  - View their own payments
  - Record payments for their own invoices
  - Update/delete their own payment records

---

## Migration Steps

1. **Run the SQL migration**:
   ```sql
   -- In Supabase SQL Editor, run:
   supabase-partial-payment-migration.sql
   ```

2. **Verify the migration**:
   - Check that new columns exist in `invoices` table
   - Verify `invoice_payments` table was created
   - Test RLS policies are active

3. **Test the feature**:
   - Create a test invoice
   - Record a partial payment
   - Verify amounts update correctly
   - Check PDF shows partial payment info

---

## Benefits

✅ **Better Cash Flow Tracking** - See exactly what's been paid and what's pending

✅ **Payment History** - Full audit trail of all payments per invoice

✅ **Flexible Payment Options** - Accept installment payments from customers

✅ **Automatic Status Updates** - Invoice status updates automatically when fully paid

✅ **Print-Ready** - Partial payment info appears on printed/PDF invoices

✅ **Professional** - Shows payment progress with visual progress bar

---

## Future Enhancements

Potential additions:
- Payment reminders for remaining balance
- Payment schedule/due dates for installments
- Automatic late fees for overdue partial payments
- Payment receipt generation
- SMS/Email notifications on payment receipt

---

## Support

For issues or questions:
- Check the invoice detail page for payment status
- Verify migration was run successfully
- Check browser console for any errors
- Ensure user has proper permissions

## Related Files

- `/supabase-partial-payment-migration.sql` - Database migration
- `/app/(dashboard)/invoices/[id]/PartialPaymentButton.tsx` - Payment UI
- `/app/(dashboard)/invoices/[id]/page.tsx` - Invoice detail page
- `/app/api/invoices/partial-payment/route.ts` - API endpoint
- `/lib/types.ts` - TypeScript definitions
- `/lib/pdf.ts` - PDF generation with payment info
