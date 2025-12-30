'use client'

interface InvoicePreviewProps {
    settings: {
        company_name: string
        company_email: string
        company_phone: string
        company_address: string
        company_gstin: string
        company_logo_url?: string
        logo_size?: 'small' | 'medium' | 'large'
        company_font_family?: string
        company_font_size?: number
        company_name_color?: string
        company_font_weight?: 'normal' | 'bold' | 'bolder'
        company_details_font_family?: string
        company_details_font_size?: number
        company_details_color?: string
        terms_font_family?: string
        terms_font_size?: number
        invoice_font_family?: string
        invoice_font_size?: number
        primary_color: string
        secondary_color: string
        terms_and_conditions: string
        payment_instructions: string
        footer_text: string
        show_company_details: boolean
        show_gstin: boolean
        show_logo: boolean
    }
}

export default function InvoicePreview({ settings }: InvoicePreviewProps) {
    const {
        company_name,
        company_email,
        company_phone,
        company_address,
        company_gstin,
        primary_color,
        secondary_color,
        terms_and_conditions,
        payment_instructions,
        footer_text,
        show_company_details,
        show_gstin,
    } = settings

    const invoiceFontFamily = settings.invoice_font_family || 'Arial'
    const invoiceFontSize = settings.invoice_font_size || 12

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg" style={{ fontFamily: invoiceFontFamily, fontSize: `${invoiceFontSize}px` }}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Preview</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
                {/* Header */}
                <div 
                    className="flex justify-between pb-4 mb-6" 
                    style={{ borderBottom: `3px solid ${primary_color}` }}
                >
                    <div className="flex-1">
                        {/* Logo - centered and prominent */}
                        {settings.show_logo && settings.company_logo_url && (() => {
                            const sizeClasses = {
                                small: 'h-16 w-16',
                                medium: 'h-24 w-24',
                                large: 'h-32 w-32'
                            }
                            const logoClass = sizeClasses[settings.logo_size || 'medium']
                            return (
                                <div className="mb-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={settings.company_logo_url} 
                                        alt="Company Logo" 
                                        className={`${logoClass} object-contain`}
                                    />
                                </div>
                            )
                        })()}
                        
                        {/* Company Name - below logo or standalone */}
                        <div 
                            className="mb-2"
                            style={{ 
                                color: settings.company_name_color || primary_color,
                                fontFamily: settings.company_font_family || 'Arial',
                                fontSize: `${settings.company_font_size || 24}px`,
                                fontWeight: settings.company_font_weight || 'bold'
                            }}
                        >
                            {company_name || 'Your Company'}
                        </div>
                        
                        {/* Company Details */}
                        {show_company_details && (
                            <div 
                                className="space-y-1"
                                style={{
                                    fontFamily: settings.company_details_font_family || 'Arial',
                                    fontSize: `${settings.company_details_font_size || 12}px`,
                                    color: settings.company_details_color || '#6b7280'
                                }}
                            >
                                {company_address && <div>{company_address}</div>}
                                {company_email && <div>Email: {company_email}</div>}
                                {company_phone && <div>Phone: {company_phone}</div>}
                                {show_gstin && company_gstin && <div>GSTIN: {company_gstin}</div>}
                            </div>
                        )}
                    </div>
                    <div>
                        <div 
                            className="text-3xl font-bold"
                            style={{ color: primary_color }}
                        >
                            INVOICE
                        </div>
                        <div className="text-sm text-gray-500 mt-2">INV-001</div>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex gap-6 mb-6">
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Invoice Date
                        </div>
                        <div className="font-semibold text-gray-900" style={{ fontSize: `${invoiceFontSize + 2}px` }}>Jan 1, 2024</div>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Due Date
                        </div>
                        <div className="font-semibold text-gray-900" style={{ fontSize: `${invoiceFontSize + 2}px` }}>Jan 31, 2024</div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-6">
                    <div 
                        className="text-sm font-semibold mb-2"
                        style={{ color: primary_color }}
                    >
                        Bill To:
                    </div>
                    <div className="text-gray-700">
                        <div className="font-semibold">Sample Customer</div>
                        <div className="text-sm">customer@example.com</div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-6">
                    <thead>
                        <tr 
                            className="text-white text-sm"
                            style={{ 
                                background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})` 
                            }}
                        >
                            <th className="text-left p-3">Description</th>
                            <th className="text-right p-3">Qty</th>
                            <th className="text-right p-3">Price</th>
                            <th className="text-right p-3">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="p-3 text-gray-700">Sample Item</td>
                            <td className="p-3 text-right text-gray-700">1</td>
                            <td className="p-3 text-right text-gray-700">₹1,000.00</td>
                            <td className="p-3 text-right text-gray-700">₹1,000.00</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                    <div className="w-64">
                        <div className="flex justify-between py-2 text-gray-700">
                            <span>Subtotal:</span>
                            <span>₹1,000.00</span>
                        </div>
                        <div className="flex justify-between py-2 text-gray-700 border-b">
                            <span>GST (18%):</span>
                            <span>₹180.00</span>
                        </div>
                        <div 
                            className="flex justify-between py-3 text-lg font-bold mt-2"
                            style={{ 
                                color: primary_color,
                                borderTop: `2px solid ${primary_color}` 
                            }}
                        >
                            <span>Total:</span>
                            <span>₹1,180.00</span>
                        </div>
                    </div>
                </div>

                {/* Payment Instructions */}
                {payment_instructions && (
                    <div className="mb-6 pt-4 border-t">
                        <div 
                            className="text-sm font-semibold mb-2"
                            style={{ color: primary_color }}
                        >
                            Payment Instructions:
                        </div>
                        <div 
                            className="whitespace-pre-wrap"
                            style={{
                                fontFamily: settings.terms_font_family || 'Arial',
                                fontSize: `${settings.terms_font_size || 12}px`,
                                color: '#6b7280'
                            }}
                        >
                            {payment_instructions}
                        </div>
                    </div>
                )}

                {/* Terms and Conditions */}
                {terms_and_conditions && (
                    <div className="mb-6 pt-4 border-t">
                        <div 
                            className="text-sm font-semibold mb-2"
                            style={{ color: primary_color }}
                        >
                            Terms and Conditions:
                        </div>
                        <div 
                            className="whitespace-pre-wrap"
                            style={{
                                fontFamily: settings.terms_font_family || 'Arial',
                                fontSize: `${settings.terms_font_size || 12}px`,
                                color: '#6b7280'
                            }}
                        >
                            {terms_and_conditions}
                        </div>
                    </div>
                )}

                {/* Footer */}
                {footer_text && (
                    <div className="text-center text-gray-400 text-xs mt-6 pt-4 border-t">
                        {footer_text}
                    </div>
                )}
            </div>
        </div>
    )
}
