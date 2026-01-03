'use client'

import { TrendingUp, Zap, Shield, CheckCircle, BarChart3 } from 'lucide-react'

const BENEFITS = [
  { icon: TrendingUp, text: 'No credit card required', color: 'emerald' },
  { icon: Zap, text: 'Free forever plan', color: 'blue' },
  { icon: Shield, text: 'Secure cloud storage', color: 'purple' },
  { icon: CheckCircle, text: 'Instant PDF download', color: 'orange' },
  { icon: BarChart3, text: 'Mobile responsive', color: 'teal' },
]

export function LandingBenefits() {
  return (
    <section className="px-6 py-12 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.text} className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-${benefit.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 text-${benefit.color}-600`} />
                </div>
                <span className="text-gray-700 font-medium">{benefit.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
