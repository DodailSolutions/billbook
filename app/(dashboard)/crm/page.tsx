'use client'

import { useState, useEffect } from 'react'
import { CRMLead, CRMActivity, CRMStats, CRMTeamMember } from "@/lib/crm-types"
import { getLeadsList, getActivitiesList, getCRMStats, getCRMTeamMembers } from "@/lib/crm-actions"
import { KanbanBoard } from "./KanbanBoard"
import { LeadModal } from "./LeadModal"
import { LeadImportModal } from "./LeadImportModal"
import { TeamPerformanceView } from "./TeamPerformanceView"
import { ActivityTimeline } from "./ActivityTimeline"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { 
    Plus, Sparkles, TrendingUp, DollarSign, Award, Target, 
    LayoutGrid, Clock, Users, FileSpreadsheet, Download, RefreshCw 
} from "lucide-react"

export default function CRMPage() {
    const [leads, setLeads] = useState<CRMLead[]>([])
    const [activities, setActivities] = useState<CRMActivity[]>([])
    const [stats, setStats] = useState<CRMStats | null>(null)
    const [teamMembers, setTeamMembers] = useState<CRMTeamMember[]>([])
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'kanban' | 'team' | 'activities'>('kanban')
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null)
    const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all')

    const fetchData = async () => {
        setLoading(true)
        const [leadsData, activitiesData, statsData, membersData] = await Promise.all([
            getLeadsList(),
            getActivitiesList(),
            getCRMStats(),
            getCRMTeamMembers()
        ])
        setLeads(leadsData)
        setActivities(activitiesData)
        setStats(statsData)
        setTeamMembers(membersData)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenCreate = () => {
        setSelectedLead(null)
        setIsLeadModalOpen(true)
    }

    const handleOpenEdit = (lead: CRMLead) => {
        setSelectedLead(lead)
        setIsLeadModalOpen(true)
    }

    const handleMemberFilterFromTeam = (memberId: string) => {
        setSelectedMemberFilter(memberId)
        setActiveTab('kanban')
    }

    const handleExportLeads = () => {
        if (leads.length === 0) return

        const headers = [
            'ID', 'Title', 'Company', 'Contact', 'Email', 'Phone', 
            'Value', 'Currency', 'Stage', 'Probability', 'Source', 
            'Assigned Member', 'Created Date'
        ]

        const escapeCSV = (val: string) => {
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`
            }
            return val
        }

        const rows = leads.map(l => [
            l.id,
            escapeCSV(l.title || ''),
            escapeCSV(l.company_name || ''),
            escapeCSV(l.contact_name || ''),
            escapeCSV(l.email || ''),
            escapeCSV(l.phone || ''),
            l.value.toString(),
            l.currency,
            l.stage,
            `${l.probability}%`,
            l.source,
            escapeCSV(l.assigned_member?.name || l.assigned_to || 'Unassigned'),
            new Date(l.created_at).toLocaleDateString('en-IN')
        ])

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `billbook_crm_export_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            CRM & Sales Pipeline
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Track leads, assign sales reps, sync Google Sheets/Excel, and close deals into ERP invoices.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportLeads}
                        className="gap-1.5 text-xs text-gray-700 hover:bg-gray-100"
                        title="Export leads to CSV"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                        className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                        Import Leads
                    </Button>

                    <Button 
                        onClick={handleOpenCreate}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                    >
                        <Plus className="h-4 w-4" />
                        New Deal / Lead
                    </Button>
                </div>
            </div>

            {/* Stats Overview Grid */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pipeline Value</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                    ₹{stats.pipelineValue.toLocaleString('en-IN')}
                                </h3>
                                <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Across all active stages</p>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Won Deals Value</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                                    ₹{stats.wonDealsValue.toLocaleString('en-IN')}
                                </h3>
                                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{stats.stageCounts.won} closed deals</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Win Rate</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                    {stats.winRate}%
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Won vs Lost ratio</p>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Prospects</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                    {stats.totalLeads} Deals
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                    {teamMembers.length} team members
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Smart Pipeline Intelligence Banner */}
            {stats && (
                <div className="bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-900">ERP Sales Copilot & Forecasting</h4>
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Automated</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Weighted pipeline projection is <span className="font-bold text-indigo-700">₹{(stats.weightedForecast || 0).toLocaleString('en-IN')}</span> across {stats.totalLeads} active opportunities.
                                {stats.hotDealsCount ? ` 🔥 ${stats.hotDealsCount} hot deals ready to close.` : ''}
                                {stats.staleDealsCount ? ` ⚠️ ${stats.staleDealsCount} deals haven't been touched in over 7 days.` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-indigo-100 text-right">
                            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Weighted Forecast</span>
                            <span className="text-sm font-bold text-indigo-600">₹{(stats.weightedForecast || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('kanban')}
                        className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 ${
                            activeTab === 'kanban' 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Kanban Pipeline ({leads.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 ${
                            activeTab === 'team' 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        Team Workload & Leaderboard ({teamMembers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 ${
                            activeTab === 'activities' 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        Activity Logs ({activities.length})
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : activeTab === 'kanban' ? (
                <KanbanBoard 
                    leads={leads}
                    teamMembers={teamMembers}
                    onEditLead={handleOpenEdit}
                    onRefresh={fetchData}
                    selectedMemberFilter={selectedMemberFilter}
                    onMemberFilterChange={setSelectedMemberFilter}
                />
            ) : activeTab === 'team' ? (
                <TeamPerformanceView 
                    leads={leads}
                    teamMembers={teamMembers}
                    stats={stats}
                    onSelectMemberFilter={handleMemberFilterFromTeam}
                />
            ) : (
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-6">
                        <ActivityTimeline 
                            activities={activities}
                            onRefresh={fetchData}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Lead Edit / Create Modal */}
            <LeadModal 
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                leadToEdit={selectedLead}
                teamMembers={teamMembers}
                onSuccess={fetchData}
            />

            {/* Lead Import Modal */}
            <LeadImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                teamMembers={teamMembers}
                onSuccess={fetchData}
            />
        </div>
    )
}
