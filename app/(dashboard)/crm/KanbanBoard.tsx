'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CRMLead, LeadStage } from "@/lib/crm-types"
import { updateLeadStage, deleteLead } from "@/lib/crm-actions"
import { Button } from "@/components/ui/Button"
import { 
    Building2, User, Phone, Mail, DollarSign, Trash2, Edit3, 
    ArrowRight, Tag, Sparkles, MessageSquare, Receipt, Search, Filter, AlertTriangle, Flame
} from "lucide-react"

interface KanbanBoardProps {
    leads: CRMLead[]
    onEditLead: (lead: CRMLead) => void
    onRefresh: () => void
}

const STAGES: { id: LeadStage; title: string; color: string; bg: string; border: string }[] = [
    { id: 'lead', title: 'New Lead 🎯', color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-200' },
    { id: 'contacted', title: 'Contacted 📞', color: 'text-purple-700', bg: 'bg-purple-50/50', border: 'border-purple-200' },
    { id: 'proposal_sent', title: 'Proposal Sent 📄', color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200' },
    { id: 'negotiation', title: 'Negotiation 🤝', color: 'text-indigo-700', bg: 'bg-indigo-50/50', border: 'border-indigo-200' },
    { id: 'won', title: 'Won 🎉', color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
    { id: 'lost', title: 'Lost ❌', color: 'text-rose-700', bg: 'bg-rose-50/50', border: 'border-rose-200' },
]

export function KanbanBoard({ leads, onEditLead, onRefresh }: KanbanBoardProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterPriority, setFilterPriority] = useState<'all' | 'hot' | 'stale'>('all')
    const [expandedMobile, setExpandedMobile] = useState<Record<string, boolean>>({
        lead: true
    })

    const now = Date.now()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

    const getLeadScore = (lead: CRMLead) => {
        const val = Number(lead.value || 0)
        const prob = Number(lead.probability || 0)
        const updatedTime = new Date(lead.updated_at || lead.created_at).getTime()
        const isStale = lead.stage !== 'won' && lead.stage !== 'lost' && (now - updatedTime > sevenDaysMs)
        const isHot = prob >= 70 || lead.stage === 'negotiation' || (val >= 50000 && prob >= 50)
        const isWarm = prob >= 40 && prob < 70

        return { isHot, isWarm, isStale }
    }

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matches = (
                    lead.title.toLowerCase().includes(q) ||
                    (lead.company_name && lead.company_name.toLowerCase().includes(q)) ||
                    (lead.contact_name && lead.contact_name.toLowerCase().includes(q)) ||
                    (lead.phone && lead.phone.includes(q)) ||
                    (lead.tags && lead.tags.some(t => t.toLowerCase().includes(q)))
                )
                if (!matches) return false
            }

            if (filterPriority === 'hot') {
                const { isHot } = getLeadScore(lead)
                if (!isHot) return false
            } else if (filterPriority === 'stale') {
                const { isStale } = getLeadScore(lead)
                if (!isStale) return false
            }

            return true
        })
    }, [leads, searchQuery, filterPriority])

    const handleStageChange = async (leadId: string, newStage: LeadStage) => {
        setUpdatingId(leadId)
        await updateLeadStage(leadId, newStage)
        setUpdatingId(null)
        onRefresh()
    }

    const handleDelete = async (leadId: string) => {
        if (confirm('Are you sure you want to delete this deal?')) {
            await deleteLead(leadId)
            onRefresh()
        }
    }

    return (
        <div className="space-y-4">
            {/* Smart Pipeline Controls: Search & Smart Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search deals, company, contact or #tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-indigo-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                        onClick={() => setFilterPriority('all')}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                            filterPriority === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All ({leads.length})
                    </button>
                    <button
                        onClick={() => setFilterPriority('hot')}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                            filterPriority === 'hot'
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                    >
                        <Flame className="h-3 w-3" />
                        Hot Deals
                    </button>
                    <button
                        onClick={() => setFilterPriority('stale')}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                            filterPriority === 'stale'
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                    >
                        <AlertTriangle className="h-3 w-3" />
                        Needs Action (7d+)
                    </button>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-hidden md:overflow-x-auto pb-4">
                {STAGES.map((col) => {
                    const stageLeads = filteredLeads.filter(l => l.stage === col.id)
                    const stageValue = stageLeads.reduce((acc, l) => acc + Number(l.value || 0), 0)
                    const isExpanded = expandedMobile[col.id]

                    return (
                        <div 
                            key={col.id}
                            className={`flex flex-col rounded-2xl p-3 border ${col.bg} ${col.border} w-full md:min-w-[240px] shrink-0 md:min-h-[500px]`}
                        >
                            {/* Stage Header */}
                            <div 
                                className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-3 cursor-pointer md:cursor-default"
                                onClick={() => setExpandedMobile(prev => ({ ...prev, [col.id]: !prev[col.id] }))}
                            >
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                                        {col.title}
                                    </h3>
                                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                                        ₹{stageValue.toLocaleString('en-IN')} ({stageLeads.length})
                                    </p>
                                </div>
                                <div className="md:hidden">
                                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Leads Cards Container */}
                            <div className={`flex-1 space-y-3 overflow-y-auto max-h-none md:max-h-[calc(100vh-280px)] pr-1 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                                {stageLeads.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-white/50">
                                        <p className="text-[11px] text-gray-400 font-medium">No deals in stage</p>
                                    </div>
                                ) : (
                                    stageLeads.map((lead) => {
                                        const { isHot, isWarm, isStale } = getLeadScore(lead)
                                        const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : ''

                                        return (
                                            <div 
                                                key={lead.id}
                                                className={`bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all group relative ${
                                                    updatingId === lead.id ? 'opacity-50 pointer-events-none' : ''
                                                }`}
                                            >
                                                {/* Smart Deal Badges */}
                                                <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                                                    {isHot && (
                                                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                            <Flame className="h-2.5 w-2.5 text-amber-600" /> Hot Deal
                                                        </span>
                                                    )}
                                                    {isStale && (
                                                        <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                                            <AlertTriangle className="h-2.5 w-2.5 text-rose-600" /> Stale (7d+)
                                                        </span>
                                                    )}
                                                    {lead.probability !== undefined && (
                                                        <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                            {lead.probability}% prob
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Card Title & Value */}
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                                                        {lead.title}
                                                    </h4>
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 border border-emerald-100">
                                                        ₹{Number(lead.value).toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                {/* Company & Contact */}
                                                <div className="space-y-1 text-[11px] text-gray-600 mb-2.5">
                                                    {lead.company_name && (
                                                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                                            <Building2 className="h-3 w-3 text-gray-400 shrink-0" />
                                                            <span className="truncate">{lead.company_name}</span>
                                                        </div>
                                                    )}
                                                    {lead.contact_name && (
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="h-3 w-3 text-gray-400 shrink-0" />
                                                            <span className="truncate">{lead.contact_name}</span>
                                                        </div>
                                                    )}
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                                                            <span>{lead.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Instant Follow-up Quick Action Buttons */}
                                                <div className="flex items-center gap-1.5 py-1.5 border-t border-dashed border-gray-100 mb-2">
                                                    {cleanPhone && (
                                                        <a
                                                            href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hi ${lead.contact_name || ''}, regarding ${lead.title} with BillBooky.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                                                            title="Quick WhatsApp message"
                                                        >
                                                            <MessageSquare className="h-2.5 w-2.5" />
                                                            WhatsApp
                                                        </a>
                                                    )}
                                                    {lead.email && (
                                                        <a
                                                            href={`mailto:${lead.email}?subject=${encodeURIComponent(`Regarding ${lead.title}`)}`}
                                                            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                                                            title="Quick Email"
                                                        >
                                                            <Mail className="h-2.5 w-2.5" />
                                                            Email
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={`/invoices/new`}
                                                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors ml-auto"
                                                        title="Convert deal to Invoice"
                                                    >
                                                        <Receipt className="h-2.5 w-2.5" />
                                                        Invoice
                                                    </Link>
                                                </div>

                                                {/* Tags */}
                                                {lead.tags && lead.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2.5">
                                                        {lead.tags.map((tag, i) => (
                                                            <span key={i} className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Move Stage Selector & Actions */}
                                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                                                    <select
                                                        value={lead.stage}
                                                        onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                                                        className="text-xs md:text-[10px] font-medium bg-slate-50 border border-gray-200 rounded-md px-2 py-1.5 md:px-1.5 md:py-1 text-gray-700 focus:outline-hidden"
                                                    >
                                                        {STAGES.map(s => (
                                                            <option key={s.id} value={s.id}>Move: {s.title}</option>
                                                        ))}
                                                    </select>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => onEditLead(lead)}
                                                            className="p-2 md:p-1 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                                                            title="Edit Deal"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lead.id)}
                                                            className="p-2 md:p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                                                            title="Delete Deal"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}