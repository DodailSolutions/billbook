'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Boxes } from 'lucide-react'
import { adjustInventoryStock, deleteInventoryItem } from './actions'
import type { InventoryItem } from '@/lib/types'

interface InventoryListProps {
    items: InventoryItem[]
}

function getStockBadge(item: InventoryItem) {
    if (item.current_stock <= 0) {
        return 'bg-red-100 text-red-700'
    }
    if (item.current_stock <= item.reorder_level) {
        return 'bg-amber-100 text-amber-700'
    }
    return 'bg-emerald-100 text-emerald-700'
}

function getStockText(item: InventoryItem) {
    if (item.current_stock <= 0) return 'Out of stock'
    if (item.current_stock <= item.reorder_level) return 'Low stock'
    return 'In stock'
}

export function InventoryList({ items }: InventoryListProps) {
    const [busyId, setBusyId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this inventory item? All stock history for this item will also be removed.')) return

        setBusyId(id)
        try {
            await deleteInventoryItem(id)
        } catch (error) {
            console.error(error)
            alert('Failed to delete item')
        } finally {
            setBusyId(null)
        }
    }

    const handleQuickAdjust = async (item: InventoryItem, movementType: 'in' | 'out') => {
        const raw = prompt(`Enter quantity to stock-${movementType} for ${item.name}`)
        if (!raw) return

        const quantity = Number(raw)
        if (!Number.isFinite(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity')
            return
        }

        const notes = prompt('Optional note for this stock update') || ''
        const formData = new FormData()
        formData.set('movement_type', movementType)
        formData.set('quantity', String(quantity))
        formData.set('notes', notes)

        setBusyId(item.id)
        try {
            await adjustInventoryStock(item.id, formData)
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : 'Failed to update stock')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3 hidden md:table-cell">SKU</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3 hidden lg:table-cell">Reorder Level</th>
                        <th className="px-4 py-3 hidden lg:table-cell">Unit</th>
                        <th className="px-4 py-3 hidden md:table-cell">Selling Price</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        <Boxes className="h-3.5 w-3.5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        {item.location && <p className="text-xs text-gray-500">{item.location}</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-gray-700">{item.sku || '—'}</td>
                            <td className="px-4 py-3">
                                <p className="font-semibold text-gray-900">{item.current_stock.toFixed(2)}</p>
                                <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStockBadge(item)}`}>
                                    {getStockText(item)}
                                </span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell text-gray-700">{item.reorder_level.toFixed(2)}</td>
                            <td className="px-4 py-3 hidden lg:table-cell text-gray-700">{item.unit}</td>
                            <td className="px-4 py-3 hidden md:table-cell text-gray-700">₹{item.selling_price.toFixed(2)}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-green-50 hover:text-green-700"
                                        disabled={busyId === item.id}
                                        onClick={() => handleQuickAdjust(item, 'in')}
                                        title="Stock In"
                                    >
                                        <ArrowUpCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-orange-50 hover:text-orange-700"
                                        disabled={busyId === item.id}
                                        onClick={() => handleQuickAdjust(item, 'out')}
                                        title="Stock Out"
                                    >
                                        <ArrowDownCircle className="h-4 w-4" />
                                    </Button>
                                    <Link href={`/inventory/${item.id}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-red-50"
                                        disabled={busyId === item.id}
                                        onClick={() => handleDelete(item.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
