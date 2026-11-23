'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Organization, Customer } from '@/lib/types'

export async function getOrganizations(): Promise<Organization[]> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return []
        }

        // Fetch organizations
        const { data: orgs, error: orgsError } = await supabase
            .from('organizations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (orgsError) {
            console.warn('[getOrganizations] Table query error (table may not exist yet or empty):', orgsError.message)
            return []
        }

        if (!orgs || orgs.length === 0) {
            return []
        }

        // Fetch contacts counts & invoice totals for these organizations
        const orgIds = orgs.map(o => o.id)

        const [contactsRes, invoicesRes] = await Promise.all([
            supabase
                .from('customers')
                .select('id, organization_id')
                .in('organization_id', orgIds),
            supabase
                .from('invoices')
                .select('id, organization_id, total, status')
                .in('organization_id', orgIds)
        ])

        const contactsByOrg: Record<string, number> = {}
        if (contactsRes.data) {
            contactsRes.data.forEach((c: any) => {
                if (c.organization_id) {
                    contactsByOrg[c.organization_id] = (contactsByOrg[c.organization_id] || 0) + 1
                }
            })
        }

        const invoicesByOrg: Record<string, { count: number; total: number }> = {}
        if (invoicesRes.data) {
            invoicesRes.data.forEach((inv: any) => {
                if (inv.organization_id) {
                    if (!invoicesByOrg[inv.organization_id]) {
                        invoicesByOrg[inv.organization_id] = { count: 0, total: 0 }
                    }
                    invoicesByOrg[inv.organization_id].count += 1
                    invoicesByOrg[inv.organization_id].total += Number(inv.total || 0)
                }
            })
        }

        return orgs.map(org => ({
            ...org,
            contacts_count: contactsByOrg[org.id] || 0,
            invoices_count: invoicesByOrg[org.id]?.count || 0,
            total_billed: invoicesByOrg[org.id]?.total || 0
        }))
    } catch (err) {
        console.error('[getOrganizations] Unexpected error:', err)
        return []
    }
}

export async function getOrganization(id: string): Promise<Organization | null> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !data) return null
        return data
    } catch (err) {
        console.error('[getOrganization] Error:', err)
        return null
    }
}

export async function createOrganizationAction(data: {
    name: string
    legal_name?: string
    gstin?: string
    pan?: string
    website?: string
    email?: string
    phone?: string
    industry?: string
    billing_address?: string
    shipping_address?: string
    city?: string
    state?: string
    country?: string
    pincode?: string
    currency?: string
    notes?: string
}): Promise<{ success: boolean; organization?: Organization; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'User is not authenticated' }
        }

        const name = data.name?.trim()
        if (!name) {
            return { success: false, error: 'Organization name is required' }
        }

        const payload = {
            user_id: user.id,
            name,
            legal_name: data.legal_name?.trim() || null,
            gstin: data.gstin?.trim().toUpperCase() || null,
            pan: data.pan?.trim().toUpperCase() || null,
            website: data.website?.trim() || null,
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            industry: data.industry?.trim() || null,
            billing_address: data.billing_address?.trim() || null,
            shipping_address: data.shipping_address?.trim() || null,
            city: data.city?.trim() || null,
            state: data.state?.trim() || null,
            country: data.country?.trim() || 'India',
            pincode: data.pincode?.trim() || null,
            currency: data.currency?.trim() || 'INR',
            notes: data.notes?.trim() || null
        }

        const { data: inserted, error } = await supabase
            .from('organizations')
            .insert([payload])
            .select()
            .single()

        if (error) {
            console.error('[createOrganizationAction] Insert error:', error)
            return { success: false, error: error.message || 'Failed to create organization' }
        }

        revalidatePath('/organizations')
        revalidatePath('/customers')
        revalidatePath('/invoices/new')
        return { success: true, organization: inserted }
    } catch (err) {
        console.error('[createOrganizationAction] Unexpected error:', err)
        return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
    }
}

export async function updateOrganizationAction(
    id: string,
    data: Partial<Organization>
): Promise<{ success: boolean; organization?: Organization; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'User is not authenticated' }

        const payload: Record<string, any> = {
            ...data,
            updated_at: new Date().toISOString()
        }
        delete payload.id
        delete payload.user_id
        delete payload.contacts_count
        delete payload.invoices_count
        delete payload.total_billed

        const { data: updated, error } = await supabase
            .from('organizations')
            .update(payload)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message || 'Failed to update organization' }
        }

        // Also sync updated name to linked customers
        if (data.name) {
            await supabase
                .from('customers')
                .update({ organization_name: data.name })
                .eq('organization_id', id)
                .eq('user_id', user.id)
        }

        revalidatePath('/organizations')
        revalidatePath('/customers')
        revalidatePath('/invoices/new')
        return { success: true, organization: updated }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
}

export async function deleteOrganizationAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'User is not authenticated' }

        // Remove organization reference from customers and invoices
        await Promise.all([
            supabase
                .from('customers')
                .update({ organization_id: null, organization_name: null })
                .eq('organization_id', id)
                .eq('user_id', user.id),
            supabase
                .from('invoices')
                .update({ organization_id: null, organization_name: null })
                .eq('organization_id', id)
                .eq('user_id', user.id)
        ])

        const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/organizations')
        revalidatePath('/customers')
        return { success: true }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
}

export async function getOrganizationContacts(organizationId: string): Promise<Customer[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .order('is_primary_contact', { ascending: false })
            .order('name', { ascending: true })

        if (error || !data) return []
        return data
    } catch {
        return []
    }
}

export async function createOrganizationContactAction(data: {
    organization_id: string
    organization_name: string
    name: string
    designation?: string
    department?: string
    email?: string
    phone?: string
    is_primary_contact?: boolean
}): Promise<{ success: boolean; contact?: Customer; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'User is not authenticated' }

        const name = data.name?.trim()
        if (!name) return { success: false, error: 'Contact name is required' }

        // If this contact is marked primary, demote any other primary contact in this org
        if (data.is_primary_contact) {
            await supabase
                .from('customers')
                .update({ is_primary_contact: false })
                .eq('organization_id', data.organization_id)
                .eq('user_id', user.id)
        }

        const payload = {
            user_id: user.id,
            organization_id: data.organization_id,
            organization_name: data.organization_name,
            name,
            designation: data.designation?.trim() || null,
            department: data.department?.trim() || null,
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            is_primary_contact: !!data.is_primary_contact
        }

        const { data: inserted, error } = await supabase
            .from('customers')
            .insert([payload])
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/organizations')
        revalidatePath('/customers')
        revalidatePath('/invoices/new')
        return { success: true, contact: inserted }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
}
