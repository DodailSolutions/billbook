'use client'

import { useState } from "react"
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
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
}

export function InvoicesList({ invoices }: InvoicesListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) {
            return
        }

        setDeletingId(id)
        try {
            await deleteInvoice(id)
        } catch (error) {
            console.error('Error deleting invoice:', error)
            alert('Failed to delete invoice')
        } finally {
            setDeletingId(null)
        }
    }

    const handleStatusChange = async (id: string, status: 'draft' | 'sent' | 'paid' | 'cancelled') => {
        try {
            await updateInvoiceStatus(id, status)
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        }
    }

    return (
        <div className="space-y-3 md:space-y-4">
            {invoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                        {/* Mobile Layout */}
                        <div className="flex flex-col md:hidden space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold mb-1">{invoice.invoice_number}</h3>
                                    <span className={cn(
                                        "inline-block px-2 py-1 rounded-full text-xs font-medium",
                                        statusColors[invoice.status]
                                    )}>
                                        {invoice.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-lg font-bold">₹{invoice.total.toFixed(2)}</p>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                                <p className="text-muted-foreground">
                                    Customer: <span className="font-medium text-foreground">{invoice.customer.name}</span>
                                </p>
                                <p className="text-muted-foreground">
                                    Date: {formatDate(invoice.invoice_date)}
                                </p>
                                {invoice.gst_percentage > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        (incl. {invoice.gst_percentage}% GST)
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                                <select
                                    value={invoice.status}
                                    onChange={(e) => handleStatusChange(invoice.id, e.target.value as any)}
                                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <Link href={`/invoices/${invoice.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>

                                <a href={`/invoices/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
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
                                    <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        statusColors[invoice.status]
                                    )}>
                                        {invoice.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Customer: <span className="font-medium text-foreground">{invoice.customer.name}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Date: {formatDate(invoice.invoice_date)}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-2xl font-bold">₹{invoice.total.toFixed(2)}</p>
                                    {invoice.gst_percentage > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            (incl. {invoice.gst_percentage}% GST)
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={invoice.status}
                                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as any)}
                                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>

                                    <Link href={`/invoices/${invoice.id}`}>
                                        <Button variant="outline" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <a href={`/invoices/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
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
