# 🎯 Quick Start: Super Admin Setup (5 Minutes)

## ⚡ Fast Track Setup

### 1️⃣ Database (2 min)
```bash
# Go to: https://supabase.com/dashboard
# Click: SQL Editor → New Query
# Copy: supabase-user-profiles-enhancement.sql
# Click: Run
```

### 2️⃣ Create Super Admin (2 min)
```sql
-- Sign up first via UI, then run:
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### 3️⃣ Access Analytics (1 min)
```
1. Sign in
2. Go to: /admin
3. Click: "Business Analytics"
4. Done! 🎉
```

## 📊 What You Get

### Analytics Dashboard: `/admin/analytics`
- Total users by business type
- Conversion rates
- Active vs paying breakdown
- Visual metrics

### Business Types Tracked:
1. Dental Clinic
2. IT Company  
3. Salon/Beauty Parlor
4. Car Detailing Shop
5. Car & Bike Wash
6. Spare Parts Shop
7. Medical Clinic
8. Restaurant/Cafe
9. Retail Store
10. Consulting Services
11. Other

## ✅ Verification

Test signup flow:
```
1. Sign out
2. Go to /pricing
3. Click "Get Started"
4. Fill signup form (select a business type)
5. Create account
6. Check: redirected correctly?
7. Sign in as super admin
8. Go to /admin/analytics
9. See: your test user in the stats!
```

## 🔥 Key SQL Queries

### Check your super admin status:
```sql
SELECT u.email, up.role, up.business_name
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'your-email@example.com';
```

### View analytics directly:
```sql
SELECT * FROM business_type_analytics;
```

### See all business types:
```sql
SELECT business_type, COUNT(*) as count
FROM user_profiles
WHERE business_type IS NOT NULL
GROUP BY business_type
ORDER BY count DESC;
```

## 🎊 That's It!

You now have a complete business intelligence system! 

**Full Guide**: See `SUPER_ADMIN_SETUP_COMPLETE.md` for detailed instructions and troubleshooting.
