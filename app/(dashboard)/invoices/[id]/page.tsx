import Link from "next/link"
import { ArrowLeft, Pencil, RefreshCw } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getInvoice } from "../actions"
import { DownloadPDFButton } from "./DownloadPDFButton"
import { MarkAsPaidButton } from "./MarkAsPaidButton"
import { formatDate } from "@/lib/utils"

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const invoice = await getInvoice(id)

    if (!invoice) {
        notFound()
    }

    const isPaid = invoice.status === 'paid'

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Link href="/invoices">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Invoices</span>
                    </Button>
                </Link>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/invoices/recurring/new?fromInvoice=${id}`}>
                        <Button variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            <span>Make Recurring</span>
                        </Button>
                    </Link>
                    <Link href={`/invoices/${id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                        </Button>
                    </Link>
                    <DownloadPDFButton invoiceId={id} />
                </div>
            </div>

            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-3xl mb-2">INVOICE</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Invoice Number: <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{formatDate(invoice.invoice_date)}</p>
                            {invoice.due_date && (
                                <>
                                    <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                                    <p className="font-semibold">{formatDate(invoice.due_date)}</p>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Bill To:</h3>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{invoice.customer.name}</p>
                                {invoice.customer.email && <p>{invoice.customer.email}</p>}
                                {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
                                {invoice.customer.address && <p className="text-muted-foreground">{invoice.customer.address}</p>}
                                {invoice.customer.gstin && (
                                    <p className="text-muted-foreground">GSTIN: {invoice.customer.gstin}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Description</th>
                                    <th className="text-right p-3 font-semibold">Qty</th>
                                    <th className="text-right p-3 font-semibold">Price</th>
                                    <th className="text-right p-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.invoice_items.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3">{item.description}</td>
                                        <td className="text-right p-3">{item.quantity}</td>
                                        <td className="text-right p-3">₹{item.unit_price.toFixed(2)}</td>
                                        <td className="text-right p-3">₹{item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
                            </div>
                            {invoice.gst_percentage > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>GST ({invoice.gst_percentage}%):</span>
                                    <span className="font-medium">₹{invoice.gst_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>₹{invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Notes:</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Payment Status */}
                    <div className="border-t pt-6">
                        {isPaid ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-green-800 dark:text-green-300">Payment Received</p>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            {invoice.payment_method && `Via ${invoice.payment_method.replace('_', ' ')}`}
                                            {invoice.paid_at && ` on ${formatDate(invoice.paid_at)}`}
                                        </p>
                                        {invoice.payment_notes && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                {invoice.payment_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : invoice.status === 'cancelled' ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="font-semibold text-red-800 dark:text-red-300">This invoice has been cancelled</p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-yellow-800 dark:text-yellow-300">Payment Pending</p>
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">Customer can pay via cash or QR code</p>
                                    </div>
                                    <MarkAsPaidButton invoiceId={invoice.id} invoiceNumber={invoice.invoice_number} />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
