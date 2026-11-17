'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/ui/BillingToggle'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'
import type { SubscriptionPlan } from '@/lib/types-admin'

interface UAEPricingToggleSectionProps {
  plans?: SubscriptionPlan[]
}

export function UAEPricingToggleSection({ plans = [] }: UAEPricingToggleSectionProps) {
  const [isYearly, setIsYearly] = useState(false)

  // Dynamic plan lookups from database with official fallbacks
  const starterM = plans.find(p => p.slug === 'starter-ae')?.price ?? 49
  const starterY = plans.find(p => p.slug === 'starter-ae-yearly')?.price ?? 490

  const growthM = plans.find(p => p.slug === 'growth-ae')?.price ?? 99
  const growthY = plans.find(p => p.slug === 'growth-ae-yearly')?.price ?? 990

  const proM = plans.find(p => p.slug === 'pro-ae')?.price ?? 199
  const proY = plans.find(p => p.slug === 'pro-ae-yearly')?.price ?? 1990

  const entM = plans.find(p => p.slug === 'enterprise-ae')?.price ?? 299
  const entY = plans.find(p => p.slug === 'enterprise-ae-yearly')?.price ?? 2990

  const dynamicPlans = [
    {
      name: 'Starter',
      slug: 'starter-ae',
      monthlyPrice: Number(starterM),
      yearlyPrice: Number(starterY),
      description: 'Perfect for freelancers & solo consultants',
      features: [
        '1 user',
        'Unlimited invoices',
        'FTA 5% VAT-compliant invoicing',
        'Client management',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Growth',
      slug: 'growth-ae',
      monthlyPrice: Number(growthM),
      yearlyPrice: Number(growthY),
      description: 'For small trading and service businesses',
      features: [
        'Up to 3 users',
        'Everything in Starter',
        'Recurring invoices',
        'Payment reminders',
        'Arabic & English bilingual invoices'
      ],
      popular: true
    },
    {
      name: 'Pro',
      slug: 'pro-ae',
      monthlyPrice: Number(proM),
      yearlyPrice: Number(proY),
      description: 'For growing companies & agencies',
      features: [
        'Up to 5 users',
        'Everything in Growth',
        'Advanced VAT return reports',
        'API access',
        'Priority support'
      ],
      popular: false
    },
    {
      name: 'Enterprise',
      slug: 'enterprise-ae',
      monthlyPrice: Number(entM),
      yearlyPrice: Number(entY),
      description: 'For large teams & Free Zone enterprises',
      features: [
        'Up to 10 users',
        'Everything in Pro',
        'AI Accountant Copilot',
        'Custom integrations',
        'Dedicated support'
      ],
      popular: false
    }
  ]

  return (
    <>
      <BillingToggle onToggle={setIsYearly} defaultYearly={false} />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicPlans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice
          const planId = isYearly ? `${plan.slug}-yearly` : plan.slug
          
          return (
            <div 
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all ${
                plan.popular ? 'border-2 border-blue-600 relative' : 'border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              
              {isYearly && savings > 0 && (
                <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
                  Save AED {savings} per year
                </div>
              )}
              
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  AED {price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
              
              {isYearly && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  AED {(price / 12).toFixed(0)}/month billed annually
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {feature.includes('Up to') || feature.includes('Everything') ? (
                        <strong>{feature}</strong>
                      ) : (
                        feature
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={`/ae/pricing?checkout=${planId}`}>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 font-bold'
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
