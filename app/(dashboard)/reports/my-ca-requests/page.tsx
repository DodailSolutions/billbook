'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getMyHireRequests, getHireRequestStats } from '@/lib/hire-ca-actions'
import type { CAHireRequest, HireRequestStatus } from '@/lib/hire-ca-types'
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Users,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const STATUS_CONFIG: Record<HireRequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open: {
    label: 'Open',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    icon: <Clock className="w-4 h-4" />,
  },
  matched: {
    label: 'Matched',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    icon: <Users className="w-4 h-4" />,
  },
  in_discussion: {
    label: 'In Discussion',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  hired: {
    label: 'Hired',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    icon: <XCircle className="w-4 h-4" />,
  },
}

export default function MyCARequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<CAHireRequest[]>([])
  const [stats, setStats] = useState<{
    total_requests: number
    open_requests: number
    hired: number
    total_proposals: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<HireRequestStatus | 'all'>('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    const [requestsData, statsData] = await Promise.all([
      getMyHireRequests(),
      getHireRequestStats(),
    ])
    setRequests(requestsData)
    setStats(statsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter((r) => r.status === filter)

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Reports
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My CA Hire Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your requests and review proposals from CAs
          </p>
        </div>
        <Link href="/reports/hire-ca">
          <Button>
            <Briefcase className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total_requests}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
                <p className="text-2xl font-bold">{stats.open_requests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hired</p>
                <p className="text-2xl font-bold">{stats.hired}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Proposals Received</p>
                <p className="text-2xl font-bold">{stats.total_proposals}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({requests.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = requests.filter((r) => r.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilter(status as HireRequestStatus)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {filter === 'all' ? 'No hire requests yet' : `No ${STATUS_CONFIG[filter as HireRequestStatus]?.label.toLowerCase()} requests`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all' 
              ? 'Create your first request to get started'
              : 'Try selecting a different filter to see more requests'
            }
          </p>
          {filter === 'all' ? (
            <Link href="/reports/hire-ca">
              <Button>Create Hire Request</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={() => setFilter('all')}>
              Show All Requests
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const statusConfig = STATUS_CONFIG[request.status]
            return (
              <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold capitalize">
                        {request.request_type.replace('_', ' ')}
                      </h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {request.service_needed.map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Created</div>
                    <div className="font-semibold">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {request.budget_min && request.budget_max && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        ₹{request.budget_min.toLocaleString()} - ₹{request.budget_max.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {request.preferred_city && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{request.preferred_city}</span>
                    </div>
                  )}

                  {request.preferred_start_date && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(request.preferred_start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {request.proposals_received} proposal{request.proposals_received !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/reports/proposals/${request.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Proposals {request.proposals_received > 0 && `(${request.proposals_received})`}
                    </Button>
                  </Link>
                  {request.status === 'hired' && request.ca_professional_id && (
                    <Link href={`/ca-marketplace/${request.ca_professional_id}`}>
                      <Button variant="outline">
                        View CA Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
