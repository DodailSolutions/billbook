'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Check, Zap, ShoppingCart, Loader2 } from 'lucide-react'
import { activatePlanTrial } from '@/app/(marketing)/pricing/actions'

interface HomePricingSectionProps {
    starterPrice: number
    proPrice: number
    freePrice: number
    starterSlug?: string
    enterpriseSlug?: string
    isAuthenticated?: boolean
}

export function HomePricingSection({
    starterPrice,
    proPrice,
    freePrice,
    starterSlug = 'starter',
    enterpriseSlug = 'enterprise',
    isAuthenticated = false
}: HomePricingSectionProps) {
    const router = useRouter()
    const [activatingSlug, setActivatingSlug] = useState<string | null>(null)

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
                                Free Plan
                            </span>
                            <div>
                                <span className="text-4xl font-black text-slate-950">₹{freePrice}</span>
                                <span className="text-slate-400 text-xs font-semibold"> / forever</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Ideal for freelancers and new startups.</p>
                            <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> 50 Invoices / Month
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> GST Tax Compliance
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> Customer &amp; Items Directory
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> Basic Financial Reports
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2 pt-8">
                            <Link href="/signup?plan=free" className="block">
                                <Button className="w-full bg-black hover:bg-slate-900 text-white font-bold min-h-[46px] rounded-full transition-transform duration-200 hover:scale-[1.01]">
                                    Get Started Free
                                </Button>
                            </Link>
                            <div className="h-[44px] flex items-center justify-center">
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Always 100% free • No card required
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
                                    Pro Starter
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    Buy or Try
                                </span>
                            </div>
                            <div>
                                <span className="text-4xl font-black text-slate-950">₹{starterPrice.toLocaleString('en-IN')}</span>
                                <span className="text-slate-500 text-xs font-semibold"> / month</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Everything growing SMBs need.</p>
                            <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> <strong>Unlimited</strong> Invoices &amp; Quotes
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> Full CRM &amp; Deal Pipeline
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> Bookkeeping &amp; General Ledger
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> Vendor Purchase Orders
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-blue-600 shrink-0" /> WhatsApp Direct Sharing
                                </li>
                            </ul>
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

                    {/* Enterprise Suite Plan */}
                    <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 flex flex-col justify-between hover:shadow-xl transition-all shadow-xs">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider block">
                                    Enterprise Suite
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    Buy or Try
                                </span>
                            </div>
                            <div>
                                <span className="text-4xl font-black text-slate-950">₹{proPrice.toLocaleString('en-IN')}</span>
                                <span className="text-slate-500 text-xs font-semibold"> / month</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Complete suite with AI &amp; Payroll.</p>
                            <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-black shrink-0" /> Everything in Pro Starter
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-black shrink-0" /> Full Payroll &amp; Payslip Engine
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-black shrink-0" /> AI Accountant Assistant
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-black shrink-0" /> Multi-User Team Roles
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 text-black shrink-0" /> Certified CA Marketplace Access
                                </li>
                            </ul>
                        </div>

                        {/* BOTH Buy & Try Action Buttons Always Visible */}
                        <div className="space-y-2.5 pt-8">
                            {/* 1. BUY BUTTON */}
                            <Link href={`/pricing?checkout=${enterpriseSlug}`} className="block">
                                <Button className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold min-h-[46px] rounded-full shadow-md flex items-center justify-center gap-2 text-sm sm:text-base transition-transform duration-200 hover:scale-[1.01]">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Buy Enterprise • ₹{proPrice.toLocaleString('en-IN')}/mo</span>
                                </Button>
                            </Link>

                            {/* 2. TRY BUTTON */}
                            <Button
                                onClick={() => handleTrial(enterpriseSlug)}
                                disabled={activatingSlug === enterpriseSlug}
                                variant="outline"
                                className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-100 font-bold min-h-[44px] rounded-full flex items-center justify-center gap-2 text-sm transition-transform duration-200 hover:scale-[1.01]"
                            >
                                {activatingSlug === enterpriseSlug ? (
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
                                Full enterprise access • Cancel anytime
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
