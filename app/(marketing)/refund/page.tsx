import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function RefundPage() {
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
          <Link href="/">
            <Button variant="secondary" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Refund Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-gray-600 leading-relaxed">
              We offer a 14-day money-back guarantee for all new paid subscriptions. If you&apos;re not satisfied with 
              BillBook for any reason, you can request a full refund within 14 days of your initial purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility for Refund</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Eligible for Refund:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>New subscriptions within 14 days of first payment</li>
              <li>First-time subscribers to a paid plan</li>
              <li>Billing errors or duplicate charges</li>
              <li>Service unavailability exceeding 24 consecutive hours</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Eligible for Refund:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Requests made after 14 days from initial purchase</li>
              <li>Renewals or subsequent billing cycles</li>
              <li>Plan upgrades (partial refunds not available)</li>
              <li>Accounts suspended for Terms of Service violations</li>
              <li>Free plan users (no payment made)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How to Request a Refund</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To request a refund within the 14-day window:
            </p>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Email us at refunds@billbook.in</li>
              <li>Include your account email and reason for refund</li>
              <li>We will process your request within 2-3 business days</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Allow 5-10 business days for the refund to appear</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation vs. Refund</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Distinction:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Cancellation:</strong> You can cancel your subscription anytime. You&apos;ll retain access until the end of your paid period, but won&apos;t receive a refund for the remaining time.</li>
                <li><strong>Refund:</strong> Available only within 14 days of initial purchase with full refund of payment.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partial Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not offer partial or pro-rated refunds for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Unused portion of subscription period</li>
              <li>Plan downgrades</li>
              <li>Mid-cycle cancellations</li>
              <li>Reduced usage in a billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Billing Errors</h2>
            <p className="text-gray-600 leading-relaxed">
              If you believe you were charged in error, contact us immediately. We will investigate and issue a 
              refund for verified billing errors, regardless of the 14-day window.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Plan Upgrades</h2>
            <p className="text-gray-600 leading-relaxed">
              When upgrading to a higher-tier plan mid-cycle:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You will be charged the difference for the remaining period</li>
              <li>Your next billing date remains the same</li>
              <li>No refunds for upgrades</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Plan Downgrades</h2>
            <p className="text-gray-600 leading-relaxed">
              If you downgrade your plan:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Change takes effect at the end of current billing cycle</li>
              <li>No refund for the difference in plan prices</li>
              <li>You retain current plan features until cycle ends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Credits</h2>
            <p className="text-gray-600 leading-relaxed">
              In cases where a refund is not applicable but there's been a service issue, we may offer:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Account credits for future billing</li>
              <li>Extended subscription period</li>
              <li>Free plan upgrade for a limited time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data After Refund</h2>
            <p className="text-gray-600 leading-relaxed">
              If you receive a refund:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Your account will be downgraded to Free plan (if under 300 invoices)</li>
              <li>or account will be closed (if over 300 invoices)</li>
              <li>You have 30 days to export your data before deletion</li>
              <li>All data is permanently deleted after 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. GST on Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              Refunds will include any GST paid. We will adjust our GST filings accordingly as per Indian tax regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Chargeback Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              If you file a chargeback with your bank instead of requesting a refund from us:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Your account will be immediately suspended</li>
              <li>All data access will be revoked</li>
              <li>We reserve the right to terminate your account</li>
              <li>Please contact us first to resolve any payment disputes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Questions About Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about our refund policy or want to request a refund:
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Email: refunds@billbook.in<br />
              Response time: 2-3 business days<br />
              Refund processing: 5-10 business days
            </p>
          </section>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Try Before You Buy</h3>
            <p className="text-gray-600">
              Start with our Free plan (up to 300 invoices) to test BillBook risk-free before committing to a paid plan. 
              This way, you can ensure it meets your needs before making a payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
