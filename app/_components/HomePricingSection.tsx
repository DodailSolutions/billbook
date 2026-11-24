'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Check, Zap, ShoppingCart, Loader2, XCircle } from 'lucide-react'
import { activatePlanTrial } from '@/app/(marketing)/pricing/actions'

interface HomePricingSectionProps {
    starterPrice: number
    proPrice: number
    enterprisePrice?: number
    freePrice: number
    starterSlug?: string
    proSlug?: string
    enterpriseSlug?: string
    isAuthenticated?: boolean
    plans?: any[]
}

export function HomePricingSection({
    starterPrice,
    proPrice,
    enterprisePrice = 10999,
    freePrice,
    starterSlug = 'starter',
    proSlug = 'professional',
    enterpriseSlug = 'enterprise',
    isAuthenticated = false,
    plans = []
}: HomePricingSectionProps) {
    const router = useRouter()
    const [activatingSlug, setActivatingSlug] = useState<string | null>(null)

    // Match dynamic plans if provided
    const freePlan = plans?.find(p => p.slug === 'free')
    const starterPlan = plans?.find(p => p.slug === starterSlug || p.slug === 'starter')
    const proPlan = plans?.find(p => p.slug === proSlug || p.slug === 'professional' || p.slug === 'pro')
    const enterprisePlan = plans?.find(p => p.slug === enterpriseSlug || p.slug === 'enterprise')

    const displayFreePrice = freePlan ? Number(freePlan.price) : freePrice
    const displayStarterPrice = starterPlan ? Number(starterPlan.price) : starterPrice
    const displayProPrice = proPlan ? Number(proPlan.price) : proPrice
    const displayEnterprisePrice = enterprisePlan ? Number(enterprisePlan.price) : enterprisePrice

    const displayFreeTitle = freePlan?.name || 'Free Plan'
    const displayStarterTitle = starterPlan?.name || 'Pro Starter'
    const displayProTitle = proPlan?.name || 'Professional Suite'
    const displayEnterpriseTitle = enterprisePlan?.name || 'Enterprise Plan'

    const displayFreeDesc = freePlan?.description || 'Ideal for freelancers and new startups.'
    const displayStarterDesc = starterPlan?.description || 'Everything growing SMBs need.'
    const displayProDesc = proPlan?.description || 'Complete suite with AI & Payroll.'
    const displayEnterpriseDesc = enterprisePlan?.description || 'Up to 10 team members & dedicated CA'

    const renderFeatures = (plan: any, fallbackFeatures: string[]) => {
        if (plan?.features && Array.isArray(plan.features) && plan.features.length > 0) {
            return (
                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold max-h-56 overflow-y-auto pr-1">
                    {plan.features.map((feature: string, idx: number) => {
                        const isExcluded = feature.startsWith('✕') || feature.startsWith('[x]') || feature.startsWith('No ') || feature.startsWith('❌')
                        const cleanText = feature.replace(/^(\[x\]|✕|❌|No )\s*/, '')
                        return (
                            <li key={idx} className="flex items-start gap-2.5">
                                {isExcluded ? (
                                    <XCircle className="h-4 w-4 text-rose-500/80 shrink-0 mt-0.5" />
                                ) : (
                                    <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                )}
                                <span className={isExcluded ? 'text-slate-400 line-through' : ''}>
                                    {cleanText}
                                </span>
                            </li>
                        )
                    })}
                    {plan.excluded_features?.map((ex: string, idx: number) => (
                        <li key={`ex-${idx}`} className="flex items-start gap-2.5">
                            <XCircle className="h-4 w-4 text-rose-500/80 shrink-0 mt-0.5" />
                            <span className="text-slate-400 line-through">{ex}</span>
                        </li>
                    ))}
                </ul>
            )
        }

        return (
            <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                {fallbackFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-blue-600 shrink-0" /> {feat}
                    </li>
                ))}
            </ul>
        )
    }

    const handleTrial = async (slug: string) => {
        if (!isAuthenticated) {
            router.push(`/signup?plan=${slug}&trial=true`)
            return
        }

        try {
            setActivatingSlug(slug)
            const res = await activatePlanTrial(slug)
            if (res.redirectUrl) {
                router.push(res.redirectUrl)
            } else if (!res.success && res.error) {
                alert(res.error)
            }
        } catch (err) {
            console.error('Trial activation error:', err)
            alert('Failed to activate trial. Please try again.')
        } finally {
            setActivatingSlug(null)
        }
    }

    return (
        <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-slate-200/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200">
                        Transparent Pricing
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-950 -tracking-tight">
                        Simple, predictable plans
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                        Start 100% free with no credit card required. Upgrade as your company grows.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                            <Zap className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                            14-day free trial on all plans
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                            <ShoppingCart className="h-3.5 w-3.5 text-slate-700" />
                            Direct buy with instant activation
                        </span>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {/* Free Plan */}
                    <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 flex flex-col justify-between hover:shadow-xl transition-all shadow-xs">
                        <div className="space-y-4">
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block">
                                {freePlan?.name || 'Free Plan'}
                            </span>
                            <div>
                                <span className="text-4xl font-black text-slate-950">₹{freePrice}</span>
                                <span className="text-slate-400 text-xs font-semibold"> / forever</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{displayFreeDesc}</p>
                            {renderFeatures(freePlan, ['50 Invoices / Month', 'GST Tax Compliance', 'Customer & Items Directory', 'Basic Financial Reports'])}
                        </div>

                        <div className="space-y-2 pt-8">
                            {isAuthenticated ? (
                                <Link href="/dashboard" className="block">
                                    <Button className="w-full bg-slate-900 hover:bg-black text-white font-bold min-h-[46px] rounded-full transition-transform duration-200 hover:scale-[1.01] flex items-center justify-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-400" />
                                        <span>Current Plan • Open Dashboard</span>
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/signup?plan=free" className="block">
                                    <Button className="w-full bg-black hover:bg-slate-900 text-white font-bold min-h-[46px] rounded-full transition-transform duration-200 hover:scale-[1.01]">
                                        Get Started Free
                                    </Button>
                                </Link>
                            )}
                            <div className="h-[44px] flex items-center justify-center">
                                <span className="text-[11px] text-slate-400 font-medium">
                                    {isAuthenticated ? 'Active forever • Unlimited access' : 'Always 100% free • No card required'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Starter Plan */}
                    <div className="bg-white p-8 rounded-[28px] border-2 border-blue-600 flex flex-col justify-between shadow-2xl relative">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                            MOST POPULAR
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-blue-700 uppercase tracking-wider block">
                                    {starterPlan?.name || 'Pro Starter'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    Buy or Try
                                </span>
                            </div>
                            <div>
                                <span className="text-4xl font-black text-slate-950">₹{starterPrice.toLocaleString('en-IN')}</span>
                                <span className="text-slate-500 text-xs font-semibold"> / month</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{displayStarterDesc}</p>
                            {renderFeatures(starterPlan, ['Unlimited Invoices & Quotes', 'Full CRM & Deal Pipeline', 'Bookkeeping & General Ledger', 'Vendor Purchase Orders', 'WhatsApp Direct Sharing'])}
                        </div>

                        {/* BOTH Buy & Try Action Buttons Always Visible */}
                        <div className="space-y-2.5 pt-8">
                            {/* 1. BUY BUTTON */}
                            <Link href={`/pricing?checkout=${starterSlug}`} className="block">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold min-h-[46px] rounded-full shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm sm:text-base transition-transform duration-200 hover:scale-[1.01]">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Buy Now • ₹{starterPrice.toLocaleString('en-IN')}/mo</span>
                                </Button>
                            </Link>

                            {/* 2. TRY BUTTON */}
                            <Button
                                onClick={() => handleTrial(starterSlug)}
                                disabled={activatingSlug === starterSlug}
                                variant="outline"
                                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold min-h-[44px] rounded-full flex items-center justify-center gap-2 text-sm transition-transform duration-200 hover:scale-[1.01]"
                            >
                                {activatingSlug === starterSlug ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        <span>Activating Trial...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 fill-blue-600 text-blue-600" />
                                        <span>Try 14 Days Free</span>
                                    </>
                                )}
                            </Button>

                            <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                                No card required for trial • Cancel anytime
                            </p>
                        </div>
                    </div>

                    {/* Professional Suite Plan */}
                    <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 flex flex-col justify-between hover:shadow-xl transition-all shadow-xs">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider block">
                                    {proPlan?.name || 'Professional Suite'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    Buy or Try
                                </span>
                            </div>
                            <div>
                                <span className="text-4xl font-black text-slate-950">₹{proPrice.toLocaleString('en-IN')}</span>
                                <span className="text-slate-500 text-xs font-semibold"> / month</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{displayProDesc}</p>
                            {renderFeatures(proPlan, ['Everything in Pro Starter', 'Full Payroll & Payslip Engine', 'AI Accountant Assistant', 'Multi-User Team Roles', 'Certified CA Marketplace Access'])}
                        </div>

                        {/* BOTH Buy & Try Action Buttons Always Visible */}
                        <div className="space-y-2.5 pt-8">
                            {/* 1. BUY BUTTON */}
                            <Link href={`/pricing?checkout=${proSlug}`} className="block">
                                <Button className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold min-h-[46px] rounded-full shadow-md flex items-center justify-center gap-2 text-sm sm:text-base transition-transform duration-200 hover:scale-[1.01]">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Buy Now • ₹{proPrice.toLocaleString('en-IN')}/mo</span>
                                </Button>
                            </Link>

                            {/* 2. TRY BUTTON */}
                            <Button
                                onClick={() => handleTrial(proSlug)}
                                disabled={activatingSlug === proSlug}
                                variant="outline"
                                className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-100 font-bold min-h-[44px] rounded-full flex items-center justify-center gap-2 text-sm transition-transform duration-200 hover:scale-[1.01]"
                            >
                                {activatingSlug === proSlug ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                                        <span>Activating Trial...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 fill-slate-900 text-slate-900" />
                                        <span>Try 14 Days Free</span>
                                    </>
                                )}
                            </Button>

                            <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                                Full professional access • Cancel anytime
                            </p>
                        </div>
                    </div>
                </div>

                {/* Enterprise Plan Banner */}
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 rounded-[28px] p-6 sm:p-8 text-white shadow-xl border border-blue-800/30">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                FOR LARGE TEAMS &amp; ENTERPRISE
                            </div>
                            <h4 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{displayEnterpriseTitle}</h4>
                            <p className="text-blue-200 text-sm font-semibold">
                                ₹{displayEnterprisePrice.toLocaleString('en-IN')}<span className="text-xs text-gray-300">/month</span> • {displayEnterpriseDesc}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <Link href={`/pricing?checkout=${enterpriseSlug}`} className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto bg-white hover:bg-blue-50 text-slate-950 font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 text-sm shadow-md">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Buy Enterprise • ₹{displayEnterprisePrice.toLocaleString('en-IN')}/mo</span>
                                </Button>
                            </Link>
                            <Button
                                onClick={() => handleTrial(enterpriseSlug)}
                                disabled={activatingSlug === enterpriseSlug}
                                variant="outline"
                                className="w-full sm:w-auto border-2 border-blue-400/80 bg-transparent hover:bg-blue-900/40 text-white font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                            >
                                <Zap className="h-4 w-4 text-blue-400 fill-blue-400" />
                                <span>Try 14 Days Free</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
