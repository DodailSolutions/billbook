'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  X, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { evaluateRfpAction } from './actions'
import type { 
  RfpEvaluationInput, 
  BidFeasibilityScore, 
  ComplianceMatrixItem, 
  ScopeDeliverable, 
  MilestoneTranche 
} from '@/lib/proposal-types'

interface ProposalEvaluatorModalProps {
  onClose: () => void
  onProceedToProposal: (evaluationData: {
    title: string
    clientName: string
    scopeText: string
    deliverables: ScopeDeliverable[]
    tranches: MilestoneTranche[]
    complianceMatrix: ComplianceMatrixItem[]
    feasibilityScore: BidFeasibilityScore
  }) => void
}

export function ProposalEvaluatorModal({ onClose, onProceedToProposal }: ProposalEvaluatorModalProps) {
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientBudget, setClientBudget] = useState('')
  const [timelineWeeks, setTimelineWeeks] = useState('4')
  const [scopeText, setScopeText] = useState('')
  
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    feasibilityScore: BidFeasibilityScore
    complianceMatrix: ComplianceMatrixItem[]
    parsedDeliverables: ScopeDeliverable[]
    recommendedTranches: MilestoneTranche[]
  } | null>(null)

  const handleEvaluate = async () => {
    if (!scopeText.trim()) {
      setError('Please paste RFP scope text or client requirements')
      return
    }

    setIsEvaluating(true)
    setError('')

    const input: RfpEvaluationInput = {
      title: title || 'Client SOW Project',
      clientName,
      scopeText,
      clientBudget: clientBudget ? Number(clientBudget) : undefined,
      timelineWeeks: timelineWeeks ? Number(timelineWeeks) : 4
    }

    const res = await evaluateRfpAction(input)
    if (res.success && res.data) {
      setResult(res.data)
    } else {
      setError(res.error || 'Evaluation failed. Please try again.')
    }
    setIsEvaluating(false)
  }

  const handleApplyPreset = (type: 'software' | 'marketing' | 'freelancer') => {
    if (type === 'software') {
      setTitle('SaaS Multi-Tenant Web & Mobile Platform')
      setClientName('Apex Ventures')
      setClientBudget('350000')
      setTimelineWeeks('6')
      setScopeText(
        `1. System Architecture & Supabase Multi-Tenant Database Design\n` +
        `2. Next.js 14 Responsive Web Dashboard with Role-Based Access Control\n` +
        `3. REST / GraphQL API endpoints for mobile client applications\n` +
        `4. Automated Stripe / Razorpay Subscription Billing & Invoicing Engine\n` +
        `5. End-to-End QA, Staging Deployment, and SOC2 Compliance Verification`
      )
    } else if (type === 'marketing') {
      setTitle('Performance Marketing Retainer & Creative Studio')
      setClientName('Luxe Health & Wellness')
      setClientBudget('150000')
      setTimelineWeeks('4')
      setScopeText(
        `1. Meta Ads & Google PPC Full-Funnel Campaign Setup\n` +
        `2. 12 High-Converting Short-Form Reel & Motion Graphics Deliverables\n` +
        `3. Landing Page Conversion Rate Optimization (CRO) & A/B Testing\n` +
        `4. Bi-Weekly ROAS Analytics Reporting & Attribution Dashboards`
      )
    } else {
      setTitle('Brand Identity & Interactive Webflow Site')
      setClientName('Horizon Studio')
      setClientBudget('75000')
      setTimelineWeeks('3')
      setScopeText(
        `1. Comprehensive Visual Brand Guidelines & Logo Suite\n` +
        `2. Custom Responsive 5-Page Web Experience with Micro-Animations\n` +
        `3. Mobile Optimization, SEO Metadata Setup, and Domain Handoff`
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI RFP / RFQ Ingestion & Go/No-Go Scorer</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Phase 5
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste client scope, RFP documents, or tender requirements to calculate win feasibility and compliance risk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {!result ? (
            <div className="space-y-4">
              {/* Presets */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Quick Test Scopes:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('software')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                >
                  💻 Software IT
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('marketing')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                >
                  🚀 Marketing Agency
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('freelancer')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
                >
                  🎨 Solo Creator
                </button>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Project / Tender Title
                  </label>
                  <Input
                    placeholder="e.g. Enterprise CRM Re-platforming"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Client or Prospect Name
                  </label>
                  <Input
                    placeholder="e.g. Acme Corp Inc."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Client Budget Target (Optional ₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 250000"
                    value={clientBudget}
                    onChange={(e) => setClientBudget(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Timeline (Weeks)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 4"
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Scope Area */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  RFP / SOW Scope Text & Requirements *
                </label>
                <textarea
                  rows={6}
                  value={scopeText}
                  onChange={(e) => setScopeText(e.target.value)}
                  placeholder="Paste RFP document sections, deliverables list, technical constraints, or client email brief here..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Evaluation Results Screen */
            <div className="space-y-4 animate-in fade-in">
              {/* Score Top Banner */}
              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-md ${
                    result.feasibilityScore.recommendation === 'GO' 
                      ? 'bg-emerald-600' 
                      : result.feasibilityScore.recommendation === 'CAUTION' 
                      ? 'bg-amber-500' 
                      : 'bg-rose-600'
                  }`}>
                    <span className="text-xl leading-none">{result.feasibilityScore.score}%</span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5">Score</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        result.feasibilityScore.recommendation === 'GO' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : result.feasibilityScore.recommendation === 'CAUTION' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        Decision: {result.feasibilityScore.recommendation}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-lg">
                      {result.feasibilityScore.riskSummary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end text-xs shrink-0 font-medium">
                  <span className="text-slate-400">Recommended Bid:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    ₹{result.feasibilityScore.suggestedBidRange?.recommended.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Range: ₹{result.feasibilityScore.suggestedBidRange?.min.toLocaleString('en-IN')} - ₹{result.feasibilityScore.suggestedBidRange?.max.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Sub Scores */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block text-[11px]">Technical Capability</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {result.feasibilityScore.technicalFitScore}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block text-[11px]">Timeline Feasibility</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {result.feasibilityScore.timelineFeasibilityScore}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block text-[11px]">Gross Margin Viability</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {result.feasibilityScore.marginFeasibilityScore}%
                  </span>
                </div>
              </div>

              {/* Compliance Matrix Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>AI Compliance & Risk Matrix ({result.complianceMatrix.length} Checkpoints)</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-left font-semibold border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 px-3">Requirement</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Risk Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.complianceMatrix.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {item.requirement}
                          </td>
                          <td className="py-2.5 px-3">
                            {item.compliant ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                                <XCircle className="h-3 w-3" /> Flagged
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {item.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parsed Deliverables & Tranches */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>Parsed Sprint Tranches ({result.recommendedTranches.length} Milestones)</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  {result.recommendedTranches.map(t => (
                    <div key={t.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                        <p className="text-[11px] text-slate-500">{t.dueTrigger}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">₹{t.amount.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-400 block">({t.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          {result ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResult(null)}
            >
              ← Edit Scope
            </Button>
          ) : (
            <div className="text-xs text-slate-500">
              Evaluates against market rates, standard deliverable capacity, and risk clauses.
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isEvaluating}
            >
              Cancel
            </Button>

            {!result ? (
              <Button
                size="sm"
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Analyzing Scope...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Calculate Bid Feasibility
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  onProceedToProposal({
                    title: title || 'Client Proposal & SOW',
                    clientName: clientName || 'Valued Client',
                    scopeText,
                    deliverables: result.parsedDeliverables,
                    tranches: result.recommendedTranches,
                    complianceMatrix: result.complianceMatrix,
                    feasibilityScore: result.feasibilityScore
                  })
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Proceed to Web Proposal Generator →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
