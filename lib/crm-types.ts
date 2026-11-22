export type LeadStage = 'lead' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'

export type LeadSource = 'web' | 'referral' | 'whatsapp' | 'campaign' | 'phone' | 'excel_import' | 'google_sheets' | 'other'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

export interface DealItem {
    id: string
    name: string
    quantity: number
    unit_price: number
    gst_rate?: number
    total: number
}

export interface CRMTeamMember {
    id: string
    user_id?: string | null
    name: string
    email: string
    role: string
    roleSlug: string
    status: string
    avatar?: string
    activeDealsCount?: number
    wonDealsValue?: number
}

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
    assigned_member_id?: string | null
    assigned_member?: CRMTeamMember | null
    items?: DealItem[] | null
    converted_invoice_id?: string | null
    import_source?: string | null
    external_lead_id?: string | null
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
    assigned_member_id?: string | null
    assigned_member?: CRMTeamMember | null
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    created_at: string
    updated_at: string
}

export interface CRMStats {
    totalLeads: number
    pipelineValue: number
    wonDealsValue: number
    winRate: number
    weightedForecast?: number
    hotDealsCount?: number
    staleDealsCount?: number
    stageCounts: Record<LeadStage, number>
    stageValues: Record<LeadStage, number>
    memberPerformance?: Record<string, { dealsCount: number; wonCount: number; pipelineValue: number; wonValue: number }>
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
    assigned_member_id?: string
    customer_id?: string
    items?: DealItem[]
    import_source?: string
    external_lead_id?: string
}

export interface CreateActivityInput {
    lead_id?: string
    customer_id?: string
    type: ActivityType
    title: string
    description?: string
    due_date?: string
    assigned_member_id?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface LeadImportFieldMapping {
    title: string
    company_name?: string
    contact_name?: string
    email?: string
    phone?: string
    value?: string
    stage?: string
    source?: string
    assigned_to?: string
    notes?: string
    tags?: string
}

export interface GoogleSheetSyncConfig {
    id?: string
    name: string
    sheet_url: string
    sheet_id: string
    sheet_gid?: string
    column_mapping: LeadImportFieldMapping
    duplicate_strategy: 'skip' | 'update' | 'create'
    default_stage: LeadStage
    default_assigned_member_id?: string | null
    auto_sync?: boolean
    sync_interval_minutes?: number
    last_synced_at?: string | null
    last_sync_status?: string
    last_sync_error?: string | null
    imported_count?: number
}

export interface BatchImportResult {
    success: boolean
    totalRows: number
    importedCount: number
    skippedDuplicatesCount: number
    failedCount: number
    errors: string[]
    leads?: CRMLead[]
}
