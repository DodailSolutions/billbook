'use client'

import { useState } from 'react'
import { Building2, Search, Edit, CheckCircle, Ban } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { BUSINESS_VERTICALS, type BusinessType } from '@/lib/business-profile-types'
import { ChangeVerticalModal } from '../users/ChangeVerticalModal'

interface Business {
    id: string
    business_name: string | null
    owner_name: string | null
    business_email: string | null
    gstin: string | null
    business_type?: string | null
    status: string
    created_at: string
}

export function BusinessesClientTable({ initialBusinesses }: { initialBusinesses: Business[] }) {
    const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
    const [search, setSearch] = useState('')
    const [verticalFilter, setVerticalFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [verticalModalData, setVerticalModalData] = useState<{
        id: string
        name: string
        email: string
        currentVertical?: string
    } | null>(null)
    const [toast, setToast] = useState<string | null>(null)

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const filtered = businesses.filter(b => {
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter
        const bType = b.business_type || 'retail'
        const matchesVertical = verticalFilter === 'all' || bType === verticalFilter
        const q = search.toLowerCase().trim()
        const matchesSearch = !q || 
            (b.business_name && b.business_name.toLowerCase().includes(q)) ||
            (b.owner_name && b.owner_name.toLowerCase().includes(q)) ||
            (b.business_email && b.business_email.toLowerCase().includes(q)) ||
            (b.gstin && b.gstin.toLowerCase().includes(q))
        return matchesStatus && matchesVertical && matchesSearch
    })

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Search businesses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={verticalFilter}
                        onChange={(e) => setVerticalFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                    >
                        <option value="all">All Industries</option>
                        {Object.values(BUSINESS_VERTICALS).map(v => (
                            <option key={v.id} value={v.id}>{v.icon} {v.name}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs">No businesses match your filters</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500">
                                <th className="text-left py-3 px-4">Business</th>
                                <th className="text-left py-3 px-4">Owner</th>
                                <th className="text-left py-3 px-4">Industry / Category</th>
                                <th className="text-left py-3 px-4">GSTIN</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Created</th>
                                <th className="text-right py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((business) => {
                                const rawType = (business.business_type as BusinessType) || 'retail'
                                const vert = BUSINESS_VERTICALS[rawType]

                                return (
                                    <tr key={business.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-xs">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {business.business_name || 'Unnamed'}
                                            </div>
                                            {business.business_email && (
                                                <div className="text-[11px] text-gray-500">{business.business_email}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                            {business.owner_name || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVerticalModalData({
                                                        id: business.id,
                                                        name: business.business_name || business.owner_name || 'Business',
                                                        email: business.business_email || '',
                                                        currentVertical: rawType
                                                    })
                                                }}
                                                title="Click to switch business category/vertical"
                                                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer text-left"
                                            >
                                                <span>{vert?.icon || '🏢'}</span>
                                                <span>{vert?.name || rawType}</span>
                                                <Edit className="h-3 w-3 text-slate-400 group-hover:text-purple-600 ml-0.5 opacity-60 group-hover:opacity-100" />
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-mono text-[11px]">
                                            {business.gstin || 'Not provided'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                business.status === 'active' 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {business.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {new Date(business.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVerticalModalData({
                                                        id: business.id,
                                                        name: business.business_name || business.owner_name || 'Business',
                                                        email: business.business_email || '',
                                                        currentVertical: rawType
                                                    })
                                                }}
                                                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                                            >
                                                Switch Vertical
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Change Vertical Modal */}
            {verticalModalData && (
                <ChangeVerticalModal
                    userId={verticalModalData.id}
                    userName={verticalModalData.name}
                    userEmail={verticalModalData.email}
                    currentVertical={verticalModalData.currentVertical}
                    onClose={() => setVerticalModalData(null)}
                    onSuccess={(newVert) => {
                        const vertName = BUSINESS_VERTICALS[newVert]?.name || newVert
                        showToast(`Updated vertical to ${vertName}`)
                        setBusinesses(prev => prev.map(b => {
                            if (b.id === verticalModalData.id) {
                                return { ...b, business_type: newVert }
                            }
                            return b
                        }))
                        setVerticalModalData(null)
                    }}
                />
            )}
        </div>
    )
}
