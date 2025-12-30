'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface InvoiceSettings {
    id?: string
    user_id?: string
    company_name?: string
    company_email?: string
    company_phone?: string
    company_address?: string
    company_gstin?: string
    company_logo_url?: string
    logo_size?: 'small' | 'medium' | 'large'
    company_font_family?: string
    company_font_size?: number
    company_name_color?: string
    company_font_weight?: 'normal' | 'bold' | 'bolder'
    company_details_font_family?: string
    company_details_font_size?: number
    company_details_color?: string
    terms_font_family?: string
    terms_font_size?: number
    invoice_font_family?: string
    invoice_font_size?: number
    invoice_prefix?: string
    primary_color?: string
    secondary_color?: string
    terms_and_conditions?: string
    payment_instructions?: string
    footer_text?: string
    show_logo?: boolean
    show_company_details?: boolean
    show_gstin?: boolean
}

export async function getInvoiceSettings(): Promise<InvoiceSettings | null> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return null

        const { data, error } = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) {
            // If no settings exist yet, return null
            if (error.code === 'PGRST116') return null
            console.error('Error fetching invoice settings:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            })
            return null
        }

        return data
    } catch (err) {
        console.error('Unexpected error in getInvoiceSettings:', err)
        return null
    }
}

export async function saveInvoiceSettings(settings: InvoiceSettings) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            throw new Error('Not authenticated')
        }

        // Check if settings exist
        const existing = await getInvoiceSettings()

        if (existing) {
            // Update existing settings
            const { error } = await supabase
                .from('invoice_settings')
                .update({
                    ...settings,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)

            if (error) {
                console.error('Error updating invoice settings:', error)
                throw new Error('Failed to update invoice settings')
            }
        } else {
            // Create new settings
            const { error } = await supabase
                .from('invoice_settings')
                .insert([{
                    user_id: user.id,
                    ...settings
                }])

            if (error) {
                console.error('Error creating invoice settings:', error)
                throw new Error('Failed to create invoice settings')
            }
        }

        revalidatePath('/invoices/settings')
        return { success: true }
    } catch (err) {
        console.error('Error in saveInvoiceSettings:', err)
        throw err
    }
}
