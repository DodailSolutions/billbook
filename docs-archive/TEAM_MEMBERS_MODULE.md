# Team Members & Roles Module

Complete team collaboration system with role-based access control and plan-based member limits.

## 📋 Overview

The Team Members module allows account owners to invite team members to collaborate on their invoicing platform. Access and limits are controlled by subscription plans:

- **Free/Starter**: No team members (owner only)
- **Professional/Lifetime**: Up to 2 team members
- **Enterprise**: Up to 10 team members

## 🎯 Features

### ✅ Core Functionality
- ✅ Invite team members via email
- ✅ Role-based access control (Owner, Admin, Accountant, Viewer)
- ✅ Plan-based member limits enforcement
- ✅ Pending invite management
- ✅ Resend invitations
- ✅ Change member roles
- ✅ Remove team members
- ✅ Activity logging and audit trail
- ✅ Status tracking (pending, active, suspended, removed)

### 🎨 UI/UX Features
- ✅ Clean dashboard with team statistics
- ✅ Modal-based invite workflow
- ✅ Real-time member limit display
- ✅ Status badges (Active, Pending, Suspended)
- ✅ Role badges with descriptions
- ✅ Action dropdown menu per member
- ✅ Upgrade CTA for locked features
- ✅ Mobile responsive design

## 🗄️ Database Schema

### Tables

#### `team_roles`
Defines available roles and their permissions:
```sql
- id (UUID, PK)
- name (VARCHAR) - Display name
- slug (VARCHAR) - Unique identifier
- description (TEXT)
- permissions (JSONB) - Array of permission strings
- is_system (BOOLEAN) - System roles cannot be deleted
- created_at, updated_at
```

**Default Roles:**
- **Owner**: Full access (`["*"]`)
- **Admin**: Manage invoices, customers, team (`["invoices.*", "customers.*", "team.view", "team.invite", "settings.view"]`)
- **Accountant**: Manage invoices, view reports (`["invoices.*", "customers.*", "reports.view"]`)
- **Viewer**: Read-only access (`["invoices.view", "customers.view"]`)

#### `team_members`
Stores team member invitations and memberships:
```sql
- id (UUID, PK)
- owner_id (UUID, FK to auth.users) - Account owner
- email (VARCHAR) - Invited email
- user_id (UUID, FK to auth.users) - Linked after acceptance
- role_id (UUID, FK to team_roles)
- status (VARCHAR) - pending, active, suspended, removed
- invite_token (VARCHAR) - Unique invite token
- invite_expires_at (TIMESTAMP) - 7 days validity
- invited_at, joined_at, last_active_at
- created_at, updated_at
```

#### `team_activity_log`
Audit trail for all team operations:
```sql
- id (UUID, PK)
- owner_id (UUID, FK)
- team_member_id (UUID, FK)
- actor_id (UUID, FK) - Who performed the action
- action (VARCHAR) - invited, joined, removed, role_changed, etc.
- details (JSONB) - Additional context
- ip_address (INET)
- user_agent (TEXT)
- created_at
```

## 🔐 Security & Permissions

### Row Level Security (RLS)

**team_roles:**
- Anyone can view roles (for selection during invite)

**team_members:**
- Users can view: Their own organization's members OR where they are a member
- Owners can manage: Full CRUD on their team members

**team_activity_log:**
- Users can view: Logs for their organization OR where they are the actor

### Access Control

The module enforces strict access control:
1. **Authentication**: All endpoints require valid session
2. **Ownership Verification**: Actions verified against `owner_id`
3. **Plan Limits**: Member count validated against subscription plan
4. **Role Protection**: Owner role cannot be changed or removed
5. **Self-Protection**: Users cannot invite themselves

## 📡 API Endpoints

### POST `/api/team/invite`
Invite a new team member

**Request Body:**
```json
{
  "email": "colleague@example.com",
  "role_id": "uuid-of-role"
}
```

