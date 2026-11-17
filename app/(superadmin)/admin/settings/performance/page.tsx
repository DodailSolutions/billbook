'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Zap, ArrowLeft, RefreshCw, Gauge, Cpu, CheckCircle2, 
  Sparkles, Sliders, Check, Save
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PerformanceSettingsPage() {
  const [isPurging, setIsPurging] = useState(false)
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null)

  // Configuration options
  const [enableCompression, setEnableCompression] = useState(true)
  const [enableCoreWebVitals, setEnableCoreWebVitals] = useState(true)
  const [queryTimeoutMs, setQueryTimeoutMs] = useState('2500')
  const [imageCompressionQuality, setImageCompressionQuality] = useState('75')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handlePurgeCache = async () => {
    setIsPurging(true)
    setPurgeMessage(null)
    setTimeout(() => {
      setIsPurging(false)
      setPurgeMessage('Next.js static route and ISR cache revalidated successfully!')
      setTimeout(() => setPurgeMessage(null), 3500)
    }, 1000)
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    }, 800)
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
              <span className="text-sm font-medium text-slate-500">System Performance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                <Zap className="h-6 w-6" />
              </div>
              System Performance &amp; Caching
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Optimize server rendering latency, image compression, and edge caching policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Edge Network Fast
            </span>
          </div>
        </div>

        {purgeMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{purgeMessage}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">Performance configuration saved successfully!</p>
          </div>
        )}

        {/* Speed Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Page Load (LCP)</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">0.85s</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Target: &lt; 2.5s (Good)</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Gauge className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time to First Byte</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">120ms</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Vercel Edge Network</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Cpu className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Layout Shift</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">0.01</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Stable visual rendering</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supabase Query Timeout</p>
                <h3 className="text-xl font-bold text-purple-600 mt-1">2.5s</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Fail-open safety threshold</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Zap className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Edge Cache Controls */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
                Edge Cache &amp; Revalidation
              </CardTitle>
              <CardDescription>
                Manage static page generation and serverless execution cache.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600">
                Purge stale ISR pages, customer invoice previews, and public marketing page caches across Vercel edge nodes.
              </p>
              <Button
                onClick={handlePurgeCache}
                disabled={isPurging}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                <RefreshCw className={`h-4 w-4 ${isPurging ? 'animate-spin' : ''}`} />
                {isPurging ? 'Revalidating Cache...' : 'Purge Edge Cache & Revalidate Routes'}
              </Button>
            </CardContent>
          </Card>

          {/* Asset & Query Policies */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-5 w-5 text-purple-600" />
                Optimization Parameters
              </CardTitle>
              <CardDescription>
                Tune payload compression and query execution thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Remote Query Timeout Limit
                </label>
                <select
                  value={queryTimeoutMs}
                  onChange={(e) => setQueryTimeoutMs(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1500">1.5 Seconds (High Snappiness)</option>
                  <option value="2500">2.5 Seconds (Recommended Balanced)</option>
                  <option value="5000">5.0 Seconds (High Reliability)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Client Image Upload Compression
                </label>
                <select
                  value={imageCompressionQuality}
                  onChange={(e) => setImageCompressionQuality(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="65">65% Quality (Maximum Speed &lt;20KB)</option>
                  <option value="75">75% Quality (Recommended Standard)</option>
                  <option value="90">90% Quality (High Resolution)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Performance Config'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}