# Super Admin: User Plan Upgrades

## Overview
Super admins can now upgrade any user's subscription plan directly from the admin dashboard without requiring payment.

## Features

### 🔧 Manual Plan Upgrades
- Upgrade any user to any plan
- Set custom duration (in days)
- Override existing subscriptions
- Track admin-initiated upgrades

### 📊 Available from User Management
Access: `/admin/users`

### 🎯 Capabilities
- View current user plan
- Select new plan from dropdown
- Set custom duration (30, 90, 180, 365 days or custom)
- See upgrade summary before confirming
- Automatic subscription management

## Usage

### From User Management Table

1. Navigate to **Admin → Users**
2. Click the three-dot menu (⋮) on any user row
3. Select **"Upgrade Plan"** (Crown icon)
4. In the modal:
   - View current plan (if any)
   - Select new plan from available options
   - Choose duration (quick select or custom days)
   - Review summary
   - Click "Upgrade Plan"

### Plan Options
All active plans from `subscription_plans` table:
- Free (₹0)
- Starter (₹299/month)
- Professional (₹599/month)
- Lifetime Professional (₹9,999 one-time)
- Enterprise (₹999/month)

### Duration Presets
- 30 days (1 month)
- 90 days (3 months)
- 180 days (6 months)
- 365 days (1 year)
- Custom (any number of days)

## Technical Implementation

### API Endpoint
**POST** `/api/admin/users/upgrade-plan`

**Request Body:**
```json
{
  "userId": "uuid",
  "planId": "uuid",
  "duration": 365
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully upgraded user to Professional plan for 365 days",
  "subscription": {
    "plan": "Professional",
    "startDate": "2026-01-03T...",
    "endDate": "2027-01-03T..."
  }
}
```

### Database Changes

**Existing Subscription:**
- Updates `plan_id`, `end_date`, `status`, `updated_at`
- Maintains subscription continuity

**New Subscription:**
- Creates new record in `user_subscriptions`
- Sets `payment_method` to `'admin_upgrade'`
- Records amount from plan price

**Payment History:**
- Logs admin upgrade in `payment_history`
- Metadata includes:
  - `plan_id` and `plan_name`
  - `duration_days`
  - `upgraded_by: 'super_admin'`

### Security

**Authorization:**
- Requires super admin role (`role = 'super_admin'`)
- Checked via `checkSuperAdminAccess()`
- Rejects unauthorized requests with 403

**Data Integrity:**
- Validates plan existence
- Validates required fields
- Atomic database operations
- Error handling with rollback

## Components

### UpgradePlanModal
**Location:** `/app/(superadmin)/admin/users/UpgradePlanModal.tsx`

**Props:**
- `userId`: Target user ID
- `userEmail`: User's email for display
- `currentPlan`: Current plan name (optional)
- `plans`: Available plans array
- `onClose`: Close callback
- `onSuccess`: Success callback (reloads page)

**Features:**
- Responsive modal design
- Plan selection cards
- Duration quick-select buttons
- Custom duration input
- Upgrade summary
- Loading states
- Error handling

### UserManagementTable Updates
**Location:** `/app/(superadmin)/admin/users/UserManagementTable.tsx`

**Changes:**
- Added "Upgrade Plan" option to action menu
- Fetches available plans on mount
- Opens upgrade modal with user context
- Reloads page after successful upgrade

## User Experience

### Admin Workflow
1. **View Users** → See all users with current plans
2. **Select User** → Click actions menu
3. **Choose Upgrade** → Opens modal
4. **Configure** → Select plan and duration
5. **Confirm** → Review summary
6. **Execute** → Instant upgrade
7. **Verify** → Page reloads with updated info

### Visual Feedback
- ✅ Success message on upgrade
- ⚠️ Error messages if issues occur
- 🔄 Loading spinner during processing
- 📊 Real-time summary preview

## Use Cases

### 1. **Trial Extensions**
Give users extended trial periods:
```
Plan: Professional
Duration: 30 days
Use: Test features before purchase
```

### 2. **Compensation/Refunds**
Provide service credits:
```
Plan: Current plan
Duration: +30 days
Use: Service downtime compensation
```

### 3. **Special Promotions**
Grant promotional access:
```
Plan: Lifetime Professional
Duration: 365 days
Use: Contest winners, partnerships
```

