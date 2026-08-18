/**
 * CA Profile Management Actions
 * Server actions for CA registration and profile management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type { CASpecialization } from './hire-ca-types'

export async function createCAProfile(formData: {
  full_name: string
  email: string
  phone: string
  icai_membership_number: string
  firm_name?: string
  years_of_experience: number
  specializations: CASpecialization[]
  office_address: string
  city: string
  state: string
  pincode: string
  bio?: string
  education?: string[]
  certifications?: string[]
  languages_spoken?: string[]
  consultation_fee?: number
  monthly_retainer_fee?: number
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
    .from('ca_professionals')
    .insert({
      user_id: user.id,
      ...formData,
      available_for_hire: true,
      verification_status: 'pending',
      average_rating: 0,
      total_reviews: 0,
      total_clients: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating CA profile:', error)
    return { success: false, error: error.message }
  }

  // Also sync to ca_profiles so CA dashboard works immediately
  const { error: syncError } = await supabase
    .from('ca_profiles')
    .upsert({
      user_id: user.id,
      ca_name: formData.full_name,
      ca_firm_name: formData.firm_name || null,
      membership_number: formData.icai_membership_number,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.office_address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      specializations: formData.specializations,
      is_verified: false,
      is_active: true
    }, { onConflict: 'user_id' })

  if (syncError) {
    console.error('Error syncing to ca_profiles:', syncError)
  }

  return { success: true, data }
}

export async function getMyCAProfile() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('ca_professionals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching CA profile:', error)
    return null
  }

  return data
}

export async function updateCAProfile(updates: {
  full_name?: string
  email?: string
  phone?: string
  firm_name?: string
  years_of_experience?: number
  specializations?: CASpecialization[]
  office_address?: string
  city?: string
  state?: string
  pincode?: string
  bio?: string
  education?: string[]
  certifications?: string[]
  languages_spoken?: string[]
  consultation_fee?: number
  monthly_retainer_fee?: number
  available_for_hire?: boolean
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
    .from('ca_professionals')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating CA profile:', error)
    return { success: false, error: error.message }
  }

  // Also update ca_profiles
  const profileUpdates: any = {}
  if (updates.full_name) profileUpdates.ca_name = updates.full_name
  if (updates.firm_name !== undefined) profileUpdates.ca_firm_name = updates.firm_name
  if (updates.email) profileUpdates.email = updates.email
  if (updates.phone) profileUpdates.phone = updates.phone
  if (updates.specializations) profileUpdates.specializations = updates.specializations
  
  if (updates.office_address || updates.city || updates.state || updates.pincode) {
    const current = data // use the updated data from ca_professionals
    profileUpdates.address = `${current.office_address}, ${current.city}, ${current.state} - ${current.pincode}`
  }

  if (Object.keys(profileUpdates).length > 0) {
    const { error: syncError } = await supabase
      .from('ca_profiles')
      .update(profileUpdates)
      .eq('user_id', user.id)
    if (syncError) {
      console.error('Error syncing updates to ca_profiles:', syncError)
    }
  }

  return { success: true, data }
}

export async function getMyProposals() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) return []

  const { data, error } = await supabase
    .from('ca_proposals')
    .select('*, hire_request:ca_hire_requests(*)')
    .eq('ca_professional_id', caProfile.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  return data
}

export async function getMyEngagementsAsCA() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) return []

  const { data, error } = await supabase
    .from('ca_engagements')
    .select('*')
    .eq('ca_professional_id', caProfile.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching engagements:', error)
    return []
  }

  return data
}

export async function getCAStats() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Get CA professional ID
  const { data: caProfile } = await supabase
    .from('ca_professionals')
    .select('id, average_rating, total_reviews, total_clients')
    .eq('user_id', user.id)
    .single()

  if (!caProfile) return null

  // Get proposals count
  const { count: proposalsCount } = await supabase
    .from('ca_proposals')
    .select('*', { count: 'exact', head: true })
    .eq('ca_professional_id', caProfile.id)

  // Get active engagements count
  const { count: activeEngagements } = await supabase
    .from('ca_engagements')
    .select('*', { count: 'exact', head: true })
    .eq('ca_professional_id', caProfile.id)
    .eq('status', 'active')

  // Get total earnings
  const { data: engagements } = await supabase
    .from('ca_engagements')
    .select('total_amount_paid')
    .eq('ca_professional_id', caProfile.id)

  const totalEarnings = engagements?.reduce((sum, e) => sum + (e.total_amount_paid || 0), 0) || 0

  return {
    average_rating: caProfile.average_rating,
    total_reviews: caProfile.total_reviews,
    total_clients: caProfile.total_clients,
    proposals_sent: proposalsCount || 0,
    active_engagements: activeEngagements || 0,
    total_earnings: totalEarnings,
  }
}
