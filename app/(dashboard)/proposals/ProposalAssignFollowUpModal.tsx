'use client'

import React, { useState } from 'react'
import { X, UserCheck, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, Percent } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Proposal, ProposalStatus } from '@/lib/proposal-types'
import { assignProposalAction, updateProposalStageAction } from './actions'
import { calculatePartnerCommission } from '@/lib/proposal-engine'

interface ProposalAssignFollowUpModalProps {
  proposal: Proposal
  onClose: () => void
  onSuccess: () => void
}

export function ProposalAssignFollowUpModal({ proposal, onClose, onSuccess }: ProposalAssignFollowUpModalProps) {
  // Stage state
  const [stage, setStage] = useState<ProposalStatus>(proposal.status || 'sent')
  const [followUpNotes, setFollowUpNotes] = useState(proposal.followUpNotes || '')
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    proposal.nextFollowUpDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  )

  // Assignment & Commission state
  const [assignedToName, setAssignedToName] = useState(proposal.assignedToName || '')
  const [assignedToType, setAssignedToType] = useState<'employee' | 'client_partner'>(proposal.assignedToType || 'employee')
  
  const [commissionType, setCommissionType] = useState<'salary_only' | 'percentage_only' | 'hybrid'>(
    proposal.commissionType || 'percentage_only'
  )
  const [baseSalary, setBaseSalary] = useState<number>(40000)
  const [commissionPercentage, setCommissionPercentage] = useState<number>(proposal.commissionPercentage || 8)
  const [commissionPayFrequency, setCommissionPayFrequency] = useState<'monthly' | 'weekly'>(
    proposal.commissionPayFrequency || 'monthly'
  )
  const [commissionBasis, setCommissionBasis] = useState<'per_project' | 'monthly_retainer' | 'deal_total'>(
    proposal.commissionBasis || 'per_project'
  )

  const [isSaving, setIsSaving] = useState(false)

  // Live Commission Preview Calculation
  const commissionCalc = calculatePartnerCommission({
    baseSalary,
    commissionType,
    commissionPercentage,
    dealOrProjectAmount: proposal.totalAmount,
    frequency: commissionPayFrequency,
    basis: commissionBasis
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Update Stage & Follow-up
      await updateProposalStageAction(proposal.id, stage, followUpNotes, nextFollowUpDate)

      // 2. Assign & Commission
      if (assignedToName.trim()) {
        await assignProposalAction(
          proposal.id,
          proposal.assignedToEmployeeId || `emp-${Date.now()}`,
          assignedToName,
          assignedToType,
          {
            commissionType,
            commissionPercentage,
            commissionAmount: commissionCalc.commissionEarned,
            commissionPayFrequency,
            commissionBasis
          }
        )
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Proposal Pipeline & Partner Commission</span>
            </h3>
            <p className="text-xs text-slate-500">{proposal.projectTitle} • Valuation: ₹{proposal.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Stage Selector */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Current Proposal Stage / Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {(['draft', 'sent', 'under_review', 'accepted', 'rejected', 'on_hold'] as ProposalStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStage(st)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center capitalize ${
                    stage === st
                      ? st === 'accepted' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : st === 'rejected' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : st === 'on_hold' ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up Scheduling */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Next Follow-Up Date
              </label>
              <Input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Follow-Up Touchpoint Note
              </label>
              <Input
                placeholder="e.g. Client reviewing SOW with CTO"
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Sales Employee / Partner Assignment */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" /> Deal Owner & Commission Structure
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Representative</label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Role Type</label>
                <select
                  value={assignedToType}
                  onChange={(e) => setAssignedToType(e.target.value as any)}
                  className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
                >
                  <option value="employee">In-House Sales / Business Dev</option>
                  <option value="client_partner">Client Partner / Independent Agent</option>
                </select>
              </div>
            </div>

            {/* Commission Scheme */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Compensation Model</label>
                <select
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value as any)}
                  className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
                >
                  <option value="percentage_only">Percentage Only (Pure Commission)</option>
                  <option value="hybrid">Salary + Percentage (Hybrid)</option>
                  <option value="salary_only">Salary Only (Fixed)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payout Frequency</label>
                <select
                  value={commissionPayFrequency}
                  onChange={(e) => setCommissionPayFrequency(e.target.value as any)}
                  className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
                >
                  <option value="monthly">Monthly Payout Cycle</option>
                  <option value="weekly">Weekly Settlement</option>
                </select>
              </div>
            </div>

            {commissionType !== 'salary_only' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Commission Rate ({commissionPercentage}%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={commissionPercentage}
                      onChange={(e) => setCommissionPercentage(parseInt(e.target.value) || 0)}
                      className="w-full accent-indigo-600"
                    />
                    <span className="font-bold text-indigo-700 min-w-[32px]">{commissionPercentage}%</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Earning Trigger</label>
                  <select
                    value={commissionBasis}
                    onChange={(e) => setCommissionBasis(e.target.value as any)}
                    className="w-full h-8 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
                  >
                    <option value="per_project">One-Time Per Project Signoff</option>
                    <option value="monthly_retainer">Recurring Monthly Retainer %</option>
                    <option value="deal_total">Gross Deal Collection %</option>
                  </select>
                </div>
              </div>
            )}

            {/* Live Commission Payout Box */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">Calculated Payout for this Deal:</span>
                <span className="font-bold text-base text-indigo-700 dark:text-indigo-300">
                  ₹{commissionCalc.commissionEarned.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {commissionCalc.breakdown}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
            {isSaving ? 'Updating...' : 'Save Pipeline & Commission'}
          </Button>
        </div>
      </div>
    </div>
  )
}
