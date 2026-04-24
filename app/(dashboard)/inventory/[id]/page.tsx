import Link from 'next/link'
import { ArrowLeft, Plus, Minus } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { adjustInventoryStock, getInventoryItem, getRecentInventoryTransactions, updateInventoryItem } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditInventoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const item = await getInventoryItem(id)

    if (!item) {
        notFound()
    }

    const transactions = (await getRecentInventoryTransactions(50)).filter(tx => tx.item_id === id)
    const updateWithId = updateInventoryItem.bind(null, id)
    const adjustWithId = adjustInventoryStock.bind(null, id)

    return (
        <div className="space-y-4 max-w-4xl">
            <Link href="/inventory">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inventory
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Inventory Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateWithId} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="name" className="text-sm font-medium">Item Name <span className="text-destructive">*</span></label>
                                <Input id="name" name="name" required defaultValue={item.name} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                                <Input id="sku" name="sku" defaultValue={item.sku || ''} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="unit" className="text-sm font-medium">Unit</label>
                                <Input id="unit" name="unit" defaultValue={item.unit} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={item.description || ''}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="current_stock" className="text-sm font-medium">Current Stock</label>
                                <Input id="current_stock" name="current_stock" type="number" min="0" step="0.01" defaultValue={item.current_stock} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="reorder_level" className="text-sm font-medium">Reorder Level</label>
                                <Input id="reorder_level" name="reorder_level" type="number" min="0" step="0.01" defaultValue={item.reorder_level} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="purchase_price" className="text-sm font-medium">Purchase Price (₹)</label>
                                <Input id="purchase_price" name="purchase_price" type="number" min="0" step="0.01" defaultValue={item.purchase_price} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="selling_price" className="text-sm font-medium">Selling Price (₹)</label>
                                <Input id="selling_price" name="selling_price" type="number" min="0" step="0.01" defaultValue={item.selling_price} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="location" className="text-sm font-medium">Storage Location</label>
                                <Input id="location" name="location" defaultValue={item.location || ''} />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">Update Item</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quick Stock Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <form action={adjustWithId} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input type="hidden" name="movement_type" value="in" />
                        <Input name="quantity" type="number" min="0.01" step="0.01" placeholder="Qty" required />
                        <Input name="unit_cost" type="number" min="0" step="0.01" placeholder="Unit cost (optional)" />
                        <Input name="notes" placeholder="Note (optional)" />
                        <Button type="submit" className="sm:col-span-1 gap-2">
                            <Plus className="h-4 w-4" />
                            Stock In
                        </Button>
                    </form>

                    <form action={adjustWithId} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input type="hidden" name="movement_type" value="out" />
                        <Input name="quantity" type="number" min="0.01" step="0.01" placeholder="Qty" required />
                        <Input name="unit_cost" type="number" min="0" step="0.01" placeholder="Unit cost (optional)" />
                        <Input name="notes" placeholder="Note (optional)" />
                        <Button type="submit" variant="outline" className="sm:col-span-1 gap-2">
                            <Minus className="h-4 w-4" />
                            Stock Out
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Item Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No stock movements found for this item.</p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{tx.movement_type === 'in' ? 'Stock In' : 'Stock Out'}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString('en-IN')}</p>
                                        {tx.notes && <p className="text-xs text-gray-500 mt-0.5">{tx.notes}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-semibold ${tx.movement_type === 'in' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {tx.movement_type === 'in' ? '+' : '-'}{tx.quantity}
                                        </p>
                                        <p className="text-xs text-gray-500">{tx.previous_stock} to {tx.new_stock}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
