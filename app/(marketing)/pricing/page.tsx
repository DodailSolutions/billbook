import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, CheckCircle } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BillBook</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
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

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Choose the plan that fits your business needs. All paid plans include 14-day free trial.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
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
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Up to 300 invoices total</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Customer management</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">GST compliant invoices</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">PDF downloads</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
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
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Unlimited</strong> invoices</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Everything in Free</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Recurring invoices</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Payment reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
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
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Everything in Starter</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>AI Accountant</strong> assistant</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>2 team members</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Advanced analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
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

        {/* Enterprise Plan */}
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-bold mb-2">Enterprise</h4>
              <p className="text-gray-300 mb-2">₹999/month • Up to 10 team members</p>
              <p className="text-sm text-gray-400">Everything in Professional + larger team size + AI Accountant</p>
            </div>
            <Link href="/signup">
              <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
