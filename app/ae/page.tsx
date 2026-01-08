import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { FileText, Users, CheckCircle, Shield, TrendingUp, RefreshCw, Clock, Building2, Zap, Globe, DollarSign } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

const FEATURES = [
  { icon: FileText, title: 'Quick Invoice Creation', desc: 'Create professional VAT-compliant invoices in under 60 seconds', color: 'emerald', badge: 'Popular' as const },
  { icon: DollarSign, title: 'VAT Compliant', desc: 'Automatic 5% VAT calculations, TRN validation, and compliant invoicing', color: 'blue', badge: 'Essential' as const },
  { icon: Users, title: 'Smart Customer Management', desc: 'Client portal, payment tracking, and automated reminders', color: 'purple', badge: 'New' as const },
  { icon: CheckCircle, title: 'Custom Branding', desc: 'Add logo, fonts, colors in English and Arabic', color: 'orange', badge: undefined },
  { icon: RefreshCw, title: 'Recurring Billing', desc: 'Automated invoices for subscriptions and retainer clients', color: 'teal', badge: 'Pro' as const },
  { icon: Clock, title: 'Payment Intelligence', desc: 'Multiple payment methods with auto-reconciliation', color: 'rose', badge: 'New' as const },
  { icon: Globe, title: 'Multi-Currency Support', desc: 'AED-first with 10+ currencies and auto exchange rates', color: 'indigo', badge: 'New' as const },
  { icon: TrendingUp, title: 'Smart Analytics', desc: 'Real-time dashboards and VAT reports for FTA compliance', color: 'amber', badge: 'AI' as const },
  { icon: Building2, title: 'Arabic Support', desc: 'Full Arabic interface and bilingual invoice templates', color: 'sky', badge: 'Essential' as const },
]

const BENEFITS = [
  'No credit card required',
  'Free trial available',
  'VAT compliant',
  'Instant PDF download',
  'Secure cloud storage',
  'Mobile responsive',
]

export default async function UAELandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir="ltr">
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
                className="transition-transform duration-200 hover:scale-110"
                priority
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">BillBooky UAE</h1>
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
                <Link href="/login">
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
        <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/50 opacity-30" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">🇦🇪 Built for UAE Businesses</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
                  VAT-Compliant
                  <span className="block mt-2 text-emerald-600">
                    Invoice Generator
                  </span>
                  <span className="block mt-2 text-2xl md:text-4xl">
                    for UAE Businesses
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                  Professional invoicing solution designed for <strong className="text-gray-900 dark:text-white">Dubai & UAE</strong> businesses. 
                  Full <span className="text-emerald-600 font-semibold">VAT compliance</span>, Arabic support, and multi-currency capabilities.
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
                    <Link href="/ae/pricing">
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

              <div className="flex flex-wrap gap-4 pt-6">
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
                    <span className="text-xs font-semibold text-gray-500 uppercase">Tax Invoice | فاتورة ضريبية</span>
                    <span className="text-sm font-bold text-emerald-600">#INV-2026-0001</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">AED 1,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">VAT (5%)</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">AED 50</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-emerald-600 text-lg">AED 1,050</span>
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
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">VAT Ready</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Arabic Support</span>
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
                <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-600">5%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">VAT Compliant</div>
              </div>
            </div>
            <div className="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-purple-600">AED</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">UAE-Focused</div>
              </div>
            </div>
            <div className="group relative rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-orange-600">عربي</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Arabic Support</div>
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
            Powerful features designed specifically for UAE businesses
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
              amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600',
              indigo: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600',
              sky: 'bg-sky-100 dark:bg-sky-500/10 text-sky-600',
            }
            const badgeColorClasses = {
              'Popular': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
              'Essential': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
              'New': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
              'Pro': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
              'AI': 'bg-linear-to-r from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-900/50 dark:to-fuchsia-900/50 dark:text-violet-300',
            }
            return (
              <div 
                key={feature.title}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-200"
              >
                <div>
                  {feature.badge && (
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColorClasses[feature.badge as keyof typeof badgeColorClasses]}`}>
                        {feature.badge}
                      </span>
                    </div>
                  )}
                  <div className={`inline-flex p-3 ${iconColorClasses[feature.color as keyof typeof iconColorClasses]} rounded-xl mb-4 group-hover:scale-105 transition-transform`}>
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

      {/* CTA Section */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Start Invoicing?
          </h3>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join UAE businesses using BillBooky for professional, VAT-compliant invoicing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-white text-emerald-700 hover:bg-gray-100 font-bold text-lg px-10 shadow-xl"
              >
                Start Free Trial →
              </Button>
            </Link>
            <Link href="/ae/pricing">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-10"
              >
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-emerald-100 mt-6">No credit card required • Full VAT compliance • Arabic support included</p>
        </div>
      </section>

      {/* Region Switcher */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link 
          href="/?region=in"
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">🇮🇳 Switch to India</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
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
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">BillBooky UAE</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional invoicing for UAE businesses. VAT-compliant, secure, and easy to use.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/ae#features" className="hover:text-emerald-600 transition-colors">Features</Link></li>
                <li><Link href="/ae/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/support" className="hover:text-emerald-600 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link></li>
                <li><a href="mailto:support@billbooky.com" className="hover:text-emerald-600 transition-colors">Email Support</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 BillBooky UAE. Built for UAE businesses with ❤️
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              VAT Compliant • FTA Ready • Arabic Support • Multi-Currency
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
