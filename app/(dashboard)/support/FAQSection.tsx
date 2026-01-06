'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const faqs = [
    {
        question: 'How do I generate GST reports?',
        answer: 'Go to the Reports section from the sidebar, select the GST Report option, choose your date range, and click "Generate Report". You can download it as PDF or share it directly with your CA.'
    },
    {
        question: 'Can I customize my invoice template?',
        answer: 'Yes! Go to Invoice Settings from the sidebar. You can customize colors, fonts, add your logo, QR code for payments, and set default terms and conditions.'
    },
    {
        question: 'How do I mark an invoice as paid?',
        answer: 'Open the invoice details and click the "Mark as Paid" button. You can select the payment method and add any notes about the payment.'
    },
    {
        question: 'What is the difference between CGST, SGST, and IGST?',
        answer: 'CGST and SGST apply to intra-state transactions (within the same state), where tax is split equally between central and state governments. IGST applies to inter-state transactions (between different states), where the entire tax goes to the central government.'
    },
    {
        question: 'Can I share invoices on WhatsApp?',
        answer: 'Yes! When viewing an invoice, click the "Share" button. You can share via WhatsApp, email, or any other app. The PDF invoice will be automatically attached.'
    },
    {
        question: 'How do I set up recurring invoices?',
        answer: 'Click on "Recurring" in the sidebar, then "Create Recurring Invoice". Set the frequency (weekly, monthly, etc.) and the system will automatically generate invoices on the scheduled dates.'
    },
    {
        question: 'What payment methods can I track?',
        answer: 'You can track various payment methods including Cash, UPI, Credit Card, Debit Card, Net Banking, Cheque, and Bank Transfer. Select the appropriate method when marking an invoice as paid.'
    },
    {
        question: 'How do I export accounting reports?',
        answer: 'Go to Reports > Accounting Report, select your date range and format (PDF or Excel), then click "Generate Report". You can download or share it directly with your accountant.'
    },
    {
        question: 'Can I add my team members?',
        answer: 'Yes! The Team feature (available on Pro plan) allows you to invite team members with different permission levels. Go to the Team section to manage access.'
    },
    {
        question: 'How do I update my billing information?',
        answer: 'Go to Account Settings from the sidebar, scroll to the billing section where you can update your payment method and view your subscription details.'
    }
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium pr-4">{faq.question}</span>
                                <ChevronDown
                                    className={`h-5 w-5 shrink-0 transition-transform ${
                                        openIndex === index ? 'transform rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="px-4 pb-4 text-sm text-muted-foreground">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
