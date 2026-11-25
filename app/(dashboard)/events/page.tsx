'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  PartyPopper,
  MapPin,
  CalendarDays,
  Users2,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Receipt,
  TrendingUp,
  Wallet,
  ClipboardList,
  UserCheck,
  Sparkles,
  FileText,
  IndianRupee,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

type TdsSection = 'none' | '194C_1' | '194C_2' | '194J_10'

interface VendorCostItem {
  id: string
  vendorName: string
  category: 'Venue & Catering' | 'AV & Production' | 'Decor & Floral' | 'Artist & Talent' | 'Logistics & Sub-Rental'
  grossAmount: number
  tdsSection: TdsSection
  paid: boolean
}

interface MilestoneTranche {
  id: string
  label: string
  percentage: number
  dueLabel: string
  status: 'pending' | 'invoiced' | 'collected'
}

interface BeoTimelineItem {
  id: string
  time: string
  activity: string
  owner: string
  notes: string
}

interface CrewMember {
  id: string
  name: string
  role: string
  callTime: string
  dayRate: number
  confirmed: boolean
}

interface EventProject {
  id: string
  name: string
  clientName: string
  venue: string
  startDate: string
  endDate: string
  pax: number
  quotedRevenue: number
  vendors: VendorCostItem[]
  milestones: MilestoneTranche[]
  beoTimeline: BeoTimelineItem[]
  checklist: { id: string; label: string; done: boolean }[]
  crew: CrewMember[]
}

const TDS_RATES: Record<TdsSection, { label: string; rate: number }> = {
  none: { label: 'No TDS (0%)', rate: 0 },
  '194C_1': { label: '194C Individual (1%)', rate: 0.01 },
  '194C_2': { label: '194C Company (2%)', rate: 0.02 },
  '194J_10': { label: '194J Artist / Pro (10%)', rate: 0.10 },
}

