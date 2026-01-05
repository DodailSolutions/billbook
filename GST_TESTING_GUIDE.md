# GST Features - Testing Guide

## Pre-Deployment Testing

Before going live with these GST features, run through this comprehensive testing checklist.

## Database Migration Testing

### Test 1: Schema Update
```sql
-- Run migration script
-- supabase-gst-compliance-migration.sql

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
```
✓ Should show: supply_type, cgst_amount, sgst_amount, igst_amount, reverse_charge_applicable

### Test 2: Reference Data
```sql
SELECT COUNT(*) FROM hsn_sac_master WHERE is_active = TRUE;
```
✓ Should return: 12

### Test 3: RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename IN ('hsn_sac_master', 'reverse_charge_settings');
```
✓ Should show 5 policies

## Application Testing

### Test Case 1: Intra-State Invoice (CGST + SGST)

**Setup**:
- Customer: Local (same state)
- Supply Type: "Intra-State (CGST + SGST)"
- Item: Description = "Service"
- GST Rate: 18%
- Amount: ₹1,000

**Expected Results**:
```
Subtotal: ₹1,000.00
CGST (9%): ₹90.00
SGST (9%): ₹90.00
Total: ₹1,180.00
```

**Verification Steps**:
1. Open invoice form
2. Select "Intra-State (CGST + SGST)"
3. Enter item details
4. Verify totals calculation
5. Save invoice
6. Check database: cgst_amount = 90, sgst_amount = 90, igst_amount = 0

### Test Case 2: Inter-State Invoice (IGST)

**Setup**:
- Customer: Different state
- Supply Type: "Inter-State (IGST)"
- Item: Description = "Goods"
- GST Rate: 18%
- Amount: ₹1,000

**Expected Results**:
```
Subtotal: ₹1,000.00
IGST (18%): ₹180.00
Total: ₹1,180.00
```

**Verification Steps**:
1. Open invoice form
2. Select "Inter-State (IGST)"
3. Enter item details
4. Verify totals calculation
5. Save invoice
6. Check database: cgst_amount = 0, sgst_amount = 0, igst_amount = 180

### Test Case 3: HSN/SAC Code Entry

**Setup**:
- Item 1: Food (HSN) - Code 0101, Rate 5%
- Item 2: Service (SAC) - Code 9988, Rate 18%
- Amounts: ₹1,000 each

**Expected Results**:
- Item 1 tax: ₹50 (5%)
- Item 2 tax: ₹180 (18%)
- Total GST: ₹230

**Verification Steps**:
1. Add first item with HSN code 0101
2. Select type "HSN"
3. Set GST rate to 5%
4. Add second item with SAC code 9988
5. Select type "SAC"
6. Set GST rate to 18%
7. Verify individual item calculations
8. Check PDF shows codes and rates

### Test Case 4: Multiple GST Rates

**Setup**:
- Item 1: 5% GST - ₹1,000
- Item 2: 12% GST - ₹1,000
- Item 3: 18% GST - ₹1,000
- Item 4: 28% GST - ₹1,000
- Supply Type: Intra-State

**Expected Results**:
```
Item 1: CGST ₹25, SGST ₹25
Item 2: CGST ₹60, SGST ₹60
Item 3: CGST ₹90, SGST ₹90
Item 4: CGST ₹140, SGST ₹140
Total CGST: ₹315
Total SGST: ₹315
Total: ₹4,630
```

**Verification Steps**:
1. Create invoice with above items
2. Set each item's GST rate differently
3. Verify item_cgst and item_sgst in database
4. Check PDF displays all rates correctly

### Test Case 5: Reverse Charge Marking

**Setup**:
- Supply Type: Intra-State
- Item: ₹1,000 at 18%
- Reverse Charge: Checked

**Expected Results**:
- Invoice shows "⚠️ Reverse Charge Applicable"
- Database: reverse_charge_applicable = TRUE
- PDF displays reverse charge warning

**Verification Steps**:
1. Open invoice form
2. Check "Reverse Charge Applicable" checkbox
3. Save invoice
4. View invoice detail page
5. Verify red warning appears
6. Download PDF
7. Check PDF shows reverse charge

### Test Case 6: PDF Generation

**Setup**: Any invoice with GST data

**Expected PDF Content**:
- Item table with HSN/SAC column (if codes entered)
- Item table with GST Rate column
- Detailed GST breakdown (CGST/SGST or IGST)
- Reverse charge indicator (if applicable)
- Correct totals
- All amounts formatted with ₹ symbol

**Verification Steps**:
1. Download PDF for invoice with HSN/SAC codes
2. Verify codes appear in items table
3. Check GST breakdown section
4. Confirm numbers match invoice display
5. Check formatting and readability

### Test Case 7: GSTIN Validation

**Valid GSTINs to Test**:
```
05AABCT1234A1Z0  ✓
27AABCT1234A1Z0  ✓
33AABCA1234A1Z0  ✓
```

**Invalid GSTINs to Test**:
```
12345              ✗ (too short)
99AABCT1234A1Z0   ✗ (invalid state)
05AABCT1234A1Z1   ✗ (wrong check digit)
```

**Verification Steps**:
1. Navigate to customer GSTIN field
2. Enter valid GSTIN
3. Verify acceptance
4. Enter invalid GSTIN
5. Verify error message

### Test Case 8: Invoice Detail Page Display

**Setup**: Create invoice with:
- Supply Type: Intra-State
- HSN/SAC codes in items
- Item-specific GST rates
- Reverse charge marked

**Expected Display**:
- HSN/SAC column visible in items table
- GST Rate column visible in items table
- Detailed totals showing CGST and SGST separately
- Red warning for reverse charge

**Verification Steps**:
1. Create invoice with above details
2. View invoice detail page
3. Check items table layout
4. Verify all columns display
5. Verify totals section shows all components

### Test Case 9: Recurring Invoices (if applicable)

**Setup**: Create recurring invoice with GST

**Expected Results**:
- Supply type carries to recurring
- GST rates applied correctly
- Auto-generated invoices use same rates

**Verification Steps**:
1. Create regular invoice with GST
2. "Make Recurring" button
3. Verify supply type carries over
4. Check generated invoices have same GST rates

### Test Case 10: Edge Cases

#### Test 10.1: Zero GST
```
Amount: ₹1,000
GST Rate: 0%
Expected: Total = ₹1,000
```

#### Test 10.2: Decimal Amounts
```
Amount: ₹999.99
GST Rate: 18%
Expected: Proper rounding to nearest paisa
```

#### Test 10.3: Large Numbers
```
Amount: ₹99,999,999.99
GST Rate: 18%
Expected: Correct calculation without overflow
```

#### Test 10.4: Many Items
```
Create invoice with 50+ items
Each with different HSN/SAC and rates
Expected: All calculations correct, no performance issues
```

## Performance Testing

### Load Test 1: Large Invoices
```
Create invoice with 100 items
Each with different rates
Measure: Response time, PDF generation time
Expected: < 5 seconds total
```

### Load Test 2: Database Queries
```
Query invoices with CGST/SGST breakdown
Filter by reverse charge status
Order by supply type
Expected: < 1 second for 10,000 invoices
```

## User Acceptance Testing

### UAT Test 1: New User Workflow
1. First-time user creates invoice
2. User selects supply type
3. User enters HSN/SAC codes
4. User marks reverse charge
5. Verify understanding of GST breakdown

### UAT Test 2: Experienced User Workflow
1. Power user creates multiple invoices
2. Different supply types
3. Multiple GST rates
4. Check efficiency improvements

## Regression Testing

### Backward Compatibility
Verify existing invoices (without new fields) still work:
- Display correctly
- Can be edited
- PDF generates without errors

### Test Existing Features
- Customer creation still works
- Payment tracking unchanged
- Invoice numbering unchanged
- Email sending unchanged
- Reminders unchanged

## Security Testing

### Test 1: RLS Policies
```sql
-- Test user can't see other users' invoices
-- Test hsn_sac_master is read-only
-- Test reverse_charge_settings isolation
```

### Test 2: GSTIN Validation
- No SQL injection via GSTIN field
- No XSS via GSTIN display
- Validation happens server-side

### Test 3: Data Integrity
- Decimal precision maintained
- No floating-point errors
- Check digit validation works

## Deployment Checklist

Before production deployment:

- [ ] All database migrations executed successfully
- [ ] Test data created and verified
- [ ] All test cases passed
- [ ] Performance acceptable
- [ ] Security testing complete
- [ ] User documentation reviewed
- [ ] Team trained on new features
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Monitoring/alerts configured

## Monitoring Post-Deployment

Monitor for:
- PDF generation errors
- Database query performance
- GST calculation discrepancies
- GSTIN validation failures
- User adoption rate

## Bug Reporting Template

If issues found:

```
Title: [Feature] - Issue Description

Environment:
- Browser: 
- OS: 
- Invoice Type: Intra-state/Inter-state

Steps to Reproduce:
1. 
2. 
3. 

Expected:
Actual:

Screenshots:
```

## Sign-Off

Testing completed by: _______________
Date: _______________
Status: ☐ Ready for Production ☐ Needs Fixes

---

**Testing Version 1.0**
**Last Updated**: January 5, 2026
