'use server'

import { createClient } from "@/lib/supabase/server"
import { PurchaseOrder, CreatePOInput, UpdatePOInput, POStatus } from "./po-types"
import { revalidatePath } from "next/cache"

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
            *,
            items:purchase_order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching purchase orders:', error)
        return []
    }

    return (data || []).map(po => ({
        ...po,
        subtotal: Number(po.subtotal || 0),
        tax_total: Number(po.tax_total || 0),
        total_amount: Number(po.total_amount || 0),
        items: (po.items || []).map((item: any) => ({
            ...item,
            quantity: Number(item.quantity || 0),
            received_quantity: Number(item.received_quantity || 0),
            unit_price: Number(item.unit_price || 0),
            gst_rate: Number(item.gst_rate || 0),
            tax_amount: Number(item.tax_amount || 0),
            total_amount: Number(item.total_amount || 0),
        }))
    }))
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
            *,
            items:purchase_order_items(*),
            vendor:vendors(address, gstin, phone, contact_person, state_code)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !data) return null

    return {
        ...data,
        subtotal: Number(data.subtotal || 0),
        tax_total: Number(data.tax_total || 0),
        total_amount: Number(data.total_amount || 0),
        items: (data.items || []).map((item: any) => ({
            ...item,
            quantity: Number(item.quantity || 0),
            received_quantity: Number(item.received_quantity || 0),
            unit_price: Number(item.unit_price || 0),
            gst_rate: Number(item.gst_rate || 0),
            tax_amount: Number(item.tax_amount || 0),
            total_amount: Number(item.total_amount || 0),
        }))
    }
}

export async function createPurchaseOrder(input: CreatePOInput): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Generate PO Number (PO-YYYYMMDD-XXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(100 + Math.random() * 900)
    const poNumber = `PO-${dateStr}-${randomNum}`

    // Calculate totals
    let subtotal = 0
    let taxTotal = 0

    const processedItems = input.items.map(item => {
        const itemSubtotal = item.quantity * item.unit_price
        const itemTax = (itemSubtotal * item.gst_rate) / 100
        const itemTotal = itemSubtotal + itemTax

        subtotal += itemSubtotal
        taxTotal += itemTax

        return {
            inventory_item_id: item.inventory_item_id || null,
            item_name: item.item_name,
            description: item.description || '',
            quantity: item.quantity,
            received_quantity: 0,
            unit_price: item.unit_price,
            gst_rate: item.gst_rate,
            tax_amount: itemTax,
            total_amount: itemTotal,
        }
    })

    const totalAmount = subtotal + taxTotal

    const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
            user_id: user.id,
            po_number: poNumber,
            vendor_id: input.vendor_id || null,
            vendor_name: input.vendor_name,
            vendor_email: input.vendor_email || null,
            po_date: input.po_date,
            expected_delivery_date: input.expected_delivery_date || null,
            status: 'draft',
            subtotal,
            tax_total: taxTotal,
            total_amount: totalAmount,
            notes: input.notes || null,
            terms: input.terms || null,
        })
        .select()
        .single()

    if (poError || !po) {
        console.error('PO Insert Error:', poError)
        return { success: false, error: poError?.message || 'Failed to create purchase order' }
    }

    const itemsToInsert = processedItems.map(item => ({
        po_id: po.id,
        ...item
    }))

    const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('PO Items Insert Error:', itemsError)
        return { success: false, error: 'PO created but failed to save line items' }
    }

    revalidatePath('/purchase-orders')
    return { success: true, id: po.id }
}

