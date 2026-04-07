import Link from "next/link"
import { ArrowLeft, Pencil, RefreshCw, CheckCircle2, Clock, XCircle, AlertCircle, Building2, User2, CalendarDays, Hash } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { getInvoice } from "../actions"
import { getInvoiceSettings } from "../settings/actions"
import { DownloadPDFButton } from "./DownloadPDFButton"
import { ShareInvoiceButton } from "./ShareInvoiceButton"
import { MarkAsPaidButton } from "./MarkAsPaidButton"
import { PartialPaymentButton } from "./PartialPaymentButton"
import { PaymentHistory } from "./PaymentHistory"
import { formatDate } from "@/lib/utils"

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [invoice, invoiceSettings] = await Promise.all([
        getInvoice(id),
        getInvoiceSettings()
    ])

    if (!invoice) {
        notFound()
    }

    const isPaid = invoice.status === 'paid'
    const hasPartialPayment = (invoice.is_partial_payment ?? false) || ((invoice.amount_paid ?? 0) > 0 && (invoice.amount_paid ?? 0) < invoice.total)
    const amountPaid = invoice.amount_paid ?? 0
    const amountRemaining = invoice.amount_remaining ?? (invoice.total - amountPaid)

    const statusConfig = {
        paid: { label: 'Paid', icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
        pending: { label: 'Pending', icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' },
        cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
        partial: { label: 'Partial', icon: AlertCircle, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
    }
    const currentStatus = hasPartialPayment ? 'partial' : (invoice.status as keyof typeof statusConfig) || 'pending'
    const status = statusConfig[currentStatus] || statusConfig.pending
    const StatusIcon = status.icon

    return (
        <div className="space-y-5 max-w-4xl mx-auto">
            {/* Top nav bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Link href="/invoices">
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="h-4 w-4" />Back
                    </Button>
                </Link>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/invoices/recurring/new?fromInvoice=${id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-gray-700">
                            <RefreshCw className="h-3.5 w-3.5" />Recurring
                        </Button>
                    </Link>
                    <ShareInvoiceButton
                        invoiceId={id}
                        invoiceNumber={invoice.invoice_number}
                        customerName={invoice.customer.name}
                        customerPhone={invoice.customer.phone}
                        total={invoice.total}
                    />
                    <Link href={`/invoices/${id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />Edit
                        </Button>
                    </Link>
                    <DownloadPDFButton invoiceId={id} />
                </div>
            </div>

            {/* Invoice Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                {/* Invoice Header Band */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Tax Invoice</p>
                            <h1 className="text-white text-3xl font-bold tracking-tight">INVOICE</h1>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} ${status.border} border`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {status.label}
                            </div>
                            <p className="text-white text-2xl font-bold mt-2">₹{invoice.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Invoice Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
                    <div className="px-4 py-3">
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Hash className="h-3 w-3" />Invoice #</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.invoice_number}</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><CalendarDays className="h-3 w-3" />Invoice Date</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(invoice.invoice_date)}</p>
                    </div>
                    {invoice.due_date && (
                        <div className="px-4 py-3">
                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><CalendarDays className="h-3 w-3" />Due Date</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</p>
                        </div>
                    )}
                    {invoice.supply_type && (
                        <div className="px-4 py-3">
                            <p className="text-xs text-gray-500 mb-1">Supply Type</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{invoice.supply_type.replace('-', ' ')}</p>
                        </div>
                    )}
                </div>

                {/* Bill To / Bill From */}
                <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-5 py-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <User2 className="h-3.5 w-3.5" />Bill To
                        </p>
                        <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 dark:text-white">{invoice.customer.name}</p>
                            {invoice.customer.email && <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer.email}</p>}
                            {invoice.customer.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer.phone}</p>}
                            {invoice.customer.address && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{invoice.customer.address}</p>}
                            {invoice.customer.gstin && (
                                <p className="text-xs text-gray-500 font-mono mt-1 bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 inline-block">
                                    GSTIN: {invoice.customer.gstin}
                                </p>
                            )}
                        </div>
                    </div>
                    {invoiceSettings?.company_name && (
                        <div className="px-5 py-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />From
                            </p>
                            <div className="space-y-0.5">
                                <p className="font-bold text-gray-900 dark:text-white">{invoiceSettings.company_name}</p>
                                {invoiceSettings.company_email && <p className="text-sm text-gray-600 dark:text-gray-400">{invoiceSettings.company_email}</p>}
                                {invoiceSettings.company_phone && <p className="text-sm text-gray-600 dark:text-gray-400">{invoiceSettings.company_phone}</p>}
                                {invoiceSettings.company_address && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{invoiceSettings.company_address}</p>}
                                {invoiceSettings.company_gstin && (
                                    <p className="text-xs text-gray-500 font-mono mt-1 bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 inline-block">
                                        GSTIN: {invoiceSettings.company_gstin}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Warning */}
                {invoice.invoice_items.length === 0 && (
                    <div className="mx-5 my-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 flex items-start gap-3">
                        <span className="text-orange-500 text-xl mt-0.5">⚠️</span>
                        <div>
                            <p className="font-semibold text-orange-800 dark:text-orange-300">No items on this invoice</p>
                            <p className="text-sm text-orange-700 dark:text-orange-400 mt-0.5">
                                <Link href={`/invoices/${id}/edit`} className="underline font-medium">Edit the invoice</Link> to re-add items.
                            </p>
                        </div>
                    </div>
                )}

                {/* Items Table */}
                {invoice.invoice_items.length > 0 && (
                <div className="px-5 py-4">
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <th className="text-left px-4 py-3">Item</th>
                                    {invoice.invoice_items.some(item => item.hsn_sac_code) && (
                                        <th className="text-left px-3 py-3">HSN/SAC</th>
                                    )}
                                    <th className="text-right px-3 py-3">Qty</th>
                                    <th className="text-right px-3 py-3">Rate</th>
                                    {invoice.invoice_items.some(item => item.gst_rate) && (
                                        <th className="text-right px-3 py-3">GST</th>
                                    )}
                                    <th className="text-right px-4 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {invoice.invoice_items.map((item, idx) => (
                                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">{item.description}</div>
                                            {item.item_details && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-pre-line">{item.item_details}</div>
                                            )}
                                        </td>
                                        {invoice.invoice_items.some(i => i.hsn_sac_code) && (
                                            <td className="px-3 py-3 text-gray-500 font-mono text-xs">{item.hsn_sac_code || '—'}</td>
                                        )}
                                        <td className="text-right px-3 py-3 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                        <td className="text-right px-3 py-3 text-gray-700 dark:text-gray-300">₹{item.unit_price.toFixed(2)}</td>
                                        {invoice.invoice_items.some(i => i.gst_rate) && (
                                            <td className="text-right px-3 py-3 text-gray-500 text-xs">
                                                {item.gst_rate ? `${item.gst_rate}%` : `${invoice.gst_percentage}%`}
                                            </td>
                                        )}
                                        <td className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* Totals */}
                <div className="px-5 pb-5">
                    <div className="flex justify-end">
                        <div className="w-72 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-4 py-3 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900 dark:text-white">₹{invoice.subtotal.toFixed(2)}</span>
                                </div>
                                {invoice.discount_amount && invoice.discount_amount > 0 ? (
                                    <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                                        <span>Discount ({invoice.discount_type === 'percentage' ? `${invoice.discount_value}%` : 'Flat'})</span>
                                        <span className="font-semibold">-₹{invoice.discount_amount.toFixed(2)}</span>
                                    </div>
                                ) : null}
                                {invoice.gst_percentage > 0 && (
                                    invoice.supply_type === 'intra-state' ? (
                                        <>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <span>CGST ({(invoice.gst_percentage / 2).toFixed(2)}%)</span>
                                                <span className="font-medium text-gray-900 dark:text-white">₹{(invoice.cgst_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <span>SGST ({(invoice.gst_percentage / 2).toFixed(2)}%)</span>
                                                <span className="font-medium text-gray-900 dark:text-white">₹{(invoice.sgst_amount || 0).toFixed(2)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>IGST ({invoice.gst_percentage}%)</span>
                                            <span className="font-medium text-gray-900 dark:text-white">₹{(invoice.igst_amount || 0).toFixed(2)}</span>
                                        </div>
                                    )
                                )}
                                {invoice.reverse_charge_applicable && (
                                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-1.5 font-medium">
                                        ⚠️ Reverse Charge Applicable
                                    </div>
                                )}
                            </div>
                            <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-white text-xl font-bold">₹{invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Notes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}

                {/* Bank Details */}
                {invoiceSettings?.payment_instructions && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 bg-blue-50/40 dark:bg-blue-900/10">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            🏦 Bank / Payment Details
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{invoiceSettings.payment_instructions}</p>
                    </div>
                )}

                {/* Signature, Stamp & Client Signature — always shown */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-5">
                    <div className="flex justify-between items-start gap-4">
                        {/* LEFT: Client signature placeholder */}
                        <div className="text-center min-w-[160px]">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-16 mb-2" />
                            <span className="text-xs text-gray-400">Customer Signature</span>
                        </div>
                        {/* CENTER: Company seal */}
                        {invoiceSettings?.show_stamp && invoiceSettings?.company_stamp_url?.startsWith('data:image') && (
                            <div className="text-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={invoiceSettings.company_stamp_url} alt="Company Stamp"
                                    className="max-h-24 max-w-24 w-auto h-auto object-contain opacity-85 mx-auto" />
                                <div className="text-xs text-gray-500 mt-2 pt-1.5 border-t border-gray-200 dark:border-gray-700">Company Seal</div>
                            </div>
                        )}
                        {/* RIGHT: Authorized signatory */}
                        {invoiceSettings?.show_signature && invoiceSettings?.digital_signature_url?.startsWith('data:image') && (
                            <div className="text-center min-w-[160px]">
                                <div className="h-16 flex items-end justify-center mb-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={invoiceSettings.digital_signature_url} alt="Signature"
                                        className="max-h-14 max-w-[180px] w-auto h-auto object-contain" />
                                </div>
                                <div className="border-t-2 border-gray-700 dark:border-gray-400 pt-1 text-center">
                                    {invoiceSettings.company_name && (
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">{invoiceSettings.company_name}</span>
                                    )}
                                    <span className="text-xs text-gray-500">Authorized Signatory</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Status */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-5">
                    {isPaid ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-green-800 dark:text-green-300">Payment Received ✓</p>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        {invoice.payment_method && `Via ${invoice.payment_method.replace('_', ' ')}`}
                                        {invoice.paid_at && ` · ${formatDate(invoice.paid_at)}`}
                                    </p>
                                    {invoice.payment_notes && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{invoice.payment_notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : hasPartialPayment ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-blue-800 dark:text-blue-300">Partial Payment Received</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">{((amountPaid / invoice.total) * 100).toFixed(1)}% paid</p>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Total</span><span className="font-semibold text-gray-900 dark:text-white">₹{invoice.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Paid</span><span className="font-semibold">₹{amountPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-blue-700 dark:text-blue-300 font-bold border-t border-blue-200 dark:border-blue-700 pt-1.5">
                                    <span>Remaining</span><span>₹{amountRemaining.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((amountPaid / invoice.total) * 100, 100)}%` }} />
                            </div>
                            <div className="flex gap-2">
                                <PartialPaymentButton invoiceId={invoice.id} invoiceNumber={invoice.invoice_number}
                                    totalAmount={invoice.total} amountPaid={amountPaid} amountRemaining={amountRemaining} />
                                <MarkAsPaidButton invoiceId={invoice.id} invoiceNumber={invoice.invoice_number} />
                            </div>
                        </div>
                    ) : invoice.status === 'cancelled' ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-center gap-3">
                            <XCircle className="h-6 w-6 text-red-500" />
                            <p className="font-semibold text-red-800 dark:text-red-300">This invoice has been cancelled</p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    <div>
                                        <p className="font-bold text-yellow-800 dark:text-yellow-300">Payment Pending</p>
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">₹{invoice.total.toFixed(2)} due</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <PartialPaymentButton invoiceId={invoice.id} invoiceNumber={invoice.invoice_number}
                                        totalAmount={invoice.total} amountPaid={amountPaid} amountRemaining={amountRemaining} />
                                    <MarkAsPaidButton invoiceId={invoice.id} invoiceNumber={invoice.invoice_number} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History */}
            {(hasPartialPayment || isPaid) && (
                <PaymentHistory invoiceId={invoice.id} />
            )}
        </div>
    )
}
