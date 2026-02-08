# Sidebar Navigation Guide

## Role-Based Navigation

The sidebar navigation dynamically adapts based on the user's role in the system.

### How It Works

**File:** [components/Sidebar.tsx](components/Sidebar.tsx)

The sidebar checks if the current user is a Chartered Accountant (CA) by calling `getMyCAProfile()` when the component mounts. Based on this check, it shows different navigation options.

### Navigation Items

#### For Regular Customers
- Shows **"Hire CA"** with `UserPlus` icon
- Links to `/reports/hire-ca`
- Allows customers to post requirements and hire CAs

#### For CA Professionals
- Shows **"CA Dashboard"** with `Briefcase` icon
- Links to `/ca-dashboard`
- Allows CAs to manage clients, proposals, and engagements

### Implementation Details

```typescript
const [isCA, setIsCA] = useState<boolean | null>(null)

useEffect(() => {
    async function checkCAStatus() {
        const profile = await getMyCAProfile()
        setIsCA(!!profile)
    }
    checkCAStatus()
}, [])
```

The navigation item is conditionally rendered:

```typescript
...(isCA !== null ? [{
    label: isCA ? 'CA Dashboard' : 'Hire CA',
    icon: isCA ? Briefcase : UserPlus,
    href: isCA ? '/ca-dashboard' : '/reports/hire-ca',
    color: "text-emerald-500",
}] : [])
```

### Related Pages

- **Customer Path:** [/reports/hire-ca](app/(dashboard)/reports/hire-ca/page.tsx)
  - Hire request form
  - CA marketplace browse
  - CA profiles and proposals
  
- **CA Professional Path:** [/ca-dashboard](app/(dashboard)/ca-dashboard/page.tsx)
  - Client management
  - Proposal management
  - Engagement tracking
  - Analytics and reports

### CA Profile Check

The system uses the `ca_professionals` table to determine if a user is a CA:

```typescript
// lib/ca-profile-actions.ts
export async function getMyCAProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data } = await supabase
    .from('ca_professionals')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  return data
}
```

### User Experience

- **Initial Load:** Navigation item doesn't show until CA status is determined
- **State Changes:** If a user registers as a CA, they need to refresh/re-login to see the CA Dashboard
- **Seamless:** No page reload required, handled via React state

## Benefits

1. **Clean UX:** Users only see relevant navigation options
2. **Role Separation:** Clear distinction between customer and CA workflows
3. **Scalable:** Easy to add more role-based navigation items
4. **Secure:** Server-side validation on all CA pages regardless of sidebar link

## Future Enhancements

- Add loading skeleton while checking CA status
- WebSocket/real-time updates when user becomes a CA
- Additional role-based menu sections
- Hide/show other navigation items based on subscription plan
