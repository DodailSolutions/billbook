# Recurring Invoices & Reminders Guide

## Overview

BillBook supports automated recurring invoices for subscription-based billing. You can set up monthly or yearly recurring invoices that automatically generate new invoices on schedule, along with payment reminders.

## Features

### Recurring Invoice Templates
- **Monthly Billing**: Automatically generate invoices every month
- **Yearly Billing**: Automatically generate invoices every year
- **Flexible Dates**: Set custom start and end dates
- **Pause/Resume**: Temporarily pause recurring billing without deleting
- **Manual Generation**: Generate an invoice immediately when needed

### Payment Reminders
- **Automatic Creation**: Reminders are created automatically when invoices are generated
- **Due Date Notifications**: Get notified 7 days before payment is due
- **Recurring Alerts**: Notifications for upcoming recurring invoice generation
- **Reminder Management**: Mark reminders as sent or dismiss them

## Setting Up Recurring Invoices

### Prerequisites

1. **Database Schema**: Make sure you've run `supabase-recurring-schema.sql` in your Supabase SQL Editor
2. **Customers**: Create at least one customer before setting up recurring invoices

### Creating a Recurring Invoice

1. **Navigate to Recurring Invoices**
   - Click "Recurring" in the sidebar
   - Or go to `/invoices/recurring`

2. **Click "New Recurring Invoice"**

3. **Fill in the Form**
   - **Customer**: Select the customer to bill
   - **Billing Frequency**: Choose Monthly or Yearly
   - **Start Date**: When the first invoice should be generated
   - **End Date** (Optional): When to stop generating invoices (leave empty for indefinite)
   - **GST Percentage**: Tax rate to apply
   - **Invoice Items**: Add line items (description, quantity, unit price)
   - **Notes** (Optional): Additional information to include

4. **Click "Create Recurring Invoice"**

### Understanding the Recurring Invoice Card

Each recurring invoice displays:
- **Customer Name**: Who will be billed
- **Status Badge**: Active (green) or Paused (gray)
- **Frequency**: Monthly or Yearly
- **Invoice Amount**: Total amount including GST
- **Next Invoice Date**: When the next invoice will be generated
- **Items Count**: Number of line items

### Available Actions

#### Generate Now
Manually generate an invoice from the template immediately, regardless of the next invoice date.

#### Pause/Resume
- **Pause**: Temporarily stop automatic invoice generation
- **Resume**: Reactivate automatic generation

#### Delete
Permanently delete the recurring invoice template. This does NOT delete already generated invoices.

## How Automatic Generation Works

### The Process

1. **Scheduled Check**: The system checks for recurring invoices where `next_invoice_date` has passed
2. **Invoice Creation**: A new invoice is created with:
   - Current date as invoice date
   - Due date set to 30 days from now
   - All items copied from the template
   - Status set to "Sent"
   - Auto-generated invoice number (INV-YYYY-NNNN)
3. **Next Date Update**: The `next_invoice_date` is updated:
   - Monthly: + 1 month
   - Yearly: + 1 year
4. **Reminder Creation**: A reminder is created for 7 days before the due date

### Database Function

The system uses a PostgreSQL function `generate_recurring_invoice()` that handles all the logic:

```sql
SELECT generate_recurring_invoice('recurring-invoice-id');
```

### Setting Up Automation

#### Option 1: Manual Generation

Users can manually click "Generate Now" on any recurring invoice card. This is the simplest approach and works well for small-scale usage.

#### Option 2: Supabase Edge Function (Recommended)

Create a daily scheduled Edge Function:

1. **Create Edge Function**
   ```bash
   supabase functions new generate-recurring
   ```

