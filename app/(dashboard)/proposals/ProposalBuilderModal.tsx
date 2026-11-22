'use client'

import { useState } from 'react'
import { 
  FileText, 
  Send, 
  Loader2, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar,
  Building2,
  Mail,
  User,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createProposalAction } from './actions'
import type { 
  Proposal, 
  ScopeDeliverable, 
  MilestoneTranche, 
  ComplianceMatrixItem, 
  BidFeasibilityScore 
} from '@/lib/proposal-types'

interface ProposalBuilderModalProps {
  initialData?: {
    title: string
    clientName: string
    scopeText: string
    deliverables: ScopeDeliverable[]
    tranches: MilestoneTranche[]
    complianceMatrix: ComplianceMatrixItem[]
    feasibilityScore: BidFeasibilityScore
  }
  onClose: () => void
  onSuccess: (proposalId: string) => void
}

export function ProposalBuilderModal({ initialData, onClose, onSuccess }: ProposalBuilderModalProps) {
  const [projectTitle, setProjectTitle] = useState(initialData?.title || 'Custom SOW & Technical Proposal')
  const [clientName, setClientName] = useState(initialData?.clientName || '')
  const [clientEmail, setClientEmail] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [validUntilDays, setValidUntilDays] = useState('14')
  
  const [deliverables, setDeliverables] = useState<ScopeDeliverable[]>(
    initialData?.deliverables || [
      {
        id: 'deliv-1',
        title: 'Initial Discovery & Specifications',
        description: 'Requirements blueprint and scope lock.',
        estimatedHours: 20,
        amount: 50000
      }
    ]
  )

  const [tranches, setTranches] = useState<MilestoneTranche[]>(
    initialData?.tranches || [
      {
        id: 'tranche-1',
        title: 'Mobilization Advance',
        percentage: 40,
        amount: 40000,
        dueTrigger: 'Payable upon signing SOW contract'
      },
      {
        id: 'tranche-2',
        title: 'Midpoint Deliverable Signoff',
        percentage: 40,
        amount: 40000,
        dueTrigger: 'Payable upon Beta staging approval'
      },
      {
        id: 'tranche-3',
        title: 'Final Acceptance & Handover',
        percentage: 20,
        amount: 20000,
        dueTrigger: 'Payable upon production deployment'
      }
    ]
  )

  const [executiveSummary, setExecutiveSummary] = useState(
    `This proposal outlines the strategic objectives, technical scope, and milestone execution plan for ${projectTitle}. All deliverables will be governed under agile sprint cadence with transparent progress signoffs.`
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalAmount = deliverables.reduce((acc, d) => acc + (Number(d.amount) || 0), 0)
  const advancePercentage = tranches[0]?.percentage || 40
  const advanceAmount = Math.round(totalAmount * (advancePercentage / 100))

  const handleCreate = async () => {
    if (!clientName.trim() || !clientEmail.trim() || !projectTitle.trim()) {
      setError('Please provide Client Name, Client Email, and Project Title')
      return
    }

    setIsSubmitting(true)
    setError('')

    const validUntilDate = new Date(Date.now() + Number(validUntilDays) * 24 * 60 * 60 * 1000).toISOString()

    const newProposal: Omit<Proposal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      clientName,
      clientEmail,
      clientCompany: clientCompany || undefined,
      clientPhone: clientPhone || undefined,
      projectTitle,
      status: 'sent',
      currency,
      totalAmount,
      advancePercentage,
      advanceAmount,
      validUntil: validUntilDate,
      executiveSummary,
      scopeDeliverables: deliverables,
      milestoneTranches: tranches,
      complianceMatrix: initialData?.complianceMatrix || [],
      feasibilityScore: initialData?.feasibilityScore || undefined,
      termsAndConditions: [
        'Milestone deliverables require client signoff within 5 business days of staging handover.',
        'Mobilization advance is payable prior to codebase provisioning and sprint sprint tranches.',
        'Additional features outside this agreed SOW will be billed via mutual Change Order.'
      ]
    }

    const res = await createProposalAction(newProposal)
    if (res.success && res.id) {
      onSuccess(res.id)
    } else {
      setError(res.error || 'Failed to create proposal')
    }
    setIsSubmitting(false)
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
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Interactive Proposal & SOW Builder</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Ready for E-Sign
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate a web proposal link with touchscreen e-signature and automated advance invoice generation
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
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* Client Details Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Client & Project Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Title *
                </label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Client Contact Name *
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Client Email *
                </label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Company / Brand Name
                </label>
                <Input
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Acme Technologies Ltd"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Executive Summary & Scope Overview
            </label>
            <textarea
              rows={3}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Deliverables Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Scope Deliverables ({deliverables.length})
              </h4>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                Total: ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2">
              {deliverables.map((deliv, idx) => (
                <div key={deliv.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-900 dark:text-white block truncate">
                      {idx + 1}. {deliv.title}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {deliv.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      ₹{deliv.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Tranches */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Milestone Progress Tranches
              </h4>
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                Advance Deposit: {advancePercentage}% (₹{advanceAmount.toLocaleString('en-IN')})
              </span>
            </div>

            <div className="space-y-1.5">
              {tranches.map((t, i) => (
                <div key={t.id} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                    <span className="text-[11px] text-slate-500 block">{t.dueTrigger}</span>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{t.amount.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 block font-normal">({t.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="text-xs text-slate-500">
            Publishing creates a secure public e-signature link.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Generating Proposal...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Generate Proposal & Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
