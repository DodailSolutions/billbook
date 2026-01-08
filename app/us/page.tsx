import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { DollarSign, Globe, FileText, BarChart3, Users, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'BillBooky International - Smart Invoicing for Global Businesses',
  description: 'Professional invoicing software for international businesses. Create sales tax-compliant invoices in USD. Perfect for US, Canada, Australia, and worldwide entrepreneurs.',
  keywords: 'international invoicing, USD invoices, sales tax software, global billing, multi-state tax, worldwide invoice generator'
}

export default async function InternationalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950">
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
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">For International Businesses</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Professional Invoicing<br />
            <span className="text-blue-600">For Your Country</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create custom tax rules for any country. USD pricing, sales tax support, and flexible invoicing for entrepreneurs worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/us/pricing">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6">
                View Pricing →
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="text-lg px-8 py-6">
                Start Free
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">$49/yr</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Starting price</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">USD</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Only currency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Custom</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tax rules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Global</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Built for International Businesses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you&apos;re in the US, Canada, Australia, or anywhere else - we&apos;ve got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: 'USD Only Pricing',
                description: 'Simple, transparent pricing in US dollars. No currency confusion, no hidden fees.'
              },
              {
                icon: FileText,
                title: 'Custom Tax Rules',
                description: 'Create unlimited tax types for your country - sales tax, VAT, GST, or any custom rate.'
              },
              {
                icon: Globe,
                title: 'Multi-State Support',
                description: 'Handle different tax rates across states, provinces, or regions with ease.'
              },
              {
                icon: BarChart3,
                title: 'Smart Analytics',
                description: 'Track revenue, tax liability, and client payments with detailed reports.'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Add team members with role-based access. Perfect for agencies and firms.'
              },
              {
                icon: Zap,
                title: 'Fast & Reliable',
                description: 'Cloud-based platform that works anywhere. Access from any device, anytime.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Supported */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Trusted Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Join entrepreneurs from over 50 countries using BillBooky for their invoicing needs
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-gray-700 dark:text-gray-300">
            {['🇺🇸 United States', '🇨🇦 Canada', '🇦🇺 Australia', '🇬🇧 United Kingdom', '🇸🇬 Singapore', '🇳🇿 New Zealand', '🇿🇦 South Africa', '🇮🇪 Ireland', '🇲🇽 Mexico', '🇧🇷 Brazil', '🇯🇵 Japan', '🇰🇷 South Korea'].map((country, index) => (
              <div key={index} className="text-lg font-medium">
                {country}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto bg-linear-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses creating professional invoices worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/us/pricing">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                View Pricing
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="bg-blue-500 hover:bg-blue-400 text-white border-blue-400 text-lg px-8 py-6">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1">
              <Link href="/us" className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/logo-icon.svg" 
                    alt="BillBooky" 
                    width={32} 
                    height={32}
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">BillBooky</span>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Professional invoicing software for businesses worldwide. Create custom invoices with flexible tax rules in USD.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/us/pricing" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Pricing</Link></li>
                <li><Link href="/features" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Features</Link></li>
                <li><Link href="/signup" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Sign Up</Link></li>
                <li><Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Documentation</Link></li>
                <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Blog</Link></li>
                <li><Link href="/support" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Support</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/refunds" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} BillBooky. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">🇮🇳 India</Link>
              <Link href="/ae" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">🇦🇪 UAE</Link>
              <Link href="/us" className="text-sm text-blue-600 font-medium">🌍 International</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
