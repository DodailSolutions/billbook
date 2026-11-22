'use client'

import { useState } from 'react'
import { 
    Clock, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle2, 
    Flame, 
    Briefcase, 
    DollarSign, 
    Edit2, 
    Save, 
    X, 
    ExternalLink,
    Percent,
    Shield
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
    type EnhancedTeamMember, 
    getCapacityMetric, 
    calculateGrossMargin,
    VERTICAL_TEAM_DESIGNATIONS 
} from '@/lib/team-types'
import { updateTeamMemberCapacity } from './actions'

interface TeamCapacityRadarProps {
    members: EnhancedTeamMember[]
    verticalId?: string
    isOwnerOrAdmin?: boolean
}

export function TeamCapacityRadar({ members, verticalId = 'software_it', isOwnerOrAdmin = true }: TeamCapacityRadarProps) {
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{
        designation: string
        allocated_hours: number
        hourly_cost_rate: number
        hourly_billing_rate: number
    }>({
        designation: '',
        allocated_hours: 40,
        hourly_cost_rate: 0,
        hourly_billing_rate: 0
    })
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Designations tailored to the vertical
    const availableDesignations = VERTICAL_TEAM_DESIGNATIONS[verticalId] || VERTICAL_TEAM_DESIGNATIONS.default

    // Aggregate statistics
    const totalMembers = members.length
    const totalWeeklyCapacity = totalMembers * 40
    const totalAllocated = members.reduce((sum, m) => sum + (Number(m.allocated_hours) || 40), 0)
    const overallUtilization = totalWeeklyCapacity > 0 ? Math.round((totalAllocated / totalWeeklyCapacity) * 100) : 0

    const benchRiskMembers = members.filter(m => (Number(m.allocated_hours) || 40) < 20)
    const burnoutMembers = members.filter(m => (Number(m.allocated_hours) || 40) > 40)

    const startEditing = (member: EnhancedTeamMember) => {
        setEditingMemberId(member.id)
        setEditForm({
            designation: member.designation || availableDesignations[0] || 'Team Member',
            allocated_hours: Number(member.allocated_hours) || 40,
            hourly_cost_rate: Number(member.hourly_cost_rate) || 0,
            hourly_billing_rate: Number(member.hourly_billing_rate) || 0
        })
        setSaveError(null)
    }

    const cancelEditing = () => {
        setEditingMemberId(null)
        setSaveError(null)
    }

    const handleSave = async (memberId: string) => {
        setSaving(true)
        setSaveError(null)
        try {
            const res = await updateTeamMemberCapacity({
                memberId,
                designation: editForm.designation,
                allocated_hours: editForm.allocated_hours,
                hourly_cost_rate: editForm.hourly_cost_rate,
                hourly_billing_rate: editForm.hourly_billing_rate
            })

            if (res.success) {
                setEditingMemberId(null)
            } else {
                setSaveError(res.error || 'Failed to update capacity details')
            }
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : 'Error updating capacity')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Executive Capacity Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Weekly Available</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {totalAllocated} <span className="text-xs font-normal text-slate-400">/ {totalWeeklyCapacity} hrs</span>
                                </p>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>Team Standard: 40h/wk</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalMembers} Members</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Team Utilization</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {overallUtilization}%
                                </p>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-900">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    overallUtilization > 100 ? 'bg-rose-500' : overallUtilization < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${Math.min(overallUtilization, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bench Warning</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">
                                    {benchRiskMembers.length} <span className="text-xs font-normal text-slate-400">members</span>
                                </p>
                            </div>
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-900">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">
                            Allocated &lt; 20 hrs/week (Overhead risk)
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overcommitted</p>
                                <p className="text-2xl font-bold text-rose-600 mt-1">
                                    {burnoutMembers.length} <span className="text-xs font-normal text-slate-400">members</span>
                                </p>
                            </div>
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900">
                                <Flame className="w-5 h-5 text-rose-600" />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">
                            Exceeding 40 hrs/week capacity
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Workload & Capacity Table */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <span>Team Capacity & Role Allocation Radar</span>
                                <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                    LIVE WORKLOAD
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Track weekly allocated capacity, functional designations, and real-time gross margin per resource.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/crm">
                                <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                                    View CRM Deal Allocations
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {saveError && (
                        <div className="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{saveError}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {members.map(member => {
                            const hours = Number(member.allocated_hours) || 40
                            const metric = getCapacityMetric(hours)
                            const costRate = Number(member.hourly_cost_rate) || 0
                            const billRate = Number(member.hourly_billing_rate) || 0
                            const grossMargin = calculateGrossMargin(costRate, billRate)
                            const isEditing = editingMemberId === member.id

                            return (
                                <div 
                                    key={member.id} 
                                    className={`p-4 rounded-xl border transition-all ${
                                        isEditing 
                                            ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm' 
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        {/* Member identity & role */}
                                        <div className="flex items-start gap-3 min-w-[240px]">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                                {member.email.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                                        {member.email}
                                                    </p>
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                                                        {member.role?.name || 'Staff'}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span>{member.designation || 'Specialist / Contributor'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Workload bar */}
                                        <div className="flex-1 max-w-md">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                    Weekly Allocation: <strong className="text-slate-900 dark:text-slate-100">{hours} hrs</strong> / 40h
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metric.badgeClass}`}>
                                                    {metric.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${metric.barClass} transition-all duration-300`} 
                                                    style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Financial Margins (Shielded for Owner/Admin) */}
                                        {isOwnerOrAdmin && (
                                            <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-medium">Cost / hr</p>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                                        {costRate > 0 ? `₹${costRate.toLocaleString()}` : '—'}
                                                    </p>
                                                </div>
                                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-medium">Bill / hr</p>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                                        {billRate > 0 ? `₹${billRate.toLocaleString()}` : '—'}
                                                    </p>
                                                </div>
                                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-medium">Margin</p>
                                                    <p className={`font-bold mt-0.5 ${grossMargin >= 40 ? 'text-emerald-600' : grossMargin > 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                                                        {grossMargin > 0 ? `${grossMargin}%` : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {isOwnerOrAdmin && !isEditing && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => startEditing(member)}
                                                    className="h-8 text-xs gap-1 border-slate-200 dark:border-slate-700"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Configure</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inline Edit Form */}
                                    {isEditing && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                                                    Industry Designation
                                                </label>
                                                <input 
                                                    type="text" 
                                                    list="designation-suggestions"
                                                    value={editForm.designation}
                                                    onChange={e => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                                                    placeholder="e.g. Tech Lead, Media Buyer"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                                <datalist id="designation-suggestions">
                                                    {availableDesignations.map(d => (
                                                        <option key={d} value={d} />
                                                    ))}
                                                </datalist>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                                                    Weekly Allocation (Hours)
                                                </label>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    max="80"
                                                    value={editForm.allocated_hours}
                                                    onChange={e => setEditForm(prev => ({ ...prev, allocated_hours: Number(e.target.value) || 0 }))}
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                                                    Hourly Cost Rate (₹)
                                                </label>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={editForm.hourly_cost_rate}
                                                    onChange={e => setEditForm(prev => ({ ...prev, hourly_cost_rate: Number(e.target.value) || 0 }))}
                                                    placeholder="CTC / 160h"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                                                    Hourly Billing Rate (₹)
                                                </label>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={editForm.hourly_billing_rate}
                                                    onChange={e => setEditForm(prev => ({ ...prev, hourly_billing_rate: Number(e.target.value) || 0 }))}
                                                    placeholder="Rate to Client"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={cancelEditing}
                                                    disabled={saving}
                                                    className="text-xs h-8"
                                                >
                                                    <X className="w-3.5 h-3.5 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleSave(member.id)}
                                                    disabled={saving}
                                                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                                                >
                                                    {saving ? 'Saving...' : (
                                                        <>
                                                            <Save className="w-3.5 h-3.5 mr-1" />
                                                            Save Capacity Details
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {members.length === 0 && (
                            <div className="py-8 text-center text-slate-500 text-xs">
                                No team members added yet. Invite team members to begin tracking capacity and billable workload.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
