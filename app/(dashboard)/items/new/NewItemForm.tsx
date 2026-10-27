'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createSavedItemAction } from '../actions'
import { Loader2, AlertCircle } from 'lucide-react'

export function NewItemForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const res = await createSavedItemAction(formData)

            if (res.success) {
                router.push('/items')
                router.refresh()
            } else {
                setError(res.error || 'Failed to create item.')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Item Label <span className="text-destructive">*</span>
                </label>
                <Input id="name" name="name" placeholder="e.g. Web Design, Monthly Retainer" required disabled={loading} />
                <p className="text-xs text-muted-foreground">A short name to find this item quickly.</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Invoice Line Description <span className="text-destructive">*</span>
                </label>
                <Input id="description" name="description" placeholder="e.g. Website design and development services" required disabled={loading} />
                <p className="text-xs text-muted-foreground">This text appears on the invoice line item.</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="item_details" className="text-sm font-medium">
                    Additional Details
                </label>
                <textarea
                    id="item_details"
                    name="item_details"
                    rows={2}
                    placeholder="Optional notes or sub-description for the line item"
                    disabled={loading}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="unit_price" className="text-sm font-medium">
                        Unit Price (₹) <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="unit_price"
                        name="unit_price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="default_quantity" className="text-sm font-medium">
                        Default Quantity
                    </label>
                    <Input
                        id="default_quantity"
                        name="default_quantity"
                        type="number"
                        step="1"
                        min="1"
                        defaultValue="1"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label htmlFor="hsn_sac_code" className="text-sm font-medium">
                        HSN / SAC Code
                    </label>
                    <Input
                        id="hsn_sac_code"
                        name="hsn_sac_code"
                        placeholder="e.g. 998314"
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="hsn_sac_type" className="text-sm font-medium">
                        Type
                    </label>
                    <select
                        id="hsn_sac_type"
                        name="hsn_sac_type"
                        disabled={loading}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">None</option>
                        <option value="HSN">HSN (Goods)</option>
                        <option value="SAC">SAC (Services)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="gst_rate" className="text-sm font-medium">
                        GST Rate (%)
                    </label>
                    <select
                        id="gst_rate"
                        name="gst_rate"
                        defaultValue="18"
                        disabled={loading}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">No Tax (0%)</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving Item...
                        </>
                    ) : (
                        'Save Item'
                    )}
                </Button>
                <Link href="/items" className="flex-1">
                    <Button type="button" variant="outline" disabled={loading} className="w-full">
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
