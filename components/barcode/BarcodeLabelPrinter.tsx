'use client'

import React, { useState } from 'react'
import { 
    Printer, 
    X, 
    Check, 
    Copy, 
    Sliders, 
    Sparkles, 
    Layers, 
    Tag, 
    FileText 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { BarcodeLabelItem, LabelPrinterFormat } from '@/lib/barcode-types'
import { generateBarcodeDataUrl } from '@/lib/barcode-utils'

interface BarcodeLabelPrinterProps {
    items: BarcodeLabelItem[]
    defaultFormat?: LabelPrinterFormat
    companyName?: string
    onClose?: () => void
}

export function BarcodeLabelPrinter({
    items,
    defaultFormat = 'retail_50x25',
    companyName = 'BILLBOOK STORE',
    onClose
}: BarcodeLabelPrinterProps) {
    const [format, setFormat] = useState<LabelPrinterFormat>(defaultFormat)
    const [copies, setCopies] = useState<Record<string, number>>(
        items.reduce((acc, it) => ({ ...acc, [it.id]: it.copies || 1 }), {})
    )
    const [includePrice, setIncludePrice] = useState(true)
    const [includeHuid, setIncludeHuid] = useState(true)

    const handlePrint = () => {
        window.print()
    }

    // Expand items by copy count for the print sheet
    const printableUnits = items.flatMap(item => {
        const count = Math.max(1, copies[item.id] || 1)
        return Array.from({ length: count }, () => item)
    })

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            {/* Print stylesheet injected strictly for thermal and label printer dimensions */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #barcode-printable-area, #barcode-printable-area * {
                        visibility: visible !important;
                    }
                    #barcode-printable-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Barcode & Label Print Studio</h2>
                            <p className="text-xs text-slate-500">Generate thermal stickers, jewelry dumbbell tags, and standard A4 label sheets</p>
                        </div>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-4 text-xs">
                    {/* Format Selector */}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Label Format:</span>
                        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setFormat('jewelry_dumbbell')}
                                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                    format === 'jewelry_dumbbell' 
                                        ? 'bg-amber-500 text-white shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                💍 Jewelry Dumbbell Tag
                            </button>
                            <button
                                onClick={() => setFormat('retail_50x25')}
                                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                    format === 'retail_50x25' 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                🏷️ Retail 50×25mm
                            </button>
                            <button
                                onClick={() => setFormat('retail_38x25')}
                                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                    format === 'retail_38x25' 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                🏷️ Compact 38×25mm
                            </button>
                            <button
                                onClick={() => setFormat('sheet_a4_24')}
                                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                    format === 'sheet_a4_24' 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                📄 A4 Sheet (24-up)
                            </button>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                            <input 
                                type="checkbox" 
                                checked={includePrice} 
                                onChange={(e) => setIncludePrice(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Show Price</span>
                        </label>
                        {format === 'jewelry_dumbbell' && (
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                                <input 
                                    type="checkbox" 
                                    checked={includeHuid} 
                                    onChange={(e) => setIncludeHuid(e.target.checked)}
                                    className="rounded text-amber-600 focus:ring-amber-500"
                                />
                                <span>Show HUID / Hallmarking</span>
                            </label>
                        )}
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                            Total Labels: {printableUnits.length}
                        </span>
                    </div>
                </div>

                {/* Preview Studio */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                            <span className="font-medium uppercase tracking-wide">Live Printable Canvas Preview</span>
                            <span>Direct 1:1 vector thermal rendering</span>
                        </div>

                        {/* Printable Canvas Container */}
                        <div id="barcode-printable-area" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            {format === 'jewelry_dumbbell' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {printableUnits.map((item, idx) => {
                                        const jw = item.jewelry_attributes
                                        const barcodeUrl = generateBarcodeDataUrl(item.barcode, { height: 28, showText: true })

                                        return (
                                            <div 
                                                key={`${item.id}-${idx}`}
                                                className="border border-amber-300 rounded-lg p-2.5 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/50 flex items-center justify-between gap-2 shadow-xs text-[10px] leading-tight font-sans"
                                                style={{ minHeight: '90px' }}
                                            >
                                                {/* Left Wing (Jewelry Details) */}
                                                <div className="flex-1 pr-1 border-r border-dashed border-amber-200 space-y-0.5">
                                                    <div className="font-bold text-slate-900 truncate text-[11px]">{item.name}</div>
                                                    <div className="text-amber-800 font-semibold">{jw?.purity ? jw.purity.replace('_', ' ') : '22K 916'}</div>
                                                    <div className="text-slate-600 flex justify-between">
                                                        <span>GW: <b>{jw?.gross_weight_grams ? `${jw.gross_weight_grams}g` : '4.20g'}</b></span>
                                                        <span>NW: <b>{jw?.net_weight_grams ? `${jw.net_weight_grams}g` : '4.10g'}</b></span>
                                                    </div>
                                                    {includePrice && (
                                                        <div className="text-slate-900 font-bold">
                                                            ₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                        </div>
                                                    )}
                                                    {jw?.making_charge_value ? (
                                                        <div className="text-slate-500 text-[9px]">MC: ₹{jw.making_charge_value}{jw.making_charge_type === 'per_gram' ? '/g' : ''}</div>
                                                    ) : null}
                                                </div>

                                                {/* Fold Bridge (Simulated dumbbell neck) */}
                                                <div className="w-2.5 h-7 border-t border-b border-amber-300/80 bg-amber-100/50 self-center rounded-xs" title="Fold strip" />

                                                {/* Right Wing (Vector Barcode & HUID) */}
                                                <div className="flex-1 pl-1 flex flex-col items-center justify-center text-center">
                                                    <img 
                                                        src={barcodeUrl} 
                                                        alt={item.barcode} 
                                                        className="w-full h-8 object-contain"
                                                    />
                                                    <div className="text-[9px] font-mono font-bold text-slate-700 tracking-wider mt-0.5">
                                                        {item.barcode}
                                                    </div>
                                                    {includeHuid && jw?.huid_number && (
                                                        <div className="text-[9px] font-mono text-indigo-700 font-semibold">
                                                            HUID: {jw.huid_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {(format === 'retail_50x25' || format === 'retail_38x25') && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {printableUnits.map((item, idx) => {
                                        const barcodeUrl = generateBarcodeDataUrl(item.barcode, { height: 35, showText: true })
                                        return (
                                            <div 
                                                key={`${item.id}-${idx}`}
                                                className="border border-slate-300 rounded p-2 bg-white flex flex-col items-center justify-between text-center shadow-xs"
                                                style={{ minHeight: format === 'retail_50x25' ? '100px' : '85px' }}
                                            >
                                                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{companyName}</div>
                                                <div className="font-bold text-slate-900 text-[11px] truncate w-full px-1">{item.name}</div>
                                                <img 
                                                    src={barcodeUrl} 
                                                    alt={item.barcode} 
                                                    className="w-full h-9 object-contain my-1"
                                                />
                                                {includePrice && (
                                                    <div className="font-extrabold text-slate-900 text-xs">
                                                        MRP: ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {format === 'sheet_a4_24' && (
                                <div className="grid grid-cols-3 gap-2 border border-slate-300 p-4 rounded bg-white">
                                    {printableUnits.map((item, idx) => {
                                        const barcodeUrl = generateBarcodeDataUrl(item.barcode, { height: 32, showText: true })
                                        return (
                                            <div 
                                                key={`${item.id}-${idx}`}
                                                className="border border-dashed border-slate-300 rounded p-2 text-center flex flex-col justify-between"
                                                style={{ height: '105px' }}
                                            >
                                                <div className="text-[10px] font-bold text-slate-800 truncate">{item.name}</div>
                                                <img 
                                                    src={barcodeUrl} 
                                                    alt={item.barcode} 
                                                    className="w-full h-8 object-contain my-1"
                                                />
                                                <div className="text-[10px] font-bold text-slate-900">
                                                    ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Compatible with Zebra, TSC, Citizen, Xprinter, and standard desktop printers.
                    </div>
                    <div className="flex items-center gap-3">
                        {onClose && (
                            <Button variant="outline" onClick={onClose} size="sm">
                                Cancel
                            </Button>
                        )}
                        <Button 
                            onClick={handlePrint} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-indigo-200"
                        >
                            <Printer className="w-4 h-4" />
                            Print {printableUnits.length} Label{printableUnits.length === 1 ? '' : 's'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
