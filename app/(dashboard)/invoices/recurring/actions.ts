'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { RecurringInvoiceWithDetails } from '@/lib/types'

export async function getRecurringInvoices(): Promise<RecurringInvoiceWithDetails[]> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('Auth error in getRecurringInvoices:', authError?.message)
            return []
        }

        const { data, error } = await supabase
            .from('recurring_invoices')
            .select(`
                *,
                customer:customers(*),
                recurring_invoice_items(*)
            `)
            .eq('user_id', user.id)
            .order('next_invoice_date', { ascending: true })

        if (error) {
            console.error('Error fetching recurring invoices:', error.message)
            return []
        }

        return data as RecurringInvoiceWithDetails[] || []
    } catch (err) {
        console.error('Unexpected error in getRecurringInvoices:', err)
        return []
    }
}

export async function getRecurringInvoice(id: string): Promise<RecurringInvoiceWithDetails | null> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return null
        }

        const { data, error } = await supabase
            .from('recurring_invoices')
            .select(`
                *,
                customer:customers(*),
                recurring_invoice_items(*)
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching recurring invoice:', error.message)
            return null
        }

        return data as RecurringInvoiceWithDetails
    } catch (err) {
        console.error('Unexpected error in getRecurringInvoice:', err)
        return null
    }
}

interface CreateRecurringInvoiceData {
    customer_id: string
    frequency: 'monthly' | 'yearly'
    start_date: string
    end_date?: string
    gst_percentage: number
    notes?: string
    items: Array<{
        description: string
        quantity: number
        unit_price: number
    }>
}

export async function createRecurringInvoice(data: CreateRecurringInvoiceData) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return redirect('/login')
        }

        // Calculate next invoice date
        const startDate = new Date(data.start_date)
        const nextDate = new Date(startDate)
        if (data.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1)
        } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1)
        }

        // Create recurring invoice
        const { data: recurringInvoice, error: recurringError } = await supabase
            .from('recurring_invoices')
            .insert([{
                user_id: user.id,
                customer_id: data.customer_id,
                frequency: data.frequency,
                start_date: data.start_date,
                end_date: data.end_date || null,
                next_invoice_date: nextDate.toISOString().split('T')[0],
                gst_percentage: data.gst_percentage,
                notes: data.notes || null,
                is_active: true
            }])
            .select()
            .single()

        if (recurringError) {
            console.error('Error creating recurring invoice:', recurringError)
            throw new Error('Failed to create recurring invoice')
        }

        // Create recurring invoice items
        const items = data.items.map(item => ({
            recurring_invoice_id: recurringInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price
        }))

        const { error: itemsError } = await supabase
            .from('recurring_invoice_items')
            .insert(items)

        if (itemsError) {
            console.error('Error creating recurring invoice items:', itemsError)
            throw new Error('Failed to create recurring invoice items')
        }

        revalidatePath('/invoices/recurring')
        return redirect('/invoices/recurring')
    } catch (err) {
        console.error('Error in createRecurringInvoice:', err)
        throw err
    }
}

export async function updateRecurringInvoiceStatus(id: string, is_active: boolean) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return redirect('/login')
        }

        const { error } = await supabase
            .from('recurring_invoices')
            .update({ is_active })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating recurring invoice status:', error)
            throw new Error('Failed to update recurring invoice status')
        }

        revalidatePath('/invoices/recurring')
    } catch (err) {
        console.error('Error in updateRecurringInvoiceStatus:', err)
        throw err
    }
}

export async function deleteRecurringInvoice(id: string) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return redirect('/login')
        }

        const { error } = await supabase
            .from('recurring_invoices')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting recurring invoice:', error)
            throw new Error('Failed to delete recurring invoice')
        }

        revalidatePath('/invoices/recurring')
    } catch (err) {
        console.error('Error in deleteRecurringInvoice:', err)
        throw err
    }
}

export async function generateInvoiceFromRecurring(recurringInvoiceId: string) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return redirect('/login')
        }

        // Call the database function to generate invoice
        const { data, error } = await supabase.rpc('generate_recurring_invoice', {
            p_recurring_invoice_id: recurringInvoiceId
        })

        if (error) {
            console.error('Error generating invoice:', error)
            throw new Error('Failed to generate invoice from recurring template')
        }

        revalidatePath('/invoices')
        revalidatePath('/invoices/recurring')
        
        return data // Returns the new invoice ID
    } catch (err) {
        console.error('Error in generateInvoiceFromRecurring:', err)
        throw err
    }
}
