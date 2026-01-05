# GST Compliance Implementation Guide

## Overview

This document outlines the comprehensive GST (Goods and Services Tax) compliance features that have been added to the BillBooky invoice system. The implementation includes automatic CGST, SGST, and IGST calculations, GSTIN validation, HSN/SAC codes, and reverse charge mechanism support.

## Features Implemented

### 1. **Automatic CGST, SGST, IGST Calculations**

The invoice system now automatically calculates GST based on the type of supply:

#### Intra-State Supplies (CGST + SGST)
- When supply is within the same state
- Total GST is split equally between CGST and SGST
- **Formula**: 
  - CGST = (Amount × GST Rate) ÷ 2
  - SGST = (Amount × GST Rate) ÷ 2
  - Total = Amount + CGST + SGST

#### Inter-State Supplies (IGST)
- When supply crosses state boundaries
- Full GST amount is charged as Integrated GST
- **Formula**:
  - IGST = Amount × GST Rate
  - Total = Amount + IGST

#### GST Rates Supported
- **0%** - Exempted goods/services
- **5%** - Essential items, food grains
- **12%** - Most goods and services
- **18%** - Standard rate for most supplies
- **28%** - Luxury items, sin goods

### 2. **GSTIN Validation**

The system includes comprehensive GSTIN (Goods and Services Tax Identification Number) validation:

#### GSTIN Format
- **Total Length**: 15 characters
- **Composition**:
  - First 2 digits: State code (01-37)
  - Next 10 digits: PAN (Permanent Account Number)
  - 11th digit: Entity code (Z for most taxpayers)
  - 12th digit: Registration type
  - Last digit: Check digit (calculated using Luhn algorithm)

#### Validation Features
- Format validation
- State code validation
- Check digit verification using Luhn algorithm
- Supports all 37 Indian states and territories

#### Usage in the Application
```typescript
import { validateGSTIN } from '@/lib/gst-utils'

const result = validateGSTIN('05AABCT1234A1Z0')
if (result.isValid) {
  console.log('Valid GSTIN')
} else {
  console.error(result.error)
}
```

### 3. **HSN/SAC Codes**

#### HSN (Harmonized System Nomenclature)
- Used for **Goods**
- 6-digit classification code
- Standardized international classification

#### SAC (Service Accounting Code)
- Used for **Services**
- 6-digit classification code
- Specific to Indian taxation

#### Master Data
The system includes a reference database of common HSN/SAC codes with their applicable GST rates:

**Service Codes (SAC)**:
- 9965: Professional Services (18%)
- 9967: Business Support Services (18%)
- 9988: IT Services (18%)
- 9989: Temporary Staff Services (18%)

**Goods Codes (HSN)**:
- 0101: Cereals (5%)
- 0201: Meat (5%)
- 0401: Dairy Products (5%)
- 2201: Beverages (28%)
- 6204: Women Clothing (5%)
- 8517: Electrical Machinery (18%)
- 3004: Pharmaceutical Products (0%)
- 7326: Iron or Steel Articles (18%)

#### Features
- Optional HSN/SAC code input per line item
- Type indicator (HSN or SAC)
- Item-specific GST rate support
- Automatic rate lookup capability

### 4. **Supply Type Configuration**

Invoices can be configured for two types of supplies:

```typescript
supply_type: 'intra-state' | 'inter-state'
```

- **Intra-State**: Triggers CGST + SGST calculation
- **Inter-State**: Triggers IGST calculation
- Affects all items in the invoice

### 5. **Reverse Charge Mechanism (RCM)**

The system supports marking invoices under the Reverse Charge Mechanism:

#### Applicable Scenarios
- Unregistered suppliers (below GST registration threshold)
- Import of services from non-GST jurisdictions
- Specific service categories:
  - Construction services
  - Renting of immovable property
  - Transportation services
- Inter-state supplies from unregistered suppliers

#### Implementation
```typescript
import { checkReverseCharge } from '@/lib/gst-utils'

const rcm = checkReverseCharge(
  supplierGSTIN,      // Supplier's GSTIN or null
  supplierState,      // State code
  recipientGSTIN,     // Your GSTIN
  serviceCategory     // Optional: service type
)

if (rcm.applicable) {
  console.log('RCM is applicable')
  console.log(rcm.notes) // Liability shifts to recipient
}
```

#### Marking Reverse Charge
- Checkbox available in invoice form
- Displayed prominently on invoice PDF
- Affects liability for GST payment

## Database Schema Updates

### New Columns in `invoice_items` Table
```sql
hsn_sac_code VARCHAR(6)           -- HSN/SAC code
hsn_sac_type VARCHAR(3)           -- 'HSN' or 'SAC'
gst_rate DECIMAL(5, 2)            -- Item-specific GST rate
item_cgst DECIMAL(10, 2)          -- CGST for this item
item_sgst DECIMAL(10, 2)          -- SGST for this item
item_igst DECIMAL(10, 2)          -- IGST for this item
item_tax_amount DECIMAL(10, 2)    -- Total tax for this item
```

### New Columns in `invoices` Table
```sql
supply_type VARCHAR(20)           -- 'intra-state' or 'inter-state'
cgst_amount DECIMAL(10, 2)        -- Total CGST
sgst_amount DECIMAL(10, 2)        -- Total SGST
igst_amount DECIMAL(10, 2)        -- Total IGST
reverse_charge_applicable BOOLEAN -- RCM flag
reverse_charge_notes TEXT         -- RCM details
```

