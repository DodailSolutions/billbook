'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Invoice, InvoiceWithDetails, InvoiceItem } from '@/lib/types'

export async function getInvoices(): Promise<InvoiceWithDetails[]> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('Auth error in getInvoices:', authError?.message)
            return []
        }

        const { data, error } = await supabase
            .from('invoices')
            .select(`
      *,
      customer:customers(*),
      invoice_items(*)
    `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching invoices:', error.message, error.details)
            return []
        }

        return data as InvoiceWithDetails[] || []
    } catch (err) {
        console.error('Unexpected error in getInvoices:', err)
        return []
    }
}

export async function getInvoice(id: string): Promise<InvoiceWithDetails | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      customer:customers(*),
      invoice_items(*)
    `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching invoice:', error)
        return null
    }

    return data as InvoiceWithDetails
}

export async function generateInvoiceNumber(): Promise<string> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data, error } = await supabase.rpc('get_next_invoice_number', {
        p_user_id: user.id
    })

    if (error) {
        console.error('Error generating invoice number:', error)
        // Fallback to simple generation
        const timestamp = Date.now()
        return `INV-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`
    }

    return data as string
}

interface CreateInvoiceData {
    customer_id: string
    invoice_date: string
    due_date?: string
    gst_percentage: number
    notes?: string
    items: Array<{
        description: string
        quantity: number
        unit_price: number
    }>
}

export async function createInvoice(data: CreateInvoiceData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price)
    }, 0)

    const gst_amount = (subtotal * data.gst_percentage) / 100
    const total = subtotal + gst_amount

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber()

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
            user_id: user.id,
            customer_id: data.customer_id,
            invoice_number,
            invoice_date: data.invoice_date,
            due_date: data.due_date || null,
            subtotal,
            gst_percentage: data.gst_percentage,
            gst_amount,
            total,
            notes: data.notes || null,
            status: 'draft'
        }])
        .select()
        .single()

    if (invoiceError) {
        console.error('Error creating invoice:', invoiceError)
        throw new Error('Failed to create invoice')
    }

    // Create invoice items
    const items = data.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items)

    if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        throw new Error('Failed to create invoice items')
    }

    revalidatePath('/invoices')
    return redirect('/invoices')
}

interface UpdateInvoiceData {
    customer_id: string
    invoice_date: string
    due_date?: string
    gst_percentage: number
    notes?: string
    items: Array<{
        description: string
        quantity: number
        unit_price: number
    }>
}

export async function updateInvoice(id: string, data: UpdateInvoiceData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price)
    }, 0)

    const gst_amount = (subtotal * data.gst_percentage) / 100
    const total = subtotal + gst_amount

    // Update invoice
    const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
            customer_id: data.customer_id,
            invoice_date: data.invoice_date,
            due_date: data.due_date || null,
            subtotal,
            gst_percentage: data.gst_percentage,
            gst_amount,
            total,
            notes: data.notes || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (invoiceError) {
        console.error('Error updating invoice:', invoiceError)
        throw new Error('Failed to update invoice')
    }

    // Delete existing items
    const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)

    if (deleteError) {
        console.error('Error deleting old invoice items:', deleteError)
        throw new Error('Failed to update invoice items')
    }

    // Create new invoice items
    const items = data.items.map(item => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items)

    if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        throw new Error('Failed to create invoice items')
    }

    revalidatePath('/invoices')
    return redirect('/invoices')
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating invoice status:', error)
        throw new Error('Failed to update invoice status')
    }

    revalidatePath('/invoices')
}

export async function deleteInvoice(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return redirect('/login')
    }

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting invoice:', error)
        throw new Error('Failed to delete invoice')
    }

    revalidatePath('/invoices')
}
