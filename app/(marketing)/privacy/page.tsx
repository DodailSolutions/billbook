import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function PrivacyPage() {
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
          <Link href="/">
            <Button variant="secondary" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At BillBooky, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our invoicing application and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Business information (company name, address, GSTIN)</li>
              <li>Payment information (processed securely through payment processors)</li>
              <li>Customer information you add to your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Usage Information</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your transactions and send invoices</li>
              <li>Send you service-related notifications</li>
              <li>Improve our services and develop new features</li>
              <li>Provide customer support</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Secure authentication mechanisms</li>
              <li>Limited access to personal information</li>
              <li>Regular backups to prevent data loss</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>With your explicit consent</li>
              <li>With service providers who help us operate our business (e.g., payment processors, hosting providers)</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights, property, or safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. 
              After account deletion, we may retain certain information for legal, tax, or regulatory purposes 
              as required by Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze usage, and provide 
              personalized content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not intended for users under 18 years of age. We do not knowingly collect 
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              via email or through our service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Email: support@billbooky.com<br />
              Address: India
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
