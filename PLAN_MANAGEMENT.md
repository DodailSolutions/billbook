# Plan Management System

## Overview

BillBooky now has a comprehensive plan management system with automatic expiry checks, invoice limits, and strict enforcement of subscription rules.

## Features

### 1. **Plan Types**
- **Free Plan**: Up to 300 invoices, basic features
- **Starter Plan**: ₹299/month, unlimited invoices, recurring billing, priority support
- **Professional Plan**: ₹599/month, everything in Starter + AI Accountant + team members
- **Lifetime Professional**: ₹9,999 one-time, unlimited invoices forever
- **Enterprise Plan**: ₹999/month, everything in Professional + 10 team members + advanced features

### 2. **Automatic Plan Expiry Checks**
- Modal popup when plan is expired or expiring within 7 days
- Dismissible reminders (1 hour for expired, 24 hours for expiring soon)
- Shows days remaining until expiry
- Highlights lifetime deal option

### 3. **Invoice Creation Limits**
- Free plan users limited to 300 invoices total
- Paid plan users have unlimited invoices
- Automatic checking before invoice creation
- Clear upgrade prompts when limit is reached

### 4. **Plan Status Banner**
- Sidebar displays current plan status
- Shows expiry date and days remaining
- Visual indicators for expiring plans
- Quick link to upgrade/renew

### 5. **Lifetime Deal Promotion**
- Prominent section on landing page
- Featured on pricing page with #lifetime-deal anchor
- 38% discount highlighted (₹15,999 → ₹9,999)
- One-time payment, lifetime access

## Implementation

### Plan Utility Functions (`lib/plan-utils.ts`)

```typescript
getUserPlanStatus() // Get user's current subscription status
checkInvoiceLimit() // Check if user can create invoices
checkPlanExpiry() // Check if plan needs renewal
```

### Components

1. **PlanExpiryModal** (`components/PlanExpiryModal.tsx`)
   - Displays when plan expires or is expiring soon
   - Shows upgrade options and lifetime deal
   - Dismissible with localStorage tracking

2. **PlanExpiryChecker** (`components/PlanExpiryChecker.tsx`)
   - Wrapper component that checks plan status
   - Automatically shows modal when needed

3. **PlanBanner** (`components/PlanBanner.tsx`)
   - Displays in sidebar
   - Shows current plan, expiry date, upgrade prompts

### Server Actions (`app/(dashboard)/plan-actions.ts`)

```typescript
getPlanStatus() // Get plan status for client components
getExpiryStatus() // Get expiry information
getInvoiceLimitStatus() // Get invoice limit information
```

### Protected Routes

- **New Invoice Page**: Checks invoice limits before allowing creation
- **Dashboard Layout**: Includes PlanExpiryChecker for all dashboard pages

## Database Schema

### Tables Required

1. **subscription_plans**
   - Plan details, pricing, features, limits
   - See `supabase-superadmin-schema.sql`

2. **user_subscriptions**
   - User's active subscriptions
   - Status tracking (active, cancelled, expired, trial)
   - Expiry dates and auto-renewal settings

3. **user_profiles**
   - User role and business information
   - Links to subscriptions

## Setup Instructions

1. **Run Database Migration**
   ```sql
   -- Run supabase-superadmin-schema.sql in Supabase SQL Editor
   ```

2. **Configure Plans** (Already seeded in migration)
   - Free: ₹0/lifetime
   - Starter: ₹299/month
   - Professional: ₹599/month
   - Lifetime Pro: ₹9,999/lifetime
   - Enterprise: ₹999/month

3. **Test Plan Enforcement**
   - Create test user with expired plan
   - Try creating invoices on free plan (test 300 limit)
   - Verify modal appears for expiring plans

## User Experience

### Free Plan Users
1. See "FREE PLAN" badge in sidebar with upgrade prompt
2. Usage counter shown: "X / 300 invoices used"
3. Blocked from creating invoices after 300 limit
4. Upgrade screen with clear call-to-action

### Paid Plan Users
1. Plan badge shows active status and expiry date
2. Warning at 7 days before expiry
3. Modal reminder to renew
4. Unlimited invoice creation

### Expired Plan Users
1. Immediate modal on dashboard access
2. Cannot create new invoices
3. Can view existing data
4. Upgrade/renew required to continue

## Plan Rules (Strictly Enforced)

✅ **Enforced:**
- Invoice creation limits for free plan (300 max)
- Plan expiry checks on dashboard access
- Invoice creation blocked for expired plans
- Plan status display in sidebar

📋 **Ready for Integration:**
- Razorpay payment gateway (for subscriptions only)
- Automatic plan renewal
- Trial period handling (14 days)
- Plan upgrade/downgrade logic

## Landing Page Improvements

### New Lifetime Deal Section
- Prominent hero section with gradient background
- Before/after pricing (₹15,999 → ₹9,999)
- Feature comparison grid
- Social proof indicators (500+ customers)
- Clear CTA buttons
- Fair usage disclaimer

### Enhanced Pricing Page
- Plan query parameters for signup (?plan=starter)
- Improved CTAs: "Start Free Trial" instead of "Get Started"
- Lifetime deal gets special #lifetime-deal anchor
- Better visual hierarchy with badges

## Future Enhancements

- [ ] Automatic Razorpay integration for plan purchase
- [ ] Email notifications for plan expiry
- [ ] Usage analytics dashboard
- [ ] Team member management for higher plans
- [ ] Plan feature toggles (AI Accountant, etc.)
- [ ] Coupon code support
- [ ] Referral program

## Testing Checklist

- [ ] Free user creates 300 invoices - gets blocked at 301
- [ ] Paid user creates unlimited invoices
- [ ] Plan expires - modal appears on next dashboard visit
- [ ] Plan expiring in 7 days - warning modal appears
- [ ] Lifetime plan - no expiry warnings
- [ ] Sidebar shows correct plan status
- [ ] Upgrade links work correctly
- [ ] Dismiss modal - doesn't show again for set period

## API Endpoints Needed (Future)

For complete subscription management:
- `POST /api/plans/subscribe` - Subscribe to plan
- `POST /api/plans/cancel` - Cancel subscription
- `POST /api/plans/renew` - Renew subscription
- `GET /api/plans/usage` - Get usage statistics
- `POST /api/webhooks/razorpay` - Handle payment webhooks

## Support

For issues or questions:
- Check [SUPERADMIN_SETUP.md](./SUPERADMIN_SETUP.md) for admin features
- Review [RAZORPAY_IMPLEMENTATION.md](./RAZORPAY_IMPLEMENTATION.md) for payment setup
- See [supabase-superadmin-schema.sql](./supabase-superadmin-schema.sql) for database schema
