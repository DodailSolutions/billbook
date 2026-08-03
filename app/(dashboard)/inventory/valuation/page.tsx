'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getInventoryValuationReport } from '../actions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Package, DollarSign, TrendingUp, AlertTriangle, Printer, Layers } from 'lucide-react'

export default function InventoryValuationPage() {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getInventoryValuationReport().then(data => {
            setReport(data)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/inventory">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Layers className="h-6 w-6 text-indigo-600" />
                            Inventory Valuation Report
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Asset cost valuation, retail value, and profit margins across all inventory SKUs.
                        </p>
                    </div>
                </div>

                <Button onClick={() => window.print()} variant="outline" className="gap-2 min-h-[44px]">
                    <Printer className="h-4 w-4" /> Print Valuation
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Cost Value</p>
                        <h3 className="text-xl font-bold text-indigo-600 mt-1">
                            ₹{report.totalCostValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Balance Sheet Inventory Asset</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Retail Sales Value</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">
                            ₹{report.totalRetailValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Total Expected Revenue</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Potential Gross Profit</p>
                        <h3 className="text-xl font-bold text-emerald-600 mt-1">
                            ₹{report.potentialMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{report.potentialMarginPercent}% Margin</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder Alerts</p>
                        <h3 className="text-xl font-bold text-amber-600 mt-1">
                            {report.reorderCount} SKUs
                        </h3>
                        <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{report.outOfStockCount} Out of Stock</p>
                    </CardContent>
                </Card>
            </div>

            {/* Valuation Breakdown Table */}
            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Valuation Breakdown by SKU
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-3">SKU / Item</th>
                                    <th className="p-3 text-center">Stock</th>
                                    <th className="p-3 text-right">Cost Price</th>
                                    <th className="p-3 text-right">Sell Price</th>
                                    <th className="p-3 text-right">Asset Cost Value</th>
                                    <th className="p-3 text-right">Retail Value</th>
                                    <th className="p-3 text-right">Margin / Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {report.valuedItems.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{item.sku || 'No SKU'}</p>
                                                </div>
                                                {item.isLowStock && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700 font-bold">LOW</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-bold text-gray-800">
                                            {item.current_stock} {item.unit}
                                        </td>
                                        <td className="p-3 text-right font-mono text-gray-600">₹{item.purchase_price.toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono text-gray-600">₹{item.selling_price.toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold text-indigo-600 font-mono">
                                            ₹{item.assetValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 text-right font-bold text-gray-900 font-mono">
                                            ₹{item.retailValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 text-right font-mono text-emerald-600 font-bold">
                                            +₹{item.unitMargin.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
