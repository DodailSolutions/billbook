import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Users, IndianRupee, TrendingUp, Zap, Shield, CheckCircle, Clock, BarChart3, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

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

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BillBooky</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="secondary" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Built for Indian Businesses
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Professional Invoicing
              <span className="block text-emerald-600 dark:text-emerald-400 mt-2">Made Simple</span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Create GST-compliant invoices, manage customers, and get paid faster. 
              Built specifically for Indian small businesses and freelancers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 text-base shadow-lg hover:shadow-xl transition-all"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 text-base"
                >
                  See Features
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative bg-linear-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border border-gray-200 shadow-2xl">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
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
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-900">GST Ready</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Track Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">60sec</div>
              <div className="text-sm text-gray-600">Invoice Creation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">GST Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">₹ INR</div>
              <div className="text-sm text-gray-600">India-Focused</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">Free</div>
              <div className="text-sm text-gray-600">Forever Plan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Invoices
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for Indian small businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            const colorClasses = {
              emerald: 'bg-emerald-100 text-emerald-700',
              blue: 'bg-blue-100 text-blue-700',
              purple: 'bg-purple-100 text-purple-700',
              orange: 'bg-orange-100 text-orange-700',
              teal: 'bg-teal-100 text-teal-700',
              rose: 'bg-rose-100 text-rose-700',
            }
            return (
              <div 
                key={feature.title}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300"
              >
                <div className={`inline-flex p-3 ${colorClasses[feature.color]} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
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
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
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
              
              <Link href="/signup">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white border-2 border-emerald-600 rounded-2xl p-8 hover:shadow-xl transition-all relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
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
              
              <Link href="/signup">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
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
              
              <Link href="/signup">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Get Started
                </Button>
              </Link>
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
                  <Button variant="secondary" className="w-full border-white/20 text-white hover:bg-white/10">
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

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
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
