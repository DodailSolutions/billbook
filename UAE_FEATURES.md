# UAE Regional Features Implementation

## Overview
This document describes the UAE-specific features implemented for BillBooky to support VAT compliance, Arabic language, and regional business requirements.

## Key Differences: India vs UAE

### Tax System
| Feature | India (GST) | UAE (VAT) |
|---------|------------|-----------|
| Tax Type | GST (Central + State) | VAT (Federal) |
| Tax Rate | 5%, 12%, 18%, 28% | 5% (standard) |
| Tax ID | GSTIN (15 digits) | TRN (15 digits) |
| Tax Breakdown | CGST + SGST or IGST | Single VAT |
| Product Codes | HSN/SAC mandatory | Not applicable |
| Supply Type | Intra-state vs Inter-state | Not applicable |
| Reverse Charge | Yes | Less common |

### Invoice Requirements
| Feature | India | UAE |
|---------|-------|-----|
| Language | English, Hindi | English, Arabic (bilingual recommended) |
| Currency | INR (₹) | AED (د.إ) |
| Date Format | DD/MM/YYYY | DD/MM/YYYY |
| Tax Authority | GST Network | Federal Tax Authority (FTA) |
| e-Invoice | Mandatory for >10Cr turnover | Not mandatory |
| Tax Registration | GSTIN | TRN |

## Database Changes

### 1. User Profiles
```sql
ALTER TABLE user_profiles 
ADD COLUMN region VARCHAR(10) DEFAULT 'IN' CHECK (region IN ('IN', 'AE'));
```
- **Purpose**: Identify user's business location
- **Values**: `IN` (India), `AE` (UAE)
- **Default**: `IN`

### 2. Company Details
```sql
-- UAE-specific fields
ALTER TABLE company_details ADD COLUMN tax_registration_number VARCHAR(50); -- TRN for UAE
ALTER TABLE company_details ADD COLUMN vat_percentage DECIMAL(5,2) DEFAULT 5.00;
ALTER TABLE company_details ADD COLUMN tax_type VARCHAR(10) DEFAULT 'GST' CHECK (tax_type IN ('GST', 'VAT'));
ALTER TABLE company_details ADD COLUMN arabic_business_name VARCHAR(255);
ALTER TABLE company_details ADD COLUMN arabic_address TEXT;
```

### 3. Customers
```sql
-- Support for UAE customers
ALTER TABLE customers ADD COLUMN trn VARCHAR(50); -- Tax Registration Number
ALTER TABLE customers ADD COLUMN arabic_name VARCHAR(255);
ALTER TABLE customers ADD COLUMN arabic_address TEXT;
```

### 4. Invoices
```sql
-- Regional invoice support
ALTER TABLE invoices ADD COLUMN tax_type VARCHAR(10) CHECK (tax_type IN ('GST', 'VAT'));
ALTER TABLE invoices ADD COLUMN vat_percentage DECIMAL(5,2);
ALTER TABLE invoices ADD COLUMN vat_amount DECIMAL(12,2);
ALTER TABLE invoices ADD COLUMN currency VARCHAR(3) DEFAULT 'INR'; -- INR, AED, USD
ALTER TABLE invoices ADD COLUMN show_arabic BOOLEAN DEFAULT false;
```

### 5. Invoice Items
```sql
-- HSN/SAC optional for UAE
ALTER TABLE invoice_items ALTER COLUMN hsn_sac_code DROP NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN hsn_sac_type DROP NOT NULL;

-- VAT support
ALTER TABLE invoice_items ADD COLUMN vat_rate DECIMAL(5,2);
ALTER TABLE invoice_items ADD COLUMN vat_amount DECIMAL(12,2);
ALTER TABLE invoice_items ADD COLUMN arabic_description TEXT;
```

