'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
    MessageCircle, 
    X, 
    Send, 
    Headphones, 
    Sparkles, 
    Clock, 
    CheckCircle2, 
    ChevronDown, 
    AlertCircle, 
    Loader2,
    Ticket,
    ShieldCheck
} from 'lucide-react'
import { getCustomerSupportHistory, sendCustomerMessageAction } from '@/lib/support-actions'

interface ChatMessage {
    id: string
    sender: 'customer' | 'admin' | 'bot'
    text: string
    timestamp: string
}

const QUICK_HELP_TOPICS = [
    { title: 'Tally Prime XML Export', prompt: 'How do I export my daybook to Tally Prime?' },
    { title: 'CA Delegation & Access', prompt: 'How do I grant or revoke access for my Chartered Accountant?' },
    { title: 'GST Mismatch & Health', prompt: 'Where can I see GST compliance health and mismatch alerts?' },
    { title: 'Invoice Payment Date Edit', prompt: 'How do I update or correct an invoice payment date?' }
]

const BOT_KNOWLEDGE_BASE: Record<string, string> = {
    'tally': 'To export to Tally Prime: Navigate to **Bookkeeping** or **Financial Statements**, select your desired date range, and click the blue **Export Tally XML** button. Import the downloaded XML directly into Tally Prime via Import Data > Transactions.',
    'ca': 'To grant CA Access: Open **Settings > CA Access** or browse verified accountants in the **CA Marketplace**. Choose your scoped permission level (View-Only, Bookkeeping, or Full GST Filing) and set the validity period. You can revoke access anytime with one click.',
    'gst': 'GST Compliance: Visit **GST Reports** or the **Financial Statements** section. You will see your live GST health score, auto-computed GSTR-1 & GSTR-3B summaries, and real-time mismatch alerts flagged against your invoices.',
    'payment': 'Editing Payment Date: Open any Paid invoice, scroll to the **Payment History & Settlement** card, click the pencil icon next to the payment date, pick the correct date, and click **Save Date**. The payment record and general ledger will update immediately.'
}

