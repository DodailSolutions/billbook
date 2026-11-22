'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdateCapacityInput {
    memberId: string
    designation?: string
    allocated_hours?: number
    hourly_cost_rate?: number
    hourly_billing_rate?: number
    vertical_specialty?: string
}

export async function updateTeamMemberCapacity(input: UpdateCapacityInput) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        const updatePayload: Record<string, any> = {
            updated_at: new Date().toISOString()
        }

        if (input.designation !== undefined) updatePayload.designation = input.designation
        if (input.allocated_hours !== undefined) updatePayload.allocated_hours = Number(input.allocated_hours) || 0
        if (input.hourly_cost_rate !== undefined) updatePayload.hourly_cost_rate = Number(input.hourly_cost_rate) || 0
        if (input.hourly_billing_rate !== undefined) updatePayload.hourly_billing_rate = Number(input.hourly_billing_rate) || 0
        if (input.vertical_specialty !== undefined) updatePayload.vertical_specialty = input.vertical_specialty

        const { error } = await supabase
            .from('team_members')
            .update(updatePayload)
            .eq('id', input.memberId)
            .eq('owner_id', user.id)

        if (error) {
            console.error('Error updating team member capacity:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/team')
        revalidatePath('/crm')
        return { success: true }
    } catch (err: unknown) {
        console.error('Exception updating team member capacity:', err)
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}
