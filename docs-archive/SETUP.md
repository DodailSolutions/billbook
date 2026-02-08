# BillBook Setup Guide

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Application running

## Detailed Setup Steps

### Step 1: Supabase Project Setup

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create New Project**
   - Click "New Project"
   - Choose an organization (or create one)
   - Enter project details:
     - Name: `billbook` (or your preferred name)
     - Database Password: (save this securely)
     - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

3. **Get API Credentials**
   - Go to **Project Settings** (gear icon in sidebar)
   - Click **API** section
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (under "Project API keys")

### Step 2: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

### Step 3: Deploy Database Schema

1. **Open Supabase SQL Editor**
   - In your Supabase project dashboard
   - Click **SQL Editor** in the left sidebar
   - Click **New query**

2. **Run Schema Script**
   - Open `supabase-schema.sql` from your project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

3. **Verify Tables Created**
   - Click **Table Editor** in sidebar
   - You should see 4 tables:
     - `customers`
     - `invoices`
     - `invoice_items`
     - `invoice_sequences`

4. **Deploy Recurring Invoices Schema (Optional but Recommended)**
   - Click **SQL Editor** in the left sidebar
   - Click **New query**
   - Open `supabase-recurring-schema.sql` from your project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run**
   - You should see "Success. No rows returned"
   - This adds 3 more tables:
     - `recurring_invoices`
     - `recurring_invoice_items`
     - `reminders`

### Step 4: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14
- React 19
- Supabase client libraries
- Tailwind CSS
- TypeScript
- Lucide React (icons)

### Step 5: Run Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

### Step 6: Test the Application

1. **Sign Up**
   - Go to http://localhost:3000
   - Click "Get Started"
   - Create an account with email and password
   - You'll be redirected to the dashboard

2. **Add a Customer**
   - Click "Customers" in sidebar
   - Click "Add Customer"
   - Fill in customer details
   - Click "Create Customer"

3. **Create an Invoice**
   - Click "Invoices" in sidebar
   - Click "Create Invoice"
   - Select the customer you just created
   - Add invoice items
   - Adjust GST percentage if needed
   - Click "Create Invoice"

4. **View Dashboard**
   - Click "Dashboard" in sidebar
   - See your statistics update

## Troubleshooting

### Issue: "Invalid API key" or Auth errors

**Solution:**
- Double-check your `.env.local` file
- Ensure no extra spaces in the values
- Restart the dev server after changing env variables
- Make sure you're using the **anon public** key, not the service role key

### Issue: "relation does not exist" errors

**Solution:**
- The database schema wasn't deployed correctly
- Go back to Supabase SQL Editor
- Run the `supabase-schema.sql` script again
- Check for any error messages in the SQL Editor

### Issue: "Row Level Security policy violation"

**Solution:**
- RLS policies might not have been created
- Re-run the schema script
- Make sure you're logged in to the app
- Check Supabase Auth logs for issues

### Issue: Can't create customers or invoices

**Solution:**
- Check browser console for errors
- Verify you're authenticated (check if you can see the dashboard)
- Check Supabase logs in the dashboard
- Ensure RLS policies are active

### Issue: Invoice numbers not generating

**Solution:**
- The `get_next_invoice_number` function might not exist
- Re-run the schema script
- Check Supabase Functions in the dashboard
- Invoices will fall back to timestamp-based numbers if function fails

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side | `eyJhbGc...` |

**Note:** These are prefixed with `NEXT_PUBLIC_` because they're used in client-side code.

## Database Schema Overview

### Tables

1. **customers**
   - Stores customer information
   - Linked to user via `user_id`
   - RLS ensures users only see their own customers

2. **invoices**
   - Main invoice data
   - Links to customer
   - Auto-generated invoice numbers
   - Tracks status (draft, sent, paid, cancelled)

3. **invoice_items**
   - Line items for each invoice
   - Multiple items per invoice
   - Stores description, quantity, price

4. **invoice_sequences**
   - Manages invoice number generation
   - One sequence per user
   - Customizable prefix

### Functions

- `get_next_invoice_number(user_id)`: Generates sequential invoice numbers
- `update_updated_at_column()`: Auto-updates timestamps

### Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Policies enforce user isolation
- No cross-user data leakage

## Next Steps

After setup:

1. **Customize Branding**
   - Update app name in `app/layout.tsx`
   - Modify colors in `app/globals.css`
   - Add your logo

2. **Configure Invoice Prefix**
   - Default is "INV"
   - Can be changed per user in `invoice_sequences` table

3. **Add More Features**
   - PDF generation
   - Email integration
   - Payment tracking

4. **Deploy to Production**
   - See deployment section in main README
   - Remember to set environment variables in your hosting platform

## Support

If you encounter issues not covered here:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure the database schema was deployed successfully

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use environment variables** for all sensitive data
3. **Keep Supabase keys secure** - Don't share them publicly
4. **Enable MFA** on your Supabase account
5. **Regularly update dependencies** - Run `npm audit` periodically

---

Happy invoicing! 🎉
