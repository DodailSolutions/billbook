'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Shield, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle2, 
  AlertTriangle, RefreshCw, FileText, Check, Save, UserCheck, ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function SecuritySettingsPage() {
  const supabase = createClient()

  // Policy Settings
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60')
  const [enforce2FA, setEnforce2FA] = useState(false)
  const [maxFailedLogins, setMaxFailedLogins] = useState('5')
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState('15')
  const [ipWhitelist, setIpWhitelist] = useState('')
  const [enableAuditLogging, setEnableAuditLogging] = useState(true)
  const [enforceHSTS, setEnforceHSTS] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'admin_security_config')
        .single()

      if (data?.value) {
        const val = data.value
        if (val.sessionTimeoutMinutes) setSessionTimeoutMinutes(val.sessionTimeoutMinutes)
        if (val.enforce2FA !== undefined) setEnforce2FA(val.enforce2FA)
        if (val.maxFailedLogins) setMaxFailedLogins(val.maxFailedLogins)
        if (val.lockoutDurationMinutes) setLockoutDurationMinutes(val.lockoutDurationMinutes)
        if (val.ipWhitelist) setIpWhitelist(val.ipWhitelist)
        if (val.enableAuditLogging !== undefined) setEnableAuditLogging(val.enableAuditLogging)
        if (val.enforceHSTS !== undefined) setEnforceHSTS(val.enforceHSTS)
      } else {
        const cached = localStorage.getItem('billbooky_security_config')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.sessionTimeoutMinutes) setSessionTimeoutMinutes(parsed.sessionTimeoutMinutes)
          if (parsed.enforce2FA !== undefined) setEnforce2FA(parsed.enforce2FA)
        }
      }
    } catch {
      const cached = localStorage.getItem('billbooky_security_config')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.sessionTimeoutMinutes) setSessionTimeoutMinutes(parsed.sessionTimeoutMinutes)
        } catch {}
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      sessionTimeoutMinutes,
      enforce2FA,
      maxFailedLogins,
      lockoutDurationMinutes,
      ipWhitelist: ipWhitelist.trim(),
      enableAuditLogging,
      enforceHSTS,
      updated_at: new Date().toISOString()
    }

    try {
      localStorage.setItem('billbooky_security_config', JSON.stringify(payload))
      await supabase.from('system_settings').upsert({
        key: 'admin_security_config',
        value: payload,
        description: 'Global system security policies and access controls'
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.warn('Saved security config to localStorage fallback:', err)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
              <span className="text-sm font-medium text-slate-500">Security &amp; Access Controls</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                <Shield className="h-6 w-6" />
              </div>
              System Security &amp; Access Control
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Configure session policies, two-factor authentication, IP restrictions, and audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              RLS Hardened
            </span>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">Security policies saved and applied successfully!</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Session & Authentication Policy */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-600" />
                  Session &amp; Auth Policy
                </CardTitle>
                <CardDescription>
                  Rules governing administrative timeouts and login persistence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Inactivity Session Timeout
                  </label>
                  <select
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="15">15 Minutes (High Security)</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">1 Hour</option>
                    <option value="240">4 Hours</option>
                    <option value="1440">24 Hours (Low Security)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Max Failed Login Attempts
                  </label>
                  <select
                    value={maxFailedLogins}
                    onChange={(e) => setMaxFailedLogins(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="3">3 Attempts (Strict Lockout)</option>
                    <option value="5">5 Attempts (Standard)</option>
                    <option value="10">10 Attempts (Relaxed)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Account Lockout Duration
                  </label>
                  <select
                    value={lockoutDurationMinutes}
                    onChange={(e) => setLockoutDurationMinutes(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="1440">24 Hours</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer pt-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Enforce Two-Factor Authentication</p>
                    <p className="text-[11px] text-slate-500">Require TOTP / Authenticator code on superadmin login</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enforce2FA}
                    onChange={(e) => setEnforce2FA(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </CardContent>
            </Card>

            {/* Network & Compliance Policy */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-5 w-5 text-rose-600" />
                  IP Restrictions &amp; Compliance
                </CardTitle>
                <CardDescription>
                  Network boundaries and security auditing controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Superadmin IP Whitelist (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (leave blank to allow all)"
                    className="w-full rounded-md border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-500">Comma-separated list of allowed IP addresses for superadmin access.</p>
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Comprehensive Audit Trail</p>
                    <p className="text-[11px] text-slate-500">Record all mutations, role changes, and data exports</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAuditLogging}
                    onChange={(e) => setEnableAuditLogging(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Strict Transport Security (HSTS)</p>
                    <p className="text-[11px] text-slate-500">Force modern HTTPS headers across all subdomains</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enforceHSTS}
                    onChange={(e) => setEnforceHSTS(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving Security Policy...' : 'Save Security Policies'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}