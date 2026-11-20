'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Barcode, 
    Printer, 
    Sliders, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    ShieldCheck, 
    Radio, 
    Tv, 
    Tag, 
    Gem, 
    Store, 
    Laptop, 
    Volume2, 
    VolumeX, 
    Zap, 
    RefreshCw, 
    ArrowLeft 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
    getBarcodeSettings, 
    updateBarcodeSettings, 
    lookupItemByBarcode 
} from '@/lib/barcode-actions'
import type { BarcodeSettings, BusinessType, LabelPrinterFormat } from '@/lib/barcode-types'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { generateBarcodeDataUrl } from '@/lib/barcode-utils'

const BUSINESS_TYPES: { id: BusinessType; name: string; description: string; icon: string }[] = [
    { 
        id: 'jewelry_retail', 
        name: 'Jewelry Store & Ornaments', 
        description: 'Auto-activates Gross/Net Weight, Metal Purity (22K 916), Making Charges, and Butterfly/Dumbbell tags.',
        icon: '💍' 
    },
    { 
        id: 'retail', 
        name: 'Retail Store / Supermarket', 
        description: 'Standard retail SKUs, shelf price tags, 50x25mm barcode stickers, and high-speed counter checkout.',
        icon: '🛒' 
    },
    { 
        id: 'wholesale', 
        name: 'Wholesale & Distribution', 
        description: 'Carton/box barcodes, batch tracking, and multi-quantity inventory inwarding.',
        icon: '📦' 
    },
    { 
        id: 'services', 
        name: 'Service Agency / IT Firm', 
        description: 'Barcode fields completely hidden for a distraction-free, professional service invoicing experience.',
        icon: '💼' 
    },
    { 
        id: 'standard', 
        name: 'Standard Trading', 
        description: 'Balanced invoicing with optional barcode lookup for general merchandise.',
        icon: '🏢' 
    }
]

