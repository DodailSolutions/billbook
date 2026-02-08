# QR Code Payment Setup Guide

## Overview
You can now upload your payment QR code (GPay, PhonePe, Paytm, etc.) to your invoice settings. The QR code will be displayed on all your invoices, making it easy for customers to pay you.

## Setup Steps

### 1. Run Database Migration
First, run the SQL migration in your Supabase SQL Editor:
- File: `supabase-qr-code-migration.sql`
- This creates the necessary database fields and storage bucket

### 2. Upload Your QR Code

1. Go to **Settings** → **Invoice Template Settings**
2. Scroll to the **Payment QR Code** section
3. Click **Choose File** and select your QR code image
4. The QR code will appear in the preview on the right

#### QR Code Requirements:
- **Format**: PNG or JPG
- **Size**: Maximum 2MB
- **Recommended**: Square image for best display
- **Content**: Your UPI payment QR code

### 3. Toggle Display
- Check **"Show QR code on invoices"** to display it on invoices
- Uncheck to hide it temporarily without deleting the image

## Where QR Code Appears

### On Invoice Preview
- Displays in the "Scan to Pay" section
- Shows below payment instructions
- Includes text: "GPay | PhonePe | Paytm | UPI"

### On Invoice PDF
The QR code will appear on generated PDF invoices (feature coming soon)

## Supported Payment Methods

The QR code works with all UPI-based payment apps:
- **GPay** (Google Pay)
- **PhonePe**
- **Paytm**
- **BHIM**
- **Any UPI app**

## How to Get Your QR Code

### From GPay:
1. Open Google Pay app
2. Tap your profile picture
3. Select "QR code"
4. Tap "Save" or take a screenshot

### From PhonePe:
1. Open PhonePe app
2. Tap your profile icon
3. Select "My QR Code"
4. Save or screenshot the QR code

### From Paytm:
1. Open Paytm app
2. Tap "Receive Money"
3. Your QR code appears
4. Save or screenshot

## Tips

1. **Test First**: Test the QR code by scanning it before uploading
2. **Clear Image**: Ensure the QR code is clear and not pixelated
3. **Update Anytime**: You can replace the QR code anytime by uploading a new one
4. **Remove**: Click the X button on the preview to remove the QR code

## Troubleshooting

**QR code not appearing?**
- Ensure "Show QR code on invoices" is checked
- Check that the image uploaded successfully
- Try re-uploading if needed

**QR code too small/large?**
- The system automatically sizes it to 128x128 pixels
- Use a square image for best results

**Can't upload?**
- Check file size (must be under 2MB)
- Verify file format (PNG or JPG only)
- Try compressing the image if it's too large
