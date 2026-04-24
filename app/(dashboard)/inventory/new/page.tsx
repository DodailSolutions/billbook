import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { createInventoryItem } from '../actions'

export const dynamic = 'force-dynamic'

export default function NewInventoryItemPage() {
    return (
        <div className="space-y-4 max-w-3xl">
            <Link href="/inventory">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inventory
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Add Inventory Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createInventoryItem} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="name" className="text-sm font-medium">Item Name <span className="text-destructive">*</span></label>
                                <Input id="name" name="name" required placeholder="e.g. Bluetooth Speaker" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                                <Input id="sku" name="sku" placeholder="e.g. SPK-BT-001" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="unit" className="text-sm font-medium">Unit</label>
                                <Input id="unit" name="unit" defaultValue="pcs" placeholder="pcs, kg, box" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Optional item details"
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="current_stock" className="text-sm font-medium">Opening Stock</label>
                                <Input id="current_stock" name="current_stock" type="number" min="0" step="0.01" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="reorder_level" className="text-sm font-medium">Reorder Level</label>
                                <Input id="reorder_level" name="reorder_level" type="number" min="0" step="0.01" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="purchase_price" className="text-sm font-medium">Purchase Price (₹)</label>
                                <Input id="purchase_price" name="purchase_price" type="number" min="0" step="0.01" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="selling_price" className="text-sm font-medium">Selling Price (₹)</label>
                                <Input id="selling_price" name="selling_price" type="number" min="0" step="0.01" defaultValue="0" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="location" className="text-sm font-medium">Storage Location</label>
                                <Input id="location" name="location" placeholder="e.g. Warehouse A - Rack 2" />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">Save Item</Button>
                            <Link href="/inventory" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
