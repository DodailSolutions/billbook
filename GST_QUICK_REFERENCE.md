# GST Features - Quick Reference

## Invoice Creation Checklist

### Step 1: Select Supply Type
```
□ Intra-State (CGST + SGST) → Same state as customer
□ Inter-State (IGST) → Different state from customer
```

### Step 2: Enter Invoice Items
For each item:
```
□ Description
□ Quantity
□ Unit Price
□ HSN/SAC Code (optional, 6 digits)
□ Type (SAC for services, HSN for goods)
□ GST Rate (defaults to invoice rate, can override)
```

### Step 3: Mark Reverse Charge (if applicable)
```
□ Unregistered supplier?
□ Import of services?
□ Construction/Renting service?
□ Inter-state from unregistered vendor?
→ If YES to any, check "Reverse Charge Applicable"
```

## Formulas Used

### Intra-State (CGST + SGST)
```
CGST = Amount × (GST Rate ÷ 2)
SGST = Amount × (GST Rate ÷ 2)
Total = Amount + CGST + SGST
```

**Example**: ₹1000 at 18% GST
```
CGST = 1000 × (18 ÷ 2) / 100 = ₹90
SGST = 1000 × (18 ÷ 2) / 100 = ₹90
Total = 1000 + 90 + 90 = ₹1,180
```

### Inter-State (IGST)
```
IGST = Amount × GST Rate
Total = Amount + IGST
```

**Example**: ₹1000 at 18% GST
```
IGST = 1000 × 18 / 100 = ₹180
Total = 1000 + 180 = ₹1,180
```

## Common HSN/SAC Codes

### Services (SAC - 6 digits)
| Code | Description | GST Rate |
|------|-------------|----------|
| 9965 | Professional Services | 18% |
| 9967 | Business Support Services | 18% |
| 9988 | IT Services | 18% |
| 9989 | Temporary Staff Services | 18% |

### Goods (HSN - 6 digits)
| Code | Description | GST Rate |
|------|-------------|----------|
| 0101 | Cereals | 5% |
| 0201 | Meat | 5% |
| 0401 | Dairy Products | 5% |
| 2201 | Beverages | 28% |
| 6204 | Women Clothing | 5% |
| 8517 | Electrical Machinery | 18% |
| 3004 | Pharmaceutical Products | 0% |
| 7326 | Iron or Steel Articles | 18% |

## GSTIN Validation

**Format**: 15 Characters
```
[CC][10-char PAN][1-digit entity][1-digit registration][1-check digit]
     ^^                        ^^                    ^
   State Code              State Code         Check Digit
```

**Example Valid GSTIN**: 05AABCT1234A1Z0

**Breakdown**:
- `05` = Chhattisgarh (State Code)
- `AABCT1234A1` = PAN (10 characters)
- `Z` = Entity code
- `0` = Registration type
- Check digit calculated automatically

## Reverse Charge Scenarios

### When to Mark Reverse Charge:

1. **Unregistered Supplier**
   - Supplier's GST registration absent
   - Supply amount above/below threshold
   → Recipient liable for GST

2. **Import of Services**
   - Services from outside India
   - Services from non-GST jurisdiction
   → Recipient pays GST

3. **Specific Services**
   - Construction services
   - Renting of immovable property
   - Transportation services
   - From unregistered suppliers
   → Recipient liable for GST

4. **Inter-State from Unregistered**
   - Supply crosses states
   - Supplier not registered
   → Recipient liable for GST

## GST Rates

| Rate | Category | Examples |
|------|----------|----------|
| 0% | Exempt/Nil Rated | Medicines, Food grains |
| 5% | Essential Items | Cereals, Clothing, Dairy |
| 12% | Standard | Most goods and services |
| 18% | Higher | Electronics, Professional Services, IT |
| 28% | Luxury/Sin Goods | Alcohol, Luxury cars |

## Tax Display on Invoice

