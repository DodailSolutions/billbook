'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
    Home, 
    Search, 
    Receipt, 
    TrendingUp, 
    Building2, 
    Plug, 
    Sparkles, 
    ChevronLeft, 
    ChevronRight, 
    X,
    Check
} from 'lucide-react'

interface TourStep {
    id: string
    title: string
    description: string
    targetSelector: string
    position: 'right' | 'bottom' | 'top' | 'left' | 'center'
    icon: React.ComponentType<{ className?: string }>
    iconBg: string
    iconColor: string
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'navigation',
        title: 'Navigation',
        description: 'Your command center. Browse invoices, quotations, inventory, payroll, and settings from the sidebar. It collapses on mobile for a clean workspace.',
        targetSelector: '[data-tour="sidebar"]',
        position: 'right',
        icon: Home,
        iconBg: 'bg-pink-50 dark:bg-pink-950/50 border-pink-100 dark:border-pink-900/40',
        iconColor: 'text-pink-600 dark:text-pink-400'
    },
    {
        id: 'invoicing',
        title: 'Quick Invoicing',
        description: 'Generate GST and VAT compliant tax invoices with automated line calculations, custom notes, and payment QR codes in seconds.',
        targetSelector: '[data-tour="quick-invoice"]',
        position: 'right',
        icon: Receipt,
        iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/40',
        iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
        id: 'revenue_radar',
        title: 'Real-Time Financial Radar',
        description: 'Monitor gross receivables, collected revenue, pending client balances, and live business cashflow at a glance with zero manual bookkeeping.',
        targetSelector: '[data-tour="stats-overview"]',
        position: 'bottom',
        icon: TrendingUp,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
        id: 'global_search',
        title: 'Global Search',
        description: 'Find invoices, clients, products, and reports instantly. Just start typing — results appear as you go.',
        targetSelector: '[data-tour="global-search"]',
        position: 'bottom',
        icon: Search,
        iconBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/40',
        iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
        id: 'vertical_adaptation',
        title: 'Industry Vertical Adaptation',
        description: 'BillBooky dynamically adapts features, tax codes, and terminology for your vertical — whether Software & IT, Retail, Salon, Hospitality, or Consulting.',
        targetSelector: '[data-tour="vertical-selector"]',
        position: 'right',
        icon: Building2,
        iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/40',
        iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
        id: 'integrations',
        title: 'Connected Integrations Hub',
        description: 'Connect real-time Google Sheets sync, incoming Microsoft Teams channel alerts, and automated WhatsApp Click-to-Chat payment reminders.',
        targetSelector: '[data-tour="integrations"]',
        position: 'right',
        icon: Plug,
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/40',
        iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
        id: 'support_ai',
        title: 'AI Assistant & 24/7 Helpdesk',
        description: 'Have billing questions or need tax filing help? Click here anytime to ask our AI accountant or open a priority support ticket.',
        targetSelector: '[data-tour="support-chatbot"]',
        position: 'top',
        icon: Sparkles,
        iconBg: 'bg-linear-to-tr from-pink-50 to-purple-50 dark:from-pink-950/50 dark:to-purple-950/50 border-purple-100 dark:border-purple-900/40',
        iconColor: 'text-purple-600 dark:text-purple-400'
    }
]

const STORAGE_KEY = 'billbook_product_tour_completed_v3'

interface TargetRect {
    top: number
    left: number
    width: number
    height: number
    right: number
    bottom: number
}

