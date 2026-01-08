'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/ui/BillingToggle'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export function UAEPricingToggleSection() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: 'Perfect for freelancers',
      features: [
        '1 user',
        'Unlimited invoices',
        'VAT-compliant invoicing',
        'Client management',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Growth',
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: 'For small businesses',
      features: [
        'Up to 3 users',
        'Everything in Starter',
        'Recurring invoices',
        'Payment reminders',
        'Arabic invoices'
      ],
      popular: true
    },
    {
      name: 'Pro',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      description: 'For growing companies',
      features: [
        'Up to 5 users',
        'Everything in Growth',
        'Advanced VAT reports',
        'API access',
        'Priority support'
      ],
      popular: false
    },
    {
      name: 'Enterprise',
      monthlyPrice: 299,
      yearlyPrice: 2990,
      description: 'For large teams',
      features: [
        'Up to 10 users',
        'Everything in Pro',
        'AI Accountant',
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
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice
          
          return (
            <div 
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all ${
                plan.popular ? 'border-2 border-emerald-600 relative' : 'border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              
              {isYearly && savings > 0 && (
                <div className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
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
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
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
              
              <Link href="/signup">
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
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
