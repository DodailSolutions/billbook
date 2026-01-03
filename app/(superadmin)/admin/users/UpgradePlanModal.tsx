'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Crown, Loader2, X } from 'lucide-react'

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
  plans, 
  onClose, 
  onSuccess 
}: UpgradePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [duration, setDuration] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      setError('Please select a plan')
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
          duration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade plan')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade plan')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Crown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upgrade User Plan
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Plan */}
          {currentPlan && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Current Plan: <span className="font-semibold">{currentPlan}</span>
              </p>
            </div>
          )}

          {/* Select Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select New Plan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedPlan === plan.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{plan.price}/{plan.billing_period === 'lifetime' ? 'one-time' : plan.billing_period}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Duration (Days)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 90, 180, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setDuration(days)}
                  className={`py-2 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    duration === days
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={duration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(parseInt(e.target.value) || 30)}
              className="mt-2"
              placeholder="Custom days"
              min="1"
            />
          </div>

          {/* Summary */}
          {selectedPlanData && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Summary</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Plan: <span className="font-medium text-gray-900 dark:text-white">{selectedPlanData.name}</span></p>
                <p>Duration: <span className="font-medium text-gray-900 dark:text-white">{duration} days</span></p>
                <p>End Date: <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span></p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading || !selectedPlan}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                'Upgrade Plan'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