export function FirstTimeOnboardingTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
    const [activePlacement, setActivePlacement] = useState<'right' | 'bottom' | 'top' | 'left' | 'center'>('center')
    const tooltipRef = useRef<HTMLDivElement>(null)

    // Check if tour should auto-open for first-time user
    useEffect(() => {
        const hasCompleted = localStorage.getItem(STORAGE_KEY)
        if (!hasCompleted) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 1000)
            return () => clearTimeout(timer)
        }

        const handleRestart = () => {
            setCurrentStepIndex(0)
            setIsOpen(true)
        }

        window.addEventListener('billbook:restart-tour', handleRestart)
        return () => window.removeEventListener('billbook:restart-tour', handleRestart)
    }, [])

    const currentStep = TOUR_STEPS[currentStepIndex]

    // Recalculate target element position and tooltip placement
    const updatePosition = useCallback(() => {
        if (!isOpen) return

        const el = document.querySelector(currentStep.targetSelector)
        if (!el) {
            setTargetRect(null)
            setActivePlacement('center')
            setTooltipStyle({
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10001
            })
            return
        }

        const rect = el.getBoundingClientRect()
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom
        })

        // Ensure target is scrolled into view smoothly
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })

        const tooltipWidth = 340
        const tooltipHeight = 220
        const padding = 16

        let top = 0
        let left = 0
        let placement = currentStep.position

        // Mobile fallback: position at bottom or center if screen is small
        if (window.innerWidth < 768) {
            if (rect.top > window.innerHeight / 2) {
                placement = 'top'
                top = Math.max(padding, rect.top - tooltipHeight - 16)
                left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, rect.left))
            } else {
                placement = 'bottom'
                top = Math.min(window.innerHeight - tooltipHeight - padding, rect.bottom + 16)
                left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, rect.left))
            }
        } else {
            switch (placement) {
                case 'right':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2
                    left = rect.right + 16
                    break
                case 'bottom':
                    top = rect.bottom + 16
                    left = rect.left + rect.width / 2 - tooltipWidth / 2
                    break
                case 'top':
                    top = rect.top - tooltipHeight - 16
                    left = rect.left + rect.width / 2 - tooltipWidth / 2
                    break
                case 'left':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2
                    left = rect.left - tooltipWidth - 16
                    break
                default:
                    top = window.innerHeight / 2 - tooltipHeight / 2
                    left = window.innerWidth / 2 - tooltipWidth / 2
            }

            // Viewport clamping
            top = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, top))
            left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left))
        }

        setActivePlacement(placement)
        setTooltipStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 10001
        })
    }, [isOpen, currentStep])

    useEffect(() => {
        updatePosition()

        const handleResize = () => updatePosition()
        const handleScroll = () => updatePosition()

        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', handleScroll, true)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', handleScroll, true)
        }
    }, [updatePosition])

    // Keyboard navigation (Escape to skip, Left/Right arrow to navigate)
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleSkip()
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext()
            } else if (e.key === 'ArrowLeft') {
                handlePrev()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentStepIndex])

    const handleSkip = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setIsOpen(false)
    }

    const handleNext = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
        } else {
            handleSkip()
        }
    }

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }

    if (!isOpen) return null

    const StepIcon = currentStep.icon
    const totalSteps = TOUR_STEPS.length
    const currentStepNum = currentStepIndex + 1

    return (
        <div className="fixed inset-0 z-10000 pointer-events-auto font-sans select-none animate-in fade-in duration-200">
            {/* SVG Cutout Spotlight Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
                <defs>
                    <mask id="tour-spotlight-mask">
                        {/* White base fills entire screen (opaque) */}
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {/* Black cutout reveals the active target element */}
                        {targetRect && (
                            <rect
                                x={targetRect.left - 6}
                                y={targetRect.top - 6}
                                width={targetRect.width + 12}
                                height={targetRect.height + 12}
                                rx="12"
                                ry="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                {/* Dark semi-transparent backdrop using the cutout mask */}
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(15, 23, 42, 0.65)"
                    mask="url(#tour-spotlight-mask)"
                />
            </svg>

            {/* Glowing target border outline */}
            {targetRect && (
                <div
                    className="fixed rounded-xl border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] pointer-events-none transition-all duration-300"
                    style={{
                        top: `${targetRect.top - 6}px`,
                        left: `${targetRect.left - 6}px`,
                        width: `${targetRect.width + 12}px`,
                        height: `${targetRect.height + 12}px`,
                        zIndex: 10000
                    }}
                />
            )}

            {/* Floating Tooltip Card */}
            <div
                ref={tooltipRef}
                style={tooltipStyle}
                className="w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-5 transition-all duration-300 animate-in fade-in zoom-in-95 relative"
            >
                {/* Pointer Caret / Notch Arrow */}
                {activePlacement === 'right' && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-l border-b border-slate-200/90 dark:border-slate-800 rotate-45" />
                )}
                {activePlacement === 'bottom' && (
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-slate-200/90 dark:border-slate-800 rotate-45" />
                )}
                {activePlacement === 'top' && (
                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-slate-900 border-b border-r border-slate-200/90 dark:border-slate-800 rotate-45" />
                )}
                {activePlacement === 'left' && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-t border-r border-slate-200/90 dark:border-slate-800 rotate-45" />
                )}

                {/* Card Header (Icon & Step Counter) */}
                <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl ${currentStep.iconBg} ${currentStep.iconColor} border flex items-center justify-center`}>
                        <StepIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
                        {currentStepNum} / {totalSteps}
                    </span>
                </div>

                {/* Title & Description */}
                <div className="mt-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {currentStep.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                        {currentStep.description}
                    </p>
                </div>

                {/* Footer Controls (Skip tour, Back, Next) */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                        Skip tour
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStepIndex > 0 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                aria-label="Previous Step"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleNext}
                            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                            <span>{currentStepIndex === totalSteps - 1 ? 'Get Started' : 'Next'}</span>
                            {currentStepIndex === totalSteps - 1 ? (
                                <Check className="w-3.5 h-3.5 ml-0.5" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
