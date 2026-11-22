'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
    Barcode, 
    Printer, 
    ScanBarcode, 
    Search, 
    X, 
    Settings, 
    Sparkles, 
    Copy, 
    Check, 
    Download,
    ExternalLink,
    Tag,
    Layers,
    Volume2,
    RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { lookupItemByBarcode, getBarcodeSettings } from '@/lib/barcode-actions'
import { generateBarcodeDataUrl, generateUniqueBarcode } from '@/lib/barcode-utils'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { getBusinessProfile } from '@/lib/business-profile-actions'
import type { BarcodeSettings } from '@/lib/barcode-types'

export function BarcodeRightSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'lookup' | 'generate' | 'print'>('lookup')
    const [isVisibleForVertical, setIsVisibleForVertical] = useState(false)
    
    // Lookup state
    const [lookupCode, setLookupCode] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchResult, setSearchResult] = useState<any | null>(null)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [recentScans, setRecentScans] = useState<any[]>([])

    // Generator state
    const [genText, setGenText] = useState('')
    const [genPrefix, setGenPrefix] = useState('BB')
    const [copied, setCopied] = useState(false)

    // Settings
    const [settings, setSettings] = useState<BarcodeSettings | null>(null)

    useEffect(() => {
        getBusinessProfile().then(b => {
            const isNonBarcode = ['software_it', 'digital_marketing', 'freelancer', 'services', 'ca_accounting', 'tours_and_travels'].includes(b.businessType) || b.config?.features?.hasBarcodes === false
            setIsVisibleForVertical(!isNonBarcode)
        }).catch(() => {})
        getBarcodeSettings().then(setSettings).catch(() => {})
    }, [])

    // Global hardware scanner listener
    useBarcodeScanner({
        enabled: isOpen || true,
        onScan: async (scannedCode) => {
            if (!isOpen) setIsOpen(true)
            setActiveTab('lookup')
            setLookupCode(scannedCode)
            performLookup(scannedCode)
        }
    })

    const performLookup = async (code: string) => {
        if (!code.trim()) return
        setIsSearching(true)
        setSearchError(null)
        setSearchResult(null)

        try {
            const res = await lookupItemByBarcode(code.trim())
            if (res.success && res.item) {
                setSearchResult(res.item)
                setRecentScans(prev => {
                    const filtered = prev.filter(p => p.barcode !== res.item!.barcode)
                    return [res.item, ...filtered].slice(0, 5)
                })
            } else {
                setSearchError(res.error || `No product found for barcode: ${code}`)
            }
        } catch {
            setSearchError('Failed to lookup barcode. Please try again.')
        } finally {
            setIsSearching(false)
        }
    }

    const handleAutoGenerate = () => {
        const unique = generateUniqueBarcode(undefined, genPrefix || 'BB')
        setGenText(unique)
    }

    const copyToClipboard = () => {
        if (!genText) return
        navigator.clipboard.writeText(genText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadSvg = () => {
        if (!genText) return
        const dataUrl = generateBarcodeDataUrl(genText, { height: 60, showText: true })
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `barcode-${genText}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (!isVisibleForVertical) {
        return null
    }

    return (
        <>
            {/* Right edge floating trigger button */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:block">
                <button
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-2 rounded-l-xl shadow-xl transition-all hover:pr-3 cursor-pointer group border border-r-0 border-indigo-400/40"
                    title="Open Barcode Hub & Scanner"
                >
                    <Barcode className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold [writing-mode:vertical-rl] rotate-180 tracking-wider uppercase">
                        Barcodes
                    </span>
                </button>
            </div>

            {/* Slide-over Right Sidebar Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-over Right Sidebar Panel */}
            <aside 
                className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                aria-label="Barcode Right Sidebar"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Barcode className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                Barcode Hub
                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                                    LIVE
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-500">Universal Scan & Label Manager</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Link 
                            href="/settings/barcode" 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Barcode Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 p-1 m-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <button
                        type="button"
                        onClick={() => setActiveTab('lookup')}
                        className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            activeTab === 'lookup' 
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                                : 'hover:text-slate-900'
                        }`}
                    >
                        <ScanBarcode className="w-3.5 h-3.5" />
                        Scan & Find
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('generate')}
                        className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            activeTab === 'generate' 
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                                : 'hover:text-slate-900'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generator
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('print')}
                        className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            activeTab === 'print' 
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                                : 'hover:text-slate-900'
                        }`}
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Printing
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* TAB 1: SCAN & LOOKUP */}
                    {activeTab === 'lookup' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Scan with reader or enter barcode:
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={lookupCode}
                                            onChange={(e) => setLookupCode(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && performLookup(lookupCode)}
                                            placeholder="Scan or type barcode..."
                                            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => performLookup(lookupCode)}
                                        disabled={isSearching || !lookupCode.trim()}
                                        className="text-xs"
                                    >
                                        {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                    USB / Bluetooth scanner listener active
                                </p>
                            </div>

                            {/* Search Result */}
                            {searchResult && (
                                <Card className="border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20">
                                    <CardContent className="p-3.5 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{searchResult.name}</h4>
                                                <p className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                                                    Barcode: {searchResult.barcode}
                                                </p>
                                            </div>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                                ₹{searchResult.selling_price?.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600 dark:text-slate-300">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Stock Level</span>
                                                <span className="font-semibold">{searchResult.current_stock ?? '—'} {searchResult.unit || 'pcs'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Source</span>
                                                <span className="capitalize">{searchResult.source_table?.replace('_', ' ')}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex gap-2">
                                            <Link 
                                                href={`/invoices/new?barcode=${searchResult.barcode}`}
                                                className="flex-1"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Button size="sm" className="w-full text-xs gap-1">
                                                    + Add to Invoice
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {searchError && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                                    {searchError}
                                </div>
                            )}

                            {/* Recent Scans */}
                            {recentScans.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Lookups</h5>
                                    <div className="space-y-1.5">
                                        {recentScans.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setLookupCode(item.barcode)
                                                    setSearchResult(item)
                                                }}
                                                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors flex justify-between items-center text-xs"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[190px]">{item.name}</p>
                                                    <p className="font-mono text-[10px] text-slate-500">{item.barcode}</p>
                                                </div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{item.selling_price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: GENERATOR */}
                    {activeTab === 'generate' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Custom Prefix & Barcode Text:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={genPrefix}
                                        onChange={(e) => setGenPrefix(e.target.value.toUpperCase().slice(0, 4))}
                                        placeholder="BB"
                                        title="Barcode Prefix"
                                        className="w-16 px-2 py-2 text-xs font-mono font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={genText}
                                        onChange={(e) => setGenText(e.target.value)}
                                        placeholder="Enter SKU or number..."
                                        className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                                    />
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAutoGenerate}
                                        className="text-xs flex-1 gap-1"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                        Auto-Generate
                                    </Button>
                                </div>
                            </div>

                            {/* Live Barcode Render */}
                            {genText.trim() && (
                                <Card className="border-slate-200 dark:border-slate-800 text-center">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="bg-white p-3 rounded border border-slate-100 flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={generateBarcodeDataUrl(genText.trim(), { height: 60, showText: true })}
                                                alt={`Barcode ${genText}`}
                                                className="max-h-24 max-w-full"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copyToClipboard}
                                                className="flex-1 text-xs gap-1"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copied ? 'Copied!' : 'Copy Code'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={downloadSvg}
                                                className="flex-1 text-xs gap-1"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Download SVG
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* TAB 3: PRINTING & FORMATS */}
                    {activeTab === 'print' && (
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Thermal Label Templates:
                            </h5>

                            <div className="space-y-2 text-xs">
                                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">Retail Standard Sticker</span>
                                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">50 x 25 mm</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Universal sticker for supermarkets, apparel, electronics, and warehouse shelving.</p>
                                </div>

                                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">Jewelry Dumbbell / Butterfly Tag</span>
                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">68 x 12 mm</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Dumbbell ring wrap tags with Gross Wt, Net Wt, Purity (22K 916), and HUID hallmark numbers.</p>
                                </div>

                                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">A4 24-Up Sheet</span>
                                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">24 per page</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Standard laser/inkjet A4 adhesive sheets with 3 columns x 8 rows.</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link 
                                    href="/settings/barcode" 
                                    onClick={() => setIsOpen(false)}
                                    className="block"
                                >
                                    <Button variant="outline" className="w-full text-xs gap-1.5">
                                        <Settings className="w-3.5 h-3.5" />
                                        Configure Printer & Profiles
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer link */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                    <Link
                        href="/settings/barcode"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                        Open Full Barcode & Hardware Hub
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </aside>
        </>
    )
}