### 6. Invoice Settings
```sql
-- Regional preferences
ALTER TABLE invoice_settings ADD COLUMN show_hsn_sac BOOLEAN DEFAULT true;
ALTER TABLE invoice_settings ADD COLUMN show_gst_breakdown BOOLEAN DEFAULT true;
ALTER TABLE invoice_settings ADD COLUMN show_arabic BOOLEAN DEFAULT false;
ALTER TABLE invoice_settings ADD COLUMN tax_label VARCHAR(50) DEFAULT 'GST';
ALTER TABLE invoice_settings ADD COLUMN tax_id_label VARCHAR(50) DEFAULT 'GSTIN';
```

## Code Implementation

### 1. Region Detection (`lib/region-utils.ts`)
```typescript
export async function getUserRegion(): Promise<Region>
export async function getRegionalSettings(): Promise<RegionalSettings>
export function formatCurrency(amount: number, region?: Region): string
export function shouldShowHsnSac(region?: Region): boolean
```

**Features:**
- Detects region from user profile
- Falls back to cookie-based detection (set by geo-location)
- Provides regional defaults (currency, tax rates, etc.)
- Utility functions for formatting and feature flags

### 2. Geo-Detection (`proxy.ts`)
```typescript
// Auto-detect UAE users and redirect to /ae
const country = request.headers.get('x-vercel-ip-country')
const isUAEUser = country === 'AE'
```

**Behavior:**
- UAE users (country code `AE`) → redirected to `/ae`
- Users searching "invoice", "VAT", "فاتورة" → redirected to `/ae`
- Region stored in cookie (`region-preference`)
- User can manually switch regions via switcher buttons

### 3. Regional Landing Pages
- **India**: `/` - GST-focused, INR pricing, Hindi support
- **UAE**: `/ae` - VAT-focused, AED pricing, Arabic support

### 4. Regional Pricing
- **India**: Monthly plans in INR (₹99-₹999), GST additional
- **UAE**: Monthly plans in AED (AED 49-299), VAT additional
- Lifetime plans available for both regions

## Features by Region

### India Features
✅ GST Compliance (CGST/SGST/IGST)
✅ HSN/SAC Codes
✅ GSTIN Validation
✅ Supply Type (Intra-state/Inter-state)
✅ Reverse Charge Mechanism
✅ e-Invoice Ready
✅ e-Way Bill Support
✅ GST Return Filing Assistance
✅ Hindi Language Support
✅ INR Currency

### UAE Features
✅ VAT Compliance (5%)
✅ TRN Validation
✅ Bilingual Invoices (English/Arabic)
✅ Multi-Currency (AED primary)
✅ FTA-Compliant Reporting
✅ Arabic Interface Option
✅ AED Pricing
❌ No HSN/SAC Codes (not applicable)
❌ No GST Breakdown (single VAT)
❌ No Supply Type Differentiation

## Usage

### For Developers

#### Check User Region
```typescript
import { getUserRegion, getRegionalSettings } from '@/lib/region-utils'

const region = await getUserRegion() // 'IN' or 'AE'
const settings = await getRegionalSettings()

console.log(settings.currency) // 'INR' or 'AED'
console.log(settings.taxLabel) // 'GST' or 'VAT'
```

#### Format Currency
```typescript
import { formatCurrency } from '@/lib/region-utils'

const amount = 1000
console.log(formatCurrency(amount, 'IN')) // ₹1,000.00
console.log(formatCurrency(amount, 'AE')) // د.إ1,000.00
```

#### Conditional Features
```typescript
import { shouldShowHsnSac, shouldShowGstBreakdown } from '@/lib/region-utils'

const region = await getUserRegion()

if (shouldShowHsnSac(region)) {
    // Show HSN/SAC input fields (India only)
}

if (shouldShowGstBreakdown(region)) {
    // Show CGST/SGST/IGST breakdown (India only)
}
```

### For Users

#### Switch Region
1. Click region switcher button (bottom-left)
2. Choose between 🇮🇳 India or 🇦🇪 UAE
3. Preferences saved for 1 year

