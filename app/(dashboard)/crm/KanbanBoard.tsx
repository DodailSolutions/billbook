'use client'

import { useState } from 'react'
import { CRMLead, LeadStage } from "@/lib/crm-types"
import { updateLeadStage, deleteLead } from "@/lib/crm-actions"
import { Button } from "@/components/ui/Button"
import { Building2, User, Phone, Mail, DollarSign, Trash2, Edit3, ArrowRight, Tag, Sparkles } from "lucide-react"

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {STAGES.map((col) => {
                const stageLeads = leads.filter(l => l.stage === col.id)
                const stageValue = stageLeads.reduce((acc, l) => acc + Number(l.value || 0), 0)

                return (
                    <div 
                        key={col.id}
                        className={`flex flex-col rounded-2xl p-3 border ${col.bg} ${col.border} min-w-[240px] shrink-0 min-h-[500px]`}
                    >
                        {/* Stage Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-3">
                            <div>
                                <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                                    {col.title}
                                </h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                                    ₹{stageValue.toLocaleString('en-IN')} ({stageLeads.length})
                                </p>
                            </div>
                        </div>

                        {/* Leads Cards Container */}
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                            {stageLeads.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-white/50">
                                    <p className="text-[11px] text-gray-400 font-medium">No deals in stage</p>
                                </div>
                            ) : (
                                stageLeads.map((lead) => (
                                    <div 
                                        key={lead.id}
                                        className={`bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all group relative ${
                                            updatingId === lead.id ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                    >
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
                                        <div className="space-y-1 text-[11px] text-gray-600 mb-3">
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

                                        {/* Tags */}
                                        {lead.tags && lead.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
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
                                                className="text-[10px] font-medium bg-slate-50 border border-gray-200 rounded-md px-1.5 py-1 text-gray-700 focus:outline-hidden"
                                            >
                                                {STAGES.map(s => (
                                                    <option key={s.id} value={s.id}>Move: {s.title}</option>
                                                ))}
                                            </select>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => onEditLead(lead)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                                                    title="Edit Deal"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                                                    title="Delete Deal"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
