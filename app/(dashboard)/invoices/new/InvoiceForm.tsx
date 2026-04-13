'use client'

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Info, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { createInvoice, updateInvoice } from "../actions"
import { saveItemFromInvoice, deleteSavedItem as deleteSavedItemAction } from "../../items/actions"
import type { Customer, InvoiceWithDetails, SavedItem } from "@/lib/types"
import { InvoicePreviewPanel } from "./InvoicePreviewPanel"

interface InvoiceFormProps {
    customers: Customer[]
    invoice?: InvoiceWithDetails
    mode?: 'create' | 'edit'
    savedItems?: SavedItem[]
}

interface InvoiceItem {
    description: string
    details?: string
    quantity: number
    unit_price: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
}

export function InvoiceForm({ customers: initialCustomers, invoice, mode = 'create', savedItems = [] }: InvoiceFormProps) {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
    const [selectedCustomerId, setSelectedCustomerId] = useState(invoice?.customer_id || '')
    const [invoiceDate, setInvoiceDate] = useState(invoice?.invoice_date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(invoice?.due_date || '')
    const [notes, setNotes] = useState(invoice?.notes || '')
    const [simplifiedView, setSimplifiedView] = useState(true)
    const [items, setItems] = useState<InvoiceItem[]>(
        invoice?.invoice_items.map(item => ({
            description: item.description,
            details: item.item_details || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            hsn_sac_code: item.hsn_sac_code,
            hsn_sac_type: item.hsn_sac_type,
            gst_rate: item.gst_rate
        })) || [{ description: '', details: '', quantity: 1, unit_price: 0 }]
    )
    const [gstPercentage, setGstPercentage] = useState(invoice?.gst_percentage || 18)
    const [supplyType, setSupplyType] = useState<'intra-state' | 'inter-state'>(invoice?.supply_type || 'intra-state')
    const [reverseCharge, setReverseCharge] = useState(invoice?.reverse_charge_applicable || false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
    const [showSaveItemModal, setShowSaveItemModal] = useState(false)
    const [savedItemToSave, setSavedItemToSave] = useState<InvoiceItem | null>(null)
    const [itemName, setItemName] = useState('')
    const [isSavingItem, setIsSavingItem] = useState(false)
    
    // Discount
    const [discountType, setDiscountType] = useState<'percentage' | 'flat'>(invoice?.discount_type || 'percentage')
    const [discountValue, setDiscountValue] = useState(invoice?.discount_value || 0)

    // Recurring invoice settings
    const [isRecurring, setIsRecurring] = useState(false)
    const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'yearly'>('monthly')
    const [recurringStartDate, setRecurringStartDate] = useState(new Date().toISOString().split('T')[0])
    const [recurringEndDate, setRecurringEndDate] = useState('')
    
    // Calculate next billing date when recurring settings change
    const nextBillingDate = useMemo(() => {
        if (isRecurring && recurringStartDate) {
            const startDate = new Date(recurringStartDate)
            const nextDate = new Date(startDate)
            
            if (recurringFrequency === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1)
            } else {
                nextDate.setFullYear(nextDate.getFullYear() + 1)
            }
            
            return nextDate.toISOString().split('T')[0]
        }
        return ''
    }, [isRecurring, recurringStartDate, recurringFrequency])

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const addSavedItem = (savedItem: SavedItem) => {
        setItems([...items, {
            description: savedItem.description,
            details: savedItem.item_details || '',
            quantity: savedItem.default_quantity,
            unit_price: savedItem.unit_price,
            hsn_sac_code: savedItem.hsn_sac_code,
            hsn_sac_type: savedItem.hsn_sac_type,
            gst_rate: savedItem.gst_rate,
        }])
    }

    const saveCurrentItem = (itemIndex: number) => {
        setSavedItemToSave(items[itemIndex])
        setShowSaveItemModal(true)
    }

    const handleSaveItem = async () => {
        if (!savedItemToSave || !itemName.trim()) return
        setIsSavingItem(true)
        try {
            await saveItemFromInvoice({
                name: itemName.trim(),
                description: savedItemToSave.description,
                item_details: savedItemToSave.details || undefined,
                unit_price: savedItemToSave.unit_price,
                default_quantity: savedItemToSave.quantity,
                hsn_sac_code: savedItemToSave.hsn_sac_code,
                hsn_sac_type: savedItemToSave.hsn_sac_type,
                gst_rate: savedItemToSave.gst_rate,
            })
            setItemName('')
            setShowSaveItemModal(false)
            setSavedItemToSave(null)
            startTransition(() => router.refresh())
        } catch (err) {
            console.error('Failed to save item:', err)
            alert('Failed to save item. Please try again.')
        } finally {
            setIsSavingItem(false)
        }
    }

    const deleteSavedItem = (id: string) => {
        startTransition(async () => {
            try {
                await deleteSavedItemAction(id)
                router.refresh()
            } catch (err) {
                console.error('Failed to delete saved item:', err)
            }
        })
    }

    const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        try {
            const response = await fetch('/api/customers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    gstin: formData.get('gstin'),
                })
            })

            const data = await response.json()
            
            if (response.ok && data.customer) {
                setCustomers([...customers, data.customer])
                setShowAddCustomerModal(false)
                // Reset form safely
                const form = e.currentTarget
                if (form) {
                    form.reset()
                }
            } else {
                alert(data.error || 'Failed to create customer')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to create customer')
        }
    }

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }

    const calculateDiscount = () => {
        const sub = calculateSubtotal()
        if (!discountValue || discountValue <= 0) return 0
        return discountType === 'percentage'
            ? (sub * Math.min(discountValue, 100)) / 100
            : Math.min(discountValue, sub)
    }

    const calculateDiscountedSubtotal = () => {
        return calculateSubtotal() - calculateDiscount()
    }

    const calculateGST = () => {
        return (calculateDiscountedSubtotal() * gstPercentage) / 100
    }

    const calculateTotal = () => {
        return calculateDiscountedSubtotal() + calculateGST()
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)

        try {
            const invoiceData = {
                customer_id: formData.get('customer_id') as string,
                invoice_date: formData.get('invoice_date') as string,
                due_date: formData.get('due_date') as string || undefined,
                gst_percentage: gstPercentage,
                supply_type: supplyType,
                reverse_charge_applicable: reverseCharge,
                notes: formData.get('notes') as string || undefined,
                discount_type: discountValue > 0 ? discountType : undefined,
                discount_value: discountValue > 0 ? discountValue : undefined,
                items: items.filter(item => item.description && item.quantity > 0 && item.unit_price > 0).map(item => ({ ...item, details: item.details || undefined })),
                // Recurring invoice data
                is_recurring: isRecurring,
                recurring_frequency: isRecurring ? recurringFrequency : undefined,
                recurring_start_date: isRecurring ? recurringStartDate : undefined,
                recurring_end_date: isRecurring && recurringEndDate ? recurringEndDate : undefined
            }

            if (mode === 'edit' && invoice) {
                const result = await updateInvoice(invoice.id, invoiceData)
                if (result.success) {
                    router.push('/invoices')
                    router.refresh()
                } else {
                    alert(result.error || 'Failed to update invoice')
                    setIsSubmitting(false)
                }
            } else {
                const result = await createInvoice(invoiceData)
                if (result.success) {
                    router.push('/invoices')
                    router.refresh()
                } else {
                    alert(result.error || 'Failed to create invoice')
                    setIsSubmitting(false)
                }
            }
        } catch (error) {
            console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} invoice:`, error)
            alert(`Unexpected error occurred`)
            setIsSubmitting(false)
        }
    }

    return (
        <>{/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {mode === 'edit' ? 'Edit Invoice' : 'New Invoice'}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {mode === 'edit' ? 'Update invoice details below' : 'Fill in the details to create a new invoice'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Simplified</span>
                    <button
                        type="button"
                        onClick={() => setSimplifiedView(!simplifiedView)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            simplifiedView ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow ${
                            simplifiedView ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">

                {/* Section: Customer & Dates */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                            Customer &amp; Invoice Details
                        </h3>
                    </div>
                    <div className="p-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="customer_id" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Customer <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="customer_id"
                                name="customer_id"
                                required
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="flex h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select a customer…</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                            <Button type="button" onClick={() => setShowAddCustomerModal(true)} variant="outline" size="sm" className="gap-1.5 whitespace-nowrap rounded-lg border-dashed border-blue-300 text-blue-600 hover:bg-blue-50">
                                <Plus className="h-3.5 w-3.5" />Add
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="invoice_date" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Invoice Date <span className="text-red-500">*</span>
                        </label>
                        <Input id="invoice_date" name="invoice_date" type="date" value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)} required
                            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="due_date" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Due Date</label>
                        <Input id="due_date" name="due_date" type="date" value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="gst_percentage" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">GST %</label>
                        <div className="relative flex items-center">
                            <Input id="gst_percentage" type="number" min="0" max="100" step="0.01"
                                value={gstPercentage} onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                                className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pr-8" />
                            <span className="absolute right-3 text-gray-400 text-sm font-bold">%</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="supply_type" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Supply Type</label>
                        <select id="supply_type" value={supplyType}
                            onChange={(e) => setSupplyType(e.target.value as 'intra-state' | 'inter-state')}
                            className="flex h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="intra-state">🏠 Intra-State (CGST + SGST)</option>
                            <option value="inter-state">🌏 Inter-State (IGST)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <input id="reverse_charge" type="checkbox" checked={reverseCharge}
                            onChange={(e) => setReverseCharge(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="reverse_charge" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer">
                            Reverse Charge (RCM)
                            <span title="Check if RCM applies (unregistered supplier, specific services, etc.)">
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                            </span>
                        </label>
                    </div>
                    </div>
                </div>

                {/* Section: Items */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">2</span>
                            Items
                        </h3>
                        <Button type="button" onClick={addItem} size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 text-xs px-3">
                            <Plus className="h-3.5 w-3.5" /> Add Item
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">

                {savedItems.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">📦 Saved Items — click to add</p>
                        <div className="flex flex-wrap gap-2">
                            {savedItems.map((savedItem) => (
                                <div key={savedItem.id} className="flex items-center gap-1.5 bg-white dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700 text-xs">
                                    <button type="button" onClick={() => addSavedItem(savedItem)} className="text-blue-600 hover:text-blue-800 font-medium">
                                        + {savedItem.name}
                                    </button>
                                    <button type="button" onClick={() => deleteSavedItem(savedItem.id)} className="text-red-400 hover:text-red-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-3 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Item Name *</label>
                                <Input placeholder="e.g. Website Development, Product name…"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    required className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-medium" />
                            </div>
                            <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                                className="mt-6 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                            <textarea placeholder="Additional details, notes about this item…"
                                value={item.details || ''}
                                onChange={(e) => updateItem(index, 'details', e.target.value)}
                                rows={2}
                                className="flex w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty *</label>
                                <Input type="number" placeholder="1" min="0" step="0.01"
                                    value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    required className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price *</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-gray-400 text-sm">₹</span>
                                    <Input type="number" placeholder="0" min="0" step="0.01"
                                        value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        required className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 pl-7" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">HSN/SAC</label>
                                <Input placeholder="Code" maxLength={6}
                                    value={item.hsn_sac_code || ''}
                                    onChange={(e) => updateItem(index, 'hsn_sac_code', e.target.value)}
                                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">GST %</label>
                                <Input type="number" placeholder="%" min="0" max="100" step="0.01"
                                    value={item.gst_rate !== undefined ? item.gst_rate : gstPercentage}
                                    onChange={(e) => updateItem(index, 'gst_rate', e.target.value === '' ? gstPercentage : parseFloat(e.target.value))}
                                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <select value={item.hsn_sac_type || 'SAC'}
                                    onChange={(e) => updateItem(index, 'hsn_sac_type', e.target.value as 'HSN' | 'SAC')}
                                    className="h-7 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-2 text-xs text-gray-500">
                                    <option value="SAC">SAC (Service)</option>
                                    <option value="HSN">HSN (Goods)</option>
                                </select>
                                <Button type="button" variant="outline" size="sm" onClick={() => saveCurrentItem(index)}
                                    className="h-7 text-xs rounded-md border-dashed gap-1 text-gray-500 hover:text-gray-700">
                                    💾 Save
                                </Button>
                            </div>
                            <div className="font-semibold text-sm px-3 py-1.5 rounded-lg border"
                                style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                                ₹{(item.quantity * item.unit_price).toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
                    </div>
                </div>

                {/* Section: Discount & Totals */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">3</span>
                            Discount &amp; Summary
                        </h3>
                    </div>
                    <div className="p-4">
                        {/* Discount Input */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Discount <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                            <div className="flex gap-2">
                                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                                    className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-20">
                                    <option value="percentage">% Off</option>
                                    <option value="flat">₹ Flat</option>
                                </select>
                                <div className="relative flex-1">
                                    <input type="number" min="0" step="0.01"
                                        placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                                        value={discountValue || ''}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                        className="flex h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
                                    {discountValue > 0 && (
                                        <button type="button" onClick={() => setDiscountValue(0)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {discountValue > 0 && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    <span className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-full px-2 py-0.5">
                                        🏷️ Saving ₹{calculateDiscount().toFixed(2)} ({discountType === 'percentage' ? `${discountValue}%` : 'flat discount'})
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2.5 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            {discountValue > 0 && (
                                <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                                    <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Flat'})</span>
                                    <span className="font-semibold">-₹{calculateDiscount().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>GST ({gstPercentage}%)</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{calculateGST().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2.5 border-t-2 border-blue-200 dark:border-blue-800 mt-1">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Notes */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-bold">4</span>
                            Notes
                        </h3>
                    </div>
                    <div className="p-4">
                        <textarea id="notes" name="notes" rows={3}
                            placeholder="Additional notes, terms, or payment instructions for this specific invoice…"
                            value={notes} onChange={(e) => setNotes(e.target.value)}
                            className="flex w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                    </div>
                </div>

                {/* Recurring Invoice Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-3">
                        <input id="is_recurring" type="checkbox" checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                            🔄 Make this a Recurring Invoice
                            <span className="text-xs text-gray-400 font-normal">(Auto-generate on schedule)</span>
                        </label>
                    </div>

                {isRecurring && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-700 p-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Frequency *</label>
                                <select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value as 'monthly' | 'yearly')}
                                    className="flex h-9 w-full rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-900/30 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="monthly">📅 Monthly</option>
                                    <option value="yearly">📆 Yearly</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Start Date *</label>
                                <Input type="date" value={recurringStartDate} onChange={(e) => setRecurringStartDate(e.target.value)} required={isRecurring} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">End Date (Optional)</label>
                                <Input type="date" value={recurringEndDate} onChange={(e) => setRecurringEndDate(e.target.value)} min={recurringStartDate} />
                                <p className="text-xs text-blue-600">Leave empty for indefinite</p>
                            </div>
                            {nextBillingDate && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Next Billing</label>
                                    <div className="flex h-9 items-center rounded-lg border border-blue-300 bg-blue-100 dark:bg-blue-900/40 px-3">
                                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                            {new Date(nextBillingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting}
                        className="flex-1 h-11 text-base font-semibold rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                        {isSubmitting
                            ? (mode === 'edit' ? '⏳ Updating…' : '⏳ Creating…')
                            : (mode === 'edit' ? '✅ Update Invoice' : '🚀 Create Invoice')}
                    </Button>
                </div>
            </form>
                </div>

                {/* Preview Section - Takes 1 column */}
                <div className="lg:col-span-1">
                    <InvoicePreviewPanel
                        selectedCustomerId={selectedCustomerId}
                        customers={customers}
                        items={items}
                        gstPercentage={gstPercentage}
                        supplyType={supplyType}
                        reverseCharge={reverseCharge}
                        invoiceDate={invoiceDate}
                        dueDate={dueDate}
                        notes={notes}
                    />
                </div>
            </div>

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Add New Customer
                        </h2>
                        <button onClick={() => setShowAddCustomerModal(false)} className="text-white/80 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="cust-name" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Name <span className="text-red-500">*</span></label>
                            <Input id="cust-name" name="name" required placeholder="Customer or company name" className="rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label htmlFor="cust-email" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</label>
                                <Input id="cust-email" name="email" type="email" placeholder="email@example.com" className="rounded-lg" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="cust-phone" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Phone</label>
                                <Input id="cust-phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" className="rounded-lg" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="cust-gstin" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">GSTIN</label>
                            <Input id="cust-gstin" name="gstin" maxLength={15} placeholder="22AAAA0000A1Z5" className="rounded-lg font-mono" />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="cust-address" className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Address</label>
                            <textarea id="cust-address" name="address" rows={2}
                                placeholder="Street, City, State, PIN"
                                className="flex w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700">Add Customer</Button>
                            <Button type="button" variant="outline" onClick={() => setShowAddCustomerModal(false)} className="flex-1 rounded-lg">Cancel</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Save Item Modal */}
        {showSaveItemModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-lg font-semibold">Save Item for Later</h2>
                        <button
                            onClick={() => setShowSaveItemModal(false)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="item-name" className="text-sm font-medium">Item Name *</label>
                            <Input
                                id="item-name"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="e.g., Web Design Service, Professional Consultation"
                            />
                        </div>
                        {savedItemToSave && (
                            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                                <p><span className="font-medium">Description:</span> {savedItemToSave.description}</p>
                                <p><span className="font-medium">Price:</span> ₹{savedItemToSave.unit_price.toFixed(2)}</p>
                                <p><span className="font-medium">Qty:</span> {savedItemToSave.quantity}</p>
                            </div>
                        )}
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleSaveItem} disabled={isSavingItem} className="flex-1">
                                {isSavingItem ? 'Saving…' : 'Save Item'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowSaveItemModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}
