import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Users, IndianRupee, CheckCircle, RefreshCw, Clock, Shield, BarChart3, Palette, Download, Mail, Smartphone, Cloud, Lock } from 'lucide-react'

const FEATURES = [
  {
    category: 'Invoice Management',
    items: [
      { icon: FileText, title: 'Quick Invoice Creation', desc: 'Create professional invoices in under 60 seconds with our intuitive interface' },
      { icon: Download, title: 'PDF Export', desc: 'Download professional PDF invoices ready to send to clients instantly' },
      { icon: RefreshCw, title: 'Recurring Invoices', desc: 'Set up automatic invoices for subscription-based services and repeat clients' },
      { icon: Palette, title: 'Custom Branding', desc: 'Add your logo, customize fonts, colors, and make invoices truly yours' },
    ]
  },
  {
    category: 'GST & Compliance',
    items: [
      { icon: IndianRupee, title: 'Automatic GST Calculation', desc: 'Built-in GST calculation with configurable rates (default 18%)' },
      { icon: CheckCircle, title: 'GSTIN Support', desc: 'Store and display customer GSTIN on invoices for compliance' },
      { icon: BarChart3, title: 'Tax Reports', desc: 'Generate tax reports for easy GST filing and reconciliation' },
    ]
  },
  {
    category: 'Customer Management',
    items: [
      { icon: Users, title: 'Customer Database', desc: 'Store all customer details - name, email, phone, address, GSTIN' },
      { icon: FileText, title: 'Customer History', desc: 'View complete invoice history for each customer at a glance' },
      { icon: Mail, title: 'Payment Reminders', desc: 'Automated email reminders for due and overdue payments' },
    ]
  },
  {
    category: 'Security & Access',
    items: [
      { icon: Shield, title: 'Bank-Level Security', desc: 'Your data is encrypted and secured with industry-standard protocols' },
      { icon: Cloud, title: 'Cloud Storage', desc: 'Access your invoices from anywhere with automatic cloud backup' },
      { icon: Lock, title: 'Data Privacy', desc: 'Row-level security ensures your data stays private and secure' },
      { icon: Smartphone, title: 'Multi-Device', desc: 'Works seamlessly on desktop, tablet, and mobile devices' },
    ]
  },
]

export default function FeaturesPage() {
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
          All the Features You Need to
          <span className="block text-emerald-600 mt-2">Manage Your Business</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          BillBook provides everything you need to create professional invoices, manage customers, and get paid faster.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
            Start Free Trial
          </Button>
        </Link>
      </section>

      {/* Features by Category */}
      {FEATURES.map((category, idx) => (
        <section key={category.category} className={`px-6 py-16 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              {category.category}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg text-emerald-100 mb-8">Start creating professional invoices today</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 font-bold px-10">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
