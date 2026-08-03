'use me' // Server actions directive
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { 
    ChartOfAccount, 
    JournalEntry, 
    JournalEntryLine, 
    TrialBalanceItem, 
    ProfitAndLossReport, 
    BalanceSheetReport, 
    BankAccount, 
    BankReconciliation,
    CreateAccountInput, 
    CreateJournalEntryInput, 
    CreateBankAccountInput 
} from "./bookkeeping-types"

const DEFAULT_COA_SEED: Omit<CreateAccountInput, 'user_id'>[] = [
    // Assets
    { account_code: '1010', account_name: 'Cash on Hand', account_type: 'asset', category: 'Current Asset', description: 'Physical cash available' },
    { account_code: '1020', account_name: 'Bank Operating Account', account_type: 'asset', category: 'Current Asset', description: 'Main business bank account' },
    { account_code: '1100', account_name: 'Accounts Receivable', account_type: 'asset', category: 'Current Asset', description: 'Money owed by customers' },
    { account_code: '1200', account_name: 'Merchandise Inventory', account_type: 'asset', category: 'Current Asset', description: 'Inventory stock on hand' },
    { account_code: '1500', account_name: 'Office Equipment', account_type: 'asset', category: 'Fixed Asset', description: 'Computers, printers, furniture' },

    // Liabilities
    { account_code: '2010', account_name: 'Accounts Payable', account_type: 'liability', category: 'Current Liability', description: 'Money owed to vendors & suppliers' },
    { account_code: '2100', account_name: 'GST / Tax Payable', account_type: 'liability', category: 'Current Liability', description: 'Collected tax payable to govt' },
    { account_code: '2200', account_name: 'Short Term Loans', account_type: 'liability', category: 'Current Liability', description: 'Bank overdrafts and credit lines' },

    // Equity
    { account_code: '3010', account_name: 'Owner Capital', account_type: 'equity', category: 'Equity', description: 'Initial capital contributed by owner' },
    { account_code: '3020', account_name: 'Retained Earnings', account_type: 'equity', category: 'Equity', description: 'Accumulated profits retained' },

    // Revenue
    { account_code: '4010', account_name: 'Sales & Service Income', account_type: 'revenue', category: 'Operating Revenue', description: 'Income from client invoices' },
    { account_code: '4020', account_name: 'Consulting Income', account_type: 'revenue', category: 'Operating Revenue', description: 'Professional consulting fees' },
    { account_code: '4900', account_name: 'Other Income', account_type: 'revenue', category: 'Other Revenue', description: 'Interest, refunds, discounts' },

    // Expenses
    { account_code: '5010', account_name: 'Cost of Goods Sold (COGS)', account_type: 'expense', category: 'Direct Expense', description: 'Direct material or service costs' },
    { account_code: '5100', account_name: 'Rent & Office Expense', account_type: 'expense', category: 'Operating Expense', description: 'Office rent and maintenance' },
    { account_code: '5200', account_name: 'Utilities & Software', account_type: 'expense', category: 'Operating Expense', description: 'Internet, electricity, SaaS tools' },
    { account_code: '5300', account_name: 'Salaries & Payroll', account_type: 'expense', category: 'Operating Expense', description: 'Employee compensation' },
    { account_code: '5400', account_name: 'Marketing & Travel', account_type: 'expense', category: 'Operating Expense', description: 'Ads, promotions, business travel' },
    { account_code: '5900', account_name: 'Miscellaneous Expense', account_type: 'expense', category: 'Operating Expense', description: 'General sundry expenses' },
]