#### Creating Invoices

**India Users:**
- Enter customer GSTIN
- Select HSN/SAC codes for items
- Choose supply type (Intra-state/Inter-state)
- GST calculated automatically
- Invoice shows CGST/SGST or IGST breakdown

**UAE Users:**
- Enter customer TRN
- No HSN/SAC codes required
- Single VAT rate (5%)
- Option to add Arabic translations
- Invoice shows total VAT amount

## Migration Guide

### Running the Migration
```bash
# Apply UAE features migration
psql -d your_database < supabase-uae-features-migration.sql
```

### Post-Migration Steps
1. Existing users default to India (`region = 'IN'`)
2. UAE users should update profile: Settings → Region → Select UAE
3. Invoice settings auto-adjust based on region
4. Old invoices remain unchanged (backward compatible)

## Testing

### Test Scenarios

#### India User Flow
1. Create account in India
2. Verify region = 'IN'
3. Create invoice with GSTIN and HSN code
4. Check GST breakdown (CGST + SGST)
5. Download PDF - should show GST details

#### UAE User Flow
1. Access site from UAE (or set cookie)
2. Auto-redirected to `/ae`
3. Sign up → region = 'AE'
4. Create invoice with TRN
5. No HSN/SAC fields shown
6. Check VAT (single 5%)
7. Download PDF - should show VAT in English/Arabic

#### Region Switching
1. India user → Click UAE switcher
2. Redirected to `/ae`
3. Cookie set to `ae`
4. Dashboard shows AED pricing
5. Invoices show VAT instead of GST

## API Endpoints

### Get User Region
```typescript
GET /api/user/region
Response: { region: 'IN' | 'AE' }
```

### Update User Region
```typescript
POST /api/user/region
Body: { region: 'IN' | 'AE' }
Response: { success: boolean }
```

### Get Regional Settings
```typescript
GET /api/user/settings/regional
Response: {
    region: 'IN' | 'AE',
    currency: string,
    taxType: 'GST' | 'VAT',
    taxLabel: string,
    taxIdLabel: string,
    taxRate: number,
    showHsnSac: boolean,
    showGstBreakdown: boolean,
    showArabic: boolean
}
```

## Future Enhancements

### Planned Features
- [ ] Full Arabic UI translation
- [ ] Arabic RTL (right-to-left) layout
- [ ] Multiple VAT rates support (0%, 5%)
- [ ] FTA XML export for tax filing
- [ ] Bahrain, Saudi Arabia regions
- [ ] Automatic exchange rate conversion
- [ ] Multi-region businesses (operate in both IN and AE)

### Under Consideration
- [ ] Qatar, Oman, Kuwait support
- [ ] GCC-wide invoicing
- [ ] E-invoicing for UAE
- [ ] Integration with UAE accounting software
- [ ] Zakat calculation for Islamic businesses

## Support

### Documentation
- UAE VAT Law: Federal Decree-Law No. 8 of 2017
- FTA Website: https://tax.gov.ae
- VAT Rate: 5% (standard)
- TRN Format: 15 digits

### Contact
- Technical Support: support@billbooky.com
- UAE-specific queries: support-uae@billbooky.com
- Legal/Tax queries: Consult local chartered accountant

## Compliance Notes

⚠️ **Important**: 
- This software provides tools for VAT-compliant invoicing
- We do NOT provide tax or legal advice
- Users must ensure compliance with local regulations
- Consult FTA guidelines and licensed tax professionals
- BillBooky is not liable for incorrect tax filings

## Version History

### v1.0.0 (January 2026)
- Initial UAE support
- VAT calculations
- TRN validation
- Arabic invoice templates
- Geo-detection and auto-routing
- Regional pricing (AED)
- Legal pages (Privacy, Terms)

---

**Last Updated**: January 8, 2026
**Maintainer**: BillBooky Development Team
