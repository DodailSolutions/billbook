import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Heart, Zap, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BillBooky</h1>
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
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Simplifying Invoicing for
          <span className="block text-emerald-600 mt-2">Indian Businesses</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          BillBooky was created with one mission: to help small businesses in India manage their invoicing effortlessly.
        </p>
      </section>

      {/* Story */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We started BillBooky after seeing countless small business owners in India struggle with complex invoicing software 
            that wasn&apos;t built for their needs. Most solutions were either too expensive, too complicated, or didn&apos;t support 
            GST properly.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            We knew there had to be a better way. So we built BillBooky - a simple, affordable, and GST-compliant invoicing 
            solution designed specifically for Indian freelancers, small shops, and growing businesses.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, hundreds of businesses across India use BillBooky to create professional invoices, manage customers, 
            and get paid faster. And we&apos;re just getting started.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simplicity First</h3>
              <p className="text-gray-600">
                We believe invoicing should be simple. No complex features you don&apos;t need, just what works.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Built for India</h3>
              <p className="text-gray-600">
                INR currency, GST compliance, and features that Indian businesses actually need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Security</h3>
              <p className="text-gray-600">
                Your data is precious. We use bank-level security to keep it safe and private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">100%</div>
            <div className="text-gray-600">GST Compliant</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">60sec</div>
            <div className="text-gray-600">Average Invoice Creation</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-gray-600">Cloud Access</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Join Us on This Journey</h3>
          <p className="text-lg text-emerald-100 mb-8">
            Start creating professional invoices today
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 font-bold px-10">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
