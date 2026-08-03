'use client'

import { useState, useEffect } from 'react'
import { CRMLead, CRMActivity, CRMStats } from "@/lib/crm-types"
import { getLeadsList, getActivitiesList, getCRMStats } from "@/lib/crm-actions"
import { KanbanBoard } from "./KanbanBoard"
import { LeadModal } from "./LeadModal"
import { ActivityTimeline } from "./ActivityTimeline"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Plus, Sparkles, TrendingUp, DollarSign, Award, Target, LayoutGrid, List, Clock, BarChart2 } from "lucide-react"

export default function CRMPage() {
    const [leads, setLeads] = useState<CRMLead[]>([])
    const [activities, setActivities] = useState<CRMActivity[]>([])
    const [stats, setStats] = useState<CRMStats | null>(null)
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'activities' | 'analytics'>('kanban')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null)

    const fetchData = async () => {
        setLoading(true)
        const [leadsData, activitiesData, statsData] = await Promise.all([
            getLeadsList(),
            getActivitiesList(),
            getCRMStats()
        ])
        setLeads(leadsData)
        setActivities(activitiesData)
        setStats(statsData)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenCreate = () => {
        setSelectedLead(null)
        setIsModalOpen(true)
    }

    const handleOpenEdit = (lead: CRMLead) => {
        setSelectedLead(lead)
        setIsModalOpen(true)
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
                        Track leads, manage deal stages, log client interactions, and forecast monthly revenue.
                    </p>
                </div>

                <Button 
                    onClick={handleOpenCreate}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                >
                    <Plus className="h-4 w-4" />
                    New Deal / Lead
                </Button>
            </div>

            {/* Stats Overview Grid */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pipeline Value</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    ₹{stats.pipelineValue.toLocaleString('en-IN')}
                                </h3>
                                <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Across all active stages</p>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <DollarSign className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Won Deals Value</p>
                                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                                    ₹{stats.wonDealsValue.toLocaleString('en-IN')}
                                </h3>
                                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{stats.stageCounts.won} closed deals</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Award className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Win Rate</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.winRate}%
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Won vs Lost ratio</p>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    {stats.totalLeads}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Active prospects</p>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                <Target className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('kanban')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                            activeTab === 'kanban' 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Kanban Board
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                            activeTab === 'activities' 
                                ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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
                    onEditLead={handleOpenEdit}
                    onRefresh={fetchData}
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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                leadToEdit={selectedLead}
                onSuccess={fetchData}
            />
        </div>
    )
}
