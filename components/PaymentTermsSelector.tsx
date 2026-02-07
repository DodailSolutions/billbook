'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Settings } from 'lucide-react'

interface PaymentTerm {
  id: string
  label: string
  days: number | null
  description?: string
}

interface PaymentTermsSelectorProps {
  value: string
  onChange: (termId: string, days: number | null) => void
  onConfigureClick?: () => void
  label?: string
}

const DEFAULT_TERMS: PaymentTerm[] = [
  { id: 'due_on_receipt', label: 'Due on Receipt', days: 0, description: 'Payment due immediately' },
  { id: 'due_end_month', label: 'Due end of next month', days: null },
  { id: 'due_end_of_month', label: 'Due end of the month', days: null },
  { id: 'net_15', label: 'Net 15', days: 15, description: 'Payment due in 15 days' },
  { id: 'net_30', label: 'Net 30', days: 30, description: 'Payment due in 30 days' },
  { id: 'net_45', label: 'Net 45', days: 45, description: 'Payment due in 45 days' },
  { id: 'net_60', label: 'Net 60', days: 60, description: 'Payment due in 60 days' },
]

export function PaymentTermsSelector({
  value,
  onChange,
  onConfigureClick,
  label = 'Terms',
}: PaymentTermsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedTerm = DEFAULT_TERMS.find((term) => term.id === value)

  const filteredTerms = DEFAULT_TERMS.filter((term) =>
    term.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTermSelect = (term: PaymentTerm) => {
    onChange(term.id, term.days)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* Main Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-between w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:border-blue-500"
      >
        <span className={selectedTerm ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
          {selectedTerm ? selectedTerm.label : 'Select payment terms'}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm"
              autoFocus
            />
          </div>

          {/* Terms List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                onClick={() => handleTermSelect(term)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  value === term.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {term.label}
                    </div>
                    {term.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {term.description}
                      </div>
                    )}
                  </div>
                  {value === term.id && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Configure Terms Button */}
          {onConfigureClick && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onConfigureClick()
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Configure Terms</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
