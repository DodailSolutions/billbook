# Logo Upload Guide

## Overview
Add your company logo to invoices for a professional, branded appearance. The logo appears on all generated PDFs and invoice previews.

## Quick Start

### Upload Your Logo
1. Go to **Settings** in the sidebar
2. Find the "Company Logo" section
3. Click **"Upload Logo"** button
4. Select your image file (PNG, JPG, or SVG)
5. Preview appears instantly
6. Check "Show logo on invoices" if unchecked
7. Click **"Save Settings"**

## Specifications

### File Requirements
- **Formats**: PNG, JPG, JPEG, SVG
- **Maximum Size**: 2MB
- **Recommended Dimensions**: 200x200px or larger
- **Aspect Ratio**: Square (1:1) works best
- **Background**: Transparent PNG recommended

### Best Practices
✅ **DO:**
- Use high-resolution images
- Choose square or transparent background logos
- Test with the live preview
- Keep file size reasonable (under 500KB ideal)
- Use PNG with transparency for best results

❌ **DON'T:**
- Upload very large files (>2MB)
- Use low-resolution images
- Use images with complex backgrounds
- Upload non-image files

## Features

### Live Preview
- See your logo immediately after upload
- Preview shows exact appearance on invoices
- Updates in real-time as you make changes

### Logo Management
- **Upload**: Click the upload button to select a new logo
- **Remove**: Click the X button on the preview to remove logo
- **Replace**: Upload a new logo to replace the existing one
- **Toggle**: Use checkbox to show/hide logo on invoices

### Where Logo Appears
- Invoice PDF header (next to company name)
- Invoice preview in settings
- All generated invoices
- Invoice detail pages (when customization is fully integrated)

## Technical Details

### Storage
- Logo is stored as **base64-encoded string** in the database
- No external file storage required
- Included in `invoice_settings` table
- Column: `company_logo_url` (TEXT type)

### Encoding
- File is converted to base64 on upload
- Format: `data:image/png;base64,iVBORw0KG...`
- Maintains image quality
- Works in PDFs and web browsers

### Performance
- Base64 encoding increases data size by ~33%
- 2MB limit ensures reasonable database size
- Loaded once per invoice generation
- Cached by browser for preview

## Troubleshooting

### Logo Not Uploading
**Problem**: Upload button does nothing or shows error

**Solutions**:
1. Check file size (must be under 2MB)
2. Verify file format (PNG, JPG, SVG only)
3. Try a different browser
4. Check console for error messages
5. Compress your image before uploading

### Logo Appears Distorted
**Problem**: Logo looks stretched or pixelated

**Solutions**:
1. Use higher resolution image
2. Upload square-shaped logo
3. Use PNG with transparency
4. Ensure original image quality is good
5. Try SVG format for scalability

### Logo Too Large/Small
**Problem**: Logo doesn't fit well in invoice header

**Solutions**:
- Logo is automatically sized to 64x64px in PDFs
- Logo shows at 80x80px in preview
- Crop your logo to remove excess whitespace
- Use image editing software to resize beforehand

### Logo Not Showing in PDF
**Problem**: Logo visible in preview but not in generated PDF

**Solutions**:
1. Ensure "Show logo on invoices" is checked
2. Save settings after uploading
3. Regenerate the invoice PDF
4. Check that logo URL is saved in database
5. Verify base64 string is complete

### File Too Large Error
**Problem**: "Image size should be less than 2MB" message

**Solutions**:
1. **Compress Image**:
   - Use online tools like TinyPNG, Compressor.io
   - Save at lower quality in image editor
   - Convert to optimized PNG or JPG

2. **Resize Image**:
   - Reduce dimensions (200x200px is sufficient)
   - Crop unnecessary parts
   - Use image editing software (Photoshop, GIMP, Preview)

3. **Change Format**:
   - Convert high-quality JPG to PNG or vice versa
   - Try SVG for vector logos

## Examples

### Recommended Image Sizes
```
Small Logo:     100x100px  (~10-20KB)   ✓ Fast
Medium Logo:    200x200px  (~30-60KB)   ✓ Recommended
Large Logo:     500x500px  (~100-200KB) ✓ High Quality
Very Large:     1000x1000px (~500KB+)   ⚠️ Consider compression
```

### File Format Comparison
```
PNG (transparent):  Best for logos with transparency
PNG (solid):        Good quality, larger file size
JPG:                Smaller files, no transparency
SVG:                Scalable, smallest size (if supported)
```

## FAQ

**Q: Can I use my existing logo file?**  
A: Yes, as long as it's PNG, JPG, or SVG and under 2MB.

**Q: Will the logo appear on all invoices?**  
A: Yes, once saved, it appears on all new PDFs and existing invoices when regenerated.

**Q: Can I change my logo later?**  
A: Yes, upload a new logo anytime to replace the existing one.

**Q: What happens if I don't upload a logo?**  
A: Invoices will display without a logo, showing just company name and details.

**Q: Does the logo affect invoice loading speed?**  
A: Minimal impact. The 2MB limit ensures reasonable performance.

**Q: Can I position the logo differently?**  
A: Currently, the logo appears in the header next to company info. Custom positioning is a future enhancement.

**Q: Is my logo secure?**  
A: Yes, it's stored in your Supabase database with Row Level Security (RLS) policies. Only you can access your logo.

**Q: Can I use animated images?**  
A: No, use static images only. Animated GIFs won't work in PDFs.

## Support

If you encounter issues:
1. Check file meets requirements (format, size)
2. Review browser console for errors
3. Try different image or format
4. Clear browser cache
5. Refresh the page and try again

For persistent issues, verify:
- Database has `company_logo_url` column
- RLS policies allow updates
- Browser supports base64 images
- No ad blockers interfering with uploads
