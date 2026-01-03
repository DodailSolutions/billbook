import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { FileText, Users, IndianRupee, Zap, CheckCircle, Shield, TrendingUp, RefreshCw, Clock } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

// Lazy load heavy components
const LandingFeatures = dynamic(() => import('./_components/LandingFeatures').then(mod => ({ default: mod.LandingFeatures })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
})
const LandingBenefits = dynamic(() => import('./_components/LandingBenefits').then(mod => ({ default: mod.LandingBenefits })), {
  loading: () => <div className="h-24 animate-pulse bg-gray-100" />
})

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
      <section className="relative px-6 py-20 md:py-32 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-30 w-96 h-96 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-20 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 backdrop-blur-sm">
                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">🇮🇳 Made in India • Free Forever</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                    Free Invoice Generator
                  </span>
                  <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    for Indian Businesses
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  <strong className="text-foreground">100% Free</strong> GST-compliant invoice generator. Perfect for MSMEs, freelancers, and businesses of all sizes. 
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">No credit card required</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
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
                        className="w-full sm:w-auto border-2 hover:bg-accent"
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
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
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
                        className="w-full sm:w-auto border-2 hover:bg-accent"
                      >
                        See Features
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
          </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-gradient-to-br from-emerald-50/50 via-blue-50/50 to-purple-50/50 dark:from-emerald-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-8 border border-border/50 backdrop-blur-sm shadow-2xl shadow-black/5">
                <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Invoice</span>
                  <span className="text-sm font-bold text-emerald-600">#INV-2025-0001</span>
                </div>
                
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-semibold">₹10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GST (18%)</span>
                    <span className="text-sm font-semibold">₹1,800</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-emerald-600 text-lg">₹11,800</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="bg-emerald-600 text-white text-center py-2 rounded-lg text-sm font-semibold">
                    Pay Now
                  </div>
                </div>
              </div>
            </div>
            
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-card/95 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-border animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">GST Ready</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card/95 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-border animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Track Payments</span>
                </div>
              </div>
          </div>
        </div>
      </section>

        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2">60sec</div>
                <div className="text-sm text-emerald-50">Invoice Creation</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                <div className="text-sm text-blue-50">GST Compliant</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2">₹ INR</div>
                <div className="text-sm text-purple-50">India-Focused</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2">Free</div>
                <div className="text-sm text-orange-50">Forever Plan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">Features</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for Indian businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            const colorClasses = {
              emerald: 'from-emerald-500 to-teal-600',
              blue: 'from-blue-500 to-indigo-600',
              purple: 'from-purple-500 to-pink-600',
              orange: 'from-orange-500 to-red-600',
              teal: 'from-teal-500 to-cyan-600',
              rose: 'from-rose-500 to-pink-600',
            }
            return (
              <div 
                key={feature.title}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${colorClasses[feature.color]} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
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
            <div className={`bg-white border-2 rounded-2xl p-8 hover:shadow-xl transition-all ${
              currentPlan === 'free' 
                ? 'border-emerald-500 bg-linear-to-br from-emerald-50 to-teal-50 shadow-xl ring-2 ring-emerald-400/50 relative' 
                : 'border-gray-200'
            }`}>
              {currentPlan === 'free' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
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
            <div className={`bg-white border-2 rounded-2xl p-8 hover:shadow-xl transition-all relative ${
              currentPlan === 'starter' 
                ? 'border-emerald-500 bg-linear-to-br from-emerald-50 to-teal-50 shadow-xl ring-2 ring-emerald-400/50' 
                : 'border-emerald-600'
            }`}>
              {currentPlan === 'starter' ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
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
                  <span className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
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
      <section className="px-6 py-16 md:py-24 bg-linear-to-br from-amber-500 via-amber-600 to-orange-600">
        <div className="max-w-5xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-semibold mb-6">
            <Zap className="h-4 w-4" />
            Limited Time Offer
          </div>
          
          <h3 className="text-4xl md:text-6xl font-bold mb-4">
            Lifetime Deal
          </h3>
          <p className="text-xl md:text-2xl text-amber-50 mb-8 max-w-3xl mx-auto">
            Pay once, use forever. No monthly fees, no hidden charges.
          </p>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-amber-50">Happy Customers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">₹0</div>
              <div className="text-amber-50">Monthly Fees</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">Forever</div>
              <div className="text-amber-50">Access Guaranteed</div>
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

      {/* SEO Content Section */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose BillBooky - The Best Free Invoice Generator in India?
          </h2>
          
          <div className="prose prose-emerald max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>BillBooky</strong> is India's leading <strong>free invoice generator</strong> designed specifically for Indian businesses, freelancers, and MSMEs. Whether you're a small business owner, consultant, freelancer, or startup, our platform makes creating <strong>GST-compliant invoices</strong> effortless and completely free.
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Free Invoice Generator for Every Business Size
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              From solo entrepreneurs to growing enterprises, BillBooky's <strong>invoice creator</strong> serves businesses across all sectors in India. Generate unlimited professional invoices with GST calculations, customizable templates, and instant PDF downloads - all at <strong>₹0 cost forever</strong>. Our invoice maker is trusted by thousands of Indian businesses for its simplicity and reliability.
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              GST-Compliant Billing Software - Made in India
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Built specifically for the Indian market, BillBooky ensures <strong>100% GST compliance</strong> with automatic tax calculations (CGST, SGST, IGST). Our <strong>invoice billing software</strong> includes features like GSTIN validation, HSN/SAC codes, reverse charge mechanism, and e-way bill support. Create tax invoices that meet all Indian tax regulations effortlessly.
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Features That Make Us the Best Invoice Software in India
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li><strong>100% Free Forever</strong> - No hidden charges, no credit card required</li>
              <li><strong>GST-Compliant Invoicing</strong> - Automatic tax calculations for Indian businesses</li>
              <li><strong>Custom Invoice Templates</strong> - Add your logo, customize colors and fonts</li>
              <li><strong>Instant PDF Generation</strong> - Download and send invoices immediately</li>
              <li><strong>Customer Management</strong> - Store and manage all your client details</li>
              <li><strong>Recurring Invoices</strong> - Automate invoices for subscription businesses</li>
              <li><strong>Payment Tracking</strong> - Monitor paid and pending invoices</li>
              <li><strong>Multi-Language Support</strong> - Create invoices in Hindi, English, and regional languages</li>
              <li><strong>Mobile Friendly</strong> - Create invoices on-the-go from any device</li>
            </ul>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Perfect for Indian MSMEs, Freelancers & Startups
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              BillBooky is designed for the Indian market - whether you run a <strong>retail shop in Mumbai</strong>, a <strong>consulting firm in Delhi</strong>, a <strong>software company in Bangalore</strong>, or work as a <strong>freelancer in Pune</strong>. Our <strong>billing software</strong> supports all types of businesses: services, retail, wholesale, manufacturing, consulting, and more.
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Made in India, For India 🇮🇳
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              As a <strong>proudly Indian product</strong>, BillBooky understands the unique needs of Indian businesses. We support Indian rupee (₹) as default currency, include all GST slab rates, provide Hindi and regional language support, and ensure data storage complies with Indian regulations. Join the Digital India movement with our free invoice software.
            </p>
            
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Start Creating Professional Invoices in 60 Seconds
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              No complicated setup, no lengthy tutorials. Just sign up for free, add your business details, and start generating professional invoices instantly. Our <strong>online invoice generator</strong> is so simple, anyone can use it - no accounting knowledge required.
            </p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-8">
              <p className="text-emerald-900 font-semibold text-center">
                🎉 Join 10,000+ Indian businesses using BillBooky as their trusted invoice generator. Start for FREE today!
              </p>
            </div>
          </div>
        </div>
      </section>

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
                <li><Link href="/features" className="hover:text-emerald-600">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-600">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-600">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-emerald-600">About</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600">Contact</Link></li>
                <li><Link href="/support" className="hover:text-emerald-600">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-emerald-600">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2025 BillBooky. Built with ❤️ for Indian businesses.</p>
            <p className="text-sm text-gray-600">Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
