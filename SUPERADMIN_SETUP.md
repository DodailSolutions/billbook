# Super Admin Module Setup Guide

## Overview

The Super Admin module provides comprehensive administrative controls for managing users, subscriptions, payments, refunds, support tickets, and more.

## Database Setup

1. **Run the migration SQL file:**
   ```bash
   # Execute the SQL file in your Supabase SQL Editor
   # File: supabase-superadmin-schema.sql
   ```

2. **Create your first super admin:**
   ```sql
   -- After user signup, promote to super admin
   INSERT INTO user_profiles (id, role, status)
   VALUES ('your-user-id-from-auth-users', 'super_admin', 'active')
   ON CONFLICT (id) DO UPDATE
   SET role = 'super_admin';
   ```

## Features

### ✅ Implemented

1. **Dashboard** (`/admin`)
   - Real-time stats (sales, payments, refunds)
   - User metrics (total users, active subscriptions)
   - Quick action cards
   - Recent activity log

2. **User Management** (`/admin/users`)
   - View all users with details
   - Update user roles (user, admin, super_admin)
   - Change user status (active, suspended, inactive)
   - Search and filter users
   - User statistics

3. **Database Schema**
   - User profiles with roles
   - Subscription plans
   - Payments and transactions
   - Refunds management
   - Support tickets system
   - Coupons and offers
   - Audit logs
   - Row Level Security (RLS) policies

4. **Authentication & Authorization**
   - Super admin role checking
   - Access control middleware
   - Audit logging for all actions

### 🚧 Ready for Implementation

The following pages have basic structure and need full implementation:

1. **Plans Management** (`/admin/plans`)
   - CRUD operations for subscription plans
   - Configure pricing and features
   - Set usage limits

2. **Coupons & Offers** (`/admin/coupons`)
   - Create discount codes
   - Set validity periods
   - Track coupon usage

3. **Payments** (`/admin/payments`)
   - View all transactions
   - Filter by status, date
   - Export payment reports

4. **Refunds** (`/admin/refunds`)
   - Process refund requests
   - Approve/reject refunds
   - Track refund history

5. **Support Tickets** (`/admin/support`)
   - View all tickets
   - Assign tickets to admins
   - Respond to customers
   - Close/resolve tickets

6. **Business Management** (`/admin/businesses`)
   - View all companies
   - Manage business profiles
   - Monitor business activity

## Access Control

### Roles

- **super_admin**: Full access to all features
- **admin**: Limited administrative access (future)
- **user**: Regular user access

### Checking Access

```typescript
import { checkSuperAdminAccess } from '@/lib/admin-auth'

const isSuperAdmin = await checkSuperAdminAccess()
if (!isSuperAdmin) {
  // Redirect or show error
}
```

## Security

1. **Row Level Security (RLS)**
   - All tables have RLS policies
   - Super admins can access all data
   - Users can only access their own data

2. **Audit Logging**
   - All admin actions are logged
   - Includes user ID, action type, entity changes
   - IP address and user agent tracking

3. **Session Management**
   - Uses Supabase Auth
   - Automatic session refresh
   - Secure token handling

## UI/UX Features

- **Modern Design**: Gradient backgrounds, smooth transitions
- **Responsive**: Mobile-first design
- **Dark Mode**: Full dark mode support
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Server-side rendering, optimized queries

## API Routes

All admin actions use Server Actions for security:

- `app/(superadmin)/admin/actions.ts` - Dashboard stats
- `app/(superadmin)/admin/users/actions.ts` - User management
- More action files for each module

## Environment Variables

No additional environment variables needed beyond existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Usage

### 1. Create Super Admin

```sql
-- In Supabase SQL Editor
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = 'user-id-from-auth';
```

### 2. Access Dashboard

Navigate to `/admin` after logging in with super admin account.

### 3. Manage Users

- Go to `/admin/users`
- Click on user actions to change role or status
- Search users by name, email, or business

## Development Roadmap

### Phase 1 (Completed)
- ✅ Database schema
- ✅ Authentication & authorization
- ✅ Dashboard layout
- ✅ User management
- ✅ Basic stats and metrics

### Phase 2 (Next Steps)
- 📋 Complete plans management CRUD
- 📋 Implement coupon system
- 📋 Add payment gateway integration
- 📋 Build refund processing workflow
- 📋 Create support ticket system

### Phase 3 (Future)
- 📋 Analytics and reports
- 📋 Email notifications
- 📋 Bulk operations
- 📋 Export/import data
- 📋 API access management

## Customization

### Adding New Admin Features

1. Create new route under `app/(superadmin)/admin/`
2. Add action file for server-side logic
3. Update navigation in dashboard
4. Add RLS policies if needed

### Styling

Uses Tailwind CSS with custom gradient themes:
- Primary: Blue-Indigo-Purple gradient
- Cards: Shadow and hover effects
- Icons: Lucide React

## Troubleshooting

### Access Denied

- Ensure user role is set to 'super_admin' in user_profiles
- Check RLS policies are enabled
- Verify Supabase connection

### Missing Data

- Run migration SQL file
- Check table permissions
- Verify RLS policies

### Performance Issues

- Add indexes for frequently queried columns
- Implement pagination for large datasets
- Use React Server Components for better performance

## Support

For issues or questions:
- Check documentation in `/docs`
- Review SQL schema: `supabase-superadmin-schema.sql`
- Email: support@dodail.com

---

**Status**: ✅ Core Features Implemented | 🚧 Additional Features In Progress
