# Voice-to-Invoice Feature Guide

## Overview

The Voice-to-Invoice feature enables users to create invoices by simply speaking. Using advanced speech recognition and natural language processing, the system automatically extracts invoice details from voice commands and creates structured invoices.

## Features

### 🎤 Core Capabilities
- **Speech Recognition**: Real-time voice-to-text conversion using Web Speech API
- **Natural Language Processing**: Intelligent extraction of invoice entities (customer, items, amounts, dates)
- **Multi-language Support**: Supports English (Indian and US), Hindi, and other languages
- **Smart Entity Extraction**: Automatically identifies customers, amounts, dates, GST rates, items
- **Validation**: Real-time validation of extracted data
- **Voice Commands**: Support for complex voice commands
- **Template Learning**: System learns from frequently used phrases

### 📊 Database Schema

#### Tables Created
1. **voice_recordings** - Stores audio recordings metadata
2. **voice_transcriptions** - Stores transcribed text
3. **voice_invoice_parsing** - Stores parsed invoice data
4. **voice_commands_log** - Logs all voice commands
5. **voice_invoice_templates** - Stores voice command templates

#### Functions
- `extract_invoice_entities()` - Extract entities from transcript
- `validate_voice_invoice_data()` - Validate parsed invoice data

#### Views
- `voice_invoice_summary` - Complete summary of voice-to-invoice sessions

## Implementation Guide

### Step 1: Run Database Migration

```sql
-- Execute in Supabase SQL Editor
\i supabase-voice-invoice-migration.sql
```

This creates:
- 5 tables with RLS policies
- 2 helper functions
- 1 summary view
- Sample voice command templates

### Step 2: Add Voice Component to Invoice Page

```tsx
// app/(dashboard)/invoices/new/page.tsx
import { VoiceToInvoice } from '@/components/voice-to-invoice'

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <h1>Create Invoice</h1>
      
      {/* Voice-to-Invoice Section */}
      <VoiceToInvoice />
      
      {/* OR: Traditional Invoice Form */}
      <InvoiceForm />
    </div>
  )
}
```

### Step 3: Setup Permissions (Browser)

The feature requires microphone access. Users will see a permission prompt on first use.

```tsx
// Check permissions
if (navigator.permissions) {
  navigator.permissions.query({ name: 'microphone' }).then(result => {
    if (result.state === 'granted') {
      // Ready to use
    } else if (result.state === 'prompt') {
      // Will prompt user
    } else {
      // Permission denied
    }
  })
}
```

## Usage Examples

### Example 1: Simple Invoice

**Say:**
> "Create invoice for ABC Company for 50000 rupees"

**Result:**
- Customer: ABC Company (auto-created if new)
- Amount: ₹50,000
- Status: Draft (ready for review)

### Example 2: Detailed Invoice

**Say:**
> "New invoice for John Smith, 5 laptops at 45000 rupees each, GST 18%, dated today"

**Result:**
- Customer: John Smith
- Items: 5 × Laptops @ ₹45,000 = ₹2,25,000
- GST: 18%
- Total: ₹2,65,500
- Date: Today's date

### Example 3: Multi-Item Invoice

**Say:**
> "Make invoice for XYZ Ltd, 3 licenses at 20000 each and 2 training sessions at 15000 each, total 90000, due in 30 days"

**Result:**
- Customer: XYZ Ltd
- Items: 
  - 3 × Licenses @ ₹20,000 = ₹60,000
  - 2 × Training sessions @ ₹15,000 = ₹30,000
- Subtotal: ₹90,000
- Due Date: 30 days from today

### Example 4: With Customer GSTIN

**Say:**
> "Create invoice for Acme Corp GSTIN 27AABCU9603R1ZM, consulting services 100000 rupees"

**Result:**
- Customer: Acme Corp
- GSTIN: 27AABCU9603R1ZM
- Items: Consulting services
- Amount: ₹1,00,000
- GST Type: Auto-determined (IGST/CGST+SGST based on state)

## Voice Commands Reference

### Supported Phrases

| Intent | Example Phrases |
|--------|----------------|
| Create Invoice | "Create invoice for...", "New invoice...", "Make bill for..." |
| Customer | "Customer ABC", "For John Smith", "Client XYZ Ltd" |
| Amount | "50000 rupees", "₹25000", "Rs. 75000" |
| Items | "5 laptops at 45000 each", "3 licenses @ 20000" |
| Date | "Today", "Tomorrow", "15th January", "January 15" |
| GST | "GST 18%", "Tax 12 percent", "Plus 18% GST" |
| Due Date | "Due in 30 days", "Payment in 15 days" |
| Notes | "Note: Rush delivery required" |

