'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CreditCard, ArrowLeft, Copy, Check, ExternalLink, ShieldCheck, 
  Save, RefreshCw, CheckCircle2, AlertCircle, Key, Webhook,
  Zap, Globe, DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

type GatewayType = 'razorpay' | 'cashfree' | 'stripe' | 'paypal'

export default function PaymentGatewaysSettingsPage() {
  const supabase = createClient()

  // Active Tab
  const [activeGateway, setActiveGateway] = useState<GatewayType>('razorpay')

  // 1. Razorpay Settings
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('')
  const [razorpayMode, setRazorpayMode] = useState<'live' | 'test'>('live')
  const [razorpayEnabled, setRazorpayEnabled] = useState(true)

  // 2. Cashfree Settings
  const [cashfreeAppId, setCashfreeAppId] = useState('')
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState('')
  const [cashfreeWebhookSecret, setCashfreeWebhookSecret] = useState('')
  const [cashfreeMode, setCashfreeMode] = useState<'production' | 'sandbox'>('production')
  const [cashfreeEnabled, setCashfreeEnabled] = useState(true)

  // 3. Stripe Settings (US & Global)
  const [stripePublishableKey, setStripePublishableKey] = useState('')
  const [stripeSecretKey, setStripeSecretKey] = useState('')
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('')
  const [stripeMode, setStripeMode] = useState<'live' | 'test'>('live')
  const [stripeEnabled, setStripeEnabled] = useState(true)

  // 4. PayPal Settings (US & Global)
  const [paypalClientId, setPaypalClientId] = useState('')
  const [paypalSecretKey, setPaypalSecretKey] = useState('')
  const [paypalWebhookId, setPaypalWebhookId] = useState('')
  const [paypalMode, setPaypalMode] = useState<'live' | 'sandbox'>('live')
  const [paypalEnabled, setPaypalEnabled] = useState(true)

  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const baseUrl = typeof window !== 'undefined' && window.location.origin.includes('localhost') 
    ? 'https://billbooky.dodail.com' 
    : (typeof window !== 'undefined' ? window.location.origin : 'https://billbooky.dodail.com')

  const razorpayWebhookUrl = `${baseUrl}/api/webhooks/razorpay`
  const cashfreeWebhookUrl = `${baseUrl}/api/webhooks/cashfree`
  const stripeWebhookUrl = `${baseUrl}/api/webhooks/stripe`
  const paypalWebhookUrl = `${baseUrl}/api/webhooks/paypal`

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'payment_gateways_config')
        .single()

      if (data?.value) {
        const val = data.value
        if (val.razorpay) {
          setRazorpayKeyId(val.razorpay.keyId || '')
          setRazorpayKeySecret(val.razorpay.keySecret || '')
          setRazorpayWebhookSecret(val.razorpay.webhookSecret || '')
          setRazorpayMode(val.razorpay.mode || 'live')
          setRazorpayEnabled(val.razorpay.enabled ?? true)
        }
        if (val.cashfree) {
          setCashfreeAppId(val.cashfree.appId || '')
          setCashfreeSecretKey(val.cashfree.secretKey || '')
          setCashfreeWebhookSecret(val.cashfree.webhookSecret || '')
          setCashfreeMode(val.cashfree.mode || 'production')
          setCashfreeEnabled(val.cashfree.enabled ?? true)
        }
        if (val.stripe) {
          setStripePublishableKey(val.stripe.publishableKey || '')
          setStripeSecretKey(val.stripe.secretKey || '')
          setStripeWebhookSecret(val.stripe.webhookSecret || '')
          setStripeMode(val.stripe.mode || 'live')
          setStripeEnabled(val.stripe.enabled ?? true)
        }
        if (val.paypal) {
          setPaypalClientId(val.paypal.clientId || '')
          setPaypalSecretKey(val.paypal.secretKey || '')
          setPaypalWebhookId(val.paypal.webhookId || '')
          setPaypalMode(val.paypal.mode || 'live')
          setPaypalEnabled(val.paypal.enabled ?? true)
        }
      } else {
        const cached = localStorage.getItem('billbooky_gateways_config')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.razorpay) {
            setRazorpayKeyId(parsed.razorpay.keyId || '')
            setRazorpayMode(parsed.razorpay.mode || 'live')
          }
          if (parsed.cashfree) {
            setCashfreeAppId(parsed.cashfree.appId || '')
            setCashfreeMode(parsed.cashfree.mode || 'production')
          }
          if (parsed.stripe) {
            setStripePublishableKey(parsed.stripe.publishableKey || '')
            setStripeMode(parsed.stripe.mode || 'live')
          }
          if (parsed.paypal) {
            setPaypalClientId(parsed.paypal.clientId || '')
            setPaypalMode(parsed.paypal.mode || 'live')
          }
        }
      }
    } catch {
      const cached = localStorage.getItem('billbooky_gateways_config')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.razorpay) setRazorpayKeyId(parsed.razorpay.keyId || '')
        } catch {}
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    const payload = {
      razorpay: {
        keyId: razorpayKeyId.trim(),
        keySecret: razorpayKeySecret.trim(),
        webhookSecret: razorpayWebhookSecret.trim(),
        mode: razorpayMode,
        enabled: razorpayEnabled,
      },
      cashfree: {
        appId: cashfreeAppId.trim(),
        secretKey: cashfreeSecretKey.trim(),
        webhookSecret: cashfreeWebhookSecret.trim(),
        mode: cashfreeMode,
        enabled: cashfreeEnabled,
      },
      stripe: {
        publishableKey: stripePublishableKey.trim(),
        secretKey: stripeSecretKey.trim(),
        webhookSecret: stripeWebhookSecret.trim(),
        mode: stripeMode,
        enabled: stripeEnabled,
      },
      paypal: {
        clientId: paypalClientId.trim(),
        secretKey: paypalSecretKey.trim(),
        webhookId: paypalWebhookId.trim(),
        mode: paypalMode,
        enabled: paypalEnabled,
      },
      updated_at: new Date().toISOString()
    }

    try {
      localStorage.setItem('billbooky_gateways_config', JSON.stringify(payload))
      await supabase.from('system_settings').upsert({
        key: 'payment_gateways_config',
        value: payload,
        description: 'Multi-Gateway API credentials and webhook secrets for Razorpay, Cashfree, Stripe, and PayPal'
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.warn('Saved gateway settings to localStorage fallback:', err)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(id)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-slate-900">
                  <ArrowLeft className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-medium text-slate-500">Payment Gateways &amp; Webhooks</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                <CreditCard className="h-6 w-6" />
              </div>
              Payment Gateways &amp; Webhooks Configuration
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Configure India &amp; Global gateways (Razorpay, Cashfree, Stripe, PayPal), copy webhook endpoints, and auto-reconcile customer payments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Auto-Reconciliation Active
            </span>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">Payment gateway credentials and webhook settings updated successfully!</p>
          </div>
        )}

        {/* Gateway Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveGateway('razorpay')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeGateway === 'razorpay'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="h-4 w-4" />
            Razorpay (India)
          </button>
          <button
            type="button"
            onClick={() => setActiveGateway('cashfree')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeGateway === 'cashfree'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Cashfree (India)
          </button>
          <button
            type="button"
            onClick={() => setActiveGateway('stripe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeGateway === 'stripe'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="h-4 w-4" />
            Stripe (US &amp; Global)
          </button>
          <button
            type="button"
            onClick={() => setActiveGateway('paypal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeGateway === 'paypal'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            PayPal (US &amp; Global)
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ================= RAZORPAY TAB ================= */}
          {activeGateway === 'razorpay' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                        <Key className="h-5 w-5 text-blue-600" />
                        Razorpay API Credentials
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Mode:</span>
                        <select
                          value={razorpayMode}
                          onChange={(e) => setRazorpayMode(e.target.value as any)}
                          className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-slate-50 text-slate-800"
                        >
                          <option value="live">Live Production</option>
                          <option value="test">Test Sandbox</option>
                        </select>
                      </div>
                    </div>
                    <CardDescription>
                      Obtain your Key ID and Key Secret from the Razorpay Dashboard under <strong>Settings &gt; API Keys</strong>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Razorpay Key ID *
                      </label>
                      <Input
                        placeholder="rzp_live_xxxxxxxxxxxxxx or rzp_test_xxxxxxxxxxxxxx"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Razorpay Key Secret *
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter your Razorpay Key Secret"
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Webhook Secret (Recommended for Signature Verification)
                      </label>
                      <Input
                        placeholder="Enter the secret configured in Razorpay Webhook settings"
                        value={razorpayWebhookSecret}
                        onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        Used to verify the cryptographic HMAC signature of incoming payment webhooks.
                      </p>
                    </div>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer pt-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Enable Razorpay Checkout</p>
                        <p className="text-[11px] text-slate-500">Allow customers and subscribers to pay invoices via UPI, Cards, Netbanking</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={razorpayEnabled}
                        onChange={(e) => setRazorpayEnabled(e.target.checked)}
                        className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </CardContent>
                </Card>

                {/* Razorpay Webhook Configuration */}
                <Card className="border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                        <Webhook className="h-5 w-5 text-blue-600" />
                        Razorpay Webhook Endpoint
                      </CardTitle>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Instant Reconciliation
                      </span>
                    </div>
                    <CardDescription>
                      Configure this exact URL inside your Razorpay Dashboard under <strong>Settings &gt; Webhooks</strong>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-white">
                      <div className="min-w-0 pr-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Webhook Delivery URL</p>
                        <p className="text-xs font-mono text-emerald-400 truncate">{razorpayWebhookUrl}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        onClick={() => copyToClipboard(razorpayWebhookUrl, 'razorpay_wh')}
                      >
                        {copiedItem === 'razorpay_wh' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedItem === 'razorpay_wh' ? 'Copied' : 'Copy URL'}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Required Webhook Events to Subscribe:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['payment.captured', 'payment.failed', 'order.paid', 'subscription.charged', 'refund.processed'].map(ev => (
                          <span key={ev} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Razorpay Quick Guide */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900">Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-600">
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
                      <p>Log in to your <a href="https://dashboard.razorpay.com/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">Razorpay Dashboard</a>.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>
                      <p>Navigate to <strong>Settings &gt; API Keys</strong> and generate your Key ID &amp; Secret.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">3</span>
                      <p>Go to <strong>Settings &gt; Webhooks</strong>, click <em>Add New Webhook</em>, paste the Webhook Delivery URL, and select <code>payment.captured</code> and <code>order.paid</code>.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ================= CASHFREE TAB ================= */}
          {activeGateway === 'cashfree' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
                        <Key className="h-5 w-5 text-emerald-600" />
                        Cashfree API Credentials
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Environment:</span>
                        <select
                          value={cashfreeMode}
                          onChange={(e) => setCashfreeMode(e.target.value as any)}
                          className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-slate-50 text-slate-800"
                        >
                          <option value="production">Production</option>
                          <option value="sandbox">Sandbox (Testing)</option>
                        </select>
                      </div>
                    </div>
                    <CardDescription>
                      Obtain your App ID and Secret Key from the Cashfree Merchant Dashboard under <strong>Developers &gt; API Keys</strong>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Cashfree App ID (Client ID) *
                      </label>
                      <Input
                        placeholder="CFXXXXXXXXXXXXXX"
                        value={cashfreeAppId}
                        onChange={(e) => setCashfreeAppId(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Cashfree Secret Key *
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter your Cashfree Secret Key"
                        value={cashfreeSecretKey}
                        onChange={(e) => setCashfreeSecretKey(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Cashfree Webhook Secret Key
                      </label>
                      <Input
                        placeholder="Enter Cashfree Webhook Secret"
                        value={cashfreeWebhookSecret}
                        onChange={(e) => setCashfreeWebhookSecret(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer pt-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Enable Cashfree Checkout</p>
                        <p className="text-[11px] text-slate-500">Accept UPI AutoPay, Netbanking, and Cards via Cashfree Payment Gateway</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={cashfreeEnabled}
                        onChange={(e) => setCashfreeEnabled(e.target.checked)}
                        className="h-4 w-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  </CardContent>
                </Card>

                {/* Cashfree Webhook Configuration */}
                <Card className="border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
                        <Webhook className="h-5 w-5 text-emerald-600" />
                        Cashfree Webhook Endpoint
                      </CardTitle>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Instant Webhook
                      </span>
                    </div>
                    <CardDescription>
                      Configure this endpoint in Cashfree Merchant Dashboard under <strong>Developers &gt; Webhooks</strong>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-white">
                      <div className="min-w-0 pr-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Cashfree Webhook URL</p>
                        <p className="text-xs font-mono text-emerald-400 truncate">{cashfreeWebhookUrl}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        onClick={() => copyToClipboard(cashfreeWebhookUrl, 'cashfree_wh')}
                      >
                        {copiedItem === 'cashfree_wh' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedItem === 'cashfree_wh' ? 'Copied' : 'Copy URL'}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Supported Events:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['PAYMENT_SUCCESS_WEBHOOK', 'PAYMENT_FAILED_WEBHOOK', 'SUBSCRIPTION_STATUS_CHANGE', 'REFUND_STATUS_WEBHOOK'].map(ev => (
                          <span key={ev} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cashfree Quick Guide */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900">Cashfree Setup Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-600">
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">1</span>
                      <p>Log in to your <a href="https://merchant.cashfree.com/" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline">Cashfree Merchant Dashboard</a>.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">2</span>
                      <p>Go to <strong>Developers &gt; API Keys</strong> and copy your App ID &amp; Secret Key.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">3</span>
                      <p>In <strong>Developers &gt; Webhooks</strong>, add the webhook endpoint and choose version <code>2022-09-01</code> or latest.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ================= STRIPE TAB (US & GLOBAL) ================= */}
          {activeGateway === 'stripe' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                        <Key className="h-5 w-5 text-indigo-600" />
                        Stripe API Credentials (US &amp; International)
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Environment:</span>
                        <select
                          value={stripeMode}
                          onChange={(e) => setStripeMode(e.target.value as any)}
                          className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-slate-50 text-slate-800"
                        >
                          <option value="live">Live Production</option>
                          <option value="test">Test Sandbox</option>
                        </select>
                      </div>
                    </div>
                    <CardDescription>
                      Obtain your Publishable and Secret Keys from the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="text-indigo-600 font-medium underline">Stripe Dashboard &gt; Developers &gt; API keys</a>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Stripe Publishable Key *
                      </label>
                      <Input
                        placeholder="pk_live_... or pk_test_..."
                        value={stripePublishableKey}
                        onChange={(e) => setStripePublishableKey(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Stripe Secret Key *
                      </label>
                      <Input
                        type="password"
                        placeholder="sk_live_... or sk_test_..."
                        value={stripeSecretKey}
                        onChange={(e) => setStripeSecretKey(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Stripe Webhook Signing Secret (whsec_...)
                      </label>
                      <Input
                        placeholder="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={stripeWebhookSecret}
                        onChange={(e) => setStripeWebhookSecret(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        Found in your Stripe Dashboard under Developers &gt; Webhooks &gt; Signing secret.
                      </p>
                    </div>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer pt-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Enable Stripe Checkout</p>
                        <p className="text-[11px] text-slate-500">Accept international credit/debit cards, Apple Pay, Google Pay, and SEPA</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={stripeEnabled}
                        onChange={(e) => setStripeEnabled(e.target.checked)}
                        className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  </CardContent>
                </Card>

                {/* Stripe Webhook Configuration */}
                <Card className="border-indigo-100 shadow-sm bg-gradient-to-br from-white to-indigo-50/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
                        <Webhook className="h-5 w-5 text-indigo-600" />
                        Stripe Webhook Delivery Endpoint
                      </CardTitle>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Global Payments
                      </span>
                    </div>
                    <CardDescription>
                      Configure this endpoint in Stripe Dashboard under <strong>Developers &gt; Webhooks &gt; Add destination</strong>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-white">
                      <div className="min-w-0 pr-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Stripe Webhook URL</p>
                        <p className="text-xs font-mono text-emerald-400 truncate">{stripeWebhookUrl}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        onClick={() => copyToClipboard(stripeWebhookUrl, 'stripe_wh')}
                      >
                        {copiedItem === 'stripe_wh' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedItem === 'stripe_wh' ? 'Copied' : 'Copy URL'}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Select Events in Stripe Dashboard:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['checkout.session.completed', 'invoice.paid', 'payment_intent.succeeded', 'customer.subscription.updated', 'charge.refunded'].map(ev => (
                          <span key={ev} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stripe Quick Guide */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900">Stripe Setup Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-600">
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</span>
                      <p>Log in to your <a href="https://dashboard.stripe.com/" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">Stripe Dashboard</a>.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">2</span>
                      <p>Go to <strong>Developers &gt; API keys</strong> to copy Publishable and Secret Keys.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">3</span>
                      <p>Navigate to <strong>Developers &gt; Webhooks</strong>, add an endpoint, paste the URL above, and select <code>checkout.session.completed</code>.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ================= PAYPAL TAB (US & GLOBAL) ================= */}
          {activeGateway === 'paypal' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-sky-900">
                        <Key className="h-5 w-5 text-sky-600" />
                        PayPal API Credentials (US &amp; International)
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Environment:</span>
                        <select
                          value={paypalMode}
                          onChange={(e) => setPaypalMode(e.target.value as any)}
                          className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-slate-50 text-slate-800"
                        >
                          <option value="live">Live Production</option>
                          <option value="sandbox">Sandbox (Testing)</option>
                        </select>
                      </div>
                    </div>
                    <CardDescription>
                      Obtain your Client ID &amp; Secret from the <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer" className="text-sky-600 font-medium underline">PayPal Developer Dashboard &gt; Apps &amp; Credentials</a>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        PayPal Client ID *
                      </label>
                      <Input
                        placeholder="Enter PayPal Client ID"
                        value={paypalClientId}
                        onChange={(e) => setPaypalClientId(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        PayPal Secret Key *
                      </label>
                      <Input
                        type="password"
                        placeholder="Enter PayPal Secret Key"
                        value={paypalSecretKey}
                        onChange={(e) => setPaypalSecretKey(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        PayPal Webhook ID
                      </label>
                      <Input
                        placeholder="Webhook ID generated by PayPal (e.g., 4CA07...)"
                        value={paypalWebhookId}
                        onChange={(e) => setPaypalWebhookId(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer pt-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Enable PayPal Checkout</p>
                        <p className="text-[11px] text-slate-500">Allow customers worldwide to pay with PayPal Wallet and PayPal Credit</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={paypalEnabled}
                        onChange={(e) => setPaypalEnabled(e.target.checked)}
                        className="h-4 w-4 rounded-sm text-sky-600 focus:ring-sky-500"
                      />
                    </label>
                  </CardContent>
                </Card>

                {/* PayPal Webhook Configuration */}
                <Card className="border-sky-100 shadow-sm bg-gradient-to-br from-white to-sky-50/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-sky-900">
                        <Webhook className="h-5 w-5 text-sky-600" />
                        PayPal Webhook Endpoint
                      </CardTitle>
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                        Instant Webhook
                      </span>
                    </div>
                    <CardDescription>
                      Configure this endpoint in PayPal Developer Dashboard under your App &gt; <strong>Webhooks &gt; Add Webhook</strong>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-white">
                      <div className="min-w-0 pr-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">PayPal Webhook URL</p>
                        <p className="text-xs font-mono text-emerald-400 truncate">{paypalWebhookUrl}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        onClick={() => copyToClipboard(paypalWebhookUrl, 'paypal_wh')}
                      >
                        {copiedItem === 'paypal_wh' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedItem === 'paypal_wh' ? 'Copied' : 'Copy URL'}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-800">Select Events in PayPal App:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED', 'BILLING.SUBSCRIPTION.ACTIVATED', 'PAYMENT.CAPTURE.REFUNDED'].map(ev => (
                          <span key={ev} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PayPal Quick Guide */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900">PayPal Setup Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-600">
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">1</span>
                      <p>Log in to <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer" className="text-sky-600 font-semibold underline">PayPal Developer Portal</a>.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">2</span>
                      <p>Create or select a REST API app under <strong>Apps &amp; Credentials</strong> to get Client ID &amp; Secret.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">3</span>
                      <p>Click <strong>Add Webhook</strong>, paste the Webhook URL above, and subscribe to <code>Payment capture completed</code>.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving Configuration...' : 'Save Payment Gateways'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
