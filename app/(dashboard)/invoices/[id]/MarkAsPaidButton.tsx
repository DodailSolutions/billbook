'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

interface MarkAsPaidButtonProps {
    invoiceId: string
    invoiceNumber: string
}

export function MarkAsPaidButton({ invoiceId, invoiceNumber }: MarkAsPaidButtonProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [paymentNotes, setPaymentNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/invoices/mark-paid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId,
                    paymentMethod,
                    paymentNotes
                })
            })

            if (!response.ok) {
                throw new Error('Failed to mark invoice as paid')
            }

            router.refresh()
            setIsOpen(false)
        } catch (error) {
            console.error('Error marking invoice as paid:', error)
            alert('Failed to mark invoice as paid')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark as Paid
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !isSubmitting && setIsOpen(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">Mark Invoice as Paid</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Invoice: {invoiceNumber}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            {isSubmitting ? 'Marking...' : 'Mark as Paid'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