### Command Types

1. **create_invoice** - Create new invoice
2. **add_item** - Add item to current invoice
3. **update_customer** - Modify customer details
4. **set_date** - Set invoice/due date
5. **set_amount** - Set/modify amount
6. **add_note** - Add notes to invoice
7. **apply_discount** - Apply discount
8. **finalize_invoice** - Complete and save invoice

## API Reference

### Client-Side Functions

```typescript
// Check browser support
isSpeechRecognitionSupported(): boolean

// Initialize recognition
initializeSpeechRecognition(config: VoiceInvoiceConfig): SpeechRecognition

// Parse transcript
parseInvoiceFromTranscript(transcript: string): Partial<VoiceParsedInvoiceData>

// Extract entities
extractCustomerName(transcript: string): string | null
extractNumbers(text: string): number[]
extractDate(transcript: string): Date | null
extractInvoiceItems(transcript: string): VoiceParsedInvoiceItem[]

// Validate data
validateParsedInvoice(data: Partial<VoiceParsedInvoiceData>): ValidationResult
```

### Server Actions

```typescript
// Create recording session
createVoiceRecording(data: {
  recording_url?: string
  duration_seconds?: number
  file_size_bytes?: number
}): Promise<Result>

// Save transcription
saveTranscription(data: {
  voice_recording_id: string
  raw_transcript: string
  confidence_score?: number
}): Promise<Result>

// Parse and save
parseAndSaveInvoiceData(data: {
  voice_recording_id: string
  transcription_id: string
  parsed_data: VoiceParsedInvoiceData
}): Promise<Result>

// Create invoice
createInvoiceFromVoice(data: {
  voice_recording_id: string
  parsed_data: VoiceParsedInvoiceData
  auto_finalize?: boolean
}): Promise<Result>
```

## Configuration

### Voice Recognition Config

```typescript
const config: VoiceInvoiceConfig = {
  language: 'en-IN',        // Indian English
  continuous: true,         // Keep listening
  interimResults: true,     // Show partial results
  maxAlternatives: 3,       // Number of alternatives
  autoSubmit: false,        // Manual submission
  confirmationRequired: true // Confirm before creating
}
```

### Supported Languages

- `en-IN` - English (India) - **Recommended**
- `en-US` - English (US)
- `hi-IN` - Hindi (India)
- `en-GB` - English (UK)

## Advanced Features

### 1. Template Learning

System learns from frequently used phrases:

```sql
-- View learned templates
SELECT * FROM voice_invoice_templates 
WHERE user_id = current_user_id()
ORDER BY usage_count DESC
LIMIT 10
```

### 2. Command Logging

All voice commands are logged for analysis:

```sql
-- View command history
SELECT * FROM voice_commands_log
WHERE user_id = current_user_id()
ORDER BY created_at DESC
```

### 3. Confidence Scoring

Each transcription and parsing includes confidence scores:

```typescript
interface Confidence {
  transcription_confidence: 0.0 - 1.0
  parsing_confidence: 0.0 - 1.0
  overall_confidence: 0.0 - 1.0
}
```

### 4. Multi-Step Conversations

Support for iterative invoice creation:

```typescript
// Step 1: Create base
"Create invoice for ABC Company"

// Step 2: Add items
"Add 5 laptops at 45000 each"

// Step 3: Set date
"Date it for tomorrow"

// Step 4: Finalize
"Finalize the invoice"
```

## Troubleshooting

### Issue: Microphone Not Working

**Solution:**
1. Check browser permissions
2. Ensure HTTPS (required for Web Speech API)
3. Try different browser (Chrome recommended)

```javascript
// Debug microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Microphone OK'))
  .catch(err => console.error('Microphone error:', err))
```

### Issue: Poor Recognition Accuracy

**Solutions:**
1. Speak clearly and at moderate pace
2. Reduce background noise
3. Use Indian English accent mode
4. Use specific terminology (e.g., "rupees" instead of "bucks")

### Issue: Customer Not Found

**Solution:**
System auto-creates customers if name doesn't match existing ones.

```typescript
// Exact match required for existing customers
// Otherwise, new customer is created
```

### Issue: Amount Not Detected

**Solutions:**
1. Always use currency indicators: "rupees", "₹", "Rs."
2. Avoid words like "approximately", "around"
3. Say numbers clearly: "fifty thousand rupees"

## Best Practices

### 1. Clear Speech Patterns

✅ **Good:**
- "Create invoice for ABC Company for fifty thousand rupees"
- "New invoice, customer John Smith, amount 25000"

❌ **Avoid:**
- "Like, maybe make an invoice for, uh, ABC?"
- "Around fifty thousand or so"

