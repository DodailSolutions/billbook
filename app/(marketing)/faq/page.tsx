import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Free Invoice Generator India | BillBooky Help & Support',
  description: 'Get answers to common questions about BillBooky invoice generator. Learn about GST compliance, pricing, features, and how to create professional invoices for your Indian business.',
  keywords: [
    'invoice generator faq',
    'billing software help',
    'GST invoice questions',
    'invoice maker support',
    'free invoice generator help',
    'BillBooky support',
    'invoice software India',
    'billing questions'
  ],
}

const FAQS = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I get started with BillBooky?',
        a: 'Simply sign up for a free account, add your business details, and you can create your first invoice in under 60 seconds. No credit card required for the free plan.'
      },
      {
        q: 'Is BillBooky really free?',
        a: 'Yes! Our Free plan allows you to create up to 300 invoices with all basic features including GST calculation, customer management, and PDF downloads. After 300 invoices, you can upgrade to a paid plan.'
      },
      {
        q: 'Do I need to install any software?',
        a: 'No installation needed! BillBooky is a cloud-based application that works directly in your web browser. Access it from any device with an internet connection.'
      },
    ]
  },
  {
    category: 'Billing & Pricing',
    questions: [
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your account will remain active until the end of your current billing period.'
      },
      {
        q: 'What happens when I reach 300 invoices on the free plan?',
        a: 'You\'ll need to upgrade to a paid plan (starting at ₹299/month) to continue creating invoices. All your existing data will be preserved.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'Yes, we offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us within 14 days for a full refund.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit/debit cards, UPI, and net banking. All payments are processed securely.'
      },
    ]
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        q: 'Is BillBooky GST compliant?',
        a: 'Yes! BillBooky is fully GST compliant. It automatically calculates GST, supports GSTIN, and generates invoices that meet all Indian GST requirements.'
      },
      {
        q: 'Can I customize my invoices?',
        a: 'Absolutely! You can add your logo, customize fonts, colors, and choose from different layout options to match your brand identity.'
      },
      {
        q: 'Can multiple team members use the same account?',
        a: 'Yes, on the Professional plan (₹599/month) you can add up to 2 team members, and on the Enterprise plan (₹999/month) you can add up to 10 team members.'
      },
      {
        q: 'What is the AI Accountant feature?',
        a: 'The AI Accountant (available on Professional and Enterprise plans) helps you with bookkeeping insights, expense categorization, and provides smart suggestions for your business finances.'
      },
    ]
  },
  {
    category: 'Data & Security',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes, we use bank-level encryption and industry-standard security protocols. All data is encrypted in transit and at rest. We also perform regular security audits.'
      },
      {
        q: 'Can I export my data?',
        a: 'Yes, you can download all your invoices as PDFs. We also provide data export options in CSV format for your records.'
      },
      {
        q: 'Where is my data stored?',
        a: 'All data is stored securely in cloud servers with automatic backups. Your data is accessible from anywhere and is always safe.'
      },
    ]
  },
  {
    category: 'Support',
    questions: [
      {
        q: 'What kind of support do you offer?',
        a: 'Free plan users get email support. Paid plans include priority email support with faster response times. Enterprise customers get dedicated support.'
      },
      {
        q: 'How quickly do you respond to support requests?',
        a: 'Free plan: within 48 hours. Starter plan: within 24 hours. Professional/Enterprise: within 12 hours during business days.'
      },
    ]
  },
]

export default function FAQPage() {
  // Generate FAQ schema markup
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap(category =>
      category.questions.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a
        }
      }))
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Everything you need to know about BillBooky. Can&apos;t find what you&apos;re looking for? {' '}
          <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Contact us
          </Link>
        </p>
      </section>

      {/* FAQ Sections */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        {FAQS.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((faq, idx) => (
                <details key={idx} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</h3>
                    <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <p className="text-gray-600 mt-4 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is here to help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Contact Support
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