export default function BarcodeSettingsPage() {
    const [settings, setSettings] = useState<BarcodeSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    // Hardware Scanner Live Testing Console
    const [lastScannedCode, setLastScannedCode] = useState<string>('')
    const [scanLookupResult, setScanLookupResult] = useState<any>(null)
    const [scanLatency, setScanLatency] = useState<number | null>(null)
    const [isLookingUp, setIsLookingUp] = useState(false)

    useEffect(() => {
        getBarcodeSettings().then(res => {
            setSettings(res)
            setLoading(false)
        })
    }, [])

    // Hook to test hardware scanner gun on this page
    useBarcodeScanner({
        enabled: Boolean(settings?.enable_barcode_system),
        playAudioBeep: Boolean(settings?.scanner_sound_feedback),
        onScan: async (barcode) => {
            const startTime = performance.now()
            setLastScannedCode(barcode)
            setIsLookingUp(true)
            const result = await lookupItemByBarcode(barcode)
            setScanLatency(Math.round(performance.now() - startTime))
            setIsLookingUp(false)
            setScanLookupResult(result)
        }
    })

    const handleToggleBarcodeSystem = async (enabled: boolean) => {
        if (!settings) return
        setSaving(true)
        const updated = { ...settings, enable_barcode_system: enabled }
        const res = await updateBarcodeSettings(updated)
        setSaving(false)
        if (res.success) {
            setSettings(updated)
            setMsg({ 
                text: enabled ? 'Barcode & Hardware Scanner system enabled successfully!' : 'Barcode system disabled. Non-essential barcode fields hidden.', 
                type: 'success' 
            })
        } else {
            setMsg({ text: res.error || 'Failed to update settings', type: 'error' })
        }
    }

    const handleSelectBusinessType = async (bType: BusinessType) => {
        if (!settings) return
        setSaving(true)
        // If jewelry store selected, automatically enable barcode system and set dumbbell format
        const willEnable = bType === 'jewelry_retail' || bType === 'retail' || bType === 'wholesale'
            ? true 
            : (bType === 'services' ? false : settings.enable_barcode_system)

        const defaultLabel = bType === 'jewelry_retail' ? 'jewelry_dumbbell' : 'retail_50x25'

        const updated: BarcodeSettings = {
            ...settings,
            business_type: bType,
            enable_barcode_system: willEnable,
            default_label_format: defaultLabel,
            printer_settings: {
                ...settings.printer_settings,
                label_format: defaultLabel
            }
        }

        const res = await updateBarcodeSettings(updated)
        setSaving(false)
        if (res.success) {
            setSettings(updated)
            setMsg({ text: `Business profile updated to ${bType.replace('_', ' ').toUpperCase()}`, type: 'success' })
        } else {
            setMsg({ text: res.error || 'Failed to save', type: 'error' })
        }
    }

    const handleSavePrinterSettings = async (labelFmt: LabelPrinterFormat, receiptPaper: '58mm' | '80mm' | 'A4') => {
        if (!settings) return
        setSaving(true)
        const updated: BarcodeSettings = {
            ...settings,
            default_label_format: labelFmt,
            printer_settings: {
                ...settings.printer_settings,
                label_format: labelFmt,
                receipt_paper_size: receiptPaper
            }
        }
        const res = await updateBarcodeSettings(updated)
        setSaving(false)
        if (res.success) {
            setSettings(updated)
            setMsg({ text: 'Printer and label formats updated successfully!', type: 'success' })
        }
    }

    if (loading || !settings) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link 
                        href="/settings"
                        className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Barcode className="w-6 h-6 text-indigo-600" />
                            Barcode & Hardware Integration
                        </h1>
                        <p className="text-sm text-slate-500">Configure business type, label generator, USB/Bluetooth scanners, and thermal printers</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/inventory">
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                            <Tag className="w-3.5 h-3.5" />
                            Inventory Items
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Notification alert */}
            {msg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in ${
                    msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    <span>{msg.text}</span>
                </div>
            )}

            {/* Master Toggle Banner */}
            <Card className="border-indigo-100 shadow-sm overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-base">Barcode & Hardware Scanner Subsystem</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    settings.enable_barcode_system 
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                    {settings.enable_barcode_system ? 'Active & Ready' : 'Disabled'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 max-w-xl">
                                When enabled, items display unique barcode fields, POS invoices activate instant USB/Bluetooth scanner listeners, and label printing is unlocked.
                            </p>
                        </div>

                        <button
                            disabled={saving}
                            onClick={() => handleToggleBarcodeSystem(!settings.enable_barcode_system)}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.enable_barcode_system ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                        >
                            <span 
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    settings.enable_barcode_system ? 'translate-x-5' : 'translate-x-0'
                                }`} 
                            />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Business Profile Selection */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Store className="w-4 h-4 text-indigo-600" />
                            Business Profile & Industry Adaptation
                        </h2>
                        <p className="text-xs text-slate-500">
                            Select your industry to customize item forms, weights, making charges, and barcode label tags.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {BUSINESS_TYPES.map(bt => {
                            const isSelected = settings.business_type === bt.id
                            return (
                                <div
                                    key={bt.id}
                                    onClick={() => handleSelectBusinessType(bt.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xl">{bt.icon}</span>
                                        {isSelected && (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-bold text-slate-900 text-sm">{bt.name}</div>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{bt.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Hardware Scanner Live Testing Console */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Hardware Barcode Scanner Diagnostic Console
                            </h2>
                            <p className="text-xs text-slate-500">
                                Point your USB or wireless Bluetooth barcode reader anywhere on this screen and pull the trigger.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                                HID Listener Active
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 text-[11px]">
                            <span>SCANNER BUFFER STATUS</span>
                            <span>{scanLatency !== null ? `DECODE TIME: ${scanLatency}ms` : 'WAITING FOR TRIGGER...'}</span>
                        </div>

                        <div className="py-2 flex items-center justify-between">
                            <div>
                                <span className="text-slate-500 block text-[10px]">LAST CAPTURED BARCODE:</span>
                                <span className="text-emerald-400 text-sm font-bold tracking-widest">
                                    {lastScannedCode || '— (scan any barcode to test) —'}
                                </span>
                            </div>
                            {isLookingUp && (
                                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                            )}
                        </div>

                        {scanLookupResult && (
                            <div className="pt-2 border-t border-slate-800 text-[11px]">
                                {scanLookupResult.success ? (
                                    <div className="text-emerald-300 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span>Item Matched: <b>{scanLookupResult.item.name}</b> (Price: ₹{scanLookupResult.item.selling_price})</span>
                                    </div>
                                ) : (
                                    <div className="text-amber-300 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                        <span>{scanLookupResult.error}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Thermal & Label Printer Setup */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Printer className="w-4 h-4 text-indigo-600" />
                            Thermal Receipt & Label Printer Configuration
                        </h2>
                        <p className="text-xs text-slate-500">
                            Configure standard thermal label printers (Zebra, TSC, Citizen, Xprinter) and POS counter receipt rolls.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Default Label Format */}
                        <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                            <label className="font-semibold text-slate-800 block">Default Barcode Label Format</label>
                            <select
                                value={settings.default_label_format}
                                onChange={(e) => handleSavePrinterSettings(e.target.value as LabelPrinterFormat, settings.printer_settings.receipt_paper_size)}
                                className="w-full rounded-lg border-slate-300 text-xs py-2 px-2.5 bg-white shadow-xs focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="jewelry_dumbbell">💍 Jewelry Dumbbell Tag (38×25mm with wing flap)</option>
                                <option value="retail_50x25">🏷️ Standard Retail Sticker (50×25mm)</option>
                                <option value="retail_38x25">🏷️ Compact Retail Sticker (38×25mm)</option>
                                <option value="sheet_a4_24">📄 A4 Multi-up Sheet (24 labels per page)</option>
                                <option value="sheet_a4_48">📄 A4 Multi-up Sheet (48 labels per page)</option>
                            </select>
                            <p className="text-[11px] text-slate-500">Selected label layout when generating stickers from Inventory.</p>
                        </div>

                        {/* POS Receipt Paper Size */}
                        <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                            <label className="font-semibold text-slate-800 block">POS Counter Receipt Paper Size</label>
                            <select
                                value={settings.printer_settings.receipt_paper_size}
                                onChange={(e) => handleSavePrinterSettings(settings.default_label_format, e.target.value as any)}
                                className="w-full rounded-lg border-slate-300 text-xs py-2 px-2.5 bg-white shadow-xs focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="80mm">Standard 80mm (3-inch) Thermal Roll</option>
                                <option value="58mm">Compact 58mm (2-inch) Thermal Roll</option>
                                <option value="A4">Standard A4 / Letter Invoice Format</option>
                            </select>
                            <p className="text-[11px] text-slate-500">Paper width sent to the POS printer driver.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
