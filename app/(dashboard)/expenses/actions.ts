'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { postExpenseJournalEntry } from '@/lib/bookkeeping-actions'

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
            { category_name: 'Vehicle & Fleet Expenses', category_type: 'travel', is_tax_deductible: true, user_id: user.id },
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

    const { data: insertedExpense, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select('id')
        .single()

    if (error) {
        console.error('Error inserting expense:', error.message)
        return { success: false, error: error.message }
    }

    // ERP Standard: Automatically post real-time journal entry
    try {
        await postExpenseJournalEntry({
            expenseId: insertedExpense?.id || expenseNumber,
            category: 'Operating Expense',
            amount: totalAmount,
            paymentMethod: expenseData.payment_method || expenseData.expense_type,
            expenseDate: expenseDate,
            description: payeeName ? `Paid to ${payeeName}` : undefined
        })
    } catch (e) {
        console.warn('ERP Expense ledger posting warning:', e)
    }

    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    revalidatePath('/bookkeeping')
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

export async function bulkImportExpensesAction(records: Array<{
    date: string
    payeeName: string
    categoryName?: string
    amount: number
    taxAmount?: number
    paymentMethod?: string
    recurrence?: string
}>): Promise<{ success: boolean; importedCount: number; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, importedCount: 0, error: 'Unauthorized' }

    if (!records || records.length === 0) {
        return { success: true, importedCount: 0 }
    }

    // Fetch existing categories to map names to category IDs
    const { data: categories } = await supabase
        .from('expense_categories')
        .select('id, category_name')
        .eq('user_id', user.id)

    const catMap = new Map<string, string>()
    ;(categories || []).forEach(c => catMap.set(c.category_name.toLowerCase(), c.id))

    // Fallback category
    let defaultCatId = categories?.[0]?.id
    if (!defaultCatId) {
        const { data: newCat } = await supabase
            .from('expense_categories')
            .insert([{ category_name: 'General Expenses', category_type: 'operational', user_id: user.id }])
            .select('id')
            .single()
        defaultCatId = newCat?.id
    }

    const rowsToInsert = records.map((r, idx) => {
        const amt = Number(r.amount) || 0
        const tax = Number(r.taxAmount) || 0
        const total = amt + tax
        const catId = (r.categoryName && catMap.get(r.categoryName.toLowerCase())) || defaultCatId
        const dateStr = r.date || new Date().toISOString().slice(0, 10)
        const expNum = `EXP-IMP-${Date.now().toString().slice(-6)}-${idx + 1}`
        const rec = r.recurrence || 'one_time'

        return {
            user_id: user.id,
            expense_number: expNum,
            expense_date: dateStr,
            expense_category_id: catId,
            expense_type: rec !== 'one_time' ? `recurring_${rec}` : 'cash',
            payee_name: r.payeeName || 'Expense Payee',
            amount: amt,
            tax_amount: tax,
            total_amount: total,
            currency: 'INR',
            payment_method: r.paymentMethod || 'bank_transfer',
            payment_reference: rec !== 'one_time' ? `Cycle: ${rec}` : 'Imported via Excel',
            payment_date: dateStr,
            submitted_by: user.id
        }
    })

    const { error } = await supabase
        .from('expenses')
        .insert(rowsToInsert)

    if (error) {
        console.error('Error bulk importing expenses:', error.message)
        return { success: false, importedCount: 0, error: error.message }
    }

    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    revalidatePath('/bookkeeping')
    return { success: true, importedCount: rowsToInsert.length }
}
