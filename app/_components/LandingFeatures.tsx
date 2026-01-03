'use client'

import { FileText, Users, IndianRupee, CheckCircle, RefreshCw, Clock } from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Quick Invoice Creation', desc: 'Create professional invoices in under 60 seconds', color: 'emerald' },
  { icon: IndianRupee, title: 'GST Compliant', desc: 'Automatic GST calculations with GSTIN support', color: 'blue' },
  { icon: Users, title: 'Customer Management', desc: 'Store and organize all customer details securely', color: 'purple' },
  { icon: CheckCircle, title: 'Custom Branding', desc: 'Add logo, fonts, and colors to match your brand', color: 'orange' },
  { icon: RefreshCw, title: 'Recurring Billing', desc: 'Set up automatic invoices for repeat clients', color: 'teal' },
  { icon: Clock, title: 'Payment Reminders', desc: 'Automated reminders for due and overdue payments', color: 'rose' },
] as const

export function LandingFeatures() {
  return (
    <section className="px-6 py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need for Professional Invoicing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for Indian businesses. Start free, upgrade when you grow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div 
                key={feature.title}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-gray-200"
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
