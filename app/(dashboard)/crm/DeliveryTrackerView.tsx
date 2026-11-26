'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CRMLead } from '@/lib/crm-types'
import { updateLead } from '@/lib/crm-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
    Rocket,
    CheckCircle2,
    FileText,
    CalendarDays,
    Code2,
    Megaphone,
    Sparkles,
    ArrowRight,
} from 'lucide-react'

const DELIVERY_STAGES = [
    { id: 'kickoff', label: 'Kickoff', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'in_progress', label: 'In Progress', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'uat_review', label: 'UAT / Review', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'delivered', label: 'Delivered', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'closed', label: 'Closed', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
] as const

type DeliveryStage = (typeof DELIVERY_STAGES)[number]['id']

function getDeliveryStage(lead: CRMLead): DeliveryStage {
    const tag = (lead.tags || []).find((t) => t.startsWith('delivery:'))
    const val = tag?.replace('delivery:', '') as DeliveryStage | undefined
    if (val && DELIVERY_STAGES.some((s) => s.id === val)) return val
    return 'kickoff'
}

export function DeliveryTrackerView({
    leads,
    onRefresh,
}: {
    leads: CRMLead[]
    onRefresh: () => Promise<void>
}) {
    const wonLeads = leads.filter((l) => l.stage === 'won')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [suiteMode, setSuiteMode] = useState<'all' | 'software_it' | 'digital_marketing' | 'event_management'>('all')

    // Lightweight interactive calculators for Software/IT & Digital Marketing suites
    const [adSpend, setAdSpend] = useState<number>(100000)
    const [agencyFeePct, setAgencyFeePct] = useState<number>(15)
    const [billableHours, setBillableHours] = useState<number>(120)
    const [hourlyRate, setHourlyRate] = useState<number>(2500)

    const handleStageChange = async (lead: CRMLead, nextStage: DeliveryStage) => {
        setUpdatingId(lead.id)
        const existingTags = (lead.tags || []).filter((t) => !t.startsWith('delivery:'))
        await updateLead(lead.id, { tags: [...existingTags, `delivery:${nextStage}`] })
        await onRefresh()
        setUpdatingId(null)
    }

    return (
        <div className="space-y-6">
            {/* Vertical Agency Suite Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl p-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-indigo-600" />
                        Post-Win Delivery &amp; Vertical Agency Suite
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Track won deals from Kickoff to Closed, calculate agency retainers/billable sprints, or hand off events to BEO.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    {[
                        { id: 'all', label: 'All Won Deals', icon: Sparkles },
                        { id: 'software_it', label: 'Software & IT', icon: Code2 },
                        { id: 'digital_marketing', label: 'Digital Marketing', icon: Megaphone },
                        { id: 'event_management', label: 'Events & MICE', icon: CalendarDays },
                    ].map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSuiteMode(tab.id as any)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    suiteMode === tab.id
                                        ? 'bg-white text-indigo-700 shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Vertical Quick Tools */}
            {suiteMode === 'software_it' && (
                <Card className="border-indigo-100 bg-indigo-50/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                            <Code2 className="h-4 w-4" /> Software &amp; IT Sprint / Timesheet Margin Estimator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold text-gray-600 mb-1">Billable Sprint Hours</label>
                            <input
                                type="number"
                                value={billableHours}
                                onChange={(e) => setBillableHours(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-600 mb-1">Hourly Rate (₹)</label>
                            <input
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5"
                            />
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-indigo-100 flex flex-col justify-center">
                            <span className="text-[11px] text-gray-500 uppercase font-semibold">Billable Sprint Value</span>
                            <span className="text-lg font-black text-indigo-700">
                                ₹{(billableHours * hourlyRate).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {suiteMode === 'digital_marketing' && (
                <Card className="border-purple-100 bg-purple-50/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
                            <Megaphone className="h-4 w-4" /> Ad-Spend Pass-Through vs Agency Fee Calculator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold text-gray-600 mb-1">Monthly Ad Spend Pass-Through (₹)</label>
                            <input
                                type="number"
                                value={adSpend}
                                onChange={(e) => setAdSpend(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-600 mb-1">Agency Management Fee (%)</label>
                            <input
                                type="number"
                                value={agencyFeePct}
                                onChange={(e) => setAgencyFeePct(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5"
                            />
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-purple-100 flex flex-col justify-center">
                            <span className="text-[11px] text-gray-500 uppercase font-semibold">Taxable Agency Fee (+18% GST)</span>
                            <span className="text-lg font-black text-purple-700">
                                ₹{Math.round((adSpend * agencyFeePct) / 100).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Won Deals Delivery Board */}
            {wonLeads.length === 0 ? (
                <Card className="border-dashed border-gray-300">
                    <CardContent className="py-12 text-center text-sm text-gray-500">
                        No Won deals yet. Move any deal to <strong>Won</strong> in the Kanban Pipeline to track post-sale delivery here.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wonLeads.map((lead) => {
                        const stage = getDeliveryStage(lead)
                        const stageMeta = DELIVERY_STAGES.find((s) => s.id === stage) || DELIVERY_STAGES[0]
                        return (
                            <Card key={lead.id} className="border-gray-200 shadow-2xs hover:shadow-sm transition-shadow">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{lead.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                {lead.company_name || lead.contact_name || 'Client'} · ₹{Number(lead.value || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stageMeta.badge}`}>
                                            {stageMeta.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {DELIVERY_STAGES.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                disabled={updatingId === lead.id}
                                                onClick={() => handleStageChange(lead, s.id)}
                                                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                                                    stage === s.id
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                {stage === s.id && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Link href={lead.customer_id ? `/invoices/new?customerId=${lead.customer_id}` : '/invoices/new'}>
                                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                                    <FileText className="h-3 w-3" /> Create Invoice
                                                </Button>
                                            </Link>
                                            <Link href="/proposals">
                                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                                                    Proposals <ArrowRight className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                        {suiteMode === 'event_management' && (
                                            <Link href="/events">
                                                <Button size="sm" className="h-7 text-xs gap-1 bg-indigo-600 text-white">
                                                    <CalendarDays className="h-3 w-3" /> Open BEO / Events
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
