'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck,
  Building2,
  RefreshCw,
  Download,
  Palette,
  UserCheck,
  Calendar,
  Percent,
  Printer,
  FileCode,
  Filter,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { getProposalsAction } from './actions'
import { ProposalEvaluatorModal } from './ProposalEvaluatorModal'
import { ProposalBuilderModal } from './ProposalBuilderModal'
import { ProposalBrandingModal } from './ProposalBrandingModal'
import { ProposalAssignFollowUpModal } from './ProposalAssignFollowUpModal'
import { AiProposalWriterModal } from './AiProposalWriterModal'
import { generateProposalWordHtml } from '@/lib/proposal-engine'
import type { 
  Proposal, 
  ScopeDeliverable, 
  MilestoneTranche, 
  ComplianceMatrixItem, 
  BidFeasibilityScore, 
  ProposalStatus 
} from '@/lib/proposal-types'
import Link from 'next/link'

export default function ProposalsDashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [stageFilter, setStageFilter] = useState<string>('all')
  
  // Modals
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isAiWriterOpen, setIsAiWriterOpen] = useState(false)
  const [brandingProposal, setBrandingProposal] = useState<Proposal | null>(null)
  const [assignProposal, setAssignProposal] = useState<Proposal | null>(null)

  const [builderInitialData, setBuilderInitialData] = useState<{
    title: string
    clientName: string
    scopeText: string
    deliverables: ScopeDeliverable[]
    tranches: MilestoneTranche[]
    complianceMatrix: ComplianceMatrixItem[]
    feasibilityScore: BidFeasibilityScore
  } | undefined>(undefined)

  const fetchProposals = async () => {
    setLoading(true)
    const data = await getProposalsAction()
    setProposals(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/proposal/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  // 1-Click Download Word (.doc)
  const handleDownloadWord = (proposal: Proposal, isDraft: boolean) => {
    const html = generateProposalWordHtml(proposal, isDraft)
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${proposal.projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${isDraft ? 'DRAFT' : 'FINAL'}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filtered proposals
  const filteredProposals = proposals.filter((p) => {
    if (stageFilter === 'all') return true
    return p.status === stageFilter
  })

  const totalPipeline = proposals.reduce((acc, p) => acc + p.totalAmount, 0)
  const signedCount = proposals.filter(p => p.status === 'signed' || p.status === 'converted' || p.status === 'accepted').length
  const avgFeasibility = proposals.length > 0 
    ? Math.round(proposals.reduce((acc, p) => acc + (p.feasibilityScore?.score || 75), 0) / proposals.length)
    : 85

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Phase 5 Engine
              </span>
              <span className="text-xs text-slate-400">• Universal All-Industry SOWs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-blue-600" />
              <span>AI Proposal & RFP / RFQ Evaluation Engine</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              AI drafting, Word/PDF downloads, custom branding, lifecycle tracking, and sales partner commission engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAiWriterOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Write with AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBuilderInitialData(undefined)
                setIsBuilderOpen(true)
              }}
              className="font-medium text-xs h-9"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Custom SOW
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEvaluatorOpen(true)}
              className="text-xs h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Evaluate RFP Scope
            </Button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500">
                Active Proposals
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {proposals.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {signedCount} accepted / signed contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500">
                Pipeline Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ₹{totalPipeline.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aggregate quoted SOWs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500">
                Avg. Bid Win Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {avgFeasibility}%
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                High Win Feasibility (GO)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500">
                Partner Commissions
              </CardTitle>
              <Percent className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Automated Sales Splits
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Salary + % hybrid cycles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Table Card with Stage Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">Proposals & Statement of Work Pipeline</CardTitle>
                <CardDescription className="text-xs">
                  Download Word & PDF documents, set custom brand headers, and track stage follow-ups
                </CardDescription>
              </div>

              {/* Stage Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'draft', label: 'Draft' },
                  { id: 'sent', label: 'Sent' },
                  { id: 'under_review', label: 'In Review' },
                  { id: 'accepted', label: 'Accepted' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'on_hold', label: 'On Hold' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStageFilter(st.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      stageFilter === st.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading proposals...</span>
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mx-auto">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Proposals in this Stage</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Write a proposal draft with AI or build a custom Statement of Work.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAiWriterOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs mt-2"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Write First Proposal with AI
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-left">
                      <th className="py-3 px-3">Project / Title</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Total Quoted</th>
                      <th className="py-3 px-3">Stage / Status</th>
                      <th className="py-3 px-3">Assigned Owner & Commission</th>
                      <th className="py-3 px-3 text-right">Downloads & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.map((prop) => {
                      const isSigned = prop.status === 'signed' || prop.status === 'converted' || prop.status === 'accepted'

                      return (
                        <tr key={prop.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            <div>{prop.projectTitle}</div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{prop.id.substring(0, 8)} • {prop.brandingSettings?.companyName || 'Standard'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            <div className="font-medium">{prop.clientName}</div>
                            <div className="text-[10px] text-slate-400">{prop.clientEmail}</div>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            <div>₹{prop.totalAmount.toLocaleString('en-IN')}</div>
                            <span className="text-[10px] font-normal text-slate-500">
                              Adv: ₹{prop.advanceAmount.toLocaleString('en-IN')} ({prop.advancePercentage}%)
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <button
                              onClick={() => setAssignProposal(prop)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-transform hover:scale-105 ${
                                prop.status === 'accepted' || isSigned
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : prop.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : prop.status === 'on_hold'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                              title="Click to update stage or follow-up"
                            >
                              <span className="capitalize">{prop.status.replace('_', ' ')}</span>
                            </button>
                            {prop.nextFollowUpDate && (
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Due: {prop.nextFollowUpDate}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            {prop.assignedToName ? (
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{prop.assignedToName}</span>
                                </div>
                                <span className="text-[10px] text-emerald-700 font-semibold block">
                                  {prop.commissionPercentage ? `${prop.commissionPercentage}% Comm (${prop.commissionPayFrequency || 'monthly'})` : 'Fixed salary'}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAssignProposal(prop)}
                                className="text-[11px] text-indigo-600 hover:underline font-medium"
                              >
                                + Assign Owner
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Branding Settings */}
                              <button
                                type="button"
                                onClick={() => setBrandingProposal(prop)}
                                title="Custom Branding & Header/Footer"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                              >
                                <Palette className="h-3.5 w-3.5 text-indigo-600" />
                              </button>

                              {/* Download Word Draft */}
                              <button
                                type="button"
                                onClick={() => handleDownloadWord(prop, true)}
                                title="Download Word (.doc) as DRAFT"
                                className="px-2 py-1 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 font-semibold text-[10px] transition-colors"
                              >
                                Word Draft
                              </button>

                              {/* Download Word Final */}
                              <button
                                type="button"
                                onClick={() => handleDownloadWord(prop, false)}
                                title="Download Word (.doc) as FINAL SOW"
                                className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 font-semibold text-[10px] transition-colors"
                              >
                                Word Final
                              </button>

                              {/* Copy Public Link */}
                              <button
                                type="button"
                                onClick={() => handleCopyLink(prop.id)}
                                title="Copy Client E-Sign Link"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                {copiedId === prop.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* View Online Proposal */}
                              <Link
                                href={`/proposal/${prop.id}`}
                                target="_blank"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-colors"
                                title="Open Proposal Client View / Print PDF"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Proposal Writer Modal */}
      {isAiWriterOpen && (
        <AiProposalWriterModal
          onClose={() => setIsAiWriterOpen(false)}
          onDraftGenerated={(draft) => {
            setIsAiWriterOpen(false)
            setBuilderInitialData(draft)
            setIsBuilderOpen(true)
          }}
        />
      )}

      {/* Branding Settings Modal */}
      {brandingProposal && (
        <ProposalBrandingModal
          proposal={brandingProposal}
          onClose={() => setBrandingProposal(null)}
          onSaved={(newBranding) => {
            setProposals(proposals.map(p => p.id === brandingProposal.id ? { ...p, brandingSettings: newBranding } : p))
          }}
        />
      )}

      {/* Assignment, Pipeline Stage & Commission Modal */}
      {assignProposal && (
        <ProposalAssignFollowUpModal
          proposal={assignProposal}
          onClose={() => setAssignProposal(null)}
          onSuccess={fetchProposals}
        />
      )}

      {/* Evaluator Modal */}
      {isEvaluatorOpen && (
        <ProposalEvaluatorModal
          onClose={() => setIsEvaluatorOpen(false)}
          onProceedToProposal={(evalData) => {
            setIsEvaluatorOpen(false)
            setBuilderInitialData(evalData)
            setIsBuilderOpen(true)
          }}
        />
      )}

      {/* Builder Modal */}
      {isBuilderOpen && (
        <ProposalBuilderModal
          initialData={builderInitialData}
          onClose={() => setIsBuilderOpen(false)}
          onSuccess={() => {
            setIsBuilderOpen(false)
            fetchProposals()
          }}
        />
      )}
    </div>
  )
}
