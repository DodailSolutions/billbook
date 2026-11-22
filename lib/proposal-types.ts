/**
 * Phase 5: AI Proposal Writing & RFP / RFQ Evaluation Engine Types
 */

export type ProposalStatus = 'draft' | 'under_review' | 'sent' | 'viewed' | 'signed' | 'declined' | 'converted'

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
