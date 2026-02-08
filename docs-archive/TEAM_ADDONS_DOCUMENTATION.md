# Team Member Addons for Lifetime Plan

## Overview

Lifetime plan users can purchase additional team member slots beyond their base limit of 2 members. This addon system allows flexible team expansion with monthly or yearly billing options.

## Pricing

| Billing Period | Price per Slot | Duration | Savings |
|----------------|----------------|----------|---------|
| **Monthly** | ₹199/month | 30 days | - |
| **Yearly** | ₹2000/year | 365 days | 16% off |

**Example Calculations:**
- 1 additional slot (yearly): ₹2,000
- 3 additional slots (yearly): ₹6,000
- 5 additional slots (monthly): ₹995/month

## Features

### ✅ Core Functionality
- Purchase additional team member slots
- Monthly or yearly billing options
- Automatic slot activation after payment
- Track purchased slots and expiry dates
- Razorpay payment integration
- Activity logging for audit trail

### 🎯 Eligibility
**Only for Lifetime Plan users**
- Professional plan: Fixed 2 members (no addons)
- Lifetime plan: 2 base + unlimited purchasable slots
- Enterprise plan: Fixed 10 members (no addons)

## Database Schema

### `team_member_addons` Table
```sql
id UUID PRIMARY KEY
user_id UUID (FK to auth.users)
quantity INTEGER -- Number of slots purchased
price_per_slot INTEGER -- Price in paise
billing_period VARCHAR -- 'monthly' or 'yearly'
start_date TIMESTAMP
end_date TIMESTAMP -- Calculated based on duration
status VARCHAR -- 'active', 'expired', 'cancelled'
razorpay_order_id VARCHAR
razorpay_payment_id VARCHAR
auto_renew BOOLEAN
created_at, updated_at
```

### `team_addon_pricing` Table
```sql
id UUID PRIMARY KEY
billing_period VARCHAR -- 'monthly' or 'yearly'
price_per_slot INTEGER -- 19900 (₹199) or 200000 (₹2000)
duration_days INTEGER -- 30 or 365
display_price VARCHAR -- '₹199/month' or '₹2000/year'
is_active BOOLEAN
```

## Updated Functions

### `check_team_member_limit(p_owner_id UUID)`
Enhanced to include purchased slots:

**Returns:**
```typescript
{
  allowed: number          // Total allowed (base + purchased)
  current: number          // Currently used
  can_add: boolean         // Whether can add more
  base_limit: number       // Plan's base limit
  purchased_slots: number  // Active purchased slots
  plan_slug: string        // User's plan
}
```

**Logic:**
1. Get user's base plan limit
2. If Lifetime plan, add active purchased slots
3. Calculate if user can add more members

### `get_user_team_addons(p_user_id UUID)`
Get addon summary for user:

**Returns:**
```typescript
{
  total_purchased: number    // All-time total
  active_slots: number       // Currently active
  monthly_slots: number      // Active monthly subscriptions
  yearly_slots: number       // Active yearly subscriptions
  next_expiry: timestamp     // When next addon expires
}
```

## API Endpoints

### GET `/api/team/addons`
Get pricing options and user's current addons

**Response:**
```json
{
  "pricing": [
    {
      "id": "uuid",
      "billing_period": "yearly",
      "price_per_slot": 200000,
      "duration_days": 365,
      "display_price": "₹2000/year"
    }
  ],
  "currentAddons": [...],
  "activeSlots": 3,
  "isEligible": true
}
```

### POST `/api/team/addons`
Create order for purchasing addons

**Request:**
```json
{
  "quantity": 2,
  "billing_period": "yearly"
}
```

**Response:**
```json
{
  "order_id": "order_xyz",
  "amount": 400000,
  "amount_in_rupees": 4000,
  "currency": "INR",
  "quantity": 2,
  "billing_period": "yearly",
  "duration_days": 365,
  "price_per_slot": 200000
}
```

### POST `/api/team/addons/verify`
Verify payment and activate addon

