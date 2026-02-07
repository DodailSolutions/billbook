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
  Users,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  Clock,
  QrCode,
  X
} from 'lucide-react'

interface QuickStat {
  label: string
  value: number
  icon: React.ElementType
  color: string
}

interface ConnectionStatus {
  connected: boolean
  phone_number?: string
  status?: string
}

export default function WhatsAppConnectPage() {
  const [userRegion, setUserRegion] = useState<string | null>(null)
  const [regionLoading, setRegionLoading] = useState(true)
  const [stats, setStats] = useState<QuickStat[]>([
    { label: 'Total Customers', value: 0, icon: Users, color: 'blue' },
    { label: 'Invoices Sent', value: 0, icon: FileText, color: 'green' },
    { label: 'Active Today', value: 0, icon: TrendingUp, color: 'purple' },
  ])
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false })
  const [qrLoading, setQrLoading] = useState(false)

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
        
        // Load connection status and stats for India users
        if (data.region === 'IN') {
          checkConnectionStatus()
          loadStats()
        }
      })
      .catch((error) => {
        console.error('Error fetching region:', error)
        setRegionLoading(false)
        setUserRegion('IN') // Default to India on error
      })
  }, [])

  useEffect(() => {
    // Poll for connection status while QR is displayed
    let interval: NodeJS.Timeout | null = null
    if (sessionId && !connectionStatus.connected) {
      interval = setInterval(() => {
        checkConnectionStatus(sessionId)
      }, 3000) // Check every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sessionId, connectionStatus.connected])

  const checkConnectionStatus = async (session?: string) => {
    try {
      const url = session 
        ? `/api/whatsapp/status?session_id=${session}`
        : '/api/whatsapp/status'
      
      const response = await fetch(url)
      const data = await response.json()
      
      setConnectionStatus(data)
      
      if (data.connected) {
        setQrCode(null)
        setSessionId(null)
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const generateQRCode = async () => {
    try {
      setQrLoading(true)
      const response = await fetch('/api/whatsapp/qr')
      const data = await response.json()
      
      if (data.error) {
        alert('Error generating QR code: ' + data.error)
        return
      }

      setQrCode(data.qr_code)
      setSessionId(data.session_id)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setQrLoading(false)
    }
  }

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return

    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        setConnectionStatus({ connected: false })
        setQrCode(null)
        setSessionId(null)
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadStats = async () => {
    try {
      // Load customer count
      const customersRes = await fetch('/api/customers')
      const customersData = await customersRes.json()
      const customerCount = customersData.customers?.length || 0
      
      // Load invoice count
      const invoicesRes = await fetch('/api/invoices')
      const invoicesData = await invoicesRes.json()
      const invoiceCount = invoicesData.invoices?.length || 0
      
      // Calculate active today (invoices created today)
      const today = new Date().toDateString()
      const activeToday = invoicesData.invoices?.filter((inv: any) => 
        new Date(inv.created_at).toDateString() === today
      ).length || 0
      
      setStats([
        { label: 'Total Customers', value: customerCount, icon: Users, color: 'blue' },
        { label: 'Invoices Created', value: invoiceCount, icon: FileText, color: 'green' },
        { label: 'Created Today', value: activeToday, icon: Clock, color: 'purple' },
      ])
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Region check - Only available for India
  if (regionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-gray-600">Loading...</p>
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
            <p className="text-gray-600 text-gray-600 mb-2">
              WhatsApp integration is currently only available for India region users.
            </p>
            <p className="text-sm text-gray-500 ">
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
          <p className="text-gray-600 text-gray-600 mt-1">
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

      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: 'bg-blue-100  text-blue-600 text-blue-600',
              green: 'bg-green-100  text-green-600 text-green-600',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            }[stat.color]
            
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`h-12 w-12 rounded-full ${colorClasses} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Status Banner */}
      <Card className="border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!connectionStatus.connected && !qrCode && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect Your WhatsApp
              </h3>
              <p className="text-gray-600 text-gray-600 mb-6 max-w-md mx-auto">
                Scan QR code with your phone to connect WhatsApp and send invoices directly to your customers
              </p>
              <Button 
                onClick={generateQRCode} 
                disabled={qrLoading}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                {qrLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Connect WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}

          {qrCode && !connectionStatus.connected && (
            <div className="text-center py-8">
              <div className="inline-block bg-white p-6 rounded-2xl shadow-lg mb-6">
                <Image 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  width={256}
                  height={256}
                  className="w-64 h-64"
                />
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Scan this QR code
                </h3>
                
                <div className="text-left bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Open WhatsApp on your mobile, click the <strong>⋮</strong> icon and select "Linked devices"
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tap "Link a device" and scan this QR code
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your WhatsApp will be connected automatically
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Waiting for connection...</span>
                </div>
              </div>
            </div>
          )}

          {connectionStatus.connected && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                WhatsApp Connected ✓
              </h3>
              {connectionStatus.phone_number && (
                <p className="text-gray-600 text-gray-600 mb-6">
                  {connectionStatus.phone_number}
                </p>
              )}
              <p className="text-sm text-green-700 dark:text-green-200 mb-6">
                You can now send invoices to customers via WhatsApp!
              </p>
              <Button 
                variant="destructive" 
                onClick={disconnect}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          )}
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
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <strong className="text-gray-900 dark:text-white">✨ Benefits:</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 text-gray-600 ml-4 list-disc">
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
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Open an Invoice
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
                  Go to your Invoices section and click on any invoice you want to send
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Click &quot;Share via WhatsApp&quot;
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
                  Find the green WhatsApp button on the invoice page
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send in WhatsApp
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
                  WhatsApp will open with the invoice link pre-filled. Review and click send!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/invoices" className="block">
              <div className="bg-white p-4 rounded-lg border border-gray-200  hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <FileText className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Send Invoice</h3>
                <p className="text-sm text-gray-600 text-gray-600">View invoices and share via WhatsApp</p>
              </div>
            </Link>
            <Link href="/customers" className="block">
              <div className="bg-white p-4 rounded-lg border border-gray-200  hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <Users className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Customers</h3>
                <p className="text-sm text-gray-600 text-gray-600">Add phone numbers to contacts</p>
              </div>
            </Link>
            <button 
              onClick={() => {
                const testMessage = 'Hi! This is a test message from BillBooky to verify WhatsApp integration is working correctly. ✅'
                window.open(`https://wa.me/?text=${encodeURIComponent(testMessage)}`, '_blank')
              }}
              className="w-full text-left"
            >
              <div className="bg-white p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <MessageCircle className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Test WhatsApp</h3>
                <p className="text-sm text-gray-600 text-gray-600">Verify integration is working</p>
              </div>
            </button>
            <Link href="/whatsapp-crm" className="block">
              <div className="bg-white p-4 rounded-lg border border-gray-200  hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <Zap className="h-8 w-8 text-yellow-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp CRM</h3>
                <p className="text-sm text-gray-600 text-gray-600">Manage customer conversations</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Message Templates
            <span className="ml-auto text-xs font-normal bg-blue-100  text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              Click to use
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200  hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer"
                 onClick={() => {
                   const msg = 'Hi! Your invoice is ready. Please check your email or click the link below to view and download.'
                   window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                 }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100  flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-green-600 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Invoice Ready</h4>
                  <p className="text-sm text-gray-600 text-gray-600">
                    "Hi! Your invoice is ready. Please check your email or click the link below to view and download."
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200  hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer"
                 onClick={() => {
                   const msg = 'Thank you for your business! Your payment has been received and your invoice is now marked as paid. 🙏'
                   window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                 }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100  flex items-center justify-center shrink-0">
                  <Check className="h-5 w-5 text-blue-600 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Payment Received</h4>
                  <p className="text-sm text-gray-600 text-gray-600">
                    "Thank you for your business! Your payment has been received and your invoice is now marked as paid. 🙏"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200  hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer"
                 onClick={() => {
                   const msg = 'Gentle reminder: Your invoice payment is due soon. Please let us know if you have any questions!'
                   window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                 }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Payment Reminder</h4>
                  <p className="text-sm text-gray-600 text-gray-600">
                    "Gentle reminder: Your invoice payment is due soon. Please let us know if you have any questions!"
                  </p>
                </div>
              </div>
            </div>
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
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Send Invoices Instantly
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
                  Share invoices with customers via WhatsApp with one click
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  100% Secure
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
                  Uses official WhatsApp API. Your data stays private
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Works Everywhere
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
                  Send from mobile or desktop - works on all devices
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  No Setup Needed
                </h4>
                <p className="text-sm text-gray-600 text-gray-600">
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
