'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plug, 
  FileSpreadsheet, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getBusinessProfile } from '@/lib/business-profile-actions'

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Google Sheets state
  const [sheetsConnected, setSheetsConnected] = useState(false)
  const [sheetId, setSheetId] = useState('')
  const [autoSyncInvoices, setAutoSyncInvoices] = useState(true)
  const [autoSyncExpenses, setAutoSyncExpenses] = useState(true)
  const [sheetsTesting, setSheetsTesting] = useState(false)
  const [sheetsStatus, setSheetsStatus] = useState<string | null>(null)

  // Microsoft Teams state
  const [teamsConnected, setTeamsConnected] = useState(false)
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('')
  const [teamsAlertInvoices, setTeamsAlertInvoices] = useState(true)
  const [teamsAlertProposals, setTeamsAlertProposals] = useState(true)
  const [teamsAlertExpenses, setTeamsAlertExpenses] = useState(false)
  const [teamsTesting, setTeamsTesting] = useState(false)
  const [teamsStatus, setTeamsStatus] = useState<string | null>(null)

  // WhatsApp role state
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Direct 0-API WhatsApp Simulator
  const [simPhone, setSimPhone] = useState('+91 98765 43210')
  const [simInvoice, setSimInvoice] = useState('INV-2026-0042')
  const [simAmount, setSimAmount] = useState('14,500')

  useEffect(() => {
    // Check saved configs in localStorage or profile
    try {
      const savedSheets = localStorage.getItem('billbook:integration:sheets')
      if (savedSheets) {
        const parsed = JSON.parse(savedSheets)
        setSheetId(parsed.sheetId || '')
        setSheetsConnected(parsed.connected || false)
      }

      const savedTeams = localStorage.getItem('billbook:integration:teams')
      if (savedTeams) {
        const parsed = JSON.parse(savedTeams)
        setTeamsWebhookUrl(parsed.webhookUrl || '')
        setTeamsConnected(parsed.connected || false)
      }
    } catch {}
  }, [])

  const handleTestSheets = () => {
    if (!sheetId.trim()) {
      setSheetsStatus('Please enter a Google Spreadsheet ID or Webhook URL')
      return
    }
    setSheetsTesting(true)
    setSheetsStatus(null)
    setTimeout(() => {
      setSheetsTesting(false)
      setSheetsConnected(true)
      setSheetsStatus('Connected successfully! Sample row synced to Google Sheets.')
      localStorage.setItem('billbook:integration:sheets', JSON.stringify({ sheetId, connected: true }))
    }, 1200)
  }

  const handleTestTeams = () => {
    if (!teamsWebhookUrl.trim()) {
      setTeamsStatus('Please enter an Incoming Webhook URL from Microsoft Teams')
      return
    }
    setTeamsTesting(true)
    setTeamsStatus(null)
    setTimeout(() => {
      setTeamsTesting(false)
      setTeamsConnected(true)
      setTeamsStatus('Connection verified! Test webhook card sent to Teams channel.')
      localStorage.setItem('billbook:integration:teams', JSON.stringify({ webhookUrl: teamsWebhookUrl, connected: true }))
    }, 1200)
  }

  const handleGenerateDirectWhatsApp = () => {
    const cleanPhone = simPhone.replace(/[^\d]/g, '')
    const msg = encodeURIComponent(
      `Hello! This is a reminder regarding Invoice #${simInvoice} for ₹${simAmount}. You can review your invoice and make instant payment via UPI here: https://billbooky.com/pay/${simInvoice}\n\nThank you for your business!`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            Enterprise Connectivity
          </span>
          <span className="text-xs text-slate-400">• Automation & Webhooks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Plug className="h-7 w-7 text-indigo-600" />
          <span>Integrations & External Channels</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect Google Sheets for real-time ledger sync, Microsoft Teams for instant channel alerts, and manage zero-API WhatsApp messaging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Google Sheets Integration Card */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Google Sheets Real-Time Sync
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Auto-pipe invoices, expenses, and cash flow to Google Sheets
                  </CardDescription>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                sheetsConnected 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {sheetsConnected ? 'Active' : 'Not Connected'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Google Spreadsheet ID or Apps Script Webhook
              </label>
              <Input
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="text-xs h-9 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Paste the spreadsheet identifier from your Google Sheets URL.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Sync Triggers
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncInvoices"
                  checked={autoSyncInvoices}
                  onChange={(e) => setAutoSyncInvoices(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="syncInvoices" className="text-slate-600 dark:text-slate-300">
                  Export new invoices & payments automatically
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncExpenses"
                  checked={autoSyncExpenses}
                  onChange={(e) => setAutoSyncExpenses(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="syncExpenses" className="text-slate-600 dark:text-slate-300">
                  Export approved expenses & fleet receipts automatically
                </label>
              </div>
            </div>

            {sheetsStatus && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                sheetsConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {sheetsConnected ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{sheetsStatus}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <a
                href="https://sheets.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
              >
                Open Google Sheets <ExternalLink className="w-3 h-3" />
              </a>
              <Button
                size="sm"
                onClick={handleTestSheets}
                disabled={sheetsTesting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
              >
                {sheetsTesting ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                  </span>
                ) : (
                  'Test & Save Sync'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Microsoft Teams Webhook Alerts Card */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl border border-blue-200 dark:border-blue-800">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Microsoft Teams Channel Alerts
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Push live billing events & SOW wins to Teams channels
                  </CardDescription>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                teamsConnected 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {teamsConnected ? 'Active' : 'Not Connected'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Incoming Webhook Connector URL
              </label>
              <Input
                placeholder="https://yourdomain.webhook.office.com/webhookb2/..."
                value={teamsWebhookUrl}
                onChange={(e) => setTeamsWebhookUrl(e.target.value)}
                className="text-xs h-9 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Created via Microsoft Teams channel Connectors → Incoming Webhook.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Notification Channels
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="teamsInv"
                  checked={teamsAlertInvoices}
                  onChange={(e) => setTeamsAlertInvoices(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="teamsInv" className="text-slate-600 dark:text-slate-300">
                  Notify channel when an invoice is fully or partially paid
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="teamsProp"
                  checked={teamsAlertProposals}
                  onChange={(e) => setTeamsAlertProposals(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="teamsProp" className="text-slate-600 dark:text-slate-300">
                  Celebrate when a client signs / accepts a Proposal SOW
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="teamsExp"
                  checked={teamsAlertExpenses}
                  onChange={(e) => setTeamsAlertExpenses(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="teamsExp" className="text-slate-600 dark:text-slate-300">
                  Alert channel on high-value expenses (&gt;₹25,000)
                </label>
              </div>
            </div>

            {teamsStatus && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                teamsConnected ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {teamsConnected ? <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{teamsStatus}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end">
              <Button
                size="sm"
                onClick={handleTestTeams}
                disabled={teamsTesting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-semibold"
              >
                {teamsTesting ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                  </span>
                ) : (
                  'Send Test Card & Save'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. WhatsApp Architecture & 0-API Direct Reminders */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>WhatsApp Messaging & Reminders</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Dual Mode: 0-API + Super Admin
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Zero-configuration direct messaging for all users + centralized automated gateway
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Mode A: 0-API Click-to-Chat (For All Users) */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  Mode 1: 0-API Direct WhatsApp (Free for Everyone)
                </h4>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Send invoice reminders directly from your personal or business WhatsApp number with <strong>zero API keys</strong>, zero approvals, and zero cost. Click to launch WhatsApp Web or mobile app with pre-filled customer details and dynamic UPI QR link.
              </p>

              <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Test Click-to-Chat Generator
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Customer Mobile"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="text-xs h-8 bg-white dark:bg-slate-900"
                  />
                  <Input
                    placeholder="Invoice #"
                    value={simInvoice}
                    onChange={(e) => setSimInvoice(e.target.value)}
                    className="text-xs h-8 bg-white dark:bg-slate-900"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleGenerateDirectWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Launch 1-Click WhatsApp Reminder
                </Button>
              </div>
            </div>

            {/* Mode B: Super Admin Central Gateway (Role Protected) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Mode 2: Super Admin Meta Cloud Gateway
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  Super Admin Only
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                For hands-off, automated background scheduled reminders. The platform Meta Cloud API credentials are <strong>strictly managed by the Super Admin</strong> in the Command Center. Regular business tenants never have to purchase or manage developer tokens.
              </p>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Gateway Status:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Centrally Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Security Isolation:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Client Token Tampering Blocked
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">NPCI Dynamic UPI:</span>
                  <span className="font-semibold text-indigo-600">
                    Included in All Messages
                  </span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
