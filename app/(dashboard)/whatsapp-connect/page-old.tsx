'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  MessageCircle, 
  QrCode, 
  Smartphone, 
  Check, 
  X,
  RefreshCw,
  Send,
  CheckCheck,
  Eye,
  AlertCircle
} from 'lucide-react'

interface WhatsAppStats {
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
}

interface ConnectionStatus {
  connected: boolean
  phone_number?: string
  status?: string
  last_activity?: string
}

export default function WhatsAppConnectPage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false })
  const [stats, setStats] = useState<WhatsAppStats>({
    total_sent: 0,
    total_delivered: 0,
    total_read: 0,
    total_failed: 0
  })
  const [userRegion, setUserRegion] = useState<string | null>(null)
  const [regionLoading, setRegionLoading] = useState(true)

  useEffect(() => {
    // Check user region first
    fetch('/api/user/region')
      .then(res => res.json())
      .then(data => {
        setUserRegion(data.region)
        setRegionLoading(false)
        
        // Only load WhatsApp data if user is in India
        if (data.region === 'IN') {
          checkConnectionStatus()
          loadStats()
        }
      })
      .catch(() => {
        setRegionLoading(false)
        setUserRegion('IN')
      })
  }, [])

  useEffect(() => {
    // Poll for connection status while QR is displayed
    let interval: NodeJS.Timeout | null = null
    if (sessionId && !connectionStatus.connected) {
      interval = setInterval(() => {
        checkConnectionStatus(sessionId || undefined)
      }, 3000) // Check every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sessionId, connectionStatus.connected])

  const loadStats = async () => {
    // In production, this would fetch from the API
    // For now, using placeholder data
    setStats({
      total_sent: 0,
      total_delivered: 0,
      total_read: 0,
      total_failed: 0
    })
  }

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
      setLoading(true)
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
      setLoading(false)
    }
  }

  const simulateConnection = async () => {
    if (!sessionId) return
    
    try {
      const response = await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId,
          phone_number: '+1234567890'
        })
      })
      
      if (response.ok) {
        await checkConnectionStatus(sessionId)
      }
    } catch (error) {
      console.error('Error simulating connection:', error)
    }
  }

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return

    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        setConnectionStatus({ connected: false })
        setQrCode(null)
        setSessionId(null)
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('Failed to disconnect')
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
          <p className="text-gray-600">Loading...</p>
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
            <p className="text-gray-600 mb-2">
              WhatsApp integration is currently only available for India region users.
            </p>
            <p className="text-sm text-gray-500">
              This feature is optimized for Indian businesses.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            WhatsApp Integration
          </h1>
          <p className="text-gray-600 mt-1">
            Send invoices and messages to your customers via WhatsApp
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                WhatsApp Click-to-Chat Integration
              </h3>
              <p className="text-sm text-blue-900 mb-3">
                This feature uses WhatsApp's official "Click to Chat" API. When you send an invoice or message, 
                it will open WhatsApp on your device with the message pre-filled. Simply click send!
              </p>
              <div className="bg-white dark:bg-blue-900 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-100">
                <strong>How it works:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Select a customer from your contacts</li>
                  <li>Click "Send Invoice" or compose a message</li>
                  <li>WhatsApp opens with pre-filled message</li>
                  <li>Review and click send in WhatsApp</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Banner */}
      {!connectionStatus.connected && (
        <Card className="border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Only Your Party Chats Will be Shown in BillBooky
                </h3>
                <p className="text-sm text-blue-900 mt-1">
                  When you connect WhatsApp, only your business contacts will be accessible. 
                  Your personal chats remain private and are not accessed by BillBooky.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!connectionStatus.connected && !qrCode && (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect Your WhatsApp
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Seamlessly connect WhatsApp to send invoices directly to your customers
              </p>
              <Button 
                onClick={generateQRCode} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
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
                      Open WhatsApp on your mobile, click the <strong>⋮</strong> icon and select &ldquo;Linked devices&rdquo;
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Click on the &ldquo;Link a device&rdquo; button on this screen. This will open the QR code scanner
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Using your mobile, scan the QR code shown on the right
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600">
                  Safe. Secure. Private.
                </p>

                {/* Demo button - remove in production */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={simulateConnection}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Simulate Connection (Demo)
                  </Button>
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
                WhatsApp Connected
              </h3>
              {connectionStatus.phone_number && (
                <p className="text-gray-600 mb-6">
                  {connectionStatus.phone_number}
                </p>
              )}
              <Button 
                variant="destructive" 
                onClick={disconnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {connectionStatus.connected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_sent}
                  </p>
                </div>
                <Send className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_delivered}
                  </p>
                </div>
                <CheckCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_read}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_failed}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Send Invoices Instantly
                </h4>
                <p className="text-sm text-gray-600">
                  Share invoices directly with customers via WhatsApp with PDF attached
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Privacy Protected
                </h4>
                <p className="text-sm text-gray-600">
                  Only your business contacts are accessible. Personal chats remain private
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Track Delivery Status
                </h4>
                <p className="text-sm text-gray-600">
                  See when messages are sent, delivered, and read by customers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Secure Connection
                </h4>
                <p className="text-sm text-gray-600">
                  End-to-end encrypted connection just like WhatsApp Web
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
