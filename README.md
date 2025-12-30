# BillBook - Invoice Management System

A modern, production-ready invoice management web application built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## Features

✅ **User Authentication**
- Secure signup and login with Supabase Auth
- Protected routes with middleware
- Session management

✅ **Customer Management (Full CRUD)**
- Create, view, edit, and delete customers
- Store customer details (name, email, phone, address, GSTIN)
- Clean card-based UI with edit buttons

✅ **Invoice Management (Full CRUD)**
- Create and edit invoices with multiple line items
- Auto-generated invoice numbers (INV-YYYY-NNNN format)
- Dynamic item addition/removal
- Real-time subtotal, GST, and total calculations
- Invoice status tracking (Draft, Sent, Paid, Cancelled)
- Detailed invoice view

✅ **Recurring Invoices & Automation**
- Create recurring invoice templates
- Monthly and yearly billing cycles
- Automated invoice generation from templates
- Pause/resume recurring subscriptions
- Manual invoice generation when needed
- Track next invoice date and billing history

✅ **Payment Reminders**
- Automated reminder creation
- Due date notifications (7 days before)
- Upcoming recurring invoice alerts
- Mark reminders as sent or dismiss
- 30-day reminder overview

✅ **PDF Generation**
- Download invoices as PDF
- Professional print-ready format
- One-click generate and print
- Complete invoice details

✅ **GST Calculations**
- Configurable GST percentage per invoice
- Automatic GST amount calculation
- Clear breakdown in invoice view

✅ **Dashboard**
- Total revenue from paid invoices
- Total invoice count
- Paid invoices count
- Pending invoices count

✅ **Production Ready**
- TypeScript for type safety
- Server Actions for data mutations
- Row Level Security (RLS) in Supabase
- Clean, maintainable code structure
- Responsive design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge

## Project Structure

```
billbook/
├── app/
│   ├── (auth)/                 # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   ├── actions.ts          # Auth server actions
│   │   └── layout.tsx
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── dashboard/          # Dashboard with stats
│   │   ├── customers/          # Customer CRUD
│   │   │   ├── new/            # Create customer
│   │   │   ├── [id]/           # Edit customer
│   │   │   └── actions.ts      # Customer server actions
│   │   ├── invoices/           # Invoice management
│   │   │   ├── new/            # Create invoice
│   │   │   ├── [id]/           # View invoice & PDF button
│   │   │   │   └── edit/       # Edit invoice
│   │   │   └── actions.ts      # Invoice server actions
│   │   └── layout.tsx          # Dashboard layout with sidebar
│   ├── api/
│   │   └── invoices/[id]/pdf/  # PDF generation endpoint
│   ├── globals.css             # Global styles & theme
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── SignOutButton.tsx
├── ├── utils.ts                # Utility functions
│   └── pdf.ts                  # PDF generation
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware helper
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── middleware.ts               # Next.js middleware
├── supabase-schema.sql         # Database schema
└── .env.local                  # Environment variables
```

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### 2. Clone and Install

```bash
cd billbook
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API**
3. Copy your **Project URL** and **anon public** key
4. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create Database Tables

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and run it in the SQL Editor

This will create:
- `customers` table
- `invoices` table
- `invoice_items` table
- `invoice_sequences` table
- Row Level Security (RLS) policies
- Helper functions for invoice numbering

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account at `/signup`
2. **Add Customers**: Navigate to Customers and add your first customer
3. **Create Invoice**: Go to Invoices and create your first invoice
4. **View Dashboard**: Check your dashboard for statistics

### Creating an Invoice

1. Click "Create Invoice" on the Invoices page
2. Select a customer from the dropdown
3. Set invoice and due dates
4. Configure GST percentage (default: 18%)
5. Add line items:
   - Description
   - Quantity
   - Unit Price
   - Amount is calculated automatically
6. Add optional notes
7. Click "Create Invoice"

### Invoice Status Management

- **Draft**: Initial state, not sent to customer
- **Sent**: Invoice has been sent to customer
- **Paid**: Payment received
- **Cancelled**: Invoice cancelled

Change status directly from the invoices list using the dropdown.

## Database Schema

### Customers
- Basic customer information
- Optional GSTIN for GST-registered businesses

### Invoices
- Links to customer
- Auto-generated invoice numbers
- Subtotal, GST, and total calculations
- Status tracking
- Optional notes

### Invoice Items
- Multiple items per invoice
- Description, quantity, unit price
- Calculated amount

### Invoice Sequences
- Per-user invoice numbering
- Customizable prefix
- Auto-increment functionality

### Recurring Invoices (New!)
- Recurring billing templates
- Monthly or yearly frequency
- Start and end dates
- Automatic invoice generation
- Active/inactive status

### Recurring Invoice Items
- Template items for recurring invoices
- Same structure as regular invoice items

### Reminders
- Payment due date reminders
- Recurring invoice notifications
- Reminder tracking (sent/unsent)
- Customizable reminder messages

## Recurring Invoices Setup

### Database Setup

After running `supabase-schema.sql`, also run `supabase-recurring-schema.sql` in your Supabase SQL Editor to add the recurring invoice tables and functions.

### Automated Invoice Generation

The system includes a database function `generate_recurring_invoice()` that:
1. Checks if it's time to generate an invoice
2. Creates a new invoice from the template
3. Copies all items from the recurring template
4. Updates the next invoice date
5. Creates payment reminders automatically

### Setting Up Automation (Optional)

For fully automated invoice generation, you can set up a daily cron job:

**Option 1: Supabase Edge Function**
```typescript
// Create an Edge Function that runs daily
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(...)
  
  // Get all active recurring invoices due today or earlier
  const { data: recurring } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('is_active', true)
    .lte('next_invoice_date', new Date().toISOString())
  
  // Generate invoice for each
  for (const ri of recurring || []) {
    await supabase.rpc('generate_recurring_invoice', {
      p_recurring_invoice_id: ri.id
    })
  }
  
  return new Response('Done')
})
```

**Option 2: External Cron Service**
- Use services like cron-job.org, EasyCron, or GitHub Actions
- Call your API endpoint daily to trigger invoice generation

### Manual Generation

Users can also manually generate invoices from recurring templates using the "Generate Now" button on each recurring invoice card.

## Security

- **Row Level Security (RLS)**: All tables have RLS policies
- **User Isolation**: Users can only access their own data
- **Protected Routes**: Middleware protects dashboard routes
- **Server Actions**: All mutations happen server-side
- **Type Safety**: TypeScript throughout

## Future Enhancements

Potential features to add:

- [ ] Email invoices to customers (with reminders)
- [ ] Multi-currency support
- [ ] Invoice templates and customization
- [ ] Reports and analytics
- [ ] Tax reports
- [ ] Client portal
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Expense tracking

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
