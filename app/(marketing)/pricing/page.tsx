import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Zap } from 'lucide-react'
import Footer from '@/components/Footer'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { PricingCard } from './PricingCard'
import { CheckoutHandler } from './CheckoutHandler'
import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Affordable Plans Starting Free | BillBooky Invoice Generator',
  description: '100% Free plan with 300 invoices. Upgrade to Premium (₹299/month) or Lifetime (₹9,999 one-time) for unlimited invoices. 14-day trial on monthly plans. No hidden charges. GST-compliant invoice software for Indian businesses.',
  keywords: [
    'invoice generator pricing',
    'free invoice software',
    'affordable billing software',
    'invoice software plans',
    'lifetime invoice software',
    'cheap invoice generator',
    'GST software pricing India',
    'invoice maker cost',
    'lifetime deal invoice software',
    'one-time payment billing software'
  ],
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  // Fetch user's current plan if authenticated
  let currentPlan = null
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan_name')
      .eq('id', user.id)
      .single()
    currentPlan = profile?.plan_name || 'free'
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <CheckoutHandler />
      <div className="min-h-screen bg-linear-to-b from-white via-emerald-50/20 to-white dark:from-gray-950 dark:via-emerald-950/10 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky Logo" 
                width={32} 
                height={32}
                className="transition-transform duration-200 hover:scale-110"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">BillBooky</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="secondary" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-24 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm hover:shadow-md transition-shadow">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 fill-emerald-600 dark:fill-emerald-400" />
          14-day free trial on monthly plans • Lifetime deal available
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-linear-to-r from-gray-900 via-emerald-800 to-gray-900 dark:from-white dark:via-emerald-400 dark:to-white bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
          Choose the plan that fits your business needs. Upgrade, downgrade, or cancel anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto mb-12">
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
              "Up to 300 invoices total",
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
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹299</span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
              </div>
            }
            description="For growing businesses"
            features={[
              <><strong>Unlimited</strong> invoices</>,
              "Everything in Free",
              "Recurring invoices",
              "Payment reminders",
              "Priority support"
            ]}
            planId="starter"
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
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹599</span>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">/month</span>
              </div>
            }
            description="For established teams"
            features={[
              "Everything in Starter",
              <><strong>AI Accountant</strong> assistant</>,
              <><strong>2 team members</strong></>,
              "Advanced analytics",
              "Custom reports"
            ]}
            planId="professional"
            buttonText="Start Free Trial"
            buttonClass="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white"
            isAuthenticated={isAuthenticated}
            currentPlan={currentPlan}
          />

          {/* Lifetime Pro Plan */}
          <PricingCard
            title="Lifetime Professional"
            price={
              <>
                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                  <span className="line-through">₹15,999</span>
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">38% OFF</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">₹9,999</span>
                </div>
              </>
            }
            description="Pay once, use forever"
            features={[
              <><strong>Unlimited invoices</strong> forever</>,
              <><strong>All Professional features</strong></>,
              "Recurring invoices & reminders",
              "Custom branding & templates",
              "Priority lifetime support",
              "Free future updates",
              "Single business entity"
            ]}
            planId="lifetime"
            isDeal={true}
            buttonText="Buy Now - Lifetime Access →"
            buttonClass="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg"
            isAuthenticated={isAuthenticated}
            currentPlan={currentPlan}
            isLifetime={true}
          />
        </div>

        {/* Enterprise Plan */}
        <div className="max-w-4xl mx-auto bg-linear-to-br from-gray-900 via-emerald-900 to-gray-900 dark:from-gray-800 dark:via-emerald-900 dark:to-gray-800 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-emerald-800/20 hover:shadow-emerald-900/10 transition-shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-semibold mb-3">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                FOR LARGE TEAMS
              </div>
              <h4 className="text-2xl sm:text-3xl font-bold mb-2 bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">Enterprise</h4>
              <p className="text-emerald-100 mb-2 text-lg font-semibold">₹999<span className="text-sm text-gray-300">/month</span> • Up to 10 team members</p>
              <p className="text-sm sm:text-base text-gray-300">Everything in Professional + larger team size + AI Accountant</p>
            </div>
            <Link href={isAuthenticated ? "/pricing?checkout=enterprise" : "/signup?plan=enterprise"}>
              <Button className="bg-white text-gray-900 hover:bg-emerald-50 font-semibold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap">
                {isAuthenticated ? "Upgrade Now" : "Get Started"} →
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mt-16 sm:mt-20 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">14 Days</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Money-back guarantee</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">100%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure & GST compliant</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">24/7</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Priority support</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
    </>
  )
}
