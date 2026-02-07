'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  CAPayment,
  CADataAccessRequest,
  CADataAccess,
  DataAccessType,
  PaymentStatus,
} from './hire-ca-types'

// ============================================================================
// PAYMENT ACTIONS
// ============================================================================

/**
 * Record a payment for CA engagement
 */
export async function createCAPayment(data: {
  engagement_id: string
  ca_professional_id: string
  amount: number
  payment_method: string
  transaction_id?: string
  due_date?: string
  notes?: string
}): Promise<CAPayment | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: payment, error } = await supabase
    .from('ca_payments')
    .insert({
      ...data,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    return null
  }

  return payment
}

/**
 * Update payment status (e.g., after Razorpay webhook)
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
): Promise<boolean> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { status }
  if (transactionId) {
    updateData.transaction_id = transactionId
  }
  if (status === 'completed') {
    updateData.payment_date = new Date().toISOString()
  }

  const { error } = await supabase
    .from('ca_payments')
    .update(updateData)
    .eq('id', paymentId)

  if (error) {
    console.error('Error updating payment status:', error)
    return false
  }

  return true
}

/**
 * Get payments for an engagement
 */
export async function getEngagementPayments(
  engagementId: string
): Promise<CAPayment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ca_payments')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }

  return data || []
}

/**
 * Check if engagement has completed payment
 */
export async function hasCompletedPayment(
  engagementId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ca_payments')
    .select('id')
    .eq('engagement_id', engagementId)
    .eq('status', 'completed')
    .limit(1)
    .single()

  if (error) {
    return false
  }

  return !!data
}

// ============================================================================
// DATA ACCESS REQUEST ACTIONS
// ============================================================================

/**
 * CA requests access to client data
 */
export async function createDataAccessRequest(data: {
  engagement_id: string
  data_types_requested: DataAccessType[]
  purpose: string
  access_duration_days?: number
  urgency?: 'low' | 'medium' | 'high'
  specific_requirements?: string
}): Promise<CADataAccessRequest | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) {
    throw new Error('CA professional profile not found')
  }

  // Get engagement to find client user_id
  const { data: engagement } = await supabase
    .from('ca_engagements')
    .select('user_id')
    .eq('id', data.engagement_id)
    .single()

  if (!engagement) {
    throw new Error('Engagement not found')
  }

  const { data: request, error } = await supabase
    .from('ca_data_access_requests')
    .insert({
      engagement_id: data.engagement_id,
      ca_professional_id: caProfile.id,
      user_id: engagement.user_id,
      data_types_requested: data.data_types_requested,
      purpose: data.purpose,
      access_duration_days: data.access_duration_days || 90,
      urgency: data.urgency || 'medium',
      specific_requirements: data.specific_requirements,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating data access request:', error)
    throw new Error(error.message)
  }

  return request
}

/**
 * Get data access requests for client (to approve/reject)
 */
export async function getClientDataAccessRequests(): Promise<
  (CADataAccessRequest & { ca_name: string; ca_firm_name?: string; engagement_type: string })[]
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('ca_data_access_requests')
    .select(
      `
      *,
      ca_professionals!ca_data_access_requests_ca_professional_id_fkey (
        full_name,
        firm_name
      ),
      ca_engagements!ca_data_access_requests_engagement_id_fkey (
        engagement_type
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching data access requests:', error)
    return []
  }

  return (
    data?.map((item) => ({
      ...item,
      ca_name: item.ca_professionals?.full_name || 'Unknown',
      ca_firm_name: item.ca_professionals?.firm_name,
      engagement_type: item.ca_engagements?.engagement_type || 'Unknown',
    })) || []
  )
}

/**
 * Get data access requests sent by CA
 */
export async function getCADataAccessRequests(): Promise<
  (CADataAccessRequest & { client_name: string; engagement_type: string })[]
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) {
    return []
  }

  const { data, error } = await supabase
    .from('ca_data_access_requests')
    .select(
      `
      *,
      businesses!ca_data_access_requests_user_id_fkey (
        business_name
      ),
      ca_engagements!ca_data_access_requests_engagement_id_fkey (
        engagement_type
      )
    `
    )
    .eq('ca_professional_id', caProfile.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching CA access requests:', error)
    return []
  }

  return (
    data?.map((item) => ({
      ...item,
      client_name: item.businesses?.business_name || 'Client',
      engagement_type: item.ca_engagements?.engagement_type || 'Unknown',
    })) || []
  )
}

/**
 * Client approves data access request
 */
export async function approveDataAccessRequest(
  requestId: string,
  clientNotes?: string
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('ca_data_access_requests')
    .update({
      status: 'approved',
      client_notes: clientNotes,
    })
    .eq('id', requestId)
    .eq('user_id', user.id) // Ensure user owns this request

  if (error) {
    console.error('Error approving access request:', error)
    return false
  }

  return true
}

/**
 * Client rejects data access request
 */
export async function rejectDataAccessRequest(
  requestId: string,
  clientNotes?: string
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('ca_data_access_requests')
    .update({
      status: 'rejected',
      client_notes: clientNotes,
    })
    .eq('id', requestId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error rejecting access request:', error)
    return false
  }

  return true
}

/**
 * Client revokes previously granted access
 */
export async function revokeDataAccess(
  requestId: string,
  reason?: string
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('ca_data_access_requests')
    .update({
      status: 'revoked',
      client_notes: reason,
    })
    .eq('id', requestId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error revoking access:', error)
    return false
  }

  return true
}

/**
 * Get active data access for CA
 */
export async function getCAActiveAccess(
  clientUserId?: string
): Promise<CADataAccess[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) {
    return []
  }

  let query = supabase
    .from('ca_data_access')
    .select('*')
    .eq('ca_professional_id', caProfile.id)
    .eq('is_active', true)
    .gte('access_end_date', new Date().toISOString())

  if (clientUserId) {
    query = query.eq('user_id', clientUserId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active access:', error)
    return []
  }

  return data || []
}

/**
 * Get client's granted accesses
 */
export async function getClientGrantedAccesses(): Promise<
  (CADataAccess & { ca_name: string; ca_firm_name?: string })[]
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('ca_data_access')
    .select(
      `
      *,
      ca_professionals!ca_data_access_ca_professional_id_fkey (
        full_name,
        firm_name
      )
    `
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching granted accesses:', error)
    return []
  }

  return (
    data?.map((item) => ({
      ...item,
      ca_name: item.ca_professionals?.full_name || 'Unknown',
      ca_firm_name: item.ca_professionals?.firm_name,
    })) || []
  )
}

/**
 * Record data access (for audit trail)
 */
export async function recordDataAccessActivity(
  accessId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ca_data_access')
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: supabase.rpc('increment', { x: 1 }),
    })
    .eq('id', accessId)

  if (error) {
    console.error('Error recording access activity:', error)
    return false
  }

  return true
}

/**
 * Check if CA has access to specific data type for a client
 */
export async function checkCADataAccess(
  clientUserId: string,
  dataType: DataAccessType
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) {
    return false
  }

  const { data, error } = await supabase
    .from('ca_data_access')
    .select('id')
    .eq('ca_professional_id', caProfile.id)
    .eq('user_id', clientUserId)
    .eq('data_type', dataType)
    .eq('is_active', true)
    .gte('access_end_date', new Date().toISOString())
    .limit(1)
    .single()

  if (error) {
    return false
  }

  return !!data
}