**Request:**
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature",
  "quantity": 2,
  "billing_period": "yearly",
  "duration_days": 365,
  "price_per_slot": 200000
}
```

**Response:**
```json
{
  "success": true,
  "addon": { /* addon object */ },
  "message": "Successfully added 2 team member slot(s)!"
}
```

## UI Components

### `PurchaseAddonModal`
Modal for purchasing additional slots

**Features:**
- Quantity selector (1-10 slots)
- Billing period selection (monthly/yearly)
- Real-time price calculation
- Savings badge for yearly option
- Order summary
- Razorpay payment integration

**Props:**
```typescript
{
  isLifetimePlan: boolean
  currentSlots: number
  onSuccess: () => void
}
```

### Team Page Integration
- Shows purchased slots breakdown
- "Buy More Slots" button for Lifetime users
- Addon info card displaying active subscriptions
- Updated member limit display

## User Flow

### Purchase Flow

1. **Navigate to Team Page**
   - User sees current team member usage
   - Lifetime users see "Buy More Slots" button

2. **Open Purchase Modal**
   - Select quantity (1-10 slots)
   - Choose billing period (monthly/yearly)
   - See total price and savings

3. **Complete Payment**
   - Click "Purchase" button
   - Razorpay checkout opens
   - Complete payment via Razorpay

4. **Activation**
   - Payment verified via webhook
   - Slots activated immediately
   - Team limit updated
   - Activity logged

5. **Use New Slots**
   - Can now invite more team members
   - Slots valid until expiry date

## Payment Processing

### Razorpay Integration
1. Create order with addon details
2. Open Razorpay checkout
3. User completes payment
4. Verify signature on callback
5. Activate addon in database
6. Log in payment_history

### Security
- HMAC signature verification
- Server-side validation
- Authenticated user check
- Plan eligibility validation

## Monitoring & Management

### Check Active Addons
```sql
SELECT 
  user_id,
  quantity,
  billing_period,
  end_date,
  status
FROM team_member_addons
WHERE status = 'active'
  AND end_date > NOW()
ORDER BY end_date;
```

### Addon Revenue Report
```sql
SELECT 
  billing_period,
  COUNT(*) as total_purchases,
  SUM(quantity) as total_slots_sold,
  SUM(price_per_slot * quantity) as total_revenue
FROM team_member_addons
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY billing_period;
```

### Expiring Soon (Next 7 Days)
```sql
SELECT 
  u.email,
  tma.quantity,
  tma.billing_period,
  tma.end_date
FROM team_member_addons tma
JOIN auth.users u ON u.id = tma.user_id
WHERE tma.status = 'active'
  AND tma.end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY tma.end_date;
```

## Automatic Expiry Handling

### Cron Job (Recommended)
```sql
-- Mark expired addons
UPDATE team_member_addons
SET status = 'expired'
WHERE status = 'active'
  AND end_date < NOW();
```

**Schedule:** Run daily at midnight

### Impact on Team Access
When addon expires:
1. Status changes to 'expired'
2. `check_team_member_limit()` excludes expired slots
3. User may exceed new limit
4. Cannot invite new members until:
   - Remove existing members
   - Purchase new addons
   - Upgrade to Enterprise

## Best Practices

### For Users
1. **Choose Yearly**: Save 16% vs monthly billing
2. **Bulk Purchase**: Buy multiple slots at once
3. **Plan Ahead**: Purchase before current expires
4. **Monitor Expiry**: Check next expiry date
5. **Remove Inactive**: Free slots by removing unused members

### For Administrators
1. **Send Reminders**: Email 7 days before expiry
2. **Auto-renewal**: Add option in future update
3. **Usage Tracking**: Monitor addon utilization
4. **Support Queries**: Help users optimize costs

## Future Enhancements

### Phase 2
- [ ] Auto-renewal option
- [ ] Email reminders before expiry
- [ ] Prorated refunds on cancellation
- [ ] Bulk discount (5+ slots)
- [ ] Addon management page
- [ ] Payment method storage
- [ ] Invoice generation

### Phase 3
- [ ] Usage analytics per slot
- [ ] Seat reassignment
- [ ] Grace period after expiry
- [ ] Addon gifting/transfer
- [ ] Enterprise trial upgrades

## Troubleshooting

### Issue: Payment successful but slots not activated
**Solution:**
1. Check payment_history table for record
2. Verify razorpay_payment_id matches
3. Manually insert into team_member_addons if missing
4. Log activity for audit trail

### Issue: User at limit but shows can_add = true
**Solution:**
1. Refresh team limit with `check_team_member_limit()`
2. Check for expired addons (status = 'expired')
3. Verify team_members count matches

### Issue: Cannot purchase addons
**Solution:**
1. Verify user is on Lifetime plan
2. Check Razorpay credentials
3. Ensure team_addon_pricing has active records
4. Check browser console for errors

## FAQs

**Q: Can Professional plan users buy addons?**  
A: No, only Lifetime plan users can purchase additional slots.

**Q: What happens when addon expires?**  
A: Slots become unavailable. Existing members remain but you can't invite new ones until under limit.

**Q: Can I cancel and get refund?**  
A: Currently no refunds. Future update will add prorated refunds.

**Q: Do addons stack?**  
A: Yes! You can purchase multiple addons (monthly + yearly together).

**Q: Maximum slots I can purchase?**  
A: No hard limit, but UI allows 1-10 per transaction.

**Q: Will addons auto-renew?**  
A: Not yet. Manual renewal required before expiry.

---

**Module Status:** ✅ Production Ready

**Last Updated:** January 3, 2026

**Pricing Valid:** Current rates subject to change