export async function updatePOStatus(poId: string, status: POStatus): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('purchase_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', poId)
        .eq('user_id', user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${poId}`)
    return { success: true }
}

export async function receivePOItems(
    poId: string, 
    receipts: { itemId: string; inventoryItemId?: string; qtyReceivedNow: number; batchNumber?: string; expiryDate?: string }[]
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const po = await getPurchaseOrder(poId)
    if (!po) return { success: false, error: 'Purchase order not found' }

    for (const rec of receipts) {
        if (rec.qtyReceivedNow <= 0) continue

        const poItem = po.items?.find(i => i.id === rec.itemId)
        if (!poItem) continue

        const newReceivedQty = poItem.received_quantity + rec.qtyReceivedNow

        // Update PO item received quantity
        await supabase
            .from('purchase_order_items')
            .update({ received_quantity: newReceivedQty })
            .eq('id', rec.itemId)

        // If linked to an inventory item, update current_stock and log transaction
        const targetInventoryId = rec.inventoryItemId || poItem.inventory_item_id
        if (targetInventoryId) {
            const { data: invItem } = await supabase
                .from('inventory_items')
                .select('current_stock')
                .eq('id', targetInventoryId)
                .single()

            if (invItem) {
                const prevStock = Number(invItem.current_stock || 0)
                const newStock = prevStock + rec.qtyReceivedNow

                // Update stock
                await supabase
                    .from('inventory_items')
                    .update({ current_stock: newStock, updated_at: new Date().toISOString() })
                    .eq('id', targetInventoryId)

                // Log transaction
                await supabase
                    .from('inventory_transactions')
                    .insert({
                        item_id: targetInventoryId,
                        user_id: user.id,
                        movement_type: 'in',
                        quantity: rec.qtyReceivedNow,
                        previous_stock: prevStock,
                        new_stock: newStock,
                        unit_cost: poItem.unit_price,
                        notes: `Received via PO #${po.po_number}`,
                        reference_type: 'purchase_order',
                        reference_id: po.id,
                        batch_number: rec.batchNumber || null,
                        expiry_date: rec.expiryDate || null,
                        po_id: po.id
                    })
            }
        }
    }

    // Refresh PO state to check overall completion status
    const updatedPo = await getPurchaseOrder(poId)
    if (updatedPo && updatedPo.items) {
        const allReceived = updatedPo.items.every(i => i.received_quantity >= i.quantity)
        const anyReceived = updatedPo.items.some(i => i.received_quantity > 0)

        let newStatus: POStatus = 'issued'
        if (allReceived) {
            newStatus = 'received'
        } else if (anyReceived) {
            newStatus = 'partially_received'
        }

        await supabase
            .from('purchase_orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', poId)
    }

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${poId}`)
    revalidatePath('/inventory')
    return { success: true }
}

export async function updatePurchaseOrder(id: string, input: UpdatePOInput): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check PO exists and is draft
    const po = await getPurchaseOrder(id)
    if (!po) return { success: false, error: 'Purchase order not found' }
    if (po.status !== 'draft') return { success: false, error: 'Only draft purchase orders can be edited' }
    if (po.user_id !== user.id) return { success: false, error: 'Unauthorized' }

    // Calculate totals
    let subtotal = 0
    let taxTotal = 0

    const processedItems = input.items.map(item => {
        const itemSubtotal = item.quantity * item.unit_price
        const itemTax = (itemSubtotal * item.gst_rate) / 100
        const itemTotal = itemSubtotal + itemTax

        subtotal += itemSubtotal
        taxTotal += itemTax

        return {
            po_id: id,
            inventory_item_id: item.inventory_item_id || null,
            item_name: item.item_name,
            description: item.description || '',
            quantity: item.quantity,
            received_quantity: 0,
            unit_price: item.unit_price,
            gst_rate: item.gst_rate,
            tax_amount: itemTax,
            total_amount: itemTotal,
        }
    })

    const totalAmount = subtotal + taxTotal

    // Update PO
    const { error: poError } = await supabase
        .from('purchase_orders')
        .update({
            vendor_id: input.vendor_id || null,
            vendor_name: input.vendor_name,
            vendor_email: input.vendor_email || null,
            po_date: input.po_date,
            expected_delivery_date: input.expected_delivery_date || null,
            subtotal,
            tax_total: taxTotal,
            total_amount: totalAmount,
            notes: input.notes || null,
            terms: input.terms || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (poError) return { success: false, error: poError.message }

    // Delete existing items
    const { error: deleteError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('po_id', id)
        
    if (deleteError) return { success: false, error: 'Failed to delete existing items' }

    // Insert new items
    const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(processedItems)

    if (itemsError) return { success: false, error: 'Failed to save updated line items' }

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${id}`)
    return { success: true }
}

