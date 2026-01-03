import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'
import { ReactNode } from 'react'

interface PricingCardProps {
    title: string
    price: ReactNode
    description: string
    features: (string | ReactNode)[]
    planId: string
    isPopular?: boolean
    isDeal?: boolean
    buttonText: string
    buttonClass: string
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
    buttonText,
    buttonClass,
    isAuthenticated,
    currentPlan
}: PricingCardProps) {
    // Check if this is the user's current plan
    const isCurrentPlan = currentPlan === planId

    // Determine the link based on authentication status
    const getButtonLink = () => {
        if (isAuthenticated) {
            // For logged-in users, go directly to checkout
            return `/pricing?checkout=${planId}`
        } else {
            // For guests, go to signup with plan parameter
            return `/signup?plan=${planId}`
        }
    }

    const cardClass = isDeal
        ? "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-2 sm:border-3 border-amber-400 dark:border-amber-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative mt-6 sm:mt-8 h-full flex flex-col"
        : isCurrentPlan
        ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 sm:border-3 border-emerald-500 dark:border-emerald-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl shadow-emerald-500/20 transition-all duration-300 relative mt-6 sm:mt-8 ring-2 ring-emerald-400/50 h-full flex flex-col"
        : isPopular
        ? "bg-white dark:bg-gray-900 border-2 border-emerald-600 dark:border-emerald-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 relative mt-6 sm:mt-8 ring-2 ring-emerald-500/10 h-full flex flex-col"
        : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 mt-6 sm:mt-8 h-full flex flex-col"

    return (
        <div className={cardClass}>
            {isCurrentPlan && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                        ✓ Current Plan
                    </span>
                </div>
            )}

            {isPopular && !isDeal && !isCurrentPlan && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg animate-pulse">
                        ⭐ Most Popular
                    </span>
                </div>
            )}
            
            {isDeal && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-xs">
                    <span className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl block text-center whitespace-nowrap overflow-hidden text-ellipsis animate-pulse">
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
                <p className={`text-sm sm:text-base ${isDeal ? 'text-amber-700 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                    {description}
                </p>
            </div>

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 ${
                            isDeal ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'
                        }`} />
                        <span className={`text-sm sm:text-base ${isDeal ? 'text-gray-700' : 'text-gray-700 dark:text-gray-300'}`}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto">
                {isCurrentPlan ? (
                    <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed text-sm sm:text-base">
                        Current Plan ✓
                    </Button>
                ) : (
                    <Link href={getButtonLink()}>
                        <Button className={`${buttonClass} text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                            {isAuthenticated && planId !== 'free' ? 'Upgrade Now' : buttonText}
                        </Button>
                    </Link>
                )}

                {isDeal && (
                    <p className="text-xs text-center text-amber-700 dark:text-amber-600 mt-3 sm:mt-4 font-medium">
                        ✨ Limited spots • 14-day money-back guarantee
                    </p>
                )}
            </div>
        </div>
    )
}
