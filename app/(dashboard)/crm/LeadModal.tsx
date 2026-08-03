'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/Button"
import { CRMLead, CreateLeadInput, LeadStage, LeadSource } from "@/lib/crm-types"
import { createLead, updateLead } from "@/lib/crm-actions"
import { X, Sparkles } from "lucide-react"

interface LeadModalProps {
    isOpen: boolean
    onClose: () => void
    leadToEdit?: CRMLead | null
    onSuccess?: () => void
}

export function LeadModal({ isOpen, onClose, leadToEdit, onSuccess }: LeadModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [title, setTitle] = useState(leadToEdit?.title || '')
    const [companyName, setCompanyName] = useState(leadToEdit?.company_name || '')
    const [contactName, setContactName] = useState(leadToEdit?.contact_name || '')
    const [email, setEmail] = useState(leadToEdit?.email || '')
    const [phone, setPhone] = useState(leadToEdit?.phone || '')
    const [value, setValue] = useState(leadToEdit?.value?.toString() || '0')
    const [stage, setStage] = useState<LeadStage>(leadToEdit?.stage || 'lead')
    const [source, setSource] = useState<LeadSource>(leadToEdit?.source || 'web')
    const [notes, setNotes] = useState(leadToEdit?.notes || '')
    const [tags, setTags] = useState(leadToEdit?.tags?.join(', ') || '')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!title.trim()) {
            setError('Deal title is required')
            return
        }

        setLoading(true)

        const input: CreateLeadInput = {
            title: title.trim(),
            company_name: companyName.trim() || undefined,
            contact_name: contactName.trim() || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            value: Number(value) || 0,
            stage,
            source,
            notes: notes.trim() || undefined,
            tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }

        let res
        if (leadToEdit) {
            res = await updateLead(leadToEdit.id, input)
        } else {
            res = await createLead(input)
        }

        setLoading(false)

        if (!res.success) {
            setError(res.error || 'Failed to save deal')
        } else {
            onSuccess?.()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {leadToEdit ? 'Edit CRM Deal' : 'Add New Lead / Deal'}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Deal Title *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Website Redesign Contract"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                placeholder="Acme Corp"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="john@acme.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="+91 9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Deal Value (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="50000"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Stage
                            </label>
                            <select
                                value={stage}
                                onChange={(e) => setStage(e.target.value as LeadStage)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            >
                                <option value="lead">New Lead</option>
                                <option value="contacted">Contacted</option>
                                <option value="proposal_sent">Proposal Sent</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="won">Won 🎉</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Source
                            </label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value as LeadSource)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            >
                                <option value="web">Website</option>
                                <option value="referral">Referral</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="campaign">Campaign</option>
                                <option value="phone">Phone Call</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            placeholder="VIP, Urgent, High Value"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Internal Notes & Requirements
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Client requested custom GST quote..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? 'Saving...' : leadToEdit ? 'Update Deal' : 'Create Deal'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