2. **Add Function Code**
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   Deno.serve(async () => {
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!
     const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!
     
     const supabase = createClient(supabaseUrl, supabaseKey)
     
     // Get all active recurring invoices due today or earlier
     const { data: recurring, error } = await supabase
       .from('recurring_invoices')
       .select('id')
       .eq('is_active', true)
       .lte('next_invoice_date', new Date().toISOString().split('T')[0])
     
     if (error) {
       console.error('Error fetching recurring invoices:', error)
       return new Response(JSON.stringify({ error }), { status: 500 })
     }
     
     const results = []
     
     // Generate invoice for each
     for (const ri of recurring || []) {
       const { data, error } = await supabase
         .rpc('generate_recurring_invoice', {
           p_recurring_invoice_id: ri.id
         })
       
       results.push({ id: ri.id, invoiceId: data, error })
     }
     
     return new Response(JSON.stringify({ 
       processed: results.length,
       results 
     }))
   })
   ```

3. **Deploy Edge Function**
   ```bash
   supabase functions deploy generate-recurring
   ```

4. **Schedule with Cron**
   - Go to Database → Extensions → Enable pg_cron
   - Run in SQL Editor:
   ```sql
   SELECT cron.schedule(
     'generate-recurring-invoices',
     '0 0 * * *',  -- Daily at midnight
     $$SELECT net.http_post(
       'https://your-project.supabase.co/functions/v1/generate-recurring',
       '{}'::jsonb,
       '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
     )$$
   );
   ```

#### Option 3: External Cron Service

Use services like:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions**

Create an API endpoint in your Next.js app:

```typescript
// app/api/cron/recurring/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  // Verify cron secret
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Use service role key for admin access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data: recurring } = await supabase
    .from('recurring_invoices')
    .select('id')
    .eq('is_active', true)
    .lte('next_invoice_date', new Date().toISOString().split('T')[0])
  
  const results = []
  
  for (const ri of recurring || []) {
    const { data } = await supabase
      .rpc('generate_recurring_invoice', {
        p_recurring_invoice_id: ri.id
      })
    results.push({ id: ri.id, invoiceId: data })
  }
  
  return NextResponse.json({ processed: results.length, results })
}
```

Then schedule the cron service to POST to this endpoint daily.

## Payment Reminders

### Viewing Reminders

1. Click "Reminders" in the sidebar
2. You'll see all upcoming reminders for the next 30 days
3. Reminders are grouped by date

### Reminder Types

- **Due Date**: Invoice payment is due soon (7 days before)
- **Overdue**: Invoice payment is past due
- **Recurring Upcoming**: A recurring invoice will be generated soon

### Managing Reminders

#### Mark as Sent
Click "Mark Sent" after you've notified the customer. This removes it from the pending list.

#### Dismiss
Remove a reminder without marking it as sent.

### Automatic Reminder Creation

Reminders are created automatically in two scenarios:

1. **When Invoice is Generated**
   - A reminder is created for 7 days before the due date
   - Due date is set to 30 days after invoice date

2. **For Upcoming Recurring Invoices**
   - Run the `create_recurring_reminders()` function daily
   - Creates reminders for recurring invoices due in next 7 days

## Best Practices

### 1. Test Before Going Live
- Create a test recurring invoice with a near-future date
- Verify the invoice generates correctly
- Check that reminders are created

### 2. Set Realistic Dates
- Don't set start dates in the past (invoices won't generate retroactively)
- Use end dates for temporary subscriptions

### 3. Monitor Regularly
- Check the Recurring Invoices page weekly
- Review upcoming reminders
- Ensure invoices are generating as expected

### 4. Customer Communication
- Inform customers about recurring billing
- Send copies of generated invoices
- Provide advance notice before the first charge

### 5. Handle Edge Cases
- Customer requests to pause billing → Use Pause feature
- One-time adjustment needed → Edit the next generated invoice manually
- Cancellation → Delete recurring invoice (past invoices remain)

## Troubleshooting

### Invoice Not Generating

**Check:**
1. Is the recurring invoice Active? (not Paused)
2. Has the `next_invoice_date` passed?
3. Are you running the generation function or manual generation?
4. Check Supabase logs for errors

**Solution:**
- Click "Generate Now" to manually trigger
- Check RLS policies in Supabase
- Verify the `generate_recurring_invoice()` function exists

### Wrong Amount Calculated

**Check:**
1. Item quantities and unit prices in the template
2. GST percentage setting
3. Verify items were copied correctly to generated invoice

**Solution:**
- Edit the recurring invoice template
- Manually adjust the generated invoice if needed

### Reminders Not Showing

**Check:**
1. Has the reminder date passed?
2. Is the reminder marked as sent?
3. Run `create_recurring_reminders()` function

**Solution:**
- Go to Supabase → Table Editor → reminders
- Check `is_sent` and `reminder_date` columns

### Edge Function Not Running

**Check:**
1. Is pg_cron enabled?
2. Is the cron job scheduled correctly?
3. Check Edge Function logs

**Solution:**
```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- Check job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## Database Schema Reference

### recurring_invoices Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner of the recurring invoice |
| customer_id | UUID | Customer to bill |
| frequency | VARCHAR | 'monthly' or 'yearly' |
| start_date | DATE | When billing started |
| end_date | DATE | When to stop (null = indefinite) |
| next_invoice_date | DATE | Next generation date |
| gst_percentage | DECIMAL | Tax rate |
| notes | TEXT | Additional notes |
| is_active | BOOLEAN | Active status |
| last_generated_at | TIMESTAMP | Last generation time |

### recurring_invoice_items Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| recurring_invoice_id | UUID | Parent recurring invoice |
| description | TEXT | Item description |
| quantity | DECIMAL | Item quantity |
| unit_price | DECIMAL | Price per unit |

### reminders Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner of the reminder |
| invoice_id | UUID | Related invoice (optional) |
| recurring_invoice_id | UUID | Related recurring invoice (optional) |
| reminder_type | VARCHAR | Type of reminder |
| reminder_date | DATE | When to remind |
| days_before | INTEGER | Days before event |
| is_sent | BOOLEAN | Sent status |
| message | TEXT | Reminder message |

## API Reference

### Server Actions

```typescript
// Get all recurring invoices
const invoices = await getRecurringInvoices()

// Get single recurring invoice
const invoice = await getRecurringInvoice(id)

// Create recurring invoice
await createRecurringInvoice({
  customer_id: string,
  frequency: 'monthly' | 'yearly',
  start_date: string,
  end_date?: string,
  gst_percentage: number,
  notes?: string,
  items: Array<{
    description: string,
    quantity: number,
    unit_price: number
  }>
})

// Update status (pause/resume)
await updateRecurringInvoiceStatus(id, is_active)

// Delete recurring invoice
await deleteRecurringInvoice(id)

// Generate invoice manually
await generateInvoiceFromRecurring(id)

// Get reminders
const reminders = await getUpcomingReminders(days)

// Mark reminder as sent
await markReminderAsSent(reminderId)

// Delete reminder
await deleteReminder(reminderId)
```

## Support

For issues or questions:
1. Check this guide first
2. Review the SETUP.md for database setup
3. Check Supabase logs for errors
4. Verify RLS policies are correctly applied

## Changelog

### Version 1.0
- Initial recurring invoice implementation
- Monthly and yearly frequencies
- Automated invoice generation
- Payment reminders
- Manual generation option
- Pause/resume functionality
