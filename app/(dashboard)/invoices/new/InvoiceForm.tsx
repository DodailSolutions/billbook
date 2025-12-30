'use client'

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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
}

export function InvoiceForm({ customers, invoice, mode = 'create' }: InvoiceFormProps) {
    const [items, setItems] = useState<InvoiceItem[]>(
        invoice?.invoice_items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price
        })) || [{ description: '', quantity: 1, unit_price: 0 }]
    )
    const [gstPercentage, setGstPercentage] = useState(invoice?.gst_percentage || 18)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                notes: formData.get('notes') as string || undefined,
                items: items.filter(item => item.description && item.quantity > 0 && item.unit_price > 0)
            }

            if (mode === 'edit' && invoice) {
                await updateInvoice(invoice.id, invoiceData)
            } else {
                await createInvoice(invoiceData)
            }
        } catch (error) {
            console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} invoice:`, error)
            alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} invoice`)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="customer_id" className="text-sm font-medium">
                        Customer <span className="text-destructive">*</span>
                    </label>
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
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Items</h3>
                    <Button type="button" onClick={addItem} variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-24 space-y-2">
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
                            <div className="w-32 space-y-2">
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
                            <div className="w-32 flex items-center justify-end">
                                <span className="text-sm font-medium">
                                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
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
    )
}
