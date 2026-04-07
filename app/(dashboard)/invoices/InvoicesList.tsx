'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Eye, Download, Loader2, DollarSign, X, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { deleteInvoice, updateInvoiceStatus } from "./actions"
import type { InvoiceWithDetails } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface QuickPaymentModalProps {
    invoice: InvoiceWithDetails
    onClose: () => void
    onSuccess: () => void
}

function QuickPaymentModal({ invoice, onClose, onSuccess }: QuickPaymentModalProps) {
    const amountPaid = invoice.amount_paid ?? 0
    const amountRemaining = invoice.amount_remaining ?? (invoice.total - amountPaid)
    const [amount, setAmount] = useState(amountRemaining.toFixed(2))
    const [method, setMethod] = useState('cash')
    const [notes, setNotes] = useState('')
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const amt = parseFloat(amount)
        if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return }
        if (amt > amountRemaining + 0.01) { setError(`Max ₹${amountRemaining.toFixed(2)}`); return }
        setSubmitting(true)
        try {
            const res = await fetch('/api/invoices/partial-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: invoice.id, amount: amt, paymentMethod: method, paymentNotes: notes, paymentDate })
            })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record payment')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !submitting && onClose()}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-linear-to-r from-green-600 to-emerald-600 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-white">Record Payment</h3>
                        <p className="text-xs text-green-100">{invoice.invoice_number}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Invoice Total</span><span className="font-semibold text-gray-900 dark:text-white">₹{invoice.total.toFixed(2)}</span>
                        </div>
                        {amountPaid > 0 && <div className="flex justify-between text-green-600"><span>Already Paid</span><span className="font-semibold">₹{amountPaid.toFixed(2)}</span></div>}
                        <div className="flex justify-between text-orange-600 font-bold border-t border-gray-200 dark:border-gray-700 pt-1">
                            <span>Remaining</span><span>₹{amountRemaining.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount Received *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                                className="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</label>
                            <select value={method} onChange={e => setMethod(e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="cash">Cash</option>
                                <option value="gpay">GPay</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="paytm">Paytm</option>
                                <option value="upi">UPI</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Date</label>
                            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes (Optional)</label>
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Reference number, cheque no."
                            className="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 gap-2">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                            {submitting ? 'Recording…' : 'Record Payment'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-lg px-4">Cancel</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function InvoicesList({ invoices }: InvoicesListProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const [quickPaymentInvoice, setQuickPaymentInvoice] = useState<InvoiceWithDetails | null>(null)

    const handleDownloadPDF = async (invoiceId: string, event: React.MouseEvent) => {
        event.preventDefault()
        setDownloadingId(invoiceId)
        
        try {
            // Fetch the invoice HTML
            const response = await fetch(`/api/invoices/${invoiceId}/pdf?mode=html`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch invoice')
            }
            
            const html = await response.text()
            
            // Extract invoice number from HTML
            const invoiceNumberMatch = html.match(/Invoice[:\s#]*([A-Z0-9-]+)/i)
            const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : invoiceId
            
            // Create iframe to render HTML
            const iframe = document.createElement('iframe')
            iframe.style.position = 'absolute'
            iframe.style.left = '-9999px'
            iframe.style.width = '800px'
            iframe.style.height = '1200px'
            iframe.style.border = 'none'
            document.body.appendChild(iframe)
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) throw new Error('Failed to access iframe')
            
            iframeDoc.open()
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { background: white; padding: 40px; }
                    </style>
                </head>
                <body>${html}</body>
                </html>
            `)
            iframeDoc.close()
            
            const container = iframeDoc.body
            
            // Wait for images
            const images = container.getElementsByTagName('img')
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve()
                    return new Promise(resolve => {
                        img.onload = resolve
                        img.onerror = resolve
                    })
                })
            )
            
            // Convert to canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800,
            })
            
            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const maxWidth = pdfWidth - 20
            const maxHeight = pdfHeight - 20
            
            let imgWidth = maxWidth
            let imgHeight = (canvas.height * imgWidth) / canvas.width
            
            if (imgHeight <= maxHeight) {
                const topMargin = (pdfHeight - imgHeight) / 2
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, topMargin, imgWidth, imgHeight)
            } else {
                let heightLeft = imgHeight
                let position = 10
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
                
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight + 10
                    pdf.addPage()
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, position, imgWidth, imgHeight)
                    heightLeft -= pdfHeight
                }
            }
            
            // Download PDF
            pdf.save(`Invoice-${invoiceNumber}.pdf`)
            
            // Cleanup
            document.body.removeChild(iframe)
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Failed to download PDF. Please try again.')
        } finally {
            setDownloadingId(null)
        }
    }

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
        <>
        {quickPaymentInvoice && (
            <QuickPaymentModal
                invoice={quickPaymentInvoice}
                onClose={() => setQuickPaymentInvoice(null)}
                onSuccess={() => router.refresh()}
            />
        )}
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

                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        title="Record Payment"
                                        onClick={() => setQuickPaymentInvoice(invoice)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                    </Button>
                                )}

                                <Link href={`/invoices/${invoice.id}`}>
                                    <Button variant="outline" size="sm" title="View Invoice">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>

                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    title="Download PDF"
                                    onClick={(e) => handleDownloadPDF(invoice.id, e)}
                                    disabled={downloadingId === invoice.id}
                                >
                                    {downloadingId === invoice.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                </Button>

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
                                        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="draft">Not Paid</option>
                                        <option value="sent">Sent</option>
                                        <option value="partial">Partial Payment</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>

                                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            title="Record Payment"
                                            onClick={() => setQuickPaymentInvoice(invoice)}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                        >
                                            <DollarSign className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <Link href={`/invoices/${invoice.id}`}>
                                        <Button variant="outline" size="icon" title="View Invoice">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <Button 
                                        variant="outline" 
                                        size="icon"
                                        title="Download PDF"
                                        onClick={(e) => handleDownloadPDF(invoice.id, e)}
                                        disabled={downloadingId === invoice.id}
                                    >
                                        {downloadingId === invoice.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                    </Button>

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
        </>
    )
}
