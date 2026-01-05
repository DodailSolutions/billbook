'use client'

import { checkPasswordStrength } from '@/lib/validation/auth'
import { Check, AlertCircle } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
    password: string
    showFeedback?: boolean
}

export function PasswordStrengthIndicator({ password, showFeedback = true }: PasswordStrengthIndicatorProps) {
    const strength = checkPasswordStrength(password)

    const getStrengthColor = (score: number) => {
        switch (score) {
            case 0:
                return 'bg-gray-300'
            case 1:
                return 'bg-red-500'
            case 2:
                return 'bg-orange-500'
            case 3:
                return 'bg-yellow-500'
            case 4:
                return 'bg-emerald-500'
            default:
                return 'bg-gray-300'
        }
    }

    const getStrengthLabel = (score: number) => {
        const labels = ['None', 'Very Weak', 'Weak', 'Fair', 'Strong']
        return labels[score] || 'None'
    }

    const getStrengthLabelColor = (score: number) => {
        switch (score) {
            case 0:
                return 'text-gray-600 dark:text-gray-400'
            case 1:
                return 'text-red-600 dark:text-red-400'
            case 2:
                return 'text-orange-600 dark:text-orange-400'
            case 3:
                return 'text-yellow-600 dark:text-yellow-400'
            case 4:
                return 'text-emerald-600 dark:text-emerald-400'
            default:
                return 'text-gray-600 dark:text-gray-400'
        }
    }

    if (!password) {
        return null
    }

    return (
        <div className="space-y-2 mt-3 animate-in fade-in-50">
            {/* Strength bar */}
            <div className="flex gap-2 items-center">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${getStrengthColor(strength.score)}`}
                        style={{ width: `${((strength.score + 1) / 5) * 100}%` }}
                    ></div>
                </div>
                <span className={`text-xs font-semibold ${getStrengthLabelColor(strength.score)}`}>
                    {getStrengthLabel(strength.score)}
                </span>
            </div>

            {/* Feedback */}
            {showFeedback && strength.feedback.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 space-y-1">
                    {strength.feedback.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-200">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {item}
                        </div>
                    ))}
                </div>
            )}

            {/* Success state */}
            {strength.isStrong && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded p-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Password strength is good</span>
                </div>
            )}
        </div>
    )
}
