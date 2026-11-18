'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupportTicket, SupportTicketMessage } from './types-admin'

export interface SupportTicketWithDetails extends SupportTicket {
    user_email?: string
    user_name?: string
    sla_hours_remaining?: number
    is_sla_breached?: boolean
}

/**
 * Calculates SLA based on priority:
 * Urgent: 4 hours
 * High: 12 hours
 * Medium: 24 hours
 * Low: 48 hours
 */
function getSlaTargetHours(priority: string): number {
    switch (priority) {
        case 'urgent': return 4
        case 'high': return 12
        case 'medium': return 24
        case 'low': return 48
        default: return 24
    }
}

export async function getSupportTickets(): Promise<SupportTicketWithDetails[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                user:user_profiles!user_id(owner_name, business_name, business_email)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            // If table does not exist or error, fallback to fallback query without join
            console.warn('Support tickets join query notice:', error.message)
            const { data: rawData, error: rawErr } = await supabase
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false })

            if (rawErr || !rawData) return []
            return mapSla(rawData)
        }

        return mapSla(data || [])
    } catch (e) {
        console.error('getSupportTickets error:', e)
        return []
    }
}

function mapSla(tickets: any[]): SupportTicketWithDetails[] {
    const now = Date.now()
    return tickets.map(t => {
        const createdMs = new Date(t.created_at).getTime()
        const targetHours = getSlaTargetHours(t.priority || 'medium')
        const targetMs = createdMs + (targetHours * 60 * 60 * 1000)
        const hoursRemaining = Math.round((targetMs - now) / (1000 * 60 * 60))
        const isBreached = t.status !== 'resolved' && t.status !== 'closed' && hoursRemaining < 0

        const userProfile = t.user as any
        return {
            ...t,
            user_name: userProfile?.owner_name || userProfile?.business_name || 'Customer',
            user_email: userProfile?.business_email || '',
            sla_hours_remaining: hoursRemaining,
            is_sla_breached: isBreached
        }
    })
}

export async function createSupportTicket(input: {
    subject: string
    description: string
    category?: 'billing' | 'technical' | 'feature_request' | 'other'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const ticketNumber = `TICK-${Date.now().toString().slice(-6)}`

        const newTicket = {
            ticket_number: ticketNumber,
            user_id: user.id,
            subject: input.subject.trim(),
            description: input.description.trim(),
            category: input.category || 'other',
            priority: input.priority || 'medium',
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('support_tickets')
            .insert([newTicket])
            .select()
            .single()

        if (error) {
            console.error('Error creating support ticket:', error)
            return { success: false, error: error.message }
        }

        // Also add first message
        await supabase
            .from('support_ticket_messages')
            .insert([{
                ticket_id: data.id,
                user_id: user.id,
                message: input.description.trim(),
                is_internal: false,
                created_at: new Date().toISOString()
            }])

        revalidatePath('/admin/support')
        return { success: true, data }
    } catch (e: any) {
        return { success: false, error: e?.message || 'Failed to create ticket' }
    }
}

export async function updateTicketStatus(
    ticketId: string, 
    status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const updatePayload: Record<string, any> = {
            status,
            updated_at: new Date().toISOString()
        }
        if (status === 'resolved' || status === 'closed') {
            updatePayload.resolved_at = new Date().toISOString()
        }

        const { error } = await supabase
            .from('support_tickets')
            .update(updatePayload)
            .eq('id', ticketId)

        if (error) return { success: false, error: error.message }
        revalidatePath('/admin/support')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e?.message || 'Failed to update status' }
    }
}

export async function addTicketReply(
    ticketId: string,
    message: string,
    isInternal: boolean = false
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { error } = await supabase
            .from('support_ticket_messages')
            .insert([{
                ticket_id: ticketId,
                user_id: user.id,
                message: message.trim(),
                is_internal: isInternal,
                created_at: new Date().toISOString()
            }])

        if (error) return { success: false, error: error.message }

        // Touch ticket updated_at
        await supabase
            .from('support_tickets')
            .update({ updated_at: new Date().toISOString(), status: 'in_progress' })
            .eq('id', ticketId)

        revalidatePath('/admin/support')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e?.message || 'Failed to send reply' }
    }
}

