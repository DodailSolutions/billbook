'use client'

import React, { useState, useEffect } from 'react'
import { 
    Sparkles, 
    LayoutDashboard, 
    FileText, 
    Barcode, 
    FileBarChart, 
    ArrowRight, 
    ArrowLeft, 
    X, 
    CheckCircle2, 
    Zap,
    PlayCircle,
    Building2,
    ShieldCheck,
    Receipt,
    Plus,
    Check,
    RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TourStep {
    id: string
    title: string
    subtitle: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    badge: string
    badgeColor: string
    tips: string[]
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to BillBook ERP',
        subtitle: 'Intelligent, Industry-Adaptive Business Platform',
        description: 'BillBook adapts to your exact business vertical—whether you manage Software & IT, Salons, Hospitality & Campsites, Retail, or Art & Craft studios.',
        icon: Sparkles,
        badge: 'Step 1 of 4',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
        tips: [
            'All catalog items, tax codes, and workflows tailor dynamically to your vertical',
            'Zero technical complexity—ready to issue invoices, manage inventory, and track team margins'
        ]
    },
    {
        id: 'dashboard',
        title: 'Real-Time Financial Dashboard',
        subtitle: 'Instant Cash Flow & Receivables Radar',
        description: 'Monitor your monthly gross revenue, unbilled timesheets, pending customer balances, and tax liabilities with zero manual bookkeeping.',
        icon: LayoutDashboard,
        badge: 'Step 2 of 4',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        tips: [
            'Interactive charts for sales trends and overhead expenditure',
            'Quick action shortcuts to issue invoices, track CRM leads, and configure hardware POS'
        ]
    },
    {
        id: 'crm_proposals',
        title: 'CRM Pipeline & AI Proposal Engine',
        subtitle: 'SOW Contracts & Touchscreen E-Signing',
        description: 'Evaluate client RFPs with AI feasibility scoring, build milestone sprint tranches, and close deals with built-in digital signature pads.',
        icon: FileBarChart,
        badge: 'Step 3 of 4',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
        tips: [
            'Automated ERP trigger: signing proposals marks CRM deals as Won and issues advance invoices',
            'Track client creative approvals and milestone signoffs in a unified portal'
        ]
    },
    {
        id: 'sandbox_intro',
        title: 'Interactive Practice Sandbox',
        subtitle: 'Zero-Impact Guided Invoice Generation Demo',
        description: 'Experience how fast it is to create a compliant GST invoice. Practice adding items and reviewing taxes in a safe sandbox that leaves your real live books 100% untouched.',
        icon: FileText,
        badge: 'Step 4 of 4',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        tips: [
            'Practice clicking, selecting items, and reviewing calculations',
            'Nothing is saved to your real database—purely educational and interactive'
        ]
    }
]

const STORAGE_KEY = 'billbook_onboarding_completed_v2'

