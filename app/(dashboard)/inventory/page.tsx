import Link from 'next/link'
import { Plus, AlertTriangle, Boxes, IndianRupee, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getInventoryItems, getRecentInventoryTransactions } from './actions'
import { InventoryCsvControls } from './InventoryCsvControls'
import { InventoryList } from './InventoryList'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
    const [items, transactions] = await Promise.all([
        getInventoryItems(),
        getRecentInventoryTransactions(8),
    ])

    const totalItems = items.length
    const lowStockCount = items.filter(item => item.current_stock > 0 && item.current_stock <= item.reorder_level).length
    const outOfStockCount = items.filter(item => item.current_stock <= 0).length
    const totalStockValue = items.reduce((sum, item) => sum + (item.current_stock * item.selling_price), 0)

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track stock levels, manage SKUs, and log stock movement.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <InventoryCsvControls />
                    <Link href="/inventory/new" className="w-full sm:w-auto">
                        <Button className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            Add Inventory Item
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Total SKUs</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Boxes className="h-3.5 w-3.5" />
                            active inventory items
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Stock Value</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalStockValue.toFixed(2)}</p>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" />
                            based on selling price
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Low Stock</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
                        <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            at or below reorder level
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
                        <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            immediate restock needed
                        </div>
                    </CardContent>
                </Card>
            </div>

            {items.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No inventory items yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Create your first inventory item to start tracking stock movement and stock value.</p>
                        <Link href="/inventory/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Inventory Item
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <InventoryList items={items} />
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-blue-600" />
                        Recent Stock Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No stock movements recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{tx.item?.name || 'Inventory Item'}</p>
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
