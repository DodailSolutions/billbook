'use client'

import { useState, useEffect } from 'react'
import { 
    X, Building2, UserPlus, Users, Mail, Phone, MapPin, 
    Globe, FileText, Check, Star, Trash2, Edit2, Loader2, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Organization, Customer } from '@/lib/types'
import { getOrganizationContacts, createOrganizationContactAction } from './actions'
import Link from 'next/link'

interface OrganizationDrawerProps {
    isOpen: boolean
    onClose: () => void
    organization: Organization | null
    onEditOrg: (org: Organization) => void
}

export function OrganizationDrawer({ isOpen, onClose, organization, onEditOrg }: OrganizationDrawerProps) {
    const [contacts, setContacts] = useState<Customer[]>([])
    const [isLoadingContacts, setIsLoadingContacts] = useState(false)
    const [isAddContactOpen, setIsAddContactOpen] = useState(false)

    // New contact form state
    const [contactName, setContactName] = useState('')
    const [designation, setDesignation] = useState('')
    const [department, setDepartment] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [isPrimary, setIsPrimary] = useState(false)
    const [isSavingContact, setIsSavingContact] = useState(false)
    const [contactError, setContactError] = useState<string | null>(null)

    const fetchContacts = async () => {
        if (!organization) return
        setIsLoadingContacts(true)
        try {
            const data = await getOrganizationContacts(organization.id)
            setContacts(data)
        } catch (err) {
            console.error('Failed to load contacts:', err)
        } finally {
            setIsLoadingContacts(false)
        }
    }

    useEffect(() => {
        if (organization && isOpen) {
            fetchContacts()
            setIsAddContactOpen(false)
            setContactName('')
            setDesignation('')
            setDepartment('')
            setContactEmail('')
            setContactPhone('')
            setIsPrimary(false)
            setContactError(null)
        }
    }, [organization, isOpen])

    if (!isOpen || !organization) return null

    const handleCreateContact = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!contactName.trim()) {
            setContactError('Contact person name is required')
            return
        }

        setIsSavingContact(true)
        setContactError(null)

        try {
            const res = await createOrganizationContactAction({
                organization_id: organization.id,
                organization_name: organization.name,
                name: contactName.trim(),
                designation: designation.trim() || undefined,
                department: department.trim() || undefined,
                email: contactEmail.trim() || undefined,
                phone: contactPhone.trim() || undefined,
                is_primary_contact: isPrimary
            })

            if (res.success && res.contact) {
                setContacts(prev => [res.contact!, ...prev])
                setIsAddContactOpen(false)
                setContactName('')
                setDesignation('')
                setDepartment('')
                setContactEmail('')
                setContactPhone('')
                setIsPrimary(false)
            } else {
                setContactError(res.error || 'Failed to add contact')
            }
        } catch (err) {
            setContactError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsSavingContact(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
            <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                {/* Drawer Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400 mt-0.5">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                    {organization.name}
                                </h2>
                                {organization.industry && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {organization.industry}
                                    </span>
                                )}
                            </div>
                            {organization.legal_name && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {organization.legal_name}
                                </p>
                            )}
                            {organization.gstin && (
                                <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                    GSTIN: {organization.gstin}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditOrg(organization)}
                            className="text-xs gap-1"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
                    {/* Fast Invoicing Action */}
                    <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Create Invoice for this Org</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Pre-fills company name, GSTIN, and billing address automatically
                            </p>
                        </div>
                        <Link href={`/invoices/new?organizationId=${organization.id}&organizationName=${encodeURIComponent(organization.name)}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1 shadow-xs">
                                <span>New Invoice</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Organization Meta Details */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Email</span>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                                {organization.email || '—'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Switchboard Phone</span>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                {organization.phone || '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Address</span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                                {organization.billing_address 
                                    ? `${organization.billing_address}, ${organization.city || ''} ${organization.state || ''} ${organization.pincode || ''}`
                                    : 'No address added'}
                            </p>
                        </div>
                    </div>

                    {/* Multi-Contact Persons Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                    Contact Persons & Stakeholders ({contacts.length})
                                </h3>
                            </div>
                            {!isAddContactOpen && (
                                <Button
                                    size="sm"
                                    onClick={() => setIsAddContactOpen(true)}
                                    className="text-xs gap-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Add Contact</span>
                                </Button>
                            )}
                        </div>

                        {/* Add Contact Form Inline */}
                        {isAddContactOpen && (
                            <form onSubmit={handleCreateContact} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-3 mb-4">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                        Add New Contact for {organization.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddContactOpen(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {contactError && (
                                    <p className="text-xs text-rose-600 font-medium">{contactError}</p>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name *</label>
                                        <Input
                                            required
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Designation / Role</label>
                                        <Input
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            placeholder="e.g. Head of Procurement"
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Direct Email</label>
                                        <Input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="john@acme.com"
                                            className="text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile / Direct Phone</label>
                                        <Input
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="+91 98765 00000"
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPrimary}
                                            onChange={(e) => setIsPrimary(e.target.checked)}
                                            className="rounded text-indigo-600"
                                        />
                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Mark as Primary Decision Maker
                                        </span>
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAddContactOpen(false)}
                                            className="text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={isSavingContact}
                                            className="bg-indigo-600 text-white text-xs font-bold"
                                        >
                                            {isSavingContact ? 'Saving...' : 'Save Contact'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Contacts List */}
                        {isLoadingContacts ? (
                            <div className="p-6 text-center text-xs text-slate-400">Loading contacts...</div>
                        ) : contacts.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">No Contact Persons Added Yet</p>
                                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                                    Add key personnel (CEO, CFO, procurement managers) who make purchasing decisions at this organization.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                                                        {contact.name}
                                                    </h4>
                                                    {contact.is_primary_contact && (
                                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                                {contact.designation && (
                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {contact.designation} {contact.department ? `• ${contact.department}` : ''}
                                                    </p>
                                                )}
                                            </div>
                                            <Link href={`/invoices/new?customerId=${contact.id}&organizationId=${organization.id}`}>
                                                <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                                    Bill Contact →
                                                </button>
                                            </Link>
                                        </div>

                                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                                            {contact.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {contact.email}
                                                </span>
                                            )}
                                            {contact.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {contact.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
