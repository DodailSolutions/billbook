import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Users, DollarSign, TrendingUp, Zap, Shield, Palette, Download, Calendar, Mail } from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Professional Invoices', desc: 'Create stunning, GST-compliant invoices with customizable templates', iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { icon: Palette, title: 'Brand Customization', desc: 'Add your logo, colors, and fonts to match your brand identity', iconColor: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  { icon: Users, title: 'Customer Management', desc: 'Store and organize customer information in one centralized place', iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { icon: DollarSign, title: 'Auto GST Calculation', desc: 'Automatic tax calculations with support for multiple GST rates', iconColor: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { icon: Download, title: 'PDF Export', desc: 'Download professional PDF invoices ready to send', iconColor: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  { icon: Calendar, title: 'Recurring Invoices', desc: 'Set up automatic recurring invoices for subscriptions', iconColor: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  { icon: Mail, title: 'Email Reminders', desc: 'Automated payment reminders to ensure timely payments', iconColor: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Track revenue, outstanding payments, and business metrics', iconColor: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  { icon: Shield, title: 'Secure & Private', desc: 'Bank-level security with automatic data backups', iconColor: 'text-rose-400', bgColor: 'bg-rose-500/10' },
] as const

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse [animation-delay:700ms]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse [animation-delay:1400ms]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400">
          BillBook
        </h1>
        <Button 
          asChild 
          variant="secondary" 
          className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm"
        >
          <Link href="/login">Sign In</Link>
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl">
          <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-sm font-medium mb-4">
            ✨ Professional Invoicing Made Simple
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
            Create Beautiful
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400">
              Invoices in Seconds
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The complete invoicing solution for businesses. Manage customers, generate GST-compliant invoices, 
            and get paid faster with customizable templates and automated reminders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg px-8"
            >
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="secondary" 
              className="bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:border-white/50 backdrop-blur-sm text-lg px-8"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <p className="text-sm text-slate-400 mt-4">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Bill Smarter</h3>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Powerful features designed to streamline your invoicing workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div 
                key={feature.title}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20"
              >
                <div className={`inline-flex p-3 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Invoicing?
          </h3>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using BillBook to streamline their billing process
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg px-10 shadow-2xl"
          >
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© 2025 BillBook. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
