'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SavedItem } from '@/lib/types'

export async function getSavedItems(): Promise<SavedItem[]> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return []
        }

        const { data, error } = await supabase
            .from('saved_items')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching saved items:', error.message)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Unexpected error in getSavedItems:', err)
        return []
    }
}

export async function getSavedItem(id: string): Promise<SavedItem | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching saved item:', error)
        return null
    }

    return data
}

export async function createSavedItem(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const itemData = {
        user_id: user.id,
        name: (formData.get('name') as string)?.trim(),
        description: (formData.get('description') as string)?.trim(),
        item_details: (formData.get('item_details') as string)?.trim() || null,
        unit_price: parseFloat(formData.get('unit_price') as string) || 0,
        default_quantity: parseFloat(formData.get('default_quantity') as string) || 1,
        hsn_sac_code: (formData.get('hsn_sac_code') as string)?.trim() || null,
        hsn_sac_type: (formData.get('hsn_sac_type') as string) || null,
        gst_rate: formData.get('gst_rate') ? parseFloat(formData.get('gst_rate') as string) : null,
    }

    const { error } = await supabase.from('saved_items').insert([itemData])

    if (error) {
        console.error('Error creating saved item:', error)
        throw new Error('Failed to save item')
    }

    revalidatePath('/items')
    redirect('/items')
}

export async function updateSavedItem(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const itemData = {
        name: (formData.get('name') as string)?.trim(),
        description: (formData.get('description') as string)?.trim(),
        item_details: (formData.get('item_details') as string)?.trim() || null,
        unit_price: parseFloat(formData.get('unit_price') as string) || 0,
        default_quantity: parseFloat(formData.get('default_quantity') as string) || 1,
        hsn_sac_code: (formData.get('hsn_sac_code') as string)?.trim() || null,
        hsn_sac_type: (formData.get('hsn_sac_type') as string) || null,
        gst_rate: formData.get('gst_rate') ? parseFloat(formData.get('gst_rate') as string) : null,
    }

    const { error } = await supabase
        .from('saved_items')
        .update(itemData)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating saved item:', error)
        throw new Error('Failed to update item')
    }

    revalidatePath('/items')
    redirect('/items')
}

export async function deleteSavedItem(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting saved item:', error)
        throw new Error('Failed to delete item')
    }

    revalidatePath('/items')
}

export async function saveItemFromInvoice(itemData: {
    name: string
    description: string
    item_details?: string
    unit_price: number
    default_quantity: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('saved_items').insert([{
        user_id: user.id,
        ...itemData,
    }])

    if (error) {
        console.error('Error saving item from invoice:', error)
        throw new Error('Failed to save item')
    }

    revalidatePath('/items')
}
