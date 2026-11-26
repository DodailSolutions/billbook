'use client'

import { useMemo, useState } from 'react'
import { Download, Search, Shield, Clock, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface AuditLogRow {
    id: string
    user_id?: string | null
    action: string
    entity_type?: string | null
    entity_id?: string | null
    details?: Record<string, any> | string | null
    ip_address?: string | null
    created_at: string
}

export default function AuditLogsClientView({ logs }: { logs: AuditLogRow[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [actionFilter, setActionFilter] = useState('all')

    const uniqueActions = useMemo(() => {
        const set = new Set<string>()
        logs.forEach((l) => {
            if (l.action) set.add(l.action)
        })
        return Array.from(set).sort()
    }, [logs])

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            if (actionFilter !== 'all' && log.action !== actionFilter) return false
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const detailsText =
                    typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {})
                return (
                    (log.action || '').toLowerCase().includes(q) ||
                    (log.entity_type || '').toLowerCase().includes(q) ||
                    (log.entity_id || '').toLowerCase().includes(q) ||
                    (log.user_id || '').toLowerCase().includes(q) ||
                    detailsText.toLowerCase().includes(q)
                )
            }
            return true
        })
    }, [logs, actionFilter, searchQuery])

    const exportCsv = () => {
        const headers = ['ID', 'Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID', 'IP Address', 'Details']
        const rows = filteredLogs.map((l) => [
            l.id,
            l.created_at,
            l.action,
            l.entity_type || '',
            l.entity_id || '',
            l.user_id || '',
            l.ip_address || '',
            `"${(typeof l.details === 'string' ? l.details : JSON.stringify(l.details || {})).replace(/"/g, '""')}"`,
        ])
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billbook-audit-logs-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex flex-1 gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search action, entity, user ID, details..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                    </div>
                    <div className="relative flex items-center">
                        <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5 hidden sm:block" />
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                        >
                            <option value="all">All Actions ({logs.length})</option>
                            {uniqueActions.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    Export CSV ({filteredLogs.length})
                </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider">
                            <th className="p-3 font-semibold">Timestamp</th>
                            <th className="p-3 font-semibold">Action</th>
                            <th className="p-3 font-semibold">Entity</th>
                            <th className="p-3 font-semibold">User</th>
                            <th className="p-3 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                    No audit logs match your filter.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                    <td className="p-3 whitespace-nowrap text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(log.created_at).toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                            <Shield className="h-3 w-3" />
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                        {log.entity_type || '—'} {log.entity_id ? `(${log.entity_id.slice(0, 8)}…)` : ''}
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-500">
                                        {log.user_id ? `${log.user_id.slice(0, 8)}…` : 'System'}
                                    </td>
                                    <td className="p-3 max-w-sm truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                        {typeof log.details === 'string'
                                            ? log.details
                                            : log.details
                                              ? JSON.stringify(log.details)
                                              : '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
