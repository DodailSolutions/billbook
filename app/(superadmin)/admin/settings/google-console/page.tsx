'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Globe, 
  ArrowLeft, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Save,
  BarChart3,
  Code2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function GoogleSearchConsolePage() {
  const supabase = createClient()
  const [siteVerificationToken, setSiteVerificationToken] = useState('-8t9f7kYXCnXv0O-BgLx_Jb5-3bIRO8R2gfR2nMYLTw')
  const [customHeaderScripts, setCustomHeaderScripts] = useState('<meta name="google-site-verification" content="-8t9f7kYXCnXv0O-BgLx_Jb5-3bIRO8R2gfR2nMYLTw" />')
  const [gaMeasurementId, setGaMeasurementId] = useState('')
  const [gtmId, setGtmId] = useState('')
  const [targetKeywords, setTargetKeywords] = useState('free gst invoice generator, billing software india, tally alternative, zoho books alternative, vyapar alternative, msme invoice maker, e-invoicing india')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const sitemapUrl = typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : 'https://billbooky.dodail.com/sitemap.xml'
  const robotsUrl = typeof window !== 'undefined' ? `${window.location.origin}/robots.txt` : 'https://billbooky.dodail.com/robots.txt'

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSettings = async () => {
    try {
      const [gscRes, scriptsRes] = await Promise.all([
        supabase.from('system_settings').select('*').eq('key', 'google_search_console').single(),
        supabase.from('system_settings').select('*').eq('key', 'custom_header_scripts').single()
      ])

      if (gscRes.data?.value) {
        const val = gscRes.data.value as {
          siteVerificationToken?: string
          gaMeasurementId?: string
          gtmId?: string
          targetKeywords?: string
        }
        if (val.siteVerificationToken) setSiteVerificationToken(val.siteVerificationToken)
        if (val.gaMeasurementId) setGaMeasurementId(val.gaMeasurementId)
        if (val.gtmId) setGtmId(val.gtmId)
        if (val.targetKeywords) setTargetKeywords(val.targetKeywords)
      }

      if (scriptsRes.data?.value?.scripts) {
        setCustomHeaderScripts(scriptsRes.data.value.scripts)
      } else {
        const cachedScripts = localStorage.getItem('billbooky_custom_header_scripts')
        if (cachedScripts) setCustomHeaderScripts(cachedScripts)
      }
    } catch {
      const cached = localStorage.getItem('billbooky_gsc_settings')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.siteVerificationToken) setSiteVerificationToken(parsed.siteVerificationToken)
          if (parsed.gaMeasurementId) setGaMeasurementId(parsed.gaMeasurementId)
          if (parsed.gtmId) setGtmId(parsed.gtmId)
          if (parsed.targetKeywords) setTargetKeywords(parsed.targetKeywords)
        } catch {}
      }
      const cachedScripts = localStorage.getItem('billbooky_custom_header_scripts')
      if (cachedScripts) setCustomHeaderScripts(cachedScripts)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    const payload = {
      siteVerificationToken: siteVerificationToken.trim(),
      gaMeasurementId: gaMeasurementId.trim(),
      gtmId: gtmId.trim(),
      targetKeywords: targetKeywords.trim(),
      updated_at: new Date().toISOString()
    }

    try {
      localStorage.setItem('billbooky_gsc_settings', JSON.stringify(payload))
      localStorage.setItem('billbooky_custom_header_scripts', customHeaderScripts.trim())

      await Promise.all([
        supabase.from('system_settings').upsert({
          key: 'google_search_console',
          value: payload,
          description: 'Google Search Console and SEO verification configurations'
        }),
        supabase.from('system_settings').upsert({
          key: 'custom_header_scripts',
          value: { scripts: customHeaderScripts.trim(), updated_at: new Date().toISOString() },
          description: 'Raw custom head tags and analytics scripts injected into website header'
        })
      ])

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      console.warn('Saved to localStorage fallback:', e)
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
              <span className="text-sm font-medium text-slate-500">Google Search Console & SEO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Globe className="h-6 w-6" />
              </div>
              Google Search Console Integration
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Verify your domain on Google, submit XML sitemaps, and track organic search traffic to dominate Indian billing queries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Search Console
              </Button>
            </a>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">Google Search Console settings updated successfully!</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Configuration Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Site Verification
                </CardTitle>
                <CardDescription>
                  Enter your Google HTML tag verification token to prove website ownership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Google Verification Token
                  </label>
                  <Input
                    placeholder="e.g. google-site-verification=abc123xyz456... or raw token"
                    value={siteVerificationToken}
                    onChange={(e) => setSiteVerificationToken(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    In Google Search Console, choose <strong>URL prefix</strong> or <strong>HTML tag</strong> method and copy the `content="..."` attribute value here.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      GA4 Measurement ID
                    </label>
                    <Input
                      placeholder="G-XXXXXXXXXX"
                      value={gaMeasurementId}
                      onChange={(e) => setGaMeasurementId(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Google Tag Manager ID
                    </label>
                    <Input
                      placeholder="GTM-XXXXXXX"
                      value={gtmId}
                      onChange={(e) => setGtmId(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Primary Organic SEO Keywords
                  </label>
                  <textarea
                    rows={3}
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="free gst invoice generator, billing software india, tally alternative..."
                  />
                  <p className="text-xs text-slate-500">
                    Target organic search terms embedded into sitemaps and indexing signals.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Header Code & Tag Injection */}
            <Card className="border-indigo-100 shadow-sm bg-gradient-to-br from-white to-indigo-50/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                    <Code2 className="h-5 w-5 text-indigo-600" />
                    Custom Header Code &amp; Scripts Injection
                  </CardTitle>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Global &lt;head&gt;</span>
                </div>
                <CardDescription>
                  Paste any raw verification meta tags, Google Tag Manager scripts, analytics snippets, or third-party tracking pixels to deploy them dynamically to the website header.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <textarea
                    rows={6}
                    value={customHeaderScripts}
                    onChange={(e) => setCustomHeaderScripts(e.target.value)}
                    className="w-full rounded-xl border border-indigo-200 bg-slate-900 p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                    placeholder={`<meta name="google-site-verification" content="-8t9f7kYXCnXv0O-BgLx_Jb5-3bIRO8R2gfR2nMYLTw" />\n<script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>`}
                  />
                  <p className="text-xs text-slate-500">
                    Injected dynamically across all pages inside the HTML <code>&lt;head&gt;</code> without requiring a manual redeploy.
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Deploy Header Scripts'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sitemap & Robots.txt URLs */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-purple-600" />
                  Sitemap & Indexing Endpoints
                </CardTitle>
                <CardDescription>
                  URLs to submit in Google Search Console under the <strong>Sitemaps</strong> tab.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-600">XML SITEMAP URL</p>
                    <p className="text-xs font-mono text-slate-900 truncate">{sitemapUrl}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 shrink-0"
                    onClick={() => copyToClipboard(sitemapUrl, 'sitemap')}
                  >
                    {copiedItem === 'sitemap' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedItem === 'sitemap' ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-600">ROBOTS.TXT URL</p>
                    <p className="text-xs font-mono text-slate-900 truncate">{robotsUrl}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 shrink-0"
                    onClick={() => copyToClipboard(robotsUrl, 'robots')}
                  >
                    {copiedItem === 'robots' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedItem === 'robots' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Guide & Competitor Domination Tips */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-linear-to-br from-blue-50/50 to-indigo-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  3-Step Google Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700">
                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
                  <p>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">Google Search Console</a> and add <code>https://billbooky.dodail.com</code>.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>
                  <p>Choose <strong>HTML Tag</strong>, copy the verification code, and paste it in the Verification Token field here.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">3</span>
                  <p>Open the <strong>Sitemaps</strong> section in Search Console and submit <code>sitemap.xml</code> for instant crawling.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  SEO Domination Keywords
                </CardTitle>
                <CardDescription className="text-xs">
                  Keywords targeting organic traffic in India
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Free GST Billing Software',
                    'Invoice Maker India',
                    'Zoho Books Alternative',
                    'Vyapar Alternative',
                    'Tally Prime Online',
                    'MSME E-Invoicing',
                    'Free Billing App',
                    'Online Invoice Generator'
                  ].map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
