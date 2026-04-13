'use client'

import { useState } from "react"
import Link from "next/link"
import { Trash2, Pencil, Package, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { deleteSavedItem } from "./actions"
import type { SavedItem } from "@/lib/types"

interface ItemsListProps {
    items: SavedItem[]
}

export function ItemsList({ items }: ItemsListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this saved item? It won\'t affect any existing invoices.')) return

        setDeletingId(id)
        try {
            await deleteSavedItem(id)
        } catch (error) {
            console.error('Error deleting saved item:', error)
            alert('Failed to delete item')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3 hidden sm:table-cell">GST %</th>
                        <th className="px-4 py-3 hidden lg:table-cell">HSN / SAC</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                                        <Package className="h-3.5 w-3.5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500 md:hidden line-clamp-1">{item.description}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                                <p className="text-gray-700 line-clamp-1">{item.description}</p>
                                {item.item_details && (
                                    <p className="text-xs text-gray-400 line-clamp-1">{item.item_details}</p>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-0.5 font-semibold text-gray-900">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    {item.unit_price.toFixed(2)}
                                </div>
                                <p className="text-xs text-gray-400">Qty: {item.default_quantity}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell text-gray-700">
                                {item.gst_rate != null ? `${item.gst_rate}%` : '—'}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell text-gray-700">
                                {item.hsn_sac_code ? (
                                    <span className="inline-flex items-center gap-1">
                                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                            {item.hsn_sac_type || 'HSN'}
                                        </span>
                                        {item.hsn_sac_code}
                                    </span>
                                ) : '—'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                    <Link href={`/items/${item.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deletingId === item.id}
                                        className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-destructive transition-colors"
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
