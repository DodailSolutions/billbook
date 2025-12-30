# Invoice Customization Feature

## Overview
The invoice customization feature allows users to personalize their invoices with custom branding, company information, colors, and terms. All customizations are automatically applied to generated PDFs and invoice displays.

## Features

### 1. Company Information
- **Company Logo**: Upload your business logo (PNG, JPG, SVG - max 2MB)
- **Company Name**: Display your business name prominently on invoices
- **Email**: Show contact email for customer inquiries
- **Phone**: Include business phone number
- **Address**: Full business address for professional invoices
- **GSTIN**: GST identification number for Indian businesses
- **Toggle Options**: Show/hide logo, company details, and GSTIN as needed

### 2. Brand Customization
- **Primary Color**: Main brand color for headers and accents
- **Secondary Color**: Complementary color for gradients and table headers
- **Invoice Prefix**: Customize invoice number prefix (default: "INV")

### 3. Legal & Payment Information
- **Terms and Conditions**: Add custom terms for your services
- **Payment Instructions**: Provide bank details or payment methods
- **Footer Text**: Custom message at the bottom of invoices

### 4. Live Preview
- Real-time preview of invoice appearance
- See changes instantly as you type
- Preview includes all customizations (colors, company info, terms)

## How to Use

### Access Settings
1. Navigate to **Settings** in the sidebar
2. Or go to `/invoices/settings` directly

### Customize Your Template
1. **Logo Upload**: Click "Upload Logo" to add your company logo
   - Supports PNG, JPG, or SVG formats
   - Maximum file size: 2MB
   - Preview appears instantly
   - Click the X button to remove the logo
2. **Company Details**: Fill in your business information
3. **Branding**: Choose your primary and secondary colors using color pickers
4. **Terms**: Add terms and conditions, payment instructions
5. **Preview**: Watch the live preview update as you make changes
6. **Save**: Click "Save Settings" to apply changes

### View Customized Invoices
Once saved, all your customizations will automatically appear in:
- New invoice PDFs generated via "Download PDF" button
- Invoice detail pages
- Recurring invoice templates

## Technical Details

### Database Schema
The settings are stored in the `invoice_settings` table with one row per user:

```sql
CREATE TABLE invoice_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    company_email TEXT,
    company_phone TEXT,
    company_address TEXT,
    company_gstin TEXT,
    invoice_prefix TEXT DEFAULT 'INV',
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#8B5CF6',
    terms_and_conditions TEXT,
    payment_instructions TEXT,
    footer_text TEXT,
    show_logo BOOLEAN DEFAULT true,
    show_company_details BOOLEAN DEFAULT true,
    show_gstin BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Key Files

#### Settings Page
- **Location**: `app/(dashboard)/invoices/settings/page.tsx`
- **Purpose**: Main settings page with header
- **Type**: Server Component

#### Settings Form
- **Location**: `app/(dashboard)/invoices/settings/InvoiceSettingsForm.tsx`
- **Purpose**: Form for editing all settings
- **Type**: Client Component
- **Features**: Real-time validation, color pickers, live preview updates

#### Live Preview
- **Location**: `app/(dashboard)/invoices/settings/InvoicePreview.tsx`
- **Purpose**: Shows how invoice will look with current settings
- **Type**: Client Component
- **Features**: Updates in real-time, displays sample invoice

#### Settings Wrapper
- **Location**: `app/(dashboard)/invoices/settings/SettingsWithPreview.tsx`
- **Purpose**: Manages state between form and preview
- **Type**: Client Component

#### Server Actions
- **Location**: `app/(dashboard)/invoices/settings/actions.ts`
- **Functions**:
  - `getInvoiceSettings()`: Fetch user's settings
  - `saveInvoiceSettings()`: Save/update settings

#### PDF Generation
- **Location**: `lib/pdf.ts`
- **Function**: `generateInvoicePDF()`
- **Features**: 
  - Fetches invoice settings
  - Applies custom colors to PDF template
  - Includes company information
  - Adds terms, payment instructions, footer

## Design Principles

### Color System
- **Primary Color**: Used for headings, borders, important text
- **Secondary Color**: Creates gradient with primary for table headers
- **Default Colors**: Blue (#3B82F6) and Purple (#8B5CF6)

### Layout
- **Two-Column**: Form on left, preview on right (desktop)
- **Responsive**: Stacks vertically on mobile
- **Sticky Preview**: Preview stays visible while scrolling form

### Typography
- **Headers**: Bold, colored with primary color
- **Body Text**: Gray for readability
- **Labels**: Uppercase, small, gray

## Navigation

The settings page is accessible from:
1. **Sidebar**: "Settings" menu item at the bottom
2. **Direct Link**: Navigate to `/invoices/settings`

## Best Practices

### Company Information
- Keep company name concise (appears in header)
- **Logo**: Use a square or transparent background logo for best results
- Upload high-quality logo (recommended: 200x200px or larger)
- Include complete address for professional appearance
- Add GSTIN if you're GST-registered in India

### Colors
- Choose colors that match your brand
- Ensure good contrast with white background
- Test preview to verify readability

### Terms & Conditions
- Keep concise but legally sound
- Use line breaks for readability
- Update regularly to match business policies

### Payment Instructions
- Include all payment methods accepted
- Provide bank account details if applicable
- Add UPI ID or payment gateway links

## Future Enhancements

Potential additions to the customization feature:
- [x] Logo upload capability (completed)
- [ ] Multiple invoice templates
- [ ] Custom fonts
- [ ] Additional color customization zones
- [ ] Invoice layouts (classic, modern, minimal)
- [ ] Multi-currency support
- [ ] Language/locale settings
- [ ] Logo position customization
- [ ] Watermark support

## Troubleshooting

### Settings Not Applying
1. Ensure you clicked "Save Settings"
2. Check browser console for errors
3. Verify you're logged in

### Preview Not Updating
1. Try refreshing the page
2. Check that JavaScript is enabled
3. Clear browser cache if needed

### PDF Colors Don't Match
1. Settings are fetched on PDF generation
2. May need to regenerate PDF to see changes
3. Check that settings were saved successfully

### Logo Not Displaying
1. Ensure file size is under 2MB
2. Check that "Show logo on invoices" is enabled
3. Verify logo uploaded successfully (should see preview)
4. Try different image format if issues persist
5. Make sure image file is not corrupted

## Support

For issues or questions about invoice customization:
1. Check that all required fields are filled
2. Verify color codes are valid hex colors
3. Ensure database migrations have been run
4. Check Supabase dashboard for settings table
