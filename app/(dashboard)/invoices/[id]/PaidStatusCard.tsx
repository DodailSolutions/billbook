'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Calendar, CreditCard, FileText, Pencil, Check, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PaidStatusCardProps {
    invoiceId: string
    totalAmount: number
    paymentMethod?: string | null
    paidAt?: string | null
    paymentNotes?: string | null
}

export function PaidStatusCard({
    invoiceId,
    totalAmount,
    paymentMethod,
    paidAt,
    paymentNotes
}: PaidStatusCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [isEditingDate, setIsEditingDate] = useState(false)
    const [currentDate, setCurrentDate] = useState(() => paidAt ? new Date(paidAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
    const [tempDate, setTempDate] = useState(currentDate)
    const [isSaving, setIsSaving] = useState(false)

    const handleSaveDate = async () => {
        if (!tempDate) return
        setIsSaving(true)
        try {
            // Find recent payment id or update via API
            const historyRes = await fetch(`/api/invoices/partial-payment?invoiceId=${invoiceId}`)
            const data = await historyRes.json().catch(() => ({}))
            const firstPayment = data.payments?.[0]

            if (firstPayment?.id) {
                const patchRes = await fetch('/api/invoices/partial-payment', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId: firstPayment.id,
                        paymentDate: tempDate
                    })
                })
                if (!patchRes.ok) {
                    const err = await patchRes.json().catch(() => ({}))
                    throw new Error(err.error || 'Failed to update payment date')
                }
            }
            setCurrentDate(tempDate)
            setIsEditingDate(false)
        } catch (err: any) {
            alert(err.message || 'Error updating date')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl p-5 shadow-xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest font-black text-emerald-800 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                                FULLY PAID
                            </span>
                            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                ₹{totalAmount.toFixed(2)} Settled
                            </span>
                        </div>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                            This invoice is completely settled. No payment due.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-700"
                    >
                        {showDetails ? (
                            <>
                                <span>Hide Details</span>
                                <ChevronUp className="h-3.5 w-3.5" />
                            </>
                        ) : (
                            <>
                                <span>Show Payment Details</span>
                                <ChevronDown className="h-3.5 w-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Collapsible Payment Details */}
            {showDetails && (
                <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                                <Calendar className="h-3.5 w-3.5" />
                                Payment Date:
                            </span>
                            {isEditingDate ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="date"
                                        value={tempDate}
                                        onChange={(e) => setTempDate(e.target.value)}
                                        className="text-xs px-2 py-0.5 border rounded bg-white text-gray-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSaveDate}
                                        disabled={isSaving}
                                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                                        title="Save"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingDate(false)}
                                        disabled={isSaving}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        title="Cancel"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold">{formatDate(currentDate)}</span>
                                    <button
                                        type="button"
                                        onClick={() => { setTempDate(currentDate); setIsEditingDate(true) }}
                                        className="p-0.5 text-emerald-600 hover:text-emerald-800"
                                        title="Edit payment date"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {paymentMethod && (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Payment Method:
                                </span>
                                <span className="font-semibold capitalize">
                                    {paymentMethod.replace('_', ' ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {paymentNotes && (
                        <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-white/70 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">
                                <strong className="text-emerald-800 dark:text-emerald-300">Reference / Notes:</strong> {paymentNotes}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
