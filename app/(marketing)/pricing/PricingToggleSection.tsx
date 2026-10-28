'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/ui/BillingToggle'
import { PricingCard } from './PricingCard'
import type { SubscriptionPlan } from '@/lib/types-admin'

interface PricingToggleSectionProps {
  isAuthenticated: boolean
  currentPlan: string | null
  plans?: SubscriptionPlan[]
}

export function PricingToggleSection({ isAuthenticated, currentPlan, plans = [] }: PricingToggleSectionProps) {
  const [isYearly, setIsYearly] = useState(false)

  // Find DB plans if available
  const freePlan = plans.find((p) => p.slug === 'free')
  const starterPlan = plans.find((p) => p.slug === 'starter')
  const starterYearlyPlan = plans.find((p) => p.slug === 'starter-yearly')
  const proPlan = plans.find((p) => p.slug === 'professional')
  const proYearlyPlan = plans.find((p) => p.slug === 'professional-yearly')

  // Dynamic or official fallback rates
  const starterMonthlyPrice = starterPlan?.price ?? 299
  const starterYearlyPrice = starterYearlyPlan?.price ?? 2988
  const starterYearlyPerMonth = Math.round(starterYearlyPrice / 12)
  const starterSavings = starterMonthlyPrice * 12 - starterYearlyPrice

  const proMonthlyPrice = proPlan?.price ?? 599
  const proYearlyPrice = proYearlyPlan?.price ?? 5988
  const proYearlyPerMonth = Math.round(proYearlyPrice / 12)
  const proSavings = proMonthlyPrice * 12 - proYearlyPrice

  return (
    <>
      <BillingToggle onToggle={setIsYearly} defaultYearly={false} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-12">
        {/* Free Plan */}
        <PricingCard
          title="Free"
          price={
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹0</span>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
            </div>
          }
          description="Perfect for getting started with basic GST invoicing"
          features={
            freePlan?.features && freePlan.features.length > 0
              ? freePlan.features
              : [
                  "50 invoices total",
                  "Customer management",
                  "GST compliant invoices",
                  "PDF downloads",
                  "Custom branding"
                ]
          }
          planId="free"
          isAuthenticated={isAuthenticated}
          currentPlan={currentPlan}
        />

        {/* Starter Plan */}
        <PricingCard
          title="Starter"
          price={
            isYearly ? (
              <>
                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                  <span className="line-through">₹{(starterMonthlyPrice * 12).toLocaleString('en-IN')}</span>
                  {starterSavings > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold">
                      Save ₹{starterSavings.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    ₹{starterYearlyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/year</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ₹{starterYearlyPerMonth}/month billed annually
                </div>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  ₹{starterMonthlyPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
              </div>
            )
          }
          description="Best for freelancers and small businesses in India"
          features={
            starterPlan?.features && starterPlan.features.length > 0
              ? starterPlan.features
              : [
                  "Unlimited invoices",
                  "Automated payment reminders",
                  "WhatsApp sharing",
                  "GST reports & e-Way bill",
                  "Standard support"
                ]
          }
          planId={isYearly ? "starter-yearly" : "starter"}
          isPopular={true}
          buyText={isYearly ? `Buy Yearly • ₹${starterYearlyPrice.toLocaleString('en-IN')}` : `Buy Monthly • ₹${starterMonthlyPrice}`}
          trialText="Try 14 Days Free"
          hasTrial={true}
          buttonClass="bg-blue-600 hover:bg-blue-700 text-white"
          isAuthenticated={isAuthenticated}
          currentPlan={currentPlan}
        />

        {/* Professional Plan */}
        <PricingCard
          title="Professional"
          price={
            isYearly ? (
              <>
                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                  <span className="line-through">₹{(proMonthlyPrice * 12).toLocaleString('en-IN')}</span>
                  {proSavings > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold">
                      Save ₹{proSavings.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    ₹{proYearlyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/year</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ₹{proYearlyPerMonth}/month billed annually
                </div>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  ₹{proMonthlyPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
              </div>
            )
          }
          description="For growing businesses requiring multi-user access & analytics"
          features={
            proPlan?.features && proPlan.features.length > 0
              ? proPlan.features
              : [
                  "Everything in Starter",
                  "AI Accountant Assistant",
                  "Multi-user roles (up to 5)",
                  "Recurring invoices",
                  "Inventory tracking",
                  "Dedicated CA export"
                ]
          }
          planId={isYearly ? "professional-yearly" : "professional"}
          isPopular={false}
          buyText={isYearly ? `Buy Yearly • ₹${proYearlyPrice.toLocaleString('en-IN')}` : `Buy Monthly • ₹${proMonthlyPrice}`}
          trialText="Try 14 Days Free"
          hasTrial={true}
          buttonClass="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white"
          isAuthenticated={isAuthenticated}
          currentPlan={currentPlan}
        />
      </div>
    </>
  )
}
