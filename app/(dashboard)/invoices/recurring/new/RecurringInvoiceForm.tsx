'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { createRecurringInvoice } from '../actions'
import type { Customer, InvoiceWithDetails } from '@/lib/types'

interface RecurringInvoiceFormProps {
    customers: Customer[]
    sourceInvoice?: InvoiceWithDetails | null
}

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
}

export default function RecurringInvoiceForm({ customers, sourceInvoice }: RecurringInvoiceFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [customerId, setCustomerId] = useState('')
    const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState('')
    const [gstPercentage, setGstPercentage] = useState(18)
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unit_price: 0 }
    ])

    // Auto-calculate end date based on start date and frequency
    useEffect(() => {
        if (startDate) {
            const start = new Date(startDate)
            const end = new Date(start)
            
            if (frequency === 'monthly') {
                // Set to 1 year from start date for monthly
                end.setFullYear(end.getFullYear() + 1)
            } else {
                // Set to 5 years from start date for yearly
                end.setFullYear(end.getFullYear() + 5)
            }
            
            setEndDate(end.toISOString().split('T')[0])
        }
    }, [startDate, frequency])

    // Pre-populate form if sourceInvoice is provided
    useEffect(() => {
        if (sourceInvoice) {
            setCustomerId(sourceInvoice.customer_id)
            setGstPercentage(sourceInvoice.gst_percentage)
            setNotes(sourceInvoice.notes || '')
            setItems(sourceInvoice.invoice_items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price
            })))
        }
    }, [sourceInvoice])

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

    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price)
    }, 0)
    const gstAmount = (subtotal * gstPercentage) / 100
    const total = subtotal + gstAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!customerId) {
            alert('Please select a customer')
            return
        }

        if (!startDate) {
            alert('Please select a start date')
            return
        }

        // Validate items
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (!item.description || item.description.trim() === '') {
                alert(`Please add a description for item ${i + 1}`)
                return
            }
            if (item.quantity <= 0 || isNaN(item.quantity)) {
                alert(`Please add a valid quantity for item ${i + 1}`)
                return
            }
            if (item.unit_price < 0 || isNaN(item.unit_price)) {
                alert(`Please add a valid unit price for item ${i + 1}`)
                return
            }
        }

        setIsLoading(true)
        try {
            await createRecurringInvoice({
                customer_id: customerId,
                frequency,
                start_date: startDate,
                end_date: endDate || undefined,
                gst_percentage: gstPercentage,
                notes: notes || undefined,
                items: items.map(item => ({
                    description: item.description.trim(),
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price)
                }))
            })
            // Redirect will happen in the action
        } catch (err) {
            console.error('Error creating recurring invoice:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to create recurring invoice'
            alert(errorMessage)
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <div className="p-6 space-y-6">
                    {/* Customer Selection */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Customer *
                            </label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                                required
                            >
                                <option value="">Select a customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Billing Frequency *
                            </label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value as 'monthly' | 'yearly')}
                                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
                                required
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                Start Date *
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                End Date (Optional)
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1.5">
                                Auto-set to {frequency === 'monthly' ? '1 year' : '5 years'} from start. Leave empty for indefinite.
                            </p>
                        </div>
                    </div>

                    {/* GST */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            GST Percentage (%)
                        </label>
                        <Input
                            type="number"
                            value={gstPercentage}
                            onChange={(e) => setGstPercentage(Number(e.target.value))}
                            min="0"
                            max="100"
                            step="0.1"
                        />
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Invoice Items *
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                            </Button>
                        </div>

                        {items.map((item, index) => (
                            <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Item description"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div>
                                            <Input
                                                type="number"
                                                placeholder="Quantity"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                min="0.01"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                placeholder="Unit Price (₹)"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg text-right font-bold text-gray-900 dark:text-blue-100">
                                                ₹{(item.quantity * item.unit_price).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t-2 dark:border-gray-700 pt-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex justify-between text-base">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base">
                            <span className="text-gray-600 dark:text-gray-300">GST ({gstPercentage}%):</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">₹{gstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t-2 dark:border-gray-700 pt-3">
                            <span className="text-gray-900 dark:text-gray-100">Total per Invoice:</span>
                            <span className="text-blue-600 dark:text-blue-400">₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Notes
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'Creating...' : 'Create Recurring Invoice'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}
