'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  Proposal, 
  RfpEvaluationInput, 
  ProposalSignature,
  ProposalStatus,
  ProposalBrandingSettings
} from '@/lib/proposal-types'
import { evaluateRfpScope } from '@/lib/proposal-engine'

/**
 * Resolves the effective owner ID for team member accounts
 */
async function getEffectiveOwnerId(supabase: any, currentUserId: string): Promise<string> {
  try {
    const { data: member } = await supabase
      .from('team_members')
      .select('owner_id')
      .eq('user_id', currentUserId)
      .eq('status', 'active')
      .maybeSingle()

    return member?.owner_id || currentUserId
  } catch {
    return currentUserId
  }
}

/**
 * Evaluates an RFP or scope text using the AI Bid Feasibility & Compliance Engine
 */
export async function evaluateRfpAction(input: RfpEvaluationInput) {
  try {
    const evaluation = evaluateRfpScope(input)
    return { success: true, data: evaluation }
  } catch (error: any) {
    console.error('Error evaluating RFP scope:', error)
    return { success: false, error: error.message || 'Failed to evaluate RFP' }
  }
}

/**
 * Fetch all proposals belonging to the tenant
 */
export async function getProposalsAction(): Promise<Proposal[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[getProposalsAction] Non-fatal, proposals table query error:', error.message)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      dealId: row.deal_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientCompany: row.client_company,
      clientPhone: row.client_phone,
      projectTitle: row.project_title,
      industryVertical: row.industry_vertical,
      status: row.status as ProposalStatus,
      currency: row.currency || 'INR',
      totalAmount: Number(row.total_amount) || 0,
      advancePercentage: Number(row.advance_percentage) || 40,
      advanceAmount: Number(row.advance_amount) || 0,
      validUntil: row.valid_until,
      executiveSummary: row.executive_summary || '',
      scopeDeliverables: row.scope_deliverables || [],
      milestoneTranches: row.milestone_tranches || [],
      complianceMatrix: row.compliance_matrix || [],
      feasibilityScore: row.feasibility_score || undefined,
      termsAndConditions: row.terms_and_conditions || [],
      signature: row.signature || undefined,
      convertedInvoiceId: row.converted_invoice_id,
      convertedProjectId: row.converted_project_id,
      // Assignment & Follow-up
      assignedToEmployeeId: row.assigned_to_employee_id,
      assignedToName: row.assigned_to_name,
      assignedToType: row.assigned_to_type,
      nextFollowUpDate: row.next_follow_up_date,
      followUpNotes: row.follow_up_notes,
      // Commission
      commissionType: row.commission_type,
      commissionPercentage: Number(row.commission_percentage) || 0,
      commissionAmount: Number(row.commission_amount) || 0,
      commissionPayFrequency: row.commission_pay_frequency,
      commissionBasis: row.commission_basis,
      commissionStatus: row.commission_status,
      // Branding
      brandingSettings: row.branding_settings || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return []
  }
}

/**
 * Fetch single proposal by ID (for editing or client e-signing)
 */
export async function getProposalByIdAction(id: string): Promise<Proposal | null> {
  try {
    // We try admin client or standard client to allow clients to view via public link
    let client = await createClient()
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        client = await createAdminClient()
      }
    } catch {
      // fallback
    }

    const { data: row, error } = await client
      .from('proposals')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !row) {
      return null
    }

    return {
      id: row.id,
      userId: row.user_id,
      dealId: row.deal_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientCompany: row.client_company,
      clientPhone: row.client_phone,
      projectTitle: row.project_title,
      industryVertical: row.industry_vertical,
      status: row.status as ProposalStatus,
      currency: row.currency || 'INR',
      totalAmount: Number(row.total_amount) || 0,
      advancePercentage: Number(row.advance_percentage) || 40,
      advanceAmount: Number(row.advance_amount) || 0,
      validUntil: row.valid_until,
      executiveSummary: row.executive_summary || '',
      scopeDeliverables: row.scope_deliverables || [],
      milestoneTranches: row.milestone_tranches || [],
      complianceMatrix: row.compliance_matrix || [],
      feasibilityScore: row.feasibility_score || undefined,
      termsAndConditions: row.terms_and_conditions || [],
      signature: row.signature || undefined,
      convertedInvoiceId: row.converted_invoice_id,
      convertedProjectId: row.converted_project_id,
      // Assignment & Follow-up
      assignedToEmployeeId: row.assigned_to_employee_id,
      assignedToName: row.assigned_to_name,
      assignedToType: row.assigned_to_type,
      nextFollowUpDate: row.next_follow_up_date,
      followUpNotes: row.follow_up_notes,
      // Commission
      commissionType: row.commission_type,
      commissionPercentage: Number(row.commission_percentage) || 0,
      commissionAmount: Number(row.commission_amount) || 0,
      commissionPayFrequency: row.commission_pay_frequency,
      commissionBasis: row.commission_basis,
      commissionStatus: row.commission_status,
      // Branding
      brandingSettings: row.branding_settings || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  } catch (error) {
    console.error('Error fetching proposal by ID:', error)
    return null
  }
}

