# Database Migration Guide

## Running the Testimonials Migration in Production

The testimonials feature requires a database table that needs to be created. Follow these steps to run the migration:

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your `billbook` project

2. **Open SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Open the file: `supabase-testimonials-schema.sql`
   - Copy all the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for the success message: "Success. No rows returned"

5. **Verify**
   - Go to "Table Editor" in the sidebar
   - You should see a new table called `testimonials`
   - It should have 12 sample testimonials already inserted

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /Users/ravitejmathurthi/Desktop/billbook

# Run the migration
supabase db push

# Or apply the specific file
supabase db execute --file supabase-testimonials-schema.sql
```

### Verification Steps

After running the migration, verify it worked:

1. **Check the table exists:**
   - In Supabase Dashboard → Table Editor
   - Look for `testimonials` table

2. **Check sample data:**
   - Click on the `testimonials` table
   - You should see 12 rows of sample testimonials

3. **Test the API:**
   - Visit: https://billbooky.dodail.com/api/testimonials
   - You should see JSON array with testimonials (not a 500 error)

4. **Check the homepage:**
   - Visit: https://billbooky.dodail.com
   - Scroll down to see the testimonial carousel

### Troubleshooting

**"Permission denied" error:**
- Make sure you're logged into the correct Supabase project
- Verify you have owner/admin access to the project

**"Relation already exists" error:**
- The table already exists, migration already ran
- You can skip this or drop the table first: `DROP TABLE IF EXISTS testimonials CASCADE;`

**500 Error persists:**
- Clear your browser cache
- Wait 1-2 minutes for changes to propagate
- Check Supabase logs for any errors

### Alternative: Manual Table Creation

If the SQL file doesn't work, you can create the table manually:

1. Go to Supabase Dashboard → Table Editor
2. Click "New Table"
3. Table name: `testimonials`
4. Add these columns:
   - `id` (uuid, primary key, default: gen_random_uuid())
   - `name` (text, required)
   - `company` (text, nullable)
   - `role` (text, nullable)
   - `content` (text, required)
   - `rating` (int4, default: 5)
   - `image_url` (text, nullable)
   - `is_active` (bool, default: true)
   - `display_order` (int4, default: 0)
   - `created_at` (timestamptz, default: now())
   - `updated_at` (timestamptz, default: now())

5. Enable RLS (Row Level Security)
6. Add policies as defined in the SQL file

## After Migration

Once the migration is complete:

1. **Add Real Testimonials:**
   - Go to: https://billbooky.dodail.com/admin/testimonials
   - Edit or delete the sample testimonials
   - Add real customer feedback

2. **Test the Carousel:**
   - Visit the homepage
   - The testimonial carousel should now work
   - It will auto-rotate every 5 seconds

3. **Manage Testimonials:**
   - Add new testimonials from admin dashboard
   - Reorder them using up/down arrows
   - Toggle active/inactive status
   - Edit or delete as needed

---

**Need Help?** If you continue to see errors, check the Supabase logs or contact support.
