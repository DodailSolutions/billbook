# BillBook - Quick Reference Guide

## 🚀 Getting Started

### Start Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

## 🔑 Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Setup

1. Create Supabase project
2. Copy `supabase-schema.sql` contents
3. Paste in Supabase SQL Editor
4. Run the script

## 🎯 Common Tasks

### Add a New Customer
1. Navigate to `/customers`
2. Click "Add Customer"
3. Fill in details (only name is required)
4. Click "Create Customer"

### Edit a Customer
1. Navigate to `/customers`
2. Click the pencil icon on any customer card
3. Update details
4. Click "Update Customer"

### Create an Invoice
1. Navigate to `/invoices`
2. Click "Create Invoice"
3. Select customer
4. Add line items (description, quantity, price)
5. Adjust GST percentage if needed
6. Click "Create Invoice"

### Edit an Invoice
1. Go to `/invoices`
2. Click the eye icon to view invoice details
3. Click "Edit" button
4. Update invoice details and items
5. Click "Update Invoice"

### Create a Recurring Invoice
1. Navigate to `/invoices/recurring`
2. Click "New Recurring Invoice"
3. Select customer
4. Choose frequency (Monthly or Yearly)
5. Set start date (and optional end date)
6. Add invoice items (like a regular invoice)
7. Click "Create Recurring Invoice"

### Manage Recurring Invoices
1. Navigate to `/invoices/recurring`
2. View all recurring templates in card layout
3. Each card shows: customer, frequency, amount, next date
4. Actions available on each card:
   - **Generate Now**: Create invoice immediately
   - **Pause**: Stop automatic generation
   - **Resume**: Reactivate automatic generation
   - **Delete**: Remove template (keeps existing invoices)

### View Payment Reminders
1. Navigate to `/reminders`
2. See all upcoming reminders grouped by date
3. Reminders show: type, invoice details, days notice
4. Actions available:
   - **Mark Sent**: After notifying customer
   - **Dismiss**: Remove reminder

### Download Invoice as PDF
1. Go to invoice details page
2. Click "Download PDF" button
3. Print dialog will open automatically
4. Save as PDF or print directly

### Change Invoice Status
1. Go to `/invoices`
2. Use the dropdown next to each invoice
3. Select: Draft, Sent, Paid, or Cancelled

### View Invoice Details
1. Go to `/invoices`
2. Click the eye icon on any invoice
3. See full invoice with all details

## 🗂️ File Structure Quick Reference

### Pages
- `/` - Landing page
- `/login` - Login page
- `/signup` - Sign up page
- `/dashboard` - Dashboard with stats
- `/customers` - Customer list
- `/customers/new` - Add customer
- `/customers/[id]` - Edit customer
- `/invoices` - Invoice list
- `/invoices/new` - Create invoice
- `/invoices/[id]` - View invoice
- `/invoices/[id]/edit` - Edit invoice

### Key Files
- `middleware.ts` - Route protection
- `app/globals.css` - Theme & styles
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/types.ts` - TypeScript types
- `lib/pdf.ts` - PDF generation

### Server Actions
- `app/(auth)/actions.ts` - Auth actions
- `app/(dashboard)/customers/actions.ts` - Customer CRUD
- `app/(dashboard)/invoices/actions.ts` - Invoice CRUD
- `app/(dashboard)/dashboard/actions.ts` - Dashboard stats

## 🎨 Customization

### Change App Name
Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your description",
};
```

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --primary: hsl(221.2 83.2% 53.3%); /* Change this */
  /* ... other colors */
}
```

### Change Invoice Prefix
Default is "INV". To change:
1. Go to Supabase Table Editor
2. Open `invoice_sequences` table
3. Update the `prefix` column for your user
4. Or modify the SQL function in schema

### Add Your Logo
1. Add logo image to `public/` folder
2. Update `components/Sidebar.tsx`
3. Replace "BillBook" text with `<Image>` component

## 🔧 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Type Errors
```bash
# Regenerate types
npm run build
```

### Database Connection Issues
1. Check `.env.local` values
2. Verify Supabase project is active
3. Check Supabase dashboard for errors
4. Restart dev server

### Authentication Issues
1. Clear browser cookies
2. Check Supabase Auth settings
3. Verify email confirmation is disabled (for dev)
4. Check Supabase Auth logs

## 📝 Code Snippets

### Add a New Server Action
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function myAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // Your logic here
  
  revalidatePath('/your-path')
}
```

### Add a New UI Component
```typescript
import { cn } from "@/lib/utils"

interface MyComponentProps {
  className?: string
  children: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  )
}
```

### Query Database
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

## 🚢 Deployment Checklist

- [ ] Environment variables set in hosting platform
- [ ] Supabase project in production mode
- [ ] Database schema deployed
- [ ] Build passes locally (`npm run build`)
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Verify RLS policies are active
- [ ] Update redirect URLs in Supabase Auth settings

## 📱 Testing Checklist

### Authentication
- [ ] Sign up with new email
- [ ] Login with existing account
- [ ] Sign out
- [ ] Access protected routes when logged out (should redirect)
- [ ] Access auth pages when logged in (should redirect to dashboard)

### Customers
- [ ] Create customer with all fields
- [ ] Create customer with only required fields
- [ ] View customer list
- [ ] Delete customer
- [ ] Verify deleted customer is gone

### Invoices
- [ ] Create invoice with single item
- [ ] Create invoice with multiple items
- [ ] Verify GST calculation
- [ ] Verify total calculation
- [ ] Change invoice status
- [ ] View invoice details
- [ ] Delete invoice

### Dashboard
- [ ] Verify total revenue updates
- [ ] Verify invoice counts
- [ ] Verify paid invoices count
- [ ] Verify pending invoices count

## 🔐 Security Checklist

- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] Environment variables not committed
- [ ] Service role key not used in client code
- [ ] User data isolated (can't see other users' data)
- [ ] Protected routes working
- [ ] Session management working

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### This Project
- `README.md` - Full documentation
- `SETUP.md` - Setup guide
- `PROJECT_SUMMARY.md` - Feature overview
- `supabase-schema.sql` - Database schema

## 💡 Tips

1. **Use Server Components by default** - Only use 'use client' when needed
2. **Server Actions for mutations** - Simpler than API routes
3. **Type everything** - TypeScript will catch errors early
4. **Test RLS policies** - Ensure users can't access others' data
5. **Keep dependencies minimal** - Smaller bundle size
6. **Use Supabase dashboard** - Great for debugging
7. **Check browser console** - First place to look for errors
8. **Read Supabase logs** - Second place to look for errors

## 🎓 Learning Path

1. **Start Simple**: Create customer, create invoice
2. **Understand Auth**: How login/signup works
3. **Explore Server Actions**: See how data is mutated
4. **Study RLS**: Understand security model
5. **Customize UI**: Make it your own
6. **Add Features**: PDF, email, etc.

---

**Quick Help**: Check `SETUP.md` for detailed troubleshooting
