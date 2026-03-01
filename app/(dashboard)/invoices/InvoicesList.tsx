'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Eye, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { deleteInvoice, updateInvoiceStatus } from "./actions"
import type { InvoiceWithDetails } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"

interface InvoicesListProps {
    invoices: InvoiceWithDetails[]
}

const statusColors = {
    draft: 'bg-orange-100 text-orange-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
    draft: 'NOT PAID',
    sent: 'SENT',
    paid: 'PAID',
    partial: 'PARTIAL',
    cancelled: 'CANCELLED',
}

export function InvoicesList({ invoices }: InvoicesListProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) {
            return
        }

        setDeletingId(id)
        try {
            const result = await deleteInvoice(id)
            
            if (result.success) {
                router.refresh()
            } else {
                console.error('Error deleting invoice:', result.error)
                alert(result.error || 'Failed to delete invoice')
            }
        } catch (error) {
            console.error('Server error deleting invoice:', error)
            alert('A server error occurred. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    const handleStatusChange = async (id: string, status: 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled') => {
        setUpdatingId(id)
        try {
            const result = await updateInvoiceStatus(id, status)
            
            if (result.success) {
                // Force refresh to get updated data from server
                router.refresh()
            } else {
                console.error('Error updating status:', result.error)
                alert(result.error || 'Failed to update status. Please try again.')
            }
        } catch (error) {
            console.error('Server error updating status:', error)
            alert('A server error occurred. Please try again or contact support if the issue persists.')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="space-y-3 md:space-y-4">
            {invoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-white">
                    <CardContent className="p-4 md:p-6">
                        {/* Mobile Layout */}
                        <div className="flex flex-col md:hidden space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold mb-1 text-gray-900">{invoice.invoice_number}</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className={cn(
                                            "inline-block px-2 py-1 rounded-full text-xs font-medium",
                                            statusColors[invoice.status]
                                        )}>
                                            {statusLabels[invoice.status]}
                                        </span>
                                        {invoice.recurring_invoices && invoice.recurring_invoices.length > 0 && (
                                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                🔄 RECURRING
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {invoice.status === 'partial' ? (
                                        <>
                                            <p className="text-lg font-bold text-orange-600">₹{(invoice.amount_remaining || (invoice.total - (invoice.amount_paid || 0))).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">Remaining</p>
                                        </>
                                    ) : (
                                        <p className="text-lg font-bold text-gray-900">₹{invoice.total.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-600">
                                    Customer: <span className="font-medium text-gray-900">{invoice.customer.name}</span>
                                </p>
                                <p className="text-gray-600">
                                    Date: {formatDate(invoice.invoice_date)}
                                </p>
                                {invoice.recurring_invoices && invoice.recurring_invoices.length > 0 && invoice.recurring_invoices[0].is_active && (
                                    <p className="text-sm font-medium text-purple-700">
                                        📊 Next billing: {formatDate(invoice.recurring_invoices[0].next_invoice_date)}
                                    </p>
                                )}
                                {invoice.gst_percentage > 0 && (
                                    <p className="text-xs text-gray-500">
                                        (incl. {invoice.gst_percentage}% GST)
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                                <select
                                    value={invoice.status}
                                    onChange={(e) => handleStatusChange(invoice.id, e.target.value as 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled')}
                                    disabled={updatingId === invoice.id}
                                    className="flex-1 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="draft">Not Paid</option>
                                    <option value="sent">Sent</option>
                                    <option value="partial">Partial Payment</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <Link href={`/invoices/${invoice.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>

                                <a href={`/api/invoices/${invoice.id}/pdf?mode=preview`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </a>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(invoice.id)}
                                    disabled={deletingId === invoice.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        statusColors[invoice.status]
                                    )}>
                                        {statusLabels[invoice.status]}
                                    </span>
                                    {invoice.recurring_invoices && invoice.recurring_invoices.length > 0 && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            🔄 RECURRING
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Customer: <span className="font-medium text-gray-900">{invoice.customer.name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Date: {formatDate(invoice.invoice_date)}
                                </p>
                                {invoice.recurring_invoices && invoice.recurring_invoices.length > 0 && invoice.recurring_invoices[0].is_active && (
                                    <p className="text-sm font-medium text-purple-700 mt-1">
                                        📊 Next billing: {formatDate(invoice.recurring_invoices[0].next_invoice_date)} ({invoice.recurring_invoices[0].frequency})
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    {invoice.status === 'partial' ? (
                                        <>
                                            <p className="text-2xl font-bold text-orange-600">₹{(invoice.amount_remaining || (invoice.total - (invoice.amount_paid || 0))).toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">Remaining to Pay</p>
                                            {invoice.gst_percentage > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    Total: ₹{invoice.total.toFixed(2)} (incl. {invoice.gst_percentage}% GST)
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-gray-900">₹{invoice.total.toFixed(2)}</p>
                                            {invoice.gst_percentage > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    (incl. {invoice.gst_percentage}% GST)
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={invoice.status}
                                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled')}
                                        disabled={updatingId === invoice.id}
                                        className="flex-1 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="draft">Not Paid</option>
                                        <option value="sent">Sent</option>
                                        <option value="partial">Partial Payment</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>

                                    <Link href={`/invoices/${invoice.id}`}>
                                        <Button variant="outline" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <a href={`/api/invoices/${invoice.id}/pdf?mode=preview`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(invoice.id)}
                                        disabled={deletingId === invoice.id}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