### For Intra-State Supply
```
Subtotal:           ₹1,000.00
CGST (9%):          ₹90.00
SGST (9%):          ₹90.00
────────────────────────────
Total:              ₹1,180.00
```

### For Inter-State Supply
```
Subtotal:           ₹1,000.00
IGST (18%):         ₹180.00
────────────────────────────
Total:              ₹1,180.00
```

### With Reverse Charge
```
Subtotal:           ₹1,000.00
CGST (9%):          ₹90.00
SGST (9%):          ₹90.00
────────────────────────────
Total:              ₹1,180.00
⚠️ Reverse Charge Applicable
```

## State Codes Quick Reference

```
01 = Andaman and Nicobar Islands
02 = Andhra Pradesh
03 = Arunachal Pradesh
04 = Assam
05 = Bihar (actually Chhattisgarh)
06 = Chhattisgarh
07 = Dadra and Nagar Haveli
08 = Daman and Diu
09 = Delhi
10 = Goa
11 = Gujarat
12 = Haryana
13 = Himachal Pradesh
14 = Jharkhand
15 = Karnataka
16 = Kerala
17 = Ladakh
18 = Lakshadweep
19 = Madhya Pradesh
20 = Maharashtra
21 = Manipur
22 = Meghalaya
23 = Mizoram
24 = Nagaland
25 = Odisha
26 = Puducherry
27 = Punjab
28 = Rajasthan
29 = Sikkim
30 = Tamil Nadu
31 = Telangana
32 = Tripura
33 = Uttar Pradesh
34 = Uttarakhand
35 = West Bengal
36 = Other Territory
37 = Unassigned
```

## Item GST Rate Override

Default invoice GST rate: **18%**

Each item can have different rate:
- Item 1: Service at **18%** → Uses 18%
- Item 2: Food item at **5%** → Use 5%
- Item 3: Alcohol at **28%** → Use 28%

Tax calculated separately for each item, then summed.

## PDF Export Information

Invoice PDF will include:
- ✓ HSN/SAC codes (if provided)
- ✓ Item-wise GST rates
- ✓ Item-wise tax amounts
- ✓ CGST breakdown (intra-state)
- ✓ SGST breakdown (intra-state)
- ✓ IGST amount (inter-state)
- ✓ Reverse charge indicator
- ✓ Supply type

## Common Issues & Solutions

### Issue: "GSTIN validation failed"
**Solution**:
- Check it's exactly 15 characters
- Verify state code is 01-37
- No spaces or special characters
- Use capital letters only

### Issue: GST amounts seem wrong
**Solution**:
- Verify supply type selected
- Check item-specific rates aren't overriding
- Confirm GST percentage input
- Look at per-item calculations

### Issue: Reverse charge not appearing
**Solution**:
- Check the checkbox is marked
- Verify customer is marked unregistered
- Save and refresh invoice

### Issue: HSN/SAC codes not showing
**Solution**:
- Enter 6-digit code (or 4-digit minimum)
- Select HSN or SAC type
- Numbers only
- Save invoice to update

## For GST Filing (GSTR-1)

Invoice details provide:
- Intra-state vs inter-state classification
- CGST, SGST, IGST amounts separately
- Reverse charge status
- HSN/SAC codes for analysis
- Customer GSTIN

Use these details for:
- GSTR-1 (Outward supply)
- GSTR-3B (Returns summary)
- ITC (Input Tax Credit) reconciliation

## Support Resources

**For GSTIN Help**:
- https://www.gst.gov.in
- GSTIN Search: https://www.gst.gov.in/search-hsn

**For HSN/SAC Codes**:
- https://www.gst.gov.in/search-hsn
- HSN Finder tool on GST portal

**For GST Rates**:
- https://www.gst.gov.in/rates
- GST Council Notifications

## Version Information

- **GST Act**: Latest (2024-25)
- **Implementation**: Full Compliance
- **Supported**: All 37 states/UTs
- **Rate Options**: 0%, 5%, 12%, 18%, 28%

---

**Quick Reference Version 1.0**
**Last Updated**: January 5, 2026
