# Voice-to-Invoice Quick Start

## 🚀 3-Step Setup

### Step 1: Run Database Migration
```bash
# In Supabase SQL Editor, paste and run:
```
Execute the file: `supabase-voice-invoice-migration.sql`

### Step 2: Add to Your Invoice Page
```tsx
// app/(dashboard)/invoices/new/page.tsx
import { VoiceToInvoice } from '@/components/voice-to-invoice'

export default function NewInvoicePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>
      
      {/* Voice-to-Invoice Component */}
      <VoiceToInvoice />
    </div>
  )
}
```

### Step 3: Test It!
1. Open the invoice creation page
2. Click "Start Recording"
3. Say: **"Create invoice for ABC Company for 50000 rupees"**
4. Click "Stop Recording"
5. Click "Process Transcript"
6. Review extracted data
7. Click "Create Invoice"

## 📝 Voice Command Examples

### Simple Invoice
```
"Create invoice for Tech Solutions for 25000 rupees"
```

### With Items
```
"New invoice for John Smith, 5 laptops at 45000 each, GST 18%"
```

### Detailed Invoice
```
"Make invoice for XYZ Ltd, 3 licenses at 20000 rupees, 
2 training sessions at 15000 rupees, dated today, due in 30 days"
```

### With GSTIN
```
"Create invoice for Acme Corp GSTIN 27AABCU9603R1ZM, 
consulting services 100000 rupees"
```

## ✨ What Gets Extracted Automatically

- ✅ **Customer Name** - "ABC Company", "John Smith"
- ✅ **Amount** - "50000 rupees", "₹25000", "Rs. 75000"
- ✅ **Items** - "5 laptops at 45000 each"
- ✅ **Date** - "today", "tomorrow", "15th January"
- ✅ **GST Rate** - "GST 18%", "tax 12 percent"
- ✅ **GSTIN** - 15-digit GST number
- ✅ **Due Date** - "due in 30 days"

## 🛠️ File Structure

```
/Users/ravitejmathurthi/Desktop/billbook/
├── supabase-voice-invoice-migration.sql  # Database schema
├── lib/
│   ├── voice-invoice-types.ts           # TypeScript types
│   ├── voice-invoice-utils.ts           # Client utilities
│   └── voice-invoice-actions.ts         # Server actions
├── components/
│   └── voice-to-invoice.tsx             # React component
└── VOICE_TO_INVOICE_GUIDE.md            # Full documentation
```

## 🔧 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Edge    | ✅ Full |
| Safari  | ⚠️ Limited |
| Firefox | ⚠️ Experimental |

**Note**: Requires HTTPS and microphone permission.

## 🎯 Integration with Existing Features

Voice-to-Invoice automatically works with:
- ✅ Smart GST auto-classification
- ✅ HSN/SAC suggestions
- ✅ Invoice series numbering
- ✅ Round-off calculations
- ✅ Compliance checks

## 🐛 Troubleshooting

### "Speech recognition not supported"
- Use Chrome or Edge browser
- Ensure you're on HTTPS (localhost is OK for development)

### "Microphone not working"
- Check browser permissions
- Allow microphone access when prompted

### "Customer not found"
- New customers are auto-created
- Existing customers matched by name

### "Amount not detected"
- Always use "rupees", "₹", or "Rs."
- Avoid "approximately" or "around"

## 📊 View Voice History

```sql
-- In Supabase SQL Editor
SELECT * FROM voice_invoice_summary 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

## 🔐 Security

- ✅ RLS policies on all tables
- ✅ User data isolated
- ✅ Encrypted storage
- ✅ No third-party data sharing

## 📚 Full Documentation

See `VOICE_TO_INVOICE_GUIDE.md` for:
- Complete API reference
- Advanced features
- Voice command patterns
- Analytics and reporting
- Best practices

## 💡 Tips for Best Results

1. **Speak clearly** at moderate pace
2. **Use currency terms** - "rupees", "₹"
3. **Be specific** with customer names
4. **Include units** - "5 laptops", "3 licenses"
5. **Review before creating** - Always verify extracted data

---

**Ready to start?** Just say the word! 🎤
