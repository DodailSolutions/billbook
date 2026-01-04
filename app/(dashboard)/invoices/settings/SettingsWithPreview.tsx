'use client'

import { useState } from 'react'
import InvoiceSettingsForm from './InvoiceSettingsForm'
import InvoicePreview from './InvoicePreview'

interface SettingsWithPreviewProps {
    initialSettings: any
}

export default function SettingsWithPreview({ initialSettings }: SettingsWithPreviewProps) {
    // Validate and normalize logo/QR code URLs
    const normalizeImageUrl = (url: string | undefined) => {
        if (!url || !url.trim()) return ''
        if (url.startsWith('data:image')) return url
        return '' // Invalid format, return empty string
    }

    const [previewSettings, setPreviewSettings] = useState({
        company_name: initialSettings?.company_name || '',
        company_email: initialSettings?.company_email || '',
        company_phone: initialSettings?.company_phone || '',
        company_address: initialSettings?.company_address || '',
        company_gstin: initialSettings?.company_gstin || '',
        company_logo_url: normalizeImageUrl(initialSettings?.company_logo_url),
        logo_size: initialSettings?.logo_size || 'medium',
        company_font_family: initialSettings?.company_font_family || 'Arial',
        company_font_size: initialSettings?.company_font_size || 24,
        company_name_color: initialSettings?.company_name_color || initialSettings?.primary_color || '#3B82F6',
        company_font_weight: initialSettings?.company_font_weight || 'bold',
        company_details_font_family: initialSettings?.company_details_font_family || 'Arial',
        company_details_font_size: initialSettings?.company_details_font_size || 12,
        company_details_color: initialSettings?.company_details_color || '#6b7280',
        terms_font_family: initialSettings?.terms_font_family || 'Arial',
        terms_font_size: initialSettings?.terms_font_size || 12,
        invoice_font_family: initialSettings?.invoice_font_family || 'Arial',
        invoice_font_size: initialSettings?.invoice_font_size || 12,
        primary_color: initialSettings?.primary_color || '#3B82F6',
        secondary_color: initialSettings?.secondary_color || '#8B5CF6',
        terms_and_conditions: initialSettings?.terms_and_conditions || '',
        payment_instructions: initialSettings?.payment_instructions || '',
        footer_text: initialSettings?.footer_text || 'Thank you for your business!',
        show_company_details: initialSettings?.show_company_details ?? true,
        show_gstin: initialSettings?.show_gstin ?? true,
        show_logo: initialSettings?.show_logo ?? true,
        payment_qr_code_url: normalizeImageUrl(initialSettings?.payment_qr_code_url),
        show_qr_code: initialSettings?.show_qr_code ?? true,
    })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <InvoiceSettingsForm 
                    initialSettings={initialSettings} 
                    onPreviewUpdate={setPreviewSettings}
                />
            </div>
            <div className="lg:sticky lg:top-6 h-fit">
                <InvoicePreview settings={previewSettings} />
            </div>
        </div>
    )
}