### 2. Structured Information

✅ **Good:**
- "5 laptops at 45000 each, 2 mice at 500 each"
- "Consulting services 100000, training 50000"

❌ **Avoid:**
- "Some laptops and mice"
- "Various services totaling some amount"

### 3. Explicit Entities

✅ **Good:**
- "Customer: Acme Corp"
- "Date: 15th January"
- "GST: 18 percent"

❌ **Avoid:**
- "For the usual customer"
- "For next week sometime"

### 4. Review Before Finalizing

Always review extracted data before creating invoice:
1. Check customer name spelling
2. Verify amounts and calculations
3. Confirm item descriptions
4. Validate GST rates

## Integration with Existing Features

### Works With:
- ✅ Smart GST Auto-classification
- ✅ HSN/SAC Suggestions
- ✅ Invoice Series Numbering
- ✅ Compliance Checks
- ✅ Round-off Calculations
- ✅ Multi-series Support

### Example Combined Usage:

```typescript
// Voice creates invoice with auto-features
"Create invoice for XYZ Maharashtra for 50000"

// System automatically:
// 1. Detects customer state (Maharashtra = 27)
// 2. Classifies as CGST+SGST (intra-state)
// 3. Applies 18% GST (9% CGST + 9% SGST)
// 4. Rounds off to nearest rupee
// 5. Assigns series number (e.g., INV-2024-25-001)
// 6. Runs compliance checks
```

## Analytics & Reporting

### Voice Usage Statistics

```sql
-- Voice invoice statistics
SELECT 
  COUNT(*) as total_recordings,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  AVG(duration_seconds) as avg_duration,
  SUM(CASE WHEN vi.invoice_id IS NOT NULL THEN 1 ELSE 0 END) as invoices_created
FROM voice_recordings vr
LEFT JOIN voice_invoice_parsing vi ON vr.id = vi.voice_recording_id
WHERE vr.user_id = current_user_id()
  AND vr.created_at >= NOW() - INTERVAL '30 days'
```

### Most Common Commands

```sql
-- Popular voice commands
SELECT 
  command_type,
  COUNT(*) as usage_count,
  COUNT(CASE WHEN executed = true THEN 1 END) as successful_executions
FROM voice_commands_log
WHERE user_id = current_user_id()
GROUP BY command_type
ORDER BY usage_count DESC
```

## Security & Privacy

### Data Handling
- ✅ Audio recordings are optional (can use text-only mode)
- ✅ Transcripts stored encrypted at rest
- ✅ RLS policies prevent unauthorized access
- ✅ User data isolated per account
- ✅ No data shared with third parties

### Compliance
- GDPR compliant
- Data retention policies configurable
- User can delete voice data anytime

## Future Enhancements

### Planned Features
1. **Offline Mode**: Process voice locally without internet
2. **Multi-language**: Hindi, Tamil, Telugu support
3. **Voice Signatures**: Approve invoices via voice confirmation
4. **Batch Processing**: Create multiple invoices in one session
5. **Voice Analytics**: Insights into voice usage patterns
6. **Custom Vocabulary**: Train system with business-specific terms
7. **WhatsApp Integration**: Send voice notes to create invoices
8. **AI Enhancement**: GPT-powered entity extraction

## Support

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Edge | ✅ Full | Chromium-based |
| Safari | ⚠️ Limited | Basic support |
| Firefox | ⚠️ Limited | Experimental |
| Mobile Chrome | ✅ Full | Android/iOS |
| Mobile Safari | ⚠️ Limited | iOS only |

### Requirements
- HTTPS connection (required for Web Speech API)
- Microphone access permission
- Modern browser (released within last 2 years)
- Stable internet connection

## Testing

### Test the Feature

1. **Basic Test:**
```
"Create invoice for Test Company for 1000 rupees"
```

2. **Complex Test:**
```
"New invoice for Test Client, 
3 products at 5000 each, 
GST 18%, 
dated today, 
due in 30 days"
```

3. **Validation Test:**
```
"Make invoice"  // Should show validation errors
```

### Expected Results

✅ **Success Indicators:**
- Transcription appears in real-time
- Entities extracted correctly
- Invoice preview shows before creation
- Invoice created with proper calculations

❌ **Error Handling:**
- Clear error messages
- Graceful degradation
- Retry options available

## Conclusion

Voice-to-Invoice transforms invoice creation from a manual, time-consuming process into a quick, natural conversation. Perfect for:
- 📱 Mobile users
- 🚗 Field sales teams
- ⏱️ Time-sensitive invoicing
- ♿ Accessibility needs
- 🎯 High-volume invoicing

Start using it today and save hours on invoice creation!
