'use server'

import type { InvoiceWithDetails } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { getInvoiceSettings } from '@/app/(dashboard)/invoices/settings/actions'

export async function generateInvoicePDF(invoice: InvoiceWithDetails): Promise<string> {
    // Get customization settings
    const settings = await getInvoiceSettings()
    
    const primaryColor = settings?.primary_color || '#3B82F6'
    const secondaryColor = settings?.secondary_color || '#8B5CF6'
    const companyName = settings?.company_name || 'Your Company'
    const companyEmail = settings?.company_email || ''
    const companyPhone = settings?.company_phone || ''
    const companyAddress = settings?.company_address || ''
    const companyGstin = settings?.company_gstin || ''
    const companyLogoUrl = settings?.company_logo_url || ''
    const logoSize = settings?.logo_size || 'medium'
    const companyFontFamily = settings?.company_font_family || 'Arial'
    const companyFontSize = settings?.company_font_size || 24
    const companyNameColor = settings?.company_name_color || settings?.primary_color || primaryColor
    const companyFontWeight = settings?.company_font_weight || 'bold'
    const companyDetailsFontFamily = settings?.company_details_font_family || 'Arial'
    const companyDetailsFontSize = settings?.company_details_font_size || 12
    const companyDetailsColor = settings?.company_details_color || '#6b7280'
    const termsFontFamily = settings?.terms_font_family || 'Arial'
    const termsFontSize = settings?.terms_font_size || 12
    const invoiceFontFamily = settings?.invoice_font_family || 'Arial'
    const invoiceFontSize = settings?.invoice_font_size || 12
    const termsAndConditions = settings?.terms_and_conditions || ''
    const paymentInstructions = settings?.payment_instructions || ''
    const footerText = settings?.footer_text || 'Thank you for your business!'
    const showCompanyDetails = settings?.show_company_details ?? true
    const showGstin = settings?.show_gstin ?? true
    const showLogo = settings?.show_logo ?? true
    const paymentQrCodeUrl = settings?.payment_qr_code_url || ''
    const showQrCode = settings?.show_qr_code ?? true
    const digitalSignatureUrl = settings?.digital_signature_url || ''
    const showSignature = settings?.show_signature ?? true
    const companyStampUrl = settings?.company_stamp_url || ''
    const showStamp = settings?.show_stamp ?? true
    
    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: '${invoiceFontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${invoiceFontSize}px;
            padding: 28px 36px;
            color: #1a1a1a;
            background: white;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${primaryColor};
            gap: 40px;
        }
        .company-info {
            flex: 1;
        }
        .header-right {
            flex: 1;
        }
        .company-name {
            font-family: '${companyFontFamily}', sans-serif;
            font-size: ${companyFontSize}px;
            font-weight: ${companyFontWeight};
            color: ${companyNameColor};
            margin-bottom: 8px;
        }
        .company-details {
            font-family: '${companyDetailsFontFamily}', sans-serif;
            font-size: ${companyDetailsFontSize}px;
            color: ${companyDetailsColor};
            line-height: 1.6;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: ${primaryColor};
            text-align: right;
        }
        .invoice-number {
            font-size: 14px;
            color: #6b7280;
            margin-top: 8px;
            text-align: right;
        }
        .invoice-dates {
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .date-item {
            margin-bottom: 12px;
        }
        .date-label {
            font-size: ${Math.max(10, invoiceFontSize - 2)}px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .date-value {
            font-size: ${invoiceFontSize + 2}px;
            font-weight: 600;
        }
        .customer-section {
            margin-top: 15px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            color: ${primaryColor};
        }
        .customer-details {
            line-height: 1.6;
            color: #4b5563;
            font-size: ${invoiceFontSize}px;
        }
        .customer-name {
            font-weight: 600;
            color: #1f2937;
            font-size: ${invoiceFontSize + 1}px;
        }
        .gstin-highlight {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #92400e;
            display: inline-block;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            page-break-inside: auto;
        }
        .items-table thead {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white !important;
        }
        .items-table th {
            padding: 12px;
            text-align: left;
            font-size: ${Math.max(10, invoiceFontSize - 1)}px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white !important;
        }
        .items-table th.text-right {
            text-align: right;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
            color: #4b5563;
            font-size: ${invoiceFontSize}px;
        }
        .items-table td.text-right {
            text-align: right;
        }
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 16px;
            page-break-inside: avoid;
        }
        .totals {
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            color: #4b5563;
            font-size: ${invoiceFontSize}px;
        }
        .total-row.subtotal {
            border-bottom: 1px solid #e5e7eb;
        }
        .total-row.grand-total {
            border-top: 2px solid ${primaryColor};
            padding-top: 12px;
            margin-top: 8px;
            font-size: ${invoiceFontSize + 6}px;
            font-weight: bold;
            color: ${primaryColor};
        }
        .notes-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 14px;
            margin-bottom: 14px;
            page-break-inside: avoid;
        }
        .notes-title {
            font-size: ${invoiceFontSize + 2}px;
            font-weight: 600;
            margin-bottom: 8px;
            color: ${primaryColor};
        }
        .notes-content {
            color: #6b7280;
            line-height: 1.6;
            white-space: pre-wrap;
            font-family: '${termsFontFamily}', sans-serif;
            font-size: ${termsFontSize}px;
        }
        @media print {
            @page {
                margin: 1cm 1.5cm;
                size: A4;
            }
            body {
                margin: 0;
                padding: 20px;
            }
            .invoice-container {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                ${showLogo && companyLogoUrl && companyLogoUrl.trim() && companyLogoUrl.startsWith('data:image') ? `
                <div style="margin-bottom: 12px;">
                    <img src="${companyLogoUrl}" alt="Company Logo" style="height: ${logoSize === 'large' ? '128px' : logoSize === 'small' ? '64px' : '96px'}; width: ${logoSize === 'large' ? '128px' : logoSize === 'small' ? '64px' : '96px'}; object-fit: contain;" onerror="this.style.display='none'" />
                </div>
                ` : ''}
                <div class="company-name">${companyName}</div>
                ${showCompanyDetails ? `
                <div class="company-details">
                    ${companyAddress ? `<div>${companyAddress}</div>` : ''}
                    ${companyEmail ? `<div>Email: ${companyEmail}</div>` : ''}
                    ${companyPhone ? `<div>Phone: ${companyPhone}</div>` : ''}
                    ${showGstin && companyGstin ? `<div>GSTIN: <span class="${invoice.customer.gstin ? 'gstin-highlight' : ''}">${companyGstin}</span></div>` : ''}
                </div>
                ` : ''}
            </div>
            <div class="header-right">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">${invoice.invoice_number}</div>
                
                <div class="invoice-dates">
                    <div class="date-item">
                        <div class="date-label">Invoice Date</div>
                        <div class="date-value">${formatDate(invoice.invoice_date)}</div>
                    </div>
                    ${invoice.due_date ? `
                    <div class="date-item">
                        <div class="date-label">Due Date</div>
                        <div class="date-value">${formatDate(invoice.due_date)}</div>
                    </div>
                    ` : ''}
                </div>

                <div class="customer-section">
                    <div class="section-title">Bill To:</div>
                    <div class="customer-details">
                        <div class="customer-name">${invoice.customer.name}</div>
                        ${invoice.customer.email ? `<div>${invoice.customer.email}</div>` : ''}
                        ${invoice.customer.phone ? `<div>${invoice.customer.phone}</div>` : ''}
                        ${invoice.customer.address ? `<div>${invoice.customer.address}</div>` : ''}
                        ${invoice.customer.gstin ? `<div>GSTIN: <span class="${companyGstin ? 'gstin-highlight' : ''}">${invoice.customer.gstin}</span></div>` : ''}
                    </div>
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    ${invoice.invoice_items.some(item => item.hsn_sac_code) ? '<th>HSN/SAC</th>' : ''}
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Amount</th>
                    ${invoice.invoice_items.some(item => item.gst_rate) ? '<th class="text-right">GST Rate</th><th class="text-right">GST Amount</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${invoice.invoice_items.map(item => `
                <tr>
                    <td>${item.description}${item.item_details ? `<div style="font-size:${Math.max(9, invoiceFontSize - 2)}px; color:#6b7280; margin-top:4px; white-space:pre-line;">${item.item_details}</div>` : ''}</td>
                    ${invoice.invoice_items.some(i => i.hsn_sac_code) ? `<td>${item.hsn_sac_code || '-'}</td>` : ''}
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">₹${item.unit_price.toFixed(2)}</td>
                    <td class="text-right">₹${item.amount.toFixed(2)}</td>
                    ${invoice.invoice_items.some(i => i.gst_rate) ? `<td class="text-right">${item.gst_rate || invoice.gst_percentage}%</td><td class="text-right">₹${(item.item_tax_amount || 0).toFixed(2)}</td>` : ''}
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals">
                <div class="total-row subtotal">
                    <span>Subtotal:</span>
                    <span>₹${invoice.subtotal.toFixed(2)}</span>
                </div>
                ${invoice.discount_amount && invoice.discount_amount > 0 ? `
                <div class="total-row" style="color: #f97316; font-weight: 600;">
                    <span>Discount (${invoice.discount_type === 'percentage' ? `${invoice.discount_value}%` : 'Flat'}):</span>
                    <span>-₹${invoice.discount_amount.toFixed(2)}</span>
                </div>
                ` : ''}
                ${invoice.gst_percentage > 0 ? `
                    ${invoice.supply_type === 'intra-state' ? `
                    <div class="total-row">
                        <span>CGST (${(invoice.gst_percentage / 2).toFixed(2)}%):</span>
                        <span>₹${((invoice.cgst_amount || 0)).toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>SGST (${(invoice.gst_percentage / 2).toFixed(2)}%):</span>
                        <span>₹${((invoice.sgst_amount || 0)).toFixed(2)}</span>
                    </div>
                    ` : `
                    <div class="total-row">
                        <span>IGST (${invoice.gst_percentage}%):</span>
                        <span>₹${((invoice.igst_amount || 0)).toFixed(2)}</span>
                    </div>
                    `}
                ` : ''}
                ${invoice.reverse_charge_applicable ? `
                <div class="total-row" style="color: #dc2626; font-weight: bold;">
                    <span>Reverse Charge Applicable</span>
                    <span>-</span>
                </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>₹${invoice.total.toFixed(2)}</span>
                </div>
                ${(invoice.amount_paid && invoice.amount_paid > 0) ? `
                <div class="total-row" style="color: #10b981; font-weight: 600; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 4px;">
                    <span>Amount Paid:</span>
                    <span>₹${invoice.amount_paid.toFixed(2)}</span>
                </div>
                ${invoice.amount_remaining && invoice.amount_remaining > 0 ? `
                <div class="total-row" style="color: #f59e0b; font-weight: 600;">
                    <span>Amount Due:</span>
                    <span>₹${invoice.amount_remaining.toFixed(2)}</span>
                </div>
                ` : ''}
                ` : ''}
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes-section">
            <div class="notes-title">Notes:</div>
            <div class="notes-content">${invoice.notes}</div>
        </div>
        ` : ''}
        
        ${(paymentInstructions || (showQrCode && paymentQrCodeUrl && paymentQrCodeUrl.startsWith('data:image'))) ? `
        <div class="notes-section" style="page-break-inside: avoid;">
            ${paymentInstructions && (showQrCode && paymentQrCodeUrl && paymentQrCodeUrl.startsWith('data:image')) ? `
            <div style="display: flex; gap: 24px; align-items: flex-start;">
                <div style="flex: 1;">
                    <div class="notes-title">Payment Instructions:</div>
                    <div class="notes-content">${paymentInstructions}</div>
                </div>
                <div style="text-align: center; min-width: 150px;">
                    <div class="notes-title" style="text-align: center; margin-bottom: 8px;">Scan to Pay</div>
                    <img src="${paymentQrCodeUrl}" alt="Payment QR Code" style="height: 120px; width: 120px; object-fit: contain; border: 2px solid ${primaryColor}; border-radius: 8px;" onerror="this.style.display='none'" />
                    <div style="color: #6b7280; font-size: 11px; margin-top: 6px;">GPay | PhonePe | Paytm | UPI</div>
                </div>
            </div>
            ` : paymentInstructions ? `
            <div class="notes-title">Payment Instructions:</div>
            <div class="notes-content">${paymentInstructions}</div>
            ` : `
            <div style="text-align: center;">
                <div class="notes-title" style="text-align: center; margin-bottom: 8px;">Scan to Pay</div>
                <img src="${paymentQrCodeUrl}" alt="Payment QR Code" style="height: 120px; width: 120px; object-fit: contain; border: 2px solid ${primaryColor}; border-radius: 8px;" onerror="this.style.display='none'" />
                <div style="color: #6b7280; font-size: 11px; margin-top: 6px;">GPay | PhonePe | Paytm | UPI</div>
            </div>
            `}
        </div>
        ` : ''}
        
        ${termsAndConditions ? `
        <div class="notes-section">
            <div class="notes-title">Terms and Conditions:</div>
            <div class="notes-content">${termsAndConditions}</div>
        </div>
        ` : ''}

        ${(showSignature && digitalSignatureUrl && digitalSignatureUrl.startsWith('data:image')) || (showStamp && companyStampUrl && companyStampUrl.startsWith('data:image')) ? `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; page-break-inside: avoid;">
            ${showStamp && companyStampUrl && companyStampUrl.startsWith('data:image') ? `
            <div style="text-align: center;">
                <img src="${companyStampUrl}" alt="Company Stamp" style="height: 110px; width: 110px; object-fit: contain; opacity: 0.85;" onerror="this.style.display='none'" />
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Company Seal</div>
            </div>
            ` : '<div></div>'}
            ${showSignature && digitalSignatureUrl && digitalSignatureUrl.startsWith('data:image') ? `
            <div style="text-align: center;">
                <img src="${digitalSignatureUrl}" alt="Signature" style="height: 70px; width: 180px; object-fit: contain;" onerror="this.style.display='none'" />
                <div style="border-top: 2px solid #374151; margin-top: 4px; padding-top: 4px; font-size: 11px; color: #374151; font-weight: 600;">${companyName}</div>
                <div style="font-size: 10px; color: #6b7280;">Authorized Signatory</div>
            </div>
            ` : '<div></div>'}
        </div>
        ` : ''}

        ${footerText ? `
        <div class="notes-section" style="text-align: center; color: #9ca3af; font-size: 12px;">
            ${footerText}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `

    return html
}
