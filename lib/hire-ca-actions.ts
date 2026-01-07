/**
 * Hire CA Server Actions
 * Server-side functions for CA hiring marketplace
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  CAProfessional,
  CAHireRequest,
  CAProposal,
  CAEngagement,
  CAReview,
  CASearchFilters,
  CAMarketplaceItem,
  HireRequestType,
  CAServiceType,
  FeeStructure,
  ProposalStatus,
} from './hire-ca-types'

/**
 * Create a new hire request
 */
export async function createHireRequest(formData: {
  request_type: HireRequestType
  service_needed: CAServiceType[]
  business_name?: string
  business_type?: string
  annual_turnover?: number
  number_of_invoices?: number
  description: string
  preferred_start_date?: string
  duration_months?: number
  budget_min?: number
  budget_max?: number
  preferred_city?: string
  preferred_state?: string
  remote_ok: boolean
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('ca_hire_requests')
    .insert({
      user_id: user.id,
      ...formData,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating hire request:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Get all hire requests for the current user
 */
export async function getMyHireRequests(): Promise<CAHireRequest[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('ca_hire_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching hire requests:', error)
    return []
  }

  return data as CAHireRequest[]
}

/**
 * Get a single hire request by ID
 */
export async function getHireRequest(
  requestId: string
): Promise<CAHireRequest | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ca_hire_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (error) {
    console.error('Error fetching hire request:', error)
    return null
  }

  return data as CAHireRequest
}

/**
 * Browse CA marketplace with filters
 */
export async function getCAMarketplace(
  filters?: CASearchFilters
): Promise<CAMarketplaceItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('ca_professionals')
    .select('*')
    .eq('available_for_hire', true)
    .eq('verification_status', 'verified')

  if (filters) {
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    if (filters.state) {
      query = query.eq('state', filters.state)
    }
    if (filters.min_rating) {
      query = query.gte('average_rating', filters.min_rating)
    }
    if (filters.max_consultation_fee) {
      query = query.lte('consultation_fee', filters.max_consultation_fee)
    }
    if (filters.max_retainer_fee) {
      query = query.lte('monthly_retainer_fee', filters.max_retainer_fee)
    }
    if (filters.min_experience) {
      query = query.gte('years_of_experience', filters.min_experience)
    }
    if (filters.specializations && filters.specializations.length > 0) {
      query = query.contains('specializations', filters.specializations)
    }
  }

  query = query.order('average_rating', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching CA marketplace:', error)
    return []
  }

  return data as CAMarketplaceItem[]
}

/**
 * Get CA profile by ID
 */
export async function getCAProfile(
  caId: string
): Promise<CAProfessional | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ca_professionals')
    .select('*')
    .eq('id', caId)
    .single()

  if (error) {
    console.error('Error fetching CA profile:', error)
    return null
  }

  return data as CAProfessional
}

/**
 * Get CA reviews
 */
export async function getCAReviews(caId: string): Promise<CAReview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ca_reviews')
    .select('*')
    .eq('ca_professional_id', caId)
    .eq('is_verified', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching CA reviews:', error)
    return []
  }

  return data as CAReview[]
}

/**
 * Submit a proposal to a hire request (CA side)
 */
export async function submitProposal(formData: {
  hire_request_id: string
  cover_letter: string
  proposed_fee: number
  fee_structure: FeeStructure
  estimated_duration?: string
  relevant_experience?: string
  similar_projects_completed?: number
  availability_start_date?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) {
    return { success: false, error: 'CA profile not found' }
  }

  const { data, error } = await supabase
    .from('ca_proposals')
    .insert({
      ...formData,
      ca_professional_id: caProfile.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting proposal:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Get proposals for a hire request
 */
export async function getProposalsForRequest(
  requestId: string
): Promise<Array<CAProposal & { ca_professional: CAProfessional }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ca_proposals')
    .select('*, ca_professional:ca_professionals(*)')
    .eq('hire_request_id', requestId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  return data as Array<CAProposal & { ca_professional: CAProfessional }>
}

/**
 * Accept a proposal and create engagement
 */
export async function acceptProposal(
  proposalId: string,
  startDate: string,
  endDate?: string,
  contractTerms?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Get proposal details
  const { data: proposal, error: proposalError } = await supabase
    .from('ca_proposals')
    .select('*, hire_request:ca_hire_requests(*)')
    .eq('id', proposalId)
    .single()

  if (proposalError || !proposal) {
    return { success: false, error: 'Proposal not found' }
  }

  // Update proposal status
  const { error: updateError } = await supabase
    .from('ca_proposals')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', proposalId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Create engagement
  const { data: engagement, error: engagementError } = await supabase
    .from('ca_engagements')
    .insert({
      hire_request_id: proposal.hire_request_id,
      user_id: user.id,
      ca_professional_id: proposal.ca_professional_id,
      engagement_type: proposal.hire_request.request_type,
      services_included: proposal.hire_request.service_needed,
      agreed_fee: proposal.proposed_fee,
      fee_frequency: proposal.fee_structure,
      start_date: startDate,
      end_date: endDate,
      contract_terms: contractTerms,
      total_amount_paid: 0,
      status: 'active',
    })
    .select()
    .single()

  if (engagementError) {
    return { success: false, error: engagementError.message }
  }

  // Update hire request status
  await supabase
    .from('ca_hire_requests')
    .update({
      status: 'hired',
      ca_professional_id: proposal.ca_professional_id,
      closed_at: new Date().toISOString(),
    })
    .eq('id', proposal.hire_request_id)

  return { success: true, data: engagement }
}

/**
 * Reject a proposal
 */
export async function rejectProposal(
  proposalId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ca_proposals')
    .update({
      status: 'rejected' as ProposalStatus,
      client_response: reason,
      responded_at: new Date().toISOString(),
    })
    .eq('id', proposalId)

  if (error) {
    console.error('Error rejecting proposal:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get user's active engagements
 */
export async function getMyEngagements(): Promise<
  Array<CAEngagement & { ca_professional: CAProfessional }>
> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('ca_engagements')
    .select('*, ca_professional:ca_professionals(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching engagements:', error)
    return []
  }

  return data as Array<CAEngagement & { ca_professional: CAProfessional }>
}

/**
 * Submit a review for a CA
 */
export async function submitReview(formData: {
  ca_professional_id: string
  engagement_id?: string
  rating: number
  review_title?: string
  review_text: string
  communication_rating?: number
  expertise_rating?: number
  timeliness_rating?: number
  value_for_money_rating?: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('ca_reviews')
    .insert({
      ...formData,
      user_id: user.id,
      is_verified: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting review:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Update engagement status
 */
export async function updateEngagementStatus(
  engagementId: string,
  status: 'active' | 'paused' | 'completed' | 'terminated'
) {
  const supabase = await createClient()

  const updates: Record<string, unknown> = { status }
  if (status === 'completed' || status === 'terminated') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('ca_engagements')
    .update(updates)
    .eq('id', engagementId)

  if (error) {
    console.error('Error updating engagement status:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get statistics for user's hire requests
 */
export async function getHireRequestStats() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: requests } = await supabase
    .from('ca_hire_requests')
    .select('status, proposals_received')
    .eq('user_id', user.id)

  if (!requests) return null

  const stats = {
    total_requests: requests.length,
    open_requests: requests.filter((r) => r.status === 'open').length,
    hired: requests.filter((r) => r.status === 'hired').length,
    total_proposals: requests.reduce((sum, r) => sum + r.proposals_received, 0),
  }

  return stats
}
