'use client'

import { useState } from 'react'
import { SupportTicketWithDetails, updateTicketStatus, addTicketReply } from '@/lib/support-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
    Clock, 
    AlertTriangle, 
    CheckCircle2, 
    MessageSquare, 
    Send, 
    User, 
    ShieldAlert, 
    Check, 
    ChevronDown, 
    Search, 
    Filter 
} from 'lucide-react'

interface SupportTicketsClientTableProps {
    initialTickets: SupportTicketWithDetails[]
}

const PRIORITY_BADGES = {
    urgent: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300',
    low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
}

const STATUS_BADGES = {
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    waiting: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
    resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    closed: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

export function SupportTicketsClientTable({ initialTickets }: SupportTicketsClientTableProps) {
    const [tickets, setTickets] = useState<SupportTicketWithDetails[]>(initialTickets)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedTicket, setSelectedTicket] = useState<SupportTicketWithDetails | null>(null)
    const [replyText, setReplyText] = useState('')
    const [isReplying, setIsReplying] = useState(false)
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type })
        setTimeout(() => setToastMessage(null), 3500)
    }

    const filteredTickets = tickets.filter(t => {
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter
        const matchesSearch = searchQuery === '' || 
            t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const handleStatusChange = async (ticketId: string, newStatus: any) => {
        setUpdatingStatusId(ticketId)
        try {
            const res = await updateTicketStatus(ticketId, newStatus)
            if (res.success) {
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
                if (selectedTicket?.id === ticketId) {
                    setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
                }
                showToast(`Ticket status updated to ${newStatus.replace('_', ' ')}`)
            } else {
                showToast(res.error || 'Failed to update ticket status', 'error')
            }
        } finally {
            setUpdatingStatusId(null)
        }
    }

    const handleSendReply = async () => {
        if (!selectedTicket || !replyText.trim()) return
        setIsReplying(true)
        try {
            const res = await addTicketReply(selectedTicket.id, replyText.trim(), false)
            if (res.success) {
                const updatedId = selectedTicket.id
                setReplyText('')
                setSelectedTicket(null)
                setTickets(prev => prev.map(t => t.id === updatedId ? { ...t, status: 'in_progress' } : t))
                showToast('Official response logged and sent to customer!')
            } else {
                showToast(res.error || 'Failed to send reply', 'error')
            }
        } catch (e: any) {
            console.error('Error sending reply:', e)
            showToast(e?.message || 'Failed to send reply', 'error')
        } finally {
            setIsReplying(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold text-white flex items-center justify-between shadow-md ${
                    toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                    <span>{toastMessage.text}</span>
                    <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100 text-sm">✕</button>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ticket #, subject, or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize whitespace-nowrap cursor-pointer transition-colors ${
                                statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets Table / Cards */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                                Active Inquiries ({filteredTickets.length})
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-500">
                                SLA target times: Urgent (4h), High (12h), Medium (24h)
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredTickets.length === 0 ? (
                        <div className="p-12 text-center text-xs text-gray-500">
                            No tickets matching your filter criteria.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredTickets.map((ticket) => (
                                <div 
                                    key={ticket.id}
                                    className="p-4 hover:bg-slate-50/60 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                                {ticket.ticket_number}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_BADGES[ticket.priority || 'medium']}`}>
                                                {ticket.priority || 'medium'}
                                            </span>
                                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_BADGES[ticket.status || 'open']}`}>
                                                {ticket.status?.replace('_', ' ')}
                                            </span>

                                            {/* SLA Indicator */}
                                            {ticket.is_sla_breached ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                                                    <AlertTriangle className="h-3 w-3" /> SLA Breached
                                                </span>
                                            ) : ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                    <Clock className="h-3 w-3" /> SLA: {ticket.sla_hours_remaining}h left
                                                </span>
                                            ) : null}
                                        </div>

                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {ticket.subject}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 font-medium">
                                                <User className="h-3 w-3" /> {ticket.user_name} ({ticket.user_email || 'Customer'})
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(ticket.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Action dropdown and quick response */}
                                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                                        <select
                                            value={ticket.status}
                                            disabled={updatingStatusId === ticket.id}
                                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold cursor-pointer"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="waiting">Waiting on Client</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="text-xs gap-1 h-8"
                                        >
                                            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                                            <span>Reply</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Reply Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                            <div>
                                <span className="font-mono text-xs font-bold text-blue-600">
                                    {selectedTicket.ticket_number}
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                    {selectedTicket.subject}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/60 text-xs text-gray-700 dark:text-gray-300">
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                Client Message ({selectedTicket.user_name}):
                            </p>
                            {selectedTicket.description}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Official Admin Response:
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Type your response to the customer..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTicket(null)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                disabled={isReplying || !replyText.trim()}
                                onClick={handleSendReply}
                                className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Send className="h-3 w-3" />
                                {isReplying ? 'Sending...' : 'Send to Customer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
