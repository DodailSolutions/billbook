import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { FileText, Users, IndianRupee, Zap, CheckCircle, Shield, TrendingUp, RefreshCw, Clock, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { FAQSection } from './_components/FAQSection'
import { TestimonialCarousel } from './_components/TestimonialCarousel'

const FEATURES = [
  { icon: FileText, title: 'Quick Invoice Creation', desc: 'Create professional invoices in under 60 seconds', color: 'emerald' },
  { icon: IndianRupee, title: 'GST Compliant', desc: 'Automatic GST calculations with GSTIN support', color: 'blue' },
  { icon: Users, title: 'Customer Management', desc: 'Store and organize all customer details securely', color: 'purple' },
  { icon: CheckCircle, title: 'Custom Branding', desc: 'Add logo, fonts, and colors to match your brand', color: 'orange' },
  { icon: RefreshCw, title: 'Recurring Billing', desc: 'Set up automatic invoices for repeat clients', color: 'teal' },
  { icon: Clock, title: 'Payment Reminders', desc: 'Automated reminders for due and overdue payments', color: 'rose' },
] as const

const BENEFITS = [
  'No credit card required',
  'Free forever plan',
  'No installation needed',
  'Instant PDF download',
  'Secure cloud storage',
  'Mobile responsive',
]

export default async function Home() {
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
                priority
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

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 bg-linear-to-b from-emerald-50/50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/50 opacity-30" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">🇮🇳 Made in India • Free Forever</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Free Invoice Generator
                  <span className="block mt-2 text-emerald-600">
                    for Indian Businesses
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                  <strong className="text-gray-900 dark:text-white">100% Free</strong> GST-compliant invoice generator. Perfect for MSMEs, freelancers, and businesses of all sizes. 
                  <span className="text-emerald-600 font-semibold">No credit card required</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <span className="flex items-center gap-2">
                          Go to Dashboard
                          <TrendingUp className="h-4 w-4" />
                        </span>
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        View Plans
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <span className="flex items-center gap-2">
                          Start Free Trial
                          <Zap className="h-4 w-4" />
                        </span>
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        See Features
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
          </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Invoice</span>
                  <span className="text-sm font-bold text-emerald-600">#INV-2025-0001</span>
                </div>
                
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">₹10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">GST (18%)</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">₹1,800</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-emerald-600 text-lg">₹11,800</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="bg-emerald-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    Pay Now
                  </div>
                </div>
              </div>
            </div>
            
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">GST Ready</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Track Payments</span>
                </div>
              </div>
          </div>
        </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-emerald-600">60sec</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Invoice Creation</div>
              </div>
            </div>
            <div className="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">GST Compliant</div>
              </div>
            </div>
            <div className="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-purple-600">₹ INR</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">India-Focused</div>
              </div>
            </div>
            <div className="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-orange-600">Free</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Forever Plan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-4">
              <span className="text-sm font-medium text-emerald-600">Features</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed specifically for Indian businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            const iconColorClasses = {
              emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600',
              blue: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600',
              purple: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600',
              orange: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600',
              teal: 'bg-teal-100 dark:bg-teal-500/10 text-teal-600',
              rose: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600',
            }
            return (
              <div 
                key={feature.title}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-200"
              >
                <div>
                  <div className={`inline-flex p-3 ${iconColorClasses[feature.color]} rounded-xl mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-gray-600">Choose the plan that fits your business needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className={`bg-white border-2 rounded-2xl p-8 hover:shadow-lg transition-all ${
              currentPlan === 'free' 
                ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200 relative' 
                : 'border-gray-200'
            }`}>
              {currentPlan === 'free' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    ✓ Current Plan
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Free</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-gray-900">₹0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Up to 300 invoices total</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Customer management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">GST compliant invoices</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">PDF downloads</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom branding</span>
                </li>
              </ul>
              
              {currentPlan === 'free' ? (
                <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
                  Current Plan ✓
                </Button>
              ) : (
                <Link href={isAuthenticated ? "/pricing?checkout=free" : "/signup"}>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    {isAuthenticated ? 'Switch to Free' : 'Start Free'}
                  </Button>
                </Link>
              )}
            </div>

            {/* Starter Plan */}
            <div className={`bg-white border-2 rounded-2xl p-8 hover:shadow-lg transition-all relative ${
              currentPlan === 'starter' 
                ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200' 
                : 'border-emerald-600'
            }`}>
              {currentPlan === 'starter' ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    ✓ Current Plan
                  </span>
                </div>
              ) : (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Starter</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-gray-900">₹299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For growing businesses</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Unlimited</strong> invoices</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Recurring invoices</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Payment reminders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              
              {currentPlan === 'starter' ? (
                <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
                  Current Plan ✓
                </Button>
              ) : (
                <Link href={isAuthenticated ? "/pricing?checkout=starter" : "/signup"}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isAuthenticated ? 'Upgrade Now' : 'Get Started'}
                  </Button>
                </Link>
              )}
            </div>

            {/* Professional Plan */}
            <div className={`bg-white border-2 rounded-2xl p-8 hover:shadow-xl transition-all ${
              currentPlan === 'professional' 
                ? 'border-emerald-500 bg-linear-to-br from-emerald-50 to-teal-50 shadow-xl ring-2 ring-emerald-400/50 relative' 
                : 'border-gray-200'
            }`}>
              {currentPlan === 'professional' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    ✓ Current Plan
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Professional</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-gray-900">₹599</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For established teams</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>AI Accountant</strong> assistant</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>2 team members</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom reports</span>
                </li>
              </ul>
              
              {currentPlan === 'professional' ? (
                <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
                  Current Plan ✓
                </Button>
              ) : (
                <Link href={isAuthenticated ? "/pricing?checkout=professional" : "/signup"}>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    {isAuthenticated ? 'Upgrade Now' : 'Get Started'}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-8">All plans include 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Lifetime Deal Section - Prominent */}
      <section className="px-6 py-16 md:py-24 bg-amber-50 dark:bg-amber-900/20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-full text-amber-900 dark:text-amber-100 text-sm font-semibold mb-6">
            <Zap className="h-4 w-4" />
            Limited Time Offer
          </div>
          
          <h3 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            Lifetime Deal
          </h3>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Pay once, use forever. No monthly fees, no hidden charges.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="text-gray-500 text-lg mb-2">
                <span className="line-through">₹15,999</span>
                <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded">38% OFF</span>
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-6xl md:text-7xl font-bold text-gray-900">₹9,999</span>
              </div>
              <p className="text-lg font-semibold text-amber-600">One-time payment • Lifetime access</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 my-8 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited Invoices</p>
                  <p className="text-sm text-gray-600">No monthly limits, ever</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">All Premium Features</p>
                  <p className="text-sm text-gray-600">Everything in Professional plan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Free Updates</p>
                  <p className="text-sm text-gray-600">All future features included</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Priority Support</p>
                  <p className="text-sm text-gray-600">Lifetime priority assistance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Recurring Billing</p>
                  <p className="text-sm text-gray-600">Automated invoices & reminders</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Custom Branding</p>
                  <p className="text-sm text-gray-600">Logo, colors, fonts</p>
                </div>
              </div>
            </div>

            <Link href="/pricing#lifetime-deal">
              <Button 
                size="lg"
                className="w-full md:w-auto bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg px-12 py-6 shadow-xl"
              >
                Get Lifetime Access Now →
              </Button>
            </Link>

            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-600">
                ✨ <strong>Limited spots available</strong> • Secure your lifetime deal before price increases
              </p>
              <p className="text-sm text-gray-600">
                💳 One-time payment via Razorpay • 14-day money-back guarantee
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                * Fair usage policy applies. Lifetime access for single business entity. Unlimited invoices with reasonable usage.
              </p>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-amber-200 dark:border-white/20">
              <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">500+</div>
              <div className="text-gray-700 dark:text-amber-100 font-medium">Happy Customers</div>
            </div>
            <div className="bg-white dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-amber-200 dark:border-white/20">
              <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">₹0</div>
              <div className="text-gray-700 dark:text-amber-100 font-medium">Monthly Fees</div>
            </div>
            <div className="bg-white dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-amber-200 dark:border-white/20">
              <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Forever</div>
              <div className="text-gray-700 dark:text-amber-100 font-medium">Access Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Plan Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center md:text-left">
              <h4 className="text-3xl font-bold mb-3">Enterprise</h4>
              <p className="text-gray-300 mb-2 text-lg">₹999/month • Up to 10 team members</p>
              <p className="text-gray-400 mb-6">Everything in Professional + larger team size + AI Accountant + Advanced Analytics</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>API access</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>White label option</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                    View Pricing
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant="secondary" className="w-full bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 font-semibold px-8">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h3>
            <p className="text-lg text-gray-600">No complex setup. Start creating invoices in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Sign Up Free</h4>
              <p className="text-gray-600">Create your account in 30 seconds. No credit card required.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Add Your Details</h4>
              <p className="text-gray-600">Set up your business info, logo, and customize your invoice template.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Create Invoice</h4>
              <p className="text-gray-600">Generate your first professional invoice and send it to your client.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Simplify Your Invoicing?
          </h3>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of Indian businesses already using BillBooky. Start creating professional invoices today.
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-emerald-700 hover:bg-gray-100 font-bold text-lg px-10 shadow-xl"
            >
              Start Free Trial →
            </Button>
          </Link>
          <p className="text-sm text-emerald-100 mt-4">No credit card required • Setup in 2 minutes</p>
        </div>
      </section>

      {/* SEO Content Section - Why Choose BillBooky */}
      <section className="px-6 py-20 md:py-32 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              India&apos;s #1 Free Invoice Generator
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built specifically for Indian businesses, trusted by 10,000+ MSMEs, freelancers, and startups across India
            </p>
          </div>

          {/* Key Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-xl mb-4">
                <IndianRupee className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                100% Free Forever
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                No hidden charges, no credit card required. Create up to 300 invoices absolutely free. Premium plans start at just ₹299/month for unlimited invoices.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-xl mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                GST Compliant
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Automatic CGST, SGST, IGST calculations. Includes GSTIN validation, HSN/SAC codes, reverse charge mechanism, and full compliance with Indian tax laws.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-500/10 text-purple-600 rounded-xl mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Create in 60 Seconds
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                No complicated setup or lengthy tutorials. Sign up, add your business details, and generate professional invoices instantly. So simple, anyone can use it!
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="inline-flex p-3 bg-orange-100 dark:bg-orange-500/10 text-orange-600 rounded-xl mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Secure & Reliable
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Cloud-based with automatic backups. Your data is encrypted and stored securely. Access from anywhere, anytime on any device with bank-level security.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="inline-flex p-3 bg-teal-100 dark:bg-teal-500/10 text-teal-600 rounded-xl mb-4">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Recurring Invoices
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Perfect for subscription businesses. Automate monthly, quarterly, or yearly invoices. Set it once and never miss a billing cycle again.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="inline-flex p-3 bg-rose-100 dark:bg-rose-500/10 text-rose-600 rounded-xl mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Custom Branding
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Add your company logo, choose custom colors and fonts. Make professional invoices that match your brand identity perfectly.
              </p>
            </div>
          </div>

          {/* Who It's For Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-lg mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Perfect For Every Indian Business
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl mb-4">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Freelancers</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Consultants, designers, developers, writers</p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Small Business</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retail shops, service providers, traders</p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Startups</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tech companies, SaaS, e-commerce</p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl mb-4">
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enterprises</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manufacturing, wholesale, agencies</p>
              </div>
            </div>
          </div>

          {/* Made in India Section */}
          <div className="bg-linear-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <span className="text-2xl">🇮🇳</span>
                <span>Proudly Made in India</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Built for India, By Indians
              </h3>
              <p className="text-xl text-emerald-50 mb-8">
                Supporting Indian rupee (₹), all GST slabs, Hindi & regional languages. Data stored in India complying with all regulations. Join the Digital India movement!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-emerald-50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>₹ INR Currency</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>GST Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Hindi Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>India Servers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <TestimonialCarousel />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8 shrink-0">
                  <Image 
                    src="/logo-icon.svg" 
                    alt="BillBooky Logo" 
                    width={32} 
                    height={32}
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-900">BillBooky</h4>
              </div>
              <p className="text-sm text-gray-600">
                Professional invoicing for Indian businesses. GST-compliant, simple, and secure.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/features" className="hover:text-emerald-600 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing Plans</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-600 transition-colors">FAQ</Link></li>
                <li><Link href="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/support" className="hover:text-emerald-600 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
                <li><a href="mailto:support@billbooky.com" className="hover:text-emerald-600 transition-colors">Email Support</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-emerald-600 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2026 BillBooky. Proudly serving Indian businesses with ❤️</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold">Made in India 🇮🇳</span>
              <span className="text-emerald-600">GST Compliant • 100% Free</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
