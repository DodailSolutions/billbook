'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DollarSign, Calendar, FileText, Pencil, Check, X, Trash2, Loader2 } from 'lucide-react'
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
    const router = useRouter()
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
    const [editDate, setEditDate] = useState<string>('')
    const [editAmount, setEditAmount] = useState<string>('')
    const [editMethod, setEditMethod] = useState<string>('cash')
    const [editNotes, setEditNotes] = useState<string>('')
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    useEffect(() => {
        fetchPaymentHistory()
    }, [invoiceId])

    const startEditing = (payment: Payment) => {
        setEditingPayment(payment)
        const dateVal = payment.payment_date 
            ? new Date(payment.payment_date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        setEditDate(dateVal)
        setEditAmount(payment.amount.toString())
        setEditMethod(payment.payment_method || 'cash')
        setEditNotes(payment.payment_notes || '')
    }

    const cancelEditing = () => {
        setEditingPayment(null)
    }

    const savePaymentEdit = async () => {
        if (!editingPayment) return
        const parsedAmount = parseFloat(editAmount)
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert('Please enter a valid payment amount')
            return
        }
        if (!editDate) {
            alert('Please select a payment date')
            return
        }

        setIsUpdating(true)
        try {
            const res = await fetch('/api/invoices/partial-payment', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId: editingPayment.id,
                    invoiceId,
                    amount: parsedAmount,
                    paymentDate: editDate,
                    paymentMethod: editMethod,
                    paymentNotes: editNotes
                })
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to update payment')
            }

            setEditingPayment(null)
            await fetchPaymentHistory()
            router.refresh()
        } catch (err: any) {
            alert(err.message || 'Error updating payment')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleVoidPayment = async (payment: Payment) => {
        const confirmVoid = window.confirm(
            `Are you sure you want to void this payment of ₹${payment.amount.toFixed(2)}? This will recalculate the invoice status and balance.`
        )
        if (!confirmVoid) return

        setDeletingId(payment.id)
        try {
            const res = await fetch(`/api/invoices/partial-payment?paymentId=${payment.id}&invoiceId=${invoiceId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to void payment')
            }

            await fetchPaymentHistory()
            router.refresh()
        } catch (err: any) {
            alert(err.message || 'Error voiding payment')
        } finally {
            setDeletingId(null)
        }
    }

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
        return null
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 dark:text-green-300 rounded-full">
                                            {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => startEditing(payment)}
                                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                            title="Edit payment details"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleVoidPayment(payment)}
                                            disabled={deletingId === payment.id}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                            title="Void payment"
                                        >
                                            {deletingId === payment.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs font-medium">{formatDate(payment.payment_date)}</span>
                                    </div>
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

                {/* Edit Payment Modal */}
                {editingPayment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isUpdating && cancelEditing()}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Payment Record</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-transparent text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-transparent text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Payment Method
                                    </label>
                                    <select
                                        value={editMethod}
                                        onChange={(e) => setEditMethod(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-transparent text-gray-900 dark:text-white"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="gpay">Google Pay</option>
                                        <option value="phonepe">PhonePe</option>
                                        <option value="paytm">Paytm</option>
                                        <option value="upi">UPI (Other)</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="card">Card</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Notes
                                    </label>
                                    <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-md bg-transparent text-gray-900 dark:text-white"
                                        placeholder="Optional transaction reference"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        disabled={isUpdating}
                                        className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={savePaymentEdit}
                                        disabled={isUpdating}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
