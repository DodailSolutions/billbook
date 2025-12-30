'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ReminderWithDetails } from '@/lib/types'

export async function getReminders(): Promise<ReminderWithDetails[]> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('Auth error in getReminders:', authError?.message)
            return []
        }

        const { data, error } = await supabase
            .from('reminders')
            .select(`
                *,
                invoice:invoices(invoice_number, total, due_date, status),
                recurring_invoice:recurring_invoices(frequency, next_invoice_date)
            `)
            .eq('user_id', user.id)
            .eq('is_sent', false)
            .order('reminder_date', { ascending: true })

        if (error) {
            console.error('Error fetching reminders:', error.message)
            return []
        }

        return data as ReminderWithDetails[] || []
    } catch (err) {
        console.error('Unexpected error in getReminders:', err)
        return []
    }
}

export async function getUpcomingReminders(days: number = 7): Promise<ReminderWithDetails[]> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return []
        }

        const today = new Date().toISOString().split('T')[0]
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)
        const futureDateStr = futureDate.toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('reminders')
            .select(`
                *,
                invoice:invoices(invoice_number, total, due_date, status),
                recurring_invoice:recurring_invoices(frequency, next_invoice_date)
            `)
            .eq('user_id', user.id)
            .eq('is_sent', false)
            .gte('reminder_date', today)
            .lte('reminder_date', futureDateStr)
            .order('reminder_date', { ascending: true })

        if (error) {
            console.error('Error fetching upcoming reminders:', error.message)
            return []
        }

        return data as ReminderWithDetails[] || []
    } catch (err) {
        console.error('Unexpected error in getUpcomingReminders:', err)
        return []
    }
}

export async function markReminderAsSent(reminderId: string) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return
        }

        const { error } = await supabase
            .from('reminders')
            .update({
                is_sent: true,
                sent_at: new Date().toISOString()
            })
            .eq('id', reminderId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error marking reminder as sent:', error)
            throw new Error('Failed to mark reminder as sent')
        }

        revalidatePath('/reminders')
    } catch (err) {
        console.error('Error in markReminderAsSent:', err)
        throw err
    }
}

export async function createReminderForInvoice(
    invoiceId: string,
    reminderDate: string,
    daysBefore: number,
    message?: string
) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return
        }

        const { error } = await supabase
            .from('reminders')
            .insert([{
                user_id: user.id,
                invoice_id: invoiceId,
                reminder_type: 'due_date',
                reminder_date: reminderDate,
                days_before: daysBefore,
                message: message || `Reminder: Invoice payment is due in ${daysBefore} days`
            }])

        if (error) {
            console.error('Error creating reminder:', error)
            throw new Error('Failed to create reminder')
        }

        revalidatePath('/reminders')
    } catch (err) {
        console.error('Error in createReminderForInvoice:', err)
        throw err
    }
}

export async function deleteReminder(reminderId: string) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return
        }

        const { error } = await supabase
            .from('reminders')
            .delete()
            .eq('id', reminderId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting reminder:', error)
            throw new Error('Failed to delete reminder')
        }

        revalidatePath('/reminders')
    } catch (err) {
        console.error('Error in deleteReminder:', err)
        throw err
    }
}
