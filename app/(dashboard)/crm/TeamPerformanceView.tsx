'use client'

import { useMemo } from 'react'
import { CRMLead, CRMTeamMember, CRMStats } from "@/lib/crm-types"
import { Card, CardContent } from "@/components/ui/Card"
import { Users, Award, TrendingUp, DollarSign, Target, UserCheck, Flame, ArrowUpRight } from "lucide-react"

interface TeamPerformanceViewProps {
    leads: CRMLead[]
    teamMembers: CRMTeamMember[]
    stats: CRMStats | null
    onSelectMemberFilter: (memberId: string) => void
}

export function TeamPerformanceView({
    leads,
    teamMembers,
    stats,
    onSelectMemberFilter
}: TeamPerformanceViewProps) {
    // Calculate performance per member
    const memberStats = useMemo(() => {
        const map = new Map<string, {
            member: CRMTeamMember
            totalDeals: number
            wonDeals: number
            lostDeals: number
            activeDeals: number
            pipelineValue: number
            wonValue: number
        }>()

        // Initialize with all members
        teamMembers.forEach(m => {
            map.set(m.id, {
                member: m,
                totalDeals: 0,
                wonDeals: 0,
                lostDeals: 0,
                activeDeals: 0,
                pipelineValue: 0,
                wonValue: 0
            })
        })

        // Also add an 'unassigned' entry
        let unassignedDeals = 0
        let unassignedValue = 0

        leads.forEach(lead => {
            const memberId = lead.assigned_member_id
            const val = Number(lead.value || 0)

            if (memberId && map.has(memberId)) {
                const s = map.get(memberId)!
                s.totalDeals += 1
                if (lead.stage === 'won') {
                    s.wonDeals += 1
                    s.wonValue += val
                } else if (lead.stage === 'lost') {
                    s.lostDeals += 1
                } else {
                    s.activeDeals += 1
                    s.pipelineValue += val
                }
            } else {
                unassignedDeals += 1
                if (lead.stage !== 'lost') {
                    unassignedValue += val
                }
            }
        })

        return {
            members: Array.from(map.values()).sort((a, b) => b.wonValue - a.wonValue || b.totalDeals - a.totalDeals),
            unassigned: { deals: unassignedDeals, value: unassignedValue }
        }
    }, [leads, teamMembers])

    const topPerformer = memberStats.members[0]

    return (
        <div className="space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Team</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                {teamMembers.length} Members
                            </h3>
                            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Assigned to sales pipeline</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Performer</p>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1 truncate max-w-[140px]">
                                {topPerformer && topPerformer.wonValue > 0 ? topPerformer.member.name : '—'}
                            </h3>
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                                {topPerformer && topPerformer.wonValue > 0 ? `₹${topPerformer.wonValue.toLocaleString('en-IN')} closed` : 'No closed deals yet'}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Award className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Deals</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                {leads.length - memberStats.unassigned.deals} / {leads.length}
                            </h3>
                            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                                {memberStats.unassigned.deals > 0 ? `${memberStats.unassigned.deals} unassigned` : '100% deals allocated'}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Target className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unassigned Pool</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                ₹{memberStats.unassigned.value.toLocaleString('en-IN')}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                Across {memberStats.unassigned.deals} unassigned deals
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Leaderboard & Member Workload Table */}
            <Card className="border-gray-100 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Team Sales Leaderboard & Workload</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Track deal allocation, pipeline volume, and win conversions per member.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-gray-100 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                                <th className="py-3 px-4">Sales Member</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4 text-center">Active Deals</th>
                                <th className="py-3 px-4 text-right">Active Pipeline Value</th>
                                <th className="py-3 px-4 text-center">Won Deals</th>
                                <th className="py-3 px-4 text-right">Won Revenue</th>
                                <th className="py-3 px-4 text-center">Win Rate</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                            {memberStats.members.map((row, idx) => {
                                const totalClosed = row.wonDeals + row.lostDeals
                                const winRate = totalClosed > 0 ? Math.round((row.wonDeals / totalClosed) * 100) : 0

                                return (
                                    <tr key={row.member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                    {row.member.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                        <span>{row.member.name}</span>
                                                        {idx === 0 && row.wonValue > 0 && (
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                                                                🏆 Top
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">{row.member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                                                {row.member.role}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-semibold text-gray-800">
                                            {row.activeDeals}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-bold text-indigo-600">
                                            ₹{row.pipelineValue.toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                                            {row.wonDeals}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                                            ₹{row.wonValue.toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className="bg-emerald-500 h-1.5 rounded-full" 
                                                        style={{ width: `${winRate}%` }}
                                                    />
                                                </div>
                                                <span className="font-bold text-[11px] text-gray-600">{winRate}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <button
                                                onClick={() => onSelectMemberFilter(row.member.id)}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors"
                                                title="View member pipeline on Kanban"
                                            >
                                                <span>View Deals</span>
                                                <ArrowUpRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
