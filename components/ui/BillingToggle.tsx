'use client'

import { useState } from 'react'

interface BillingToggleProps {
  onToggle?: (isYearly: boolean) => void
  defaultYearly?: boolean
}

export function BillingToggle({ onToggle, defaultYearly = false }: BillingToggleProps) {
  const [isYearly, setIsYearly] = useState(defaultYearly)

  const handleToggle = () => {
    const newValue = !isYearly
    setIsYearly(newValue)
    onToggle?.(newValue)
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        Monthly
      </span>
      
      <button
        onClick={handleToggle}
        className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        style={{
          backgroundColor: isYearly ? '#10b981' : '#d1d5db'
        }}
        role="switch"
        aria-checked={isYearly}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
            isYearly ? 'translate-x-9' : 'translate-x-1'
          }`}
        />
      </button>
      
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          Yearly
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          Save 17%
        </span>
      </div>
    </div>
  )
}
