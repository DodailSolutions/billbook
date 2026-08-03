'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPurchaseOrder } from '@/lib/po-actions'
import { getInventoryItems } from '@/app/(dashboard)/inventory/actions'
import { getVendorsList } from '@/app/(dashboard)/expenses/actions'
import { InventoryItem } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Plus, Trash2, ShoppingBag, Sparkles, Building2 } from 'lucide-react'

interface ItemRow {
    inventory_item_id?: string
    item_name: string
    description: string
    quantity: number
    unit_price: number
    gst_rate: number
}

export default function NewPurchaseOrderPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [vendors, setVendors] = useState<any[]>([])

    const [vendorName, setVendorName] = useState('')
    const [vendorId, setVendorId] = useState('')
    const [vendorEmail, setVendorEmail] = useState('')
    const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10))
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
    const [notes, setNotes] = useState('')
    const [terms, setTerms] = useState('Payment due 30 days after delivery receipt.')

    const [items, setItems] = useState<ItemRow[]>([
        { item_name: '', description: '', quantity: 1, unit_price: 0, gst_rate: 18 }
    ])

    useEffect(() => {
        Promise.all([
            getInventoryItems(),
            getVendorsList()
        ]).then(([invData, vendorData]) => {
            setInventory(invData)
            setVendors(vendorData)
        })
    }, [])

    const handleVendorSelect = (id: string) => {
        setVendorId(id)
        const vendor = vendors.find(v => v.id === id)
        if (vendor) {
            setVendorName(vendor.vendor_name)
        }
    }

    const handleItemSelect = (index: number, invItemId: string) => {
        const selectedInv = inventory.find(i => i.id === invItemId)
        if (!selectedInv) return

        const updated = [...items]
        updated[index] = {
            inventory_item_id: selectedInv.id,
            item_name: selectedInv.name,
            description: selectedInv.description || '',
            quantity: 1,
            unit_price: selectedInv.purchase_price || 0,
            gst_rate: 18
        }
        setItems(updated)
    }

    const handleAddItem = () => {
        setItems([
            ...items,
            { item_name: '', description: '', quantity: 1, unit_price: 0, gst_rate: 18 }
        ])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return
        setItems(items.filter((_, i) => i !== index))
    }

    const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
        const updated = [...items]
        updated[index] = { ...updated[index], [field]: value }
        setItems(updated)
    }

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxTotal = items.reduce((sum, item) => sum + ((item.quantity * item.unit_price * item.gst_rate) / 100), 0)
    const grandTotal = subtotal + taxTotal

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!vendorName.trim()) {
            setError('Please enter or select a vendor name.')
            return
        }
        if (items.some(i => !i.item_name.trim() || i.quantity <= 0)) {
            setError('All line items must have a name and quantity greater than 0.')
            return
        }

        setLoading(true)
        setError(null)

        const result = await createPurchaseOrder({
            vendor_id: vendorId || undefined,
            vendor_name: vendorName,
            vendor_email: vendorEmail || undefined,
            po_date: poDate,
            expected_delivery_date: expectedDeliveryDate || undefined,
            notes,
            terms,
            items: items.map(i => ({
                inventory_item_id: i.inventory_item_id,
                item_name: i.item_name,
                description: i.description,
                quantity: Number(i.quantity),
                unit_price: Number(i.unit_price),
                gst_rate: Number(i.gst_rate)
            }))
        })

        if (result.success && result.id) {
            router.push(`/purchase-orders/${result.id}`)
        } else {
            setError(result.error || 'Failed to create Purchase Order.')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/purchase-orders">
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Create Purchase Order
                    </h2>
                    <p className="text-xs text-gray-500">
                        Issue a new purchase order to a vendor
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vendor & Dates Card */}
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-indigo-600" /> Vendor Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Select Existing Vendor (Optional)
                                </label>
                                <select
                                    value={vendorId}
                                    onChange={(e) => handleVendorSelect(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                                >
                                    <option value="">-- Choose Vendor --</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.vendor_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Vendor Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Company / Vendor Name"
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">PO Date</label>
                                <input
                                    type="date"
                                    required
                                    value={poDate}
                                    onChange={(e) => setPoDate(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Delivery Date</label>
                                <input
                                    type="date"
                                    value={expectedDeliveryDate}
                                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Items Card */}
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-indigo-600" /> Line Items
                            </h3>
                            <Button type="button" onClick={handleAddItem} size="sm" variant="outline" className="gap-1 text-xs min-h-[40px]">
                                <Plus className="h-3.5 w-3.5" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => {
                                const lineTotal = (item.quantity * item.unit_price) * (1 + item.gst_rate / 100)
                                return (
                                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                            {/* Inventory SKU Select */}
                                            <div className="sm:col-span-4">
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Stock SKU Link</label>
                                                <select
                                                    value={item.inventory_item_id || ''}
                                                    onChange={(e) => handleItemSelect(index, e.target.value)}
                                                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden min-h-[40px]"
                                                >
                                                    <option value="">-- Custom Item --</option>
                                                    {inventory.map(inv => (
                                                        <option key={inv.id} value={inv.id}>{inv.name} ({inv.sku || 'No SKU'})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Item Name */}
                                            <div className="sm:col-span-5">
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Item Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Item name"
                                                    value={item.item_name}
                                                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-hidden min-h-[40px]"
                                                />
                                            </div>

                                            <div className="sm:col-span-3 flex items-center justify-end pt-4 sm:pt-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                                                    title="Remove Line"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Qty</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="any"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-full text-xs p-2 border border-gray-200 rounded-lg min-h-[40px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Unit Price (₹)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    className="w-full text-xs p-2 border border-gray-200 rounded-lg min-h-[40px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">GST Rate (%)</label>
                                                <select
                                                    value={item.gst_rate}
                                                    onChange={(e) => handleItemChange(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                                                    className="w-full text-xs p-2 border border-gray-200 rounded-lg min-h-[40px]"
                                                >
                                                    <option value="0">0%</option>
                                                    <option value="5">5%</option>
                                                    <option value="12">12%</option>
                                                    <option value="18">18%</option>
                                                    <option value="28">28%</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Total (Incl. Tax)</label>
                                                <p className="text-xs font-bold text-gray-900 p-2 bg-white rounded-lg border border-gray-200">
                                                    ₹{lineTotal.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Totals Summary */}
                        <div className="border-t border-gray-200 pt-4 flex flex-col items-end space-y-1 text-xs">
                            <div className="flex justify-between w-48 text-gray-600">
                                <span>Subtotal:</span>
                                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-gray-600">
                                <span>GST Tax:</span>
                                <span className="font-semibold">₹{taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-sm font-bold text-gray-900 border-t border-gray-200 pt-1">
                                <span>Grand Total:</span>
                                <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes & Terms */}
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                            <textarea
                                rows={3}
                                placeholder="Instructions for vendor..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Terms & Conditions</label>
                            <textarea
                                rows={3}
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link href="/purchase-orders">
                        <Button type="button" variant="outline" className="min-h-[44px]">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
                        {loading ? 'Creating PO...' : 'Create & Save Draft'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