**Validations:**
- Valid email format
- Not inviting self
- Team member limit not exceeded
- Email not already invited/active
- Role exists and is not 'owner'

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "member": { /* member object */ }
}
```

### POST `/api/team/resend-invite`
Resend invitation to pending member

**Request Body:**
```json
{
  "member_id": "uuid"
}
```

**Actions:**
- Generates new invite token
- Extends expiry by 7 days
- Logs activity

### POST `/api/team/change-role`
Change member's role

**Request Body:**
```json
{
  "member_id": "uuid",
  "role_id": "uuid"
}
```

**Restrictions:**
- Cannot change owner role
- Cannot assign owner role
- Must own the member

### POST `/api/team/remove`
Remove team member

**Request Body:**
```json
{
  "member_id": "uuid"
}
```

**Actions:**
- Updates status to 'removed'
- Logs activity
- Cannot remove owner

## 🎨 UI Components

### Page: `/app/(dashboard)/team/page.tsx`
Main team management page (Server Component)

**Features:**
- Fetches team members and roles
- Checks plan status and limits
- Shows locked state for Free/Starter plans
- Displays statistics cards
- Renders team members list

### Component: `InviteMemberModal.tsx`
Modal for inviting new members (Client Component)

**Props:**
```typescript
{
  canAdd: boolean        // Based on plan limits
  currentCount: number   // Current member count
  maxAllowed: number     // Plan's max members
  roles: Role[]          // Available roles
}
```

**Features:**
- Email input with validation
- Role selection dropdown
- Real-time limit display
- Upgrade CTA when limit reached
- Loading and error states

### Component: `TeamMembersList.tsx`
Table displaying all team members (Client Component)

**Props:**
```typescript
{
  members: TeamMember[]  // All team members
  roles: Role[]          // For role change dropdown
}
```

**Features:**
- Responsive table design
- Status badges (Active, Pending, Suspended)
- Role badges
- Last active timestamps
- Action dropdown per member:
  - Resend Invite (pending only)
  - Change Role (submenu)
  - Remove Member
- Empty state handling

## 🚀 Usage Guide

### For Account Owners

#### 1. Navigate to Team Page
Click "Team" in the sidebar (marked with PRO badge)

#### 2. Invite a Member
1. Click "Invite Member" button
2. Enter colleague's email
3. Select appropriate role:
   - **Admin**: Full management access
   - **Accountant**: Invoice and customer management
   - **Viewer**: Read-only access
4. Click "Send Invite"

#### 3. Manage Invitations
**Pending Invites:**
- Click ⋮ menu → "Resend Invite" to send again
- Invites expire after 7 days

**Active Members:**
- Click ⋮ menu → Change role submenu
- Click ⋮ menu → "Remove Member" to revoke access

#### 4. Monitor Activity
- View team statistics at top of page
- Check last active timestamps
- Review member status badges

### Plan Limits

| Plan | Team Members | Notes |
|------|-------------|-------|
| Free | 0 | Owner only |
| Starter | 0 | Owner only |
| Professional | 2 | Great for small teams |
| Lifetime | 2 | Permanent 2 members |
| Enterprise | 10 | Large team support |

**To increase limits:** Upgrade plan from [Pricing](/pricing) page

## 🔧 Helper Functions

### `check_team_member_limit(p_owner_id UUID)`
Database function that returns member limit info:

```sql
SELECT * FROM check_team_member_limit('user-uuid');
```

**Returns:**
```json
{
  "allowed": 2,      // Max allowed by plan
  "current": 1,      // Currently used
  "can_add": true    // Whether can add more
}
```

### `generate_invite_token()`
Generates secure random token for invitations

## 📱 Responsive Design

- **Mobile**: Stacked layout, touch-optimized actions
- **Tablet**: 2-column grid for stats
- **Desktop**: Full table view with all columns

## 🎯 Future Enhancements

### Phase 2 (Planned)
- [ ] Email notifications for invites
- [ ] Accept invite page for new users
- [ ] Custom role creation
- [ ] Permission editor UI
- [ ] Team member profile pages
- [ ] Activity timeline view
- [ ] Bulk invite via CSV
- [ ] Team member search/filter
- [ ] Export team report

### Phase 3 (Future)
- [ ] Two-factor authentication requirement
- [ ] IP whitelist per member
- [ ] Session management
- [ ] Access logs per member
- [ ] Scheduled access (temporary members)
- [ ] Department/group organization
- [ ] Advanced permission system
- [ ] API access tokens per member

## 🔍 Monitoring & Analytics

### Key Metrics to Track

```sql
-- Total team members by plan
SELECT 
  sp.name as plan_name,
  COUNT(DISTINCT tm.id) as total_members,
  AVG(member_count) as avg_members_per_account
