'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
    Briefcase,
    ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TourStep {
    id: string
    title: string
    subtitle: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    badge: string
    badgeColor: string
    highlightAction?: {
        label: string
        href: string
    }
    tips: string[]
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to BillBook ERP',
        subtitle: 'Intelligent, Industry-Adaptive Business Management',
        description: 'BillBook is designed to adapt to your specific business model—whether you run a Salon, Dental Clinic, Tours & Travels, Auto Workshop, or Retail Store.',
        icon: Sparkles,
        badge: 'Step 1 of 5',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
        tips: [
            'All features, terminology, and workflows automatically tailor to your industry',
            'Zero technical complexity—ready to create invoices and manage staff immediately'
        ]
    },
    {
        id: 'dashboard',
        title: 'Your Command Dashboard',
        subtitle: 'Real-Time Financial Health at a Single Glance',
        description: 'Track your total sales revenue, pending customer receivables, month-over-month cash flow, and low-stock alerts without manual bookkeeping.',
        icon: LayoutDashboard,
        badge: 'Step 2 of 5',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        tips: [
            'Interactive charts for monthly sales and expenditure trends',
            'Quick action shortcuts to issue invoices, add inventory, and review tax'
        ]
    },
    {
        id: 'invoicing',
        title: '30-Second GST Invoicing',
        subtitle: 'Create, Share & Get Paid Faster',
        description: 'Issue 100% compliant GST invoices, estimates, and delivery challans. Tailored line items support stylist commission splits, tooth charts, vehicle job cards, or travel PAX.',
        icon: FileText,
        badge: 'Step 3 of 5',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        highlightAction: {
            label: 'Try Invoice Builder',
            href: '/invoices/new'
        },
        tips: [
            'Automated CGST/SGST/IGST tax splits and HSN/SAC lookups',
            'Direct 1-click WhatsApp and PDF sharing with embedded UPI payment QR'
        ]
    },
    {
        id: 'barcode_hub',
        title: 'Universal Barcode & Scanner Hub',
        subtitle: 'Hardware Integration & Label Printing',
        description: 'Look at the right edge of your screen! Click the floating "Barcodes" tab anytime to instantly scan products, generate Code 128 barcodes, or print thermal stickers.',
        icon: Barcode,
        badge: 'Step 4 of 5',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
        tips: [
            'Supports handheld USB and Bluetooth wireless barcode readers',
            'Pre-configured templates for 50x25mm retail labels and jewelry tags'
        ]
    },
    {
        id: 'reports',
        title: 'Automated GST & Financial Reports',
        subtitle: 'Never Worry About Audits or Tax Deadlines',
        description: 'Every purchase order, expense, and sales invoice automatically links to your Profit & Loss statement and pre-populates your GSTR-1 and GSTR-3B filings.',
        icon: FileBarChart,
        badge: 'Step 5 of 5',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
        tips: [
            'Instant GSTR-3B Input Tax Credit (ITC) reconciliation from business expenses',
            'CA / Accountant sharing portal for easy year-end compliance'
        ]
    }
]

const STORAGE_KEY = 'billbook_onboarding_completed_v1'

export function FirstTimeOnboardingTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)

    useEffect(() => {
        // Check if user has already seen or skipped the tour
        const hasCompleted = localStorage.getItem(STORAGE_KEY)
        if (!hasCompleted) {
            // Slight delay so the dashboard loads cleanly behind it
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 800)
            return () => clearTimeout(timer)
        }

        // Allow manual restart from anywhere via event
        const handleRestart = () => {
            setCurrentStepIndex(0)
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
            handleDismiss()
        }
    }

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }

    if (!isOpen) return null

    const step = TOUR_STEPS[currentStepIndex]
    const StepIcon = step.icon
    const isFinalStep = currentStepIndex === TOUR_STEPS.length - 1

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tour-title"
            >
                {/* Top Banner Accent */}
                <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600" />

                {/* Header */}
                <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
                            <StepIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 ${step.badgeColor}`}>
                                {step.badge}
                            </span>
                            <h3 id="tour-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                {step.title}
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Skip Tour"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {step.subtitle}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.description}
                    </p>

                    {/* Pro Tips / Highlights */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 space-y-2 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Key Highlights:
                        </span>
                        <ul className="space-y-1.5">
                            {step.tips.map((tip, idx) => (
                                <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Step Highlight Action if available */}
                    {step.highlightAction && (
                        <div className="pt-1">
                            <Link 
                                href={step.highlightAction.href}
                                onClick={handleDismiss}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {step.highlightAction.label} &rarr;
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
                            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                        >
                            Skip Tour
                        </button>

                        {currentStepIndex > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                                className="text-xs gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={handleNext}
                            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                        >
                            {isFinalStep ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Get Started
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
