'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { processRefund } from '@/app/(dashboard)/invoices/payment-actions'

interface Payment {
    invoice?: { invoice_number: string }
}

interface RefundWithPayment {
    id: string
    payment_id: string
    user_id: string
    invoice_id?: string
    amount: number
    currency: string
    reason?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    processed_by?: string
    processed_at?: string
    gateway_refund_id?: string
    notes?: string
    created_at: string
    updated_at: string
    payment?: Payment
}

interface RefundsTableProps {
    refunds: RefundWithPayment[]
}

export default function RefundsTable({ refunds }: RefundsTableProps) {
    const router = useRouter()
    const [processing, setProcessing] = useState<string | null>(null)
    const [selectedRefund, setSelectedRefund] = useState<RefundWithPayment | null>(null)

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
                {status.toUpperCase()}
            </span>
        )
    }

    const handleProcess = async (refundId: string, approve: boolean) => {
        const action = approve ? 'approve and process' : 'reject'
        if (!confirm(`Are you sure you want to ${action} this refund?`)) {
            return
        }

        setProcessing(refundId)
        try {
            const notes = approve 
                ? 'Refund approved and processed by admin' 
                : 'Refund rejected by admin'
            
            await processRefund(refundId, approve, notes)
            router.refresh()
        } catch (error) {
            console.error('Error processing refund:', error)
            alert(error instanceof Error ? error.message : 'Failed to process refund')
        } finally {
            setProcessing(null)
        }
    }

    if (refunds.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No refund requests found</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="text-left p-3 font-semibold">Refund ID</th>
                            <th className="text-left p-3 font-semibold">Invoice</th>
                            <th className="text-left p-3 font-semibold">Amount</th>
                            <th className="text-left p-3 font-semibold">Reason</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            <th className="text-left p-3 font-semibold">Date</th>
                            <th className="text-right p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {refunds.map((refund) => {
                            const payment = refund.payment
                            
                            return (
                                <tr key={refund.id} className="border-t hover:bg-muted/50">
                                    <td className="p-3">
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {refund.id.slice(0, 8)}...
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {payment?.invoice ? (
                                            <span className="font-medium">
                                                {payment.invoice.invoice_number}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className="font-semibold">
                                            ₹{refund.amount.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-sm text-muted-foreground line-clamp-2">
                                            {refund.reason || 'No reason provided'}
                                        </span>
                                    </td>
                                    <td className="p-3">{getStatusBadge(refund.status)}</td>
                                    <td className="p-3">
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(refund.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedRefund(refund)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            
                                            {refund.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleProcess(refund.id, true)}
                                                        disabled={processing === refund.id}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400"
                                                    >
                                                        {processing === refund.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleProcess(refund.id, false)}
                                                        disabled={processing === refund.id}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedRefund && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Refund Details</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRefund(null)}
                            >
                                ×
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Refund ID</p>
                                    <p className="font-mono text-sm">{selectedRefund.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    {getStatusBadge(selectedRefund.status)}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-semibold text-lg">₹{selectedRefund.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Currency</p>
                                    <p className="font-medium">{selectedRefund.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="text-sm">{new Date(selectedRefund.created_at).toLocaleString()}</p>
                                </div>
                                {selectedRefund.processed_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Processed At</p>
                                        <p className="text-sm">{new Date(selectedRefund.processed_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {selectedRefund.reason && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Reason</p>
                                    <p className="text-sm bg-muted p-3 rounded">{selectedRefund.reason}</p>
                                </div>
                            )}

                            {selectedRefund.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                                    <p className="text-sm bg-muted p-3 rounded">{selectedRefund.notes}</p>
                                </div>
                            )}

                            {selectedRefund.gateway_refund_id && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Razorpay Refund ID</p>
                                    <p className="font-mono text-sm">{selectedRefund.gateway_refund_id}</p>
                                </div>
                            )}

                            {selectedRefund.status === 'pending' && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        onClick={() => {
                                            handleProcess(selectedRefund.id, true)
                                            setSelectedRefund(null)
                                        }}
                                        disabled={processing === selectedRefund.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve & Process
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleProcess(selectedRefund.id, false)
                                            setSelectedRefund(null)
                                        }}
                                        disabled={processing === selectedRefund.id}
                                        className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
