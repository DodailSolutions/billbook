import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { Button } from '@/components/ui/Button'
import { CheckCircle, X, Zap, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { UAEPricingToggleSection } from './UAEPricingToggleSection'
import { RegionSwitcher } from '@/components/RegionSwitcher'
import { PublicHeaderAuth } from '@/components/PublicHeaderAuth'
import { CheckoutHandler } from '@/app/(marketing)/pricing/CheckoutHandler'
import type { SubscriptionPlan } from '@/lib/types-admin'

export const dynamic = 'force-dynamic'

export default async function UAEPricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  // Fetch active UAE plans from database
  let dbPlans: SubscriptionPlan[] = []
  try {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('currency', 'AED')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (data && data.length > 0) {
      dbPlans = data as SubscriptionPlan[]
    }
  } catch (error) {
    console.error('Error fetching UAE plans from database:', error)
  }

  // Lifetime Plan definitions mapped against database plans
  const lifetimeConfigs = [
    {
      slug: 'lifetime-ae',
      altSlug: 'starter-ae-lifetime',
      name: 'Starter Lifetime',
      defaultPrice: 499,
      subtitle: 'For freelancers',
      features: [
        '1 user',
        '300 invoices/year',
        'VAT-compliant',
        'Client management',
        'Email support'
      ],
      popular: false
    },
    {
      slug: 'lifetime-growth-ae',
      name: 'Growth Lifetime',
      defaultPrice: 899,
      subtitle: 'For small businesses',
      features: [
        'Up to 3 users',
        '1,200 invoices/year',
        'Recurring invoices',
        'Payment reminders',
        'VAT reports',
        'Priority support'
      ],
      popular: true
    },
    {
      slug: 'lifetime-pro-ae',
      name: 'Pro Lifetime',
      defaultPrice: 1499,
      subtitle: 'For agencies',
      features: [
        'Up to 5 users',
        '3,000 invoices/year',
        'Advanced VAT reports',
        'Multi-currency',
        'Custom templates',
        'API access'
      ],
      popular: false
    },
    {
      slug: 'lifetime-enterprise-ae',
      name: 'Business Lifetime',
      defaultPrice: 2499,
      subtitle: 'For enterprises',
      features: [
        'Up to 10 users',
        '10,000 invoices/year',
        'White-label invoices',
        'Client portal',
        'Advanced analytics',
        'Dedicated onboarding'
      ],
      popular: false
    }
  ]

  // Filter ONLY active lifetime plans from database
  const activeLifetimePlans = lifetimeConfigs
    .map(cfg => {
      const dbPlan = dbPlans.find(p => p.slug === cfg.slug || (cfg.altSlug && p.slug === cfg.altSlug))
      if (!dbPlan || !dbPlan.is_active) return null
      return {
        ...cfg,
        name: dbPlan.name || cfg.name,
        price: Number(dbPlan.price),
        slug: dbPlan.slug,
        features: (Array.isArray(dbPlan.features) && dbPlan.features.length > 0) ? dbPlan.features : cfg.features,
        popular: dbPlan.is_popular !== undefined ? dbPlan.is_popular : cfg.popular
      }
    })
    .filter(Boolean) as (typeof lifetimeConfigs[0] & { price: number; slug: string })[]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/ae" className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky Logo" 
                width={32} 
                height={32}
                priority
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">BillBooky UAE</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <RegionSwitcher />
            <ThemeToggle />
            <PublicHeaderAuth initialAuthenticated={isAuthenticated} />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            UAE Pricing Plans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose between flexible monthly plans or lifetime access with one-time payment. All prices in AED.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">All plans include VAT compliance & Arabic support</span>
          </div>
        </div>
      </section>

      {/* Monthly Plans */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Subscription Plans
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose monthly or yearly billing with up to 17% savings on annual plans
          </p>
        </div>

        <UAEPricingToggleSection plans={dbPlans} />
      </section>

      {/* Lifetime Plans (Dynamically filtered from database - hidden if disabled in Super Admin) */}
      {activeLifetimePlans.length > 0 && (
        <section id="lifetime" className="px-6 py-20 bg-linear-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-full border border-amber-200 dark:border-amber-800 mb-4">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Limited Time Offer</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                Lifetime Access Plans
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Pay once, use forever. No monthly fees. Perfect for established businesses.
              </p>
            </div>

            <div className={`grid md:grid-cols-2 ${activeLifetimePlans.length >= 4 ? 'lg:grid-cols-4' : activeLifetimePlans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 max-w-4xl mx-auto'} gap-6`}>
              {activeLifetimePlans.map((plan) => (
                <div 
                  key={plan.slug}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all ${
                    plan.popular ? 'border-blue-600 shadow-xl relative' : 'border-gray-200 dark:border-gray-700 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">AED {plan.price}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">one-time payment</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{plan.subtitle}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 dark:text-gray-200">
                          {feat.includes('Up to') || feat.includes('Everything') ? (
                            <strong>{feat}</strong>
                          ) : (
                            feat
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={`/ae/pricing?checkout=${plan.slug}`}>
                    <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-bold text-sm`}>
                      Get Lifetime Access
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Lifetime Terms */}
            <div className="mt-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                Lifetime Plan Details
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Invoice limits reset yearly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Lifetime = software access, infrastructure follows fair-usage policy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>All future feature updates included</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Add-ons (AI Copilot, WhatsApp, extra users) available for additional fee</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Add-ons Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Optional Add-ons
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Available for all plans (monthly & lifetime users)
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">AI Copilot</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">AED 29<span className="text-sm text-gray-600">/mo</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Smart invoice assistant</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">AED 39<span className="text-sm text-gray-600">/mo</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Automated messaging</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Extra Users</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">AED 20<span className="text-sm text-gray-600">/user/mo</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Add team members</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Extra Invoices</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">AED 99<span className="text-sm text-gray-600">/1k</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">For lifetime plans</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">White-label</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">AED 399<span className="text-sm text-gray-600">/yr</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Custom branding</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Start with our free trial. No credit card required. Full VAT compliance included.
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-gray-100 font-bold text-lg px-10 shadow-xl"
            >
              Start Free Trial →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <Link href="/ae" className="inline-flex items-center gap-2 mb-4">
              <Image src="/logo-icon.svg" alt="BillBooky" width={24} height={24} />
              <span className="font-bold text-gray-900 dark:text-white">BillBooky UAE</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 BillBooky UAE. All prices in AED excluding VAT.
            </p>
          </div>
        </div>
      </footer>

      {/* Direct Payment Checkout Handler & Razorpay SDK */}
      <CheckoutHandler basePath="/ae/pricing" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  )
}
