'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateGSTComponents, validateGSTIN } from '@/lib/gst-utils'
import { 
  autoClassifyGSTType, 
  calculateRoundOff,
  getCurrentFinancialYear
} from '@/lib/advanced-gst-utils'
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
      invoice_items(*),
      recurring_invoices!recurring_invoices_template_invoice_id_fkey(
        id,
        frequency,
        next_invoice_date,
        is_active
      )
    `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching invoices:', error.message, error.details)
            return []
        }

        // Ensure partial payment fields are present with defaults if not in database
        const invoicesWithDefaults = (data || []).map(invoice => ({
            ...invoice,
            amount_paid: invoice.amount_paid ?? 0,
            amount_remaining: invoice.amount_remaining ?? invoice.total,
            is_partial_payment: invoice.is_partial_payment ?? false,
            recurring_invoices: Array.isArray(invoice.recurring_invoices) 
                ? invoice.recurring_invoices 
                : invoice.recurring_invoices 
                    ? [invoice.recurring_invoices] 
                    : []
        }))

        return invoicesWithDefaults as InvoiceWithDetails[]
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

    // Ensure partial payment fields are present with defaults if not in database
    const invoiceData = {
        ...data,
        amount_paid: data.amount_paid ?? 0,
        amount_remaining: data.amount_remaining ?? data.total,
        is_partial_payment: data.is_partial_payment ?? false
    }

    return invoiceData as InvoiceWithDetails
}

export async function generateInvoiceNumber(seriesId?: string): Promise<string> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    // Try new advanced function first (with series support)
    const { data: advancedNumber, error: advError } = await supabase.rpc('get_next_invoice_number_with_series', {
        p_user_id: user.id,
        p_series_id: seriesId || null
    })

    if (!advError && advancedNumber) {
        return advancedNumber as string
    }

    // Fallback to original function for backward compatibility
    const { data, error } = await supabase.rpc('get_next_invoice_number', {
        p_user_id: user.id
    })

    if (error) {
        console.error('Error generating invoice number:', error)
        // Final fallback to simple generation
        const fy = getCurrentFinancialYear()
        const timestamp = Date.now()
        return `INV-${fy}-${timestamp.toString().slice(-4)}`
    }

    return data as string
}

interface CreateInvoiceData {
    customer_id: string
    invoice_date: string
    due_date?: string
    gst_percentage: number
    supply_type?: 'intra-state' | 'inter-state'
    reverse_charge_applicable?: boolean
    notes?: string
    invoice_series_id?: string
    items: Array<{
        description: string
        quantity: number
        unit_price: number
        hsn_sac_code?: string
        hsn_sac_type?: 'HSN' | 'SAC'
        gst_rate?: number
    }>
    // Recurring invoice data
    is_recurring?: boolean
    recurring_frequency?: 'monthly' | 'yearly'
    recurring_start_date?: string
    recurring_end_date?: string
    // Payment collection
    mark_as_paid?: boolean
    payment_amount?: number
    payment_method?: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque'
    payment_date?: string
    payment_notes?: string
}

export async function createInvoice(data: CreateInvoiceData) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get customer for auto GST classification
        const { data: customer } = await supabase
            .from('customers')
            .select('state_code, gstin')
            .eq('id', data.customer_id)
            .single()

        // Get company GST settings for auto-classification
        const { data: companySettings } = await supabase
            .from('company_gst_settings')
            .select('company_state_code, company_gstin')
            .eq('user_id', user.id)
            .single()

        // Auto-classify supply type if not provided
        let supplyType = data.supply_type || 'intra-state'
        if (companySettings && customer?.state_code) {
            const classification = autoClassifyGSTType(
                companySettings.company_state_code,
                customer.state_code
            )
            supplyType = classification.supplyType
            console.log('Auto-classified GST:', classification.reason)
        }

        const reverseChargeApplicable = data.reverse_charge_applicable || false

        // Calculate totals with proper GST breakdown
        const subtotal = data.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price)
        }, 0)

        // Calculate GST components based on supply type
        const gstComponents = calculateGSTComponents(subtotal, data.gst_percentage, supplyType)

        // Calculate round-off
        const roundOff = calculateRoundOff(gstComponents.totalAmount)

        // Generate invoice number
        const invoice_number = await generateInvoiceNumber(data.invoice_series_id)

        // Create invoice with GST breakdown (simplified for compatibility)
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
                gst_amount: gstComponents.totalTax,
                cgst_amount: gstComponents.cgst,
                sgst_amount: gstComponents.sgst,
                igst_amount: gstComponents.igst,
                supply_type: supplyType,
                reverse_charge_applicable: reverseChargeApplicable,
                total: roundOff.roundedAmount,
                notes: data.notes || null,
                status: 'draft'
            }])
            .select()
            .single()

        if (invoiceError) {
            console.error('Error creating invoice:', invoiceError)
            return { success: false, error: 'Failed to create invoice' }
        }

        // Create invoice items with HSN/SAC and individual tax rates
        const items = data.items.map(item => {
            const itemAmount = item.quantity * item.unit_price
            const itemGSTRate = item.gst_rate !== undefined ? item.gst_rate : data.gst_percentage
            const itemGSTComponents = calculateGSTComponents(itemAmount, itemGSTRate, supplyType)

            return {
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: itemAmount,
                hsn_sac_code: item.hsn_sac_code || null,
                hsn_sac_type: item.hsn_sac_type || null,
                gst_rate: itemGSTRate,
                item_cgst: itemGSTComponents.cgst,
                item_sgst: itemGSTComponents.sgst,
                item_igst: itemGSTComponents.igst,
                item_tax_amount: itemGSTComponents.totalTax
            }
        })

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(items)

        if (itemsError) {
            console.error('Error creating invoice items:', itemsError)
            return { success: false, error: 'Failed to create invoice items' }
        }
    
    // Handle payment collection if mark_as_paid is true
    if (data.mark_as_paid && data.payment_amount && data.payment_amount > 0) {
        const { error: paymentError } = await supabase
            .from('invoice_payments')
            .insert({
                invoice_id: invoice.id,
                user_id: user.id,
                amount: data.payment_amount,
                payment_method: data.payment_method || 'cash',
                payment_notes: data.payment_notes || null,
                payment_date: data.payment_date || new Date().toISOString()
            })

        if (paymentError) {
            console.error('Error recording payment:', paymentError)
            // Don't fail the entire operation, just log the error
        } else {
            // Update invoice with payment details
            const newStatus = data.payment_amount >= invoice.total ? 'paid' : 'partial'
            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    status: newStatus,
                    amount_paid: data.payment_amount,
                    amount_remaining: invoice.total - data.payment_amount,
                    is_partial_payment: data.payment_amount < invoice.total
                })
                .eq('id', invoice.id)

            if (updateError) {
                console.error('Error updating invoice payment status:', updateError)
            }
        }
    }
    
    // If this is a recurring invoice, create the recurring template
    if ((data as any).is_recurring) {
        const recurringData = data as CreateInvoiceData & {
            is_recurring: boolean
            recurring_frequency?: 'monthly' | 'yearly'
            recurring_start_date?: string
            recurring_end_date?: string
        }
        
        if (recurringData.is_recurring && recurringData.recurring_frequency && recurringData.recurring_start_date) {
            await createRecurringFromInvoice(
                invoice.id,
                data.customer_id,
                recurringData.recurring_frequency,
                recurringData.recurring_start_date,
                recurringData.recurring_end_date,
                data.gst_percentage,
                data.notes,
                data.items
            )
        }
    }

        revalidatePath('/invoices')
        return { success: true, invoiceId: invoice.id }
    } catch (error) {
        console.error('Error in createInvoice:', error)
        return { success: false, error: 'An unexpected error occurred while creating invoice' }
    }
}

interface UpdateInvoiceData {
    customer_id: string
    invoice_date: string
    due_date?: string
    gst_percentage: number
    supply_type?: 'intra-state' | 'inter-state'
    reverse_charge_applicable?: boolean
    notes?: string
    items: Array<{
        description: string
        quantity: number
        unit_price: number
        hsn_sac_code?: string
        hsn_sac_type?: 'HSN' | 'SAC'
        gst_rate?: number
    }>
}

export async function updateInvoice(id: string, data: UpdateInvoiceData) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const supplyType = data.supply_type || 'intra-state'
        const reverseChargeApplicable = data.reverse_charge_applicable || false

        // Calculate totals with proper GST breakdown
        const subtotal = data.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price)
        }, 0)

        // Calculate GST components based on supply type
        const gstComponents = calculateGSTComponents(subtotal, data.gst_percentage, supplyType)

        // Update invoice with full GST breakdown
        const { error: invoiceError } = await supabase
            .from('invoices')
            .update({
                customer_id: data.customer_id,
                invoice_date: data.invoice_date,
                due_date: data.due_date || null,
                subtotal,
                gst_percentage: data.gst_percentage,
                gst_amount: gstComponents.totalTax,
                cgst_amount: gstComponents.cgst,
                sgst_amount: gstComponents.sgst,
                igst_amount: gstComponents.igst,
                supply_type: supplyType,
                reverse_charge_applicable: reverseChargeApplicable,
                total: gstComponents.totalAmount,
                notes: data.notes || null,
            })
            .eq('id', id)
            .eq('user_id', user.id)

        if (invoiceError) {
            console.error('Error updating invoice:', invoiceError)
            return { success: false, error: 'Failed to update invoice' }
        }

        // Delete existing items
        const { error: deleteError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id)

        if (deleteError) {
            console.error('Error deleting old invoice items:', deleteError)
            return { success: false, error: 'Failed to update invoice items' }
        }

        // Create new invoice items with HSN/SAC and individual tax rates
        const items = data.items.map(item => {
            const itemAmount = item.quantity * item.unit_price
            const itemGSTRate = item.gst_rate !== undefined ? item.gst_rate : data.gst_percentage
            const itemGSTComponents = calculateGSTComponents(itemAmount, itemGSTRate, supplyType)

            return {
                invoice_id: id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: itemAmount,
                hsn_sac_code: item.hsn_sac_code || null,
                hsn_sac_type: item.hsn_sac_type || null,
                gst_rate: itemGSTRate,
                item_cgst: itemGSTComponents.cgst,
                item_sgst: itemGSTComponents.sgst,
                item_igst: itemGSTComponents.igst,
                item_tax_amount: itemGSTComponents.totalTax
            }
        })

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(items)

        if (itemsError) {
            console.error('Error creating invoice items:', itemsError)
            return { success: false, error: 'Failed to create invoice items' }
        }

        revalidatePath('/invoices')
        return { success: true, invoiceId: id }
    } catch (error) {
        console.error('Error in updateInvoice:', error)
        return { success: false, error: 'An unexpected error occurred while updating invoice' }
    }
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
    'use server'
    
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { error } = await supabase
            .from('invoices')
            .update({ status })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error updating invoice status:', error)
            return { success: false, error: 'Failed to update invoice status' }
        }

        revalidatePath('/invoices')
        return { success: true }
    } catch (error) {
        console.error('Error in updateInvoiceStatus:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function deleteInvoice(id: string) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting invoice:', error)
            return { success: false, error: 'Failed to delete invoice' }
        }

        revalidatePath('/invoices')
        return { success: true }
    } catch (error) {
        console.error('Error in deleteInvoice:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

// Helper function to create recurring invoice template from regular invoice
async function createRecurringFromInvoice(
    invoiceId: string,
    customerId: string,
    frequency: 'monthly' | 'yearly',
    startDate: string,
    endDate: string | undefined,
    gstPercentage: number,
    notes: string | undefined,
    items: Array<{
        description: string
        quantity: number
        unit_price: number
    }>
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return
    }

    // Calculate next invoice date
    const start = new Date(startDate)
    const nextDate = new Date(start)
    
    if (frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1)
    } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
    }

    // Create recurring invoice template
    const { data: recurringInvoice, error: recurringError } = await supabase
        .from('recurring_invoices')
        .insert([{
            user_id: user.id,
            customer_id: customerId,
            template_invoice_id: invoiceId,
            frequency,
            start_date: startDate,
            end_date: endDate || null,
            next_invoice_date: nextDate.toISOString().split('T')[0],
            gst_percentage: gstPercentage,
            notes: notes || null,
            is_active: true
        }])
        .select()
        .single()

    if (recurringError) {
        console.error('Error creating recurring invoice:', recurringError)
        throw new Error('Failed to create recurring invoice template')
    }

    // Create recurring invoice items
    const recurringItems = items.map(item => ({
        recurring_invoice_id: recurringInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
    }))

    const { error: itemsError } = await supabase
        .from('recurring_invoice_items')
        .insert(recurringItems)

    if (itemsError) {
        console.error('Error creating recurring invoice items:', itemsError)
        throw new Error('Failed to create recurring invoice items')
    }

    // Create reminder for next billing date (7 days before)
    const reminderDate = new Date(nextDate)
    reminderDate.setDate(reminderDate.getDate() - 7)

    await supabase
        .from('reminders')
        .insert([{
            user_id: user.id,
            recurring_invoice_id: recurringInvoice.id,
            reminder_type: 'recurring_upcoming',
            reminder_date: reminderDate.toISOString().split('T')[0],
            days_before: 7,
            message: `Recurring invoice will be generated on ${nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
            is_sent: false
        }])

    revalidatePath('/invoices/recurring')
    revalidatePath('/reminders')
}
