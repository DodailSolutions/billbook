'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DollarSign, Calendar, FileText, Pencil, Check, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Payment {
    id: string
    amount: number
    payment_method: string
    payment_notes: string | null
    payment_date: string
    created_at: string
}

interface PaymentHistoryProps {
    invoiceId: string
}

const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    gpay: 'Google Pay',
    phonepe: 'PhonePe',
    paytm: 'Paytm',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    card: 'Card',
    other: 'Other'
}

export function PaymentHistory({ invoiceId }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
    const [editDate, setEditDate] = useState<string>('')
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    const startEditing = (payment: Payment) => {
        setEditingPaymentId(payment.id)
        // Convert to YYYY-MM-DD
        const dateVal = payment.payment_date 
            ? new Date(payment.payment_date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        setEditDate(dateVal)
    }

    const cancelEditing = () => {
        setEditingPaymentId(null)
        setEditDate('')
    }

    const savePaymentDate = async (paymentId: string) => {
        if (!editDate) return
        setIsUpdating(true)
        try {
            const res = await fetch('/api/invoices/partial-payment', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId,
                    paymentDate: editDate
                })
            })
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Failed to update payment date')
            }
            // Update local state
            setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, payment_date: editDate } : p))
            setEditingPaymentId(null)
        } catch (err: any) {
            alert(err.message || 'Error updating date')
        } finally {
            setIsUpdating(false)
        }
    }

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/invoices/partial-payment?invoiceId=${invoiceId}`)
                
                if (!response.ok) {
                    throw new Error('Failed to fetch payment history')
                }

                const data = await response.json()
                setPayments(data.payments || [])
            } catch (err) {
                console.error('Error fetching payment history:', err)
                setError('Failed to load payment history')
            } finally {
                setLoading(false)
            }
        }
        
        fetchPaymentHistory()
    }, [invoiceId])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading payment history...</p>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
            </Card>
        )
    }

    if (payments.length === 0) {
        return null // Don't show the card if there are no payments
    }

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Payment History
                    <span className="ml-auto text-base font-normal text-muted-foreground">
                        {payments.length} payment{payments.length !== 1 ? 's' : ''}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {payments.map((payment, index) => (
                        <div 
                            key={payment.id}
                            className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg"
                        >
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ₹{payment.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Payment #{payments.length - index}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 dark:text-green-300 rounded-full">
                                        {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-2">
                                    {editingPaymentId === payment.id ? (
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded border border-gray-300 dark:border-gray-600">
                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                                className="text-xs px-2 py-1 border rounded bg-transparent text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => savePaymentDate(payment.id)}
                                                disabled={isUpdating}
                                                className="p-1 rounded hover:bg-green-100 text-green-700 dark:text-green-400"
                                                title="Save Date"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEditing}
                                                disabled={isUpdating}
                                                className="p-1 rounded hover:bg-red-100 text-red-600 dark:text-red-400"
                                                title="Cancel"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-gray-500" />
                                            <span className="text-xs font-medium">{formatDate(payment.payment_date)}</span>
                                            <button
                                                type="button"
                                                onClick={() => startEditing(payment)}
                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                title="Edit payment date"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {payment.payment_notes && (
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            <span className="text-xs">{payment.payment_notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {payments.length > 1 && (
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Total Paid
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                    ₹{totalPaid.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
