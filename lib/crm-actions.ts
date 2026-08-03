'use me' // Server actions directive
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CRMLead, CRMActivity, CRMStats, CreateLeadInput, CreateActivityInput, LeadStage } from "./crm-types"

export async function getLeadsList(): Promise<CRMLead[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching CRM leads:', error)
        return []
    }

    return data as CRMLead[]
}

export async function createLead(input: CreateLeadInput): Promise<{ success: boolean; data?: CRMLead; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const newLead = {
        user_id: user.id,
        title: input.title,
        company_name: input.company_name || null,
        contact_name: input.contact_name || null,
        email: input.email || null,
        phone: input.phone || null,
        value: input.value || 0,
        currency: input.currency || 'INR',
        stage: input.stage || 'lead',
        probability: input.probability ?? 20,
        expected_close_date: input.expected_close_date || null,
        source: input.source || 'web',
        notes: input.notes || null,
        tags: input.tags || [],
        assigned_to: input.assigned_to || null,
        customer_id: input.customer_id || null,
    }

    const { data, error } = await supabase
        .from('crm_leads')
        .insert([newLead])
        .select()
        .single()

    if (error) {
        console.error('Error creating lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true, data: data as CRMLead }
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Auto adjust probability based on stage
    const probabilityMap: Record<LeadStage, number> = {
        lead: 20,
        contacted: 40,
        proposal_sent: 60,
        negotiation: 80,
        won: 100,
        lost: 0
    }

    const { error } = await supabase
        .from('crm_leads')
        .update({ 
            stage, 
            probability: probabilityMap[stage],
            updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating lead stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function updateLead(id: string, input: Partial<CreateLeadInput>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('crm_leads')
        .update({
            ...input,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function getActivitiesList(leadId?: string): Promise<CRMActivity[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    let query = supabase
        .from('crm_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (leadId) {
        query = query.eq('lead_id', leadId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching activities:', error)
        return []
    }

    return data as CRMActivity[]
}

export async function createActivity(input: CreateActivityInput): Promise<{ success: boolean; data?: CRMActivity; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const newActivity = {
        user_id: user.id,
        lead_id: input.lead_id || null,
        customer_id: input.customer_id || null,
        type: input.type,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date || null,
        completed: false,
    }

    const { data, error } = await supabase
        .from('crm_activities')
        .insert([newActivity])
        .select()
        .single()

    if (error) {
        console.error('Error creating activity:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true, data: data as CRMActivity }
}

export async function toggleActivityCompleted(id: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('crm_activities')
        .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error toggling activity:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function getCRMStats(): Promise<CRMStats> {
    const leads = await getLeadsList()

    const stageCounts: Record<LeadStage, number> = {
        lead: 0,
        contacted: 0,
        proposal_sent: 0,
        negotiation: 0,
        won: 0,
        lost: 0
    }

    const stageValues: Record<LeadStage, number> = {
        lead: 0,
        contacted: 0,
        proposal_sent: 0,
        negotiation: 0,
        won: 0,
        lost: 0
    }

    let pipelineValue = 0
    let wonDealsValue = 0

    for (const lead of leads) {
        const val = Number(lead.value || 0)
        stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1
        stageValues[lead.stage] = (stageValues[lead.stage] || 0) + val

        if (lead.stage !== 'lost') {
            pipelineValue += val
        }
        if (lead.stage === 'won') {
            wonDealsValue += val
        }
    }

    const totalClosed = stageCounts.won + stageCounts.lost
    const winRate = totalClosed > 0 ? Math.round((stageCounts.won / totalClosed) * 100) : 0

    return {
        totalLeads: leads.length,
        pipelineValue,
        wonDealsValue,
        winRate,
        stageCounts,
        stageValues
    }
}
