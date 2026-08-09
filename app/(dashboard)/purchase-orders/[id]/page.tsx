'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PurchaseOrder } from '@/lib/po-types'
import { getPurchaseOrder, updatePOStatus, receivePOItems, approvePurchaseOrder, rejectPurchaseOrder, duplicatePurchaseOrder, amendPurchaseOrder } from '@/lib/po-actions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Truck, CheckCircle2, XCircle, Printer, Calendar, Building2, PackageCheck, AlertCircle, Edit, Copy, Check, X, FileEdit } from 'lucide-react'
import { DownloadPOPDFButton } from './DownloadPOPDFButton'

export default function ViewPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [po, setPo] = useState<PurchaseOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
    const [receiveState, setReceiveState] = useState<Record<string, { qty: number; batch: string; expiry: string }>>({})
    const [actionLoading, setActionLoading] = useState(false)
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [approvalNotes, setApprovalNotes] = useState('')

    const fetchPO = async () => {
        setLoading(true)
        const data = await getPurchaseOrder(id)
        setPo(data)
        if (data && data.items) {
            const initRec: Record<string, { qty: number; batch: string; expiry: string }> = {}
            data.items.forEach(item => {
                const remaining = Math.max(0, item.quantity - item.received_quantity)
                initRec[item.id!] = { qty: remaining, batch: '', expiry: '' }
            })
            setReceiveState(initRec)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPO()
    }, [id])

    const handleStatusChange = async (newStatus: any) => {
        await updatePOStatus(id, newStatus)
        fetchPO()
    }

    const handleReceiveSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!po || !po.items) return

        const payload = Object.entries(receiveState).map(([itemId, val]) => ({
            itemId,
            qtyReceivedNow: Number(val.qty),
            batchNumber: val.batch,
            expiryDate: val.expiry
        }))

        await receivePOItems(id, payload)
        setIsReceiveModalOpen(false)
        fetchPO()
    }

    const handleApprove = async () => {
        setActionLoading(true)
        await approvePurchaseOrder(id, approvalNotes)
        setIsApproveModalOpen(false)
        setApprovalNotes('')
        fetchPO()
        setActionLoading(false)
    }

    const handleReject = async () => {
        if (!approvalNotes.trim()) return
        setActionLoading(true)
        await rejectPurchaseOrder(id, approvalNotes)
        setIsRejectModalOpen(false)
        setApprovalNotes('')
        fetchPO()
        setActionLoading(false)
    }

    const handleDuplicate = async () => {
        setActionLoading(true)
        const res = await duplicatePurchaseOrder(id)
        if (res.success && res.id) {
            router.push(`/purchase-orders/${res.id}`)
        }
        setActionLoading(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    if (!po) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold">Purchase Order Not Found</h3>
                <Link href="/purchase-orders" className="mt-4 inline-block">
                    <Button variant="outline">Back to PO List</Button>
                </Link>
            </div>
        )
    }

    const isFullyReceived = po.status === 'received'
    const isCancelled = po.status === 'cancelled'

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/purchase-orders">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                {po.po_number}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase bg-slate-100 text-slate-700">
                                {po.status.replace('_', ' ')}
                            </span>
                            {po.approval_status === 'pending' && (
                                <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase bg-amber-100 text-amber-700">
                                    Pending Approval
                                </span>
                            )}
                            {po.approval_status === 'approved' && (
                                <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase bg-emerald-100 text-emerald-700">
                                    Approved
                                </span>
                            )}
                            {po.approval_status === 'rejected' && (
                                <span className="text-xs px-3 py-1 rounded-full font-semibold uppercase bg-rose-100 text-rose-700">
                                    Rejected
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Issued: {po.po_date} {po.expected_delivery_date ? `| Expected: ${po.expected_delivery_date}` : ''}
                            {po.amended_from && ` | Amended from: PO`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {po.status === 'draft' && (
                        <>
                            <Link href={`/purchase-orders/${id}/edit`}>
                                <Button variant="outline" className="gap-2 min-h-[44px]">
                                    <Edit className="h-4 w-4" /> Edit PO
                                </Button>
                            </Link>
                            {po.approval_status !== 'approved' && (
                                <Button 
                                    onClick={() => setIsApproveModalOpen(true)} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 min-h-[44px]"
                                >
                                    <Check className="h-4 w-4" /> Approve PO
                                </Button>
                            )}
                            {po.approval_status !== 'rejected' && (
                                <Button 
                                    onClick={() => setIsRejectModalOpen(true)} 
                                    variant="outline"
                                    className="text-rose-600 hover:bg-rose-50 border-rose-200 min-h-[44px]"
                                >
                                    <X className="h-4 w-4" /> Reject PO
                                </Button>
                            )}
                        </>
                    )}

                    {(po.status === 'issued' || po.status === 'partially_received') && (
                        <Button 
                            onClick={() => setIsReceiveModalOpen(true)} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-h-[44px]"
                        >
                            <PackageCheck className="h-4 w-4" />
                            Receive Stock
                        </Button>
                    )}

                    {!isFullyReceived && !isCancelled && po.status !== 'draft' && (
                        <Button 
                            onClick={() => handleStatusChange('cancelled')} 
                            variant="outline" 
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 min-h-[44px]"
                        >
                            Cancel PO
                        </Button>
                    )}

                    <Button 
                        onClick={handleDuplicate}
                        disabled={actionLoading}
                        variant="outline" 
                        className="gap-2 min-h-[44px]"
                    >
                        <Copy className="h-4 w-4" /> Duplicate
                    </Button>

                    <DownloadPOPDFButton poId={id} poNumber={po.po_number} />

                    <Link href={`/api/purchase-orders/${id}/pdf`} target="_blank">
                        <Button variant="outline" className="gap-2 min-h-[44px]">
                            <Printer className="h-4 w-4" /> Print PO
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Vendor & General Details Card */}
            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Vendor Information</p>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            {po.vendor_name}
                        </h3>
                        {po.vendor_email && (
                            <p className="text-xs text-gray-600 mt-1">{po.vendor_email}</p>
                        )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 sm:text-right">
                        <p><span className="text-gray-400">PO Date:</span> <strong className="text-gray-900">{po.po_date}</strong></p>
                        <p><span className="text-gray-400">Delivery Date:</span> <strong className="text-gray-900">{po.expected_delivery_date || 'N/A'}</strong></p>
                    </div>
                </CardContent>
            </Card>

            {/* Items Table / Cards */}
            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Ordered Line Items ({po.items?.length || 0})
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-3">Item</th>
                                    <th className="p-3 text-center">Ordered</th>
                                    <th className="p-3 text-center">Received</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-right">GST</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {po.items?.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="p-3">
                                            <p className="font-bold text-gray-900">{item.item_name}</p>
                                            {item.description && <p className="text-[11px] text-gray-500">{item.description}</p>}
                                        </td>
                                        <td className="p-3 text-center font-bold text-gray-700">{item.quantity}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                                                item.received_quantity >= item.quantity 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : item.received_quantity > 0 
                                                        ? 'bg-amber-100 text-amber-700' 
                                                        : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {item.received_quantity} / {item.quantity}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-mono">₹{item.unit_price.toFixed(2)}</td>
                                        <td className="p-3 text-right text-gray-500">{item.gst_rate}%</td>
                                        <td className="p-3 text-right font-bold text-gray-900 font-mono">₹{item.total_amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Totals */}
                    <div className="border-t border-gray-200 pt-4 flex flex-col items-end space-y-1 text-xs">
                        <div className="flex justify-between w-48 text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold">₹{po.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-48 text-gray-600">
                            <span>GST Tax:</span>
                            <span className="font-semibold">₹{po.tax_total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-48 text-base font-extrabold text-indigo-600 border-t border-gray-200 pt-1">
                            <span>PO Total:</span>
                            <span>₹{po.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes & Terms */}
            {(po.notes || po.terms) && (
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {po.notes && (
                            <div>
                                <p className="font-bold text-gray-700 uppercase mb-1">Notes / Instructions</p>
                                <p className="text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">{po.notes}</p>
                            </div>
                        )}
                        {po.terms && (
                            <div>
                                <p className="font-bold text-gray-700 uppercase mb-1">Terms & Conditions</p>
                                <p className="text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">{po.terms}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Approval Details */}
            {(po.approved_by || po.approval_notes) && (
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Approval Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {po.approved_by && (
                                <div>
                                    <p className="font-bold text-gray-700 uppercase mb-1">Approved By</p>
                                    <p className="text-gray-900">{po.approved_by}</p>
                                    {po.approved_at && <p className="text-gray-500 mt-1">{new Date(po.approved_at).toLocaleString()}</p>}
                                </div>
                            )}
                            {po.approval_notes && (
                                <div>
                                    <p className="font-bold text-gray-700 uppercase mb-1">Approval Notes</p>
                                    <p className="text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">{po.approval_notes}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Approve Modal */}
            {isApproveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
                            <h3 className="font-bold text-base">Approve Purchase Order</h3>
                            <button onClick={() => setIsApproveModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    placeholder="Add any approval notes..."
                                    className="w-full text-sm p-3 border border-gray-200 rounded-xl min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
                                <Button 
                                    onClick={handleApprove} 
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {actionLoading ? 'Approving...' : 'Approve PO'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                        <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
                            <h3 className="font-bold text-base">Reject Purchase Order</h3>
                            <button onClick={() => setIsRejectModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Rejection <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this PO..."
                                    className="w-full text-sm p-3 border border-gray-200 rounded-xl min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                                <Button 
                                    onClick={handleReject} 
                                    disabled={actionLoading || !approvalNotes.trim()}
                                    className="bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    {actionLoading ? 'Rejecting...' : 'Reject PO'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receive Stock Modal */}
            {isReceiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
                        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PackageCheck className="h-5 w-5" />
                                <h3 className="font-bold text-base">Receive Delivery Items</h3>
                            </div>
                            <button onClick={() => setIsReceiveModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <p className="text-xs text-gray-500">
                                Specify quantities delivered in this shipment. Stock levels in Inventory will automatically increment.
                            </p>

                            <div className="space-y-4">
                                {po.items?.map(item => {
                                    const stateVal = receiveState[item.id!] || { qty: 0, batch: '', expiry: '' }
                                    return (
                                        <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-gray-900">{item.item_name}</span>
                                                <span className="text-gray-500">Ordered: {item.quantity} | Previously Rec: {item.received_quantity}</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Qty Receiving Now</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity - item.received_quantity}
                                                        value={stateVal.qty}
                                                        onChange={(e) => setReceiveState({
                                                            ...receiveState,
                                                            [item.id!]: { ...stateVal, qty: parseFloat(e.target.value) || 0 }
                                                        })}
                                                        className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Batch/Lot # (Optional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="B2026-X"
                                                        value={stateVal.batch}
                                                        onChange={(e) => setReceiveState({
                                                            ...receiveState,
                                                            [item.id!]: { ...stateVal, batch: e.target.value }
                                                        })}
                                                        className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Expiry Date (Optional)</label>
                                                    <input
                                                        type="date"
                                                        value={stateVal.expiry}
                                                        onChange={(e) => setReceiveState({
                                                            ...receiveState,
                                                            [item.id!]: { ...stateVal, expiry: e.target.value }
                                                        })}
                                                        className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-3 border-t flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsReceiveModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Confirm Receipt & Update Stock
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
