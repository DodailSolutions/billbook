'use client'

import React, { useState } from 'react'
import { X, Palette, Stamp, FileText, Check, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Proposal, ProposalBrandingSettings } from '@/lib/proposal-types'
import { updateProposalBrandingAction } from './actions'

interface ProposalBrandingModalProps {
  proposal: Proposal
  onClose: () => void
  onSaved: (updatedBranding: ProposalBrandingSettings) => void
}

export function ProposalBrandingModal({ proposal, onClose, onSaved }: ProposalBrandingModalProps) {
  const current = proposal.brandingSettings || {}

  const [companyName, setCompanyName] = useState(current.companyName || 'BillBook Digital Agency')
  const [headerText, setHeaderText] = useState(current.headerText || `${companyName} • Confidential Statement of Work`)
  const [footerText, setFooterText] = useState(current.footerText || `Confidential • Powered by BillBook AI Proposal Engine • Page `)
  const [pageNumberingFormat, setPageNumberingFormat] = useState<'page_x_of_y' | 'page_x' | 'none'>(current.pageNumberingFormat || 'page_x_of_y')
  const [accentColor, setAccentColor] = useState(current.accentColor || '#1e3a8a')
  const [watermarkType, setWatermarkType] = useState<'none' | 'draft' | 'confidential' | 'custom'>(current.watermarkType || (proposal.status === 'draft' ? 'draft' : 'none'))
  const [watermarkCustomText, setWatermarkCustomText] = useState(current.watermarkCustomText || 'CONFIDENTIAL')
  const [isSaving, setIsSaving] = useState(false)

  const colorPresets = [
    { name: 'Navy Blue', hex: '#1e3a8a' },
    { name: 'Indigo', hex: '#4338ca' },
    { name: 'Emerald', hex: '#047857' },
    { name: 'Slate Dark', hex: '#0f172a' },
    { name: 'Purple', hex: '#7e22ce' },
    { name: 'Rose', hex: '#be123c' }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    const branding: ProposalBrandingSettings = {
      companyName,
      headerText,
      footerText,
      pageNumberingFormat,
      accentColor,
      watermarkType,
      watermarkCustomText
    }

    const res = await updateProposalBrandingAction(proposal.id, branding)
    setIsSaving(false)
    if (res.success) {
      onSaved(branding)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" />
              <span>Proposal Branding & Layout Settings</span>
            </h3>
            <p className="text-xs text-slate-500">Configure header, footer, watermarks, and typography accent</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company / Agency Display Name</label>
            <Input
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                setHeaderText(`${e.target.value} • Confidential Statement of Work`)
              }}
              className="text-xs h-8"
              placeholder="e.g. Apex Software & Cloud Labs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Running Header Text</label>
            <Input
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="text-xs h-8"
              placeholder="Appears on every page top in Word & PDF"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Running Footer & Compliance Notice</label>
            <Input
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="text-xs h-8"
              placeholder="Appears at page bottom"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Page Numbering</label>
              <select
                value={pageNumberingFormat}
                onChange={(e) => setPageNumberingFormat(e.target.value as any)}
                className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
              >
                <option value="page_x_of_y">Page X of Y (e.g. Page 1 of 4)</option>
                <option value="page_x">Page X (e.g. Page 1)</option>
                <option value="none">No Page Numbers</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Document Watermark</label>
              <select
                value={watermarkType}
                onChange={(e) => setWatermarkType(e.target.value as any)}
                className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
              >
                <option value="none">None (Clean Official)</option>
                <option value="draft">DRAFT (Diagonal Watermark)</option>
                <option value="confidential">CONFIDENTIAL</option>
                <option value="custom">Custom Text Watermark</option>
              </select>
            </div>
          </div>

          {watermarkType === 'custom' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Custom Watermark Text</label>
              <Input
                value={watermarkCustomText}
                onChange={(e) => setWatermarkCustomText(e.target.value)}
                className="text-xs h-8"
                placeholder="e.g. STRICTLY PRIVATE"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Primary Accent Color</label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAccentColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform ${
                    accentColor === c.hex ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {accentColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 p-0 ml-2"
                title="Custom Hex Color"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
            {isSaving ? 'Saving...' : 'Apply Branding to Proposal'}
          </Button>
        </div>
      </div>
    </div>
  )
}
