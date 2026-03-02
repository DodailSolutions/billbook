'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function FounderCircle() {
  const scrollToApplication = () => {
    // Scroll to signup or application form
    window.location.href = '/signup?plan=founder'
  }

  return (
    <section 
      id="founder-circle" 
      className="bg-linear-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-950 py-20 animate-in fade-in duration-1000"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-sm font-semibold shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Limited Early Access
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            BillBooky Founder Circle
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We are onboarding <span className="font-bold text-indigo-600 dark:text-indigo-400">20 serious business owners</span> who want to automate invoicing and improve cash flow.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Lifetime Plan Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-indigo-500 dark:border-indigo-400 p-8 ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 hover:ring-indigo-600/70 transition-all duration-300">
            {/* Highlight Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                BEST VALUE
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Founder Lifetime Plan
              </h3>
              <div className="mb-2">
                <span className="text-gray-500 dark:text-gray-400 line-through text-lg">₹49,000</span>
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">₹9,999</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold">
                Only 5 Spots Left
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Unlimited invoices',
                'Priority WhatsApp support',
                'Early access to AI features',
                'Direct founder access',
                'Feature voting rights',
                'Custom branding'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Yearly Plan Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Founder Yearly Plan
              </h3>
              <div className="mb-2">
                <span className="text-gray-500 dark:text-gray-400 line-through text-lg">₹9,999</span>
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">₹2,999</span>
                <span className="text-gray-600 dark:text-gray-400">/year</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-sm font-semibold">
                Only 15 Spots Left
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Unlimited invoices',
                'GST-ready billing',
                'Customer management',
                'Email invoice delivery',
                'Basic analytics'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={scrollToApplication}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Apply for Founder Access
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <span className="font-semibold text-red-600 dark:text-red-400">Applications close in 7 days.</span> Founder pricing will never be available again.
          </p>
        </div>
      </div>
    </section>
  )
}
