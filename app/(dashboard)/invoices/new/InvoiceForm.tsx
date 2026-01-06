'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Info, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { createInvoice, updateInvoice } from "../actions"
import type { Customer, InvoiceWithDetails } from "@/lib/types"

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

    // Load saved items from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedInvoiceItems')
        if (saved) {
            setSavedItems(JSON.parse(saved))
        }
    }, [])

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
                items: items.filter(item => item.description && item.quantity > 0 && item.unit_price > 0)
            }

            if (mode === 'edit' && invoice) {
                const result = await updateInvoice(invoice.id, invoiceData)
                if (result.success) {
                    router.push('/invoices')
                    router.refresh()
                }
            } else {
                const result = await createInvoice(invoiceData)
                if (result.success) {
                    router.push('/invoices')
                    router.refresh()
                }
            }
        } catch (error) {
            console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} invoice:`, error)
            alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} invoice`)
            setIsSubmitting(false)
        }
    }

    return (
        <>
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
                                defaultValue={invoice?.customer_id || ''}
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
                        defaultValue={invoice?.invoice_date || new Date().toISOString().split('T')[0]}
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
                        defaultValue={invoice?.due_date || ''}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
                                <div key={savedItem.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded border border-blue-200 dark:border-blue-700 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => addSavedItem(savedItem)}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
                                <label className="text-xs text-gray-600 dark:text-gray-400">Description *</label>
                                <Input
                                    placeholder="Item description"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Qty *</label>
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
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Price *</label>
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
                                    <label className="text-xs text-gray-600 dark:text-gray-400">HSN/SAC</label>
                                    <Input
                                        placeholder="HSN/SAC Code"
                                        maxLength={6}
                                        value={item.hsn_sac_code || ''}
                                        onChange={(e) => updateItem(index, 'hsn_sac_code', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Type</label>
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
                                    <label className="text-xs text-gray-600 dark:text-gray-400">GST Rate (%)</label>
                                    <Input
                                        type="number"
                                        placeholder="GST %"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={item.gst_rate || gstPercentage}
                                        onChange={(e) => updateItem(index, 'gst_rate', parseFloat(e.target.value) || gstPercentage)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Item Total</label>
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
                    defaultValue={invoice?.notes || ''}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
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

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
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
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm space-y-1">
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
