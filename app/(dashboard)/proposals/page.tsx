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
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { getProposalsAction } from './actions'
import { ProposalEvaluatorModal } from './ProposalEvaluatorModal'
import { ProposalBuilderModal } from './ProposalBuilderModal'
import type { Proposal, ScopeDeliverable, MilestoneTranche, ComplianceMatrixItem, BidFeasibilityScore } from '@/lib/proposal-types'
import Link from 'next/link'

export default function ProposalsDashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
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

  const totalPipeline = proposals.reduce((acc, p) => acc + p.totalAmount, 0)
  const signedCount = proposals.filter(p => p.status === 'signed' || p.status === 'converted').length
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
              Evaluate client RFPs with AI feasibility scoring, generate web proposals, and trigger ERP invoices upon touchscreen e-signature
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              Direct Proposal
            </Button>
            <Button
              size="sm"
              onClick={() => setIsEvaluatorOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
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
                {signedCount} signed contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500">
                Proposal Pipeline Value
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
                Avg. Bid Feasibility Score
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
                Closed-Loop ERP Automation
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Auto CRM Won & Advance Inv
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                100% automated upon signing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Proposals & Statement of Work</CardTitle>
                <CardDescription className="text-xs">
                  All active proposals, milestone tranches, and client e-signature statuses
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProposals}
                className="text-xs h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading proposals...</span>
              </div>
            ) : proposals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mx-auto">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Proposals Created Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Evaluate an RFP scope document or build a direct web proposal to send to your prospect.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsEvaluatorOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs mt-2"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Evaluate First RFP
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
                      <th className="py-3 px-3">Advance Tranche</th>
                      <th className="py-3 px-3">Win Score</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map(prop => {
                      const isSigned = prop.status === 'signed' || prop.status === 'converted'
                      return (
                        <tr key={prop.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            <div>{prop.projectTitle}</div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{prop.id.substring(0, 8)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            <div className="font-medium">{prop.clientName}</div>
                            <div className="text-[10px] text-slate-400">{prop.clientEmail}</div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            ₹{prop.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                            ₹{prop.advanceAmount.toLocaleString('en-IN')} ({prop.advancePercentage}%)
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {prop.feasibilityScore?.score || 85}% GO
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isSigned 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}>
                              {isSigned ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              <span className="capitalize">{prop.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
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
                              <Link
                                href={`/proposal/${prop.id}`}
                                target="_blank"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-colors"
                                title="Open Proposal Client View"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                              {prop.convertedInvoiceId && (
                                <Link
                                  href={`/invoices/${prop.convertedInvoiceId}`}
                                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                  View Inv →
                                </Link>
                              )}
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
