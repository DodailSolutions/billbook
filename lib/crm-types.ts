export type LeadStage = 'lead' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'

export type LeadSource = 'web' | 'referral' | 'whatsapp' | 'campaign' | 'phone' | 'other'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

export interface CRMLead {
    id: string
    user_id: string
    customer_id?: string | null
    title: string
    company_name?: string | null
    contact_name?: string | null
    email?: string | null
    phone?: string | null
    value: number
    currency: string
    stage: LeadStage
    probability: number
    expected_close_date?: string | null
    source: LeadSource
    notes?: string | null
    tags?: string[] | null
    assigned_to?: string | null
    created_at: string
    updated_at: string
}

export interface CRMActivity {
    id: string
    user_id: string
    lead_id?: string | null
    customer_id?: string | null
    type: ActivityType
    title: string
    description?: string | null
    due_date?: string | null
    completed: boolean
    completed_at?: string | null
    created_at: string
    updated_at: string
}

export interface CRMStats {
    totalLeads: number
    pipelineValue: number
    wonDealsValue: number
    winRate: number
    stageCounts: Record<LeadStage, number>
    stageValues: Record<LeadStage, number>
}

export interface CreateLeadInput {
    title: string
    company_name?: string
    contact_name?: string
    email?: string
    phone?: string
    value?: number
    currency?: string
    stage?: LeadStage
    probability?: number
    expected_close_date?: string
    source?: LeadSource
    notes?: string
    tags?: string[]
    assigned_to?: string
    customer_id?: string
}

export interface CreateActivityInput {
    lead_id?: string
    customer_id?: string
    type: ActivityType
    title: string
    description?: string
    due_date?: string
}
