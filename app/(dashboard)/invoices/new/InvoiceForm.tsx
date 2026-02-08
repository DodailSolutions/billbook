'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Info, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { createInvoice, updateInvoice } from "../actions"
import type { Customer, InvoiceWithDetails } from "@/lib/types"
import { InvoicePreviewPanel } from "./InvoicePreviewPanel"

interface InvoiceFormProps {
    customers: Customer[]
    invoice?: InvoiceWithDetails
    mode?: 'create' | 'edit'
}

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
}

export function InvoiceForm({ customers: initialCustomers, invoice, mode = 'create' }: InvoiceFormProps) {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
    const [selectedCustomerId, setSelectedCustomerId] = useState(invoice?.customer_id || '')
    const [invoiceDate, setInvoiceDate] = useState(invoice?.invoice_date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(invoice?.due_date || '')
    const [notes, setNotes] = useState(invoice?.notes || '')
    const [simplifiedView, setSimplifiedView] = useState(true)
    const [items, setItems] = useState<InvoiceItem[]>(
        invoice?.invoice_items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            hsn_sac_code: item.hsn_sac_code,
            hsn_sac_type: item.hsn_sac_type,
            gst_rate: item.gst_rate
        })) || [{ description: '', quantity: 1, unit_price: 0 }]
    )
    const [gstPercentage, setGstPercentage] = useState(invoice?.gst_percentage || 18)
    const [supplyType, setSupplyType] = useState<'intra-state' | 'inter-state'>(invoice?.supply_type || 'intra-state')
    const [reverseCharge, setReverseCharge] = useState(invoice?.reverse_charge_applicable || false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
    const [showSaveItemModal, setShowSaveItemModal] = useState(false)
    const [savedItemToSave, setSavedItemToSave] = useState<InvoiceItem | null>(null)
    const [savedItems, setSavedItems] = useState<Array<InvoiceItem & { id: string; name: string }>>([])
    const [itemName, setItemName] = useState('')
    
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

    const addSavedItem = (savedItem: InvoiceItem) => {
        setItems([...items, { ...savedItem }])
    }

    const saveCurrentItem = (itemIndex: number) => {
        setSavedItemToSave(items[itemIndex])
        setShowSaveItemModal(true)
    }

    const handleSaveItem = () => {
        if (savedItemToSave && itemName.trim()) {
            const newSaved = {
                ...savedItemToSave,
                id: Date.now().toString(),
                name: itemName
            }
            const updated = [...savedItems, newSaved]
            setSavedItems(updated)
            localStorage.setItem('savedInvoiceItems', JSON.stringify(updated))
            setItemName('')
            setShowSaveItemModal(false)
            setSavedItemToSave(null)
        }
    }

    const deleteSavedItem = (id: string) => {
        const updated = savedItems.filter(item => item.id !== id)
        setSavedItems(updated)
        localStorage.setItem('savedInvoiceItems', JSON.stringify(updated))
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

    const calculateGST = () => {
        return (calculateSubtotal() * gstPercentage) / 100
    }

    const calculateTotal = () => {
        return calculateSubtotal() + calculateGST()
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
                items: items.filter(item => item.description && item.quantity > 0 && item.unit_price > 0),
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
        <>{/* Header with Simplified View Toggle */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 ">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mode === 'edit' ? 'Edit Invoice' : 'New Invoice'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Use Simplified View
                    </span>
                    <button
                        type="button"
                        onClick={() => setSimplifiedView(!simplifiedView)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            simplifiedView ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                simplifiedView ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form Section - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="customer_id" className="text-sm font-medium">
                            Customer <span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                id="customer_id"
                                name="customer_id"
                                required
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                onClick={() => setShowAddCustomerModal(true)}
                                variant="outline"
                                size="sm"
                                className="gap-2 whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </div>

                <div className="space-y-2">
                    <label htmlFor="invoice_date" className="text-sm font-medium">
                        Invoice Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="invoice_date"
                        name="invoice_date"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">
                        Due Date
                    </label>
                    <Input
                        id="due_date"
                        name="due_date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="gst_percentage" className="text-sm font-medium">
                        GST Percentage
                    </label>
                    <Input
                        id="gst_percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={gstPercentage}
                        onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="supply_type" className="text-sm font-medium">
                        Supply Type
                    </label>
                    <select
                        id="supply_type"
                        value={supplyType}
                        onChange={(e) => setSupplyType(e.target.value as 'intra-state' | 'inter-state')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="intra-state">Intra-State (CGST + SGST)</option>
                        <option value="inter-state">Inter-State (IGST)</option>
                    </select>
                    <p className="text-xs text-gray-600">
                        {supplyType === 'intra-state' ? 'GST split into CGST and SGST (50% each)' : 'Full GST amount as IGST'}
                    </p>
                </div>

                <div className="space-y-2 flex items-center gap-2">
                    <input
                        id="reverse_charge"
                        type="checkbox"
                        checked={reverseCharge}
                        onChange={(e) => setReverseCharge(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="reverse_charge" className="text-sm font-medium flex items-center gap-1">
                        Reverse Charge Applicable
                        <div title="Check if RCM applies (unregistered supplier, specific services, etc.)">
                            <Info className="h-4 w-4 text-gray-500" />
                        </div>
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Items</h3>
                    <Button type="button" onClick={addItem} variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                {savedItems.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Saved Items</p>
                        <div className="flex flex-wrap gap-2">
                            {savedItems.map((savedItem) => (
                                <div key={savedItem.id} className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-blue-200 dark:border-blue-700 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => addSavedItem(savedItem)}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        + {savedItem.name}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteSavedItem(savedItem.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-3">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-600">Description *</label>
                                <Input
                                    placeholder="Item description"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Qty *</label>
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        min="0"
                                        step="0.01"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Price *</label>
                                    <Input
                                        type="number"
                                        placeholder="Price"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">HSN/SAC</label>
                                    <Input
                                        placeholder="HSN/SAC Code"
                                        maxLength={6}
                                        value={item.hsn_sac_code || ''}
                                        onChange={(e) => updateItem(index, 'hsn_sac_code', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Type</label>
                                    <select
                                        value={item.hsn_sac_type || 'SAC'}
                                        onChange={(e) => updateItem(index, 'hsn_sac_type', e.target.value as 'HSN' | 'SAC')}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm"
                                    >
                                        <option value="SAC">SAC (Service)</option>
                                        <option value="HSN">HSN (Goods)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">GST Rate (%)</label>
                                    <Input
                                        type="number"
                                        placeholder="GST %"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={item.gst_rate !== undefined ? item.gst_rate : gstPercentage}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? gstPercentage : parseFloat(e.target.value)
                                            updateItem(index, 'gst_rate', value)
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Item Total</label>
                                    <div className="flex items-center h-9 rounded-md border border-input bg-muted px-3">
                                        <span className="text-sm font-medium">₹{(item.quantity * item.unit_price).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => saveCurrentItem(index)}
                                        className="flex-1 h-9 text-xs"
                                    >
                                        Save for Later
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                        className="text-destructive hover:text-destructive h-9"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>GST ({gstPercentage}%):</span>
                        <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Additional notes or terms..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
            </div>

            {/* Recurring Invoice Section */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3">
                    <input
                        id="is_recurring"
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="is_recurring" className="text-sm font-medium flex items-center gap-2">
                        🔄 Make this a Recurring Invoice
                        <span className="text-xs text-gray-500 font-normal">(Auto-generate invoices on schedule)</span>
                    </label>
                </div>

                {isRecurring && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Billing Frequency *
                                </label>
                                <select
                                    value={recurringFrequency}
                                    onChange={(e) => setRecurringFrequency(e.target.value as 'monthly' | 'yearly')}
                                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="monthly">📅 Monthly</option>
                                    <option value="yearly">📆 Yearly</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Start Date *
                                </label>
                                <Input
                                    type="date"
                                    value={recurringStartDate}
                                    onChange={(e) => setRecurringStartDate(e.target.value)}
                                    required={isRecurring}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    End Date (Optional)
                                </label>
                                <Input
                                    type="date"
                                    value={recurringEndDate}
                                    onChange={(e) => setRecurringEndDate(e.target.value)}
                                    min={recurringStartDate}
                                />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Leave empty for indefinite billing
                                </p>
                            </div>

                            {nextBillingDate && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        📊 Next Billing Date
                                    </label>
                                    <div className="flex h-9 items-center rounded-md border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/40 px-3">
                                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                            {new Date(nextBillingDate).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded p-3">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>ℹ️ How it works:</strong> This invoice will be automatically generated {recurringFrequency === 'monthly' ? 'every month' : 'every year'} starting from {new Date(recurringStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. You&apos;ll receive reminders before each billing date.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting
                        ? mode === 'edit' ? 'Updating...' : 'Creating...'
                        : mode === 'edit' ? 'Update Invoice' : 'Create Invoice'
                    }
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b ">
                        <h2 className="text-lg font-semibold">Add New Customer</h2>
                        <button
                            onClick={() => setShowAddCustomerModal(false)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="cust-name" className="text-sm font-medium">Name *</label>
                            <Input id="cust-name" name="name" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cust-email" className="text-sm font-medium">Email</label>
                            <Input id="cust-email" name="email" type="email" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cust-phone" className="text-sm font-medium">Phone</label>
                            <Input id="cust-phone" name="phone" type="tel" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cust-gstin" className="text-sm font-medium">GSTIN</label>
                            <Input id="cust-gstin" name="gstin" maxLength={15} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cust-address" className="text-sm font-medium">Address</label>
                            <textarea
                                id="cust-address"
                                name="address"
                                rows={2}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">Add Customer</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddCustomerModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Save Item Modal */}
        {showSaveItemModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b ">
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
                            <Button onClick={handleSaveItem} className="flex-1">Save Item</Button>
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
