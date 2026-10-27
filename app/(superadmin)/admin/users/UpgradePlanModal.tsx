'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Crown, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  billing_period: string
}

interface UpgradePlanModalProps {
  userId: string
  userEmail: string
  currentPlan?: string
  plans: Plan[]
  onClose: () => void
  onSuccess: () => void
}

export function UpgradePlanModal({ 
  userId, 
  userEmail, 
  currentPlan,
  plans = [], 
  onClose, 
  onSuccess 
}: UpgradePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [duration, setDuration] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError('Please select a target plan to assign')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users/upgrade-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: selectedPlan,
          duration: Number(duration) || 30,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade plan')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade user plan')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  const calculateEndDate = () => {
    try {
      const d = new Date(Date.now() + (Number(duration) || 30) * 24 * 60 * 60 * 1000)
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Modify Subscription Plan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px] sm:max-w-[360px]">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Current Plan Badge */}
          {currentPlan && (
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Current Active Plan:</span>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-200 bg-white dark:bg-blue-900/50 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-800/80">
                {currentPlan}
              </span>
            </div>
          )}

          {/* Select Plan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Select Target Plan
            </label>
            {plans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3.5 rounded-2xl text-left border-2 transition-all relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {plan.name}
                        </h3>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        ₹{plan.price}{' '}
                        <span className="text-[11px] text-slate-400 font-normal">
                          / {plan.billing_period === 'lifetime' ? 'lifetime' : plan.billing_period}
                        </span>
                      </p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                No active plans currently configured.
              </div>
            )}
          </div>

          {/* Duration in Days */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Validity Duration (Days)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[30, 90, 180, 365].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDuration(days)}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                    duration === days
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              className="text-xs"
              placeholder="Or enter custom number of days"
              min="1"
            />
          </div>

          {/* Upgrade Summary */}
          {selectedPlanData && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Selected Plan:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedPlanData.name}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Validity:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{duration} days</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Calculated End Date:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{calculateEndDate()}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 text-xs"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpgrade}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs"
              disabled={isLoading || !selectedPlan}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Applying Upgrade...
                </>
              ) : (
                'Confirm & Apply Plan'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
