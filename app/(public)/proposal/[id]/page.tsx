'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { 
  CheckCircle2, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  PenTool, 
  Loader2, 
  AlertCircle,
  Download,
  Calendar,
  DollarSign,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getProposalByIdAction, signProposalAction } from '@/app/(dashboard)/proposals/actions'
import type { Proposal } from '@/lib/proposal-types'
import Link from 'next/link'

export default function PublicProposalPage() {
  const params = useParams()
  const proposalId = params.id as string

  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [signerName, setSignerName] = useState('')
  const [signerDesignation, setSignerDesignation] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [signingSuccess, setSigningSuccess] = useState(false)
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false)

  useEffect(() => {
    async function load() {
      if (!proposalId) return
      setLoading(true)
      const data = await getProposalByIdAction(proposalId)
      setProposal(data)
      if (data?.clientName) {
        setSignerName(data.clientName)
      }
      setLoading(false)
    }
    load()
  }, [proposalId])

  // Canvas mouse/touch event handlers for touchscreen e-sign
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
    setHasDrawnSignature(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = '#1e3a8a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawnSignature(false)
  }

  const handleSign = async () => {
    if (!signerName.trim()) {
      setError('Please provide your full legal name')
      return
    }
    if (!agreeTerms) {
      setError('Please accept the SOW terms and conditions')
      return
    }

    setIsSigning(true)
    setError('')

    const signatureDataUrl = canvasRef.current?.toDataURL('image/png') || undefined

    const res = await signProposalAction(proposalId, {
      signerName,
      signerDesignation: signerDesignation || 'Authorized Representative',
      signerEmail: proposal?.clientEmail,
      signatureDataUrl
    })

    if (res.success) {
      setSigningSuccess(true)
      if (res.invoiceId) {
        setGeneratedInvoiceId(res.invoiceId)
      }
    } else {
      setError(res.error || 'Failed to submit e-signature. Please try again.')
    }
    setIsSigning(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Loading client proposal...</span>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Proposal Not Found</h2>
          <p className="text-xs text-slate-500">
            This proposal link may have expired or is invalid. Please contact the project administrator.
          </p>
        </div>
      </div>
    )
  }

  const isAlreadySigned = proposal.status === 'signed' || proposal.status === 'converted' || signingSuccess

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              BB
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">BillBook Client Portal</span>
              <span className="text-[11px] text-slate-400">Statement of Work & Master Services Agreement</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isAlreadySigned 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
            }`}>
              {isAlreadySigned ? '✓ Contract Executed & Signed' : 'Pending Client Signature'}
            </span>
          </div>
        </div>

        {/* Signed Success Alert */}
        {isAlreadySigned && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  Contract Digitally Executed!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Signed by {proposal.signature?.signerName || signerName} on {new Date().toLocaleDateString('en-IN')}.
                </p>
              </div>
            </div>
            {generatedInvoiceId && (
              <Link
                href={`/invoices/${generatedInvoiceId}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <span>View Advance Invoice</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Proposal Document Body */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-8">
          {/* Document Header */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-medium">
              <span>Proposal #{proposal.id.substring(0, 8)}</span>
              <span>Valid Until: {new Date(proposal.validUntil || Date.now()).toLocaleDateString('en-IN')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {proposal.projectTitle}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">Prepared For</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{proposal.clientName}</div>
                {proposal.clientCompany && <div className="text-slate-600 dark:text-slate-300 font-medium">{proposal.clientCompany}</div>}
                <div className="text-slate-400">{proposal.clientEmail}</div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">Investment & Pricing</span>
                  <div className="font-extrabold text-slate-900 dark:text-white text-xl font-mono">
                    ₹{proposal.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  Initial Advance: ₹{proposal.advanceAmount.toLocaleString('en-IN')} ({proposal.advancePercentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              1. Executive Summary & Scope of Work
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {proposal.executiveSummary}
            </p>
          </div>

          {/* Scope Deliverables */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              2. Deliverables & Specifications
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold text-left border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Deliverable</th>
                    <th className="py-2.5 px-4">Estimated Hours</th>
                    <th className="py-2.5 px-4 text-right">Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.scopeDeliverables.map((deliv, idx) => (
                    <tr key={deliv.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{deliv.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{deliv.description}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {deliv.estimatedHours || 20} hrs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{deliv.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Milestone Tranches */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              3. Milestone Progress Tranches & Billing Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {proposal.milestoneTranches.map((t, idx) => (
                <div key={t.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Tranche #{idx + 1}</span>
                    <span className="font-bold text-slate-500">{t.percentage}%</span>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-lg font-mono">
                    ₹{t.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {t.title}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {t.dueTrigger}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              4. Standard Contract Terms
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              {proposal.termsAndConditions.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>

          {/* E-Signature Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenTool className="h-4 w-4 text-blue-600" />
              <span>Digital E-Signature & Execution</span>
            </h3>

            {!isAlreadySigned ? (
              <div className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Legal Name *
                    </label>
                    <Input
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Johnathan Smith"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Designation / Role
                    </label>
                    <Input
                      value={signerDesignation}
                      onChange={(e) => setSignerDesignation(e.target.value)}
                      placeholder="e.g. Managing Director"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Touchscreen Drawing Canvas */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Sign Below (Touchscreen or Mouse)
                    </span>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] underline"
                    >
                      Clear
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-crosshair touch-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Draw your signature above to bind this Statement of Work.
                  </span>
                </div>

                {/* Agree Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-slate-600 dark:text-slate-400">
                    I confirm that I am authorized to execute this agreement and accept the deliverables, milestone billing tranches, and terms outlined above.
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSign}
                  disabled={isSigning || !agreeTerms}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-lg"
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing & Provisioning Project...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept & Digitally Sign SOW
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Verified Signature</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {proposal.signature?.signerName || signerName}
                </div>
                <div className="text-xs text-slate-500">
                  {proposal.signature?.signerDesignation || 'Authorized Signatory'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Timestamp: {proposal.signature?.signedAt || new Date().toISOString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
