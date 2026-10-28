'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Zap, ShoppingCart, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'
import { activatePlanTrial } from './actions'

export interface PricingCardProps {
    title: string
    price: ReactNode
    description: string
    features: (string | ReactNode)[]
    planId: string
    isPopular?: boolean
    isDeal?: boolean
    isLifetime?: boolean
    hasTrial?: boolean
    trialText?: string
    buyText?: string
    buttonClass?: string
    isAuthenticated: boolean
    currentPlan?: string | null
}

export function PricingCard({
    title,
    price,
    description,
    features,
    planId,
    isPopular = false,
    isDeal = false,
    isLifetime = false,
    hasTrial = true,
    trialText = 'Try 14 Days Free',
    buyText = 'Buy Now',
    buttonClass,
    isAuthenticated,
    currentPlan
}: PricingCardProps) {
    const router = useRouter()
    const [isActivatingTrial, setIsActivatingTrial] = useState(false)

    // Check if this is the user's current plan
    const isCurrentPlan = currentPlan === planId

    // Determine checkout buy link
    const getBuyLink = () => {
        return `/pricing?checkout=${planId}`
    }

    // Determine trial link or action
    const handleTrialClick = async () => {
        if (!isAuthenticated) {
            router.push(`/signup?plan=${planId}&trial=true`)
            return
        }

        try {
            setIsActivatingTrial(true)
            const res = await activatePlanTrial(planId)
            if (res.redirectUrl) {
                router.push(res.redirectUrl)
            } else if (!res.success && res.error) {
                alert(res.error)
            }
        } catch (err: unknown) {
            console.error('Trial activation error:', err)
            alert('Failed to activate trial. Please try again.')
        } finally {
            setIsActivatingTrial(false)
        }
    }

    const cardClass = isDeal
        ? "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-2 sm:border-3 border-amber-400 dark:border-amber-600 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative mt-6 sm:mt-8 h-full flex flex-col"
        : isCurrentPlan
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 sm:border-3 border-blue-500 dark:border-blue-500 rounded-2xl p-6 sm:p-8 shadow-xl shadow-blue-500/20 transition-all duration-300 relative mt-6 sm:mt-8 ring-2 ring-blue-400/50 h-full flex flex-col"
        : isPopular
        ? "bg-white dark:bg-gray-900 border-2 border-blue-600 dark:border-blue-500 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 relative mt-6 sm:mt-8 ring-2 ring-blue-500/10 h-full flex flex-col"
        : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 mt-6 sm:mt-8 h-full flex flex-col"

    const isFree = planId === 'free'

    return (
        <div className={cardClass}>
            {isCurrentPlan && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                        ✓ Current Plan
                    </span>
                </div>
            )}

            {isPopular && !isDeal && !isCurrentPlan && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                        ⭐ Most Popular
                    </span>
                </div>
            )}
            
            {isDeal && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-10">
                    <span className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl block text-center whitespace-nowrap overflow-hidden text-ellipsis">
                        💎 BEST VALUE - Limited Time
                    </span>
                </div>
            )}

            <div className="mb-6">
                <h4 className={`text-xl sm:text-2xl font-bold mb-2 ${isDeal ? 'text-gray-900' : 'text-gray-900 dark:text-white'}`}>
                    {title}
                </h4>
                <div className="mb-3 sm:mb-4">
                    {price}
                </div>
                <p className={`text-sm sm:text-base ${isDeal ? 'text-amber-800 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    {description}
                </p>
            </div>

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 ${
                            isDeal ? 'text-amber-600' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                        <span className={`text-sm sm:text-base ${isDeal ? 'text-gray-800 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto space-y-2.5">
                {isCurrentPlan ? (
                    <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed text-sm sm:text-base py-3 rounded-xl font-medium">
                        Current Plan ✓
                    </Button>
                ) : isFree ? (
                    <Link href={isAuthenticated ? "/dashboard" : "/signup?plan=free"} className="block">
                        <button className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold rounded-xl text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow">
                            {isAuthenticated ? "Use Free Plan" : "Get Started Free"}
                        </button>
                    </Link>
                ) : isLifetime ? (
                    /* Lifetime Plan: Buy Only */
                    <div className="space-y-2">
                        <Link href={getBuyLink()} className="block">
                            <button className="w-full h-12 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                {buyText || "Buy Lifetime Now"}
                            </button>
                        </Link>
                        <p className="text-xs text-center text-amber-700 dark:text-amber-500 font-medium">
                            ✨ One-time payment • Lifetime access • 14-day refund
                        </p>
                    </div>
                ) : (
                    /* Recurring Paid Plans: Both BUY and TRY options */
                    <div className="space-y-2">
                        {/* 1. BUY BUTTON (Primary) */}
                        <Link href={getBuyLink()} className="block">
                            <button className={`w-full h-11 sm:h-12 ${
                                buttonClass || (isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white')
                            } font-bold rounded-xl text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}>
                                <ShoppingCart className="h-4 w-4" />
                                <span>{buyText}</span>
                            </button>
                        </Link>

                        {/* 2. TRY BUTTON (Secondary) */}
                        {hasTrial && (
                            <button
                                onClick={handleTrialClick}
                                disabled={isActivatingTrial}
                                className="w-full h-10 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                            >
                                {isActivatingTrial ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                                        <span>Activating Trial...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
                                        <span>{trialText}</span>
                                    </>
                                )}
                            </button>
                        )}

                        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                            {hasTrial ? 'No credit card required for trial • Cancel anytime' : 'Instant activation • 14-day money-back guarantee'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
