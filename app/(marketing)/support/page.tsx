import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Mail, Book, MessageSquare } from 'lucide-react'

export default function SupportPage() {
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
          How Can We Help?
        </h1>
        <p className="text-xl text-gray-600">
          Get the support you need to make the most of BillBooky
        </p>
      </section>

      {/* Support Options */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/faq" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-600 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Book className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">FAQ</h3>
            <p className="text-gray-600 text-sm">Quick answers to common questions</p>
          </Link>

          <Link href="/contact" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-600 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm">Get help via email within 24h</p>
          </Link>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 opacity-60">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm">Coming Soon</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 opacity-60">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Documentation</h3>
            <p className="text-gray-600 text-sm">Coming Soon</p>
          </div>
        </div>

        {/* Support Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Support by Plan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Free Plan</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Email support</li>
                <li>• Response within 48 hours</li>
                <li>• FAQ access</li>
              </ul>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Starter & Professional</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Priority email support</li>
                <li>• Response within 24 hours</li>
                <li>• FAQ & documentation</li>
                <li>• Setup assistance</li>
              </ul>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Enterprise</h3>
              <ul className="space-y-3 text-gray-200">
                <li>• Dedicated account manager</li>
                <li>• Response within 12 hours</li>
                <li>• Phone support</li>
                <li>• Custom onboarding</li>
                <li>• Priority feature requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Issues</h2>
          <div className="space-y-4">
            <details className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
              <summary className="font-semibold text-gray-900 cursor-pointer">Can&apos;t log in to my account</summary>
              <p className="text-gray-600 mt-4">Try resetting your password using the &quot;Forgot Password&quot; link on the login page. If that doesn&apos;t work, contact support at support@dodail.com</p>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
              <summary className="font-semibold text-gray-900 cursor-pointer">Invoice PDF not downloading</summary>
              <p className="text-gray-600 mt-4">Make sure your browser allows downloads. Try clearing your browser cache and cookies. If the issue persists, try a different browser.</p>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
              <summary className="font-semibold text-gray-900 cursor-pointer">How to upgrade my plan</summary>
              <p className="text-gray-600 mt-4">Go to Settings → Billing in your dashboard. Select your desired plan and complete the payment. Your account will be upgraded immediately.</p>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
              <summary className="font-semibold text-gray-900 cursor-pointer">Need to export all my data</summary>
              <p className="text-gray-600 mt-4">You can download individual invoices as PDFs. For bulk export, contact support and we&apos;ll help you export your data in CSV format.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is ready to assist you
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
