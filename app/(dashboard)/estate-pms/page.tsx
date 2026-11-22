'use client'

import React, { useState } from 'react'
import {
    Hotel,
    Tent,
    Home,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    Shield,
    DollarSign,
    Sparkles,
    Search,
    Plus,
    Filter,
    Compass,
    FileText,
    Printer,
    QrCode,
    AlertCircle,
    Check,
    Waves,
    Trees,
    Flame,
    X,
    ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

interface Property {
    id: string
    name: string
    type: 'resort' | 'farmhouse' | 'campsite'
    location: string
    totalUnits: number
}

interface Unit {
    id: string
    propertyId: string
    code: string
    name: string
    category: 'villa_entire' | 'suite' | 'deluxe_room' | 'dome_tent' | 'safari_tent' | 'event_lawn'
    capacity: number
    baseRatePerNight: number
    cautionDeposit: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance'
    currentGuest?: {
        name: string
        phone: string
        checkIn: string
        checkOut: string
        guestsCount: number
        cautionDepositPaid: boolean
        waiverSigned: boolean
        rentedGear?: string[]
        totalBill: number
        paid: boolean
    }
}

interface GearItem {
    id: string
    name: string
    dailyRate: number
    deposit: number
    availableQty: number
    icon: string
}

export default function EstateAndCampsitePMSPage() {
    // Multi-Property State
    const [properties, setProperties] = useState<Property[]>([
        {
            id: 'prop-1',
            name: 'Whispering Palms Estate & Luxury Villas',
            type: 'resort',
            location: 'Lonavala Hills, Maharashtra',
            totalUnits: 6
        },
        {
            id: 'prop-2',
            name: 'Pine Woods Campground & Stargazing Domes',
            type: 'campsite',
            location: 'Pawna Lakefront, Maharashtra',
            totalUnits: 8
        },
        {
            id: 'prop-3',
            name: 'Heritage Farmhouse & Private Pool Retreat',
            type: 'farmhouse',
            location: 'Karjat Greens, Maharashtra',
            totalUnits: 3
        }
    ])

    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop-1')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Units inventory state
    const [units, setUnits] = useState<Unit[]>([
        // Property 1 (Resort & Villa)
        {
            id: 'u-101',
            propertyId: 'prop-1',
            code: 'VILLA-A',
            name: 'Royal Heritage 5BHK Villa (Private Pool)',
            category: 'villa_entire',
            capacity: 16,
            baseRatePerNight: 35000,
            cautionDeposit: 10000,
            status: 'occupied',
            currentGuest: {
                name: 'Vikramaditya Singhania',
                phone: '+91 98200 44551',
                checkIn: '2026-11-21',
                checkOut: '2026-11-23',
                guestsCount: 14,
                cautionDepositPaid: true,
                waiverSigned: true,
                totalBill: 70000,
                paid: true
            }
        },
        {
            id: 'u-102',
            propertyId: 'prop-1',
            code: 'SUITE-01',
            name: 'Presidential Valley View Suite',
            category: 'suite',
            capacity: 3,
            baseRatePerNight: 8500,
            cautionDeposit: 2000,
            status: 'available'
        },
        {
            id: 'u-103',
            propertyId: 'prop-1',
            code: 'SUITE-02',
            name: 'Orchid Executive Balcony Suite',
            category: 'suite',
            capacity: 3,
            baseRatePerNight: 7500,
            cautionDeposit: 2000,
            status: 'reserved',
            currentGuest: {
                name: 'Ananya Deshmukh',
                phone: '+91 97690 12345',
                checkIn: '2026-11-22',
                checkOut: '2026-11-24',
                guestsCount: 2,
                cautionDepositPaid: false,
                waiverSigned: true,
                totalBill: 15000,
                paid: false
            }
        },
        {
            id: 'u-104',
            propertyId: 'prop-1',
            code: 'LAWN-MAIN',
            name: 'Grand Palms Wedding & Event Lawn (800 Pax)',
            category: 'event_lawn',
            capacity: 800,
            baseRatePerNight: 75000,
            cautionDeposit: 25000,
            status: 'available'
        },
        {
            id: 'u-105',
            propertyId: 'prop-1',
            code: 'ROOM-201',
            name: 'Deluxe Garden Cottage Room',
            category: 'deluxe_room',
            capacity: 2,
            baseRatePerNight: 4500,
            cautionDeposit: 1000,
            status: 'cleaning'
        },

        // Property 2 (Pine Woods Campground)
        {
            id: 'u-201',
            propertyId: 'prop-2',
            code: 'DOME-ALPHA',
            name: 'Geodesic Lakefront Stargazer Dome (AC)',
            category: 'dome_tent',
            capacity: 4,
            baseRatePerNight: 6500,
            cautionDeposit: 2000,
            status: 'occupied',
            currentGuest: {
                name: 'Karan Mehra',
                phone: '+91 99870 55443',
                checkIn: '2026-11-22',
                checkOut: '2026-11-23',
                guestsCount: 2,
                cautionDepositPaid: true,
                waiverSigned: true,
                rentedGear: ['Tandem Kayak (1 hr)', 'Trekking Poles (Pair)'],
                totalBill: 8000,
                paid: true
            }
        },
        {
            id: 'u-202',
            propertyId: 'prop-2',
            code: 'DOME-BETA',
            name: 'Geodesic Pine Hill Stargazer Dome (AC)',
            category: 'dome_tent',
            capacity: 4,
            baseRatePerNight: 6500,
            cautionDeposit: 2000,
            status: 'available'
        },
        {
            id: 'u-203',
            propertyId: 'prop-2',
            code: 'CAMP-PITCH-1',
            name: 'Lakefront Alpine Safari Tent Pitch (4-Pax)',
            category: 'safari_tent',
            capacity: 4,
            baseRatePerNight: 3200,
            cautionDeposit: 1000,
            status: 'available'
        },
        {
            id: 'u-204',
            propertyId: 'prop-2',
            code: 'CAMP-PITCH-2',
            name: 'Forest Glamping Safari Tent (With Bonfire Pit)',
            category: 'safari_tent',
            capacity: 6,
            baseRatePerNight: 4500,
            cautionDeposit: 1000,
            status: 'reserved',
            currentGuest: {
                name: 'Rohan Joshi',
                phone: '+91 98210 99887',
                checkIn: '2026-11-22',
                checkOut: '2026-11-24',
                guestsCount: 5,
                cautionDepositPaid: true,
                waiverSigned: true,
                rentedGear: ['Barbecue Grill Kit', 'Subzero Sleeping Bag x2'],
                totalBill: 11500,
                paid: true
            }
        },

        // Property 3 (Karjat Farmhouse)
        {
            id: 'u-301',
            propertyId: 'prop-3',
            code: 'FARM-MAIN',
            name: 'Mango Orchard 4BHK Farmhouse (Full Buyout)',
            category: 'villa_entire',
            capacity: 20,
            baseRatePerNight: 28000,
            cautionDeposit: 8000,
            status: 'available'
        }
    ])

    // Campsite Gear Rentals
    const [gearItems] = useState<GearItem[]>([
        { id: 'g-1', name: 'Tandem Touring Kayak & Paddles', dailyRate: 1200, deposit: 2000, availableQty: 4, icon: '🛶' },
        { id: 'g-2', name: 'Premium Charcoal Barbecue Grill Kit', dailyRate: 800, deposit: 1000, availableQty: 6, icon: '🔥' },
        { id: 'g-3', name: 'Sub-Zero Thermal Sleeping Bag', dailyRate: 250, deposit: 500, availableQty: 18, icon: '🏕️' },
        { id: 'g-4', name: 'Night Stargazing Telescope (Refractor)', dailyRate: 900, deposit: 3000, availableQty: 2, icon: '🔭' },
        { id: 'g-5', name: 'Carbon Fiber Trekking Poles (Pair)', dailyRate: 200, deposit: 400, availableQty: 12, icon: '🥾' }
    ])

    // Modal / Drawer state for check-in & folio
    const [selectedUnitForAction, setSelectedUnitForAction] = useState<Unit | null>(null)
    const [actionType, setActionType] = useState<'checkin' | 'folio' | null>(null)

    // Check-in Form Inputs
    const [checkInName, setCheckInName] = useState('')
    const [checkInPhone, setCheckInPhone] = useState('')
    const [checkInNights, setCheckInNights] = useState(1)
    const [checkInGuests, setCheckInGuests] = useState(2)
    const [cautionCollected, setCautionCollected] = useState(true)
    const [waiverAgreed, setWaiverAgreed] = useState(true)
    const [selectedGear, setSelectedGear] = useState<string[]>([])

    // Active Property Object
    const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0]

    // Filter units
    const filteredUnits = units.filter(unit => {
        if (unit.propertyId !== selectedPropertyId) return false
        if (categoryFilter !== 'all' && unit.category !== categoryFilter) return false
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            return unit.name.toLowerCase().includes(q) || unit.code.toLowerCase().includes(q) || unit.currentGuest?.name.toLowerCase().includes(q)
        }
        return true
    })

    // Stats calculations
    const propertyUnits = units.filter(u => u.propertyId === selectedPropertyId)
    const occupiedUnits = propertyUnits.filter(u => u.status === 'occupied').length
    const occupancyRate = propertyUnits.length > 0 ? Math.round((occupiedUnits / propertyUnits.length) * 100) : 0
    const totalCautionHeld = propertyUnits.reduce((acc, u) => {
        if (u.status === 'occupied' && u.currentGuest?.cautionDepositPaid) {
            return acc + u.cautionDeposit
        }
        return acc
    }, 0)

    const handleOpenCheckIn = (unit: Unit) => {
        setSelectedUnitForAction(unit)
        setCheckInName('')
        setCheckInPhone('')
        setCheckInNights(1)
        setCheckInGuests(Math.min(2, unit.capacity))
        setCautionCollected(true)
        setWaiverAgreed(true)
        setSelectedGear([])
        setActionType('checkin')
    }

    const handleOpenFolio = (unit: Unit) => {
        setSelectedUnitForAction(unit)
        setActionType('folio')
    }

    const handleConfirmCheckIn = () => {
        if (!selectedUnitForAction || !checkInName.trim()) return

        const gearCost = selectedGear.reduce((sum, gName) => {
            const item = gearItems.find(g => g.name === gName)
            return sum + (item ? item.dailyRate * checkInNights : 0)
        }, 0)

        const totalTariff = (selectedUnitForAction.baseRatePerNight * checkInNights) + gearCost
        const gstAmount = Math.round(totalTariff * 0.12) // 12% GST on hospitality
        const finalBill = totalTariff + gstAmount

        const updatedUnits = units.map(u => {
            if (u.id === selectedUnitForAction.id) {
                return {
                    ...u,
                    status: 'occupied' as const,
                    currentGuest: {
                        name: checkInName,
                        phone: checkInPhone || '+91 98000 00000',
                        checkIn: new Date().toISOString().split('T')[0],
                        checkOut: new Date(Date.now() + checkInNights * 86400000).toISOString().split('T')[0],
                        guestsCount: checkInGuests,
                        cautionDepositPaid: cautionCollected,
                        waiverSigned: waiverAgreed,
                        rentedGear: selectedGear,
                        totalBill: finalBill,
                        paid: true
                    }
                }
            }
            return u
        })

        setUnits(updatedUnits)
        setActionType(null)
        setSelectedUnitForAction(null)
    }

    const handleCheckOut = (unitId: string) => {
        const updatedUnits = units.map(u => {
            if (u.id === unitId) {
                return {
                    ...u,
                    status: 'cleaning' as const,
                    currentGuest: undefined
                }
            }
            return u
        })
        setUnits(updatedUnits)
        setActionType(null)
        setSelectedUnitForAction(null)
    }

    const handleFinishCleaning = (unitId: string) => {
        const updatedUnits = units.map(u => {
            if (u.id === unitId) {
                return {
                    ...u,
                    status: 'available' as const
                }
            }
            return u
        })
        setUnits(updatedUnits)
    }

    const getStatusBadge = (status: Unit['status']) => {
        switch (status) {
            case 'available':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Open</span>
            case 'occupied':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Users className="w-3 h-3 mr-1" /> Occupied</span>
            case 'reserved':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Reserved</span>
            case 'cleaning':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Sparkles className="w-3 h-3 mr-1" /> Housekeeping</span>
            case 'maintenance':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200"><AlertCircle className="w-3 h-3 mr-1" /> Maintenance</span>
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header & Property Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                            {activeProperty.type === 'campsite' ? <Tent className="w-6 h-6" /> : <Hotel className="w-6 h-6" />}
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Estate & Campsite PMS</h1>
                            <p className="text-sm text-slate-500">
                                Multi-property estate occupancy, villa buyouts, campsite pitch allocation, and caution deposit tracking
                            </p>
                        </div>
                    </div>
                </div>

                {/* Property Dropdown Selector */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Active Property / Estate</label>
                        <select 
                            value={selectedPropertyId} 
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="mt-1 font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-emerald-500 text-sm"
                        >
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.location})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 uppercase">Total Units</span>
                            <Home className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{propertyUnits.length}</p>
                        <p className="text-xs text-slate-500 mt-1">{activeProperty.location}</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-emerald-700 uppercase">Live Occupancy</span>
                            <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-900 mt-2">{occupancyRate}%</p>
                        <p className="text-xs text-emerald-700 mt-1">{occupiedUnits} of {propertyUnits.length} Units Filled</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-700 uppercase">Caution Deposits Held</span>
                            <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-2">₹{totalCautionHeld.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-blue-700 mt-1">Refundable on checkout inspection</p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-purple-700 uppercase">Housekeeping / Turnover</span>
                            <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-900 mt-2">
                            {propertyUnits.filter(u => u.status === 'cleaning').length} Units
                        </p>
                        <p className="text-xs text-purple-700 mt-1">Linen prep & sanitization</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            categoryFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        All Units
                    </button>
                    <button
                        onClick={() => setCategoryFilter('villa_entire')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            categoryFilter === 'villa_entire' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        🏡 Entire Villas & Buyouts
                    </button>
                    <button
                        onClick={() => setCategoryFilter('suite')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            categoryFilter === 'suite' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        🏨 Suites & Rooms
                    </button>
                    <button
                        onClick={() => setCategoryFilter('dome_tent')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            categoryFilter === 'dome_tent' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        🏕️ Stargazer Domes & Pitches
                    </button>
                </div>

                <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <Input
                        placeholder="Search unit code or guest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-xs"
                    />
                </div>
            </div>

            {/* Units Availability Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUnits.map((unit) => (
                    <Card key={unit.id} className="border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                        {/* Top banner accent by status */}
                        <div className={`h-1.5 w-full ${
                            unit.status === 'available' ? 'bg-emerald-500' :
                            unit.status === 'occupied' ? 'bg-blue-600' :
                            unit.status === 'reserved' ? 'bg-amber-500' :
                            unit.status === 'cleaning' ? 'bg-purple-500' : 'bg-red-500'
                        }`} />

                        <CardContent className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border">
                                            {unit.code}
                                        </span>
                                        <h3 className="font-bold text-slate-900 mt-1.5 text-base">{unit.name}</h3>
                                    </div>
                                    {getStatusBadge(unit.status)}
                                </div>

                                <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-slate-400" /> Max {unit.capacity} Guests
                                    </span>
                                    <span>•</span>
                                    <span className="font-semibold text-slate-800">₹{unit.baseRatePerNight.toLocaleString('en-IN')}/night</span>
                                </div>

                                {/* Guest Card if Occupied / Reserved */}
                                {unit.currentGuest ? (
                                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-900">{unit.currentGuest.name}</span>
                                            <span className="text-slate-500">{unit.currentGuest.phone}</span>
                                        </div>
                                        <div className="text-slate-600 flex justify-between">
                                            <span>Stay: {unit.currentGuest.checkIn} to {unit.currentGuest.checkOut}</span>
                                            <span>{unit.currentGuest.guestsCount} Pax</span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                unit.currentGuest.cautionDepositPaid ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-700'
                                            }`}>
                                                Deposit: ₹{unit.cautionDeposit} {unit.currentGuest.cautionDepositPaid ? '✓' : 'Pending'}
                                            </span>
                                            {unit.currentGuest.waiverSigned && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                    Waiver: Signed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50/50 border border-dashed border-emerald-200 p-3.5 rounded-lg text-xs text-emerald-800 mb-4 flex items-center justify-between">
                                        <span>Ready for immediate check-in</span>
                                        <span className="text-emerald-700 font-semibold">Caution: ₹{unit.cautionDeposit}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t flex items-center gap-2">
                                {unit.status === 'available' && (
                                    <Button
                                        onClick={() => handleOpenCheckIn(unit)}
                                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Check-in Guest
                                    </Button>
                                )}

                                {unit.status === 'occupied' && (
                                    <>
                                        <Button
                                            onClick={() => handleOpenFolio(unit)}
                                            variant="outline"
                                            className="flex-1 text-xs h-8 border-slate-300"
                                        >
                                            <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" /> Folio
                                        </Button>
                                        <Button
                                            onClick={() => handleCheckOut(unit.id)}
                                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs h-8"
                                        >
                                            Check-out
                                        </Button>
                                    </>
                                )}

                                {unit.status === 'reserved' && (
                                    <Button
                                        onClick={() => handleOpenCheckIn(unit)}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                                    >
                                        Complete Intake & Check-in
                                    </Button>
                                )}

                                {unit.status === 'cleaning' && (
                                    <Button
                                        onClick={() => handleFinishCleaning(unit.id)}
                                        variant="outline"
                                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 text-xs h-8"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 mr-1" /> Mark Clean & Ready
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Campsite Adventure Gear Rental Depot (Shown if property has campsite or user toggles) */}
            {activeProperty.type === 'campsite' && (
                <div className="mt-8 border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Compass className="w-5 h-5 text-amber-600" /> Adventure Gear & Equipment Rental Station
                            </h2>
                            <p className="text-xs text-slate-500">
                                Kayaks, sleeping bags, BBQ pits, and telescopes with security deposit tracking
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {gearItems.map((gear) => (
                            <Card key={gear.id} className="border border-amber-100 bg-amber-50/30">
                                <CardContent className="p-4">
                                    <div className="text-2xl mb-1">{gear.icon}</div>
                                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{gear.name}</h4>
                                    <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                                        <div className="flex justify-between">
                                            <span>Rental:</span>
                                            <span className="font-semibold text-slate-800">₹{gear.dailyRate}/day</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Deposit:</span>
                                            <span>₹{gear.deposit}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                                            <span>In Stock:</span>
                                            <span>{gear.availableQty} units</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Check-In Modal Drawer */}
            {actionType === 'checkin' && selectedUnitForAction && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-start border-b pb-3">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Guest Intake & Check-in</h3>
                                <p className="text-xs text-slate-500">{selectedUnitForAction.name} ({selectedUnitForAction.code})</p>
                            </div>
                            <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-medium text-slate-700 block mb-1">Primary Guest Name</label>
                                <Input
                                    value={checkInName}
                                    onChange={(e) => setCheckInName(e.target.value)}
                                    placeholder="e.g. Vikram Malhotra"
                                    className="text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Mobile Phone (WhatsApp)</label>
                                    <Input
                                        value={checkInPhone}
                                        onChange={(e) => setCheckInPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Number of Nights</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={checkInNights}
                                        onChange={(e) => setCheckInNights(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Number of Guests</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={selectedUnitForAction.capacity}
                                        value={checkInGuests}
                                        onChange={(e) => setCheckInGuests(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1">Caution Deposit</label>
                                    <div className="flex items-center h-9 px-3 border rounded-md bg-slate-50 text-slate-700 font-semibold">
                                        ₹{selectedUnitForAction.cautionDeposit} (Refundable)
                                    </div>
                                </div>
                            </div>

                            {/* Campsite Gear Addons if campsite */}
                            {activeProperty.type === 'campsite' && (
                                <div>
                                    <label className="font-medium text-slate-700 block mb-1.5">Add Adventure Gear Rentals</label>
                                    <div className="space-y-1.5 max-h-28 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                                        {gearItems.map((gear) => (
                                            <label key={gear.id} className="flex items-center justify-between text-[11px] p-1 hover:bg-slate-100 rounded cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGear.includes(gear.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedGear([...selectedGear, gear.name])
                                                            else setSelectedGear(selectedGear.filter(g => g !== gear.name))
                                                        }}
                                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <span>{gear.icon} {gear.name}</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">₹{gear.dailyRate}/day</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Compliance toggles */}
                            <div className="space-y-2 pt-2 border-t">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cautionCollected}
                                        onChange={(e) => setCautionCollected(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700">Collect Caution Deposit of ₹{selectedUnitForAction.cautionDeposit} via UPI / Cash</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={waiverAgreed}
                                        onChange={(e) => setWaiverAgreed(e.target.checked)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-slate-700">Guest signed Digital Liability Waiver & House Rules</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t">
                            <Button variant="outline" onClick={() => setActionType(null)} className="text-xs">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmCheckIn} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                                Complete Intake & Check-in
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Folio View Modal */}
            {actionType === 'folio' && selectedUnitForAction?.currentGuest && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-start border-b pb-3">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Guest Folio & Settlement</h3>
                                <p className="text-xs text-slate-500">
                                    {selectedUnitForAction.name} • Folio #{selectedUnitForAction.code}-2026
                                </p>
                            </div>
                            <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Folio Breakdown */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Guest Name:</span>
                                <span className="font-semibold text-slate-900">{selectedUnitForAction.currentGuest.name}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Stay Dates:</span>
                                <span>{selectedUnitForAction.currentGuest.checkIn} to {selectedUnitForAction.currentGuest.checkOut}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 border-t pt-2">
                                <span>Accommodation Base Tariff:</span>
                                <span className="font-semibold">₹{(selectedUnitForAction.baseRatePerNight * 2).toLocaleString('en-IN')}</span>
                            </div>
                            {selectedUnitForAction.currentGuest.rentedGear && selectedUnitForAction.currentGuest.rentedGear.length > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Adventure Gear Rentals:</span>
                                    <span>{selectedUnitForAction.currentGuest.rentedGear.join(', ')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                                <span>GST (SAC 996311 @ 12%):</span>
                                <span>₹{Math.round(selectedUnitForAction.currentGuest.totalBill * 0.12).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-900 border-t pt-2">
                                <span>Total Folio Amount:</span>
                                <span>₹{selectedUnitForAction.currentGuest.totalBill.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-blue-700 font-semibold bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                                <span>Caution Deposit Status:</span>
                                <span>₹{selectedUnitForAction.cautionDeposit} (Refundable on Check-out)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="text-xs border-slate-300"
                            >
                                <Printer className="w-3.5 h-3.5 mr-1" /> Print Folio Receipt
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setActionType(null)}
                                    className="text-xs"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => handleCheckOut(selectedUnitForAction.id)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
                                >
                                    Settle & Check-out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
