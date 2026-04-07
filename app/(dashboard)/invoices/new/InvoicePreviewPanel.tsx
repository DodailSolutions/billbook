'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import type { Customer } from '@/lib/types'

interface InvoiceItem {
    description: string
    details?: string
    quantity: number
    unit_price: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
}

interface InvoiceSettings {
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
    payment_qr_code_url?: string
    show_qr_code?: boolean
    digital_signature_url?: string
    show_signature?: boolean
    company_stamp_url?: string
    show_stamp?: boolean
}

interface InvoicePreviewPanelProps {
    selectedCustomerId: string
    customers: Customer[]
    items: InvoiceItem[]
    gstPercentage: number
    supplyType: 'intra-state' | 'inter-state'
    reverseCharge: boolean
    invoiceDate: string
    dueDate?: string
    notes?: string
}

export function InvoicePreviewPanel({
    selectedCustomerId,
    customers,
    items,
    gstPercentage,
    supplyType,
    reverseCharge,
    invoiceDate,
    dueDate,
    notes
}: InvoicePreviewPanelProps) {
    const [settings, setSettings] = useState<InvoiceSettings | null>(null)

    useEffect(() => {
        // Fetch invoice settings
        fetch('/api/invoices/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(data.settings)
                }
            })
            .catch(err => console.error('Error loading settings:', err))
    }, [])

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }

    const calculateItemGST = (item: InvoiceItem) => {
        const itemAmount = item.quantity * item.unit_price
        const itemGstRate = item.gst_rate !== undefined ? item.gst_rate : gstPercentage
        return (itemAmount * itemGstRate) / 100
    }

    const calculateTotalGST = () => {
        return items.reduce((sum, item) => sum + calculateItemGST(item), 0)
    }

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTotalGST()
    }

    if (!settings) {
        return (
            <div className="bg-card rounded-lg border p-8 sticky top-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                </div>
            </div>
        )
    }

    const primaryColor = settings.primary_color
    const secondaryColor = settings.secondary_color
    const invoiceFontFamily = settings.invoice_font_family || 'Arial'
    const invoiceFontSize = settings.invoice_font_size || 12

    return (
        <div className="bg-white rounded-lg border shadow-lg p-6 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Invoice Preview</h3>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-white" style={{ fontFamily: invoiceFontFamily, fontSize: `${invoiceFontSize}px` }}>
                {/* Header */}
                <div 
                    className="flex justify-between pb-4 mb-6" 
                    style={{ borderBottom: `3px solid ${primaryColor}` }}
                >
                    <div className="flex-1">
                        {/* Logo */}
                        {settings.show_logo && settings.company_logo_url && settings.company_logo_url.trim() && settings.company_logo_url.startsWith('data:image') && (() => {
                            const sizeClasses = {
                                small: 'h-12 w-12',
                                medium: 'h-16 w-16',
                                large: 'h-20 w-20'
                            }
                            const logoClass = sizeClasses[settings.logo_size || 'medium']
                            return (
                                <div className="mb-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={settings.company_logo_url} 
                                        alt="Company Logo" 
                                        className={`${logoClass} object-contain`}
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                    />
                                </div>
                            )
                        })()}
                        
                        {/* Company Name */}
                        <div 
                            className="mb-2 font-bold"
                            style={{ 
                                color: settings.company_name_color || primaryColor,
                                fontFamily: settings.company_font_family || 'Arial',
                                fontSize: `${Math.min(settings.company_font_size || 24, 20)}px`,
                                fontWeight: settings.company_font_weight || 'bold'
                            }}
                        >
                            {settings.company_name || 'Your Company'}
                        </div>
                        
                        {/* Company Details */}
                        {settings.show_company_details && (
                            <div 
                                className="space-y-0.5 text-xs"
                                style={{
                                    fontFamily: settings.company_details_font_family || 'Arial',
                                    fontSize: `${Math.min(settings.company_details_font_size || 12, 10)}px`,
                                    color: settings.company_details_color || '#6b7280'
                                }}
                            >
                                {settings.company_address && <div>{settings.company_address}</div>}
                                {settings.company_email && <div>{settings.company_email}</div>}
                                {settings.company_phone && <div>{settings.company_phone}</div>}
                                {settings.show_gstin && settings.company_gstin && <div>GSTIN: {settings.company_gstin}</div>}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div 
                            className="text-2xl font-bold"
                            style={{ color: primaryColor }}
                        >
                            INVOICE
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Preview</div>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex gap-4 mb-4 text-xs">
                    <div className="flex-1">
                        <div className="text-gray-500 uppercase tracking-wide mb-1">
                            Invoice Date
                        </div>
                        <div className="font-semibold text-gray-900">
                            {invoiceDate ? formatDate(invoiceDate) : 'Not set'}
                        </div>
                    </div>
                    {dueDate && (
                        <div className="flex-1">
                            <div className="text-gray-500 uppercase tracking-wide mb-1">
                                Due Date
                            </div>
                            <div className="font-semibold text-gray-900">
                                {formatDate(dueDate)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bill To */}
                <div className="mb-4">
                    <div 
                        className="text-xs font-semibold mb-1"
                        style={{ color: primaryColor }}
                    >
                        Bill To:
                    </div>
                    {selectedCustomer ? (
                        <div className="text-xs text-gray-700">
                            <div className="font-semibold">{selectedCustomer.name}</div>
                            {selectedCustomer.email && <div>{selectedCustomer.email}</div>}
                            {selectedCustomer.phone && <div>{selectedCustomer.phone}</div>}
                            {selectedCustomer.address && <div className="text-gray-500">{selectedCustomer.address}</div>}
                            {selectedCustomer.gstin && <div className="text-gray-500">GSTIN: {selectedCustomer.gstin}</div>}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 italic">Select a customer</div>
                    )}
                </div>

                {/* Items Table */}
                {items.length > 0 && items.some(item => item.description) ? (
                    <div className="mb-4">
                        <table className="w-full text-xs">
                            <thead>
                                <tr 
                                    className="text-white"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                                    }}
                                >
                                    <th className="text-left p-2">Description</th>
                                    {items.some(item => item.hsn_sac_code) && (
                                        <th className="text-left p-2">HSN/SAC</th>
                                    )}
                                    <th className="text-right p-2">Qty</th>
                                    <th className="text-right p-2">Price</th>
                                    <th className="text-right p-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.filter(item => item.description).map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-200">
                                        <td className="p-2 text-gray-700">
                                            <div>{item.description}</div>
                                            {item.details && (
                                                <div className="text-xs text-gray-400 mt-0.5 whitespace-pre-line">{item.details}</div>
                                            )}
                                        </td>
                                        {items.some(i => i.hsn_sac_code) && (
                                            <td className="p-2 text-gray-500">{item.hsn_sac_code || '-'}</td>
                                        )}
                                        <td className="p-2 text-right text-gray-700">{item.quantity}</td>
                                        <td className="p-2 text-right text-gray-700">₹{item.unit_price.toFixed(2)}</td>
                                        <td className="p-2 text-right text-gray-700">₹{(item.quantity * item.unit_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="mb-4 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400">
                        Add items to see preview
                    </div>
                )}

                {/* Totals */}
                <div className="flex justify-end mb-4">
                    <div className="w-48 text-xs">
                        <div className="flex justify-between py-1 text-gray-700">
                            <span>Subtotal:</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {gstPercentage > 0 && (
                            <>
                                {supplyType === 'intra-state' ? (
                                    <>
                                        <div className="flex justify-between py-1 text-gray-700">
                                            <span>CGST ({(gstPercentage / 2).toFixed(2)}%):</span>
                                            <span>₹{(calculateTotalGST() / 2).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-gray-700">
                                            <span>SGST ({(gstPercentage / 2).toFixed(2)}%):</span>
                                            <span>₹{(calculateTotalGST() / 2).toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between py-1 text-gray-700">
                                        <span>IGST ({gstPercentage}%):</span>
                                        <span>₹{calculateTotalGST().toFixed(2)}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {reverseCharge && (
                            <div className="flex justify-between py-1 text-red-600 text-xs font-medium">
                                <span>Reverse Charge</span>
                                <span>⚠️</span>
                            </div>
                        )}
                        <div 
                            className="flex justify-between py-2 font-bold mt-2 border-t-2"
                            style={{ 
                                color: primaryColor,
                                borderColor: primaryColor
                            }}
                        >
                            <span>Total:</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {notes && (
                    <div className="mb-4 pt-3 border-t">
                        <div 
                            className="text-xs font-semibold mb-1"
                            style={{ color: primaryColor }}
                        >
                            Notes:
                        </div>
                        <div className="text-xs text-gray-600 whitespace-pre-wrap">
                            {notes}
                        </div>
                    </div>
                )}

                {/* Payment Instructions + QR side by side */}
                {(settings.payment_instructions || (settings.show_qr_code && settings.payment_qr_code_url?.startsWith('data:image'))) && (
                    <div className="mb-3 pt-3 border-t flex gap-3 items-start">
                        {settings.payment_instructions && (
                            <div className="flex-1">
                                <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>Payment Instructions:</div>
                                <div className="text-xs text-gray-600 whitespace-pre-wrap">{settings.payment_instructions}</div>
                            </div>
                        )}
                        {settings.show_qr_code && settings.payment_qr_code_url?.startsWith('data:image') && (
                            <div className="text-center shrink-0">
                                <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>Scan to Pay</div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.payment_qr_code_url} alt="QR" className="h-20 w-20 object-contain border rounded mx-auto"
                                    style={{ borderColor: primaryColor }}
                                    onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                <div className="text-xs text-gray-400 mt-1">GPay | PhonePe | UPI</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Signature, Stamp & Client Signature — always shown */}
                <div className="flex justify-between items-end gap-4 mt-4 pt-3 border-t border-gray-200">
                    {/* Client signature placeholder */}
                    <div className="text-center min-w-[120px]">
                        <div className="border-2 border-dashed border-gray-300 rounded h-12 mb-1" />
                        <div className="text-xs text-gray-400">Customer Signature</div>
                    </div>
                    {/* Company seal + authorized signatory */}
                    <div className="flex items-end gap-4">
                        {settings.show_stamp && settings.company_stamp_url?.startsWith('data:image') && (
                            <div className="text-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.company_stamp_url} alt="Stamp" className="h-16 w-16 object-contain opacity-85 mx-auto"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                <div className="text-xs text-gray-500 mt-1">Company Seal</div>
                            </div>
                        )}
                        {settings.show_signature && settings.digital_signature_url?.startsWith('data:image') && (
                            <div className="text-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.digital_signature_url} alt="Signature" className="h-10 w-28 object-contain mx-auto"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                <div className="border-t-2 border-gray-700 mt-1 pt-1 text-xs font-semibold text-gray-700">{settings.company_name}</div>
                                <div className="text-xs text-gray-400">Authorized Signatory</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {settings.footer_text && (
                    <div className="text-center text-gray-400 text-xs mt-3 pt-3 border-t">
                        {settings.footer_text}
                    </div>
                )}
            </div>
        </div>
    )
}