export async function approvePurchaseOrder(id: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('purchase_orders')
        .update({ 
            approval_status: 'approved', 
            approved_by: user.email, 
            approved_at: new Date().toISOString(),
            approval_notes: notes || null,
            status: 'issued',
            updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${id}`)
    return { success: true }
}

export async function rejectPurchaseOrder(id: string, notes: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('purchase_orders')
        .update({ 
            approval_status: 'rejected', 
            approval_notes: notes,
            updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${id}`)
    return { success: true }
}

export async function duplicatePurchaseOrder(id: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = await createClient()
    const po = await getPurchaseOrder(id)
    
    if (!po) return { success: false, error: 'Purchase order not found' }

    const input: CreatePOInput = {
        vendor_id: po.vendor_id || undefined,
        vendor_name: po.vendor_name,
        vendor_email: po.vendor_email || undefined,
        po_date: new Date().toISOString().slice(0, 10),
        expected_delivery_date: po.expected_delivery_date || undefined,
        notes: po.notes || undefined,
        terms: po.terms || undefined,
        items: (po.items || []).map(item => ({
            inventory_item_id: item.inventory_item_id || undefined,
            item_name: item.item_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unit_price: item.unit_price,
            gst_rate: item.gst_rate
        }))
    }

    return createPurchaseOrder(input)
}

export async function amendPurchaseOrder(id: string, reason?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Unauthorized' }

    const po = await getPurchaseOrder(id)
    if (!po) return { success: false, error: 'Purchase order not found' }

    // Generate amended PO Number
    const newAmendmentNumber = (po.amendment_number || 0) + 1
    const basePoNumber = po.po_number.split('-A')[0]
    const poNumber = `${basePoNumber}-A${newAmendmentNumber}`

    const { data: newPo, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
            user_id: user.id,
            po_number: poNumber,
            vendor_id: po.vendor_id || null,
            vendor_name: po.vendor_name,
            vendor_email: po.vendor_email || null,
            po_date: po.po_date,
            expected_delivery_date: po.expected_delivery_date || null,
            status: 'draft',
            subtotal: po.subtotal,
            tax_total: po.tax_total,
            total_amount: po.total_amount,
            notes: po.notes || null,
            terms: po.terms || null,
            amendment_number: newAmendmentNumber,
            amended_from: id
        })
        .select()
        .single()

    if (poError || !newPo) {
        return { success: false, error: poError?.message || 'Failed to amend purchase order' }
    }

    if (po.items && po.items.length > 0) {
        const itemsToInsert = po.items.map(item => ({
            po_id: newPo.id,
            inventory_item_id: item.inventory_item_id || null,
            item_name: item.item_name,
            description: item.description || '',
            quantity: item.quantity,
            received_quantity: 0,
            unit_price: item.unit_price,
            gst_rate: item.gst_rate,
            tax_amount: item.tax_amount,
            total_amount: item.total_amount,
        }))

        const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(itemsToInsert)
            
        if (itemsError) return { success: false, error: 'PO created but failed to save line items' }
    }

    if (reason) {
        await supabase
            .from('purchase_order_amendments')
            .insert({
                original_po_id: id,
                amended_po_id: newPo.id,
                reason: reason,
                created_by: user.id
            })
    }

    revalidatePath('/purchase-orders')
    return { success: true, id: newPo.id }
}
