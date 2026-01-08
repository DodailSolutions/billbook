import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Zap, Shield, DollarSign, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { USPricingToggleSection } from './USPricingToggleSection'

export const metadata = {
  title: 'Pricing - BillBooky International | Plans Starting at $49/year',
  description: 'Affordable invoicing plans in USD. Yearly from $49, Lifetime from $149. Sales tax support, custom tax rules, and unlimited flexibility for global businesses.',
  keywords: 'USD pricing, international invoice software, sales tax software pricing, global billing plans, lifetime invoicing deal'
}

export default async function USPricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const lifetimePlans = [
    {
      name: 'Starter',
      slug: 'lifetime-starter-us',
      price: 149,
      description: 'Best for freelancers & solo founders',
      invoices: 250,
      features: [
        '1 user',
        '250 invoices / year',
        'Sales invoices & estimates',
        'Auto tax calculation',
        'Email invoices + PDF',
        'Basic reports',
        'Standard support'
      ]
    },
    {
      name: 'Growth',
      slug: 'lifetime-growth-us',
      price: 249,
      popular: true,
      description: 'Best for small businesses',
      invoices: 1000,
      features: [
        'Up to 3 users',
        '1,000 invoices / year',
        'Recurring invoices',
        'Payment reminders',
        'Client statements',
        'Multi-state tax handling',
        'Priority email support'
      ]
    },
    {
      name: 'Pro',
      slug: 'lifetime-pro-us',
      price: 399,
      description: 'Best for agencies & consultants',
      invoices: 3000,
      features: [
        'Up to 5 users',
        '3,000 invoices / year',
        'Partial payments',
        'Advanced reports',
        'Custom invoice branding',
        'API access',
        'Priority support'
      ]
    },
    {
      name: 'Business',
      slug: 'lifetime-business-us',
      price: 599,
      description: 'Best for accounting firms',
      invoices: 10000,
      features: [
        'Up to 10 users',
        '10,000 invoices / year',
        'White-label invoices',
        'Client portal',
        'Role-based access',
        'Advanced analytics',
        'Dedicated onboarding'
      ]
    }
  ]

  const addOns = [
    { name: 'AI Copilot', monthly: 9, yearly: 49 },
    { name: 'WhatsApp / SMS automation', monthly: 15, yearly: 99 },
    { name: 'Extra users', monthly: 5, yearly: 29, unit: 'per user' },
    { name: 'Extra invoices (1,000)', monthly: null, yearly: 49 },
    { name: 'White-label branding', monthly: null, yearly: 199 },
    { name: 'Advanced reports', monthly: 7, yearly: 49 }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/us" className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky Logo" 
                width={32} 
                height={32}
                priority
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">BillBooky International</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/10 rounded-full border border-blue-200 dark:border-blue-500/20 mb-6">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">All Prices in USD</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Global Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose yearly subscriptions or pay once with lifetime access. Invoice limits reset January 1st.
          </p>
        </div>
      </section>

      {/* Yearly Plans */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Yearly Subscription Plans
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Flexible billing with annual invoice limits
          </p>
        </div>

        <USPricingToggleSection />
      </section>

      {/* Lifetime Plans */}
      <section className="px-6 py-20 bg-linear-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-full border border-amber-200 dark:border-amber-800 mb-4">
              <Zap className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">One-Time Payment</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Lifetime Access Plans
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Pay once, use forever. Invoice limits reset every January 1st.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {lifetimePlans.map((plan) => (
              <div 
                key={plan.slug}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 hover:shadow-xl transition-all ${
                  plan.popular ? 'border-amber-500 relative scale-105' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name} Lifetime</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">one-time payment</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={`/pricing?checkout=${plan.slug}`}>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700'
                    }`}
                  >
                    Buy Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Lifetime Safeguards */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Lifetime Plan Safeguards
            </h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Invoice limits reset every January 1st</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Lifetime = software access, not free infrastructure forever</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Add-ons billed separately (monthly/yearly)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Fair usage and abuse protection policy applies</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Power Up with Add-Ons
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Keep your base plan affordable, scale up as needed
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Add-On</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Monthly</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Yearly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {addOns.map((addon, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {addon.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700 dark:text-gray-300">
                      {addon.monthly ? `$${addon.monthly}${addon.unit ? ` ${addon.unit}` : ''}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                      ${addon.yearly}{addon.unit ? ` ${addon.unit}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">$49/yr</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Starting price</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure payments</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
