'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/ui/BillingToggle'
import { PricingCard } from './PricingCard'

interface PricingToggleSectionProps {
  isAuthenticated: boolean
  currentPlan: string | null
}

export function PricingToggleSection({ isAuthenticated, currentPlan }: PricingToggleSectionProps) {
  const [isYearly, setIsYearly] = useState(false)

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
          description="Perfect for getting started"
          features={[
            "Up to 50 invoices total",
            "Customer management",
            "GST compliant invoices",
            "PDF downloads",
            "Custom branding"
          ]}
          planId="free"
          buttonText="Start Free"
          buttonClass="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white"
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
                  <span className="line-through">₹3,588</span>
                  <span className="ml-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded font-semibold">Save ₹600</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹2,988</span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/year</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">₹249/month billed annually</div>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹299</span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
              </div>
            )
          }
          description="For growing businesses"
          features={[
            <><strong>Unlimited</strong> invoices</>,
            "Everything in Free",
            "Recurring invoices",
            "Payment reminders",
            "Priority support"
          ]}
          planId={isYearly ? "starter-yearly" : "starter"}
          isPopular={true}
          buttonText="Start Free Trial"
          buttonClass="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  <span className="line-through">₹7,188</span>
                  <span className="ml-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded font-semibold">Save ₹1,200</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹5,988</span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/year</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">₹499/month billed annually</div>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹599</span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
              </div>
            )
          }
          description="For established teams"
          features={[
            "Everything in Starter",
            <><strong>AI Accountant</strong> assistant</>,
            <><strong>2 team members</strong></>,
            "Advanced analytics",
            "Custom reports"
          ]}
          planId={isYearly ? "professional-yearly" : "professional"}
          buttonText="Start Free Trial"
          buttonClass="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white"
          isAuthenticated={isAuthenticated}
          currentPlan={currentPlan}
        />

        {/* Lifetime Plan Hidden - Now in Founder Circle Section */}
      </div>
    </>
  )
}