export async function getSupportStats() {
    try {
        const tickets = await getSupportTickets()
        const total = tickets.length
        const open = tickets.filter(t => t.status === 'open').length
        const inProgress = tickets.filter(t => t.status === 'in_progress' || t.status === 'waiting').length
        const resolved = tickets.filter(t => t.status === 'resolved').length
        const closed = tickets.filter(t => t.status === 'closed').length
        const slaBreached = tickets.filter(t => t.is_sla_breached).length
        const urgent = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length

        // SLA resolution rate
        const slaCompliantCount = tickets.filter(t => !t.is_sla_breached).length
        const slaComplianceRate = total > 0 ? Math.round((slaCompliantCount / total) * 100) : 100

        return {
            total,
            open,
            inProgress,
            resolved,
            closed,
            slaBreached,
            urgent,
            slaComplianceRate
        }
    } catch (e) {
        return {
            total: 0,
            open: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0,
            slaBreached: 0,
            urgent: 0,
            slaComplianceRate: 100
        }
    }
}

export async function getCustomerSupportHistory(): Promise<{
    tickets: SupportTicket[]
    messagesByTicket: Record<string, SupportTicketMessage[]>
}> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { tickets: [], messagesByTicket: {} }

        const { data: tickets, error: ticketErr } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (ticketErr || !tickets || tickets.length === 0) {
            return { tickets: [], messagesByTicket: {} }
        }

        const ticketIds = tickets.map(t => t.id)
        const { data: messages } = await supabase
            .from('support_ticket_messages')
            .select('*')
            .in('ticket_id', ticketIds)
            .eq('is_internal', false)
            .order('created_at', { ascending: true })

        const messagesByTicket: Record<string, SupportTicketMessage[]> = {}
        tickets.forEach(t => { messagesByTicket[t.id] = [] })
        
        if (messages) {
            messages.forEach(m => {
                if (!messagesByTicket[m.ticket_id]) {
                    messagesByTicket[m.ticket_id] = []
                }
                messagesByTicket[m.ticket_id].push(m)
            })
        }

        return { tickets, messagesByTicket }
    } catch (e) {
        console.error('Error fetching customer support history:', e)
        return { tickets: [], messagesByTicket: {} }
    }
}

export async function sendCustomerMessageAction(input: {
    ticketId?: string
    message: string
    subject?: string
}): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        let targetTicketId = input.ticketId

        if (!targetTicketId) {
            // Find an open ticket or create a new one
            const { data: existingTicket } = await supabase
                .from('support_tickets')
                .select('id')
                .eq('user_id', user.id)
                .in('status', ['open', 'in_progress', 'waiting'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (existingTicket?.id) {
                targetTicketId = existingTicket.id
            } else {
                const ticketNumber = `TICK-${Date.now().toString().slice(-6)}`
                const subject = input.subject?.trim() || input.message.slice(0, 50).trim() || 'Customer Support Request'
                
                const { data: newTicket, error: createErr } = await supabase
                    .from('support_tickets')
                    .insert([{
                        ticket_number: ticketNumber,
                        user_id: user.id,
                        subject,
                        description: input.message.trim(),
                        category: 'technical',
                        priority: 'high',
                        status: 'open',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single()

                if (createErr || !newTicket) {
                    return { success: false, error: createErr?.message || 'Could not initiate support ticket' }
                }

                targetTicketId = newTicket.id
            }
        }

        const { error: msgErr } = await supabase
            .from('support_ticket_messages')
            .insert([{
                ticket_id: targetTicketId,
                user_id: user.id,
                message: input.message.trim(),
                is_internal: false,
                created_at: new Date().toISOString()
            }])

        if (msgErr) return { success: false, error: msgErr.message }

        // Touch ticket updated_at
        await supabase
            .from('support_tickets')
            .update({ 
                updated_at: new Date().toISOString(),
                status: 'open' 
            })
            .eq('id', targetTicketId)

        revalidatePath('/admin/support')
        return { success: true, ticketId: targetTicketId }
    } catch (e: any) {
        return { success: false, error: e?.message || 'Failed to send message' }
    }
}
