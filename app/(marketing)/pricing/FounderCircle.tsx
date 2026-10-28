'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ShoppingCart, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { activatePlanTrial } from './actions'
import type { SubscriptionPlan } from '@/lib/types-admin'

interface FounderCircleProps {
  isAuthenticated?: boolean
  plans?: SubscriptionPlan[]
}

export default function FounderCircle({ isAuthenticated = false, plans = [] }: FounderCircleProps) {
  const router = useRouter()
  const [isActivatingYearlyTrial, setIsActivatingYearlyTrial] = useState(false)

  // 1. Resolve Founder Lifetime Plan from DB plans
  const lifetimePlan = plans.find(p => 
    p.currency === 'INR' && (
      p.slug === 'lifetime-professional' || 
      p.slug === 'founder-lifetime' || 
      p.slug === 'lifetime' || 
      (p.billing_period === 'lifetime' && p.slug !== 'free')
    )
  )

  // 2. Resolve Founder Yearly Plan from DB plans
  const founderYearlyPlan = plans.find(p => 
    p.currency === 'INR' && (
      p.slug === 'founder-yearly' || 
      p.slug === 'founder' || 
      (p.billing_period === 'yearly' && (p.name.toLowerCase().includes('founder') || p.slug.includes('founder')))
    )
  )

  // Dynamic values for Lifetime Plan
  const lifetimeName = lifetimePlan?.name || 'Founder Lifetime Plan'
  const lifetimeDesc = lifetimePlan?.description || 'Pay once, own it forever with all future updates'
  const lifetimePrice = lifetimePlan ? Number(lifetimePlan.price) : 9999
  const lifetimeSlug = lifetimePlan?.slug || 'lifetime-professional'
  const isLifetimeActive = lifetimePlan ? lifetimePlan.is_active : true
  const lifetimeFeatures = (lifetimePlan?.features && lifetimePlan.features.length > 0)
    ? lifetimePlan.features
    : [
        'Unlimited invoices forever',
        'Priority WhatsApp & phone support',
        'Early access to all AI features',
        'Direct founder access & advisory',
        'Feature voting & roadmap influence',
        'Full custom branding & watermark removal'
      ]

  // Dynamic values for Founder Yearly Plan
  const yearlyName = founderYearlyPlan?.name || 'Founder Yearly Plan'
  const yearlyDesc = founderYearlyPlan?.description || 'Locked-in founder pricing for 1 full year'
  const yearlyPrice = founderYearlyPlan ? Number(founderYearlyPlan.price) : 2999
  const yearlySlug = founderYearlyPlan?.slug || 'founder-yearly'
  const isYearlyActive = founderYearlyPlan ? founderYearlyPlan.is_active : true
  const yearlyFeatures = (founderYearlyPlan?.features && founderYearlyPlan.features.length > 0)
    ? founderYearlyPlan.features
    : [
        'Unlimited invoices for 12 months',
        'GST-ready billing & e-Way bill reports',
        'Automated payment reminders & WhatsApp',
        'Customer management & payment tracking',
        'Fast email invoice delivery',
        'Business analytics & reports'
      ]

  // Calculated reference comparison prices
  const lifetimeOriginalPrice = Math.max(49000, lifetimePrice * 3)
  const yearlyOriginalPrice = Math.max(9999, yearlyPrice * 3)

  const handleYearlyTrial = async () => {
    if (!isAuthenticated) {
      router.push(`/signup?plan=${yearlySlug}&trial=true`)
      return
    }

    try {
      setIsActivatingYearlyTrial(true)
      const res = await activatePlanTrial(yearlySlug)
      if (res.redirectUrl) {
        router.push(res.redirectUrl)
      } else if (!res.success && res.error) {
        alert(res.error)
      }
    } catch (err: unknown) {
      console.error('Founder trial activation error:', err)
      alert('Failed to activate trial. Please try again.')
    } finally {
      setIsActivatingYearlyTrial(false)
    }
  }

  const scrollToApplication = () => {
    window.location.href = `/signup?plan=${lifetimeSlug}`
  }

  return (
    <section 
      id="founder-circle" 
      className="bg-linear-to-b from-indigo-50/70 via-white to-white dark:from-indigo-950/20 dark:via-gray-950 dark:to-gray-950 py-16 sm:py-20 animate-in fade-in duration-700"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Badge */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Limited Early Access
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            BillBooky Founder Circle
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We are onboarding <span className="font-bold text-indigo-600 dark:text-indigo-400">20 serious business owners</span> who want to automate invoicing, GST compliance, and cash flow.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* 1. Lifetime Plan Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-indigo-500 dark:border-indigo-400 p-6 sm:p-8 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 flex flex-col justify-between">
            {/* Highlight Badge */}
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md uppercase tracking-wider">
                BEST VALUE
              </span>
            </div>

            <div>
              <div className="text-center mb-6 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
                  {lifetimeName}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{lifetimeDesc}</p>
                <div className="mb-1">
                  <span className="text-gray-400 line-through text-base font-semibold">₹{lifetimeOriginalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5 mb-3">
                  <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400">₹{lifetimePrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500 font-medium">one-time</span>
                </div>
                {isLifetimeActive ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-full text-xs font-semibold border border-red-200 dark:border-red-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Only 5 Spots Left
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-semibold">
                    Currently Closed
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {lifetimeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifetime Actions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              {isLifetimeActive ? (
                <Link href={`/pricing?checkout=${lifetimeSlug}`} className="block">
                  <button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Lifetime Access • ₹{lifetimePrice.toLocaleString('en-IN')}
                  </button>
                </Link>
              ) : (
                <button disabled className="w-full h-12 bg-gray-300 dark:bg-gray-800 text-gray-500 font-bold rounded-xl text-sm sm:text-base cursor-not-allowed">
                  Sold Out
                </button>
              )}
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                ✨ One-time payment • No monthly fees ever • 14-day refund guarantee
              </p>
            </div>
          </div>

          {/* 2. Founder Yearly Plan Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="text-center mb-6 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
                  {yearlyName}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{yearlyDesc}</p>
                <div className="mb-1">
                  <span className="text-gray-400 line-through text-base font-semibold">₹{yearlyOriginalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1.5 mb-3">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">₹{yearlyPrice.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-gray-500 font-semibold">/year</span>
                </div>
                {isYearlyActive ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-800">
                    Only 15 Spots Left
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-semibold">
                    Currently Closed
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {yearlyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly Actions: Try + Buy */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              {isYearlyActive ? (
                <>
                  <Link href={`/pricing?checkout=${yearlySlug}`} className="block">
                    <button className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Buy Yearly Access • ₹{yearlyPrice.toLocaleString('en-IN')}
                    </button>
                  </Link>

                  <button
                    onClick={handleYearlyTrial}
                    disabled={isActivatingYearlyTrial}
                    className="w-full h-10 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    {isActivatingYearlyTrial ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        <span>Starting Trial...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />
                        <span>Try 14 Days Free</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button disabled className="w-full h-12 bg-gray-300 dark:bg-gray-800 text-gray-500 font-bold rounded-xl text-sm sm:text-base cursor-not-allowed">
                  Sold Out
                </button>
              )}

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                Cancel anytime during trial • Instant activation upon purchase
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Application Link */}
        <div className="text-center pt-4">
          <Button
            onClick={scrollToApplication}
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs"
          >
            Apply for Founder Access &rarr;
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-semibold text-red-600">Applications close in 7 days.</span> Founder pricing will not be repeated.
          </p>
        </div>
      </div>
    </section>
  )
}
