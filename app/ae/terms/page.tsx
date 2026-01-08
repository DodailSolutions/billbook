import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FileText, AlertTriangle, CreditCard, Shield, Scale, Ban } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | BillBooky UAE',
  description: 'Terms of Service for BillBooky UAE - Legal terms and conditions'
}

export default function TermsOfServicePage() {
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
      <section className="px-6 py-16 bg-linear-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 mb-6">
            <Scale className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">UAE Commercial Law Compliant</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
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
              <FileText className="h-6 w-6 text-emerald-600" />
              Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and BillBooky UAE (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) regarding your use of the BillBooky invoice generation platform and related services (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use the Service.
            </p>
          </div>

          {/* Eligibility */}
          <div className="mb-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Eligibility and Account Registration
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              1.1 Eligibility Requirements
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              To use BillBooky UAE, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have legal capacity to enter into binding contracts under UAE law</li>
              <li>Operate a legitimate business registered in the UAE or conducting business in the UAE</li>
              <li>Possess a valid Tax Registration Number (TRN) if required by UAE VAT law</li>
              <li>Not be prohibited from using the Service under UAE or international law</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1.2 Account Security
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access or security breach. We are not liable for losses resulting from unauthorized use of your account.
            </p>
          </div>

          {/* Service Description */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Service Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              BillBooky UAE provides:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>VAT-compliant invoice generation and management</li>
              <li>Customer relationship management (CRM) tools</li>
              <li>Payment tracking and financial reporting</li>
              <li>Multi-currency support and Arabic language interface</li>
              <li>Cloud storage and backup of business data</li>
              <li>Optional add-ons: AI Copilot, WhatsApp integration, white-label branding</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              We reserve the right to modify, suspend, or discontinue any feature at any time with reasonable notice.
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-purple-600" />
              3. Subscription Plans and Payments
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              3.1 Subscription Types
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Monthly SaaS Plans:</strong> Billed monthly with unlimited invoices (AED 49-299/month)</li>
              <li><strong>Annual SaaS Plans:</strong> Billed yearly with discounted rates</li>
              <li><strong>Lifetime Plans:</strong> One-time payment with annual invoice limits (300-10,000 invoices/year)</li>
              <li><strong>Free Trial:</strong> 14-day trial with full feature access (no credit card required)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.2 Payment Terms
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>All prices are in UAE Dirham (AED) and exclude 5% UAE VAT</li>
              <li>Monthly subscriptions renew automatically unless cancelled 24 hours before renewal</li>
              <li>Annual subscriptions are non-refundable after 14 days from purchase</li>
              <li>Lifetime plans grant perpetual access to core features, subject to Fair Usage Policy</li>
              <li>Failed payments may result in service suspension after 7 days grace period</li>
              <li>We accept credit/debit cards, bank transfers, and digital wallets via Razorpay</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.3 Lifetime Plan Fair Usage Policy
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Lifetime plans include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Invoice Limits:</strong> Annual limits reset on January 1st each year (300/1,200/3,000/10,000 depending on plan)</li>
              <li><strong>Infrastructure:</strong> Cloud storage, bandwidth, and processing subject to reasonable use limits</li>
              <li><strong>Add-ons:</strong> AI Copilot, WhatsApp, extra users require separate monthly fees</li>
              <li><strong>Extra Invoices:</strong> Available at AED 99 per 1,000 invoices after annual limit</li>
              <li><strong>Future Updates:</strong> All feature updates included; major platform rewrites may require upgrade fees (with 12 months notice)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.4 Refund Policy
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Monthly Plans:</strong> Refundable within 7 days of first payment (not applicable to renewals)</li>
              <li><strong>Annual Plans:</strong> Refundable within 14 days with prorated deduction for usage</li>
              <li><strong>Lifetime Plans:</strong> 30-day money-back guarantee (minus usage fees for invoices generated)</li>
              <li><strong>Add-ons:</strong> Non-refundable once activated</li>
            </ul>
          </div>

          {/* User Responsibilities */}
          <div className="mb-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-600" />
              4. User Responsibilities and Prohibited Conduct
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              4.1 Acceptable Use
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Use the Service only for lawful business purposes</li>
              <li>Maintain accurate and up-to-date account information</li>
              <li>Ensure invoice data complies with UAE VAT regulations</li>
              <li>Safeguard your account credentials and API keys</li>
              <li>Comply with UAE Federal Tax Authority (FTA) requirements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.2 Prohibited Activities
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You must NOT:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Generate fraudulent or false invoices</li>
              <li>Use the Service for money laundering, tax evasion, or illegal activities</li>
              <li>Reverse engineer, decompile, or extract source code</li>
              <li>Resell or sublicense the Service without authorization</li>
              <li>Scrape, spider, or data mine the platform</li>
              <li>Upload malware, viruses, or malicious code</li>
              <li>Impersonate other users or businesses</li>
              <li>Harass, abuse, or threaten other users or our staff</li>
              <li>Bypass security measures or access controls</li>
              <li>Exceed rate limits or abuse API access</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Intellectual Property Rights
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              5.1 Our Rights
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              BillBooky UAE and all related trademarks, logos, designs, software, and content are owned by us or our licensors. You receive a limited, non-exclusive, non-transferable license to use the Service during your subscription term.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.2 Your Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              You retain ownership of all data, invoices, and content you create using the Service. You grant us a limited license to process, store, and display your data solely to provide the Service. We do not claim ownership of your business data.
            </p>
          </div>

          {/* VAT Compliance */}
          <div className="mb-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. VAT Compliance and Tax Obligations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>You acknowledge and agree that:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>You are solely responsible for ensuring your invoices comply with UAE VAT law (Federal Decree-Law No. 8 of 2017)</li>
              <li>You must maintain accurate Tax Registration Numbers (TRNs) for your business and customers</li>
              <li>You are responsible for filing VAT returns with the Federal Tax Authority (FTA)</li>
              <li>BillBooky UAE provides tools to assist compliance but does not provide tax or legal advice</li>
              <li>You should consult a qualified tax professional or chartered accountant for tax matters</li>
              <li>We are not liable for penalties, fines, or audits resulting from incorrect VAT calculations or filings</li>
            </ul>
          </div>

          {/* Data and Privacy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Data Protection and Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Your use of the Service is governed by our Privacy Policy, which complies with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>UAE Federal Law No. 45 of 2021 on Protection of Personal Data</li>
              <li>EU General Data Protection Regulation (GDPR)</li>
              <li>Dubai International Financial Centre (DIFC) Data Protection Law (if applicable)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              We implement industry-standard security measures but cannot guarantee absolute security. You are responsible for maintaining secure backups of critical business data.
            </p>
          </div>

          {/* Termination */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Ban className="h-6 w-6 text-red-600" />
              8. Termination and Suspension
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              8.1 Termination by You
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. No refunds for partial months/years.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.2 Termination by Us
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We may suspend or terminate your account immediately if:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>You violate these Terms or UAE law</li>
              <li>Your payment fails after 14 days grace period</li>
              <li>We detect fraudulent or illegal activity</li>
              <li>You abuse the Service or exceed fair usage limits</li>
              <li>Required by law enforcement or government authorities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.3 Data Export After Termination
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Upon termination, you have 30 days to export your data (invoices, customers, reports). After 30 days, we may permanently delete your data. Lifetime plan holders retain access unless terminated for cause.
            </p>
          </div>

          {/* Warranties and Disclaimers */}
          <div className="mb-12 bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              9. Warranties and Disclaimers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND.</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We disclaim all warranties, express or implied, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Merchantability, fitness for a particular purpose, and non-infringement</li>
              <li>Uninterrupted, error-free, or secure operation</li>
              <li>Accuracy of VAT calculations or tax compliance</li>
              <li>Data backup reliability or disaster recovery guarantees</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              We strive for 99.9% uptime but do not guarantee availability. Scheduled maintenance will be announced in advance.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY UAE LAW:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Our total liability for any claim shall not exceed the amount you paid in the 12 months preceding the claim (or AED 500 for free users)</li>
              <li>We are not liable for indirect, incidental, special, consequential, or punitive damages</li>
              <li>We are not responsible for lost profits, data loss, business interruption, or tax penalties</li>
              <li>Force majeure events (natural disasters, wars, pandemics, government actions) excuse performance</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Some jurisdictions do not allow limitation of liability, so this may not apply fully to you.
            </p>
          </div>

          {/* Indemnification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify, defend, and hold harmless BillBooky UAE, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Your violation of these Terms or UAE law</li>
              <li>Your misuse of the Service</li>
              <li>Infringement of third-party intellectual property rights</li>
              <li>Fraudulent or illegal invoicing activities</li>
              <li>VAT non-compliance or tax evasion</li>
            </ul>
          </div>

          {/* Dispute Resolution */}
          <div className="mb-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Governing Law and Dispute Resolution
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
              12.1 Governing Law
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms are governed by the laws of the United Arab Emirates, excluding conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              12.2 Dispute Resolution Process
            </h3>
            <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Informal Resolution:</strong> Contact us at legal@billbooky.ae to resolve disputes amicably (30-day negotiation period)</li>
              <li><strong>Mediation:</strong> If unresolved, disputes shall be mediated through Dubai International Arbitration Centre (DIAC)</li>
              <li><strong>Arbitration:</strong> Unresolved disputes shall be settled by arbitration under DIAC rules</li>
              <li><strong>Jurisdiction:</strong> Courts of Dubai, UAE have exclusive jurisdiction for non-arbitrable matters</li>
            </ol>
          </div>

          {/* General Provisions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              13. General Provisions
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Entire Agreement:</strong> These Terms, Privacy Policy, and SLA constitute the entire agreement</li>
              <li><strong>Amendments:</strong> We may modify Terms with 30 days notice for material changes</li>
              <li><strong>Severability:</strong> Invalid provisions do not affect enforceability of remaining Terms</li>
              <li><strong>Waiver:</strong> Failure to enforce a right does not constitute a waiver</li>
              <li><strong>Assignment:</strong> You may not assign your account without our consent; we may assign in case of acquisition</li>
              <li><strong>Language:</strong> English version prevails in case of translation conflicts</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              14. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions about these Terms, contact us:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>General Inquiries:</strong> support@billbooky.ae</p>
              <p><strong>Legal:</strong> legal@billbooky.ae</p>
              <p><strong>Privacy:</strong> privacy@billbooky.ae</p>
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
              <Link href="/ae/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/ae/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
