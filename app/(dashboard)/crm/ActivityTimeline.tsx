'use client'

import { useState } from 'react'
import { CRMActivity, ActivityType } from "@/lib/crm-types"
import { createActivity, toggleActivityCompleted } from "@/lib/crm-actions"
import { Button } from "@/components/ui/Button"
import { Phone, Mail, Calendar, FileText, CheckCircle2, Clock, Plus, Tag } from "lucide-react"

interface ActivityTimelineProps {
    activities: CRMActivity[]
    leadId?: string
    onRefresh?: () => void
}

export function ActivityTimeline({ activities, leadId, onRefresh }: ActivityTimelineProps) {
    const [type, setType] = useState<ActivityType>('call')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        const res = await createActivity({
            lead_id: leadId,
            type,
            title: title.trim(),
            description: description.trim() || undefined,
            due_date: dueDate ? new Date(dueDate).toISOString() : undefined
        })
        setLoading(false)

        if (res.success) {
            setTitle('')
            setDescription('')
            setDueDate('')
            setIsAdding(false)
            onRefresh?.()
        }
    }

    const handleToggle = async (id: string, current: boolean) => {
        await toggleActivityCompleted(id, !current)
        onRefresh?.()
    }

    const getActivityIcon = (actType: ActivityType) => {
        switch (actType) {
            case 'call': return <Phone className="h-4 w-4 text-blue-500" />
            case 'email': return <Mail className="h-4 w-4 text-purple-500" />
            case 'meeting': return <Calendar className="h-4 w-4 text-amber-500" />
            case 'task': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            default: return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    Activities & Interaction Timeline
                </h3>
                <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAdding(!isAdding)}
                    className="gap-1 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Log Activity
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as ActivityType)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            >
                                <option value="call">Phone Call 📞</option>
                                <option value="email">Email ✉️</option>
                                <option value="meeting">Meeting 🤝</option>
                                <option value="task">Task / Follow-up 📋</option>
                                <option value="note">Internal Note 📝</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Activity Title *</label>
                            <input
                                type="text"
                                required
                                placeholder="Followed up on pricing quotation"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Due Date / Reminder</label>
                            <input
                                type="datetime-local"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Description</label>
                            <input
                                type="text"
                                placeholder="Details of the conversation..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                            {loading ? 'Saving...' : 'Save Activity'}
                        </Button>
                    </div>
                </form>
            )}

            {activities.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-gray-500">No activity logs recorded yet.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {activities.map((act) => (
                        <div 
                            key={act.id} 
                            className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                act.completed ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-gray-100 shadow-2xs hover:border-gray-200'
                            }`}
                        >
                            <button
                                onClick={() => handleToggle(act.id, act.completed)}
                                className={`p-1.5 sm:p-1 rounded-full border transition-colors mt-0.5 ${
                                    act.completed 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'border-gray-300 text-transparent hover:border-emerald-500'
                                }`}
                                title={act.completed ? "Mark incomplete" : "Mark completed"}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 bg-slate-100 rounded-md">
                                        {getActivityIcon(act.type)}
                                    </span>
                                    <span className={`text-xs font-semibold ${act.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        {act.title}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-md">
                                        {act.type}
                                    </span>
                                </div>

                                {act.description && (
                                    <p className="text-xs text-gray-600 mt-1 pl-7">
                                        {act.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 mt-1.5 pl-7 text-[10px] text-gray-400">
                                    <span>Added {new Date(act.created_at).toLocaleDateString()}</span>
                                    {act.due_date && (
                                        <span className="text-indigo-600 font-medium">
                                            Due: {new Date(act.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