export async function seedDefaultCoA(): Promise<{ success: boolean; count?: number; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check if user already has accounts
    const { count } = await supabase
        .from('chart_of_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (count && count > 0) {
        return { success: true, count }
    }

    const accountsToInsert = DEFAULT_COA_SEED.map(acc => ({
        user_id: user.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        account_type: acc.account_type,
        category: acc.category,
        description: acc.description,
        current_balance: 0,
        is_system: true,
        is_active: true
    }))

    const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert(accountsToInsert)
        .select()

    if (error) {
        console.error('Error seeding CoA:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/bookkeeping')
    return { success: true, count: data.length }
}

export async function getChartOfAccounts(): Promise<ChartOfAccount[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('account_code', { ascending: true })

    if (error) {
        console.error('Error fetching Chart of Accounts:', error)
        return []
    }

    // Auto-seed if empty
    if (!data || data.length === 0) {
        await seedDefaultCoA()
        const { data: seededData } = await supabase
            .from('chart_of_accounts')
            .select('*')
            .eq('user_id', user.id)
            .order('account_code', { ascending: true })
        return (seededData as ChartOfAccount[]) || []
    }

    return data as ChartOfAccount[]
}

export async function createAccount(input: CreateAccountInput): Promise<{ success: boolean; data?: ChartOfAccount; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const newAccount = {
        user_id: user.id,
        account_code: input.account_code.trim(),
        account_name: input.account_name.trim(),
        account_type: input.account_type,
        category: input.category.trim(),
        description: input.description || null,
        current_balance: 0,
        is_system: false,
        is_active: true
    }

    const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([newAccount])
        .select()
        .single()

    if (error) {
        console.error('Error creating account:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/bookkeeping')
    return { success: true, data: data as ChartOfAccount }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

    if (error || !entries) {
        console.error('Error fetching journal entries:', error)
        return []
    }

    const entryIds = entries.map(e => e.id)
    if (entryIds.length === 0) return []

    const { data: lines } = await supabase
        .from('journal_entry_lines')
        .select('*, chart_of_accounts(account_name, account_code)')
        .in('journal_entry_id', entryIds)

    const linesByEntry = new Map<string, JournalEntryLine[]>()
    if (lines) {
        for (const l of lines) {
            const entryId = l.journal_entry_id
            if (!linesByEntry.has(entryId)) linesByEntry.set(entryId, [])
            
            const coa = l.chart_of_accounts as any
            linesByEntry.get(entryId)!.push({
                id: l.id,
                journal_entry_id: l.journal_entry_id,
                account_id: l.account_id,
                debit_amount: Number(l.debit_amount || 0),
                credit_amount: Number(l.credit_amount || 0),
                memo: l.memo,
                account_name: coa?.account_name || 'Account',
                account_code: coa?.account_code || ''
            })
        }
    }

    return entries.map(e => {
        const entryLines = linesByEntry.get(e.id) || []
        const total_debit = entryLines.reduce((sum, l) => sum + l.debit_amount, 0)
        const total_credit = entryLines.reduce((sum, l) => sum + l.credit_amount, 0)
        return {
            ...e,
            lines: entryLines,
            total_debit,
            total_credit
        } as JournalEntry
    })
}

export async function createJournalEntry(input: CreateJournalEntryInput): Promise<{ success: boolean; data?: any; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Double-entry validation: Total Debits MUST equal Total Credits
    const totalDebit = input.lines.reduce((sum, l) => sum + Number(l.debit_amount || 0), 0)
    const totalCredit = input.lines.reduce((sum, l) => sum + Number(l.credit_amount || 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return { 
            success: false, 
            error: `Unbalanced entry! Total Debits (₹${totalDebit.toFixed(2)}) must equal Total Credits (₹${totalCredit.toFixed(2)})` 
        }
    }

    if (totalDebit <= 0) {
        return { success: false, error: 'Journal entry must have a value greater than 0' }
    }

    // Auto-generate entry number: JE-YYYY-XXXX
    const year = new Date().getFullYear()
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const entryNumber = `JE-${year}-${randomSuffix}`

    const { data: entry, error: entryErr } = await supabase
        .from('journal_entries')
        .insert([{
            user_id: user.id,
            entry_number: entryNumber,
            entry_date: input.entry_date,
            description: input.description,
            reference: input.reference || null,
            status: 'posted',
            source: input.source || 'manual'
        }])
        .select()
        .single()

    if (entryErr || !entry) {
        console.error('Error creating journal entry:', entryErr)
        return { success: false, error: entryErr?.message || 'Failed to create entry' }
    }

    const linesToInsert = input.lines.map(l => ({
        journal_entry_id: entry.id,
        account_id: l.account_id,
        debit_amount: Number(l.debit_amount || 0),
        credit_amount: Number(l.credit_amount || 0),
        memo: l.memo || null
    }))

    const { error: linesErr } = await supabase
        .from('journal_entry_lines')
        .insert(linesToInsert)

    if (linesErr) {
        console.error('Error inserting entry lines:', linesErr)
        return { success: false, error: linesErr.message }
    }

    // Update Chart of Accounts balances
    for (const line of input.lines) {
        const { data: account } = await supabase
            .from('chart_of_accounts')
            .select('current_balance, account_type')
            .eq('id', line.account_id)
            .single()

        if (account) {
            let balanceChange = 0
            // Normal balance rules: Asset & Expense increase with Debit, Liability/Equity/Revenue increase with Credit
            if (account.account_type === 'asset' || account.account_type === 'expense') {
                balanceChange = Number(line.debit_amount || 0) - Number(line.credit_amount || 0)
            } else {
                balanceChange = Number(line.credit_amount || 0) - Number(line.debit_amount || 0)
            }

            const newBalance = Number(account.current_balance || 0) + balanceChange

            await supabase
                .from('chart_of_accounts')
                .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
                .eq('id', line.account_id)
        }
    }

    revalidatePath('/bookkeeping')
    return { success: true, data: entry }
}

export async function getTrialBalance(): Promise<TrialBalanceItem[]> {
    const accounts = await getChartOfAccounts()
    const entries = await getJournalEntries()

    const accountTotals = new Map<string, { debit: number; credit: number }>()

    for (const entry of entries) {
        if (entry.lines) {
            for (const l of entry.lines) {
                if (!accountTotals.has(l.account_id)) {
                    accountTotals.set(l.account_id, { debit: 0, credit: 0 })
                }
                const cur = accountTotals.get(l.account_id)!
                cur.debit += Number(l.debit_amount || 0)
                cur.credit += Number(l.credit_amount || 0)
            }
        }
    }

    return accounts.map(acc => {
        const totals = accountTotals.get(acc.id) || { debit: 0, credit: 0 }
        let net = 0
        if (acc.account_type === 'asset' || acc.account_type === 'expense') {
            net = totals.debit - totals.credit
        } else {
            net = totals.credit - totals.debit
        }

        return {
            account_id: acc.id,
            account_code: acc.account_code,
            account_name: acc.account_name,
            account_type: acc.account_type,
            category: acc.category,
            total_debit: totals.debit,
            total_credit: totals.credit,
            net_balance: net
        }
    })
}

export async function getProfitAndLoss(): Promise<ProfitAndLossReport> {
    const trialBalance = await getTrialBalance()

    const revenueAccounts: { code: string; name: string; amount: number }[] = []
    let totalRevenue = 0

    const expenseAccounts: { code: string; name: string; amount: number }[] = []
    let totalExpense = 0

    for (const item of trialBalance) {
        if (item.account_type === 'revenue') {
            revenueAccounts.push({ code: item.account_code, name: item.account_name, amount: item.net_balance })
            totalRevenue += item.net_balance
        } else if (item.account_type === 'expense') {
            expenseAccounts.push({ code: item.account_code, name: item.account_name, amount: item.net_balance })
            totalExpense += item.net_balance
        }
    }

    return {
        revenueAccounts,
        totalRevenue,
        expenseAccounts,
        totalExpense,
        netProfit: totalRevenue - totalExpense
    }
}

export async function getBalanceSheet(): Promise<BalanceSheetReport> {
    const trialBalance = await getTrialBalance()
    const pnl = await getProfitAndLoss()

    const assetAccounts: { code: string; name: string; amount: number }[] = []
    let totalAssets = 0

    const liabilityAccounts: { code: string; name: string; amount: number }[] = []
    let totalLiabilities = 0

    const equityAccounts: { code: string; name: string; amount: number }[] = []
    let totalEquity = 0

    for (const item of trialBalance) {
        if (item.account_type === 'asset') {
            assetAccounts.push({ code: item.account_code, name: item.account_name, amount: item.net_balance })
            totalAssets += item.net_balance
        } else if (item.account_type === 'liability') {
            liabilityAccounts.push({ code: item.account_code, name: item.account_name, amount: item.net_balance })
            totalLiabilities += item.net_balance
        } else if (item.account_type === 'equity') {
            equityAccounts.push({ code: item.account_code, name: item.account_name, amount: item.net_balance })
            totalEquity += item.net_balance
        }
    }

    const retainedEarnings = pnl.netProfit
    const finalEquity = totalEquity + retainedEarnings
    const totalLiabilitiesAndEquity = totalLiabilities + finalEquity

    return {
        assetAccounts,
        totalAssets,
        liabilityAccounts,
        totalLiabilities,
        equityAccounts,
        totalEquity: finalEquity,
        retainedEarnings,
        isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01
    }
}

export async function getBankAccounts(): Promise<BankAccount[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching bank accounts:', error)
        return []
    }

    return data as BankAccount[]
}

export async function createBankAccount(input: CreateBankAccountInput): Promise<{ success: boolean; data?: BankAccount; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const newAccount = {
        user_id: user.id,
        bank_name: input.bank_name,
        account_name: input.account_name,
        account_number: input.account_number,
        ifsc_code: input.ifsc_code || null,
        account_type: input.account_type || 'current',
        current_balance: input.initial_balance || 0,
        is_active: true
    }

    const { data, error } = await supabase
        .from('bank_accounts')
        .insert([newAccount])
        .select()
        .single()

    if (error) {
        console.error('Error creating bank account:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/bookkeeping')
    return { success: true, data: data as BankAccount }
}

export async function reconcileBankAccount(
    bankAccountId: string, 
    statementDate: string, 
    statementBalance: number, 
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: bankAccount } = await supabase
        .from('bank_accounts')
        .select('current_balance')
        .eq('id', bankAccountId)
        .single()

    const ledgerBalance = Number(bankAccount?.current_balance || 0)
    const difference = statementBalance - ledgerBalance

    const reconciliation = {
        user_id: user.id,
        bank_account_id: bankAccountId,
        statement_date: statementDate,
        statement_balance: statementBalance,
        ledger_balance: ledgerBalance,
        difference,
        status: difference === 0 ? 'reconciled' : 'draft',
        notes: notes || null
    }

    const { error } = await supabase
        .from('bank_reconciliations')
        .insert([reconciliation])

    if (error) {
        console.error('Error recording bank reconciliation:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/bookkeeping')
    return { success: true }
}

export async function postPayrollJournalEntry(
    payrollRunId: string,
    month: number,
    year: number,
    grossSalary: number,
    totalDeductions: number,
    netPay: number
): Promise<{ success: boolean; entryId?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const coa = await getChartOfAccounts()
    const salaryAccount = coa.find(a => a.account_code === '5300') || coa.find(a => a.account_type === 'expense')
    const bankAccount = coa.find(a => a.account_code === '1020') || coa.find(a => a.account_type === 'asset')
    const liabilityAccount = coa.find(a => a.account_code === '2010') || coa.find(a => a.account_type === 'liability')

    if (!salaryAccount || !bankAccount) {
        return { success: false, error: 'Required Chart of Accounts (Expense / Bank) missing.' }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthStr = monthNames[month - 1] || `${month}`

    const lines = [
        {
            account_id: salaryAccount.id,
            debit_amount: grossSalary,
            credit_amount: 0,
            memo: `Gross salary for ${monthStr} ${year}`
        },
        {
            account_id: bankAccount.id,
            debit_amount: 0,
            credit_amount: netPay,
            memo: `Net salary payout via Bank for ${monthStr} ${year}`
        }
    ]

    if (totalDeductions > 0 && liabilityAccount) {
        lines.push({
            account_id: liabilityAccount.id,
            debit_amount: 0,
            credit_amount: totalDeductions,
            memo: `Payroll deductions (PF/ESI/TDS) for ${monthStr} ${year}`
        })
    }

    const result = await createJournalEntry({
        entry_date: new Date().toISOString().slice(0, 10),
        description: `Payroll Processing - ${monthStr} ${year}`,
        reference: `PAYROLL-${year}-${month}`,
        source: 'payroll',
        lines
    })

    if (result.success && result.data) {
        return { success: true, entryId: result.data.id }
    } else {
        return { success: false, error: result.error || 'Failed to post payroll journal entry' }
    }
}

