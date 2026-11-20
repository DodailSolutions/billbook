'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertCircle, Loader2, Barcode, Sparkles, Gem, ChevronDown, ChevronUp } from 'lucide-react'
import { createInventoryItem } from '../actions'
import { generateUniqueBarcode } from '@/lib/barcode-utils'

export function NewInventoryItemForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [barcodeVal, setBarcodeVal] = useState<string>('')
    const [showJewelry, setShowJewelry] = useState(false)

    // Jewelry specific state
    const [purity, setPurity] = useState('22K_916')
    const [grossWeight, setGrossWeight] = useState('')
    const [netWeight, setNetWeight] = useState('')
    const [makingCharge, setMakingCharge] = useState('')
    const [makingType, setMakingType] = useState('per_gram')
    const [huid, setHuid] = useState('')

    const handleGenerateBarcode = () => {
        setBarcodeVal(generateUniqueBarcode())
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            
            if (showJewelry && (grossWeight || netWeight)) {
                const jewelryData = {
                    purity,
                    gross_weight_grams: parseFloat(grossWeight) || 0,
                    net_weight_grams: parseFloat(netWeight) || 0,
                    making_charge_type: makingType,
                    making_charge_value: parseFloat(makingCharge) || 0,
                    huid_number: huid.trim() || undefined
                }
                formData.set('jewelry_attributes', JSON.stringify(jewelryData))
            }

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
                    <div className="flex items-center justify-between">
                        <label htmlFor="barcode" className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                            Barcode / Tag ID
                        </label>
                        <button
                            type="button"
                            onClick={handleGenerateBarcode}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" />
                            Auto-Generate
                        </button>
                    </div>
                    <Input 
                        id="barcode" 
                        name="barcode" 
                        value={barcodeVal} 
                        onChange={(e) => setBarcodeVal(e.target.value)} 
                        placeholder="Scan or click Auto-Generate" 
                        className="font-mono text-xs"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="unit" className="text-sm font-semibold text-gray-900">Unit of Measurement</label>
                    <Input id="unit" name="unit" defaultValue="pcs" placeholder="pcs, kg, g, box, mtr" />
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

                {/* Optional Jewelry & Ornament Specifications */}
                <div className="sm:col-span-2 border border-amber-200/80 rounded-xl p-4 bg-amber-50/30 space-y-3">
                    <div 
                        onClick={() => setShowJewelry(!showJewelry)}
                        className="flex items-center justify-between cursor-pointer select-none"
                    >
                        <div className="flex items-center gap-2">
                            <Gem className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-bold text-slate-900">Jewelry & Ornament Specifications</span>
                            <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-medium">
                                Optional for Gold, Silver & Diamond items
                            </span>
                        </div>
                        {showJewelry ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>

                    {showJewelry && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-amber-200/50">
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Metal Purity</label>
                                <select 
                                    value={purity} 
                                    onChange={(e) => setPurity(e.target.value)}
                                    className="w-full rounded-md border-gray-300 text-xs py-2 px-2.5 bg-white shadow-xs focus:ring-amber-500"
                                >
                                    <option value="24K">24K (99.9% Fine Gold)</option>
                                    <option value="22K_916">22K 916 (Standard Hallmarked)</option>
                                    <option value="18K_750">18K 750 (Diamond/Studded)</option>
                                    <option value="14K_585">14K 585 (Lightweight)</option>
                                    <option value="Silver_925">Silver 925 (Sterling)</option>
                                    <option value="Platinum_950">Platinum 950</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Gross Weight (grams)</label>
                                <Input 
                                    type="number" 
                                    step="0.001" 
                                    value={grossWeight} 
                                    onChange={(e) => setGrossWeight(e.target.value)} 
                                    placeholder="e.g. 8.420" 
                                    className="h-8 text-xs" 
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Net Weight (grams)</label>
                                <Input 
                                    type="number" 
                                    step="0.001" 
                                    value={netWeight} 
                                    onChange={(e) => setNetWeight(e.target.value)} 
                                    placeholder="e.g. 7.950" 
                                    className="h-8 text-xs" 
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Making Charge Type</label>
                                <select 
                                    value={makingType} 
                                    onChange={(e) => setMakingType(e.target.value)}
                                    className="w-full rounded-md border-gray-300 text-xs py-2 px-2.5 bg-white shadow-xs focus:ring-amber-500"
                                >
                                    <option value="per_gram">Per Gram (₹/g)</option>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Making Charge Value</label>
                                <Input 
                                    type="number" 
                                    step="0.01" 
                                    value={makingCharge} 
                                    onChange={(e) => setMakingCharge(e.target.value)} 
                                    placeholder="e.g. 450" 
                                    className="h-8 text-xs" 
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">BIS HUID / Hallmark No.</label>
                                <Input 
                                    value={huid} 
                                    onChange={(e) => setHuid(e.target.value.toUpperCase())} 
                                    placeholder="e.g. HUID-7X8921" 
                                    className="h-8 text-xs font-mono uppercase" 
                                />
                            </div>
                        </div>
                    )}
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
