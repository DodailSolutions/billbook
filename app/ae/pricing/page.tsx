import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { CheckCircle, X, Zap, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { UAEPricingToggleSection } from './UAEPricingToggleSection'

export default async function UAEPricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

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
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 bg-linear-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
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

        <UAEPricingToggleSection />
      </section>

      {/* Lifetime Plans */}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter Lifetime */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Starter Lifetime</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">AED 499</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">one-time payment</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">For freelancers</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">1 user</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">300 invoices/year</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">VAT-compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Client management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-500">No AI Copilot</span>
                </li>
              </ul>
              
              <Link href="/signup">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm">
                  Get Lifetime Access
                </Button>
              </Link>
            </div>

            {/* Growth Lifetime - MOST POPULAR */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-emerald-600 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  MOST POPULAR
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Growth Lifetime</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">AED 899</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">one-time payment</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">For small businesses</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200"><strong>Up to 3 users</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">1,200 invoices/year</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Recurring invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Payment reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">VAT reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Priority support</span>
                </li>
              </ul>
              
              <Link href="/signup">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                  Get Lifetime Access
                </Button>
              </Link>
            </div>

            {/* Pro Lifetime */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pro Lifetime</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">AED 1,499</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">one-time payment</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">For agencies</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200"><strong>Up to 5 users</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">3,000 invoices/year</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Advanced VAT reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Multi-currency</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Custom templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">API access</span>
                </li>
              </ul>
              
              <Link href="/signup">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm">
                  Get Lifetime Access
                </Button>
              </Link>
            </div>

            {/* Business Lifetime */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Business Lifetime</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">AED 2,499</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">one-time payment</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">For enterprises</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200"><strong>Up to 10 users</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">10,000 invoices/year</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">White-label</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Client portal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 dark:text-gray-200">Dedicated onboarding</span>
                </li>
              </ul>
              
              <Link href="/signup">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm">
                  Get Lifetime Access
                </Button>
              </Link>
            </div>
          </div>

          {/* Lifetime Terms */}
          <div className="mt-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Lifetime Plan Details
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Invoice limits reset yearly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Lifetime = software access, infrastructure follows fair-usage policy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>All future feature updates included</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Add-ons (AI Copilot, WhatsApp, extra users) available for additional fee</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

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
              <div className="text-2xl font-bold text-emerald-600 mb-2">AED 29<span className="text-sm text-gray-600">/mo</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Smart invoice assistant</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">AED 39<span className="text-sm text-gray-600">/mo</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Automated messaging</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Extra Users</div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">AED 20<span className="text-sm text-gray-600">/user/mo</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Add team members</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Extra Invoices</div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">AED 99<span className="text-sm text-gray-600">/1k</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">For lifetime plans</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">White-label</div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">AED 399<span className="text-sm text-gray-600">/yr</span></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Custom branding</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Start with our free trial. No credit card required. Full VAT compliance included.
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-emerald-700 hover:bg-gray-100 font-bold text-lg px-10 shadow-xl"
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
    </div>
  )
}
