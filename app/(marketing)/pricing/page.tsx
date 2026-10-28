import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Zap, ShoppingCart } from 'lucide-react'
import Footer from '@/components/Footer'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { CheckoutHandler } from './CheckoutHandler'
import { PricingToggleSection } from './PricingToggleSection'
import FounderCircle from './FounderCircle'
import Script from 'next/script'
import type { Metadata } from 'next'
import type { SubscriptionPlan } from '@/lib/types-admin'

export const metadata: Metadata = {
  title: 'Pricing - Affordable Plans Starting Free | BillBooky Invoice Generator',
  description: '100% Free plan with 50 invoices. Upgrade to Starter (₹299/mo), Professional (₹599/mo), or Lifetime (₹9,999) for unlimited invoicing. Try free for 14 days. GST-compliant billing software for Indian businesses.',
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
  let currentPlan: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan_name')
      .eq('id', user.id)
      .single()
    currentPlan = profile?.plan_name || 'free'
  }

  // Fetch active plans from database
  let dbPlans: SubscriptionPlan[] = []
  try {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('currency', 'INR')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (data && data.length > 0) {
      dbPlans = data as SubscriptionPlan[]
    }
  } catch (err) {
    console.warn('Could not fetch DB plans:', err)
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <CheckoutHandler />
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50/20 to-white dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950">
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base">
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
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base">
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
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm hover:shadow-md transition-shadow">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 fill-blue-600 dark:fill-blue-400" />
          14-day free trial on all plans • Instant activation with Razorpay
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
          Choose the plan that fits your business needs. Try any plan free for 14 days or buy directly for instant activation.
        </p>
      </section>

      {/* Founder Circle - Limited Early Access */}
      <FounderCircle isAuthenticated={isAuthenticated} />

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <PricingToggleSection isAuthenticated={isAuthenticated} currentPlan={currentPlan} plans={dbPlans} />

        {/* Enterprise Plan Banner with Try + Buy */}
        <div className="max-w-4xl mx-auto bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 dark:from-gray-800 dark:via-blue-950 dark:to-gray-800 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-blue-800/20 hover:shadow-blue-900/10 transition-shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold mb-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                FOR LARGE TEAMS &amp; ENTERPRISE
              </div>
              <h4 className="text-2xl sm:text-3xl font-bold mb-2 bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">Enterprise Plan</h4>
              <p className="text-blue-100 mb-2 text-lg font-semibold">₹999<span className="text-sm text-gray-300">/month</span> • Up to 10 team members</p>
              <p className="text-sm sm:text-base text-gray-300">
                Complete suite with AI Accountant Assistant, full Payroll &amp; Payslip engine, and Certified CA Marketplace access.
              </p>
            </div>

            {/* Try + Buy Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/pricing?checkout=enterprise" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-gray-900 hover:bg-blue-50 font-bold px-6 py-5 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {isAuthenticated ? "Upgrade Now • ₹999" : "Buy Enterprise • ₹999"}
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/dashboard?trial=enterprise" : "/signup?plan=enterprise&trial=true"} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-blue-400/50 hover:bg-white/10 text-white font-semibold px-5 py-5 text-sm whitespace-nowrap flex items-center justify-center gap-1.5">
                  <Zap className="h-4 w-4 text-blue-400 fill-blue-400" />
                  Try 14 Days Free
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mt-16 sm:mt-20 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">14 Days</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Money-back guarantee</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure & GST compliant</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Priority support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </div>
    </>
  )
}
