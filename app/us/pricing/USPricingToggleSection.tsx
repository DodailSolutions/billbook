'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/ui/BillingToggle'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Sparkles } from 'lucide-react'

export function USPricingToggleSection() {
  const [isYearly, setIsYearly] = useState(true) // Default to yearly

  const plans = [
    {
      name: 'Starter',
      slug: 'starter-us',
      monthlyPrice: 9,
      yearlyPrice: 49,
      invoiceLimit: isYearly ? 200 : 20,
      description: 'For freelancers',
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
      monthlyPrice: 19,
      yearlyPrice: 99,
      invoiceLimit: isYearly ? 800 : 70,
      description: 'For small businesses',
      features: [
        'Up to 3 users',
        `${isYearly ? '800' : '70'} invoices / ${isYearly ? 'year' : 'month'}`,
        'Recurring invoices',
        'Payment reminders',
        'Client statements',
        'Multi-state tax',
        'Priority email support'
      ],
      popular: true
    },
    {
      name: 'Pro',
      slug: 'pro-us',
      monthlyPrice: 29,
      yearlyPrice: 179,
      invoiceLimit: isYearly ? 2000 : 170,
      description: 'For agencies / consultants',
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
      monthlyPrice: 49,
      yearlyPrice: 299,
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
        {plans.map((plan) => {
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
              
              <Link href={`/pricing?checkout=${planId}`}>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
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
