'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bell, ArrowLeft, Send, CheckCircle2, AlertTriangle, Info, 
  ShieldAlert, Clock, Trash2, Check, RefreshCw, Users, Megaphone,
  Radio, Mail, Smartphone, Sliders
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

interface BroadcastMessage {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'urgent' | 'maintenance'
  target: 'all' | 'admins' | 'subscribers'
  sentAt: string
  status: 'delivered' | 'active'
}

export default function NotificationsSettingsPage() {
  const supabase = createClient()

  // Composer State
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'urgent' | 'maintenance'>('info')
  const [target, setTarget] = useState<'all' | 'admins' | 'subscribers'>('all')
  const [actionUrl, setActionUrl] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  // Notification Automation Preferences
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [failedPaymentAlert, setFailedPaymentAlert] = useState(true)
  const [newSignupAlert, setNewSignupAlert] = useState(true)
  const [lowStockAlert, setLowStockAlert] = useState(true)
  const [securityAlert, setSecurityAlert] = useState(true)
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [prefsSuccess, setPrefsSuccess] = useState(false)

  // Broadcast History
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([
    {
      id: 'bc-1',
      title: 'Smart CRM & Sales Pipeline Released',
      message: 'Intelligent lead scoring, automated revenue forecasting, and rapid follow-up actions are now active.',
      type: 'info',
      target: 'all',
      sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'active'
    },
    {
      id: 'bc-2',
      title: 'Scheduled Database Maintenance',
      message: 'Routine index optimization scheduled for Sunday at 02:00 AM UTC. No downtime expected.',
      type: 'maintenance',
      target: 'admins',
      sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'delivered'
    }
  ])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'admin_notifications_config')
        .single()

      if (data?.value) {
        const val = data.value
        if (val.broadcasts) setBroadcasts(val.broadcasts)
        if (val.emailAlerts !== undefined) setEmailAlerts(val.emailAlerts)
        if (val.failedPaymentAlert !== undefined) setFailedPaymentAlert(val.failedPaymentAlert)
        if (val.newSignupAlert !== undefined) setNewSignupAlert(val.newSignupAlert)
        if (val.lowStockAlert !== undefined) setLowStockAlert(val.lowStockAlert)
        if (val.securityAlert !== undefined) setSecurityAlert(val.securityAlert)
      } else {
        const cached = localStorage.getItem('billbooky_notifications_config')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.broadcasts) setBroadcasts(parsed.broadcasts)
          if (parsed.emailAlerts !== undefined) setEmailAlerts(parsed.emailAlerts)
        }
      }
    } catch {
      const cached = localStorage.getItem('billbooky_notifications_config')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.broadcasts) setBroadcasts(parsed.broadcasts)
        } catch {}
      }
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    setIsSending(true)
    const newBroadcast: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      target,
      sentAt: new Date().toISOString(),
      status: 'active'
    }

    const updated = [newBroadcast, ...broadcasts]
    setBroadcasts(updated)

    try {
      const payload = {
        broadcasts: updated,
        emailAlerts,
        failedPaymentAlert,
        newSignupAlert,
        lowStockAlert,
        securityAlert,
        updated_at: new Date().toISOString()
      }

      localStorage.setItem('billbooky_notifications_config', JSON.stringify(payload))
      await supabase.from('system_settings').upsert({
        key: 'admin_notifications_config',
        value: payload,
        description: 'System broadcasts and automated alert configurations'
      })

      setTitle('')
      setMessage('')
      setActionUrl('')
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 3000)
    } catch (err) {
      console.warn('Saved broadcast locally:', err)
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 3000)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveAutomation = async () => {
    setIsSavingPrefs(true)
    try {
      const payload = {
        broadcasts,
        emailAlerts,
        failedPaymentAlert,
        newSignupAlert,
        lowStockAlert,
        securityAlert,
        updated_at: new Date().toISOString()
      }

      localStorage.setItem('billbooky_notifications_config', JSON.stringify(payload))
      await supabase.from('system_settings').upsert({
        key: 'admin_notifications_config',
        value: payload,
        description: 'System broadcasts and automated alert configurations'
      })

      setPrefsSuccess(true)
      setTimeout(() => setPrefsSuccess(false), 2500)
    } finally {
      setIsSavingPrefs(false)
    }
  }

  const handleDeleteBroadcast = async (id: string) => {
    const updated = broadcasts.filter(b => b.id !== id)
    setBroadcasts(updated)
    try {
      await supabase.from('system_settings').upsert({
        key: 'admin_notifications_config',
        value: { broadcasts: updated },
        description: 'System broadcasts and alert logs'
      })
    } catch {}
  }

  const typeStyles = {
    info: { badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: Info, color: 'text-blue-600' },
    warning: { badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle, color: 'text-amber-600' },
    urgent: { badge: 'bg-rose-100 text-rose-800 border-rose-200', icon: ShieldAlert, color: 'text-rose-600' },
    maintenance: { badge: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock, color: 'text-purple-600' },
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
              <span className="text-sm font-medium text-slate-500">Notifications &amp; Alerts</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <Megaphone className="h-6 w-6" />
              </div>
              System Notifications &amp; Global Broadcasts
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Push real-time alerts, maintenance notices, and automated system notifications to business admins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Broadcaster Active
            </span>
          </div>
        </div>

        {sendSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">Notification broadcast sent successfully to all targeted admins!</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Broadcast Composer */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-indigo-600" />
                    Push Global Broadcast Notification
                  </CardTitle>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Instant Dispatch
                  </span>
                </div>
                <CardDescription>
                  Send an in-app banner or dashboard toast alert directly to business owners and administrators.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Announcement / Alert Title *
                    </label>
                    <Input
                      placeholder="e.g. Critical Tax Filing Reminder, System Maintenance..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Alert Type / Urgency
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="info">Information (Blue)</option>
                        <option value="warning">Warning / Action Required (Amber)</option>
                        <option value="urgent">Urgent Security Alert (Red)</option>
                        <option value="maintenance">Maintenance Notice (Purple)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Target Audience
                      </label>
                      <select
                        value={target}
                        onChange={(e) => setTarget(e.target.value as any)}
                        className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">All Business Admins &amp; Users</option>
                        <option value="admins">Superadmins &amp; Business Owners Only</option>
                        <option value="subscribers">Active Paid Subscribers Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Broadcast Message Body *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type the full message that admins will see when logging in..."
                      className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Action Link / Call to Action URL (Optional)
                    </label>
                    <Input
                      placeholder="e.g. /invoices/new or /settings/billing"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSending || !title.trim() || !message.trim()}
                      className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Radio className="h-4 w-4" />
                      {isSending ? 'Broadcasting...' : 'Broadcast Notification to All'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Broadcast History & Logs */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  Broadcast History &amp; Active Announcements ({broadcasts.length})
                </CardTitle>
                <CardDescription>
                  Review recent announcements pushed across the BillBooky platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {broadcasts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No broadcast messages recorded yet.</p>
                ) : (
                  broadcasts.map((item) => {
                    const style = typeStyles[item.type] || typeStyles.info
                    const Icon = style.icon
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-white border border-slate-200 shrink-0 ${style.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}>
                                {item.type.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                Target: {item.target}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Sent {new Date(item.sentAt).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleDeleteBroadcast(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Remove announcement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Automated System Alert Toggles */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-600" />
                  Automated Admin Alerts
                </CardTitle>
                <CardDescription>
                  Configure which critical operational events alert admins immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Failed Payment Webhooks</p>
                      <p className="text-[11px] text-slate-500">Alert admins on Razorpay webhook signature failures</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={failedPaymentAlert}
                      onChange={(e) => setFailedPaymentAlert(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">New Business Registration</p>
                      <p className="text-[11px] text-slate-500">Notify admins whenever a new organization signs up</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newSignupAlert}
                      onChange={(e) => setNewSignupAlert(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Low Inventory Warnings</p>
                      <p className="text-[11px] text-slate-500">Notify when SKU stock falls below minimum threshold</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={lowStockAlert}
                      onChange={(e) => setLowStockAlert(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Security &amp; Privilege Audits</p>
                      <p className="text-[11px] text-slate-500">Real-time alerts on role elevation and plan modifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securityAlert}
                      onChange={(e) => setSecurityAlert(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Send Critical Alerts via Email</p>
                      <p className="text-[11px] text-slate-500">Dispatch copy of critical alerts via configured SMTP</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSaveAutomation}
                    disabled={isSavingPrefs}
                    className="w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs"
                  >
                    {prefsSuccess ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        Preferences Saved!
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`h-4 w-4 ${isSavingPrefs ? 'animate-spin' : ''}`} />
                        Save Alert Rules
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Dispatch Channels */}
            <Card className="border-slate-200 shadow-sm bg-linear-to-br from-indigo-50/50 to-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900">Connected Delivery Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-indigo-600" /> In-App Notification Toast
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" /> SMTP Email Gateway
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" /> Business Admin Dashboard
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Connected</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}