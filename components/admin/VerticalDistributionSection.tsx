'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
    Layers, 
    TrendingUp, 
    Users, 
    ArrowRight, 
    Search, 
    Sparkles, 
    AlertCircle, 
    FileText, 
    Building2,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { VerticalAnalyticsSummary, VerticalDistributionStat } from '@/lib/types-admin'

interface VerticalDistributionSectionProps {
    data: VerticalAnalyticsSummary
}

type FilterTab = 'all' | 'active' | 'untapped'

export function VerticalDistributionSection({ data }: VerticalDistributionSectionProps) {
    const [selectedTab, setSelectedTab] = useState<FilterTab>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredVerticals = data.verticals.filter(v => {
        const matchesTab = 
            selectedTab === 'all' ? true :
            selectedTab === 'active' ? v.userCount > 0 :
            v.userCount === 0

        const matchesSearch = 
            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.tagline.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesTab && matchesSearch
    })

    const statusBadge = (status: VerticalDistributionStat['status']) => {
        switch (status) {
            case 'leader':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        🔥 Leader
                    </span>
                )
            case 'growing':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        <TrendingUp className="w-2.5 h-2.5" />
                        📈 Growing
                    </span>
                )
            case 'early':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        🌱 Early Stage
                    </span>
                )
            case 'untapped':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        ⭕ Untapped (0)
                    </span>
                )
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-6">
            {/* Header & KPI Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Industry Vertical Intelligence
                            </h3>
                            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                                {data.verticals.length} Verticals
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Monitor tenant distribution, high-growth verticals, and discover untapped market segments.
                        </p>
                    </div>
                </div>

                {/* Quick KPI stats */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Top Vertical:</span>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {data.topVertical ? `${data.topVertical.name} (${data.topVertical.percentage}%)` : 'None yet'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-xs">
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">Untapped:</span>
                        <span className="font-extrabold text-rose-700 dark:text-rose-300">
                            {data.totalUntappedVerticals} Verticals
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls: Search & Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    <button
                        onClick={() => setSelectedTab('all')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            selectedTab === 'all'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        All Verticals ({data.verticals.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('active')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            selectedTab === 'active'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        Active ({data.totalActiveVerticals})
                    </button>
                    <button
                        onClick={() => setSelectedTab('untapped')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            selectedTab === 'untapped'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        Untapped / Zero Users ({data.totalUntappedVerticals})
                    </button>
                </div>

                {/* Search input */}
                <div className="relative min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search industry or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Verticals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredVerticals.map((vert) => {
                    const isUntapped = vert.userCount === 0

                    return (
                        <div
                            key={vert.id}
                            className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                                isUntapped
                                    ? 'bg-slate-50/60 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-700/80 opacity-80 hover:opacity-100'
                                    : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-purple-300 dark:hover:border-purple-700'
                            }`}
                        >
                            <div>
                                {/* Top Row: Icon & Status */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                                            {vert.icon}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                {vert.name}
                                            </h4>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                {vert.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {statusBadge(vert.status)}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                                    {vert.tagline}
                                </p>

                                {/* Progress bar for market share */}
                                <div className="space-y-1 mb-3">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {vert.userCount} {vert.userCount === 1 ? 'Tenant' : 'Tenants'}
                                        </span>
                                        <span className="font-bold text-slate-500 dark:text-slate-400">
                                            {vert.percentage}% share
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                isUntapped
                                                    ? 'bg-slate-300 dark:bg-slate-700'
                                                    : vert.status === 'leader'
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                            }`}
                                            style={{ width: `${Math.max(vert.percentage, isUntapped ? 0 : 4)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Metrics & Direct Filter Link */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                                    <span title="Active User Accounts">
                                        🟢 {vert.activeUserCount} Active
                                    </span>
                                    <span title="Invoices Issued">
                                        📄 {vert.totalInvoices} Invoices
                                    </span>
                                </div>

                                {isUntapped ? (
                                    <span className="text-[11px] font-semibold text-slate-400">
                                        Untapped Market
                                    </span>
                                ) : (
                                    <Link
                                        href={`/admin/users?vertical=${vert.id}`}
                                        className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 text-[11px] group"
                                    >
                                        <span>View Users</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredVerticals.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                    No industry verticals match your search filter.
                </div>
            )}
        </div>
    )
}
