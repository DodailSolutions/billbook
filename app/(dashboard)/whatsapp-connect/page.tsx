'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  MessageCircle, 
  Check, 
  RefreshCw,
  AlertCircle,
  Send,
  FileText,
  Users
} from 'lucide-react'

export default function WhatsAppConnectPage() {
  const [userRegion, setUserRegion] = useState<string | null>(null)
  const [regionLoading, setRegionLoading] = useState(true)

  useEffect(() => {
    // Check user region first
    fetch('/api/user/region')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch region')
        }
        return res.json()
      })
      .then(data => {
        console.log('User region:', data.region)
        setUserRegion(data.region)
        setRegionLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching region:', error)
        setRegionLoading(false)
        setUserRegion('IN') // Default to India on error
      })
  }, [])

  // Region check - Only available for India
  if (regionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (userRegion !== 'IN') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              WhatsApp Integration
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Feature Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              WhatsApp integration is currently only available for India region users.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This feature is optimized for Indian businesses.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            WhatsApp Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Send invoices and messages to your customers via WhatsApp
          </p>
        </div>
        <Link href="/whatsapp-crm">
          <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <MessageCircle className="h-4 w-4" />
            Open WhatsApp CRM
          </Button>
        </Link>
      </div>

      {/* Status Banner */}
      <Card className="border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Check className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">
                WhatsApp Integration Ready ✓
              </h3>
              <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                You can now send invoices to customers via WhatsApp. No setup required!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            How WhatsApp Integration Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  BillBooky uses WhatsApp&apos;s official <strong>Click-to-Chat</strong> API. 
                  When you send an invoice, WhatsApp opens on your device with the message pre-filled. 
                  You just need to review and click send!
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                  <strong className="text-gray-900 dark:text-white">✨ Benefits:</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400 ml-4 list-disc">
                    <li>No WhatsApp account connection needed</li>
                    <li>Works instantly - no setup required</li>
                    <li>100% secure - uses official WhatsApp</li>
                    <li>Works on both mobile and desktop</li>
                    <li>Complete privacy - your chats stay private</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <Card>
        <CardHeader>
          <CardTitle>📱 How to Send an Invoice via WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Open an Invoice
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Go to your Invoices section and click on any invoice you want to send
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Click &quot;Share via WhatsApp&quot;
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find the green WhatsApp button on the invoice page
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send in WhatsApp
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  WhatsApp will open with the invoice link pre-filled. Review and click send!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/invoices" className="block">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <FileText className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Send Invoice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View invoices and share via WhatsApp</p>
              </div>
            </Link>
            <Link href="/customers" className="block">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <Users className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Customers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add phone numbers to contacts</p>
              </div>
            </Link>
            <button 
              onClick={() => {
                const testMessage = 'Hi! This is a test message from BillBooky to verify WhatsApp integration is working correctly. ✅'
                window.open(`https://wa.me/?text=${encodeURIComponent(testMessage)}`, '_blank')
              }}
              className="w-full text-left"
            >
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <MessageCircle className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Test WhatsApp</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verify integration is working</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>✨ What You Can Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Send Invoices Instantly
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share invoices with customers via WhatsApp with one click
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  100% Secure
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uses official WhatsApp API. Your data stays private
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Works Everywhere
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send from mobile or desktop - works on all devices
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  No Setup Needed
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready to use immediately - just click and send
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
