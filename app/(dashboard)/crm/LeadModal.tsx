'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/Button"
import { CRMLead, CreateLeadInput, LeadStage, LeadSource, CRMTeamMember } from "@/lib/crm-types"
import { createLead, updateLead } from "@/lib/crm-actions"
import { X, Sparkles, User, Building2, Mail, Phone, DollarSign, Calendar, Tag, FileText, Users } from "lucide-react"

interface LeadModalProps {
    isOpen: boolean
    onClose: () => void
    leadToEdit?: CRMLead | null
    teamMembers: CRMTeamMember[]
    onSuccess?: () => void
}

export function LeadModal({ isOpen, onClose, leadToEdit, teamMembers, onSuccess }: LeadModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [title, setTitle] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [contactName, setContactName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [value, setValue] = useState('0')
    const [stage, setStage] = useState<LeadStage>('lead')
    const [probability, setProbability] = useState<number>(20)
    const [expectedCloseDate, setExpectedCloseDate] = useState('')
    const [source, setSource] = useState<LeadSource>('web')
    const [assignedMemberId, setAssignedMemberId] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [tags, setTags] = useState('')

    useEffect(() => {
        if (leadToEdit) {
            setTitle(leadToEdit.title || '')
            setCompanyName(leadToEdit.company_name || '')
            setContactName(leadToEdit.contact_name || '')
            setEmail(leadToEdit.email || '')
            setPhone(leadToEdit.phone || '')
            setValue(leadToEdit.value?.toString() || '0')
            setStage(leadToEdit.stage || 'lead')
            setProbability(leadToEdit.probability ?? 20)
            setExpectedCloseDate(leadToEdit.expected_close_date || '')
            setSource(leadToEdit.source || 'web')
            setAssignedMemberId(leadToEdit.assigned_member_id || '')
            setNotes(leadToEdit.notes || '')
            setTags(leadToEdit.tags?.join(', ') || '')
        } else {
            setTitle('')
            setCompanyName('')
            setContactName('')
            setEmail('')
            setPhone('')
            setValue('0')
            setStage('lead')
            setProbability(20)
            setExpectedCloseDate('')
            setSource('web')
            setAssignedMemberId('')
            setNotes('')
            setTags('')
        }
        setError(null)
    }, [leadToEdit, isOpen])

    if (!isOpen) return null

    const handleStageChange = (newStage: LeadStage) => {
        setStage(newStage)
        const probabilityMap: Record<LeadStage, number> = {
            lead: 20,
            contacted: 40,
            proposal_sent: 60,
            negotiation: 80,
            won: 100,
            lost: 0
        }
        setProbability(probabilityMap[newStage] ?? 20)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!title.trim()) {
            setError('Deal title is required')
            return
        }

        setLoading(true)

        const selectedMember = teamMembers.find(m => m.id === assignedMemberId)

        const input: CreateLeadInput = {
            title: title.trim(),
            company_name: companyName.trim() || undefined,
            contact_name: contactName.trim() || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            value: Number(value) || 0,
            stage,
            probability,
            expected_close_date: expectedCloseDate || undefined,
            source,
            assigned_member_id: assignedMemberId || undefined,
            assigned_to: selectedMember ? selectedMember.name : undefined,
            notes: notes.trim() || undefined,
            tags: tags ? tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) : [],
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-xs overflow-hidden">
            <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/60 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                {leadToEdit ? 'Edit CRM Opportunity' : 'Create New Lead / Deal'}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Manage prospect details, deal value, stage, and team assignment
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {error && (
                        <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">
                            {error}
                        </div>
                    )}

                    {/* Deal Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Deal Title *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 50-License ERP Software Deal, Cloud Retainer"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600 focus:border-indigo-600"
                        />
                    </div>

                    {/* Value & Probability */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-emerald-600" />
                                Estimated Value (INR)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600 font-semibold text-emerald-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Close Probability ({probability}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={probability}
                                onChange={(e) => setProbability(Number(e.target.value))}
                                className="w-full accent-indigo-600 mt-2"
                            />
                        </div>
                    </div>

                    {/* Company & Contact Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-gray-400" />
                                Company / Business Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Corporation"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400" />
                                Contact Person
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Priya Sharma"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                            />
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="client@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                            />
                        </div>
                    </div>

                    {/* Team Member Assignment */}
                    <div className="bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/70 space-y-1">
                        <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-indigo-600" />
                            Assign To Team Member
                        </label>
                        <select
                            value={assignedMemberId}
                            onChange={(e) => setAssignedMemberId(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-indigo-200 rounded-lg text-gray-800 focus:outline-indigo-600"
                        >
                            <option value="">👤 Unassigned (General Pool)</option>
                            {teamMembers.map(m => (
                                <option key={m.id} value={m.id}>
                                    👤 {m.name} — {m.role} ({m.email})
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-500">
                            The assigned team member will be responsible for follow-ups and pipeline progress.
                        </p>
                    </div>

                    {/* Stage & Source */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Deal Stage
                            </label>
                            <select
                                value={stage}
                                onChange={(e) => handleStageChange(e.target.value as LeadStage)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                            >
                                <option value="lead">New Lead 🎯</option>
                                <option value="contacted">Contacted 📞</option>
                                <option value="proposal_sent">Proposal Sent 📄</option>
                                <option value="negotiation">Negotiation 🤝</option>
                                <option value="won">Won Deal 🎉</option>
                                <option value="lost">Lost ❌</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Lead Source
                            </label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value as LeadSource)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                            >
                                <option value="web">Website Form</option>
                                <option value="referral">Referral</option>
                                <option value="whatsapp">WhatsApp Inbound</option>
                                <option value="campaign">Marketing Campaign</option>
                                <option value="phone">Cold Call / Phone</option>
                                <option value="excel_import">Excel / File Import</option>
                                <option value="google_sheets">Google Sheets Sync</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Expected Close Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            Expected Closing Date
                        </label>
                        <input
                            type="date"
                            value={expectedCloseDate}
                            onChange={(e) => setExpectedCloseDate(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Tag className="h-3 w-3 text-gray-400" />
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            placeholder="enterprise, urgent, software, retainer"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3 text-gray-400" />
                            Notes & Requirements
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Add client requirements, background context, deal notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5"
                        >
                            {loading ? 'Saving...' : leadToEdit ? 'Save Changes' : 'Create Deal'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
