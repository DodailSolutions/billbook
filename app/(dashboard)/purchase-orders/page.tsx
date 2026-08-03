'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PurchaseOrder } from '@/lib/po-types'
import { getPurchaseOrders, updatePOStatus } from '@/lib/po-actions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ShoppingBag, Plus, Search, Truck, CheckCircle2, Clock, XCircle, ChevronRight, FileText } from 'lucide-react'

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const fetchOrders = async () => {
        setLoading(true)
        const data = await getPurchaseOrders()
        setOrders(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const filteredOrders = orders.filter(po => {
        const matchesSearch = po.po_number.toLowerCase().includes(search.toLowerCase()) ||
                              po.vendor_name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || po.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalValue = orders.reduce((sum, po) => sum + po.total_amount, 0)
    const pendingCount = orders.filter(po => po.status === 'issued' || po.status === 'partially_received').length
    const receivedCount = orders.filter(po => po.status === 'received').length

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 border border-gray-200">Draft</span>
            case 'issued':
                return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Clock className="h-3 w-3" /> Issued</span>
            case 'partially_received':
                return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><Truck className="h-3 w-3" /> Partial</span>
            case 'received':
                return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Received</span>
            case 'cancelled':
                return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</span>
            default:
                return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <ShoppingBag className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            Purchase Orders
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Issue vendor purchase orders, manage deliveries, and automatically track incoming stock.
                    </p>
                </div>

                <Link href="/purchase-orders/new" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
                        <Plus className="h-4 w-4" />
                        Create Purchase Order
                    </Button>
                </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total PO Value</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                ₹{totalValue.toLocaleString('en-IN')}
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-0.5">{orders.length} orders total</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <FileText className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Delivery</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
                                {pendingCount}
                            </h3>
                            <p className="text-[11px] text-amber-700 mt-0.5">Issued or partial</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Truck className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Deliveries</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                                {receivedCount}
                            </h3>
                            <p className="text-[11px] text-emerald-700 mt-0.5">Fully stock-received</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search PO number or vendor name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {['all', 'draft', 'issued', 'partially_received', 'received', 'cancelled'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize whitespace-nowrap transition-colors min-h-[44px] ${
                                statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900">No Purchase Orders Found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Create purchase orders to manage vendor procurement and auto-update inventory levels upon delivery.
                    </p>
                    <Link href="/purchase-orders/new" className="mt-4 inline-block">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
                            <Plus className="h-4 w-4" /> Create First PO
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map(po => (
                        <Link
                            key={po.id}
                            href={`/purchase-orders/${po.id}`}
                            className="block bg-white p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-2xs hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {po.po_number}
                                        </span>
                                        {getStatusBadge(po.status)}
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-base mt-2">
                                        {po.vendor_name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Issued: {po.po_date} {po.expected_delivery_date ? `| Expected: ${po.expected_delivery_date}` : ''}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Total Amount</p>
                                        <p className="text-lg font-extrabold text-gray-900">
                                            ₹{po.total_amount.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {po.items?.length || 0} line items
                                        </p>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
