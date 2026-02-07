import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { FileText, Users, IndianRupee, Zap, CheckCircle, Shield, TrendingUp, RefreshCw, Clock, Building2, ArrowRight, Star, Check, BarChart3, Smartphone, Globe, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

const FEATURES = [
  { icon: FileText, title: 'Quick Invoice Creation', desc: 'Create professional invoices in under 60 seconds', color: 'blue' },
  { icon: IndianRupee, title: 'GST Compliant', desc: 'Auto IGST/CGST/SGST classification with full compliance', color: 'emerald' },
  { icon: Users, title: 'Customer Management', desc: 'Manage customers, track payments, and monitor aging', color: 'purple' },
  { icon: RefreshCw, title: 'Recurring Billing', desc: 'Automate monthly, quarterly or yearly invoices', color: 'orange' },
  { icon: Clock, title: 'Payment Tracking', desc: 'Monitor payments, send reminders automatically', color: 'pink' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visual reports and insights for your business', color: 'indigo' },
]

const BENEFITS = [
  'Create unlimited invoices',
  'GST & tax compliant',
  'Custom branding',
  'Payment tracking',
  'Mobile responsive',
  'Cloud storage',
]

const TESTIMONIALS = [
  { name: 'Rajesh Kumar', role: 'Freelance Designer', content: 'BillBooky made invoicing so simple. I love the clean interface and GST compliance features.', rating: 5 },
  { name: 'Priya Sharma', role: 'Consulting Firm Owner', content: 'Perfect for my consulting business. The recurring invoices feature saves me hours every month!', rating: 5 },
  { name: 'Amit Patel', role: 'E-commerce Store', content: 'Switched from Excel to BillBooky. Best decision for my business. Highly recommend!', rating: 5 },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image 
                  src="/logo-icon.svg" 
                  alt="BillBooky" 
                  width={32} 
                  height={32}
                  priority
                />
              </div>
              <span className="text-xl font-bold text-gray-900">BillBooky</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
              <Link href="/ca-marketplace" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">CA Services</Link>
              <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Zoho Inspired */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Free GST Invoicing Software</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Free GST invoicing software for small businesses
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Create professional, GST-compliant invoices in seconds. Perfect for freelancers, startups, and SMBs across India. Start free, upgrade when you grow.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm">
                    Get Started - It's Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">500+</span> businesses trust BillBooky
                </p>
              </div>
            </div>

            {/* Right Visual - Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Dashboard Mockup */}
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">dashboard.billbooky.com</div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice</div>
                        <div className="text-lg font-bold text-blue-600">#INV-2026-001</div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        PAID
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>

                    {/* Totals */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">₹10,000.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GST (18%)</span>
                        <span className="font-medium text-gray-900">₹1,800.00</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-blue-600">₹11,800.00</span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">GST</div>
                      <div className="text-sm font-bold text-gray-900">Compliant</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created in</div>
                      <div className="text-sm font-bold text-gray-900">60 seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
              <div className="text-sm text-gray-600">Invoices Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
              <div className="text-sm text-gray-600">GST Compliant</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">Free</div>
              <div className="text-sm text-gray-600">Forever Plan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to manage invoices
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for Indian businesses. Simple, fast, and GST-compliant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                purple: 'bg-purple-50 text-purple-600',
                orange: 'bg-orange-50 text-orange-600',
                pink: 'bg-pink-50 text-pink-600',
                indigo: 'bg-indigo-50 text-indigo-600',
              }
              return (
                <div key={feature.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className={`inline-flex p-3 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-lg mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Get started in 3 simple steps
            </h2>
            <p className="text-xl text-gray-600">No credit card required. Start creating invoices in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">Sign up free in 30 seconds. No credit card needed.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Add Business Info</h3>
              <p className="text-gray-600">Enter your company details, GST number, and logo.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Invoice</h3>
              <p className="text-gray-600">Generate professional invoices and send to clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose a plan that fits your needs
            </h2>
            <p className="text-xl text-gray-600">Simple, transparent pricing. Start free, upgrade anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">₹0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">50 invoices/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">GST compliant invoices</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Customer management</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">PDF downloads</span>
                </li>
              </ul>
              
              <Link href={isAuthenticated ? "/pricing" : "/signup"}>
                <Button variant="outline" className="w-full border-gray-300">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Starter Plan - Most Popular */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 hover:shadow-xl transition-all relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">₹299</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Unlimited</strong> invoices</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Recurring invoices</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Payment reminders</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              
              <Link href={isAuthenticated ? "/pricing" : "/signup"}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">₹599</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI Accountant assistant</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">2 team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom reports</span>
                </li>
              </ul>
              
              <Link href={isAuthenticated ? "/pricing" : "/signup"}>
                <Button variant="outline" className="w-full border-gray-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">All plans include 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Indian businesses
            </h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 text-white shadow-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to simplify your invoicing?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of Indian businesses creating professional invoices with BillBooky.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100 mt-6">No credit card required • Get started in 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/logo-icon.svg" 
                    alt="BillBooky" 
                    width={32} 
                    height={32}
                  />
                </div>
                <span className="text-xl font-bold text-white">BillBooky</span>
              </div>
              <p className="text-sm mb-4">
                Professional invoicing for Indian businesses. GST-compliant, simple, and secure.
              </p>
              <p className="text-xs text-gray-500">
                🇮🇳 Made in India with ❤️
              </p>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/ca-marketplace" className="hover:text-white transition-colors">CA Services</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 BillBooky. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <span>🇮🇳 Made in India</span>
              <span>•</span>
              <span className="text-blue-400">GST Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
