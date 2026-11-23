'use client'

import { useState, useMemo } from 'react'
import { 
    Building2, Plus, Search, Filter, Users, FileText, 
    MoreVertical, Edit, Trash2, ArrowUpRight, CheckCircle2,
    DollarSign, ExternalLink, Globe, Phone, Mail, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import type { Organization } from '@/lib/types'
import { OrganizationModal } from './OrganizationModal'
import { OrganizationDrawer } from './OrganizationDrawer'
import { deleteOrganizationAction } from './actions'
import Link from 'next/link'

interface OrganizationsListProps {
    initialOrganizations: Organization[]
}

export function OrganizationsList({ initialOrganizations }: OrganizationsListProps) {
    const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState<string>('all')

    // Modals & Drawer State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
    const [viewingOrg, setViewingOrg] = useState<Organization | null>(null)
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

    // Industries
    const industries = useMemo(() => {
        const set = new Set<string>()
        organizations.forEach(o => {
            if (o.industry) set.add(o.industry)
        })
        return Array.from(set)
    }, [organizations])

    // Filtered
    const filteredOrgs = useMemo(() => {
        return organizations.filter(org => {
            const matchesSearch = 
                (org.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (org.legal_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (org.gstin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (org.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (org.email || '').toLowerCase().includes(searchQuery.toLowerCase())

            const matchesIndustry = selectedIndustry === 'all' || org.industry === selectedIndustry
            return matchesSearch && matchesIndustry
        })
    }, [organizations, searchQuery, selectedIndustry])

    // Aggregate KPI metrics
    const stats = useMemo(() => {
        const total = organizations.length
        const totalContacts = organizations.reduce((acc, o) => acc + (o.contacts_count || 0), 0)
        const totalInvoiced = organizations.reduce((acc, o) => acc + (o.total_billed || 0), 0)
        const totalInvoices = organizations.reduce((acc, o) => acc + (o.invoices_count || 0), 0)
        return { total, totalContacts, totalInvoiced, totalInvoices }
    }, [organizations])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? Linked contacts will be unassigned.`)) {
            return
        }

        setIsDeletingId(id)
        try {
            const res = await deleteOrganizationAction(id)
            if (res.success) {
                setOrganizations(prev => prev.filter(o => o.id !== id))
                if (viewingOrg?.id === id) setViewingOrg(null)
            } else {
                alert(res.error || 'Failed to delete organization')
            }
        } catch {
            alert('An unexpected error occurred')
        } finally {
            setIsDeletingId(null)
        }
    }

    const handleOrgSaved = (savedOrg: Organization) => {
        setOrganizations(prev => {
            const index = prev.findIndex(o => o.id === savedOrg.id)
            if (index >= 0) {
                const next = [...prev]
                next[index] = { ...next[index], ...savedOrg }
                return next
            }
            return [savedOrg, ...prev]
        })
        if (viewingOrg?.id === savedOrg.id) {
            setViewingOrg(prev => prev ? { ...prev, ...savedOrg } : null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                        <Building2 className="h-7 w-7 text-indigo-600" />
                        <span>Organizations</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Central B2B accounts directory. Manage companies, linked stakeholders, billing profiles, and tax numbers.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm hover:shadow transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Organization</span>
                    </Button>
                </div>
            </div>

            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Companies</span>
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                            {stats.total}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Contacts</span>
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                            {stats.totalContacts}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoices Issued</span>
                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                            {stats.totalInvoices}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Billed</span>
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                            ₹{stats.totalInvoiced.toLocaleString('en-IN')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by company name, GSTIN, city or email..."
                        className="pl-10 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                        <option value="all">All Industries ({organizations.length})</option>
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Organizations Table / Grid */}
            {filteredOrgs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {searchQuery ? 'No organizations match your query' : 'No organizations created yet'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Add your client companies to organize multi-stakeholder contacts, GST billing profiles, and deals in one place.
                    </p>
                    <div className="mt-4">
                        <Button
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create First Organization</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <th className="py-3.5 px-4 sm:px-6">Organization</th>
                                    <th className="py-3.5 px-4">GSTIN / Tax ID</th>
                                    <th className="py-3.5 px-4">Contacts</th>
                                    <th className="py-3.5 px-4">Invoiced Total</th>
                                    <th className="py-3.5 px-4">Industry / Location</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredOrgs.map((org) => (
                                    <tr 
                                        key={org.id} 
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                                        onClick={() => setViewingOrg(org)}
                                    >
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black shrink-0">
                                                    {org.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 transition-colors">
                                                        {org.name}
                                                    </div>
                                                    {org.legal_name && (
                                                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                                            {org.legal_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {org.gstin ? (
                                                <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                    {org.gstin}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">Unregistered</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setViewingOrg(org)
                                                }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] transition-colors"
                                            >
                                                <Users className="w-3 h-3" />
                                                <span>{org.contacts_count || 0} Contacts</span>
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                                            ₹{(org.total_billed || 0).toLocaleString('en-IN')}
                                            <span className="block text-[10px] font-normal text-slate-400">
                                                {org.invoices_count || 0} invoices
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500">
                                            <span className="block text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                                                {org.industry || 'General Business'}
                                            </span>
                                            <span className="block text-[10px] text-slate-400">
                                                {org.city ? `${org.city}, ${org.state || ''}` : org.country || ''}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link href={`/invoices/new?organizationId=${org.id}&organizationName=${encodeURIComponent(org.name)}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[11px] h-7 px-2.5 font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                                        title="Generate Invoice for this Company"
                                                    >
                                                        Bill Org
                                                    </Button>
                                                </Link>
                                                <button
                                                    onClick={() => setEditingOrg(org)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Edit Company Details"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(org.id, org.name)}
                                                    disabled={isDeletingId === org.id}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                    title="Delete Company"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create / Edit Organization Modal */}
            <OrganizationModal
                isOpen={isCreateModalOpen || !!editingOrg}
                organization={editingOrg}
                onClose={() => {
                    setIsCreateModalOpen(false)
                    setEditingOrg(null)
                }}
                onSuccess={handleOrgSaved}
            />

            {/* View Organization Drawer & Contacts */}
            <OrganizationDrawer
                isOpen={!!viewingOrg}
                organization={viewingOrg}
                onClose={() => setViewingOrg(null)}
                onEditOrg={(org) => {
                    setViewingOrg(null)
                    setEditingOrg(org)
                }}
            />
        </div>
    )
}
