'use client'

import { useState } from 'react'
import { 
    FileText, Sparkles, BookOpen, ShoppingBag, DollarSign, Bot, 
    CheckCircle2, ArrowRight, Building2, TrendingUp, ShieldCheck, Layers, PackageCheck
} from 'lucide-react'

type TabKey = 'invoicing' | 'crm' | 'bookkeeping' | 'po' | 'payroll' | 'ai'

export function InteractiveFeaturePreview() {
    const [activeTab, setActiveTab] = useState<TabKey>('invoicing')

    const tabs = [
        { id: 'invoicing', label: 'GST Invoicing', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { id: 'crm', label: 'CRM & Pipeline', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
        { id: 'bookkeeping', label: 'Double-Entry Books', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        { id: 'po', label: 'Purchase Orders', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        { id: 'payroll', label: 'Payroll & Payslips', icon: DollarSign, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        { id: 'ai', label: 'AI Accountant', icon: Bot, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    ] as const

    return (
        <div className="space-y-8">
            {/* Tab selector bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start lg:justify-center">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabKey)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                                isActive 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : ''}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Interactive Card Preview Display */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-700/50 relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Content switching */}
                {activeTab === 'invoicing' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                <FileText className="h-3.5 w-3.5" /> Fast & Compliant
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Instant GST Invoice Generator
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Generate professional invoices with automatic CGST, SGST & IGST calculations, QR code payment integration, and instant WhatsApp/Email PDF delivery.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Auto Tax Calculation</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Custom Branding & Logo</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> WhatsApp Direct Share</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> E-Way Bill Ready</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 backdrop-blur-md shadow-xl">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Tax Invoice</div>
                                    <div className="text-sm font-bold text-blue-400 font-mono">#INV-2026-889</div>
                                </div>
                                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    PAID VIA UPI
                                </span>
                            </div>
                            <div className="py-4 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-300">
                                    <span>Web Development & Consulting</span>
                                    <span className="font-mono font-bold">₹40,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-[11px]">
                                    <span>GST @ 18% (CGST 9% + SGST 9%)</span>
                                    <span className="font-mono">₹7,200.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-700 text-sm font-bold">
                                    <span className="text-white">Total Paid</span>
                                    <span className="text-emerald-400 font-mono text-lg">₹47,200.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                <Sparkles className="h-3.5 w-3.5" /> Sales Growth Engine
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Visual Kanban Sales Pipeline
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Track every prospect from Lead to Closed Deal. Move deals through stages, schedule follow-up reminders, and forecast monthly revenue streams.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Kanban Deal Stages</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Activity Follow-up Log</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Win Rate Analytics</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Lead Value Tracking</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 backdrop-blur-md shadow-xl space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-700 text-xs">
                                <span className="font-bold text-indigo-400">Deal Pipeline (₹12.5L Total)</span>
                                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-sm">6 Active Deals</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-500/30">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase">Proposal Sent</span>
                                    <p className="font-bold text-white mt-1">Enterprise Retainer</p>
                                    <p className="text-emerald-400 font-mono font-bold mt-0.5">₹3,50,000</p>
                                </div>
                                <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Won Deal 🎉</span>
                                    <p className="font-bold text-white mt-1">Cloud Migration</p>
                                    <p className="text-emerald-400 font-mono font-bold mt-0.5">₹5,00,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bookkeeping' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <BookOpen className="h-3.5 w-3.5" /> Full Double-Entry
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Audited General Ledger & CoA
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Complete Chart of Accounts, Journal Entries, Trial Balance, Profit & Loss, Balance Sheet, and Bank Reconciliation.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Chart of Accounts (CoA)</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Trial Balance Verification</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Automated P&L & Balance Sheet</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Bank Statement Audit</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 backdrop-blur-md shadow-xl space-y-2 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-700 font-bold">
                                <span>Profit & Loss Statement</span>
                                <span className="text-emerald-400 font-mono">Net Profit: ₹1,85,000</span>
                            </div>
                            <div className="space-y-1.5 text-[11px] pt-1">
                                <div className="flex justify-between text-slate-300">
                                    <span>Operating Revenue (4010)</span>
                                    <span className="font-mono text-emerald-400">+₹4,50,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Salaries & Payroll (5300)</span>
                                    <span className="font-mono text-rose-400">-₹2,10,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Office Rent & Utilities (5100)</span>
                                    <span className="font-mono text-rose-400">-₹55,000.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'po' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <ShoppingBag className="h-3.5 w-3.5" /> Procurement Suite
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Vendor Purchase Orders
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Issue purchase orders to suppliers, manage delivery fulfillment, and automatically update inventory stock upon shipment receipt.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Vendor PO Generation</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Auto Inventory Stock-In</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Batch/Lot Numbering</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Partial Shipment Logs</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 backdrop-blur-md shadow-xl space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                                <span className="font-mono font-bold text-amber-400">PO-20260803-902</span>
                                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                                    PARTIALLY RECEIVED
                                </span>
                            </div>
                            <div className="p-3 bg-slate-900/90 rounded-xl space-y-1.5">
                                <div className="flex justify-between font-bold">
                                    <span>Raw Material Components</span>
                                    <span>100 Units</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-400">
                                    <span>Received: 60 / 100</span>
                                    <span className="text-emerald-400 font-mono font-bold">Stock +60</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payroll' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <DollarSign className="h-3.5 w-3.5" /> Staff Management
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Automated Monthly Payroll
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Manage employee salary structures (Basic, HRA, PF, TDS), process monthly payroll runs in 1 click, and generate printable salary payslips.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Employee Directory</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> PF, ESI & TDS Deductions</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Printable Salary Payslips</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Auto Salary Journal Post</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 backdrop-blur-md shadow-xl space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-700 font-bold">
                                <span className="text-rose-400">Monthly Payslip (August 2026)</span>
                                <span className="text-emerald-400 font-mono">Net: ₹42,200</span>
                            </div>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between text-slate-300">
                                    <span>Basic + HRA + Allowances</span>
                                    <span className="font-mono">₹45,000.00</span>
                                </div>
                                <div className="flex justify-between text-rose-400">
                                    <span>PF & TDS Deductions</span>
                                    <span className="font-mono">-₹2,800.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                <Bot className="h-3.5 w-3.5" /> AI Accountant
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Smart AI Finance Assistant
                            </h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Ask questions in plain English or Hindi about tax liabilities, outstanding invoices, P&L trends, and GST compliance rules.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant GST Q&A</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Revenue Forecasting</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Expense Anomaly Alert</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> CA Verified Logic</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 backdrop-blur-md shadow-xl space-y-3 text-xs">
                            <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 text-purple-200">
                                💬 "What is my GST tax liability for this quarter?"
                            </div>
                            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/20 text-slate-200 space-y-1">
                                <p className="font-bold text-purple-400">AI Assistant:</p>
                                <p>Based on your 24 invoices (₹4.2L revenue) and ₹1.1L eligible input tax credit, your net GST payable is <strong className="text-emerald-400">₹32,400</strong>.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
