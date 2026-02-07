'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createDataAccessRequest } from '@/lib/ca-data-access-actions'
import type { DataAccessType } from '@/lib/hire-ca-types'
import {
  FileText,
  Building2,
  Receipt,
  CreditCard,
  FileCheck,
  FolderOpen,
  ShoppingCart,
  Store,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface RequestDataAccessProps {
  engagementId: string
  hasCompletedPayment: boolean
  onSuccess?: () => void
}

const DATA_TYPES: {
  value: DataAccessType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: 'invoices',
    label: 'Invoices',
    description: 'Access to sales invoices and billing records',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    value: 'purchase_records',
    label: 'Purchase Records',
    description: 'Purchase orders and vendor invoices',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    value: 'sales_records',
    label: 'Sales Records',
    description: 'Sales reports and transaction history',
    icon: <Store className="w-5 h-5" />,
  },
  {
    value: 'bank_statements',
    label: 'Bank Statements',
    description: 'Bank account statements and transactions',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: 'expense_records',
    label: 'Expense Records',
    description: 'Business expenses and reimbursements',
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    value: 'gst_portal',
    label: 'GST Portal Access',
    description: 'Access to file GST returns (GSTR-1, GSTR-3B)',
    icon: <FileCheck className="w-5 h-5" />,
  },
  {
    value: 'itr_portal',
    label: 'Income Tax Portal Access',
    description: 'Access to file income tax returns',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    value: 'financial_statements',
    label: 'Financial Statements',
    description: 'P&L, Balance Sheet, Cash Flow statements',
    icon: <FolderOpen className="w-5 h-5" />,
  },
]

export default function RequestDataAccess({
  engagementId,
  hasCompletedPayment,
  onSuccess,
}: RequestDataAccessProps) {
  const [selectedTypes, setSelectedTypes] = useState<DataAccessType[]>([])
  const [purpose, setPurpose] = useState('')
  const [duration, setDuration] = useState(90)
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleToggleType = (type: DataAccessType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one data type')
      return
    }

    if (!purpose.trim()) {
      setError('Please provide a purpose for data access')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await createDataAccessRequest({
        engagement_id: engagementId,
        data_types_requested: selectedTypes,
        purpose: purpose.trim(),
        access_duration_days: duration,
        urgency,
        specific_requirements: requirements.trim() || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (!hasCompletedPayment) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Required</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please complete the payment for this engagement before requesting data access.
        </p>
        <p className="text-sm text-gray-500">
          Once payment is confirmed, you&apos;ll be able to request access to client data for
          filing GST, tax returns, and other services.
        </p>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Request Submitted</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your data access request has been sent to the client for approval.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Request Data Access</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Request access to client data needed for GST filing, tax returns, or other services.
          Client will review and approve your request.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Data Types Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">
          Select Data Types Needed <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATA_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleToggleType(type.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedTypes.includes(type.value)
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 ${
                    selectedTypes.includes(type.value)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400'
                  }`}
                >
                  {type.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{type.label}</h4>
                    {selectedTypes.includes(type.value) && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Purpose of Data Access <span className="text-red-600">*</span>
        </label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Example: Required for filing monthly GST returns (GSTR-1 and GSTR-3B) for January 2026"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-25"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{purpose.length}/500 characters</p>
      </div>

      {/* Access Duration and Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Access Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days (Recommended)</option>
            <option value={180}>180 days</option>
            <option value={365}>1 year</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            How long do you need access to this data?
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="low">Low - Routine work</option>
            <option value="medium">Medium - Regular deadline</option>
            <option value="high">High - Urgent filing deadline</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Priority level for this request</p>
        </div>
      </div>

      {/* Specific Requirements */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Specific Requirements (Optional)
        </label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Any specific requirements or instructions? (e.g., 'Need access to invoices from January 1-31, 2026 only')"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-20"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">{requirements.length}/300 characters</p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              What happens next?
            </p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>• Client will receive notification about your request</li>
              <li>• They can review and approve/reject within 24-48 hours</li>
              <li>• Once approved, you&apos;ll get immediate access to requested data</li>
              <li>• Access will automatically expire after the selected duration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedTypes([])
            setPurpose('')
            setRequirements('')
            setError(null)
          }}
          disabled={loading}
        >
          Clear
        </Button>
        <Button onClick={handleSubmit} disabled={loading || selectedTypes.length === 0}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </Card>
  )
}