### 4. **Support Escalations**
Temporary upgrades for support:
```
Plan: Enterprise
Duration: 7 days
Use: Troubleshooting with premium features
```

### 5. **Migration Assistance**
Help users migrate plans:
```
Plan: Any
Duration: Custom
Use: Plan transition period
```

## Best Practices

### For Admins

**Before Upgrading:**
1. ✅ Verify user identity and email
2. ✅ Check current subscription status
3. ✅ Confirm upgrade reason (log it)
4. ✅ Calculate appropriate duration

**After Upgrading:**
1. ✅ Notify user via email (manual for now)
2. ✅ Document reason in support system
3. ✅ Monitor for any issues
4. ✅ Follow up if needed

**Duration Guidelines:**
- **Testing**: 7-14 days
- **Promotions**: 30-90 days
- **Compensation**: Match downtime
- **Special cases**: Discuss with team

### Important Notes

⚠️ **Manual Upgrades Bypass Payment:**
- No charge to user's payment method
- Marked as `admin_upgrade` in records
- Consider business impact

⚠️ **Existing Subscriptions:**
- System updates rather than creates new
- Previous end date is overridden
- No pro-rated calculations

⚠️ **User Notifications:**
- System doesn't auto-email users
- Manually notify users of changes
- Explain upgrade reason and duration

## Future Enhancements

### Planned Features
- [ ] Automated email notifications
- [ ] Upgrade reason field (required)
- [ ] Internal notes/comments
- [ ] Upgrade history log
- [ ] Bulk upgrade capability
- [ ] Schedule future upgrades
- [ ] Auto-downgrade on expiry
- [ ] Audit trail viewer
- [ ] Export upgrade reports

### Email Templates
When implemented:
```
Subject: Your BillBooky Plan Has Been Upgraded!

Hi [Name],

Great news! Your account has been upgraded to [Plan Name].

Duration: [X] days
End Date: [Date]

You now have access to:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Questions? Contact support@billbooky.com

Best regards,
BillBooky Team
```

## Troubleshooting

### Common Issues

**Issue:** "Plan not found"
**Solution:** Ensure plan ID is correct and plan is active

**Issue:** "Unauthorized"
**Solution:** Verify super admin role in user_profiles

**Issue:** "Failed to create subscription"
**Solution:** Check database logs, verify foreign keys

**Issue:** Modal won't open
**Solution:** Check browser console, verify plans loaded

### Debug Checklist
1. ✅ Super admin access granted?
2. ✅ User ID valid in database?
3. ✅ Plan ID exists and active?
4. ✅ Duration is positive number?
5. ✅ Database permissions correct?
6. ✅ API endpoint responding?

## Monitoring

### Key Metrics to Track
- Number of admin upgrades per month
- Average duration granted
- Most upgraded plans
- Upgrade success/failure rate
- Users who convert to paid after admin upgrade

### Database Queries

**Find all admin upgrades:**
```sql
SELECT * FROM payment_history 
WHERE payment_method = 'admin_upgrade'
ORDER BY created_at DESC;
```

**Count upgrades by plan:**
```sql
SELECT 
  metadata->>'plan_name' as plan,
  COUNT(*) as upgrade_count
FROM payment_history
WHERE payment_method = 'admin_upgrade'
GROUP BY metadata->>'plan_name';
```

**Users with admin-granted subscriptions:**
```sql
SELECT 
  u.email,
  sp.name as plan,
  us.end_date,
  us.status
FROM user_subscriptions us
JOIN auth.users u ON u.id = us.user_id
JOIN subscription_plans sp ON sp.id = us.plan_id
WHERE us.payment_method = 'admin_upgrade';
```

## Security Considerations

### Access Control
- ✅ Super admin role required
- ✅ Regular admins cannot upgrade
- ✅ Users cannot self-upgrade
- ✅ All upgrades logged

### Data Privacy
- ✅ Only authorized admins see user list
- ✅ Sensitive data protected
- ✅ Actions are auditable
- ✅ Complies with data regulations

### Abuse Prevention
- ✅ Action logging prevents abuse
- ✅ Super admin access is restricted
- ✅ Upgrades require active admin session
- ✅ No automated bulk operations (yet)
