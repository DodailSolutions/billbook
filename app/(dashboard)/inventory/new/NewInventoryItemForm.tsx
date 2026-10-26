'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createInventoryItem } from '../actions'

export function NewInventoryItemForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await createInventoryItem(formData)

            if (result.success) {
                router.push('/inventory')
                router.refresh()
            } else {
                setError(result.error || 'Failed to create inventory item')
                setIsSubmitting(false)
            }
        } catch (err) {
            console.error('Error submitting inventory form:', err)
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold">Unable to save inventory item</p>
                        <p className="mt-1 text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-900">
                        Item Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                        id="name" 
                        name="name" 
                        required 
                        placeholder="e.g. Wireless Mouse, Cotton T-Shirt" 
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="sku" className="text-sm font-semibold text-gray-900">SKU / Item Code</label>
                    <Input id="sku" name="sku" placeholder="e.g. SPK-BT-001" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="unit" className="text-sm font-semibold text-gray-900">Unit of Measurement</label>
                    <Input id="unit" name="unit" defaultValue="pcs" placeholder="pcs, kg, box, mtr" />
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="description" className="text-sm font-semibold text-gray-900">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Optional item details, specifications, or notes"
                        className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="current_stock" className="text-sm font-semibold text-gray-900">Opening Stock</label>
                    <Input id="current_stock" name="current_stock" type="number" min="0" step="0.01" defaultValue="0" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="reorder_level" className="text-sm font-semibold text-gray-900">Low Stock Reorder Level</label>
                    <Input id="reorder_level" name="reorder_level" type="number" min="0" step="0.01" defaultValue="0" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="purchase_price" className="text-sm font-semibold text-gray-900">Purchase Cost Price (₹)</label>
                    <Input id="purchase_price" name="purchase_price" type="number" min="0" step="0.01" defaultValue="0" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="selling_price" className="text-sm font-semibold text-gray-900">Selling Price (₹)</label>
                    <Input id="selling_price" name="selling_price" type="number" min="0" step="0.01" defaultValue="0" />
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="location" className="text-sm font-semibold text-gray-900">Storage Location</label>
                    <Input id="location" name="location" placeholder="e.g. Warehouse A - Rack 2, Shelf 3" />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving Item...
                        </span>
                    ) : (
                        'Save Item'
                    )}
                </Button>
                <Link href="/inventory" className="flex-1">
                    <Button type="button" variant="outline" disabled={isSubmitting} className="w-full">
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
