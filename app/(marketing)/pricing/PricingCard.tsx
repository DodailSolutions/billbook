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
    isAuthenticated
}: PricingCardProps) {
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
        ? "bg-linear-to-br from-amber-50 to-orange-50 border-2 sm:border-3 border-amber-400 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all relative"
        : isPopular
        ? "bg-white dark:bg-gray-900 border-2 border-emerald-600 dark:border-emerald-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all relative"
        : "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all"

    return (
        <div className={cardClass}>
            {isPopular && !isDeal && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        Most Popular
                    </span>
                </div>
            )}
            
            {isDeal && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)]">
                    <span className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg block text-center">
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

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
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

            <Link href={getButtonLink()}>
                <Button className={`${buttonClass} text-sm sm:text-base`}>
                    {isAuthenticated && planId !== 'free' ? 'Upgrade Now' : buttonText}
                </Button>
            </Link>

            {isDeal && (
                <p className="text-xs text-center text-gray-600 mt-3 sm:mt-4">\u2728 Limited spots • 14-day money-back guarantee
                </p>
            )}
        </div>
    )
}
