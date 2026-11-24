'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { 
    CRMLead, 
    CRMActivity, 
    CRMStats, 
    CreateLeadInput, 
    CreateActivityInput, 
    LeadStage, 
    CRMTeamMember, 
    BatchImportResult, 
    GoogleSheetSyncConfig,
    LeadImportFieldMapping
} from "./crm-types"
import { parseCSV, parseGoogleSheetUrl, mapRowToLead } from "./crm-import-utils"

/**
 * Resolves the primary organization owner ID.
 * If current user is an invited team member, returns the owner's user_id.
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
 * Fetch all CRM Team Members available for assignment in the organization.
 * Includes the workspace owner plus all invited active team members with their roles.
 */
export async function getCRMTeamMembers(): Promise<CRMTeamMember[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const membersList: CRMTeamMember[] = []

    try {
        // 1. Fetch Owner Profile
        const { data: ownerProfile } = await supabase
            .from('user_profiles')
            .select('name, email')
            .eq('id', ownerId)
            .maybeSingle()

        membersList.push({
            id: ownerId,
            user_id: ownerId,
            name: ownerProfile?.name || 'Workspace Owner',
            email: ownerProfile?.email || user.email || '',
            role: 'Owner / Admin',
            roleSlug: 'owner',
            status: 'active'
        })

        // 2. Fetch Team Members
        const { data: teamMembers, error } = await supabase
            .from('team_members')
            .select(`
                id,
                email,
                user_id,
                status,
                role:team_roles(name, slug)
            `)
            .eq('owner_id', ownerId)
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: true })

        if (!error && Array.isArray(teamMembers)) {
            for (const tm of teamMembers) {
                // If member has accepted invite and has a linked user_id, try to fetch display name
                let memberName = tm.email.split('@')[0]
                if (tm.user_id) {
                    const { data: p } = await supabase
                        .from('user_profiles')
                        .select('name')
                        .eq('id', tm.user_id)
                        .maybeSingle()
                    if (p?.name) memberName = p.name
                }

                const roleName = (tm.role as any)?.name || 'Team Member'
                const roleSlug = (tm.role as any)?.slug || 'member'

                membersList.push({
                    id: tm.id,
                    user_id: tm.user_id || null,
                    name: memberName,
                    email: tm.email,
                    role: roleName,
                    roleSlug,
                    status: tm.status
                })
            }
        }

        // 3. Bi-Directional Sync: Fetch Employees (Payroll & Organization Roster -> CRM Assignees)
        try {
            const { data: employees, error: empErr } = await supabase
                .from('employees')
                .select('id, name, email, designation, department, status')
                .eq('user_id', ownerId)
                .eq('status', 'active')
                .order('name', { ascending: true })

            if (!empErr && Array.isArray(employees)) {
                const existingEmails = new Set(membersList.map(m => (m.email || '').toLowerCase().trim()).filter(Boolean))

                for (const emp of employees) {
                    const empEmail = (emp.email || '').toLowerCase().trim()

                    if (empEmail && existingEmails.has(empEmail)) {
                        const existing = membersList.find(m => (m.email || '').toLowerCase().trim() === empEmail)
                        if (existing) {
                            if (emp.name && (!existing.name || existing.name === empEmail.split('@')[0])) {
                                existing.name = emp.name
                            }
                            if (emp.designation) {
                                existing.role = emp.designation
                            }
                        }
                        continue
                    }

                    membersList.push({
                        id: emp.id,
                        user_id: null,
                        name: emp.name || (empEmail ? empEmail.split('@')[0] : 'Employee'),
                        email: emp.email || '',
                        role: emp.designation || emp.department || 'Employee',
                        roleSlug: 'employee',
                        status: emp.status || 'active'
                    })
                    if (empEmail) existingEmails.add(empEmail)
                }
            }
        } catch (empCatch) {
            console.warn('[getCRMTeamMembers] employees sync warning:', empCatch)
        }
    } catch (err) {
        console.error('Error fetching CRM team members:', err)
    }

    return membersList
}

