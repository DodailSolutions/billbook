'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getHireRequest,
  getProposalsForRequest,
  acceptProposal,
  rejectProposal,
} from '@/lib/hire-ca-actions'
import type { CAHireRequest, CAProposal, CAProfessional } from '@/lib/hire-ca-types'
import {
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  IndianRupee,
  CheckCircle,
  XCircle,
  Award,
} from 'lucide-react'

export default function ProposalsPage({ params }: { params: { requestId: string } }) {
  const router = useRouter()
  const [request, setRequest] = useState<CAHireRequest | null>(null)
  const [proposals, setProposals] = useState<Array<CAProposal & { ca_professional: CAProfessional }>>([])
  const [loading, setLoading] = useState(true)
  const [acceptingProposal, setAcceptingProposal] = useState<string | null>(null)
  const [showAcceptModal, setShowAcceptModal] = useState<string | null>(null)
  const [contractDetails, setContractDetails] = useState({
    start_date: '',
    end_date: '',
    contract_terms: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [requestData, proposalsData] = await Promise.all([
      getHireRequest(params.requestId),
      getProposalsForRequest(params.requestId),
    ])
    setRequest(requestData)
    setProposals(proposalsData)
    setLoading(false)
  }, [params.requestId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const handleAcceptProposal = async (proposalId: string) => {
    if (!contractDetails.start_date) {
      alert('Please enter a start date')
      return
    }

    setAcceptingProposal(proposalId)
    const result = await acceptProposal(
      proposalId,
      contractDetails.start_date,
      contractDetails.end_date || undefined,
      contractDetails.contract_terms || undefined
    )

    if (result.success) {
      alert('Proposal accepted successfully! Engagement has been created.')
      router.push('/reports/my-ca-requests')
    } else {
      alert(result.error || 'Failed to accept proposal')
    }
    setAcceptingProposal(null)
    setShowAcceptModal(null)
  }

  const handleRejectProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to reject this proposal?')) return

    const result = await rejectProposal(proposalId)
    if (result.success) {
      loadData()
    } else {
      alert(result.error || 'Failed to reject proposal')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Request not found</h3>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }

  const pendingProposals = proposals.filter((p) => p.status === 'pending')
  const acceptedProposal = proposals.find((p) => p.status === 'accepted')
  const rejectedProposals = proposals.filter((p) => p.status === 'rejected')

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Requests
      </Button>

      {/* Request Details */}
      <Card className="p-6 mb-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2 capitalize">
            {request.request_type.replace('_', ' ')} Request
          </h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {request.service_needed.map((service) => (
              <span
                key={service}
                className="px-3 py-1 bg-blue-100  text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-gray-600 mb-4">{request.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {request.budget_min && request.budget_max && (
            <div>
              <div className="text-sm text-gray-600 text-gray-600">Budget Range</div>
              <div className="font-semibold">
                ₹{request.budget_min.toLocaleString()} - ₹{request.budget_max.toLocaleString()}
              </div>
            </div>
          )}
          {request.preferred_city && (
            <div>
              <div className="text-sm text-gray-600 text-gray-600">Location</div>
              <div className="font-semibold">{request.preferred_city}</div>
            </div>
          )}
          {request.preferred_start_date && (
            <div>
              <div className="text-sm text-gray-600 text-gray-600">Start Date</div>
              <div className="font-semibold">
                {new Date(request.preferred_start_date).toLocaleDateString()}
              </div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600 text-gray-600">Proposals Received</div>
            <div className="font-semibold">{proposals.length}</div>
          </div>
        </div>
      </Card>

      {/* Accepted Proposal (if any) */}
      {acceptedProposal && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold">Accepted Proposal</h2>
          </div>
          <ProposalCard proposal={acceptedProposal} showActions={false} />
        </div>
      )}

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Pending Proposals ({pendingProposals.length})
          </h2>
          <div className="space-y-4">
            {pendingProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                showActions={request.status === 'open'}
                onAccept={() => setShowAcceptModal(proposal.id)}
                onReject={() => handleRejectProposal(proposal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Proposals */}
      {rejectedProposals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-500">
            Rejected Proposals ({rejectedProposals.length})
          </h2>
          <div className="space-y-4 opacity-60">
            {rejectedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {/* No Proposals */}
      {proposals.length === 0 && (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No proposals yet</h3>
          <p className="text-gray-600 text-gray-600">
            CAs will submit their proposals within 24-48 hours
          </p>
        </Card>
      )}

      {/* Accept Proposal Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Accept Proposal & Create Engagement</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  value={contractDetails.start_date}
                  onChange={(e) =>
                    setContractDetails((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={contractDetails.end_date}
                  onChange={(e) =>
                    setContractDetails((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contract Terms (Optional)</label>
                <textarea
                  value={contractDetails.contract_terms}
                  onChange={(e) =>
                    setContractDetails((prev) => ({ ...prev, contract_terms: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white"
                  placeholder="Enter any specific terms or conditions..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAcceptModal(null)}
                className="flex-1"
                disabled={acceptingProposal === showAcceptModal}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAcceptProposal(showAcceptModal)}
                className="flex-1"
                disabled={acceptingProposal === showAcceptModal}
              >
                {acceptingProposal === showAcceptModal ? 'Creating...' : 'Accept & Create Engagement'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ProposalCard({
  proposal,
  showActions,
  onAccept,
  onReject,
}: {
  proposal: CAProposal & { ca_professional: CAProfessional }
  showActions: boolean
  onAccept?: () => void
  onReject?: () => void
}) {
  const ca = proposal.ca_professional

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/ca-marketplace/${ca.id}`}>
              <h3 className="text-xl font-bold hover:text-blue-600">{ca.full_name}</h3>
            </Link>
            {ca.verification_status === 'verified' && (
              <Award className="w-5 h-5 text-blue-600" />
            )}
          </div>
          {ca.firm_name && (
            <p className="text-gray-600 text-gray-600 mb-2">{ca.firm_name}</p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{ca.average_rating.toFixed(1)}</span>
              <span className="text-sm text-gray-600 text-gray-600">
                ({ca.total_reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 text-gray-600">
              <Briefcase className="w-4 h-4" />
              {ca.years_of_experience} years
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 text-gray-600">
              <MapPin className="w-4 h-4" />
              {ca.city}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600 text-gray-600">Proposed Fee</div>
          <div className="flex items-center text-2xl font-bold text-green-600">
            <IndianRupee className="w-5 h-5" />
            {proposal.proposed_fee.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 capitalize">{proposal.fee_structure.replace('_', ' ')}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Cover Letter</h4>
        <p className="text-gray-600 text-gray-600">{proposal.cover_letter}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {proposal.estimated_duration && (
          <div>
            <div className="text-sm text-gray-600 text-gray-600">Duration</div>
            <div className="font-semibold">{proposal.estimated_duration}</div>
          </div>
        )}
        {proposal.similar_projects_completed && proposal.similar_projects_completed > 0 && (
          <div>
            <div className="text-sm text-gray-600 text-gray-600">Similar Projects</div>
            <div className="font-semibold">{proposal.similar_projects_completed}</div>
          </div>
        )}
        {proposal.availability_start_date && (
          <div>
            <div className="text-sm text-gray-600 text-gray-600">Available From</div>
            <div className="font-semibold">
              {new Date(proposal.availability_start_date).toLocaleDateString()}
            </div>
          </div>
        )}
        <div>
          <div className="text-sm text-gray-600 text-gray-600">Submitted</div>
          <div className="font-semibold">
            {new Date(proposal.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {proposal.relevant_experience && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Relevant Experience</h4>
          <p className="text-sm text-gray-600 text-gray-600">{proposal.relevant_experience}</p>
        </div>
      )}

      {showActions && onAccept && onReject && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 ">
          <Button onClick={onReject} variant="outline" className="flex-1">
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button onClick={onAccept} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept Proposal
          </Button>
        </div>
      )}

      {proposal.status === 'accepted' && (
        <div className="mt-4 pt-4 border-t border-gray-200 ">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Accepted on {new Date(proposal.responded_at || '').toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {proposal.status === 'rejected' && (
        <div className="mt-4 pt-4 border-t border-gray-200 ">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Rejected</span>
          </div>
        </div>
      )}
    </Card>
  )
}
