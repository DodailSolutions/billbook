# Quick Start: Using New Zoho-Style Components

## 1. Setup Wizard (For New Users)

Add to your routing after signup:

```tsx
// app/welcome/page.tsx
'use client'

import { SetupWizard } from '@/components/SetupWizard'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()
  
  return (
    <SetupWizard 
      onComplete={() => {
        // Mark setup as complete
        router.push('/dashboard')
      }}
    />
  )
}
```

## 2. Enhanced Invoice Form

Update your invoice form to use the new components:

```tsx
// app/(dashboard)/invoices/new/page.tsx
import { CustomerSelector } from '@/components/CustomerSelector'
import { PaymentTermsSelector } from '@/components/PaymentTermsSelector'

export function InvoiceForm({ customers }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [paymentTerm, setPaymentTerm] = useState('due_on_receipt')
  const [simplifiedView, setSimplifiedView] = useState(true)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)

  return (
    <div>
      {/* Header with Simplified View Toggle */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">New Invoice</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Use Simplified View</span>
          <button
            type="button"
            onClick={() => setSimplifiedView(!simplifiedView)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              simplifiedView ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              simplifiedView ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Customer Selector */}
      <CustomerSelector
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onCustomerSelect={(id) => setSelectedCustomerId(id)}
        onAddNew={() => setShowAddCustomerModal(true)}
        required={true}
      />

      {/* Payment Terms */}
      <PaymentTermsSelector
        value={paymentTerm}
        onChange={(termId, days) => {
          setPaymentTerm(termId)
          // Auto-calculate due date based on days
          if (days !== null) {
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + days)
            setDueDate(dueDate.toISOString().split('T')[0])
          }
        }}
      />

      {/* Rest of your form... */}
    </div>
  )
}
```

## 3. Checking if Setup is Complete

Add a middleware or layout check:

```tsx
// app/(dashboard)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    const setupCompleted = localStorage.getItem('setupCompleted')
    
    if (!setupCompleted && pathname !== '/welcome') {
      router.push('/welcome')
    }
  }, [pathname, router])

  return children
}
```

## 4. Dashboard with Tabs

The dashboard now automatically includes tabs. No changes needed!

```tsx
// app/(dashboard)/dashboard/page.tsx
// Already updated to include DashboardTabs component
```

## 5. Recurring Invoices Empty State

The recurring invoices page now shows the beautiful lifecycle diagram automatically when there are no invoices.

## Component Features Cheat Sheet

### CustomerSelector
```tsx
<CustomerSelector
  customers={Customer[]}           // Array of customer objects
  selectedCustomerId={string}       // Currently selected customer ID
  onCustomerSelect={(id) => void}   // Callback when customer selected
  onAddNew={() => void}             // Callback for "New Customer" button
  label="Customer Name"             // Optional label (default: "Customer Name")
  required={true}                   // Optional required flag (default: true)
/>
```

### PaymentTermsSelector
```tsx
<PaymentTermsSelector
  value={string}                    // Selected term ID
  onChange={(termId, days) => void} // Callback with term ID and due days
  onConfigureClick={() => void}     // Optional configure button callback
  label="Terms"                     // Optional label (default: "Terms")
/>
```

### SetupWizard
```tsx
<SetupWizard
  onComplete={() => void}           // Called when wizard completes
  initialStep={1}                   // Optional starting step (1-3)
/>
```

## Available Payment Terms

- `due_on_receipt` - Payment due immediately (0 days)
- `due_end_month` - Due end of next month
- `due_end_of_month` - Due end of the month
- `net_15` - Payment due in 15 days
- `net_30` - Payment due in 30 days
- `net_45` - Payment due in 45 days
- `net_60` - Payment due in 60 days

## Styling Notes

All components:
- Support dark mode automatically
- Use Tailwind CSS classes
- Are fully responsive
- Include hover/focus states
- Have smooth animations

## TypeScript Types

```typescript
// Customer type
interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

// Payment term type
interface PaymentTerm {
  id: string
  label: string
  days: number | null
  description?: string
}
```

## Testing Checklist

- [ ] Setup wizard flows through all 3 steps
- [ ] Customer selector search works
- [ ] Payment terms dropdown functions correctly
- [ ] Simplified view toggle works on invoice form
- [ ] Dashboard tabs switch properly
- [ ] Recurring invoices empty state displays lifecycle diagram
- [ ] Dark mode works on all components
- [ ] Mobile responsive on all screen sizes
- [ ] Keyboard navigation works

## Common Issues

**Issue:** Customer selector not closing on outside click
**Solution:** Make sure the dropdown is properly mounted and the ref is attached

**Issue:** Dashboard shows old layout without tabs
**Solution:** Clear browser cache and ensure DashboardTabs component is imported

**Issue:** Payment terms not updating due date
**Solution:** Implement the onChange callback to calculate and set the due date

## Additional Resources

- See [ZOHO_UI_IMPROVEMENTS.md](./ZOHO_UI_IMPROVEMENTS.md) for detailed documentation
- Check component source code for inline comments
- Refer to Zoho Invoice screenshots for design reference

---

**Need Help?** Check the component source files for detailed implementation examples!
