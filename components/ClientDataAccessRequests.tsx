'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getClientDataAccessRequests,
  approveDataAccessRequest,
  rejectDataAccessRequest,
  revokeDataAccess,
} from '@/lib/ca-data-access-actions'
import type { CADataAccessRequest, DataAccessType } from '@/lib/hire-ca-types'
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
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  Calendar,
} from 'lucide-react'

const DATA_TYPE_LABELS: Record<DataAccessType, { label: string; icon: React.ReactNode }> = {
  invoices: { label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
  purchase_records: { label: 'Purchase Records', icon: <ShoppingCart className="w-4 h-4" /> },
  sales_records: { label: 'Sales Records', icon: <Store className="w-4 h-4" /> },
  bank_statements: { label: 'Bank Statements', icon: <Building2 className="w-4 h-4" /> },
  expense_records: { label: 'Expense Records', icon: <Receipt className="w-4 h-4" /> },
  gst_portal: { label: 'GST Portal', icon: <FileCheck className="w-4 h-4" /> },
  itr_portal: { label: 'ITR Portal', icon: <CreditCard className="w-4 h-4" /> },
  financial_statements: {
    label: 'Financial Statements',
    icon: <FolderOpen className="w-4 h-4" />,
  },
}

export default function ClientDataAccessRequests() {
  const [requests, setRequests] = useState<
    (CADataAccessRequest & {
      ca_name: string
      ca_firm_name?: string
      engagement_type: string
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [clientNotes, setClientNotes] = useState('')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    const data = await getClientDataAccessRequests()
    setRequests(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRequests()
  }, [loadRequests])

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId)
    const success = await approveDataAccessRequest(
      requestId,
      clientNotes.trim() || undefined
    )
    if (success) {
      await loadRequests()
      setClientNotes('')
      setSelectedRequest(null)
    }
    setProcessingId(null)
  }

  const handleReject = async (requestId: string) => {
    if (!clientNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    setProcessingId(requestId)
    const success = await rejectDataAccessRequest(requestId, clientNotes.trim())
    if (success) {
      await loadRequests()
      setClientNotes('')
      setSelectedRequest(null)
    }
    setProcessingId(null)
  }

  const handleRevoke = async (requestId: string) => {
    if (!confirm('Are you sure you want to revoke this data access?')) {
      return
    }
    setProcessingId(requestId)
    const success = await revokeDataAccess(requestId, clientNotes.trim() || undefined)
    if (success) {
      await loadRequests()
      setClientNotes('')
      setSelectedRequest(null)
    }
    setProcessingId(null)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'medium':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'revoked':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading data access requests...</p>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Data Access Requests</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your CA hasn&apos;t requested access to any data yet.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Your Data, Your Control
            </p>
            <p className="text-blue-800 dark:text-blue-200 text-xs">
              Review each request carefully. Approve only the data types necessary for the
              service. You can revoke access anytime.
            </p>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {requests.map((request) => (
        <Card key={request.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold">{request.ca_name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getUrgencyColor(
                    request.urgency
                  )}`}
                >
                  {request.urgency.toUpperCase()} PRIORITY
                </span>
              </div>
              {request.ca_firm_name && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {request.ca_firm_name}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Engagement: {request.engagement_type}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(request.requested_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Purpose:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{request.purpose}</p>
          </div>

          {/* Data Types Requested */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Data Types Requested:</h4>
            <div className="flex flex-wrap gap-2">
              {request.data_types_requested.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                >
                  <span className="text-blue-600 dark:text-blue-400">
                    {DATA_TYPE_LABELS[type].icon}
                  </span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {DATA_TYPE_LABELS[type].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Access Duration */}
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Duration: {request.access_duration_days} days</span>
            </div>
            {request.access_expires_at && (
              <div>
                Expires: {new Date(request.access_expires_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Specific Requirements */}
          {request.specific_requirements && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-1">Specific Requirements:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {request.specific_requirements}
              </p>
            </div>
          )}

          {/* Client Notes (if any) */}
          {request.client_notes && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-1">Your Notes:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{request.client_notes}</p>
            </div>
          )}

          {/* Actions */}
          {request.status === 'pending' && (
            <div className="mt-4 border-t pt-4">
              {selectedRequest === request.id ? (
                <div className="space-y-3">
                  <textarea
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Add notes for the CA (optional for approval, required for rejection)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-20 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Access
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(null)
                        setClientNotes('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setSelectedRequest(request.id)} className="w-full">
                  Review Request
                </Button>
              )}
            </div>
          )}

          {request.status === 'approved' && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Access Granted</span>
                  {request.access_expires_at && (
                    <span className="text-gray-600 dark:text-gray-400">
                      • Expires on {new Date(request.access_expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(request.id)}
                  disabled={processingId === request.id}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Revoke Access
                </Button>
              </div>
            </div>
          )}

          {request.status === 'rejected' && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Access Rejected on {new Date(request.reviewed_at!).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {request.status === 'revoked' && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Access Revoked on {new Date(request.revoked_at!).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
