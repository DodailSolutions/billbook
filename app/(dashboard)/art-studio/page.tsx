'use client'

import React, { useState } from 'react'
import {
    Palette,
    Award,
    Layers,
    DollarSign,
    Clock,
    Sparkles,
    Printer,
    QrCode,
    CheckCircle2,
    Plus,
    Trash2,
    Share2,
    ShieldCheck,
    FileText,
    Image as ImageIcon,
    Sliders,
    Percent,
    Scissors,
    Stamp,
    Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

interface RawMaterial {
    id: string
    name: string
    quantity: number
    unit: string
    unitCost: number
}

interface ArtworkProject {
    id: string
    title: string
    artistName: string
    category: 'oil_acrylic' | 'resin_epoxy' | 'ceramics_pottery' | 'handmade_craft' | 'sculpture'
    medium: string
    substrate: string
    dimensions: string
    completionDate: string
    edition: string
    certificateId: string
    materials: RawMaterial[]
    craftingHours: number
    hourlyLaborRate: number
    overheadPercentage: number
    targetMargin: number
    galleryCommissionRate: number
    // Commission Advance tracking
    clientName?: string
    advanceDepositPaid: boolean
    commissionTotal: number
}

export default function ArtStudioBOMAndCOAPage() {
    const [activeTab, setActiveTab] = useState<'bom' | 'coa' | 'commissions'>('bom')

    // Initial art projects
    const [projects, setProjects] = useState<ArtworkProject[]>([
        {
            id: 'art-1',
            title: 'Monsoon Echoes (Canvas Original)',
            artistName: 'Aarav Varma',
            category: 'oil_acrylic',
            medium: 'Heavy-body Acrylic & Gold Leaf on Linen',
            substrate: '100% Belgian Linen Stretched Canvas',
            dimensions: '36" x 48" x 1.5"',
            completionDate: '2026-11-20',
            edition: 'Original 1 of 1',
            certificateId: 'COA-2026-VARMA-8841',
            materials: [
                { id: 'm-1', name: 'Belgian Linen Heavy Stretched Canvas 36x48', quantity: 1, unit: 'pc', unitCost: 4500 },
                { id: 'm-2', name: 'Golden Heavy Body Acrylics (Ultramarine, Sienna, Umber)', quantity: 6, unit: 'tubes (150ml)', unitCost: 750 },
                { id: 'm-3', name: '24K Italian Gold Leaf Sheets & Size', quantity: 12, unit: 'sheets', unitCost: 150 },
                { id: 'm-4', name: 'Archival Isolation Coat & Satin Varnish (UVLS)', quantity: 250, unit: 'ml', unitCost: 12 },
                { id: 'm-5', name: 'Custom Teakwood Floater Frame & D-Rings', quantity: 1, unit: 'frame', unitCost: 3800 }
            ],
            craftingHours: 24,
            hourlyLaborRate: 800,
            overheadPercentage: 15, // 15% studio rent, electricity, brushes
            targetMargin: 65, // 65% markup
            galleryCommissionRate: 40, // 40% gallery cut if sold via exhibition
            clientName: 'Dr. Sunita Rao (Private Collector)',
            advanceDepositPaid: true,
            commissionTotal: 75000
        },
        {
            id: 'art-2',
            title: 'Bioluminescent Ocean River Table',
            artistName: 'Meera Nambiar',
            category: 'resin_epoxy',
            medium: 'Live-Edge Walnut Wood & Deep-Pour Epoxy Resin',
            substrate: 'Kiln-Dried American Walnut Slab',
            dimensions: '48" x 24" x 2"',
            completionDate: '2026-11-18',
            edition: 'Limited Bespoke 1 of 3',
            certificateId: 'COA-2026-NAMBIAR-5519',
            materials: [
                { id: 'm-201', name: 'Live Edge Kiln-Dried Walnut Wood Slab', quantity: 1, unit: 'slab', unitCost: 14000 },
                { id: 'm-202', name: 'Crystal Clear Deep-Pour Epoxy Resin & Hardener', quantity: 12, unit: 'liters', unitCost: 950 },
                { id: 'm-203', name: 'Metallic Mica Pigments (Azure, Teal, Pearl)', quantity: 4, unit: 'jars', unitCost: 350 },
                { id: 'm-204', name: 'Ceramic Top Coating & High-Grit Polish', quantity: 1, unit: 'bottle', unitCost: 1800 },
                { id: 'm-205', name: 'Powder-Coated Steel Trapezoid Base Legs', quantity: 1, unit: 'set', unitCost: 4500 }
            ],
            craftingHours: 32,
            hourlyLaborRate: 650,
            overheadPercentage: 20,
            targetMargin: 60,
            galleryCommissionRate: 30,
            clientName: 'The Bohemian Bistro',
            advanceDepositPaid: true,
            commissionTotal: 98000
        }
    ])

    const [selectedProjectId, setSelectedProjectId] = useState<string>('art-1')
    const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0]

    // Form states for adding raw materials
    const [newMaterialName, setNewMaterialName] = useState('')
    const [newMaterialQty, setNewMaterialQty] = useState(1)
    const [newMaterialUnit, setNewMaterialUnit] = useState('pcs')
    const [newMaterialUnitCost, setNewMaterialUnitCost] = useState(0)

    // Cost calculations for active project
    const totalMaterialsCost = activeProject.materials.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)
    const totalLaborCost = activeProject.craftingHours * activeProject.hourlyLaborRate
    const directCost = totalMaterialsCost + totalLaborCost
    const studioOverheadCost = Math.round(directCost * (activeProject.overheadPercentage / 100))
    const trueCOGS = directCost + studioOverheadCost

    // Selling price calculations
    const recommendedRetailPrice = Math.round(trueCOGS / (1 - (activeProject.targetMargin / 100)))
    const gallerySplitGross = Math.round(recommendedRetailPrice * (1 + (activeProject.galleryCommissionRate / 100)))
    const artistNetShare = Math.round(gallerySplitGross * (1 - (activeProject.galleryCommissionRate / 100)))
    const netProfit = recommendedRetailPrice - trueCOGS

    const handleAddMaterial = () => {
        if (!newMaterialName.trim() || newMaterialUnitCost <= 0) return

        const newMat: RawMaterial = {
            id: `m-${Date.now()}`,
            name: newMaterialName,
            quantity: Number(newMaterialQty) || 1,
            unit: newMaterialUnit,
            unitCost: Number(newMaterialUnitCost) || 0
        }

        const updated = projects.map(p => {
            if (p.id === activeProject.id) {
                return {
                    ...p,
                    materials: [...p.materials, newMat]
                }
            }
            return p
        })

        setProjects(updated)
        setNewMaterialName('')
        setNewMaterialQty(1)
        setNewMaterialUnitCost(0)
    }

    const handleDeleteMaterial = (materialId: string) => {
        const updated = projects.map(p => {
            if (p.id === activeProject.id) {
                return {
                    ...p,
                    materials: p.materials.filter(m => m.id !== materialId)
                }
            }
            return p
        })
        setProjects(updated)
    }

    const handleUpdateActiveProject = (field: keyof ArtworkProject, value: any) => {
        const updated = projects.map(p => {
            if (p.id === activeProject.id) {
                return { ...p, [field]: value }
            }
            return p
        })
        setProjects(updated)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-pink-100 text-pink-700 rounded-xl">
                        <Palette className="w-6 h-6" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Art Studio & Artisan Hub</h1>
                        <p className="text-sm text-slate-500">
                            Raw material BOM recipe costing, true COGS margins, and museum-grade Certificates of Authenticity
                        </p>
                    </div>
                </div>

                {/* Project Selector */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Active Artwork / Piece</label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="mt-1 font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm text-sm"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.edition})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b">
                <button
                    onClick={() => setActiveTab('bom')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'bom'
                            ? 'border-pink-600 text-pink-700 bg-pink-50/50'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Layers className="w-4 h-4" /> Studio BOM & Recipe Costing
                </button>
                <button
                    onClick={() => setActiveTab('coa')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'coa'
                            ? 'border-pink-600 text-pink-700 bg-pink-50/50'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Award className="w-4 h-4" /> Certificate of Authenticity (COA)
                </button>
                <button
                    onClick={() => setActiveTab('commissions')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'commissions'
                            ? 'border-pink-600 text-pink-700 bg-pink-50/50'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" /> 50% Commission Advance Contracts
                </button>
            </div>

            {/* TAB 1: Studio BOM & Recipe Costing */}
            {activeTab === 'bom' && (
                <div className="space-y-6">
                    {/* Cost Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-4">
                                <span className="text-xs font-medium text-slate-500 uppercase">Direct Raw Materials</span>
                                <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalMaterialsCost.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-slate-500 mt-1">{activeProject.materials.length} raw ingredients listed</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-50 border-amber-200">
                            <CardContent className="p-4">
                                <span className="text-xs font-medium text-amber-700 uppercase">Artisan Labor</span>
                                <p className="text-2xl font-bold text-amber-900 mt-1">₹{totalLaborCost.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-amber-700 mt-1">{activeProject.craftingHours} hrs @ ₹{activeProject.hourlyLaborRate}/hr</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="p-4">
                                <span className="text-xs font-medium text-purple-700 uppercase">True COGS (With Overhead)</span>
                                <p className="text-2xl font-bold text-purple-900 mt-1">₹{trueCOGS.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-purple-700 mt-1">Includes {activeProject.overheadPercentage}% studio factor</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-emerald-50 border-emerald-200">
                            <CardContent className="p-4">
                                <span className="text-xs font-medium text-emerald-700 uppercase">Suggested Selling Price (MRP)</span>
                                <p className="text-2xl font-bold text-emerald-900 mt-1">₹{recommendedRetailPrice.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-emerald-700 mt-1">Net Margin: {activeProject.targetMargin}% (₹{netProfit.toLocaleString('en-IN')})</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Layout: BOM Ingredients Table & Margin Sliders */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* BOM Table (2 Cols) */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-pink-600" /> Bill of Materials (BOM) Recipe Breakdown
                                    </h3>
                                    <span className="text-xs text-slate-500 font-mono">SKU: {activeProject.certificateId}</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 text-slate-600 border-b">
                                            <tr>
                                                <th className="py-2.5 px-3 font-semibold">Material / Substrate / Medium</th>
                                                <th className="py-2.5 px-3 font-semibold text-center">Quantity</th>
                                                <th className="py-2.5 px-3 font-semibold text-right">Unit Rate (₹)</th>
                                                <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                                                <th className="py-2.5 px-2 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {activeProject.materials.map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50">
                                                    <td className="py-2.5 px-3 font-medium text-slate-900">{m.name}</td>
                                                    <td className="py-2.5 px-3 text-center text-slate-600">{m.quantity} {m.unit}</td>
                                                    <td className="py-2.5 px-3 text-right text-slate-600">₹{m.unitCost.toLocaleString('en-IN')}</td>
                                                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                                                        ₹{(m.quantity * m.unitCost).toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="py-2.5 px-2 text-center">
                                                        <button
                                                            onClick={() => handleDeleteMaterial(m.id)}
                                                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add New Material Row */}
                                <div className="mt-4 pt-3 border-t bg-slate-50/50 p-3 rounded-lg space-y-2">
                                    <span className="text-xs font-semibold text-slate-700 block">Add Raw Material to Recipe</span>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                        <div className="md:col-span-2">
                                            <Input
                                                placeholder="Material name (e.g. Resin, Gold Leaf)"
                                                value={newMaterialName}
                                                onChange={(e) => setNewMaterialName(e.target.value)}
                                                className="text-xs h-8"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Qty"
                                                value={newMaterialQty}
                                                onChange={(e) => setNewMaterialQty(parseFloat(e.target.value) || 1)}
                                                className="text-xs h-8"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                placeholder="Cost per unit (₹)"
                                                value={newMaterialUnitCost || ''}
                                                onChange={(e) => setNewMaterialUnitCost(parseFloat(e.target.value) || 0)}
                                                className="text-xs h-8"
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                onClick={handleAddMaterial}
                                                className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs h-8"
                                            >
                                                <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing, Labor & Margin Controls (1 Col) */}
                        <div className="space-y-4">
                            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4 text-xs">
                                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <Sliders className="w-4 h-4 text-purple-600" /> Labor & Margin Modifiers
                                </h3>

                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">
                                        Dedicated Crafting Time ({activeProject.craftingHours} Hours)
                                    </label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={100}
                                        value={activeProject.craftingHours}
                                        onChange={(e) => handleUpdateActiveProject('craftingHours', parseInt(e.target.value))}
                                        className="w-full accent-pink-600"
                                    />
                                </div>

                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">
                                        Artist Hourly Rate (₹/hour)
                                    </label>
                                    <Input
                                        type="number"
                                        value={activeProject.hourlyLaborRate}
                                        onChange={(e) => handleUpdateActiveProject('hourlyLaborRate', parseInt(e.target.value) || 0)}
                                        className="text-xs h-8"
                                    />
                                </div>

                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">
                                        Studio Overhead Factor ({activeProject.overheadPercentage}%)
                                    </label>
                                    <span className="text-[11px] text-slate-500 block mb-1">Covers kiln firing, studio electricity, tools wear</span>
                                    <input
                                        type="range"
                                        min={5}
                                        max={40}
                                        value={activeProject.overheadPercentage}
                                        onChange={(e) => handleUpdateActiveProject('overheadPercentage', parseInt(e.target.value))}
                                        className="w-full accent-purple-600"
                                    />
                                </div>

                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">
                                        Target Profit Margin ({activeProject.targetMargin}%)
                                    </label>
                                    <input
                                        type="range"
                                        min={20}
                                        max={85}
                                        value={activeProject.targetMargin}
                                        onChange={(e) => handleUpdateActiveProject('targetMargin', parseInt(e.target.value))}
                                        className="w-full accent-emerald-600"
                                    />
                                </div>

                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex justify-between font-medium text-slate-700">
                                        <span>Direct Production Cost:</span>
                                        <span>₹{directCost.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-sm text-slate-900">
                                        <span>Recommended Studio MRP:</span>
                                        <span className="text-emerald-700">₹{recommendedRetailPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Certificate of Authenticity (COA) */}
            {activeTab === 'coa' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Archival Certificate of Authenticity Generator</h2>
                            <p className="text-xs text-slate-500">
                                Museum-grade printable certificate with cryptographic provenance ID and QR verification
                            </p>
                        </div>
                        <Button
                            onClick={() => window.print()}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9"
                        >
                            <Printer className="w-4 h-4 mr-1.5" /> Print Official Certificate (A4 Framing)
                        </Button>
                    </div>

                    {/* High-End Printable COA Canvas */}
                    <div className="bg-amber-50/20 p-8 rounded-2xl border-2 border-slate-300 max-w-3xl mx-auto shadow-lg relative print:m-0 print:border-none print:shadow-none print:p-6">
                        {/* Ornamental Inner Border */}
                        <div className="border-4 border-double border-amber-900/60 p-8 rounded-xl bg-white space-y-6 text-center relative">
                            {/* Watermark / Corner flourishes */}
                            <div className="absolute top-3 left-3 text-amber-900/40 text-xs font-serif font-bold">★ ★ ★</div>
                            <div className="absolute top-3 right-3 text-amber-900/40 text-xs font-serif font-bold">★ ★ ★</div>
                            <div className="absolute bottom-3 left-3 text-amber-900/40 text-xs font-serif font-bold">★ ★ ★</div>
                            <div className="absolute bottom-3 right-3 text-amber-900/40 text-xs font-serif font-bold">★ ★ ★</div>

                            {/* Header Seal */}
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="w-14 h-14 rounded-full border-2 border-amber-800/80 flex items-center justify-center bg-amber-50 text-amber-900 shadow-inner">
                                    <Stamp className="w-7 h-7" />
                                </div>
                                <h2 className="font-serif text-2xl font-bold tracking-widest text-slate-900 uppercase pt-2">
                                    Certificate of Authenticity
                                </h2>
                                <p className="text-xs tracking-wider text-amber-900 font-serif italic">
                                    Official Archival Fine Art Provenance Document
                                </p>
                            </div>

                            {/* Declaration */}
                            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed italic">
                                This certifies that the original artwork cataloged below is an authentic, one-of-a-kind creation conceived, crafted, and signed by the artist using museum-quality archival materials.
                            </p>

                            {/* Artwork Details Grid */}
                            <div className="border-t border-b border-amber-900/30 py-5 my-4 grid grid-cols-2 gap-y-3.5 gap-x-6 text-left text-xs max-w-xl mx-auto">
                                <div>
                                    <span className="font-serif uppercase text-[10px] text-slate-500 tracking-wider block">Artwork Title</span>
                                    <span className="font-bold text-slate-900 text-sm">{activeProject.title}</span>
                                </div>
                                <div>
                                    <span className="font-serif uppercase text-[10px] text-slate-500 tracking-wider block">Master Artist</span>
                                    <span className="font-bold text-slate-900 text-sm">{activeProject.artistName}</span>
                                </div>
                                <div>
                                    <span className="font-serif uppercase text-[10px] text-slate-500 tracking-wider block">Medium & Technique</span>
                                    <span className="text-slate-800 font-medium">{activeProject.medium}</span>
                                </div>
                                <div>
                                    <span className="font-serif uppercase text-[10px] text-slate-500 tracking-wider block">Substrate / Canvas</span>
                                    <span className="text-slate-800 font-medium">{activeProject.substrate}</span>
                                </div>
                                <div>
                                    <span className="font-serif uppercase text-[10px] text-slate-500 tracking-wider block">Dimensions</span>
                                    <span className="text-slate-800 font-medium">{activeProject.dimensions}</span>
                                </div>
                                <div>
                                    <span className="font-serif uppercase text-[10px] text-slate-500 tracking-wider block">Edition Status</span>
                                    <span className="font-bold text-emerald-800">{activeProject.edition}</span>
                                </div>
                            </div>

                            {/* Verification Footer & Sign-off Block */}
                            <div className="pt-4 flex items-end justify-between max-w-xl mx-auto text-left">
                                {/* QR Code & Hash */}
                                <div className="space-y-1">
                                    <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 inline-block shadow-sm">
                                        <QrCode className="w-14 h-14 text-slate-900" />
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500">
                                        {activeProject.certificateId}
                                    </div>
                                    <div className="text-[9px] text-slate-400">Scan to verify provenance on BillBook</div>
                                </div>

                                {/* Artist Signature Line */}
                                <div className="text-center space-y-1">
                                    <div className="font-serif italic text-lg text-slate-800 border-b border-slate-400 pb-1 px-8 min-w-[200px]">
                                        {activeProject.artistName}
                                    </div>
                                    <span className="text-[10px] uppercase font-serif tracking-widest text-slate-500 block">
                                        Artist / Master Artisan Signature
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">Date: {activeProject.completionDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: 50% Commission Advance Contracts */}
            {activeTab === 'commissions' && (
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Bespoke Commission 50% Advance Settlement</h2>
                            <p className="text-xs text-slate-500">
                                Protect studio cash flow with strict 50% advance booking contracts before starting custom canvas or woodwork pieces
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {projects.map((p) => {
                                const advanceAmount = Math.round(p.commissionTotal * 0.5)
                                const balanceAmount = p.commissionTotal - advanceAmount

                                return (
                                    <Card key={p.id} className="border shadow-sm p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-bold text-pink-600 uppercase">{p.category.replace('_', ' ')}</span>
                                                <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                                                <p className="text-xs text-slate-500">Client: {p.clientName || 'Private Commission'}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                p.advanceDepositPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {p.advanceDepositPaid ? 'Advance Received' : 'Advance Pending'}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Total Agreed Contract:</span>
                                                <span className="font-bold text-slate-900">₹{p.commissionTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-700 font-semibold">
                                                <span>50% Advance Booking Deposit:</span>
                                                <span>₹{advanceAmount.toLocaleString('en-IN')} (Paid)</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>Final Balance (Upon Pre-Dispatch Approval):</span>
                                                <span>₹{balanceAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    const message = `Hi ${p.clientName || 'Collector'}, your custom artwork "${p.title}" is progressing well in the studio! As per our agreement, your 50% booking deposit of ₹${advanceAmount.toLocaleString('en-IN')} is acknowledged. We will share the WIP preview shortly!`
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
                                                }}
                                                className="w-full text-xs h-8 border-slate-300"
                                            >
                                                <Share2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Send Progress Update on WhatsApp
                                            </Button>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
