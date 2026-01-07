/**
 * Hire CA Feature Types
 * TypeScript interfaces for hiring Chartered Accountants
 */

export type CASpecialization = 'GST' | 'Income Tax' | 'Audit' | 'Company Law' | 'Financial Planning' | 'Bookkeeping' | 'Payroll' | 'TDS' | 'International Taxation'

export type CAServiceType = 'GST Filing' | 'Tax Returns' | 'Bookkeeping' | 'Audit' | 'Financial Planning' | 'Company Registration' | 'Compliance' | 'Payroll Management' | 'TDS Filing'

export type HireRequestType = 'consultation' | 'monthly_retainer' | 'project_based' | 'gst_filing' | 'tax_filing' | 'audit' | 'general'

export type HireRequestStatus = 'open' | 'matched' | 'in_discussion' | 'hired' | 'completed' | 'cancelled'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export type EngagementStatus = 'active' | 'paused' | 'completed' | 'terminated'

export type FeeStructure = 'one_time' | 'monthly' | 'hourly' | 'project_based'

export type FeeFrequency = 'one_time' | 'monthly' | 'quarterly' | 'annually'

export interface CAProfessional {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  profile_image_url?: string
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
  available_for_hire: boolean
  consultation_fee?: number
  monthly_retainer_fee?: number
  average_rating: number
  total_reviews: number
  total_clients: number
  verification_status: VerificationStatus
  verified_at?: string
  verification_documents?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CAHireRequest {
  id: string
  user_id: string
  ca_professional_id?: string
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
  status: HireRequestStatus
  matched_ca_ids?: string[]
  proposals_received: number
  created_at: string
  updated_at: string
  closed_at?: string
}

export interface CAProposal {
  id: string
  hire_request_id: string
  ca_professional_id: string
  cover_letter: string
  proposed_fee: number
  fee_structure: FeeStructure
  estimated_duration?: string
  relevant_experience?: string
  similar_projects_completed?: number
  availability_start_date?: string
  attachment_urls?: string[]
  status: ProposalStatus
  client_response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export interface CAEngagement {
  id: string
  hire_request_id?: string
  user_id: string
  ca_professional_id: string
  engagement_type: string
  services_included: string[]
  agreed_fee: number
  fee_frequency: FeeFrequency
  start_date: string
  end_date?: string
  contract_terms?: string
  contract_document_url?: string
  total_amount_paid: number
  last_payment_date?: string
  next_payment_due?: string
  status: EngagementStatus
  client_rating?: number
  client_review?: string
  review_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface CAReview {
  id: string
  ca_professional_id: string
  user_id: string
  engagement_id?: string
  rating: number
  review_title?: string
  review_text: string
  communication_rating?: number
  expertise_rating?: number
  timeliness_rating?: number
  value_for_money_rating?: number
  is_verified: boolean
  ca_response?: string
  ca_responded_at?: string
  created_at: string
  updated_at: string
}

export interface CASearchFilters {
  city?: string
  state?: string
  specializations?: CASpecialization[]
  min_rating?: number
  max_consultation_fee?: number
  max_retainer_fee?: number
  min_experience?: number
  languages?: string[]
}

export interface CAMarketplaceItem extends CAProfessional {
  recent_reviews?: CAReview[]
  total_engagements?: number
}
