'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { InventoryItem, InventoryTransaction } from '@/lib/types'

export async function getInventoryItems(): Promise<InventoryItem[]> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return []
        }

        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching inventory items:', error.message)
            return []
        }

        return (data || []) as InventoryItem[]
    } catch (error) {
        console.error('Unexpected error in getInventoryItems:', error)
        return []
    }
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching inventory item:', error.message)
            return null
        }

        return data as InventoryItem
    } catch (error) {
        console.error('Unexpected error in getInventoryItem:', error)
        return null
    }
}

export async function getRecentInventoryTransactions(limit = 10): Promise<InventoryTransaction[]> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return []
        }

        const { data, error } = await supabase
            .from('inventory_transactions')
            .select('*, item:inventory_items(name, sku, unit)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching inventory transactions:', error.message)
            return []
        }

        return (data || []) as InventoryTransaction[]
    } catch (error) {
        console.error('Unexpected error in getRecentInventoryTransactions:', error)
        return []
    }
}

export async function createInventoryItem(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const name = (formData.get('name') as string)?.trim()
    if (!name) {
        throw new Error('Item name is required')
    }

    const payload = {
        user_id: user.id,
        name,
        sku: ((formData.get('sku') as string) || '').trim() || null,
        description: ((formData.get('description') as string) || '').trim() || null,
        unit: ((formData.get('unit') as string) || 'pcs').trim(),
        current_stock: Number(formData.get('current_stock') || 0),
        reorder_level: Number(formData.get('reorder_level') || 0),
        purchase_price: Number(formData.get('purchase_price') || 0),
        selling_price: Number(formData.get('selling_price') || 0),
        location: ((formData.get('location') as string) || '').trim() || null,
        is_active: true,
    }

    const { error } = await supabase.from('inventory_items').insert([payload])

    if (error) {
        console.error('Error creating inventory item:', error.message)
        throw new Error('Failed to create inventory item')
    }

    revalidatePath('/inventory')
    redirect('/inventory')
}

export async function updateInventoryItem(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const name = (formData.get('name') as string)?.trim()
    if (!name) {
        throw new Error('Item name is required')
    }

    const payload = {
        name,
        sku: ((formData.get('sku') as string) || '').trim() || null,
        description: ((formData.get('description') as string) || '').trim() || null,
        unit: ((formData.get('unit') as string) || 'pcs').trim(),
        current_stock: Number(formData.get('current_stock') || 0),
        reorder_level: Number(formData.get('reorder_level') || 0),
        purchase_price: Number(formData.get('purchase_price') || 0),
        selling_price: Number(formData.get('selling_price') || 0),
        location: ((formData.get('location') as string) || '').trim() || null,
    }

    const { error } = await supabase
        .from('inventory_items')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating inventory item:', error.message)
        throw new Error('Failed to update inventory item')
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${id}`)
    redirect('/inventory')
}

export async function deleteInventoryItem(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting inventory item:', error.message)
        throw new Error('Failed to delete inventory item')
    }

    revalidatePath('/inventory')
}

export async function adjustInventoryStock(itemId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const movementType = (formData.get('movement_type') as 'in' | 'out') || 'in'
    const quantity = Number(formData.get('quantity') || 0)
    const notes = ((formData.get('notes') as string) || '').trim() || null
    const unitCost = Number(formData.get('unit_cost') || 0)

    if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0')
    }

    const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .eq('user_id', user.id)
        .single()

    if (itemError || !item) {
        throw new Error('Inventory item not found')
    }

    const previousStock = Number(item.current_stock || 0)
    const delta = movementType === 'in' ? quantity : -quantity
    const newStock = previousStock + delta

    if (newStock < 0) {
        throw new Error('Insufficient stock for stock-out operation')
    }

    const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', itemId)
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Error updating item stock:', updateError.message)
        throw new Error('Failed to update stock')
    }

    const { error: txError } = await supabase
        .from('inventory_transactions')
        .insert({
            item_id: itemId,
            user_id: user.id,
            movement_type: movementType,
            quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            unit_cost: unitCost || null,
            notes,
        })

    if (txError) {
        console.error('Error recording inventory transaction:', txError.message)
        throw new Error('Stock updated but failed to log transaction')
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${itemId}`)
}