export function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'chat' | 'tickets'>('chat')
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            sender: 'bot',
            text: 'Hello! Welcome to BillBook Support. How can we help your business today? You can select a quick topic below or type a message to reach our admin team.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const [inputText, setInputText] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [userTickets, setUserTickets] = useState<any[]>([])
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
            loadHistory()
        }
    }, [isOpen, messages])

    const loadHistory = async () => {
        if (hasLoadedHistory) return
        try {
            const history = await getCustomerSupportHistory()
            setUserTickets(history.tickets || [])
            if (history.tickets && history.tickets.length > 0) {
                const latest = history.tickets[0]
                setSelectedTicketId(latest.id)
                const existingMsgs = history.messagesByTicket[latest.id] || []
                if (existingMsgs.length > 0) {
                    const mapped: ChatMessage[] = existingMsgs.map(m => ({
                        id: m.id,
                        sender: m.is_internal ? 'admin' : (m.user_id ? 'customer' : 'admin'),
                        text: m.message,
                        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }))
                    setMessages(prev => [prev[0], ...mapped])
                }
            }
            setHasLoadedHistory(true)
        } catch (e) {
            console.error('Failed to load support history:', e)
        }
    }

    const handleSend = async (messageText: string) => {
        const text = messageText.trim()
        if (!text || isSending) return

        const userMsg: ChatMessage = {
            id: `usr-${Date.now()}`,
            sender: 'customer',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMsg])
        setInputText('')
        setIsSending(true)

        // Check if there's an instant bot knowledge match
        const lower = text.toLowerCase()
        let botReply: string | null = null
        if (lower.includes('tally')) botReply = BOT_KNOWLEDGE_BASE['tally']
        else if (lower.includes('ca') || lower.includes('chartered') || lower.includes('accountant') || lower.includes('delegat')) botReply = BOT_KNOWLEDGE_BASE['ca']
        else if (lower.includes('gst') || lower.includes('mismatch') || lower.includes('gstr')) botReply = BOT_KNOWLEDGE_BASE['gst']
        else if (lower.includes('payment') || lower.includes('date') || lower.includes('partial')) botReply = BOT_KNOWLEDGE_BASE['payment']

        // Send to backend so admin receives the ticket / chat message
        try {
            const res = await sendCustomerMessageAction({
                ticketId: selectedTicketId || undefined,
                message: text,
                subject: text.slice(0, 40)
            })

            if (res.ticketId && !selectedTicketId) {
                setSelectedTicketId(res.ticketId)
            }

            // If we have an instant answer, show it right away
            if (botReply) {
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `bot-${Date.now()}`,
                            sender: 'bot',
                            text: botReply!,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                    ])
                }, 400)
            } else {
                // Confirmation that ticket was dispatched to admin
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: `admin-ack-${Date.now()}`,
                            sender: 'admin',
                            text: "Your message has been assigned to our support desk. An admin or specialist will review and respond shortly.",
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                    ])
                }, 600)
            }
        } catch (e) {
            console.error('Error dispatching message:', e)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-90 font-sans">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    aria-label="Open Support & Live Chat"
                >
                    <div className="relative">
                        <Headphones className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
                    </div>
                    <span className="text-xs font-bold tracking-wide pr-1">Support & Help</span>
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="flex flex-col w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-4 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                                    <Headphones className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-sm leading-none">BillBook Desk</h3>
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-400/40">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                            Online
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-blue-100 mt-1">Live customer support & instant answers</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Close Support Chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-1 mt-3 bg-blue-800/40 p-1 rounded-xl text-xs">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                                    activeTab === 'chat' 
                                        ? 'bg-white text-blue-900 shadow-xs' 
                                        : 'text-blue-100 hover:text-white'
                                }`}
                            >
                                Live Chat & AI
                            </button>
                            <button
                                onClick={() => setActiveTab('tickets')}
                                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                                    activeTab === 'tickets' 
                                        ? 'bg-white text-blue-900 shadow-xs' 
                                        : 'text-blue-100 hover:text-white'
                                }`}
                            >
                                <Ticket className="w-3 h-3" />
                                <span>My Tickets ({userTickets.length})</span>
                            </button>
                        </div>
                    </div>

                    {/* Chat Content Body */}
                    {activeTab === 'chat' ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${
                                            msg.sender === 'customer' ? 'items-end' : 'items-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                                msg.sender === 'customer'
                                                    ? 'bg-blue-600 text-white rounded-br-xs'
                                                    : msg.sender === 'bot'
                                                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs rounded-bl-xs'
                                                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60 rounded-bl-xs'
                                            }`}
                                        >
                                            {msg.sender !== 'customer' && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-1">
                                                    {msg.sender === 'bot' ? (
                                                        <>
                                                            <Sparkles className="w-3 h-3 text-blue-500" />
                                                            <span>Instant Assistant</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                                                            <span>Admin Support</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                ))}

                                {isSending && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                        <span>Dispatching message to support desk...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Help Topics (Shown when short message count) */}
                            {messages.length <= 3 && (
                                <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                                        Common Questions
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_HELP_TOPICS.map((topic, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(topic.prompt)}
                                                className="text-[11px] font-medium bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-700 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors text-left cursor-pointer"
                                            >
                                                {topic.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Form */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSend(inputText)
                                }}
                                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type your question or issue..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                    disabled={isSending}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isSending}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                                    aria-label="Send Message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    ) : (
                        /* My Tickets Tab */
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                            {userTickets.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        No Tickets Yet
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        When you send a message in live chat, our system tracks it here with an SLA guarantee.
                                    </p>
                                </div>
                            ) : (
                                userTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {ticket.ticket_number}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                                ticket.status === 'resolved' || ticket.status === 'closed'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                            }`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                            {ticket.subject}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-2">
                                            {ticket.description}
                                        </p>
                                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="uppercase font-semibold">
                                                Priority: {ticket.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
