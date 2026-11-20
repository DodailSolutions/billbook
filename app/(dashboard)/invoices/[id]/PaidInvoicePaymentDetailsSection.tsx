'use client'

import { useState, useTransition } from 'react'
import { Building2, Eye, EyeOff, QrCode } from 'lucide-react'
import { toggleInvoiceBankDetailsWhenPaid } from '../actions'

interface PaidInvoicePaymentDetailsSectionProps {
    invoiceId: string
    isPaid: boolean
    initialShowBankDetails: boolean
    paymentInstructions?: string
    paymentQrCodeUrl?: string
    showQrCode?: boolean
    primaryColor?: string
}

export function PaidInvoicePaymentDetailsSection({
    invoiceId,
    isPaid,
    initialShowBankDetails,
    paymentInstructions,
    paymentQrCodeUrl,
    showQrCode = true,
    primaryColor = '#3B82F6',
}: PaidInvoicePaymentDetailsSectionProps) {
    const [showBankDetails, setShowBankDetails] = useState(initialShowBankDetails)
    const [isPending, startTransition] = useTransition()

    const handleToggle = (checked: boolean) => {
        setShowBankDetails(checked)
        // Dispatch event so DownloadPDFButton immediately syncs its PDF export options
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('invoice_payment_details_toggle', {
                    detail: { invoiceId, show: checked }
                })
            )
        }

        // Persist to database in background
        startTransition(async () => {
            try {
                await toggleInvoiceBankDetailsWhenPaid(invoiceId, checked)
            } catch (err) {
                console.error('Failed to save toggle state:', err)
            }
        })
    }

    const hasInstructions = Boolean(paymentInstructions && paymentInstructions.trim())
    const hasQrCode = Boolean(showQrCode && paymentQrCodeUrl && paymentQrCodeUrl.trim())

    // If there are no payment instructions or QR code in settings, nothing to show
    if (!hasInstructions && !hasQrCode) {
        return null
    }

    // For unpaid invoices, always show details
    if (!isPaid) {
        return (
            <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 bg-blue-50/40 dark:bg-blue-900/10">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Bank & Payment Details
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                    {hasInstructions && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-1">
                            {paymentInstructions}
                        </p>
                    )}
                    {hasQrCode && (
                        <div className="text-center shrink-0 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-center gap-1">
                                <QrCode className="h-3 w-3" /> Scan to Pay
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={paymentQrCodeUrl}
                                alt="Payment QR Code"
                                className="h-24 w-24 object-contain border rounded-lg mx-auto"
                                style={{ borderColor: primaryColor }}
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <div className="text-[10px] text-gray-400 mt-1">UPI / QR Payment</div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // For PAID invoices:
    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40">
            {/* Control Bar */}
            <div className="px-5 py-3 border-b border-gray-200/60 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-500" /> Payment Details on Paid Invoice:
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${showBankDetails ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {showBankDetails ? 'Visible' : 'Hidden'}
                    </span>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showBankDetails}
                        onChange={(e) => handleToggle(e.target.checked)}
                        disabled={isPending}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Show bank details & QR on invoice & PDF
                    </span>
                </label>
            </div>

            {/* Content Body */}
            {showBankDetails ? (
                <div className="px-5 py-4 bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                        {hasInstructions && (
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    🏦 Bank / Payment Details
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {paymentInstructions}
                                </p>
                            </div>
                        )}
                        {hasQrCode && (
                            <div className="text-center shrink-0 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-center gap-1">
                                    <QrCode className="h-3 w-3" /> Scan to Pay
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={paymentQrCodeUrl}
                                    alt="Payment QR Code"
                                    className="h-24 w-24 object-contain border rounded-lg mx-auto"
                                    style={{ borderColor: primaryColor }}
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                                <div className="text-[10px] text-gray-400 mt-1">UPI / QR Payment</div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span className="italic flex items-center gap-1.5">
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        Bank details and scan-to-pay QR code are hidden because this invoice is already paid.
                    </span>
                    <button
                        type="button"
                        onClick={() => handleToggle(true)}
                        className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 hover:underline ml-2"
                    >
                        <Eye className="h-3.5 w-3.5" /> Show
                    </button>
                </div>
            )}
        </div>
    )
}
