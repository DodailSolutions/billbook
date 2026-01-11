# 🔄 Recurring Invoice Quick Start

## ✨ What's New

You can now **set invoices as recurring** directly when creating them! No need to navigate to a separate page.

## 🎯 How to Use

### Creating a Recurring Invoice

1. **Go to Create Invoice** (`/invoices/new`)
2. Fill in all invoice details (customer, items, etc.)
3. **Check the box** "🔄 Make this a Recurring Invoice"
4. **Configure recurring settings:**
   - **Billing Frequency**: Monthly or Yearly
   - **Start Date**: When first invoice should be generated
   - **End Date** (optional): Leave empty for indefinite billing
5. **See Next Billing Date**: Automatically calculated and displayed
6. **Click Create Invoice**

### What Happens?

✅ **Invoice is created** - Normal invoice gets created and saved  
✅ **Recurring template is set up** - Behind the scenes, a recurring invoice template is created  
✅ **Reminder is scheduled** - Automatic reminder created for 7 days before next billing date  
✅ **Visible in list** - Invoice shows with purple "🔄 RECURRING" badge  

## 📊 Viewing Recurring Invoices

### In Invoice List

Recurring invoices display:
- **Purple Badge**: "🔄 RECURRING" to identify them
- **Next Billing Date**: Shows when next invoice will be generated
- **Frequency**: Monthly or Yearly

Example:
```
INV-2025-0001                    🔄 RECURRING
Customer: Acme Corp
Date: Jan 11, 2025
📊 Next billing: Feb 11, 2025 (monthly)
```

### In Reminders

Check `/reminders` to see:
- Upcoming billing reminders
- 7 days before each billing date
- Easy tracking of all recurring schedules

## 🔔 Reminders

### Automatic Creation

When you set an invoice as recurring:
- A reminder is **automatically created**
- Set for **7 days before** the next billing date
- Shows in your `/reminders` page
- Type: `recurring_upcoming`

### Example Reminder

```
Type: Recurring Upcoming
Date: Feb 4, 2025
Message: "Recurring invoice will be generated on February 11, 2025"
Status: Not Sent
```

## 📋 Complete Flow Example

Let's say you create an invoice on **January 11, 2025**:

1. **Create Invoice**
   - Customer: Tech Solutions Inc.
   - Amount: ₹10,000
   - Date: Jan 11, 2025
   - ✅ Check "Make this a Recurring Invoice"
   - Frequency: Monthly
   - Start Date: Jan 11, 2025
   - End Date: (empty - indefinite)

2. **System Creates**
   - Regular invoice: INV-2025-0042
   - Recurring template: Links to this invoice
   - Next billing date: Feb 11, 2025
   - Reminder: Feb 4, 2025 (7 days before)

3. **You See**
   - Invoice in list with 🔄 badge
   - "📊 Next billing: Feb 11, 2025 (monthly)"
   - Reminder in reminders page

4. **What Happens Next**
   - On Feb 11, 2025: New invoice auto-generated
   - Template updates: Next date → Mar 11, 2025
   - New reminder created: Mar 4, 2025

## 🎨 Visual Indicators

### Invoice Creation Form

When you check "Make this a Recurring Invoice", you'll see:
- **Blue highlight box** with recurring settings
- **Frequency selector** with 📅 Monthly or 📆 Yearly
- **Date pickers** for start and end dates
- **Next Billing Date** shown with 📊 icon
- **Info box** explaining how it works

### Invoice List

Recurring invoices show:
- **Purple badge** next to status badge
- **Next billing date** in purple text
- **Frequency** (monthly/yearly) in parentheses

## 🔧 Database Structure

### What Gets Created

1. **Invoice Record**
   - Regular invoice in `invoices` table
   - All standard fields populated
   - Status: draft

2. **Recurring Template**
   - Record in `recurring_invoices` table
   - Links to original invoice via `template_invoice_id`
   - Tracks `next_invoice_date`
   - Status: `is_active: true`

3. **Recurring Items**
   - Records in `recurring_invoice_items` table
   - Copy of all invoice items
   - Used for future invoice generation

4. **Reminder**
   - Record in `reminders` table
   - Type: `recurring_upcoming`
   - Date: 7 days before next billing
   - Links to recurring template

## ⚙️ Technical Details

### Files Modified

1. **InvoiceForm.tsx**
   - Added recurring toggle and settings UI
   - State management for recurring data
   - Next billing date calculation
   - Visual feedback with blue highlight box

2. **actions.ts**
   - Extended `CreateInvoiceData` interface
   - Added `createRecurringFromInvoice()` helper
   - Automatic template and reminder creation
   - Updated `getInvoices()` to join recurring data

3. **InvoicesList.tsx**
   - Added recurring badge display
   - Shows next billing date
   - Displays frequency

### API Flow

```
User creates invoice with recurring enabled
    ↓
createInvoice() called
    ↓
Invoice created in database
    ↓
Invoice items created
    ↓
createRecurringFromInvoice() called
    ↓
Recurring template created
    ↓
Recurring items created
    ↓
Reminder scheduled (7 days before)
    ↓
Response returned to user
```

## 🎯 Key Features

✅ **Inline Creation** - No separate page needed  
✅ **Real-time Preview** - See next billing date as you configure  
✅ **Automatic Reminders** - Never miss a billing date  
✅ **Visual Indicators** - Easy to identify recurring invoices  
✅ **Flexible Scheduling** - Monthly or yearly, with optional end date  
✅ **Smooth UX** - Clear explanation of how it works  

## 🚀 Next Steps

### For Users

1. ✅ Create your first recurring invoice
2. ✅ Check the reminders page
3. ✅ Watch for automatic generation (if you have automation set up)
4. ✅ Manage from `/invoices/recurring` page

### For Automation

To enable automatic generation:
- Set up cron job or scheduled function
- Call the database function: `generate_recurring_invoice(recurring_id)`
- Or use the manual "Generate Now" button on recurring page

## 📝 Notes

- **Database migration required**: Ensure `supabase-recurring-schema.sql` is applied
- **Reminders shown**: Check `/reminders` page to see all scheduled reminders
- **Manual generation**: Visit `/invoices/recurring` to generate invoices manually
- **Pause/Resume**: Manage recurring status from recurring invoices page

## 🎉 Success!

Your recurring invoice system is now fully functional! Users can:
- ✅ Set invoices as recurring during creation
- ✅ See next billing dates
- ✅ Get automatic reminders
- ✅ Track all recurring invoices easily

---

**Made with ❤️ by Dodail Solutions Private Limited**
