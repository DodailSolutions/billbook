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

        let result = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        // If 'name' column does not exist (e.g. enterprise schema with 'item_name'), retry by created_at
        if (result.error && (result.error.message?.includes('column') || result.error.code === '42703')) {
            result = await supabase
                .from('inventory_items')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
        }

        if (result.error) {
            console.error('Error fetching inventory items:', result.error.message)
            return []
        }

        const normalized = (result.data || []).map((item: any) => ({
            ...item,
            name: item.name || item.item_name || 'Unnamed Item',
            sku: item.sku || item.item_code || '',
            unit: item.unit || item.unit_of_measurement || 'pcs',
            current_stock: Number(item.current_stock ?? item.quantity_on_hand ?? 0),
            reorder_level: Number(item.reorder_level ?? item.reorder_point ?? item.minimum_stock_level ?? 0),
            purchase_price: Number(item.purchase_price ?? 0),
            selling_price: Number(item.selling_price ?? 0),
        }))

        return normalized as InventoryItem[]
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

        if (!data) return null

        const item: any = data
        return {
            ...item,
            name: item.name || item.item_name || 'Unnamed Item',
            sku: item.sku || item.item_code || '',
            unit: item.unit || item.unit_of_measurement || 'pcs',
            current_stock: Number(item.current_stock ?? item.quantity_on_hand ?? 0),
            reorder_level: Number(item.reorder_level ?? item.reorder_point ?? item.minimum_stock_level ?? 0),
            purchase_price: Number(item.purchase_price ?? 0),
            selling_price: Number(item.selling_price ?? 0),
        } as InventoryItem
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

export async function createInventoryItem(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'User is not authenticated' }

        const name = (formData.get('name') as string)?.trim()
        if (!name) {
            return { success: false, error: 'Item name is required' }
        }

        const sku = ((formData.get('sku') as string) || '').trim() || null
        const description = ((formData.get('description') as string) || '').trim() || null
        const unit = ((formData.get('unit') as string) || 'pcs').trim()
        const current_stock = Number(formData.get('current_stock') || 0)
        const reorder_level = Number(formData.get('reorder_level') || 0)
        const purchase_price = Number(formData.get('purchase_price') || 0)
        const selling_price = Number(formData.get('selling_price') || 0)
        const location = ((formData.get('location') as string) || '').trim() || null
        const itemCode = sku || `ITEM-${Date.now().toString(36).toUpperCase()}`

        // Attempt 1: Full hybrid payload matching both standard and enterprise schema columns
        const fullPayload = {
            user_id: user.id,
            name,
            item_name: name,
            sku,
            item_code: itemCode,
            item_type: 'product',
            unit,
            unit_of_measurement: unit,
            description,
            current_stock,
            reorder_level,
            purchase_price,
            selling_price,
            location,
            is_active: true,
        }

        const { error: fullError } = await supabase.from('inventory_items').insert([fullPayload])
        if (!fullError) {
            revalidatePath('/inventory')
            return { success: true }
        }

        // Attempt 2: Standard inventory schema (name, sku, unit)
        const standardPayload = {
            user_id: user.id,
            name,
            sku,
            description,
            unit,
            current_stock,
            reorder_level,
            purchase_price,
            selling_price,
            location,
            is_active: true,
        }

        const { error: standardError } = await supabase.from('inventory_items').insert([standardPayload])
        if (!standardError) {
            revalidatePath('/inventory')
            return { success: true }
        }

        // Attempt 3: Enterprise inventory schema (item_name, item_code, item_type, unit_of_measurement)
        const enterprisePayload = {
            user_id: user.id,
            item_name: name,
            item_code: itemCode,
            item_type: 'product',
            unit_of_measurement: unit,
            description,
            purchase_price,
            selling_price,
        }

        const { error: enterpriseError } = await supabase.from('inventory_items').insert([enterprisePayload])
        if (!enterpriseError) {
            revalidatePath('/inventory')
            return { success: true }
        }

        console.error('All inventory insert attempts failed:', {
            fullError: fullError?.message,
            standardError: standardError?.message,
            enterpriseError: enterpriseError?.message,
        })

        const displayError = standardError.message?.includes('relation') || standardError.code === '42P01'
            ? 'The "inventory_items" database table does not exist in Supabase. Please run the supabase-inventory-management-migration.sql script in your Supabase SQL editor.'
            : (standardError.message || fullError.message || enterpriseError.message || 'Failed to save inventory item')

        return { success: false, error: displayError }
    } catch (err) {
        console.error('Unexpected error creating inventory item:', err)
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'An unexpected error occurred while creating inventory item' 
        }
    }
}

export async function getInventoryValuationReport() {
    const items = await getInventoryItems()

    const totalSkus = items.length
    const totalCostValue = items.reduce((sum, item) => sum + (Number(item.current_stock || 0) * Number(item.purchase_price || 0)), 0)
    const totalRetailValue = items.reduce((sum, item) => sum + (Number(item.current_stock || 0) * Number(item.selling_price || 0)), 0)
    const potentialMargin = totalRetailValue - totalCostValue
    const potentialMarginPercent = totalRetailValue > 0 ? ((potentialMargin / totalRetailValue) * 100).toFixed(1) : '0.0'

    const reorderItems = items.filter(item => Number(item.current_stock || 0) <= Number(item.reorder_level || 0))
    const outOfStockItems = items.filter(item => Number(item.current_stock || 0) <= 0)

    const valuedItems = items.map(item => {
        const stock = Number(item.current_stock || 0)
        const costPrice = Number(item.purchase_price || 0)
        const sellPrice = Number(item.selling_price || 0)
        const assetValue = stock * costPrice
        const retailValue = stock * sellPrice

        return {
            ...item,
            current_stock: stock,
            purchase_price: costPrice,
            selling_price: sellPrice,
            assetValue,
            retailValue,
            unitMargin: sellPrice - costPrice,
            isLowStock: stock <= Number(item.reorder_level || 0)
        }
    }).sort((a, b) => b.assetValue - a.assetValue)

    return {
        totalSkus,
        totalCostValue,
        totalRetailValue,
        potentialMargin,
        potentialMarginPercent,
        reorderCount: reorderItems.length,
        outOfStockCount: outOfStockItems.length,
        valuedItems
    }
}


export async function updateInventoryItem(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const name = (formData.get('name') as string)?.trim()
    if (!name) {
        throw new Error('Item name is required')
    }

    const sku = ((formData.get('sku') as string) || '').trim() || null
    const description = ((formData.get('description') as string) || '').trim() || null
    const unit = ((formData.get('unit') as string) || 'pcs').trim()
    const current_stock = Number(formData.get('current_stock') || 0)
    const reorder_level = Number(formData.get('reorder_level') || 0)
    const purchase_price = Number(formData.get('purchase_price') || 0)
    const selling_price = Number(formData.get('selling_price') || 0)
    const location = ((formData.get('location') as string) || '').trim() || null

    const standardPayload = {
        name,
        sku,
        description,
        unit,
        current_stock,
        reorder_level,
        purchase_price,
        selling_price,
        location,
    }

    const { error: standardError } = await supabase
        .from('inventory_items')
        .update(standardPayload)
        .eq('id', id)
        .eq('user_id', user.id)

    if (standardError) {
        const enterprisePayload = {
            item_name: name,
            item_code: sku,
            description,
            unit_of_measurement: unit,
            purchase_price,
            selling_price,
        }
        await supabase
            .from('inventory_items')
            .update(enterprisePayload)
            .eq('id', id)
            .eq('user_id', user.id)
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
