'use client'

import React, { useState, useRef } from 'react'
import { 
  Sparkles, 
  X, 
  Wand2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  Clock, 
  UploadCloud, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Check, 
  FileCheck 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateAiProposalDraftAction } from './actions'
import type { ScopeDeliverable, MilestoneTranche, ComplianceMatrixItem, BidFeasibilityScore } from '@/lib/proposal-types'

interface AiProposalWriterModalProps {
  onClose: () => void
  onDraftGenerated: (draft: {
    title: string
    clientName: string
    scopeText: string
    deliverables: ScopeDeliverable[]
    tranches: MilestoneTranche[]
    complianceMatrix: ComplianceMatrixItem[]
    feasibilityScore: BidFeasibilityScore
  }) => void
}

export function AiProposalWriterModal({ onClose, onDraftGenerated }: AiProposalWriterModalProps) {
  const [clientName, setClientName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [industryVertical, setIndustryVertical] = useState('software')
  const [targetBudget, setTargetBudget] = useState(150000)
  const [timelineWeeks, setTimelineWeeks] = useState(4)
  const [rawBrief, setRawBrief] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isParsingFile, setIsParsingFile] = useState(false)

  const samplePrompts = [
    {
      title: 'Digital Marketing & Ads Retainer',
      brief: 'Comprehensive Google Ads and Meta Ads management, weekly performance optimization, 12 SEO blogs per month, monthly conversion reporting, and high-converting landing page A/B testing.'
    },
    {
      title: 'Full-Stack Next.js Web App MVP',
      brief: 'Design and engineering of an interactive web application with Supabase authentication, role-based dashboards, Stripe/Razorpay payment integration, and mobile-responsive UI in Tailwind CSS.'
    },
    {
      title: 'Brand Identity & Social Media Package',
      brief: 'Complete corporate visual identity guidelines, logo variants, typography palette, 30 branded social media templates, and business stationery designs.'
    },
    {
      title: 'Enterprise IT Support & Cloud SLA',
      brief: '24/7 cloud infrastructure monitoring, AWS/Azure server management, security patching, guaranteed 15-minute emergency response time, and disaster recovery backup audits.'
    }
  ]

  const handleApplySample = (sample: typeof samplePrompts[0]) => {
    setProjectTitle(sample.title)
    setRawBrief(sample.brief)
  }

  // Handle Document Upload (PDF, Word, Text, RFP)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setIsParsingFile(true)

    // Infer title and client name from file name if blank
    const cleanBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ")
    if (!projectTitle) {
      setProjectTitle(cleanBaseName)
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content && typeof content === 'string') {
        // Extract plausible details from text
        const snippet = content.slice(0, 3000)
        setRawBrief((prev) => prev ? `${prev}\n\n[Uploaded RFP Doc: ${file.name}]\n${snippet}` : snippet)

        // Simple regex heuristics for client name or budget if found
        const clientMatch = snippet.match(/(?:Client|Organization|Company|Prepared for):\s*([^\n\r]+)/i)
        if (clientMatch && clientMatch[1] && !clientName) {
          setClientName(clientMatch[1].trim())
        }

        const budgetMatch = snippet.match(/(?:Budget|Estimated Cost|Total Value|Fee):\s*(?:INR|₹|Rs\.?)\s*([\d,]+)/i)
        if (budgetMatch && budgetMatch[1]) {
          const parsed = parseInt(budgetMatch[1].replace(/,/g, ''))
          if (!isNaN(parsed) && parsed > 0) setTargetBudget(parsed)
        }
      }
      setIsParsingFile(false)
    }

    reader.onerror = () => {
      setRawBrief((prev) => `${prev ? prev + '\n\n' : ''}[Attached Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nScope items extracted from RFP requirements.`)
      setIsParsingFile(false)
    }

    // Read as text
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    if (!projectTitle.trim() || !rawBrief.trim()) return

    setIsGenerating(true)
    try {
      const res = await generateAiProposalDraftAction({
        clientName,
        projectTitle,
        industryVertical,
        rawBrief,
        targetBudget,
        timelineWeeks
      })

      if (res.success && res.data) {
        onDraftGenerated({
          title: res.data.title,
          clientName: res.data.clientName,
          scopeText: rawBrief,
          deliverables: res.data.deliverables,
          tranches: res.data.tranches,
          complianceMatrix: res.data.complianceMatrix,
          feasibilityScore: res.data.feasibilityScore
        })
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>AI Proposal & SOW Draft Writer</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Write professional client proposals from scratch or upload an RFP to auto-generate scope, deliverables & milestone tranches.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible Guide: How to Write Winning Proposals */}
        <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-3 flex items-center justify-between text-left font-semibold text-purple-900 dark:text-purple-300 hover:bg-purple-100/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              How to Write & Structure a High-Converting Proposal with AI
            </span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showGuide && (
            <div className="p-3 pt-0 border-t border-purple-200/60 dark:border-purple-900/40 space-y-2 text-purple-950 dark:text-purple-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <p className="font-bold text-purple-700 dark:text-purple-400 mb-0.5">1. Define Client Objective</p>
                  <p className="text-slate-600 dark:text-slate-400">Briefly state the client's current challenge, required business outcomes, and key KPIs.</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <p className="font-bold text-purple-700 dark:text-purple-400 mb-0.5">2. Concrete Deliverables</p>
                  <p className="text-slate-600 dark:text-slate-400">AI automatically itemizes deliverables into clear scope items to prevent scope creep.</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <p className="font-bold text-purple-700 dark:text-purple-400 mb-0.5">3. Milestone Tranches</p>
                  <p className="text-slate-600 dark:text-slate-400">Break project fees into advance deposit (e.g. 30%), milestone progress, and final signoff.</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <p className="font-bold text-purple-700 dark:text-purple-400 mb-0.5">4. One-Click Word & PDF Export</p>
                  <p className="text-slate-600 dark:text-slate-400">Export as Draft or Final Word (.doc) / PDF with your custom branding header and footer.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Client RFP / RFQ File */}
        <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.doc,.docx,.pdf,.md,.rtf,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg text-purple-600 dark:text-purple-400 shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {uploadedFileName ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <FileCheck className="w-4 h-4" /> {uploadedFileName}
                    </span>
                  ) : (
                    'Upload Client RFP / RFQ / Scope Document'
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  Upload PDF, Word, or Text tender specifications to auto-parse requirements
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isParsingFile}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 shrink-0 w-full sm:w-auto"
            >
              {isParsingFile ? 'Reading...' : uploadedFileName ? 'Change File' : 'Browse File'}
            </Button>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Quick Preset Buttons */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Or Start with an Industry Preset
            </label>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(s)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Client / Company Name</label>
              <Input
                placeholder="e.g. Acme Global Technologies"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Project / SOW Title</label>
              <Input
                placeholder="e.g. Q1 Growth & SEO Retainer"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Industry Vertical</label>
              <select
                value={industryVertical}
                onChange={(e) => setIndustryVertical(e.target.value)}
                className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
              >
                <option value="software">IT & Software</option>
                <option value="digital_marketing">Digital Marketing</option>
                <option value="consulting">Consulting & Strategy</option>
                <option value="creative">Creative & Design</option>
                <option value="general">General Commercial</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Budget (₹)</label>
              <Input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(parseInt(e.target.value) || 0)}
                className="text-xs h-8"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Timeline (Weeks)</label>
              <Input
                type="number"
                min={1}
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(parseInt(e.target.value) || 1)}
                className="text-xs h-8"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Raw Scope Brief or RFP Requirements
            </label>
            <textarea
              rows={4}
              value={rawBrief}
              onChange={(e) => setRawBrief(e.target.value)}
              placeholder="Paste RFP scope, client requirements, deliverables list, technical specs, or bullet points..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            Generates executive summary, milestone tranches, and compliance matrices
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" onClick={onClose} className="text-xs h-8 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !projectTitle.trim() || !rawBrief.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 w-full sm:w-auto font-semibold"
            >
              {isGenerating ? (
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 animate-spin" /> Drafting Proposal...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Generate Proposal Draft
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
