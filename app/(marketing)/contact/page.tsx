'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Mail, MessageSquare, Phone, CheckCircle, XCircle } from 'lucide-react'
import { submitContactForm } from './actions'
import { useState, useTransition } from 'react'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const response = await submitContactForm(formData)
      setResult(response)
      
      if (response.success) {
        // Reset form on success
        e.currentTarget.reset()
      }
    })
  }

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
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600">
          Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            
            {result && (
              <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="John Doe"
                  required
                  disabled={isPending}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="john@example.com"
                  required
                  disabled={isPending}
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="How can we help?"
                  required
                  disabled={isPending}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tell us more about your inquiry..."
                  required
                  disabled={isPending}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 mb-8">
                Choose the best way to reach us. We typically respond within 24 hours during business days.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">support@dodail.com</p>
                  <p className="text-sm text-gray-500 mt-1">We&apos;ll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-gray-600">Available Mon-Fri, 9am-6pm IST</p>
                  <p className="text-sm text-gray-500 mt-1">Quick answers to common questions</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                  <p className="text-gray-600">Available for Enterprise customers</p>
                  <p className="text-sm text-gray-500 mt-1">Dedicated account managers</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need immediate help?</h3>
              <p className="text-gray-600 mb-4">Check out our FAQ page for quick answers to common questions.</p>
              <Link href="/faq">
                <Button variant="secondary" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  View FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