/**
 * Create or save new proposal
 */
export async function createProposalAction(proposal: Omit<Proposal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const payload = {
      user_id: ownerId,
      deal_id: proposal.dealId || null,
      client_name: proposal.clientName,
      client_email: proposal.clientEmail,
      client_company: proposal.clientCompany || null,
      client_phone: proposal.clientPhone || null,
      project_title: proposal.projectTitle,
      industry_vertical: proposal.industryVertical || 'services',
      status: proposal.status || 'draft',
      currency: proposal.currency || 'INR',
      total_amount: proposal.totalAmount,
      advance_percentage: proposal.advancePercentage,
      advance_amount: proposal.advanceAmount,
      valid_until: proposal.validUntil || null,
      executive_summary: proposal.executiveSummary,
      scope_deliverables: proposal.scopeDeliverables,
      milestone_tranches: proposal.milestoneTranches,
      compliance_matrix: proposal.complianceMatrix || [],
      feasibility_score: proposal.feasibilityScore || {},
      terms_and_conditions: proposal.termsAndConditions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('Error inserting proposal:', error)
      throw error
    }

    revalidatePath('/proposals')
    revalidatePath('/crm')
    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Failed to create proposal:', error)
    return { success: false, error: error.message || 'Failed to create proposal' }
  }
}

/**
 * Sign proposal & Closed-Loop ERP Trigger:
 * 1. Mark proposal as 'signed' with signature details
 * 2. If proposal was linked to a CRM lead (dealId), automatically mark deal as 'won'
 * 3. Automatically generate the Advance Tax Invoice (Milestone 1)
 */