export async function getLeadsList(): Promise<CRMLead[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching CRM leads:', error)
        return []
    }

    // Enrich leads with team member info if assigned_member_id exists
    const teamMembers = await getCRMTeamMembers()
    const memberMap = new Map<string, CRMTeamMember>()
    teamMembers.forEach(m => memberMap.set(m.id, m))

    const enriched = (data as CRMLead[]).map(lead => {
        if (lead.assigned_member_id && memberMap.has(lead.assigned_member_id)) {
            return {
                ...lead,
                assigned_member: memberMap.get(lead.assigned_member_id)
            }
        }
        return lead
    })

    return enriched
}

export async function createLead(input: CreateLeadInput): Promise<{ success: boolean; data?: CRMLead; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const newLead = {
        user_id: ownerId,
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
        assigned_member_id: input.assigned_member_id || null,
        customer_id: input.customer_id || null,
        items: input.items || [],
        import_source: input.import_source || 'manual',
        external_lead_id: input.external_lead_id || null,
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
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

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
        .eq('user_id', ownerId)

    if (error) {
        console.error('Error updating lead stage:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function assignLeadToMember(
    leadId: string, 
    memberId: string | null, 
    memberName?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { error } = await supabase
        .from('crm_leads')
        .update({
            assigned_member_id: memberId || null,
            assigned_to: memberName || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', ownerId)

    if (error) {
        console.error('Error assigning lead to member:', error)
        return { success: false, error: error.message }
    }

    // Auto-log assignment activity
    try {
        await supabase.from('crm_activities').insert({
            user_id: ownerId,
            lead_id: leadId,
            type: 'task',
            title: memberName ? `Deal assigned to ${memberName}` : 'Deal unassigned',
            completed: true,
            completed_at: new Date().toISOString()
        })
    } catch {}

    revalidatePath('/crm')
    return { success: true }
}

export async function bulkAssignLeads(
    leadIds: string[], 
    memberId: string | null, 
    memberName?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { error } = await supabase
        .from('crm_leads')
        .update({
            assigned_member_id: memberId || null,
            assigned_to: memberName || null,
            updated_at: new Date().toISOString()
        })
        .in('id', leadIds)
        .eq('user_id', ownerId)

    if (error) {
        console.error('Error bulk assigning leads:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function updateLead(id: string, input: Partial<CreateLeadInput>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { error } = await supabase
        .from('crm_leads')
        .update({
            ...input,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', ownerId)

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
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id)
        .eq('user_id', ownerId)

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
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    let query = supabase
        .from('crm_activities')
        .select('*')
        .eq('user_id', ownerId)
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
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const newActivity = {
        user_id: ownerId,
        lead_id: input.lead_id || null,
        customer_id: input.customer_id || null,
        type: input.type,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date || null,
        assigned_member_id: input.assigned_member_id || null,
        priority: input.priority || 'medium',
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
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { error } = await supabase
        .from('crm_activities')
        .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', ownerId)

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

    const memberPerformance: Record<string, { dealsCount: number; wonCount: number; pipelineValue: number; wonValue: number }> = {}

    let pipelineValue = 0
    let wonDealsValue = 0
    let weightedForecast = 0
    let hotDealsCount = 0
    let staleDealsCount = 0

    const now = Date.now()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

    for (const lead of leads) {
        const val = Number(lead.value || 0)
        const prob = Number(lead.probability || 0)
        stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1
        stageValues[lead.stage] = (stageValues[lead.stage] || 0) + val

        // Member performance tracker
        const memberKey = lead.assigned_member_id || lead.assigned_to || 'unassigned'
        if (!memberPerformance[memberKey]) {
            memberPerformance[memberKey] = { dealsCount: 0, wonCount: 0, pipelineValue: 0, wonValue: 0 }
        }
        memberPerformance[memberKey].dealsCount += 1
        memberPerformance[memberKey].pipelineValue += val

        if (lead.stage !== 'lost') {
            pipelineValue += val
            weightedForecast += Math.round((val * prob) / 100)

            if (prob >= 70 || lead.stage === 'negotiation' || (val >= 50000 && prob >= 50)) {
                hotDealsCount += 1
            }

            const updatedTime = new Date(lead.updated_at || lead.created_at).getTime()
            if (lead.stage !== 'won' && (now - updatedTime > sevenDaysMs)) {
                staleDealsCount += 1
            }
        }
        if (lead.stage === 'won') {
            wonDealsValue += val
            memberPerformance[memberKey].wonCount += 1
            memberPerformance[memberKey].wonValue += val
        }
    }

    const totalClosed = stageCounts.won + stageCounts.lost
    const winRate = totalClosed > 0 ? Math.round((stageCounts.won / totalClosed) * 100) : 0

    return {
        totalLeads: leads.length,
        pipelineValue,
        wonDealsValue,
        winRate,
        weightedForecast,
        hotDealsCount,
        staleDealsCount,
        stageCounts,
        stageValues,
        memberPerformance
    }
}

// ========================================================
// 100% ERP INTERCONNECTIVITY ACTIONS
// ========================================================

/**
 * Converts a CRM Lead into an official Customer in the Customers Master table.
 * Automatically links `crm_leads.customer_id`.
 */
export async function convertLeadToCustomer(leadId: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    // 1. Fetch Lead
    const { data: lead, error: fetchErr } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', ownerId)
        .single()

    if (fetchErr || !lead) {
        return { success: false, error: 'Lead not found' }
    }

    if (lead.customer_id) {
        return { success: true, customerId: lead.customer_id }
    }

    // 2. Determine Customer Name & Details
    const customerName = lead.company_name || lead.contact_name || lead.title
    const customerEmail = lead.email || null
    const customerPhone = lead.phone || null
    const customerAddress = lead.notes ? `Note from CRM: ${lead.notes}` : null

    // 3. Insert into customers table
    const { data: newCustomer, error: insertErr } = await supabase
        .from('customers')
        .insert([{
            user_id: ownerId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress
        }])
        .select('id')
        .single()

    if (insertErr || !newCustomer) {
        console.error('Error converting lead to customer:', insertErr)
        return { success: false, error: insertErr?.message || 'Failed to create customer' }
    }

    // 4. Link lead to customer and mark activity
    await supabase
        .from('crm_leads')
        .update({ customer_id: newCustomer.id, updated_at: new Date().toISOString() })
        .eq('id', leadId)

    await supabase.from('crm_activities').insert({
        user_id: ownerId,
        lead_id: leadId,
        customer_id: newCustomer.id,
        type: 'task',
        title: `Converted prospect into official Customer: "${customerName}"`,
        completed: true,
        completed_at: new Date().toISOString()
    })

    revalidatePath('/crm')
    revalidatePath('/customers')
    return { success: true, customerId: newCustomer.id }
}

/**
 * Links a generated Tax Invoice to a CRM Deal and marks deal stage as 'won'.
 */
export async function linkLeadToInvoice(
    leadId: string, 
    invoiceId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { error } = await supabase
        .from('crm_leads')
        .update({
            converted_invoice_id: invoiceId,
            stage: 'won',
            probability: 100,
            updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', ownerId)

    if (error) {
        console.error('Error linking invoice to lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    revalidatePath('/invoices')
    return { success: true }
}

// ========================================================
// LEAD IMPORT & GOOGLE SHEETS LIVE SYNC
// ========================================================

/**
 * Fetches and parses live data from a Google Sheet URL.
 */
export async function fetchGoogleSheetData(sheetUrl: string): Promise<{ 
    success: boolean; 
    headers?: string[]; 
    rows?: Record<string, string>[]; 
    totalRows?: number;
    sheetId?: string;
    gid?: string;
    error?: string 
}> {
    try {
        const parsed = parseGoogleSheetUrl(sheetUrl)
        if (!parsed) {
            return { 
                success: false, 
                error: 'Invalid Google Sheet URL. Please ensure it is a valid Google Spreadsheet URL.' 
            }
        }

        const response = await fetch(parsed.exportCsvUrl, {
            headers: {
                'User-Agent': 'BillBook-CRM-Sync/1.0'
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            return {
                success: false,
                error: `Could not fetch Google Sheet (HTTP ${response.status}). Please make sure the sheet sharing is set to "Anyone with the link can view".`
            }
        }

        const csvContent = await response.text()
        if (!csvContent || csvContent.trim().length === 0) {
            return { success: false, error: 'Google Sheet appears to be empty.' }
        }

        const { headers, rows } = parseCSV(csvContent)
        return {
            success: true,
            headers,
            rows: rows.slice(0, 1000), // Safety cap for single batch preview
            totalRows: rows.length,
            sheetId: parsed.sheetId,
            gid: parsed.gid
        }
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to connect to Google Sheets.'
        }
    }
}

/**
 * Batch imports leads with duplicate detection and error handling.
 */
export async function batchImportLeads(
    leads: CreateLeadInput[],
    options: {
        duplicateStrategy?: 'skip' | 'update' | 'create'
        importSource?: string
    } = {}
): Promise<BatchImportResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            success: false,
            totalRows: leads.length,
            importedCount: 0,
            skippedDuplicatesCount: 0,
            failedCount: leads.length,
            errors: ['Unauthorized. Please log in.']
        }
    }

    const ownerId = await getEffectiveOwnerId(supabase, user.id)
    const strategy = options.duplicateStrategy || 'skip'
    const sourceTag = options.importSource || 'excel_import'

    // Fetch existing leads for duplicate checking (by email or phone)
    const { data: existingLeads } = await supabase
        .from('crm_leads')
        .select('id, email, phone, title')
        .eq('user_id', ownerId)

    const existingEmails = new Set<string>()
    const existingPhones = new Set<string>()

    if (Array.isArray(existingLeads)) {
        existingLeads.forEach(l => {
            if (l.email) existingEmails.add(l.email.toLowerCase().trim())
            if (l.phone) existingPhones.add(l.phone.replace(/[^0-9]/g, ''))
        })
    }

    const leadsToInsert: any[] = []
    let skippedDuplicatesCount = 0
    const errors: string[] = []

    for (const item of leads) {
        const emailKey = item.email?.toLowerCase().trim()
        const cleanPhone = item.phone?.replace(/[^0-9]/g, '')

        const isDuplicate = (emailKey && existingEmails.has(emailKey)) || (cleanPhone && cleanPhone.length >= 7 && existingPhones.has(cleanPhone))

        if (isDuplicate && strategy === 'skip') {
            skippedDuplicatesCount++
            continue
        }

        // Probability map
        const probabilityMap: Record<LeadStage, number> = {
            lead: 20,
            contacted: 40,
            proposal_sent: 60,
            negotiation: 80,
            won: 100,
            lost: 0
        }

        const stage = item.stage || 'lead'

        leadsToInsert.push({
            user_id: ownerId,
            title: item.title,
            company_name: item.company_name || null,
            contact_name: item.contact_name || null,
            email: item.email || null,
            phone: item.phone || null,
            value: item.value || 0,
            currency: item.currency || 'INR',
            stage,
            probability: item.probability ?? probabilityMap[stage],
            expected_close_date: item.expected_close_date || null,
            source: item.source || sourceTag,
            notes: item.notes || null,
            tags: item.tags || [],
            assigned_to: item.assigned_to || null,
            assigned_member_id: item.assigned_member_id || null,
            import_source: sourceTag,
        })

        // Track in current batch to avoid internal duplicates
        if (emailKey) existingEmails.add(emailKey)
        if (cleanPhone && cleanPhone.length >= 7) existingPhones.add(cleanPhone)
    }

    // Chunked insertion (50 rows per batch)
    let importedCount = 0
    const chunkSize = 50

    for (let i = 0; i < leadsToInsert.length; i += chunkSize) {
        const chunk = leadsToInsert.slice(i, i + chunkSize)
        const { error } = await supabase.from('crm_leads').insert(chunk)

        if (error) {
            console.error('Error inserting chunk:', error)
            errors.push(`Batch error at row ${i + 1}: ${error.message}`)
        } else {
            importedCount += chunk.length
        }
    }

    revalidatePath('/crm')

    return {
        success: errors.length === 0,
        totalRows: leads.length,
        importedCount,
        skippedDuplicatesCount,
        failedCount: leads.length - importedCount - skippedDuplicatesCount,
        errors
    }
}

/**
 * Save Google Sheet Integration configuration.
 */
export async function saveGoogleSheetIntegration(
    config: GoogleSheetSyncConfig
): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const payload = {
        user_id: ownerId,
        name: config.name || 'Google Sheet Leads',
        sheet_url: config.sheet_url,
        sheet_id: config.sheet_id,
        sheet_gid: config.sheet_gid || '0',
        column_mapping: config.column_mapping,
        duplicate_strategy: config.duplicate_strategy || 'skip',
        default_stage: config.default_stage || 'lead',
        default_assigned_member_id: config.default_assigned_member_id || null,
        auto_sync: config.auto_sync || false,
        last_synced_at: new Date().toISOString(),
        last_sync_status: 'success'
    }

    const { data, error } = await supabase
        .from('crm_sheet_integrations')
        .insert([payload])
        .select('id')
        .single()

    if (error) {
        console.error('Error saving Google Sheet integration:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/crm')
    return { success: true, id: data?.id }
}

/**
 * Retrieve saved Google Sheet integrations.
 */
export async function getGoogleSheetIntegrations(): Promise<GoogleSheetSyncConfig[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []
    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { data, error } = await supabase
        .from('crm_sheet_integrations')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false })

    if (error) {
        return []
    }

    return (data || []) as GoogleSheetSyncConfig[]
}

/**
 * Perform manual re-sync of a saved Google Sheet integration.
 */
export async function syncGoogleSheetIntegration(integrationId: string): Promise<BatchImportResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            success: false,
            totalRows: 0,
            importedCount: 0,
            skippedDuplicatesCount: 0,
            failedCount: 0,
            errors: ['Unauthorized']
        }
    }

    const ownerId = await getEffectiveOwnerId(supabase, user.id)

    const { data: integration, error } = await supabase
        .from('crm_sheet_integrations')
        .select('*')
        .eq('id', integrationId)
        .eq('user_id', ownerId)
        .single()

    if (error || !integration) {
        return {
            success: false,
            totalRows: 0,
            importedCount: 0,
            skippedDuplicatesCount: 0,
            failedCount: 0,
            errors: ['Integration not found']
        }
    }

    const sheetData = await fetchGoogleSheetData(integration.sheet_url)
    if (!sheetData.success || !sheetData.rows) {
        await supabase
            .from('crm_sheet_integrations')
            .update({ last_sync_status: 'error', last_sync_error: sheetData.error })
            .eq('id', integrationId)

        return {
            success: false,
            totalRows: 0,
            importedCount: 0,
            skippedDuplicatesCount: 0,
            failedCount: 0,
            errors: [sheetData.error || 'Failed to fetch sheet data']
        }
    }

    const leads: CreateLeadInput[] = []
    for (const row of sheetData.rows) {
        const lead = mapRowToLead(row, integration.column_mapping, {
            stage: integration.default_stage as LeadStage,
            source: 'google_sheets',
            assigned_member_id: integration.default_assigned_member_id
        })
        if (lead) leads.push(lead)
    }

    const result = await batchImportLeads(leads, {
        duplicateStrategy: integration.duplicate_strategy || 'skip',
        importSource: 'google_sheets'
    })

    await supabase
        .from('crm_sheet_integrations')
        .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: result.success ? 'success' : 'partial',
            imported_count: (integration.imported_count || 0) + result.importedCount
        })
        .eq('id', integrationId)

    revalidatePath('/crm')
    return result
}