const INITIAL_EVENTS: EventProject[] = [
  {
    id: 'evt-1',
    name: 'Annual Corporate MICE Gala 2026',
    clientName: 'Apex Tech Solutions Pvt Ltd',
    venue: 'Grand Ballroom, Taj Palace, New Delhi',
    startDate: '2026-12-18',
    endDate: '2026-12-19',
    pax: 350,
    quotedRevenue: 1850000,
    vendors: [
      { id: 'v-1', vendorName: 'Taj Banquet & F&B', category: 'Venue & Catering', grossAmount: 680000, tdsSection: '194C_2', paid: true },
      { id: 'v-2', vendorName: 'Pulse Pro AV & LED Wall (Sub-Rental)', category: 'AV & Production', grossAmount: 245000, tdsSection: '194C_2', paid: false },
      { id: 'v-3', vendorName: 'DJ Kabir & Live Fusion Band', category: 'Artist & Talent', grossAmount: 180000, tdsSection: '194J_10', paid: false },
      { id: 'v-4', vendorName: 'BloomStage Floral & Fabrication', category: 'Decor & Floral', grossAmount: 165000, tdsSection: '194C_1', paid: true },
    ],
    milestones: [
      { id: 'm-1', label: 'Booking Advance', percentage: 20, dueLabel: 'On Contract Sign', status: 'collected' },
      { id: 'm-2', label: 'Pre-Event Vendor Lock', percentage: 50, dueLabel: 'T-7 Days (Dec 11)', status: 'invoiced' },
      { id: 'm-3', label: 'Post-Event Settlement', percentage: 30, dueLabel: 'Event + 3 Days', status: 'pending' },
    ],
    beoTimeline: [
      { id: 't-1', time: '09:00 AM', activity: 'Hall Handover, Stage Rigging & LED Wall Load-In', owner: 'Production Lead', notes: '3-phase power check at main console' },
      { id: 't-2', time: '02:00 PM', activity: 'Soundcheck & Artist Tech Rehearsal', owner: 'AV Lead', notes: 'Wireless mic frequencies locked' },
      { id: 't-3', time: '06:30 PM', activity: 'Registration Desk & VIP QR Check-In Open', owner: 'Hospitality Crew', notes: 'Welcome drinks at foyer' },
      { id: 't-4', time: '08:00 PM', activity: 'Keynote, Awards & Gala Dinner Service', owner: 'Show Caller', notes: '350 pax plated + buffet backup' },
    ],
    checklist: [
      { id: 'c-1', label: 'Venue Fire & Sound NOC Verified', done: true },
      { id: 'c-2', label: 'Sub-Rental LED Wall & Truss Delivered', done: true },
      { id: 'c-3', label: 'Artist Green Room & Rider Confirmed', done: false },
      { id: 'c-4', label: 'VIP Badge & Seating Chart Finalized', done: false },
    ],
    crew: [
      { id: 'cr-1', name: 'Rohan Malhotra', role: 'Show Caller / Stage Director', callTime: '08:30 AM', dayRate: 8500, confirmed: true },
      { id: 'cr-2', name: 'Ananya Verma', role: 'VIP Hospitality & Registration Lead', callTime: '04:00 PM', dayRate: 4500, confirmed: true },
      { id: 'cr-3', name: 'Vikram Singh', role: 'FOH Sound & Lighting Engineer', callTime: '09:30 AM', dayRate: 6000, confirmed: false },
    ],
  },
  {
    id: 'evt-2',
    name: 'Mehta-Kapoor Destination Wedding',
    clientName: 'Rajesh Mehta',
    venue: 'Rambagh Courtyard, Jaipur',
    startDate: '2027-01-14',
    endDate: '2027-01-16',
    pax: 500,
    quotedRevenue: 3200000,
    vendors: [
      { id: 'v-5', vendorName: 'Jaipur Royal Caterers', category: 'Venue & Catering', grossAmount: 1250000, tdsSection: '194C_2', paid: true },
      { id: 'v-6', vendorName: 'Marigold Mandap & Lighting', category: 'Decor & Floral', grossAmount: 640000, tdsSection: '194C_1', paid: false },
    ],
    milestones: [
      { id: 'm-4', label: 'Booking Deposit', percentage: 25, dueLabel: 'Confirmed', status: 'collected' },
      { id: 'm-5', label: 'Venue & Production Lock', percentage: 35, dueLabel: 'Dec 20', status: 'pending' },
      { id: 'm-6', label: 'Event Day Readiness', percentage: 30, dueLabel: 'Jan 10', status: 'pending' },
      { id: 'm-7', label: 'Post-Event Closure', percentage: 10, dueLabel: 'Jan 20', status: 'pending' },
    ],
    beoTimeline: [
      { id: 't-5', time: '10:00 AM', activity: 'Mandap Structure & Floral Installation', owner: 'Decor Lead', notes: 'Fresh marigold & jasmine delivery' },
      { id: 't-6', time: '05:00 PM', activity: 'Baraat Logistics & Dhol Crew Assembly', owner: 'Logistics Lead', notes: 'Vintage car + valet coordination' },
    ],
    checklist: [
      { id: 'c-5', label: 'Airport Transfers & Rooming List Sent', done: true },
      { id: 'c-6', label: 'Generator Backup 125kVA Tested', done: false },
    ],
    crew: [
      { id: 'cr-4', name: 'Neha Sharma', role: 'Bride & Groom Shadow', callTime: '07:00 AM', dayRate: 5500, confirmed: true },
    ],
  },
]

const formatINR = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