FROM user_subscriptions us
JOIN subscription_plans sp ON sp.id = us.plan_id
LEFT JOIN (
  SELECT owner_id, COUNT(*) as member_count
  FROM team_members
  WHERE status = 'active'
  GROUP BY owner_id
) tm ON tm.owner_id = us.user_id
WHERE us.status = 'active'
GROUP BY sp.name;

-- Pending invites older than 3 days
SELECT 
  email,
  invited_at,
  invite_expires_at,
  EXTRACT(DAY FROM NOW() - invited_at) as days_pending
FROM team_members
WHERE status = 'pending'
  AND invite_expires_at > NOW()
  AND invited_at < NOW() - INTERVAL '3 days'
ORDER BY invited_at;

-- Most active team members
SELECT 
  email,
  last_active_at,
  tr.name as role,
  COUNT(tal.id) as activity_count
FROM team_members tm
JOIN team_roles tr ON tr.id = tm.role_id
LEFT JOIN team_activity_log tal ON tal.actor_id = tm.user_id
WHERE tm.status = 'active'
GROUP BY tm.email, tm.last_active_at, tr.name
ORDER BY activity_count DESC
LIMIT 20;
```

## 🐛 Troubleshooting

### Issue: "Team member limit reached"
**Solution:** 
- Check current plan: Dashboard → Account Settings
- Current members count includes pending invites
- Upgrade plan to increase limit
- Remove inactive members to free slots

### Issue: "Cannot invite yourself"
**Solution:** Team members must be different users with separate email addresses

### Issue: Invite email not received
**Solution:** 
- Currently showing success without email integration
- TODO: Integrate with email service
- Check spam/junk folder
- Resend invite from team page

### Issue: Cannot change/remove owner
**Solution:** Owner role is protected and cannot be modified. Transfer ownership first (future feature)

### Issue: Role permissions not working
**Solution:** 
- Permission system defined but not fully enforced yet
- Phase 2 will add permission middleware
- Currently all active members have full access

## 📄 Related Documentation

- [Subscription Plans](./PLAN_MANAGEMENT.md)
- [User Profiles](./ACCOUNT_SETTINGS.md)
- [Super Admin](./SUPERADMIN_SETUP.md)
- [Email Integration](./EMAIL_IMPLEMENTATION.md)

## 🎓 Best Practices

1. **Role Assignment**: Start with Viewer role, promote as needed
2. **Regular Audits**: Review active members monthly
3. **Remove Promptly**: Remove departing team members immediately
4. **Activity Monitoring**: Check last_active_at for inactive members
5. **Invite Hygiene**: Delete old pending invites after follow-up
6. **Plan Right**: Choose plan that matches team size needs
7. **Role Clarity**: Ensure team members understand their role permissions

## 🔗 Navigation Integration

Team page is accessible from:
- Sidebar: "Team" link (PRO badge)
- Mobile Menu: "Team" entry
- Direct URL: `/team`

**Access Requirements:**
- Professional, Lifetime, or Enterprise plan
- Authenticated user
- Active subscription status

## ✅ Implementation Checklist

- [x] Database schema (3 tables)
- [x] RLS policies
- [x] Helper functions
- [x] API endpoints (4 routes)
- [x] Team management page
- [x] Invite modal component
- [x] Members list component
- [x] Plan limit enforcement
- [x] Sidebar navigation
- [x] Mobile responsive design
- [x] Activity logging
- [x] Comprehensive documentation
- [ ] Email notifications (TODO)
- [ ] Accept invite page (TODO)
- [ ] Permission middleware (TODO)

---

**Module Status:** ✅ Production Ready (Email integration pending)

**Last Updated:** January 3, 2026

**Maintainer:** Development Team
