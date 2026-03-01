# Admin Users Page - Troubleshooting Guide

## The Issue
The `/admin/users` page is returning a 500 error. This is most likely because:

1. **You haven't been granted super admin access yet**
2. **Missing SUPABASE_SERVICE_ROLE_KEY in Vercel environment**

## Solution Steps

### Step 1: Grant Super Admin Access (MOST IMPORTANT)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open and run the file: `make-admin-ravitejm.sql`
   ```sql
   UPDATE user_profiles 
   SET role = 'super_admin',
       status = 'active',
       updated_at = NOW()
   WHERE id = (
       SELECT id 
       FROM auth.users 
       WHERE email = 'ravitejm@dodail.com'
   );
   ```
4. **Logout and login again** at billbooky.dodail.com

### Step 2: Verify Setup (Use Diagnostics Page)

1. After logging in, visit: **billbooky.dodail.com/admin/test**
2. This page will show you:
   - ✓ Super Admin Access: Should show "Granted"
   - ✓ Supabase Connection: Should be "Connected"
   - User Profiles Count: Should show a number
   - Service Role Key: May show "Not Set" (that's OK for now)

### Step 3: Add Service Role Key (Optional but Recommended)

This is needed to display user emails in the admin panel.

1. Go to Supabase → **Project Settings** → **API**
2. Copy the `service_role` secret key (NOT the anon key)
3. Go to Vercel → Your Project → **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: [paste the service_role key]
   - **Environment**: Production, Preview, Development
5. Redeploy your project in Vercel

### Step 4: Activate Lifetime Plan (Optional)

If you want to activate the lifetime subscription:

1. Go to Supabase SQL Editor
2. Run the file: `activate-lifetime-ravitejm.sql`

## What Should Work Now

After Step 1 & 2:
- ✅ `/admin` - Dashboard should load
- ✅ `/admin/users` - Users page should load (may show "Email unavailable")
- ✅ `/admin/businesses` - Should show all businesses
- ✅ `/admin/payments` - Should show payment history
- ✅ `/admin/plans` - Should show subscription plans

After Step 3:
- ✅ User emails will be visible in the users table
- ✅ Full user management capabilities

## Current Error Handling

The users page now has comprehensive error handling:
- If you're not super admin → Shows "Access Denied" message
- If data fails to load → Shows error banner with link to diagnostics
- Page will not crash even if database queries fail

## Testing Checklist

- [ ] Run `make-admin-ravitejm.sql` in Supabase
- [ ] Logout and login again
- [ ] Visit `/admin/test` to verify setup
- [ ] Try accessing `/admin/users`
- [ ] If still failing, check browser console for errors
- [ ] Check Vercel logs for server-side errors

## Dialog Warnings (Not Critical)

The DialogContent warnings you're seeing are accessibility warnings from Radix UI. They don't break functionality but should be fixed for screen reader support. We'll address these separately.

## Still Not Working?

If after running the SQL script the page still shows 500:

1. Check browser console: Look for the specific error message
2. Check Vercel logs: Go to Vercel → Your Project → Logs
3. Visit `/admin/test`: This will show exactly what's failing
4. Share the error from diagnostics page or Vercel logs

The most common issue is forgetting to **logout and login** after running the SQL script!
