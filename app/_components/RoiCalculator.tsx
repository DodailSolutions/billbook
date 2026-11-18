'use client'

import React, { useState } from 'react'
import { Calculator, Clock, DollarSign, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function RoiCalculator() {
    const [invoicesPerMonth, setInvoicesPerMonth] = useState(60)
    const [teamSize, setTeamSize] = useState(5)

    // Financial & Time-saving logic
    // Avg traditional manual time: 25 mins per invoice (creation, follow-up, recording payment, ledger reconciliation, GST check)
    // BillBook automated time: 3 mins per invoice
    const hoursSavedPerMonth = Math.round((invoicesPerMonth * 22) / 60)
    
    // Average cost savings: estimated cost of manual bookkeeping / outsourced accounting hours @ ₹400/hr
    // + savings from separate CRM, payroll, and invoicing subscriptions (~₹3,500/mo)
    const monthlyCostSaved = (hoursSavedPerMonth * 400) + (teamSize * 300)
    const annualSavings = monthlyCostSaved * 12

    return (
        <section className="py-20 sm:py-24 bg-linear-to-b from-white via-slate-50/60 to-white border-t border-slate-200/60">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Interactive ROI & Savings Calculator</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                        Calculate how much time & money you save
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">
                        See how automating your GST invoicing, Tally sync, bookkeeping, and staff payroll pays for itself from day one.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid lg:grid-cols-12 gap-0">
                    {/* Controls Column */}
                    <div className="lg:col-span-7 p-6 sm:p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-200/80">
                        {/* Slider 1: Invoices per month */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs sm:text-sm font-bold text-slate-900">
                                    Invoices & Bills Issued / Month
                                </label>
                                <span className="text-sm sm:text-base font-black text-blue-600 font-mono bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                    {invoicesPerMonth} invoices
                                </span>
                            </div>
                            <input
                                type="range"
                                min={10}
                                max={500}
                                step={5}
                                value={invoicesPerMonth}
                                onChange={(e) => setInvoicesPerMonth(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                <span>10 (Freelancers)</span>
                                <span>150 (Growing SMBs)</span>
                                <span>500+ (Enterprises)</span>
                            </div>
                        </div>

                        {/* Slider 2: Team Size */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs sm:text-sm font-bold text-slate-900">
                                    Employees & Team Members
                                </label>
                                <span className="text-sm sm:text-base font-black text-indigo-600 font-mono bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                    {teamSize} people
                                </span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                step={1}
                                value={teamSize}
                                onChange={(e) => setTeamSize(Number(e.target.value))}
                                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                <span>Solo / Founder</span>
                                <span>15 (Mid-size)</span>
                                <span>50 (Full team)</span>
                            </div>
                        </div>

                        {/* Automated modules breakdown */}
                        <div className="pt-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                                Automated with BillBook OS
                            </p>
                            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Tally XML 1-Click Sync</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>CA Client Delegation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>WhatsApp PDF Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>GST Mismatch Guard</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Snapshot Column */}
                    <div className="lg:col-span-5 bg-linear-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-6 sm:p-10 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                Estimated Annual Savings
                            </span>

                            <div>
                                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                                    ₹{annualSavings.toLocaleString('en-IN')}
                                </div>
                                <p className="text-xs text-slate-300 mt-1 font-medium">
                                    ₹{monthlyCostSaved.toLocaleString('en-IN')}/mo in staff hours & software consolidation
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                                        Hours Reclaimed:
                                    </span>
                                    <span className="font-bold text-white font-mono">
                                        ~{hoursSavedPerMonth} hrs / mo
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        Tax Compliance Risk:
                                    </span>
                                    <span className="font-bold text-emerald-400">
                                        Zero Penalty Guarantee
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link href="/signup">
                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm gap-2">
                                    <span>Start 14-Day Free Trial</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                                Instant access • No credit card required • Cancel anytime
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
