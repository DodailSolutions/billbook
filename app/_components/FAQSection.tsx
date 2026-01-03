'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is BillBooky really free?',
    answer: 'Yes! Our Free plan allows you to create up to 300 invoices with all basic features including GST calculation, customer management, and PDF downloads. No credit card required.'
  },
  {
    question: 'Is BillBooky GST compliant?',
    answer: 'Absolutely! BillBooky is fully GST compliant. It automatically calculates GST, supports GSTIN, and generates invoices that meet all Indian GST requirements.'
  },
  {
    question: 'Can I customize my invoices?',
    answer: 'Yes! You can add your company logo, customize colors, fonts, and templates to match your brand identity. Make your invoices truly yours.'
  },
  {
    question: 'Do I need to install any software?',
    answer: 'No installation needed! BillBooky is a cloud-based application that works directly in your web browser. Access it from any device with an internet connection.'
  },
  {
    question: 'Can I track payments?',
    answer: 'Yes! You can track payment status for all your invoices, send automated reminders for due payments, and maintain complete payment history.'
  },
  {
    question: 'What happens when I reach 300 invoices?',
    answer: 'You can upgrade to a paid plan starting at ₹299/month to continue creating invoices. All your existing data will be preserved.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely! We use industry-standard encryption and security measures. Your data is stored securely in the cloud and backed up regularly.'
  },
  {
    question: 'Can I export my invoices?',
    answer: 'Yes! You can download professional PDF invoices instantly and share them with your clients via email or WhatsApp.'
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-6 py-20 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about BillBooky
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group bg-white border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Contact our support team →
          </Link>
        </div>
      </div>
    </section>
  )
}
