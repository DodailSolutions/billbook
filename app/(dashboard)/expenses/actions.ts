'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getExpensesList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('expenses')
        .select(`
            *,
            expense_categories (category_name),
            vendors (vendor_name)
        `)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })

    if (error) {
        console.error('Error fetching expenses:', error.message)
        return []
    }
    return data || []
}

export async function getExpenseCategoriesWithSeed() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('category_name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error.message)
        return []
    }

    if (!data || data.length === 0) {
        const defaultCategories = [
            { category_name: 'Office Supplies', category_type: 'operational', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Rent & Rates', category_type: 'operational', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Utilities', category_type: 'operational', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Marketing & Advertising', category_type: 'operational', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Travel & Lodging', category_type: 'travel', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Meals & Entertainment', category_type: 'travel', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Salaries & Wages', category_type: 'staff', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Software & SaaS', category_type: 'operational', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Hardware & Equipment', category_type: 'capital', is_tax_deductible: true, user_id: user.id },
            { category_name: 'Other Expenses', category_type: 'other', is_tax_deductible: true, user_id: user.id }
        ]

        const { error: seedError } = await supabase
            .from('expense_categories')
            .insert(defaultCategories)

        if (seedError) {
            console.error('Error seeding categories:', seedError.message)
        } else {
            const { data: refetched, error: refetchError } = await supabase
                .from('expense_categories')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('category_name', { ascending: true })
            if (refetchError) {
                console.error('Error fetching seeded categories:', refetchError.message)
            } else {
                return refetched || []
            }
        }
    }

    return data || []
}

export async function getVendorsList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('vendors')
        .select('id, vendor_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('vendor_name', { ascending: true })

    if (error) {
        console.error('Error fetching vendors:', error.message)
        return []
    }
    return data || []
}

export async function createExpenseAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const amount = parseFloat(formData.get('amount') as string) || 0
    const taxAmount = parseFloat(formData.get('tax_amount') as string) || 0
    const totalAmount = amount + taxAmount

    const expenseDate = formData.get('expense_date') as string || new Date().toISOString().split('T')[0]
    const expenseNumber = (formData.get('expense_number') as string)?.trim() || `EXP-${Date.now()}`

    let vendorId = formData.get('vendor_id') as string || null
    if (vendorId === '' || vendorId === 'null' || vendorId === 'undefined') {
        vendorId = null
    }
    const payeeName = (formData.get('payee_name') as string)?.trim() || null

    const expenseData = {
        user_id: user.id,
        expense_number: expenseNumber,
        expense_date: expenseDate,
        expense_category_id: formData.get('expense_category_id') as string,
        expense_type: formData.get('expense_type') as string || 'cash',
        vendor_id: vendorId,
        payee_name: payeeName,
        amount: amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'INR',
        payment_method: formData.get('payment_method') as string || null,
        payment_reference: (formData.get('payment_reference') as string)?.trim() || null,
        payment_date: formData.get('payment_date') as string || expenseDate,
        submitted_by: user.id
    }

    const { error } = await supabase.from('expenses').insert([expenseData])
    if (error) {
        console.error('Error inserting expense:', error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteExpenseAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting expense:', error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return { success: true }
}
