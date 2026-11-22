'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck, Globe, Building2, Code2, Megaphone, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type RegionKey = 'IN' | 'AE' | 'US'
export type IndustryKey = 'all' | 'software_it' | 'digital_marketing' | 'freelancer'

interface IndustryPricingWidgetProps {
    defaultVertical?: 'software_it' | 'digital_marketing' | 'freelancer' | 'all'
    showVerticalTabs?: boolean
    ctaBaseUrl?: string
}

interface PlanTier {
    name: string
    tagline: string
    monthlyPrice: { IN: number; AE: number; US: number }
    yearlyMonthlyPrice: { IN: number; AE: number; US: number }
    popular?: boolean
    badge?: string
    features: string[]
    bestFor: string
}

const REGION_CONFIG: Record<RegionKey, { label: string; flag: string; symbol: string; taxLabel: string }> = {
    IN: { label: 'India', flag: '🇮🇳', symbol: '₹', taxLabel: 'GST + TDS Ready' },
    AE: { label: 'UAE', flag: '🇦🇪', symbol: 'AED ', taxLabel: '5% FTA VAT Ready' },
    US: { label: 'US / Global', flag: '🇺🇸', symbol: '$', taxLabel: 'Sales Tax & 1099 Ready' }
}

const PLANS_BY_INDUSTRY: Record<'software_it' | 'digital_marketing' | 'freelancer', PlanTier[]> = {
    software_it: [
        {
            name: 'Dev Studio Starter',
            tagline: 'For boutique dev agencies & software consultancies',
            monthlyPrice: { IN: 1999, AE: 179, US: 49 },
            yearlyMonthlyPrice: { IN: 1599, AE: 145, US: 39 },
            bestFor: 'Teams up to 5 developers',
            features: [
                'Up to 5 Team Seats with Dev Role Presets',
                'Sprint Milestone Tranche Invoicing (25/35/40)',
                'T&M Timesheet to 1-Click Invoice Conversion',
                '10 Active Branded Client Portals',
                'Developer Cost Rate vs Billing Margin Tracking',
                'Zero-Rated Export Invoicing under LUT (USD/EUR)',
                '1-Click Change Order Generator (Zero Scope Creep)'
            ]
        },
        {
            name: 'Software Enterprise',
            tagline: 'Complete operating system for scaling tech companies',
            monthlyPrice: { IN: 3999, AE: 349, US: 99 },
            yearlyMonthlyPrice: { IN: 3199, AE: 279, US: 79 },
            popular: true,
            badge: 'MOST POPULAR FOR IT',
            bestFor: 'Agencies with 10+ engineers & multiple clients',
            features: [
                'Up to 15 Team Seats with Functional Designations',
                'Universal Team Capacity Radar (40h Bench & Burnout Alerts)',
                'Unlimited White-Label Client Portals',
                'AI RFP / Tender Compliance Evaluator & Feasibility Scoring',
                'Multi-Currency Export with FIRC & Bank Remittance Tracking',
                'Subcontractor TDS 194J Automated Deduction Ledger',
                'Priority Dedicated Account Support & SLA'
            ]
        }
    ],
    digital_marketing: [
        {
            name: 'Agency Growth',
            tagline: 'For performance marketing & creative agencies',
            monthlyPrice: { IN: 1999, AE: 179, US: 49 },
            yearlyMonthlyPrice: { IN: 1599, AE: 145, US: 39 },
            popular: true,
            badge: 'RECOMMENDED FOR AGENCIES',
            bestFor: 'Performance media buyers & creative shops',
            features: [
                'Up to 5 Team Seats (Media Buyers, Copywriters, Designers)',
                'Ad Spend Pass-Through Invoicing (0% Tax Rule 33 Pure Agent)',
                'White-Label Client Portal with Magic Link Access',
                '1-Click Social Creative & Reel Approval Deck',
                'Monthly Retainer Quota Counter with Automatic Overage Billing',
                'Freelance Subcontractor TDS 194J / 194C Ledger',
                'Live Campaign Reach & Spend Performance Dashboard'
            ]
        },
        {
            name: 'Media Enterprise',
            tagline: 'High-volume retainers, multi-brand clients & team margins',
            monthlyPrice: { IN: 3999, AE: 349, US: 99 },
            yearlyMonthlyPrice: { IN: 3199, AE: 279, US: 79 },
            bestFor: 'Full-service agencies managing $50k+ monthly ad spend',
            features: [
                'Up to 15 Team Seats with Capacity Workload Heatmap',
                'Unlimited Client Portals with Custom Domain Branding',
                'Interactive Web Proposals with Mobile E-Sign Canvas',
                'Automated Commission Realization on Paid Invoices',
                'Multi-Client Social Content Calendar & Publishing Hub',
                'Dual-Nature Tax Invoices (Ad Spend vs Taxable Retainers)',
                'Dedicated CA Export & Form 26Q Reconciliation'
            ]
        }
    ],
    freelancer: [
        {
            name: 'Solo Freelancer',
            tagline: 'For independent developers, designers & consultants',
            monthlyPrice: { IN: 499, AE: 69, US: 19 },
            yearlyMonthlyPrice: { IN: 399, AE: 55, US: 15 },
            popular: true,
            badge: 'BEST VALUE FOR SOLOS',
            bestFor: 'Solo indie contractors and freelancers',
            features: [
                '1 User License with Unlimited GST / Global Invoices',
                '1-Page Mobile Scope Contract with Touchscreen E-Sign',
                'Automated 50% Upfront Deposit Workflow (Work Unlocked on Pay)',
                '₹20 Lakh GST Exemption Warning Radar',
                'Client Deliverable & Invoice Vault',
                'Instant UPI QR & Card Payment Collection',
                'Expense Vault for Subcontractors & Reimbursables'
            ]
        },
        {
            name: 'Freelance Studio Pro',
            tagline: 'For high-billing specialists working with sub-contractors',
            monthlyPrice: { IN: 1499, AE: 139, US: 35 },
            yearlyMonthlyPrice: { IN: 1199, AE: 109, US: 29 },
            bestFor: 'Established solo consultants & hybrid creators',
            features: [
                'Up to 3 Collaborator / Subcontractor Seats',
                'Client Project Kanban & Milestone Approvals',
                'Zero-Rated International LUT Invoicing (USD, EUR, GBP)',
                'Subcontractor TDS Expense Deductions',
                'Priority WhatsApp Support',
                'Custom Invoice Branding with Watermark Removal'
            ]
        }
    ]
}

