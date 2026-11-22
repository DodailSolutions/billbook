'use client'

import React, { useState } from 'react'
import { Sparkles, X, Wand2, ArrowRight, CheckCircle2, Layers, DollarSign, Clock } from 'lucide-react'
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
    }
  ]

  const handleApplySample = (sample: typeof samplePrompts[0]) => {
    setProjectTitle(sample.title)
    setRawBrief(sample.brief)
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>AI Proposal & SOW Draft Writer</span>
            </h3>
            <p className="text-xs text-slate-500">Provide a project brief and let AI structure scope, deliverables, and payment milestones</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Quick Preset Buttons */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Start with a Quick Preset
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Client / Company Name</label>
              <Input
                placeholder="e.g. Acme Global Inc."
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

          <div className="grid grid-cols-3 gap-3">
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
              Raw Scope Brief or RFP Excerpt
            </label>
            <textarea
              rows={4}
              value={rawBrief}
              onChange={(e) => setRawBrief(e.target.value)}
              placeholder="Paste RFP scope, client requirements, deliverables list, or bullet points..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !projectTitle.trim() || !rawBrief.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
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
  )
}
