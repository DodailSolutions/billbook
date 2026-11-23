'use client'

import React, { useState } from 'react'
import { X, Save, Edit3, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateEmployeeLeaveBalance } from '@/lib/payroll-actions'
import type { EmployeeLeaveBalance } from '@/lib/payroll-types'

interface EditLeaveBalanceModalProps {
  balance: EmployeeLeaveBalance
  employeeName: string
  onClose: () => void
  onSuccess: () => void
}

export function EditLeaveBalanceModal({
  balance,
  employeeName,
  onClose,
  onSuccess
}: EditLeaveBalanceModalProps) {
  const [allocatedDays, setAllocatedDays] = useState(balance.total_quota || 12)
  const [usedDays, setUsedDays] = useState(balance.used || 0)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = Math.max(0, allocatedDays - usedDays)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const res = await updateEmployeeLeaveBalance(balance.id, allocatedDays, usedDays)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || 'Failed to update leave quota')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              <span>Edit Leave Quota</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {employeeName} • {balance.leave_type?.name || 'Leave Allowance'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Annual Quota (Allocated Days)
            </label>
            <Input
              type="number"
              min={0}
              max={365}
              value={allocatedDays}
              onChange={(e) => setAllocatedDays(parseInt(e.target.value) || 0)}
              className="text-xs h-9"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Total allowed days per fiscal year for this leave category.</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Used / Availed Days
            </label>
            <Input
              type="number"
              min={0}
              max={allocatedDays}
              value={usedDays}
              onChange={(e) => setUsedDays(parseInt(e.target.value) || 0)}
              className="text-xs h-9"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Number of approved leave days already taken.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Remaining Balance:</span>
            <span className="font-bold text-sm text-emerald-600">{remaining} days</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-semibold"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
