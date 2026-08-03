'use client'

import { useState } from 'react'
import { 
    FileText, Sparkles, BookOpen, ShoppingBag, DollarSign, Bot, 
    CheckCircle2, ArrowRight, Layers, ShieldCheck
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
            {/* Apple-style Segmented Control Pill Bar */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-full border border-slate-200/80 max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabKey)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                isActive 
                                    ? 'bg-black text-white shadow-md shadow-black/10 scale-100 font-bold' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Apple-style Feature Display Card */}
            <div className="bg-white rounded-[32px] p-6 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/70 relative overflow-hidden transition-all duration-500">
                {/* Decorative background aura */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900/5 rounded-full blur-3xl pointer-events-none" />

                {activeTab === 'invoicing' && (
                    <div className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-500">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <FileText className="h-3.5 w-3.5" /> Instant GST Invoicing
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Create GST invoices in 30 seconds.
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Automated CGST, SGST & IGST tax split calculations, instant QR payment links, and direct WhatsApp PDF delivery.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto Tax Breakdown</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Custom Logo Branding</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> WhatsApp Direct Share</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> E-Way Bill Ready</div>
                            </div>
                        </div>

                        {/* Minimalist Apple Mockup */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tax Invoice</div>
                                    <div className="text-sm font-bold text-black font-mono">#INV-2026-889</div>
                                </div>
                                <span className="text-[10px] px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    PAID VIA UPI
                                </span>
                            </div>
                            <div className="py-2 space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-900 font-semibold">
                                    <span>Web Consulting Services</span>
                                    <span className="font-mono">₹40,000.00</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>GST @ 18% (CGST 9% + SGST 9%)</span>
                                    <span className="font-mono">₹7,200.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-extrabold">
                                    <span className="text-slate-950">Total Paid</span>
                                    <span className="text-emerald-600 font-mono text-lg">₹47,200.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-500">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <Sparkles className="h-3.5 w-3.5" /> Sales Growth Engine
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Visual Kanban Deal Pipeline.
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Track deals from Lead to Won, log activity follow-ups, and forecast monthly sales revenue effortlessly.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kanban Deal Stages</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Activity Follow-up Log</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Win Rate Forecasts</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Revenue Analytics</div>
                            </div>
                        </div>

                        {/* Minimalist Apple Mockup */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs font-bold">
                                <span className="text-slate-900">Active Deals Pipeline</span>
                                <span className="text-emerald-600 font-mono">₹12.5L Total Value</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Proposal Sent</span>
                                    <p className="font-bold text-slate-900 mt-1">Enterprise Retainer</p>
                                    <p className="text-emerald-600 font-mono font-bold mt-0.5">₹3,50,000</p>
                                </div>
                                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Won Deal 🎉</span>
                                    <p className="font-bold text-slate-900 mt-1">Cloud Migration</p>
                                    <p className="text-emerald-600 font-mono font-bold mt-0.5">₹5,00,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bookkeeping' && (
                    <div className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-500">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <BookOpen className="h-3.5 w-3.5" /> General Ledger
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Audited Double-Entry Bookkeeping.
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Complete Chart of Accounts, Journal Entries, Trial Balance, P&L, Balance Sheet, and Bank Statement audit.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Chart of Accounts (CoA)</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Trial Balance Checker</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Automated P&L & Balance Sheet</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bank Reconciliation</div>
                            </div>
                        </div>

                        {/* Minimalist Apple Mockup */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                                <span className="text-slate-900">Profit & Loss Statement</span>
                                <span className="text-emerald-600 font-mono font-bold">Net Profit: ₹1,85,000</span>
                            </div>
                            <div className="space-y-2 text-[11px] pt-1 text-slate-700">
                                <div className="flex justify-between font-semibold">
                                    <span>Operating Revenue (4010)</span>
                                    <span className="font-mono text-emerald-600">+₹4,50,000.00</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Salaries & Payroll (5300)</span>
                                    <span className="font-mono text-rose-600">-₹2,10,000.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'po' && (
                    <div className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-500">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <ShoppingBag className="h-3.5 w-3.5" /> Vendor Procurement
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Vendor Purchase Orders & Stock-In.
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Issue purchase orders to suppliers, manage partial delivery receipts, and auto-increment inventory levels.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Vendor PO Generation</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto Inventory Stock-In</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Batch/Lot Numbering</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Fulfillment Logs</div>
                            </div>
                        </div>

                        {/* Minimalist Apple Mockup */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <span className="font-mono font-bold text-black">PO-20260803-902</span>
                                <span className="px-3 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                                    PARTIALLY RECEIVED
                                </span>
                            </div>
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
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
                    <div className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-500">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <DollarSign className="h-3.5 w-3.5" /> Staff Management
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                1-Click Monthly Payroll.
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Manage employee salary components (Basic, HRA, PF, TDS), process monthly payroll runs, and print salary payslips.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Employee Directory</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> PF, ESI & TDS Deductions</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> PDF Salary Payslips</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto Journal Entry</div>
                            </div>
                        </div>

                        {/* Minimalist Apple Mockup */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                                <span className="text-slate-900">Monthly Payslip (August 2026)</span>
                                <span className="text-emerald-600 font-mono font-bold">Net Pay: ₹42,200</span>
                            </div>
                            <div className="space-y-1.5 text-[11px] text-slate-700">
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
                    <div className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in duration-500">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <Bot className="h-3.5 w-3.5" /> AI Accountant
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Smart AI Finance Assistant.
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Ask questions in plain English or Hindi about tax liabilities, outstanding invoices, and GST compliance rules.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant GST Q&A</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Revenue Forecasting</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Expense Anomaly Alert</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> CA Verified Logic</div>
                            </div>
                        </div>

                        {/* Minimalist Apple Mockup */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 font-medium">
                                💬 "What is my GST tax liability for this quarter?"
                            </div>
                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-slate-800 space-y-1">
                                <p className="font-bold text-emerald-800">AI Assistant:</p>
                                <p>Based on your 24 invoices (₹4.2L revenue) and ₹1.1L eligible input tax credit, your net GST payable is <strong className="text-emerald-700">₹32,400</strong>.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
