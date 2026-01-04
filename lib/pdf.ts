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
            padding: 40px;
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
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${primaryColor};
        }
        .company-info {
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
        }
        .invoice-number {
            font-size: 14px;
            color: #6b7280;
            margin-top: 8px;
        }
        .invoice-dates {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .date-item {
            flex: 1;
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
            margin-bottom: 40px;
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
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table thead {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
        }
        .items-table th {
            padding: 12px;
            text-align: left;
            font-size: ${Math.max(10, invoiceFontSize - 1)}px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            margin-bottom: 40px;
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
            padding-top: 20px;
            margin-bottom: 20px;
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
            body {
                padding: 20px;
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
                    ${showGstin && companyGstin ? `<div>GSTIN: ${companyGstin}</div>` : ''}
                </div>
                ` : ''}
            </div>
            <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">${invoice.invoice_number}</div>
            </div>
        </div>
        
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
                ${invoice.customer.gstin ? `<div>GSTIN: ${invoice.customer.gstin}</div>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.invoice_items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">₹${item.unit_price.toFixed(2)}</td>
                    <td class="text-right">₹${item.amount.toFixed(2)}</td>
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
                ${invoice.gst_percentage > 0 ? `
                <div class="total-row">
                    <span>GST (${invoice.gst_percentage}%):</span>
                    <span>₹${invoice.gst_amount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>Total:</span>
                    <span>₹${invoice.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes-section">
            <div class="notes-title">Notes:</div>
            <div class="notes-content">${invoice.notes}</div>
        </div>
        ` : ''}
        
        ${paymentInstructions ? `
        <div class="notes-section">
            <div class="notes-title">Payment Instructions:</div>
            <div class="notes-content">${paymentInstructions}</div>
        </div>
        ` : ''}
        
        ${termsAndConditions ? `
        <div class="notes-section">
            <div class="notes-title">Terms and Conditions:</div>
            <div class="notes-content">${termsAndConditions}</div>
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
