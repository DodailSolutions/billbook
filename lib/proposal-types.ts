/**
 * Phase 5: AI Proposal Writing & RFP / RFQ Evaluation Engine Types
 */

export type ProposalStatus = 
  | 'draft' 
  | 'sent' 
  | 'under_review' 
  | 'accepted' 
  | 'rejected' 
  | 'on_hold' 
  | 'viewed' 
  | 'signed' 
  | 'declined' 
  | 'converted'

export interface ProposalBrandingSettings {
  companyName?: string
  logoUrl?: string
  headerText?: string
  footerText?: string
  pageNumberingFormat?: 'page_x_of_y' | 'page_x' | 'none'
  accentColor?: string
  watermarkType?: 'none' | 'draft' | 'confidential' | 'custom'
  watermarkCustomText?: string
  showTncInPrint?: boolean
}

export type FeasibilityRecommendation = 'GO' | 'CAUTION' | 'NO_GO'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface ScopeDeliverable {
  id: string
  title: string
  description: string
  estimatedHours?: number
  costRate?: number
  billRate?: number
  amount: number
  deliverableCategory?: string
  tags?: string[]
}

export interface MilestoneTranche {
  id: string
  title: string
  percentage: number
  amount: number
  dueTrigger: string // e.g. "Upon contract e-signing", "Sprint 2 signoff", "UAT signoff"
  deliverablesSummary?: string
  invoiceGenerated?: boolean
  invoiceId?: string
}

export interface ComplianceMatrixItem {
  id: string
  requirement: string
  compliant: boolean
  riskLevel: RiskLevel
  notes: string
  suggestedMitigation?: string
}

export interface BidFeasibilityScore {
  score: number // 0 - 100
  recommendation: FeasibilityRecommendation
  technicalFitScore: number // 0 - 100
  timelineFeasibilityScore: number // 0 - 100
  marginFeasibilityScore: number // 0 - 100
  riskSummary: string
  pros: string[]
  cons: string[]
  suggestedBidRange?: {
    min: number
    recommended: number
    max: number
    currency: string
  }
}

export interface ProposalSignature {
  signerName: string
  signerDesignation?: string
  signerEmail?: string
  signatureDataUrl?: string
  signedAt?: string
  ipAddress?: string
  userAgent?: string
}

export interface Proposal {
  id: string
  userId: string
  dealId?: string // CRM Lead / Deal ID
  clientName: string
  clientEmail: string
  clientCompany?: string
  clientPhone?: string
  projectTitle: string
  industryVertical?: string
  status: ProposalStatus
  currency: string
  totalAmount: number
  advancePercentage: number // e.g. 30%, 50%
  advanceAmount: number
  validUntil: string
  executiveSummary: string
  scopeDeliverables: ScopeDeliverable[]
  milestoneTranches: MilestoneTranche[]
  complianceMatrix?: ComplianceMatrixItem[]
  feasibilityScore?: BidFeasibilityScore
  termsAndConditions: string[]
  signature?: ProposalSignature
  convertedInvoiceId?: string
  convertedProjectId?: string
  // Assignment & Follow-up
  assignedToEmployeeId?: string
  assignedToName?: string
  assignedToType?: 'employee' | 'client_partner'
  nextFollowUpDate?: string
  followUpNotes?: string
  // Sales / Partner Commission
  commissionType?: 'salary_only' | 'percentage_only' | 'hybrid'
  commissionPercentage?: number
  commissionAmount?: number
  commissionPayFrequency?: 'monthly' | 'weekly'
  commissionBasis?: 'per_project' | 'monthly_retainer' | 'deal_total'
  commissionStatus?: 'pending' | 'approved' | 'paid'
  // Branding
  brandingSettings?: ProposalBrandingSettings
  createdAt: string
  updatedAt: string
}

export interface RfpEvaluationInput {
  title: string
  clientName?: string
  scopeText: string
  clientBudget?: number
  timelineWeeks?: number
  industryVertical?: string
}

export interface CommissionCalculationInput {
  baseSalary?: number
  commissionType: 'salary_only' | 'percentage_only' | 'hybrid'
  commissionPercentage: number
  dealOrProjectAmount: number
  frequency: 'monthly' | 'weekly'
  basis: 'per_project' | 'monthly_retainer' | 'deal_total'
}

export interface CommissionCalculationResult {
  baseSalaryPayable: number
  commissionEarned: number
  totalGrossPayout: number
  effectiveRate: number
  breakdown: string
}
