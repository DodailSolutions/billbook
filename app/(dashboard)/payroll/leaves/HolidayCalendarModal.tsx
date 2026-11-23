'use client'

import React, { useState } from 'react'
import { X, Calendar, Plus, Save, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CompanyHoliday } from '@/lib/payroll-actions'

interface HolidayCalendarModalProps {
  onClose: () => void
  onHolidayAdded: (holiday: CompanyHoliday) => void
}

export function HolidayCalendarModal({ onClose, onHolidayAdded }: HolidayCalendarModalProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<'national' | 'festival' | 'optional' | 'corporate'>('festival')
  const [isPaid, setIsPaid] = useState(true)
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !date) return

    const newHoliday: CompanyHoliday = {
      id: `hol-${Date.now()}`,
      name: name.trim(),
      date,
      type,
      is_paid: isPaid,
      description: description.trim() || undefined
    }

    onHolidayAdded(newHoliday)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Add Company Holiday</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Declare an official paid or optional public holiday on the corporate calendar.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Holiday Name *
            </label>
            <Input
              placeholder="e.g. Annual Company Retreat or Eid / Diwali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Holiday Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category / Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-9 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2"
              >
                <option value="national">National Statutory</option>
                <option value="festival">Cultural / Festival</option>
                <option value="corporate">Company Event / Offsite</option>
                <option value="optional">Optional / Floating</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description / Notes (Optional)
            </label>
            <Input
              placeholder="e.g. Paid holiday for all full-time team members"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <input
              type="checkbox"
              id="isPaidHoliday"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isPaidHoliday" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Paid Holiday (Protected from LOP salary deduction)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !date}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Holiday
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