export default function EventCommandCenterPage() {
  const [events, setEvents] = useState<EventProject[]>(INITIAL_EVENTS)
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENTS[0].id)
  const [activeTab, setActiveTab] = useState<'pnl' | 'beo' | 'milestones' | 'crew'>('pnl')
  const [showNewEventModal, setShowNewEventModal] = useState(false)

  // New Event Form
  const [newEvtName, setNewEvtName] = useState('')
  const [newEvtClient, setNewEvtClient] = useState('')
  const [newEvtVenue, setNewEvtVenue] = useState('')
  const [newEvtStart, setNewEvtStart] = useState('')
  const [newEvtEnd, setNewEvtEnd] = useState('')
  const [newEvtPax, setNewEvtPax] = useState('200')
  const [newEvtBudget, setNewEvtBudget] = useState('500000')

  // New Vendor Payout Form
  const [vendorName, setVendorName] = useState('')
  const [vendorCat, setVendorCat] = useState<VendorCostItem['category']>('AV & Production')
  const [vendorGross, setVendorGross] = useState('')
  const [vendorTds, setVendorTds] = useState<TdsSection>('194C_2')

  // New BEO Timeline Row
  const [beoTime, setBeoTime] = useState('')
  const [beoActivity, setBeoActivity] = useState('')
  const [beoOwner, setBeoOwner] = useState('')
  const [beoNotes, setBeoNotes] = useState('')

  // New Crew Row
  const [crewName, setCrewName] = useState('')
  const [crewRole, setCrewRole] = useState('')
  const [crewCallTime, setCrewCallTime] = useState('09:00 AM')
  const [crewRate, setCrewRate] = useState('3500')

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0]

  const updateSelectedEvent = (updater: (evt: EventProject) => EventProject) => {
    setEvents(prev => prev.map(e => (e.id === selectedEvent.id ? updater(e) : e)))
  }

  // Cost-center P&L calculations
  const totalVendorGross = selectedEvent.vendors.reduce((sum, v) => sum + v.grossAmount, 0)
  const totalTdsPayable = selectedEvent.vendors.reduce(
    (sum, v) => sum + v.grossAmount * TDS_RATES[v.tdsSection].rate,
    0
  )
  const totalCrewCost = selectedEvent.crew.reduce((sum, c) => sum + c.dayRate, 0)
  const totalCost = totalVendorGross + totalCrewCost
  const netProfit = selectedEvent.quotedRevenue - totalCost
  const marginPct = selectedEvent.quotedRevenue > 0 ? (netProfit / selectedEvent.quotedRevenue) * 100 : 0
  const collectedAmount = selectedEvent.milestones
    .filter(m => m.status === 'collected')
    .reduce((sum, m) => sum + (selectedEvent.quotedRevenue * m.percentage) / 100, 0)

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvtName.trim() || !newEvtClient.trim()) return
    const created: EventProject = {
      id: `evt-${Date.now()}`,
      name: newEvtName.trim(),
      clientName: newEvtClient.trim(),
      venue: newEvtVenue.trim() || 'TBD',
      startDate: newEvtStart || new Date().toISOString().split('T')[0],
      endDate: newEvtEnd || newEvtStart || new Date().toISOString().split('T')[0],
      pax: parseInt(newEvtPax, 10) || 100,
      quotedRevenue: parseFloat(newEvtBudget) || 0,
      vendors: [],
      milestones: [
        { id: `m-${Date.now()}-1`, label: 'Booking Advance', percentage: 20, dueLabel: 'On Signing', status: 'pending' },
        { id: `m-${Date.now()}-2`, label: 'Pre-Event Vendor Lock', percentage: 50, dueLabel: 'T-7 Days', status: 'pending' },
        { id: `m-${Date.now()}-3`, label: 'Post-Event Settlement', percentage: 30, dueLabel: 'Event + 3 Days', status: 'pending' },
      ],
      beoTimeline: [],
      checklist: [
        { id: `c-${Date.now()}-1`, label: 'Venue & Power Inspection Complete', done: false },
      ],
      crew: [],
    }
    setEvents(prev => [created, ...prev])
    setSelectedEventId(created.id)
    setNewEvtName('')
    setNewEvtClient('')
    setNewEvtVenue('')
    setNewEvtStart('')
    setNewEvtEnd('')
    setShowNewEventModal(false)
  }

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault()
    const gross = parseFloat(vendorGross)
    if (!vendorName.trim() || isNaN(gross) || gross <= 0) return
    updateSelectedEvent(evt => ({
      ...evt,
      vendors: [
        ...evt.vendors,
        {
          id: `v-${Date.now()}`,
          vendorName: vendorName.trim(),
          category: vendorCat,
          grossAmount: gross,
          tdsSection: vendorTds,
          paid: false,
        },
      ],
    }))
    setVendorName('')
    setVendorGross('')
  }

  const handleAddBeoItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!beoTime.trim() || !beoActivity.trim()) return
    updateSelectedEvent(evt => ({
      ...evt,
      beoTimeline: [
        ...evt.beoTimeline,
        {
          id: `t-${Date.now()}`,
          time: beoTime.trim(),
          activity: beoActivity.trim(),
          owner: beoOwner.trim() || 'Ops Lead',
          notes: beoNotes.trim(),
        },
      ],
    }))
    setBeoTime('')
    setBeoActivity('')
    setBeoOwner('')
    setBeoNotes('')
  }

  const handleAddCrew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!crewName.trim() || !crewRole.trim()) return
    updateSelectedEvent(evt => ({
      ...evt,
      crew: [
        ...evt.crew,
        {
          id: `cr-${Date.now()}`,
          name: crewName.trim(),
          role: crewRole.trim(),
          callTime: crewCallTime.trim() || '09:00 AM',
          dayRate: parseFloat(crewRate) || 0,
          confirmed: false,
        },
      ],
    }))
    setCrewName('')
    setCrewRole('')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-100 text-rose-600">
              <PartyPopper className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Event &amp; MICE Command Center
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                  Event Suite
                </span>
              </h1>
              <p className="text-sm text-gray-500">
                Track per-event P&amp;L margins, Banquet Event Orders (BEO), vendor/artist TDS, and milestone tranches.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setActiveTab('beo')
              setTimeout(() => window.print(), 150)
            }}
            className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <Printer className="w-4 h-4" />
            Print BEO Sheet
          </Button>
          <Button
            type="button"
            onClick={() => setShowNewEventModal(true)}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="w-4 h-4" />
            New Event Project
          </Button>
        </div>
      </div>

      {/* Event Switcher Strip */}
      <div className="flex gap-3 overflow-x-auto pb-1 print:hidden">
        {events.map(evt => {
          const isSelected = evt.id === selectedEvent.id
          return (
            <button
              key={evt.id}
              type="button"
              onClick={() => setSelectedEventId(evt.id)}
              className={`shrink-0 text-left px-4 py-3 rounded-xl border transition-all min-w-[260px] ${
                isSelected
                  ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-rose-300'
              }`}
            >
              <div className="font-bold text-sm truncate">{evt.name}</div>
              <div className={`text-xs mt-0.5 truncate ${isSelected ? 'text-rose-100' : 'text-gray-500'}`}>
                {evt.clientName} • {evt.pax} Pax
              </div>
              <div className={`text-xs font-semibold mt-1.5 flex items-center justify-between ${isSelected ? 'text-white' : 'text-rose-700'}`}>
                <span>{evt.startDate}</span>
                <span>{formatINR(evt.quotedRevenue)}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Event Banner */}
      <Card className="border-rose-200 bg-linear-to-r from-rose-50/80 via-white to-amber-50/50">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600">Active Event Project</div>
            <h2 className="text-xl font-bold text-gray-900">{selectedEvent.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                {selectedEvent.clientName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                {selectedEvent.venue}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-rose-600" />
                {selectedEvent.startDate} to {selectedEvent.endDate}
              </span>
              <span className="flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-rose-600" />
                {selectedEvent.pax} Guests
              </span>
            </div>
          </div>
          <Link
            href={`/invoices/new?title=${encodeURIComponent(selectedEvent.name)}&amount=${selectedEvent.quotedRevenue}`}
            className="print:hidden"
          >
            <Button className="gap-2 bg-gray-900 hover:bg-gray-800 text-white">
              <Receipt className="w-4 h-4" />
              Create Event Invoice
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* P&L Summary KPI Cards (Hidden when printing BEO so crew never sees pricing) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>Quoted Revenue</span>
              <IndianRupee className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatINR(selectedEvent.quotedRevenue)}</div>
            <div className="text-xs text-blue-700 mt-1">Collected: {formatINR(collectedAmount)}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
              <span>Vendor + Crew Cost</span>
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalCost)}</div>
            <div className="text-xs text-amber-700 mt-1">
              Vendors: {formatINR(totalVendorGross)} • Crew: {formatINR(totalCrewCost)}
            </div>
          </CardContent>
        </Card>

        <Card className={netProfit >= 0 ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50'}>
          <CardContent className="p-4">
            <div className={`flex items-center justify-between text-xs font-semibold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              <span>Net Event Margin</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatINR(netProfit)}</div>
            <div className={`text-xs font-semibold mt-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {marginPct.toFixed(1)}% Gross Margin
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-700">
              <span>TDS Liability (194C/194J)</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalTdsPayable)}</div>
            <div className="text-xs text-purple-700 mt-1">
              Net Vendor Payout: {formatINR(totalVendorGross - totalTdsPayable)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 print:hidden">
        {[
          { id: 'pnl', label: 'Cost-Center P&L & Vendor TDS', icon: IndianRupee },
          { id: 'beo', label: 'Banquet Event Order (BEO)', icon: ClipboardList },
          { id: 'milestones', label: 'Milestone Tranches', icon: Sparkles },
          { id: 'crew', label: 'Crew Call-Sheet', icon: Users2 },
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: Cost-Center P&L & Vendor TDS */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-gray-900">
                Add Vendor / Artist / Sub-Rental Expense (with Auto-TDS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVendor} className="grid sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Vendor / Artist Name</label>
                  <Input
                    placeholder="e.g. SoundStage AV Rentals"
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Category</label>
                  <select
                    value={vendorCat}
                    onChange={e => setVendorCat(e.target.value as VendorCostItem['category'])}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white"
                  >
                    <option value="Venue & Catering">Venue &amp; Catering</option>
                    <option value="AV & Production">AV &amp; Production</option>
                    <option value="Decor & Floral">Decor &amp; Floral</option>
                    <option value="Artist & Talent">Artist &amp; Talent</option>
                    <option value="Logistics & Sub-Rental">Logistics &amp; Sub-Rental</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Gross Amount (₹)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="50000"
                    value={vendorGross}
                    onChange={e => setVendorGross(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">TDS Section</label>
                  <div className="flex gap-2">
                    <select
                      value={vendorTds}
                      onChange={e => setVendorTds(e.target.value as TdsSection)}
                      className="w-full h-10 px-2 rounded-md border border-gray-300 text-xs bg-white"
                    >
                      {Object.entries(TDS_RATES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left py-3 px-4">Vendor / Artist</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">Gross</th>
                    <th className="text-left py-3 px-4">TDS Rule</th>
                    <th className="text-right py-3 px-4">TDS Deducted</th>
                    <th className="text-right py-3 px-4">Net Payable</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedEvent.vendors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No vendor or artist costs logged for this event yet.
                      </td>
                    </tr>
                  ) : (
                    selectedEvent.vendors.map(v => {
                      const tdsAmt = v.grossAmount * TDS_RATES[v.tdsSection].rate
                      const netPayable = v.grossAmount - tdsAmt
                      return (
                        <tr key={v.id} className="hover:bg-gray-50/70">
                          <td className="py-3 px-4 font-semibold text-gray-900">{v.vendorName}</td>
                          <td className="py-3 px-4 text-gray-600">{v.category}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatINR(v.grossAmount)}</td>
                          <td className="py-3 px-4 text-xs text-purple-700 font-medium">
                            {TDS_RATES[v.tdsSection].label}
                          </td>
                          <td className="py-3 px-4 text-right text-purple-700 font-semibold">
                            -{formatINR(tdsAmt)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {formatINR(netPayable)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedEvent(evt => ({
                                  ...evt,
                                  vendors: evt.vendors.map(item =>
                                    item.id === v.id ? { ...item, paid: !item.paid } : item
                                  ),
                                }))
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                v.paid
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {v.paid ? 'Paid' : 'Pending'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedEvent(evt => ({
                                  ...evt,
                                  vendors: evt.vendors.filter(item => item.id !== v.id),
                                }))
                              }
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Banquet Event Order (BEO) / Run-of-Show */}
      {activeTab === 'beo' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between print:hidden">
            <span>
              <strong>Crew-Safe BEO Mode:</strong> Client pricing and profit margins are automatically hidden when printing this BEO sheet.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="gap-1.5 border-amber-300 bg-white text-amber-900"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  Run-of-Show Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <form onSubmit={handleAddBeoItem} className="grid sm:grid-cols-4 gap-2 print:hidden">
                  <Input
                    placeholder="Time (e.g. 07:00 PM)"
                    value={beoTime}
                    onChange={e => setBeoTime(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Activity / Cue"
                    value={beoActivity}
                    onChange={e => setBeoActivity(e.target.value)}
                    className="sm:col-span-2"
                    required
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Owner"
                      value={beoOwner}
                      onChange={e => setBeoOwner(e.target.value)}
                    />
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </form>

                <div className="divide-y border rounded-xl">
                  {selectedEvent.beoTimeline.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No timeline cues added yet.
                    </div>
                  ) : (
                    selectedEvent.beoTimeline.map(item => (
                      <div key={item.id} className="p-3.5 flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 h-fit">
                            {item.time}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.activity}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Lead: <strong>{item.owner}</strong>
                              {item.notes ? ` • ${item.notes}` : ''}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedEvent(evt => ({
                              ...evt,
                              beoTimeline: evt.beoTimeline.filter(t => t.id !== item.id),
                            }))
                          }
                          className="text-gray-400 hover:text-red-600 print:hidden"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  Production &amp; Setup Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {selectedEvent.checklist.map(chk => (
                  <label
                    key={chk.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={chk.done}
                      onChange={() =>
                        updateSelectedEvent(evt => ({
                          ...evt,
                          checklist: evt.checklist.map(c =>
                            c.id === chk.id ? { ...c, done: !c.done } : c
                          ),
                        }))
                      }
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className={`text-sm ${chk.done ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                      {chk.label}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Milestone Tranches */}
      {activeTab === 'milestones' && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-bold">
              Contract Payment Tranches (1-Click Tranche Invoicing)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 divide-y">
            {selectedEvent.milestones.map((m, idx) => {
              const trancheAmount = Math.round((selectedEvent.quotedRevenue * m.percentage) / 100)
              return (
                <div key={m.id} className="py-3.5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {m.label} ({m.percentage}%)
                      </div>
                      <div className="text-xs text-gray-500">Due: {m.dueLabel}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatINR(trancheAmount)}</span>
                    <select
                      value={m.status}
                      onChange={e =>
                        updateSelectedEvent(evt => ({
                          ...evt,
                          milestones: evt.milestones.map(item =>
                            item.id === m.id
                              ? { ...item, status: e.target.value as MilestoneTranche['status'] }
                              : item
                          ),
                        }))
                      }
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
                        m.status === 'collected'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : m.status === 'invoiced'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="invoiced">Invoiced</option>
                      <option value="collected">Collected</option>
                    </select>
                    <Link
                      href={`/invoices/new?title=${encodeURIComponent(`${selectedEvent.name} - ${m.label} (${m.percentage}%)`)}&amount=${trancheAmount}`}
                    >
                      <Button size="sm" variant="outline" className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50">
                        Generate Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Crew Call-Sheet */}
      {activeTab === 'crew' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleAddCrew} className="grid sm:grid-cols-5 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Crew / Freelancer Name</label>
                  <Input placeholder="Name" value={crewName} onChange={e => setCrewName(e.target.value)} required />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Event Role</label>
                  <Input placeholder="e.g. Stage Manager / Sound Tech" value={crewRole} onChange={e => setCrewRole(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Call Time</label>
                  <Input placeholder="09:00 AM" value={crewCallTime} onChange={e => setCrewCallTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Day Rate (₹)</label>
                  <div className="flex gap-2">
                    <Input type="number" value={crewRate} onChange={e => setCrewRate(e.target.value)} />
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left py-3 px-4">Crew Member</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Call Time</th>
                    <th className="text-right py-3 px-4">Day Rate</th>
                    <th className="text-center py-3 px-4">Confirmed</th>
                    <th className="text-right py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedEvent.crew.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 font-semibold text-gray-900">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600">{c.role}</td>
                      <td className="py-3 px-4 font-medium text-rose-700">{c.callTime}</td>
                      <td className="py-3 px-4 text-right font-semibold">{formatINR(c.dayRate)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedEvent(evt => ({
                              ...evt,
                              crew: evt.crew.map(item =>
                                item.id === c.id ? { ...item, confirmed: !item.confirmed } : item
                              ),
                            }))
                          }
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            c.confirmed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {c.confirmed ? 'Confirmed' : 'Pending'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedEvent(evt => ({
                              ...evt,
                              crew: evt.crew.filter(item => item.id !== c.id),
                            }))
                          }
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white shadow-2xl">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">Create New Event Project</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Event Name *</label>
                  <Input value={newEvtName} onChange={e => setNewEvtName(e.target.value)} placeholder="e.g. Tech Summit 2026" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Client Name *</label>
                  <Input value={newEvtClient} onChange={e => setNewEvtClient(e.target.value)} placeholder="e.g. Acme Corp" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Venue &amp; City</label>
                  <Input value={newEvtVenue} onChange={e => setNewEvtVenue(e.target.value)} placeholder="e.g. Marriott Ballroom, Bengaluru" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Start Date</label>
                    <Input type="date" value={newEvtStart} onChange={e => setNewEvtStart(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">End Date</label>
                    <Input type="date" value={newEvtEnd} onChange={e => setNewEvtEnd(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Expected Pax</label>
                    <Input type="number" value={newEvtPax} onChange={e => setNewEvtPax(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Quoted Budget (₹)</label>
                    <Input type="number" value={newEvtBudget} onChange={e => setNewEvtBudget(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="ghost" onClick={() => setShowNewEventModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                    Create Event
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
