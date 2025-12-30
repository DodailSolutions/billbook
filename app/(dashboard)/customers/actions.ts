'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Customer } from '@/lib/types'

export async function getCustomers(): Promise<Customer[]> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('Auth error in getCustomers:', authError?.message)
            return []
        }

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching customers:', error.message, error.details)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Unexpected error in getCustomers:', err)
        return []
    }
}

export async function getCustomer(id: string): Promise<Customer | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching customer:', error)
        return null
    }

    return data
}

export async function createCustomer(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    const customerData = {
        user_id: user.id,
        name: formData.get('name') as string,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        address: formData.get('address') as string || null,
        gstin: formData.get('gstin') as string || null,
    }

    const { error } = await supabase
        .from('customers')
        .insert([customerData])

    if (error) {
        console.error('Error creating customer:', error)
        throw new Error('Failed to create customer')
    }

    revalidatePath('/customers')
    return redirect('/customers')
}

export async function updateCustomer(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    const customerData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        address: formData.get('address') as string || null,
        gstin: formData.get('gstin') as string || null,
    }

    const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating customer:', error)
        throw new Error('Failed to update customer')
    }

    revalidatePath('/customers')
    return redirect('/customers')
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting customer:', error)
        throw new Error('Failed to delete customer')
    }

    revalidatePath('/customers')
}