### New Columns in `customers` Table
```sql
gstin_validated BOOLEAN           -- GSTIN validation status
gstin_validation_date TIMESTAMP   -- When GSTIN was validated
customer_state_code VARCHAR(2)    -- GST state code
```

### New Tables
- `hsn_sac_master` - Reference data for HSN/SAC codes
- `reverse_charge_settings` - User-level RCM configuration

## Using the GST Features

### In Invoice Form

1. **Supply Type Selection**
   - Choose between "Intra-State (CGST + SGST)" or "Inter-State (IGST)"
   - Selection affects all tax calculations

2. **Reverse Charge Checkbox**
   - Check if RCM applies to this invoice
   - Adds reverse charge note to invoice

3. **Per-Item GST Configuration**
   - HSN/SAC Code: Enter 6-digit code (optional)
   - Type: Select HSN (goods) or SAC (services)
   - GST Rate: Override default rate if needed (e.g., 5%, 12%, 18%, 28%)

### In Invoice Display

**Totals Section Now Shows**:
- Subtotal
- CGST (for intra-state) or IGST (for inter-state)
- SGST (for intra-state)
- Total Amount
- Reverse Charge indication (if applicable)

### In PDF Export

The PDF includes:
- HSN/SAC codes for each item (if provided)
- Item-specific GST rates
- Detailed GST breakdown (CGST/SGST or IGST)
- Reverse charge indicator

## Compliance with Indian Tax Laws

### GST Act Compliance
✓ Proper CGST/SGST split for intra-state supplies
✓ IGST for inter-state supplies
✓ GSTIN validation as per government format
✓ HSN/SAC code tracking as mandated
✓ Reverse charge mechanism support

### Documentation Required
- Valid GSTIN for registered taxpayers
- HSN/SAC codes for items/services
- Supply type declaration
- RCM applicability determination

### Record Maintenance
All invoices maintain detailed GST information for:
- Tax return filing (GSTR-1, GSTR-3B)
- GST audit compliance
- Reverse charge tracking
- HSN-wise analysis

## Utility Functions

### Available in `lib/gst-utils.ts`

```typescript
// Calculate GST components
calculateGSTComponents(amount, gstRate, supplyType)

// Validate GSTIN
validateGSTIN(gstin)

// Extract state info from GSTIN
extractStateFromGSTIN(gstin)

// Check reverse charge applicability
checkReverseCharge(supplierGSTIN, supplierState, recipientGSTIN, serviceCategory)

// Validate HSN/SAC codes
validateHSNSAC(code, type)

// Get applicable GST rate
getApplicableGSTRate(hsnSacCode, category)

// Calculate tax summary
calculateTaxSummary(subtotal, gstRate, supplyType)

// Format currency
formatCurrency(amount)
```

## Migration Steps

To deploy these features to your Supabase database:

1. **Run the migration SQL**:
   - Execute `supabase-gst-compliance-migration.sql` in your Supabase SQL editor
   - This will add all new columns and tables

2. **Test locally**:
   - Create an invoice with intra-state supply
   - Create an invoice with inter-state supply
   - Verify CGST/SGST and IGST calculations

3. **Validate GSTIN**:
   - Test with sample GSTINs
   - Verify validation works correctly

4. **Test HSN/SAC codes**:
   - Add items with HSN/SAC codes
   - Verify they appear in PDF

5. **Check Reverse Charge**:
   - Mark invoice with RCM
   - Verify it displays correctly

## Testing GSTIN

### Valid Test GSTINs
- 05AABCT1234A1Z0
- 33AABCA1234A1Z0
- 27AABCT1234A1Z0

### Invalid GSTINs
- 12345 (too short)
- 99AABCT1234A1Z0 (invalid state code)

## Future Enhancements

Potential improvements for future versions:

1. **GST Rate Lookup API**
   - Integration with government HSN/SAC database
   - Automatic rate assignment

2. **GST Return Integration**
   - GSTR-1 auto-generation
   - GSTR-3B calculations

3. **State Mapping**
   - Automatic supply type detection based on supplier/recipient states
   - Intelligent RCM detection

4. **Compliance Reports**
   - GST liability summary
   - RCM tracking report
   - HSN-wise analysis

5. **E-Way Bill Support**
   - Generate e-way bill details
   - Integration with government portal

## Support and Documentation

For detailed GST information, refer to:
- [GST Council Official Website](https://www.gst.gov.in/)
- [HSN/SAC Code Search](https://www.gst.gov.in/search-hsn)
- [GSTIN Format](https://www.gst.gov.in/newsandupdates)

## Troubleshooting

### GSTIN Validation Fails
- Verify 15-character format
- Check state code (01-37)
- Validate check digit
- Ensure no special characters

### GST Calculations Seem Wrong
- Verify supply type is selected
- Check item-specific rates override
- Ensure amounts are rounded correctly
- Review GST percentage value

### HSN/SAC Codes Not Appearing
- Ensure codes are entered (4-6 digits)
- Verify code format
- Check that type is selected

## Version Information

- **Implementation Date**: 2026
- **GST Act Version**: Latest (As per government guidelines)
- **Supported from**: India operations
- **Compliance Level**: Full Indian GST compliance

---

**Last Updated**: January 5, 2026
