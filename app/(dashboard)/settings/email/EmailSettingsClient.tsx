'use client'

import { useState, useTransition } from 'react'
import {
  Mail,
  Send,
  Server,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Laptop,
  Check,
  RotateCcw,
  ExternalLink,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  UserEmailSettings,
  UserEmailTemplate,
  EmailTemplateType,
  AVAILABLE_TEMPLATE_VARIABLES,
  DEFAULT_EMAIL_TEMPLATES,
} from '@/lib/client-email-types'
import {
  updateEmailSettingsAction,
  testEmailSettingsAction,
  updateEmailTemplateAction,
  resetEmailTemplateAction,
  sendDirectClientEmailAction,
} from './actions'

interface EmailSettingsClientProps {
  initialSettings: UserEmailSettings
  initialTemplates: UserEmailTemplate[]
  companyInfo: {
    name: string
    email: string
    phone: string
  }
  customers: Array<{ id: string; name: string; email?: string | null; phone?: string | null }>
  invoices: Array<{
    id: string
    invoice_number: string
    total: number
    due_date?: string | null
    customer_id?: string | null
    customer?: { name?: string; email?: string } | { name?: string; email?: string }[]
  }>
}

type TabMode = 'config' | 'templates' | 'send'

export default function EmailSettingsClient({
  initialSettings,
  initialTemplates,
  companyInfo,
  customers,
  invoices,
}: EmailSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('config')
  const [isPending, startTransition] = useTransition()

  // Settings State
  const [settings, setSettings] = useState<UserEmailSettings>(initialSettings)
  const [showPassword, setShowPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Test Connection State
  const [testEmail, setTestEmail] = useState(initialSettings.sender_email || companyInfo.email || '')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Templates State
  const [templates, setTemplates] = useState<UserEmailTemplate[]>(initialTemplates)
  const [selectedTemplateType, setSelectedTemplateType] = useState<EmailTemplateType>('invoice_delivery')
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [templateSaveStatus, setTemplateSaveStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)

  // Direct Send State
  const [sendCustomerId, setSendCustomerId] = useState<string>('')
  const [sendInvoiceId, setSendInvoiceId] = useState<string>('')
  const [sendToEmail, setSendToEmail] = useState<string>('')
  const [sendCustomerName, setSendCustomerName] = useState<string>('')
  const [sendTemplateType, setSendTemplateType] = useState<EmailTemplateType>('invoice_delivery')
  const [isDirectSending, setIsDirectSending] = useState(false)
  const [sendDirectResult, setSendDirectResult] = useState<{ success: boolean; message: string } | null>(null)

  // Get current active template in state
  const currentTemplate =
    templates.find((t) => t.template_type === selectedTemplateType) ||
    DEFAULT_EMAIL_TEMPLATES[selectedTemplateType]

  // Handlers for Settings
  const handleSaveSettings = () => {
    setSaveStatus(null)
    startTransition(async () => {
      const res = await updateEmailSettingsAction(settings)
      if (res.success) {
        setSaveStatus({ type: 'success', text: 'Email settings saved successfully!' })
        setTimeout(() => setSaveStatus(null), 4000)
      } else {
        setSaveStatus({ type: 'error', text: res.error || 'Failed to save settings' })
      }
    })
  }

  const handleTestConnection = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: 'Please enter a test recipient email address.' })
      return
    }
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await testEmailSettingsAction(settings, testEmail)
      setTestResult(res)
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error executing test email.',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handlePresetSelect = (preset: 'gmail' | 'outlook' | 'yahoo' | 'custom') => {
    if (preset === 'gmail') {
      setSettings((prev) => ({
        ...prev,
        provider: 'custom_smtp',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: false,
      }))
    } else if (preset === 'outlook') {
      setSettings((prev) => ({
        ...prev,
        provider: 'custom_smtp',
        smtp_host: 'smtp.office365.com',
        smtp_port: 587,
        smtp_secure: false,
      }))
    } else if (preset === 'yahoo') {
      setSettings((prev) => ({
        ...prev,
        provider: 'custom_smtp',
        smtp_host: 'smtp.mail.yahoo.com',
        smtp_port: 465,
        smtp_secure: true,
      }))
    } else {
      setSettings((prev) => ({
        ...prev,
        provider: 'custom_smtp',
      }))
    }
  }

  // Handlers for Templates
  const handleTemplateChange = (field: 'subject' | 'body_html', value: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.template_type === selectedTemplateType ? { ...t, [field]: value } : t))
    )
  }

  const handleSaveTemplate = () => {
    setTemplateSaveStatus(null)
    startTransition(async () => {
      const res = await updateEmailTemplateAction({
        template_type: selectedTemplateType,
        name: currentTemplate.name || DEFAULT_EMAIL_TEMPLATES[selectedTemplateType].name,
        subject: currentTemplate.subject,
        body_html: currentTemplate.body_html,
      })

      if (res.success) {
        setTemplateSaveStatus({ type: 'success', text: 'Template changes saved successfully!' })
        setTimeout(() => setTemplateSaveStatus(null), 4000)
      } else {
        setTemplateSaveStatus({ type: 'error', text: res.error || 'Failed to save template' })
      }
    })
  }

  const handleResetTemplate = () => {
    if (!confirm('Are you sure you want to restore this template to the default version?')) return
    startTransition(async () => {
      const res = await resetEmailTemplateAction(selectedTemplateType)
      if (res.success && res.template) {
        setTemplates((prev) =>
          prev.map((t) => (t.template_type === selectedTemplateType ? res.template! : t))
        )
        setTemplateSaveStatus({ type: 'success', text: 'Template reset to default!' })
        setTimeout(() => setTemplateSaveStatus(null), 3000)
      }
    })
  }

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(null), 2000)
  }

  // Generate Sample Preview Data
  const sampleData: Record<string, string> = {
    customer_name: 'Sharma Enterprises Pvt Ltd',
    invoice_number: 'INV-2026-0042',
    total_amount: '₹18,500.00',
    due_date: '15 Nov 2026',
    issue_date: '28 Oct 2026',
    company_name: settings.sender_name || companyInfo.name || 'My Business',
    company_email: settings.sender_email || companyInfo.email || 'billing@example.com',
    company_phone: companyInfo.phone || '+91 98765 43210',
    invoice_url: '#',
    payment_url: '#',
  }

  const renderedPreviewHtml = (() => {
    let html = currentTemplate.body_html || ''
    for (const [key, val] of Object.entries(sampleData)) {
      html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val)
    }
    return html
  })()

  // Handlers for Direct Sending
  const handleSelectCustomer = (customerId: string) => {
    setSendCustomerId(customerId)
    const cust = customers.find((c) => c.id === customerId)
    if (cust) {
      setSendToEmail(cust.email || '')
      setSendCustomerName(cust.name || '')
    }
  }

  const handleSelectInvoice = (invoiceId: string) => {
    setSendInvoiceId(invoiceId)
    const inv = invoices.find((i) => i.id === invoiceId)
    if (inv && inv.customer_id) {
      handleSelectCustomer(inv.customer_id)
    }
  }

  const handleSendDirectEmail = async () => {
    if (!sendToEmail) {
      setSendDirectResult({ success: false, message: 'Please specify recipient email.' })
      return
    }

    setIsDirectSending(true)
    setSendDirectResult(null)
    try {
      const res = await sendDirectClientEmailAction({
        toEmail: sendToEmail,
        templateType: sendTemplateType,
        invoiceId: sendInvoiceId || undefined,
        customerName: sendCustomerName || undefined,
      })

      if (res.success) {
        setSendDirectResult({
          success: true,
          message: `Email sent successfully to ${sendToEmail}!`,
        })
      } else {
        setSendDirectResult({
          success: false,
          message: res.error || 'Failed to dispatch email.',
        })
      }
    } catch (err: unknown) {
      setSendDirectResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error sending email',
      })
    } finally {
      setIsDirectSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email &amp; Client Communications</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Client Dashboard
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Configure custom sender email / SMTP and design branded templates for invoices, reminders, and receipts.
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            {settings.provider === 'custom_smtp' && settings.is_active ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Custom SMTP Active ({settings.smtp_host})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                BillBook Cloud Mailer (Default)
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <Server className="h-4 w-4" />
            Email Configuration &amp; SMTP
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Email Templates
          </button>

          <button
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'send'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <Send className="h-4 w-4" />
            Send Email to Client
          </button>
        </div>
      </div>

      {/* TAB 1: EMAIL CONFIGURATION & SMTP */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Config Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sender Identity</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  How your emails appear to clients in their inbox.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Sender Name
                  </label>
                  <Input
                    value={settings.sender_name || ''}
                    onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                    placeholder="e.g. Acme Invoicing"
                    className="h-10"
                  />
                  <p className="text-xs text-slate-400 mt-1">Displayed in recipient&apos;s &quot;From&quot; field</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Sender / From Email
                  </label>
                  <Input
                    type="email"
                    value={settings.sender_email || ''}
                    onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                    placeholder="billing@yourcompany.com"
                    className="h-10"
                  />
                  <p className="text-xs text-slate-400 mt-1">Must match your SMTP login if using custom SMTP</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Reply-To Email Address
                  </label>
                  <Input
                    type="email"
                    value={settings.reply_to_email || ''}
                    onChange={(e) => setSettings({ ...settings, reply_to_email: e.target.value })}
                    placeholder="support@yourcompany.com"
                    className="h-10"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    When your clients click &quot;Reply&quot;, their responses will be sent directly to this address.
                  </p>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-700" />

              {/* Delivery Provider Selector */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Email Delivery Method</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Choose between the built-in BillBook cloud mailer or your own email server (SMTP).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* System Mailer Card */}
                  <div
                    onClick={() => setSettings({ ...settings, provider: 'system' })}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      settings.provider === 'system'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        BillBook Cloud Mailer
                      </span>
                      {settings.provider === 'system' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Zero configuration needed. Invoices and notifications are reliably delivered through BillBook&apos;s high-deliverability cloud servers.
                    </p>
                  </div>

                  {/* Custom SMTP Card */}
                  <div
                    onClick={() => setSettings({ ...settings, provider: 'custom_smtp' })}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      settings.provider === 'custom_smtp'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        Custom SMTP Server
                      </span>
                      {settings.provider === 'custom_smtp' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Send directly from your company&apos;s own Gmail, Google Workspace, Outlook 365, or private mail server with your own domain SPF/DKIM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom SMTP Settings Form */}
              {settings.provider === 'custom_smtp' && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Quick Provider Presets
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePresetSelect('gmail')}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Gmail / Google Workspace
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect('outlook')}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Outlook / Office 365
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect('yahoo')}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Yahoo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SMTP Host Server
                      </label>
                      <Input
                        value={settings.smtp_host || ''}
                        onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Port
                      </label>
                      <Input
                        type="number"
                        value={settings.smtp_port || 587}
                        onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) || 587 })}
                        placeholder="587"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SMTP Username / Email
                      </label>
                      <Input
                        value={settings.smtp_user || ''}
                        onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                        placeholder="yourname@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SSL / TLS Security
                      </label>
                      <select
                        value={settings.smtp_secure ? 'ssl' : 'tls'}
                        onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.value === 'ssl' })}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="tls">STARTTLS (Port 587)</option>
                        <option value="ssl">SSL / TLS (Port 465)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SMTP Password / App Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.smtp_password || ''}
                          onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                          placeholder="••••••••••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gmail App Password Alert Tip */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1 leading-relaxed">
                      <p className="font-semibold">Tip for Gmail &amp; Google Workspace:</p>
                      <p>
                        Google requires a <strong>16-character App Password</strong> rather than your regular account password.
                        Generate it from your{' '}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-medium hover:text-amber-700"
                        >
                          Google Account Security &gt; 2-Step Verification &gt; App Passwords
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {saveStatus && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {saveStatus.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {saveStatus.text}
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button onClick={handleSaveSettings} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Email Configuration
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Test Tool & Instructions */}
          <div className="space-y-6">
            {/* Test Connection Box */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Test Connection</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send a live test email to verify credentials and ensure firewall / SMTP handshake works without issues.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Recipient Email
                </label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                onClick={handleTestConnection}
                disabled={isTesting}
                variant="outline"
                className="w-full gap-2 text-xs h-9 border-blue-200 hover:bg-blue-50 text-blue-700"
              >
                {isTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {isTesting ? 'Sending test...' : 'Send Test Email'}
              </Button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {testResult.success ? 'Success' : 'Error'}
                  </div>
                  <p className="leading-relaxed">{testResult.message}</p>
                </div>
              )}
            </div>

            {/* Quick Guide Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                Why use your own SMTP?
              </h4>
              <ul className="space-y-2 list-disc list-inside text-slate-500 dark:text-slate-400 leading-relaxed">
                <li>Emails arrive with your official domain name in the From header.</li>
                <li>Builds trusted brand identity with your clients.</li>
                <li>Client replies land directly in your primary mail inbox.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Template Subnav */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['invoice_delivery', 'payment_reminder', 'payment_receipt', 'quotation'] as EmailTemplateType[]).map(
                (type) => {
                  const info = DEFAULT_EMAIL_TEMPLATES[type]
                  const isSelected = selectedTemplateType === type
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedTemplateType(type)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300'
                      }`}
                    >
                      {info.name}
                    </button>
                  )
                }
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetTemplate}
                disabled={isPending}
                className="gap-1.5 text-xs text-slate-600 hover:text-red-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Default
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTemplate}
                disabled={isPending}
                className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Template
              </Button>
            </div>
          </div>

          {templateSaveStatus && (
            <div
              className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                templateSaveStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {templateSaveStatus.text}
            </div>
          )}

          {/* Variables Bar */}
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                Click any dynamic variable to copy into subject or body:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleCopyTag(v.tag)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    copiedTag === v.tag
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                  }`}
                  title={`${v.label} (e.g. ${v.example})`}
                >
                  {v.tag}
                  {copiedTag === v.tag ? <Check className="h-3 w-3" /> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Line Input */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Subject Line
              </label>
              <Input
                value={currentTemplate.subject}
                onChange={(e) => handleTemplateChange('subject', e.target.value)}
                placeholder="e.g. Invoice {{invoice_number}} from {{company_name}}"
                className="h-11 font-medium text-base"
              />
            </div>

            {/* Split Editor and Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Template Content &amp; HTML Design
                </span>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      previewMode === 'preview'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Laptop className="h-3.5 w-3.5" />
                    Live Customer Preview
                  </button>
                  <button
                    onClick={() => setPreviewMode('code')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      previewMode === 'code'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    HTML Code Editor
                  </button>
                </div>
              </div>

              {previewMode === 'code' ? (
                <div>
                  <textarea
                    rows={18}
                    value={currentTemplate.body_html}
                    onChange={(e) => handleTemplateChange('body_html', e.target.value)}
                    className="w-full font-mono text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Standard HTML with inline styles is supported across all email clients (Gmail, Apple Mail, Outlook).
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Simulated Subject:</span>
                      <span>
                        {currentTemplate.subject.replace(/{{\s*invoice_number\s*}}/g, 'INV-2026-0042').replace(/{{\s*company_name\s*}}/g, settings.sender_name || companyInfo.name)}
                      </span>
                    </div>
                    <span className="text-slate-400">Desktop View</span>
                  </div>
                  <div className="p-4 sm:p-8 flex justify-center">
                    <iframe
                      title="Live Email Preview"
                      srcDoc={renderedPreviewHtml}
                      className="w-full max-w-[620px] h-[580px] bg-white rounded-lg shadow-sm border border-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEND EMAIL TO CLIENT */}
      {activeTab === 'send' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Send Email Directly to Client
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Pick a customer or invoice to compose and dispatch a branded email directly from your dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Customer (Optional)
                </label>
                <select
                  value={sendCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                  <option value="">-- Choose Existing Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.email ? `(${c.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Attach Invoice Context (Optional)
                </label>
                <select
                  value={sendInvoiceId}
                  onChange={(e) => handleSelectInvoice(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} (₹{inv.total.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={sendToEmail}
                  onChange={(e) => setSendToEmail(e.target.value)}
                  placeholder="client@acme.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Client / Contact Name
                </label>
                <Input
                  value={sendCustomerName}
                  onChange={(e) => setSendCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Template to Send
              </label>
              <select
                value={sendTemplateType}
                onChange={(e) => setSendTemplateType(e.target.value as EmailTemplateType)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium"
              >
                <option value="invoice_delivery">Invoice Delivery</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="payment_receipt">Payment Receipt / Thank You</option>
                <option value="quotation">Quotation / Estimate</option>
              </select>
            </div>

            {/* Preview Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p>
                <strong>From:</strong> &quot;{settings.sender_name || companyInfo.name}&quot; &lt;
                {settings.sender_email || companyInfo.email || 'noreply@billbooky.dodail.com'}&gt;
              </p>
              <p>
                <strong>Reply-To:</strong> {settings.reply_to_email || settings.sender_email || companyInfo.email}
              </p>
              <p>
                <strong>Mailer:</strong>{' '}
                {settings.provider === 'custom_smtp' && settings.is_active
                  ? `Custom SMTP (${settings.smtp_host})`
                  : 'BillBook Cloud Mailer'}
              </p>
            </div>

            {sendDirectResult && (
              <div
                className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                  sendDirectResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {sendDirectResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {sendDirectResult.message}
              </div>
            )}

            <Button
              onClick={handleSendDirectEmail}
              disabled={isDirectSending || !sendToEmail}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold gap-2"
            >
              {isDirectSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isDirectSending ? 'Sending email to client...' : 'Send Branded Email Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
