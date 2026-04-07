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
    payment_qr_code_url?: string
    show_qr_code?: boolean
    digital_signature_url?: string
    show_signature?: boolean
    company_stamp_url?: string
    show_stamp?: boolean
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

// Columns added in optional migrations — saved best-effort (silent fail if DB not yet migrated)
const MIGRATION_COLUMNS = [
    'payment_qr_code_url', 'show_qr_code',
    'digital_signature_url', 'show_signature',
    'company_stamp_url', 'show_stamp',
]

function splitSettings(data: Record<string, unknown>) {
    const base: Record<string, unknown> = {}
    const migration: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
        if (MIGRATION_COLUMNS.includes(k)) migration[k] = v
        else base[k] = v
    }
    return { base, migration }
}

export async function saveInvoiceSettings(settings: InvoiceSettings) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        // Strip undefined/null
        const clean = Object.fromEntries(
            Object.entries(settings).filter(([, v]) => v !== undefined && v !== null)
        )
        const { base: baseSettings, migration: migSettings } = splitSettings(clean)

        const existing = await getInvoiceSettings()

        if (existing) {
            // Step 1 — save base columns (always present in schema)
            const { error } = await supabase
                .from('invoice_settings')
                .update({ ...baseSettings, updated_at: new Date().toISOString() })
                .eq('user_id', user.id)
            if (error) {
                console.error('Error updating invoice settings:', error)
                throw new Error('Failed to update invoice settings')
            }
            // Step 2 — save migration columns best-effort (silently skip if DB not migrated)
            if (Object.keys(migSettings).length > 0) {
                const { error: migError } = await supabase
                    .from('invoice_settings')
                    .update(migSettings)
                    .eq('user_id', user.id)
                if (migError) console.warn('Migration columns not saved (run migration SQL):', migError.message)
            }
        } else {
            // Step 1 — insert base columns
            const { error } = await supabase
                .from('invoice_settings')
                .insert([{ user_id: user.id, ...baseSettings }])
            if (error) {
                console.error('Error creating invoice settings:', error)
                throw new Error('Failed to create invoice settings')
            }
            // Step 2 — migration columns best-effort update (after insert)
            if (Object.keys(migSettings).length > 0) {
                const { error: migError } = await supabase
                    .from('invoice_settings')
                    .update(migSettings)
                    .eq('user_id', user.id)
                if (migError) console.warn('Migration columns not saved (run migration SQL):', migError.message)
            }
        }

        revalidatePath('/invoices/settings')
        return { success: true }
    } catch (err) {
        console.error('Error in saveInvoiceSettings:', err)
        throw err
    }
}
