'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/ui/BillingToggle'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Sparkles } from 'lucide-react'
import type { SubscriptionPlan } from '@/lib/types-admin'

interface USPricingToggleSectionProps {
  plans?: SubscriptionPlan[]
}

export function USPricingToggleSection({ plans = [] }: USPricingToggleSectionProps) {
  const [isYearly, setIsYearly] = useState(true) // Default to yearly

  // Dynamic plan lookups from database with official fallbacks
  const starterM = plans.find(p => p.slug === 'starter-us')?.price ?? 9
  const starterY = plans.find(p => p.slug === 'starter-us-yearly')?.price ?? 49

  const growthM = plans.find(p => p.slug === 'growth-us')?.price ?? 19
  const growthY = plans.find(p => p.slug === 'growth-us-yearly')?.price ?? 99

  const proM = plans.find(p => p.slug === 'pro-us')?.price ?? 29
  const proY = plans.find(p => p.slug === 'pro-us-yearly')?.price ?? 179

  const busM = plans.find(p => p.slug === 'business-us')?.price ?? 49
  const busY = plans.find(p => p.slug === 'business-us-yearly')?.price ?? 299

  const dynamicPlans = [
    {
      name: 'Starter',
      slug: 'starter-us',
      monthlyPrice: Number(starterM),
      yearlyPrice: Number(starterY),
      invoiceLimit: isYearly ? 200 : 20,
      description: 'For freelancers & solo operators',
      features: [
        '1 user',
        `${isYearly ? '200' : '20'} invoices / ${isYearly ? 'year' : 'month'}`,
        'Basic invoicing',
        'Sales tax support',
        'PDF + email invoices',
        'Basic reports',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Growth',
      slug: 'growth-us',
      monthlyPrice: Number(growthM),
      yearlyPrice: Number(growthY),
      invoiceLimit: isYearly ? 800 : 70,
      description: 'For small businesses & agencies',
      features: [
        'Up to 3 users',
        `${isYearly ? '800' : '70'} invoices / ${isYearly ? 'year' : 'month'}`,
        'Recurring invoices',
        'Payment reminders',
        'Client statements',
        'Multi-state sales tax',
        'Priority email support'
      ],
      popular: true
    },
    {
      name: 'Pro',
      slug: 'pro-us',
      monthlyPrice: Number(proM),
      yearlyPrice: Number(proY),
      invoiceLimit: isYearly ? 2000 : 170,
      description: 'For agencies & consultants',
      features: [
        'Up to 5 users',
        `${isYearly ? '2,000' : '170'} invoices / ${isYearly ? 'year' : 'month'}`,
        'Partial payments',
        'Advanced reports',
        'Custom branding',
        'API access',
        'Priority support'
      ],
      popular: false
    },
    {
      name: 'Business',
      slug: 'business-us',
      monthlyPrice: Number(busM),
      yearlyPrice: Number(busY),
      invoiceLimit: isYearly ? 6000 : 500,
      description: 'For accountants & teams',
      features: [
        'Up to 10 users',
        `${isYearly ? '6,000' : '500'} invoices / ${isYearly ? 'year' : 'month'}`,
        'White-label invoices',
        'Client portal',
        'Role-based access',
        'Advanced analytics',
        'Dedicated support'
      ],
      popular: false
    }
  ]

  return (
    <>
      <div className="text-center mb-8">
        <BillingToggle onToggle={(yearly) => setIsYearly(yearly)} defaultYearly={true} />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {isYearly ? '💰 Save up to 58% with yearly billing' : 'Switch to yearly and save big!'}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicPlans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const monthlyEquivalent = isYearly ? (plan.yearlyPrice / 12).toFixed(2) : null
          const planId = isYearly ? `${plan.slug}-yearly` : plan.slug
          
          return (
            <div 
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all ${
                plan.popular ? 'border-2 border-blue-600 relative scale-105' : 'border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Sold
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  / {isYearly ? 'year' : 'month'}
                </span>
              </div>
              
              {isYearly && monthlyEquivalent && (
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-4">
                  (${monthlyEquivalent}/month)
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link href={`/us/pricing?checkout=${planId}`}>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 font-bold'
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )
        })}
      </div>
    </>
  )
}
