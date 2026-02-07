'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { DollarSign } from 'lucide-react'

interface PartialPaymentButtonProps {
    invoiceId: string
    invoiceNumber: string
    totalAmount: number
    amountPaid: number
    amountRemaining: number
}

export function PartialPaymentButton({ 
    invoiceId, 
    invoiceNumber, 
    totalAmount,
    amountPaid,
    amountRemaining 
}: PartialPaymentButtonProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [paymentNotes, setPaymentNotes] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const amount = parseFloat(paymentAmount)

        // Validation
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount')
            setIsSubmitting(false)
            return
        }

        if (amount > amountRemaining) {
            setError(`Amount cannot exceed remaining balance of ₹${amountRemaining.toFixed(2)}`)
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch('/api/invoices/partial-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId,
                    amount,
                    paymentMethod,
                    paymentNotes
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to record payment')
            }

            router.refresh()
            setIsOpen(false)
            setPaymentAmount('')
            setPaymentNotes('')
            setError('')
        } catch (error) {
            console.error('Error recording payment:', error)
            setError(error instanceof Error ? error.message : 'Failed to record payment')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Record Payment
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !isSubmitting && setIsOpen(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Invoice: {invoiceNumber}
                </p>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 text-gray-600">Total Amount:</span>
                        <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 text-gray-600">Paid So Far:</span>
                        <span className="font-semibold text-green-600">₹{amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
                        <span className="text-gray-600 text-gray-600 font-medium">Remaining:</span>
                        <span className="font-bold text-blue-600">₹{amountRemaining.toFixed(2)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="paymentAmount" className="block text-sm font-medium mb-2">
                            Payment Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <input
                                id="paymentAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={amountRemaining}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full pl-8 pr-3 py-2 border rounded-md bg-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum: ₹{amountRemaining.toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
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
                        <label htmlFor="paymentNotes" className="block text-sm font-medium mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="paymentNotes"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            placeholder="Transaction ID, reference number, etc."
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
