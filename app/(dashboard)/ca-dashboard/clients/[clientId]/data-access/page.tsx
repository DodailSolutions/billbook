'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import RequestDataAccess from '@/components/RequestDataAccess'
import {
  getCADataAccessRequests,
  getCAActiveAccess,
} from '@/lib/ca-data-access-actions'
import type { CADataAccessRequest, CADataAccess } from '@/lib/hire-ca-types'
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Calendar,
  FileText,
} from 'lucide-react'

export default function CADataAccessPage({ params }: { params: { clientId: string } }) {
  const [requests, setRequests] = useState<
    (CADataAccessRequest & { client_name: string; engagement_type: string })[]
  >([])
  const [activeAccess, setActiveAccess] = useState<CADataAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [engagementId, setEngagementId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [requestsData, accessData] = await Promise.all([
      getCADataAccessRequests(),
      getCAActiveAccess(params.clientId),
    ])
    setRequests(requestsData)
    setActiveAccess(accessData)
    
    // Check if there's a completed payment for this client's engagement
    // For now, we'll just set to true - in production, check actual payment status
    setPaymentVerified(true)
    // Get engagement ID from first request or create new one
    if (requestsData.length > 0) {
      setEngagementId(requestsData[0].engagement_id)
    }
    
    setLoading(false)
  }, [params.clientId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'revoked':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading data access information...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Link href={`/ca-dashboard/clients/${params.clientId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Client
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Client Data Access</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Request and manage access to client data for GST filing, tax returns, and services.
        </p>
      </div>

      {/* Request New Access */}
      {!showRequestForm ? (
        <div className="mb-6">
          <Button onClick={() => setShowRequestForm(true)}>
            <Shield className="w-4 h-4 mr-2" />
            Request Data Access
          </Button>
        </div>
      ) : (
        <div className="mb-6">
          <RequestDataAccess
            engagementId={engagementId || params.clientId} // Use engagement ID or client ID as fallback
            hasCompletedPayment={paymentVerified}
            onSuccess={() => {
              setShowRequestForm(false)
              loadData()
            }}
          />
          <Button
            variant="ghost"
            onClick={() => setShowRequestForm(false)}
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Active Access */}
      {activeAccess.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Data Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccess.map((access) => (
              <Card key={access.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">{access.data_type.replace(/_/g, ' ')}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-semibold">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Can View:</span>
                    <span className="font-medium">
                      {access.can_view ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Can Download:</span>
                    <span className="font-medium">
                      {access.can_download ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Can Edit:</span>
                    <span className="font-medium">
                      {access.can_edit ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Expires: {new Date(access.access_end_date).toLocaleDateString()}
                    </span>
                  </div>
                  {access.last_accessed_at && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Eye className="w-3 h-3" />
                      <span>
                        Last accessed: {new Date(access.last_accessed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Accessed {access.access_count} times
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Previous Requests */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Request History</h2>
        
        {requests.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No data access requests yet. Request access to start working with client data.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold">{request.status.toUpperCase()}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.engagement_type} • Requested on{' '}
                      {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      request.urgency === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : request.urgency === 'medium'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {request.urgency.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-semibold mb-1">Purpose:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{request.purpose}</p>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-semibold mb-2">Data Types:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {request.data_types_requested.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {request.client_notes && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-semibold mb-1">Client Response:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {request.client_notes}
                    </p>
                  </div>
                )}

                {request.status === 'approved' && request.access_expires_at && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Access valid until {new Date(request.access_expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
