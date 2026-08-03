'use client'

import { useState } from 'react'
import { 
    FileText, Sparkles, BookOpen, ShoppingBag, DollarSign, Bot, 
    CheckCircle2, Building2, TrendingUp, ShieldCheck, Layers
} from 'lucide-react'

type TabKey = 'invoicing' | 'crm' | 'bookkeeping' | 'po' | 'payroll' | 'ai'

export function InteractiveFeaturePreview() {
    const [activeTab, setActiveTab] = useState<TabKey>('invoicing')

    const tabs = [
        { id: 'invoicing', label: 'GST Invoicing', icon: FileText },
        { id: 'crm', label: 'CRM & Pipeline', icon: Sparkles },
        { id: 'bookkeeping', label: 'Double-Entry Books', icon: BookOpen },
        { id: 'po', label: 'Purchase Orders', icon: ShoppingBag },
        { id: 'payroll', label: 'Payroll & Payslips', icon: DollarSign },
        { id: 'ai', label: 'AI Accountant', icon: Bot },
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
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                                isActive 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25 scale-105' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Interactive Card Preview Display - Clean Light Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 relative overflow-hidden">
                {/* Background glow accents */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50/80 rounded-full blur-3xl pointer-events-none" />

                {/* Content switching */}
                {activeTab === 'invoicing' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                <FileText className="h-3.5 w-3.5" /> Fast & Compliant
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Instant GST Invoice Generator
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Generate professional invoices with automatic CGST, SGST & IGST calculations, QR code payment integration, and instant WhatsApp/Email PDF delivery.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto Tax Calculation</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Custom Branding & Logo</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> WhatsApp Direct Share</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> E-Way Bill Ready</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 shadow-lg space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Tax Invoice</div>
                                    <div className="text-sm font-bold text-blue-600 font-mono">#INV-2026-889</div>
                                </div>
                                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    PAID VIA UPI
                                </span>
                            </div>
                            <div className="py-2 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-800">
                                    <span>Web Development & Consulting</span>
                                    <span className="font-mono font-bold">₹40,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>GST @ 18% (CGST 9% + SGST 9%)</span>
                                    <span className="font-mono">₹7,200.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-bold">
                                    <span className="text-slate-900">Total Paid</span>
                                    <span className="text-emerald-600 font-mono text-lg">₹47,200.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                <Sparkles className="h-3.5 w-3.5" /> Sales Growth Engine
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Visual Kanban Sales Pipeline
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Track every prospect from Lead to Closed Deal. Move deals through stages, schedule follow-up reminders, and forecast monthly revenue streams.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kanban Deal Stages</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Activity Follow-up Log</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Win Rate Analytics</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Lead Value Tracking</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 shadow-lg space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs">
                                <span className="font-bold text-indigo-700">Deal Pipeline (₹12.5L Total)</span>
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-sm font-semibold">6 Active Deals</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-xs">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">Proposal Sent</span>
                                    <p className="font-bold text-slate-900 mt-1">Enterprise Retainer</p>
                                    <p className="text-emerald-600 font-mono font-bold mt-0.5">₹3,50,000</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Won Deal 🎉</span>
                                    <p className="font-bold text-slate-900 mt-1">Cloud Migration</p>
                                    <p className="text-emerald-600 font-mono font-bold mt-0.5">₹5,00,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bookkeeping' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <BookOpen className="h-3.5 w-3.5" /> Full Double-Entry
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Audited General Ledger & CoA
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Complete Chart of Accounts, Journal Entries, Trial Balance, Profit & Loss, Balance Sheet, and Bank Reconciliation.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Chart of Accounts (CoA)</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Trial Balance Verification</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Automated P&L & Balance Sheet</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bank Statement Audit</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 shadow-lg space-y-2 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                                <span className="text-slate-900">Profit & Loss Statement</span>
                                <span className="text-emerald-600 font-mono">Net Profit: ₹1,85,000</span>
                            </div>
                            <div className="space-y-1.5 text-[11px] pt-1">
                                <div className="flex justify-between text-slate-700">
                                    <span>Operating Revenue (4010)</span>
                                    <span className="font-mono text-emerald-600 font-bold">+₹4,50,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>Salaries & Payroll (5300)</span>
                                    <span className="font-mono text-rose-600 font-bold">-₹2,10,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>Office Rent & Utilities (5100)</span>
                                    <span className="font-mono text-rose-600 font-bold">-₹55,000.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'po' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                <ShoppingBag className="h-3.5 w-3.5" /> Procurement Suite
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Vendor Purchase Orders
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Issue purchase orders to suppliers, manage delivery fulfillment, and automatically update inventory stock upon shipment receipt.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Vendor PO Generation</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto Inventory Stock-In</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Batch/Lot Numbering</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Partial Shipment Logs</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 shadow-lg space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <span className="font-mono font-bold text-amber-700">PO-20260803-902</span>
                                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 text-[10px]">
                                    PARTIALLY RECEIVED
                                </span>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                                <div className="flex justify-between font-bold text-slate-900">
                                    <span>Raw Material Components</span>
                                    <span>100 Units</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-500">
                                    <span>Received: 60 / 100</span>
                                    <span className="text-emerald-600 font-mono font-bold">Stock +60</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payroll' && (
                    <div className="grid lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                                <DollarSign className="h-3.5 w-3.5" /> Staff Management
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Automated Monthly Payroll
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Manage employee salary structures (Basic, HRA, PF, TDS), process monthly payroll runs in 1 click, and generate printable salary payslips.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Employee Directory</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> PF, ESI & TDS Deductions</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Printable Salary Payslips</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto Salary Journal Post</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 shadow-lg space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                                <span className="text-rose-700">Monthly Payslip (August 2026)</span>
                                <span className="text-emerald-600 font-mono">Net: ₹42,200</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-700">
                                <div className="flex justify-between">
                                    <span>Basic + HRA + Allowances</span>
                                    <span className="font-mono font-bold">₹45,000.00</span>
                                </div>
                                <div className="flex justify-between text-rose-600 font-bold">
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
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                                <Bot className="h-3.5 w-3.5" /> AI Accountant
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Smart AI Finance Assistant
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Ask questions in plain English or Hindi about tax liabilities, outstanding invoices, P&L trends, and GST compliance rules.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant GST Q&A</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Revenue Forecasting</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Expense Anomaly Alert</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> CA Verified Logic</div>
                            </div>
                        </div>

                        {/* Visual Mockup */}
                        <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 shadow-lg space-y-3 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-purple-200 text-purple-900 font-medium">
                                💬 "What is my GST tax liability for this quarter?"
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-slate-800 space-y-1">
                                <p className="font-bold text-purple-700">AI Assistant:</p>
                                <p>Based on your 24 invoices (₹4.2L revenue) and ₹1.1L eligible input tax credit, your net GST payable is <strong className="text-emerald-700">₹32,400</strong>.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