export function FirstTimeOnboardingTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'tour' | 'sandbox'>('tour')
    const [currentStepIndex, setCurrentStepIndex] = useState(0)

    // Interactive Demo Sandbox State (Purely in-memory, zero live database impact)
    const [demoCustomer, setDemoCustomer] = useState('Acme Corporation (Sample Client)')
    const [demoItemTitle, setDemoItemTitle] = useState('Standard Service / Professional Deliverable')
    const [demoQty, setDemoQty] = useState(1)
    const [demoRate, setDemoRate] = useState(15000)
    const [demoGstRate, setDemoGstRate] = useState(18)
    const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false)

    useEffect(() => {
        const hasCompleted = localStorage.getItem(STORAGE_KEY)
        if (!hasCompleted) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 800)
            return () => clearTimeout(timer)
        }

        const handleRestart = () => {
            setCurrentStepIndex(0)
            setViewMode('tour')
            setIsInvoiceGenerated(false)
            setIsOpen(true)
        }
        window.addEventListener('billbook:restart-tour', handleRestart)
        return () => window.removeEventListener('billbook:restart-tour', handleRestart)
    }, [])

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        localStorage.setItem('billbook_onboarding_completed_at', new Date().toISOString())
        setIsOpen(false)
    }

    const handleNext = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
        } else {
            // Transition smoothly to interactive practice sandbox
            setViewMode('sandbox')
        }
    }

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }

    if (!isOpen) return null

    // Calculations for Demo Sandbox
    const subtotal = demoQty * demoRate
    const taxAmount = Math.round(subtotal * (demoGstRate / 100))
    const totalAmount = subtotal + taxAmount

    const step = TOUR_STEPS[currentStepIndex]
    const StepIcon = step.icon

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all max-h-[92vh]"
                role="dialog"
                aria-modal="true"
            >
                {/* Top Banner Accent */}
                <div className="h-2 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 shrink-0" />

                {/* Header */}
                <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
                            {viewMode === 'tour' ? <StepIcon className="w-6 h-6" /> : <PlayCircle className="w-6 h-6 text-emerald-600" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    viewMode === 'tour' ? step.badgeColor : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                    {viewMode === 'tour' ? step.badge : 'Interactive Practice Sandbox'}
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    Zero Live Data Impact
                                </span>
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                                {viewMode === 'tour' ? step.title : 'Interactive Demo: Create a Practice Invoice'}
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Skip Walkthrough"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {viewMode === 'tour' ? (
                        /* Tour Step Content */
                        <div className="space-y-4 animate-in fade-in">
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                {step.subtitle}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {step.description}
                            </p>

                            {/* Pro Tips / Highlights */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 border border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                                    Key Platform Capabilities:
                                </span>
                                <ul className="space-y-2">
                                    {step.tips.map((tip, idx) => (
                                        <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        /* Interactive Sandbox Practice Invoice Generator */
                        <div className="space-y-4 animate-in fade-in">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                                <span>
                                    <strong>Sandbox Mode Active:</strong> Try clicking and creating a demo invoice below. This is an interactive simulation that helps you learn where to click without creating any records in your actual account.
                                </span>
                            </div>

                            {!isInvoiceGenerated ? (
                                <div className="space-y-3 text-xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                Select Sample Customer
                                            </label>
                                            <select
                                                value={demoCustomer}
                                                onChange={(e) => setDemoCustomer(e.target.value)}
                                                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                                            >
                                                <option value="Acme Corporation (Sample Client)">🏢 Acme Corporation (Sample Corporate Client)</option>
                                                <option value="Priya Sharma (Retail / Walk-in)">🛍️ Priya Sharma (Retail / Walk-in Customer)</option>
                                                <option value="Horizon Media Ltd (Agency Retainer)">📢 Horizon Media Ltd (Agency Retainer)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                                Pick Sample Item / Service
                                            </label>
                                            <select
                                                value={demoItemTitle}
                                                onChange={(e) => {
                                                    setDemoItemTitle(e.target.value)
                                                    if (e.target.value.includes('Sprint')) setDemoRate(50000)
                                                    else if (e.target.value.includes('Ceramic')) setDemoRate(3500)
                                                    else setDemoRate(15000)
                                                }}
                                                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                                            >
                                                <option value="Professional Consulting & Deliverables">💼 Professional Consulting & Deliverables (₹15,000)</option>
                                                <option value="Software Development Sprint Tranche">💻 Software Development Sprint Tranche (₹50,000)</option>
                                                <option value="Handmade Ceramic Studio Artwork">🎨 Handmade Ceramic Studio Artwork (₹3,500)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Line Item Table Simulation */}
                                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                                        <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                                            <span>Demo Invoice Calculation</span>
                                            <span className="text-[11px] text-blue-600 font-normal">Interactive Preview</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block mb-0.5">Quantity</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={demoQty}
                                                    onChange={(e) => setDemoQty(Math.max(1, Number(e.target.value) || 1))}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block mb-0.5">Unit Rate (₹)</span>
                                                <Input
                                                    type="number"
                                                    value={demoRate}
                                                    onChange={(e) => setDemoRate(Math.max(0, Number(e.target.value) || 0))}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block mb-0.5">GST Rate</span>
                                                <select
                                                    value={demoGstRate}
                                                    onChange={(e) => setDemoGstRate(Number(e.target.value))}
                                                    className="w-full h-8 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                                                >
                                                    <option value={0}>0% (Exempt / LUT)</option>
                                                    <option value={5}>5% (Basic)</option>
                                                    <option value={12}>12% (Art / Hospitality)</option>
                                                    <option value={18}>18% (Standard GST)</option>
                                                    <option value={28}>28% (Luxury)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-mono">
                                            <span className="text-slate-500">Subtotal: ₹{subtotal.toLocaleString('en-IN')} + GST ({demoGstRate}%): ₹{taxAmount.toLocaleString('en-IN')}</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => setIsInvoiceGenerated(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-2"
                                    >
                                        <Receipt className="h-4 w-4" />
                                        <span>Click to Generate Practice Invoice →</span>
                                    </Button>
                                </div>
                            ) : (
                                /* Invoice Generated Success Screen */
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <div>
                                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                                    Practice Invoice #INV-DEMO-001 Generated!
                                                </h4>
                                                <span className="text-[10px] text-slate-400">
                                                    Demo preview • No real data saved
                                                </span>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold text-xs">
                                            ₹{totalAmount.toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                        <div><strong>Customer:</strong> {demoCustomer}</div>
                                        <div><strong>Deliverable:</strong> {demoItemTitle} (Qty: {demoQty})</div>
                                        <div><strong>Tax Breakdown:</strong> CGST ({demoGstRate/2}%): ₹{Math.round(taxAmount/2).toLocaleString('en-IN')} | SGST ({demoGstRate/2}%): ₹{Math.round(taxAmount/2).toLocaleString('en-IN')}</div>
                                    </div>

                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center justify-between">
                                        <span>Ready for WhatsApp dispatch & UPI QR payment collection!</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsInvoiceGenerated(false)}
                                            className="h-7 text-[10px] font-semibold"
                                        >
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            Try Another Sample
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    {viewMode === 'tour' ? (
                        <>
                            {/* Stepper Dots */}
                            <div className="flex items-center gap-1.5">
                                {TOUR_STEPS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentStepIndex(idx)}
                                        aria-label={`Go to step ${idx + 1}`}
                                        className={`h-2 rounded-full transition-all ${
                                            idx === currentStepIndex 
                                                ? 'w-6 bg-indigo-600 dark:bg-indigo-400' 
                                                : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleDismiss}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Skip Walkthrough
                                </button>

                                {currentStepIndex > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrev}
                                        className="text-xs gap-1 rounded-xl"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Back
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                                >
                                    {currentStepIndex === TOUR_STEPS.length - 1 ? (
                                        <>
                                            <PlayCircle className="w-3.5 h-3.5" />
                                            Launch Practice Sandbox
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode('tour')}
                                className="text-xs gap-1 rounded-xl"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Tour
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleDismiss}
                                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Finish Demo & Hand Over Live Workspace
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
