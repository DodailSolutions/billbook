import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Shield, Lock, Eye, Database, Globe, FileText } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | BillBooky UAE',
  description: 'Privacy Policy for BillBooky UAE - GDPR and UAE Data Protection compliant'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/ae" className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky Logo" 
                width={32} 
                height={32}
                priority
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">BillBooky UAE</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <Link href="/ae">
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20 mb-6">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">UAE Data Protection Compliant</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last Updated: 8 January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-emerald-600" />
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              BillBooky UAE (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our invoice generation platform in compliance with UAE Federal Law No. 45 of 2021 on the Protection of Personal Data and the General Data Protection Regulation (GDPR).
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using BillBooky UAE, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          {/* Data Controller */}
          <div className="mb-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Data Controller Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Company Name:</strong> BillBooky UAE
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Location:</strong> United Arab Emirates
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Email:</strong> privacy@billbooky.ae
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Data Protection Officer:</strong> dpo@billbooky.ae
            </p>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1.1 Personal Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              When you register for an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Full name and email address</li>
              <li>Business name and Tax Registration Number (TRN)</li>
              <li>Phone number and business address in UAE</li>
              <li>Trade license information (if applicable)</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1.2 Business Data
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Customer information you input (names, addresses, TRNs)</li>
              <li>Invoice details, products, and services data</li>
              <li>VAT calculations and tax-related information</li>
              <li>Payment records and transaction history</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1.3 Technical Data
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>IP address and geographic location</li>
              <li>Browser type, device information, and operating system</li>
              <li>Usage data, timestamps, and feature interactions</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Service Delivery:</strong> To provide invoice generation, VAT compliance, and business management features</li>
              <li><strong>Account Management:</strong> To create and maintain your account, process payments, and provide customer support</li>
              <li><strong>Legal Compliance:</strong> To comply with UAE VAT laws, Federal Tax Authority (FTA) requirements, and anti-money laundering regulations</li>
              <li><strong>Communication:</strong> To send service updates, security alerts, and promotional materials (with your consent)</li>
              <li><strong>Analytics:</strong> To improve our services, analyze usage patterns, and develop new features</li>
              <li><strong>Security:</strong> To detect fraud, prevent abuse, and protect your account from unauthorized access</li>
            </ul>
          </div>

          {/* Legal Basis for Processing */}
          <div className="mb-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Legal Basis for Processing (UAE & GDPR)
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Contract Performance:</strong> Processing necessary to provide our services under our Terms of Service</li>
              <li><strong>Legal Obligation:</strong> Compliance with UAE VAT law, FTA requirements, and tax regulations</li>
              <li><strong>Legitimate Interest:</strong> Fraud prevention, security, and service improvement</li>
              <li><strong>Consent:</strong> Marketing communications and optional features (you can withdraw consent anytime)</li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Service Providers:</strong> Cloud hosting (AWS/Supabase), payment processors (Razorpay), email services (for transactional emails only)</li>
              <li><strong>UAE Authorities:</strong> Federal Tax Authority (FTA) when legally required for VAT compliance and audits</li>
              <li><strong>Legal Requirements:</strong> When required by UAE law, court orders, or government requests</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale (with prior notice to you)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              <strong>We do NOT sell your personal data to third parties.</strong>
            </p>
          </div>

          {/* Data Storage */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-purple-600" />
              5. Data Storage and Security
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.1 Data Location
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your data is stored on secure servers located in AWS data centers. While data may be processed outside the UAE, we ensure adequate safeguards through:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
              <li>Standard Contractual Clauses (SCCs) approved by UAE authorities</li>
              <li>GDPR-compliant data processing agreements</li>
              <li>ISO 27001 certified infrastructure</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.2 Security Measures
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Multi-factor authentication (MFA) support</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access controls (RBAC)</li>
              <li>Automated backup and disaster recovery</li>
            </ul>
          </div>

          {/* Data Retention */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We retain your data as follows:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Active Accounts:</strong> While your account is active and for service delivery</li>
              <li><strong>Tax Records:</strong> 5 years from the end of the tax period (as required by UAE VAT law)</li>
              <li><strong>Financial Records:</strong> 6 years for accounting and audit purposes</li>
              <li><strong>Marketing Data:</strong> Until you unsubscribe or withdraw consent</li>
              <li><strong>Backup Data:</strong> Up to 90 days in encrypted backups</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              After the retention period, we securely delete or anonymize your data.
            </p>
          </div>

          {/* Your Rights */}
          <div className="mb-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-amber-600" />
              7. Your Privacy Rights (UAE & GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Under UAE Federal Law No. 45 of 2021 and GDPR, you have the right to:
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing or optional processing</li>
              <li><strong>Lodge Complaint:</strong> File a complaint with UAE Data Protection Office or your local supervisory authority</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              To exercise your rights, email us at <strong>privacy@billbooky.ae</strong>. We will respond within 30 days.
            </p>
          </div>

          {/* Cookies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Cookies and Tracking
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
              <li><strong>Analytics Cookies:</strong> To understand usage patterns and improve features</li>
              <li><strong>Preference Cookies:</strong> To remember your settings (theme, language)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can manage cookies through your browser settings. Note that disabling essential cookies may affect functionality.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              BillBooky UAE is intended for business use only. We do not knowingly collect information from individuals under 18 years of age. If we discover that a child under 18 has provided personal data, we will delete it immediately.
            </p>
          </div>

          {/* International Transfers */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Your data may be transferred to and processed in countries outside the UAE. We ensure adequate protection through:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>European Commission approved Standard Contractual Clauses (SCCs)</li>
              <li>GDPR adequacy decisions for EEA countries</li>
              <li>UAE-approved transfer mechanisms under Federal Law No. 45 of 2021</li>
            </ul>
          </div>

          {/* Changes to Policy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or through a prominent notice on our platform. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-emerald-600" />
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For privacy-related questions or to exercise your rights, contact us:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong> privacy@billbooky.ae</p>
              <p><strong>Data Protection Officer:</strong> dpo@billbooky.ae</p>
              <p><strong>Mailing Address:</strong> BillBooky UAE, United Arab Emirates</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/ae" className="flex items-center gap-2">
              <Image src="/logo-icon.svg" alt="BillBooky" width={24} height={24} />
              <span className="font-bold text-gray-900 dark:text-white">BillBooky UAE</span>
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/ae/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Privacy Policy
              </Link>
              <Link href="/ae/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