export function IndustryPricingWidget({ 
    defaultVertical = 'software_it', 
    showVerticalTabs = true,
    ctaBaseUrl = '/signup'
}: IndustryPricingWidgetProps) {
    const [selectedRegion, setSelectedRegion] = useState<RegionKey>('IN')
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [activeVertical, setActiveVertical] = useState<'software_it' | 'digital_marketing' | 'freelancer'>(
        defaultVertical === 'all' ? 'software_it' : defaultVertical
    )

    const region = REGION_CONFIG[selectedRegion]
    const currentPlans = PLANS_BY_INDUSTRY[activeVertical] || PLANS_BY_INDUSTRY.software_it

    return (
        <div className="space-y-10">
            {/* Header Controls: Region Selector & Billing Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                {/* Regional Country Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        Region & Currency:
                    </span>
                    <div className="inline-flex rounded-xl p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {(Object.keys(REGION_CONFIG) as RegionKey[]).map(regKey => {
                            const conf = REGION_CONFIG[regKey]
                            const isActive = selectedRegion === regKey
                            return (
                                <button
                                    key={regKey}
                                    onClick={() => setSelectedRegion(regKey)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                        isActive 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{conf.flag}</span>
                                    <span>{conf.label} ({conf.symbol.trim()})</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                            billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Toggle billing cycle"
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                            }`}
                        />
                    </button>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                            Yearly
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            SAVE 20%
                        </span>
                    </div>
                </div>
            </div>

            {/* Vertical Switcher Tabs (if enabled) */}
            {showVerticalTabs && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        onClick={() => setActiveVertical('software_it')}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                            activeVertical === 'software_it'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <Code2 className="w-4 h-4" />
                        <span>Software & IT Companies</span>
                    </button>
                    <button
                        onClick={() => setActiveVertical('digital_marketing')}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                            activeVertical === 'digital_marketing'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <Megaphone className="w-4 h-4" />
                        <span>Digital Marketing Agencies</span>
                    </button>
                    <button
                        onClick={() => setActiveVertical('freelancer')}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                            activeVertical === 'freelancer'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Freelancers & Indie Solos</span>
                    </button>
                </div>
            )}

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {currentPlans.map((plan, idx) => {
                    const price = billingCycle === 'yearly' 
                        ? plan.yearlyMonthlyPrice[selectedRegion]
                        : plan.monthlyPrice[selectedRegion]

                    return (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 border ${
                                plan.popular 
                                    ? 'border-indigo-500 dark:border-indigo-400 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-indigo-500/20' 
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 shadow-sm'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{plan.badge || 'POPULAR'}</span>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                        {plan.bestFor}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 mt-2 min-h-[32px]">
                                    {plan.tagline}
                                </p>

                                {/* Price block */}
                                <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                        {region.symbol}{price.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        / month {billingCycle === 'yearly' ? '(billed annually)' : ''}
                                    </span>
                                </div>

                                <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>{region.taxLabel}</span>
                                </div>

                                {/* Feature checklist */}
                                <ul className="mt-6 space-y-3.5">
                                    {plan.features.map(feat => (
                                        <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                                            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                            </div>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Link href={`${ctaBaseUrl}?vertical=${activeVertical}&tier=${plan.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                    <Button
                                        className={`w-full py-6 text-sm font-bold shadow-sm gap-2 ${
                                            plan.popular
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>Start 14-Day Free Trial</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-[11px] text-center text-slate-400 mt-2.5">
                                    No credit card required • Instant workspace setup
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
