import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky Logo" 
                width={32} 
                height={32}
                className="transition-transform duration-200 hover:scale-110"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BillBooky</h1>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using BillBooky, you agree to be bound by these Terms of Service. If you do not agree 
              with any part of these terms, you may not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              BillBooky provides cloud-based invoicing and billing software for businesses in India. Our service 
              includes invoice creation, customer management, GST calculation, payment tracking, and related features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You must provide accurate and complete information during registration</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to use our service</li>
              <li>One person or business may maintain only one free account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Plan</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Up to 300 invoices total</li>
              <li>Basic features as described on our website</li>
              <li>We reserve the right to modify or discontinue the free plan</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Paid Plans</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Billed monthly at the rate specified at time of purchase</li>
              <li>Prices subject to change with 30 days notice</li>
              <li>No refunds for partial months</li>
              <li>Automatic renewal unless cancelled</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Payment is due at the beginning of each billing cycle</li>
              <li>All fees are in Indian Rupees (INR)</li>
              <li>Failed payments may result in service suspension</li>
              <li>You authorize us to charge your payment method for recurring fees</li>
              <li>GST will be added to all prices as per Indian tax law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancellation and Refunds</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>14-day money-back guarantee for new paid subscriptions</li>
              <li>No refunds for cancellations after 14 days</li>
              <li>See our Refund Policy for complete details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use the service to send spam or unsolicited communications</li>
              <li>Resell or redistribute our service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Ownership and Use</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You retain all rights to your data and content</li>
              <li>You grant us permission to store and process your data to provide the service</li>
              <li>You are responsible for backing up your data</li>
              <li>You may export your data at any time</li>
              <li>Upon account termination, we will delete your data within 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Availability</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform scheduled 
              maintenance and are not liable for temporary unavailability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Intellectual Property</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>BillBooky and all related trademarks are our property</li>
              <li>Our software, design, and content are protected by copyright</li>
              <li>You may not copy, modify, or reverse engineer our service</li>
              <li>You grant us permission to use your company name/logo in our marketing materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, BillBooky shall not be liable for any indirect, incidental, 
              special, or consequential damages arising from your use of the service. Our total liability is limited 
              to the amount you paid us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold BillBooky harmless from any claims, damages, or expenses arising from 
              your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes. 
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by the laws of India. Any disputes shall be resolved in the courts of India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Email: legal@billbook.in<br />
              Address: India
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