export async function signProposalAction(proposalId: string, signature: ProposalSignature) {
  try {
    let client = await createClient()
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        client = await createAdminClient()
      }
    } catch {
      // fallback
    }

    // 1. Fetch current proposal
    const { data: prop, error: fetchErr } = await client
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single()

    if (fetchErr || !prop) {
      throw new Error('Proposal not found')
    }

    const updatedSignature: ProposalSignature = {
      ...signature,
      signedAt: new Date().toISOString()
    }

    // 2. Closed-Loop ERP Trigger: Auto-generate advance invoice
    let generatedInvoiceId: string | null = null

    try {
      const advanceAmount = Number(prop.advance_amount) || Math.round(Number(prop.total_amount) * (Number(prop.advance_percentage) / 100))
      const invoiceNumber = `INV-PROP-${Date.now().toString().slice(-6)}`
      
      const { data: invData, error: invErr } = await client
        .from('invoices')
        .insert({
          user_id: prop.user_id,
          invoice_number: invoiceNumber,
          customer_name: prop.client_name,
          customer_email: prop.client_email,
          customer_phone: prop.client_phone || null,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'sent',
          total_amount: advanceAmount,
          currency: prop.currency || 'INR',
          notes: `Mobilization advance for project: ${prop.project_title} (Milestone 1)`,
          items: [
            {
              item_name: `Mobilization Advance (${prop.advance_percentage}% of ${prop.project_title})`,
              description: `Initial tranche payable upon digital signing of SOW proposal #${prop.id.substring(0, 8)}`,
              quantity: 1,
              rate: advanceAmount,
              amount: advanceAmount,
              tax_rate: 0
            }
          ]
        })
        .select('id')
        .maybeSingle()

      if (!invErr && invData?.id) {
        generatedInvoiceId = invData.id
      }
    } catch (e) {
      console.warn('[signProposalAction] Advance invoice auto-creation skipped or schema varied:', e)
    }

    // 3. Update proposal status to signed
    const { error: updateErr } = await client
      .from('proposals')
      .update({
        status: 'signed',
        signature: updatedSignature,
        converted_invoice_id: generatedInvoiceId,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)

    if (updateErr) throw updateErr

    // 4. Update CRM Deal to 'won' if linked
    if (prop.deal_id) {
      try {
        await client
          .from('crm_leads')
          .update({
            stage: 'won',
            probability: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', prop.deal_id)
      } catch (dealErr) {
        console.warn('[signProposalAction] Non-fatal CRM deal update error:', dealErr)
      }
    }

    revalidatePath(`/proposal/${proposalId}`)
    revalidatePath('/proposals')
    revalidatePath('/invoices')
    revalidatePath('/crm')

    return { 
      success: true, 
      invoiceId: generatedInvoiceId,
      message: 'Proposal successfully signed! CRM deal marked as Won and Advance Invoice generated.'
    }
  } catch (error: any) {
    console.error('Error signing proposal:', error)
    return { success: false, error: error.message || 'Failed to sign proposal' }
  }
}

/**
 * Updates stage/status and follow-up notes for a proposal
 */
export async function updateProposalStageAction(
  proposalId: string, 
  status: ProposalStatus, 
  followUpNotes?: string, 
  nextFollowUpDate?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString()
    }
    if (followUpNotes !== undefined) updatePayload.follow_up_notes = followUpNotes
    if (nextFollowUpDate !== undefined) updatePayload.next_follow_up_date = nextFollowUpDate

    const { error } = await supabase
      .from('proposals')
      .update(updatePayload)
      .eq('id', proposalId)

    if (error) throw error

    revalidatePath('/proposals')
    revalidatePath(`/proposal/${proposalId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating proposal stage:', error)
    return { success: false, error: error.message || 'Failed to update stage' }
  }
}

/**
 * Assign proposal to a sales employee or client partner
 */
export async function assignProposalAction(
  proposalId: string,
  assignedToEmployeeId: string,
  assignedToName: string,
  assignedToType: 'employee' | 'client_partner',
  commission?: {
    commissionType?: 'salary_only' | 'percentage_only' | 'hybrid'
    commissionPercentage?: number
    commissionAmount?: number
    commissionPayFrequency?: 'monthly' | 'weekly'
    commissionBasis?: 'per_project' | 'monthly_retainer' | 'deal_total'
  }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const updatePayload: any = {
      assigned_to_employee_id: assignedToEmployeeId,
      assigned_to_name: assignedToName,
      assigned_to_type: assignedToType,
      updated_at: new Date().toISOString()
    }

    if (commission) {
      if (commission.commissionType) updatePayload.commission_type = commission.commissionType
      if (commission.commissionPercentage !== undefined) updatePayload.commission_percentage = commission.commissionPercentage
      if (commission.commissionAmount !== undefined) updatePayload.commission_amount = commission.commissionAmount
      if (commission.commissionPayFrequency) updatePayload.commission_pay_frequency = commission.commissionPayFrequency
      if (commission.commissionBasis) updatePayload.commission_basis = commission.commissionBasis
      updatePayload.commission_status = 'pending'
    }

    const { error } = await supabase
      .from('proposals')
      .update(updatePayload)
      .eq('id', proposalId)

    if (error) throw error

    revalidatePath('/proposals')
    return { success: true }
  } catch (error: any) {
    console.error('Error assigning proposal:', error)
    return { success: false, error: error.message || 'Failed to assign proposal' }
  }
}

/**
 * Update proposal branding settings (Header, Footer, Page Numbering, Watermark, Accent Color)
 */
export async function updateProposalBrandingAction(proposalId: string, branding: ProposalBrandingSettings) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('proposals')
      .update({
        branding_settings: branding,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)

    if (error) throw error

    revalidatePath('/proposals')
    revalidatePath(`/proposal/${proposalId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating proposal branding:', error)
    return { success: false, error: error.message || 'Failed to update branding' }
  }
}

/**
 * AI Proposal Writer: generates a complete customized draft from rough brief or requirements
 */
export async function generateAiProposalDraftAction(input: {
  clientName: string
  projectTitle: string
  industryVertical?: string
  rawBrief: string
  targetBudget?: number
  timelineWeeks?: number
}) {
  try {
    const { clientName, projectTitle, rawBrief, targetBudget = 150000, timelineWeeks = 4, industryVertical = 'software' } = input

    // Build intelligent AI proposal draft
    const evaluation = evaluateRfpScope({
      title: projectTitle,
      clientName,
      scopeText: rawBrief,
      clientBudget: targetBudget,
      timelineWeeks,
      industryVertical
    })

    const executiveSummary = `This formal Statement of Work (SOW) represents a strategic partnership proposal between our agency and ${clientName || 'the client'} for "${projectTitle}". Addressing core business objectives across a planned ${timelineWeeks}-week cadence, the project establishes scalable milestones, rigorous QA acceptance benchmarks, and agile sprint deliveries designed to maximize ROI.`

    return {
      success: true,
      data: {
        title: projectTitle,
        clientName,
        executiveSummary,
        deliverables: evaluation.parsedDeliverables,
        tranches: evaluation.recommendedTranches,
        complianceMatrix: evaluation.complianceMatrix,
        feasibilityScore: evaluation.feasibilityScore
      }
    }
  } catch (error: any) {
    console.error('Error generating AI proposal draft:', error)
    return { success: false, error: error.message || 'Failed to generate proposal' }
  }
}
