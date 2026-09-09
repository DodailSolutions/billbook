'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { 
    ChartOfAccount, 
    JournalEntry, 
    JournalEntryLine, 
    TrialBalanceItem, 
    TrialBalanceReport,
    ProfitAndLossReport, 
    BalanceSheetReport, 
    CashFlowStatementReport,
    CashFlowLineItem,
    GeneralLedgerReport,
    GeneralLedgerLine,
    PnLAccountItem,
    BalanceSheetAccountItem,
    DateFilterOptions,
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

export function getDefaultFYDates(): { fromDate: string; toDate: string } {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed (April is 3)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1
    const fyEndYear = fyStartYear + 1
    const fromDate = `${fyStartYear}-04-01`
    const toDate = `${fyEndYear}-03-31`
    return { fromDate, toDate }
}

export async function getTrialBalanceReport(filters?: DateFilterOptions): Promise<TrialBalanceReport> {
    const defaults = getDefaultFYDates()
    const fromDate = filters?.fromDate || defaults.fromDate
    const toDate = filters?.toDate || defaults.toDate

    const accounts = await getChartOfAccounts()
    const entries = await getJournalEntries()

    const openingTotals = new Map<string, { debit: number; credit: number }>()
    const periodTotals = new Map<string, { debit: number; credit: number }>()

    for (const entry of entries) {
        if (!entry.lines) continue
        const isOpening = entry.entry_date < fromDate
        const isPeriod = entry.entry_date >= fromDate && entry.entry_date <= toDate

        for (const l of entry.lines) {
            const accId = l.account_id
            const debit = Number(l.debit_amount || 0)
            const credit = Number(l.credit_amount || 0)

            if (isOpening) {
                if (!openingTotals.has(accId)) openingTotals.set(accId, { debit: 0, credit: 0 })
                const o = openingTotals.get(accId)!
                o.debit += debit
                o.credit += credit
            } else if (isPeriod) {
                if (!periodTotals.has(accId)) periodTotals.set(accId, { debit: 0, credit: 0 })
                const p = periodTotals.get(accId)!
                p.debit += debit
                p.credit += credit
            }
        }
    }

    let totalOpeningDebit = 0
    let totalOpeningCredit = 0
    let totalPeriodDebit = 0
    let totalPeriodCredit = 0
    let totalClosingDebit = 0
    let totalClosingCredit = 0

    const items: TrialBalanceItem[] = accounts.map(acc => {
        const op = openingTotals.get(acc.id) || { debit: 0, credit: 0 }
        const pr = periodTotals.get(acc.id) || { debit: 0, credit: 0 }

        let opening_debit = 0
        let opening_credit = 0
        const isDrNormal = acc.account_type === 'asset' || acc.account_type === 'expense'

        const opNet = isDrNormal ? (op.debit - op.credit) : (op.credit - op.debit)
        if (isDrNormal) {
            if (opNet >= 0) opening_debit = opNet
            else opening_credit = Math.abs(opNet)
        } else {
            if (opNet >= 0) opening_credit = opNet
            else opening_debit = Math.abs(opNet)
        }

        const period_debit = pr.debit
        const period_credit = pr.credit

        let closing_debit = 0
        let closing_credit = 0
        const closingNet = isDrNormal 
            ? ((op.debit + pr.debit) - (op.credit + pr.credit))
            : ((op.credit + pr.credit) - (op.debit + pr.debit))

        if (isDrNormal) {
            if (closingNet >= 0) closing_debit = closingNet
            else closing_credit = Math.abs(closingNet)
        } else {
            if (closingNet >= 0) closing_credit = closingNet
            else closing_debit = Math.abs(closingNet)
        }

        totalOpeningDebit += opening_debit
        totalOpeningCredit += opening_credit
        totalPeriodDebit += period_debit
        totalPeriodCredit += period_credit
        totalClosingDebit += closing_debit
        totalClosingCredit += closing_credit

        const total_debit = op.debit + pr.debit
        const total_credit = op.credit + pr.credit
        const net_balance = closing_debit > 0 ? closing_debit : closing_credit

        return {
            account_id: acc.id,
            account_code: acc.account_code,
            account_name: acc.account_name,
            account_type: acc.account_type,
            category: acc.category,
            opening_debit,
            opening_credit,
            period_debit,
            period_credit,
            closing_debit,
            closing_credit,
            total_debit,
            total_credit,
            net_balance
        }
    })

    const difference = Math.abs(totalClosingDebit - totalClosingCredit)
    const isBalanced = difference < 0.05

    return {
        fromDate,
        toDate,
        items,
        totalOpeningDebit,
        totalOpeningCredit,
        totalPeriodDebit,
        totalPeriodCredit,
        totalClosingDebit,
        totalClosingCredit,
        difference,
        isBalanced
    }
}

export async function getTrialBalance(filters?: DateFilterOptions): Promise<TrialBalanceItem[]> {
    const report = await getTrialBalanceReport(filters)
    return report.items
}

export async function getProfitAndLoss(filters?: DateFilterOptions): Promise<ProfitAndLossReport> {
    const defaults = getDefaultFYDates()
    const fromDate = filters?.fromDate || defaults.fromDate
    const toDate = filters?.toDate || defaults.toDate

    const accounts = await getChartOfAccounts()
    const entries = await getJournalEntries()

    const accountPeriodNet = new Map<string, number>()

    for (const entry of entries) {
        if (!entry.lines) continue
        if (entry.entry_date >= fromDate && entry.entry_date <= toDate) {
            for (const l of entry.lines) {
                const current = accountPeriodNet.get(l.account_id) || 0
                const debit = Number(l.debit_amount || 0)
                const credit = Number(l.credit_amount || 0)
                accountPeriodNet.set(l.account_id, current + (credit - debit))
            }
        }
    }

    const directIncomeAccounts: PnLAccountItem[] = []
    const indirectIncomeAccounts: PnLAccountItem[] = []
    let totalDirectIncome = 0
    let totalIndirectIncome = 0

    const directExpenseAccounts: PnLAccountItem[] = []
    const indirectExpenseAccounts: PnLAccountItem[] = []
    let totalDirectExpenses = 0
    let totalIndirectExpenses = 0

    const revenueAccounts: { code: string; name: string; amount: number }[] = []
    const expenseAccounts: { code: string; name: string; amount: number }[] = []

    for (const acc of accounts) {
        const netCrMinusDr = accountPeriodNet.get(acc.id) || 0

        if (acc.account_type === 'revenue') {
            const amount = Math.max(0, netCrMinusDr)
            const item: PnLAccountItem = {
                accountId: acc.id,
                code: acc.account_code,
                name: acc.account_name,
                category: acc.category,
                amount
            }
            revenueAccounts.push({ code: acc.account_code, name: acc.account_name, amount })

            const isIndirect = acc.account_code.startsWith('49') || 
                               acc.category.toLowerCase().includes('other') || 
                               acc.category.toLowerCase().includes('indirect')

            if (isIndirect) {
                indirectIncomeAccounts.push(item)
                totalIndirectIncome += amount
            } else {
                directIncomeAccounts.push(item)
                totalDirectIncome += amount
            }
        } else if (acc.account_type === 'expense') {
            const amount = Math.max(0, -netCrMinusDr)
            const item: PnLAccountItem = {
                accountId: acc.id,
                code: acc.account_code,
                name: acc.account_name,
                category: acc.category,
                amount
            }
            expenseAccounts.push({ code: acc.account_code, name: acc.account_name, amount })

            const isDirect = acc.account_code.startsWith('50') || 
                             acc.category.toLowerCase().includes('direct') || 
                             acc.category.toLowerCase().includes('cogs') || 
                             acc.category.toLowerCase().includes('cost of goods')

            if (isDirect) {
                directExpenseAccounts.push(item)
                totalDirectExpenses += amount
            } else {
                indirectExpenseAccounts.push(item)
                totalIndirectExpenses += amount
            }
        }
    }

    const totalRevenue = totalDirectIncome + totalIndirectIncome
    const totalExpense = totalDirectExpenses + totalIndirectExpenses
    const grossProfit = totalDirectIncome - totalDirectExpenses
    const netProfit = totalRevenue - totalExpense
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
        fromDate,
        toDate,
        directIncomeAccounts,
        totalDirectIncome,
        indirectIncomeAccounts,
        totalIndirectIncome,
        totalRevenue,
        directExpenseAccounts,
        totalDirectExpenses,
        indirectExpenseAccounts,
        totalIndirectExpenses,
        totalExpense,
        grossProfit,
        netProfit,
        netProfitMargin,
        revenueAccounts,
        expenseAccounts
    }
}

export async function getBalanceSheet(filters?: DateFilterOptions): Promise<BalanceSheetReport> {
    const defaults = getDefaultFYDates()
    const fromDate = filters?.fromDate || defaults.fromDate
    const toDate = filters?.toDate || defaults.toDate
    const asOnDate = filters?.asOnDate || toDate

    const accounts = await getChartOfAccounts()
    const entries = await getJournalEntries()

    const cumulativeBalances = new Map<string, { debit: number; credit: number }>()
    let priorPeriodPnL = 0
    let currentPeriodPnL = 0

    for (const entry of entries) {
        if (!entry.lines) continue
        const isUpToAsOn = entry.entry_date <= asOnDate
        const isPrior = entry.entry_date < fromDate
        const isCurrent = entry.entry_date >= fromDate && entry.entry_date <= asOnDate

        for (const l of entry.lines) {
            const accId = l.account_id
            const dr = Number(l.debit_amount || 0)
            const cr = Number(l.credit_amount || 0)

            if (isUpToAsOn) {
                if (!cumulativeBalances.has(accId)) cumulativeBalances.set(accId, { debit: 0, credit: 0 })
                const b = cumulativeBalances.get(accId)!
                b.debit += dr
                b.credit += cr
            }

            const acc = accounts.find(a => a.id === accId)
            if (acc) {
                if (acc.account_type === 'revenue') {
                    if (isPrior) priorPeriodPnL += (cr - dr)
                    if (isCurrent) currentPeriodPnL += (cr - dr)
                } else if (acc.account_type === 'expense') {
                    if (isPrior) priorPeriodPnL -= (dr - cr)
                    if (isCurrent) currentPeriodPnL -= (dr - cr)
                }
            }
        }
    }

    const cashAndBankAccounts: BalanceSheetAccountItem[] = []
    let totalCashAndBank = 0
    const currentAssetAccounts: BalanceSheetAccountItem[] = []
    let totalCurrentAssets = 0
    const fixedAssetAccounts: BalanceSheetAccountItem[] = []
    let totalFixedAssets = 0

    const currentLiabilityAccounts: BalanceSheetAccountItem[] = []
    let totalCurrentLiabilities = 0
    const nonCurrentLiabilityAccounts: BalanceSheetAccountItem[] = []
    let totalNonCurrentLiabilities = 0

    const capitalAccounts: BalanceSheetAccountItem[] = []
    let totalCapital = 0

    const assetAccounts: { code: string; name: string; amount: number }[] = []
    const liabilityAccounts: { code: string; name: string; amount: number }[] = []
    const equityAccounts: { code: string; name: string; amount: number }[] = []

    for (const acc of accounts) {
        const bal = cumulativeBalances.get(acc.id) || { debit: 0, credit: 0 }

        if (acc.account_type === 'asset') {
            const netAsset = bal.debit - bal.credit
            const item: BalanceSheetAccountItem = {
                accountId: acc.id,
                code: acc.account_code,
                name: acc.account_name,
                category: acc.category,
                amount: netAsset
            }
            assetAccounts.push({ code: acc.account_code, name: acc.account_name, amount: netAsset })

            const isCashBank = acc.account_code.startsWith('10') || 
                               acc.category.toLowerCase().includes('cash') || 
                               acc.category.toLowerCase().includes('bank')
            const isFixed = acc.account_code.startsWith('15') || 
                            acc.category.toLowerCase().includes('fixed')

            if (isCashBank) {
                cashAndBankAccounts.push(item)
                totalCashAndBank += netAsset
            } else if (isFixed) {
                fixedAssetAccounts.push(item)
                totalFixedAssets += netAsset
            } else {
                currentAssetAccounts.push(item)
                totalCurrentAssets += netAsset
            }
        } else if (acc.account_type === 'liability') {
            const netLiab = bal.credit - bal.debit
            const item: BalanceSheetAccountItem = {
                accountId: acc.id,
                code: acc.account_code,
                name: acc.account_name,
                category: acc.category,
                amount: netLiab
            }
            liabilityAccounts.push({ code: acc.account_code, name: acc.account_name, amount: netLiab })

            const isNonCurrent = acc.category.toLowerCase().includes('non-current') || 
                                 acc.category.toLowerCase().includes('long term')
            if (isNonCurrent) {
                nonCurrentLiabilityAccounts.push(item)
                totalNonCurrentLiabilities += netLiab
            } else {
                currentLiabilityAccounts.push(item)
                totalCurrentLiabilities += netLiab
            }
        } else if (acc.account_type === 'equity') {
            const netEq = bal.credit - bal.debit
            const item: BalanceSheetAccountItem = {
                accountId: acc.id,
                code: acc.account_code,
                name: acc.account_name,
                category: acc.category,
                amount: netEq
            }
            equityAccounts.push({ code: acc.account_code, name: acc.account_name, amount: netEq })
            capitalAccounts.push(item)
            totalCapital += netEq
        }
    }

    const totalAssets = totalCashAndBank + totalCurrentAssets + totalFixedAssets
    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities
    const retainedEarningsPrior = priorPeriodPnL
    const totalReservesAndSurplus = retainedEarningsPrior + currentPeriodPnL
    const totalEquity = totalCapital + totalReservesAndSurplus
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity
    const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity)
    const isBalanced = difference < 0.05

    return {
        asOnDate,
        fromDate,
        toDate,
        cashAndBankAccounts,
        totalCashAndBank,
        currentAssetAccounts,
        totalCurrentAssets,
        fixedAssetAccounts,
        totalFixedAssets,
        totalAssets,
        currentLiabilityAccounts,
        totalCurrentLiabilities,
        nonCurrentLiabilityAccounts,
        totalNonCurrentLiabilities,
        totalLiabilities,
        capitalAccounts,
        totalCapital,
        retainedEarningsPrior,
        currentPeriodPnL,
        totalReservesAndSurplus,
        totalEquity,
        totalLiabilitiesAndEquity,
        difference,
        isBalanced,
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        retainedEarnings: currentPeriodPnL
    }
}

export async function getCashFlowStatement(filters?: DateFilterOptions): Promise<CashFlowStatementReport> {
    const defaults = getDefaultFYDates()
    const fromDate = filters?.fromDate || defaults.fromDate
    const toDate = filters?.toDate || defaults.toDate

    const accounts = await getChartOfAccounts()
    const entries = await getJournalEntries()

    const pnl = await getProfitAndLoss(filters)
    const netProfit = pnl.netProfit

    const periodChanges = new Map<string, number>()
    const openingBalances = new Map<string, number>()

    for (const entry of entries) {
        if (!entry.lines) continue
        const isBefore = entry.entry_date < fromDate
        const isDuring = entry.entry_date >= fromDate && entry.entry_date <= toDate

        for (const l of entry.lines) {
            const accId = l.account_id
            const dr = Number(l.debit_amount || 0)
            const cr = Number(l.credit_amount || 0)

            if (isBefore) {
                const prev = openingBalances.get(accId) || 0
                openingBalances.set(accId, prev + (dr - cr))
            } else if (isDuring) {
                const prev = periodChanges.get(accId) || 0
                periodChanges.set(accId, prev + (dr - cr))
            }
        }
    }

    const operatingActivities: CashFlowLineItem[] = [
        { description: 'Net Profit / (Loss) for the Period', amount: netProfit }
    ]

    let changeInReceivables = 0
    let changeInInventory = 0
    let changeInPayables = 0
    let changeInTaxPayable = 0
    let changeInFixedAssets = 0
    let changeInCapital = 0
    let changeInLoans = 0

    let openingCashBalance = 0
    let closingCashBalance = 0

    for (const acc of accounts) {
        const delta = periodChanges.get(acc.id) || 0
        const op = openingBalances.get(acc.id) || 0

        const isCashBank = acc.account_code.startsWith('10') || 
                           acc.category.toLowerCase().includes('cash') || 
                           acc.category.toLowerCase().includes('bank')

        if (isCashBank) {
            openingCashBalance += op
            closingCashBalance += (op + delta)
        } else if (acc.account_code === '1100' || acc.category.toLowerCase().includes('receivable')) {
            changeInReceivables += delta
        } else if (acc.account_code === '1200' || acc.category.toLowerCase().includes('inventory')) {
            changeInInventory += delta
        } else if (acc.account_code === '2010' || acc.category.toLowerCase().includes('payable')) {
            changeInPayables += (-delta)
        } else if (acc.account_code === '2100' || acc.category.toLowerCase().includes('tax')) {
            changeInTaxPayable += (-delta)
        } else if (acc.account_type === 'asset' && (acc.account_code.startsWith('15') || acc.category.toLowerCase().includes('fixed'))) {
            changeInFixedAssets += delta
        } else if (acc.account_type === 'equity') {
            changeInCapital += (-delta)
        } else if (acc.account_type === 'liability' && (acc.account_code === '2200' || acc.category.toLowerCase().includes('loan'))) {
            changeInLoans += (-delta)
        }
    }

    if (changeInReceivables !== 0) {
        operatingActivities.push({
            description: changeInReceivables > 0 ? '(Increase) in Accounts Receivable' : 'Decrease in Accounts Receivable',
            amount: -changeInReceivables
        })
    }
    if (changeInInventory !== 0) {
        operatingActivities.push({
            description: changeInInventory > 0 ? '(Increase) in Merchandise Inventory' : 'Decrease in Merchandise Inventory',
            amount: -changeInInventory
        })
    }
    if (changeInPayables !== 0) {
        operatingActivities.push({
            description: changeInPayables > 0 ? 'Increase in Accounts Payable' : '(Decrease) in Accounts Payable',
            amount: changeInPayables
        })
    }
    if (changeInTaxPayable !== 0) {
        operatingActivities.push({
            description: changeInTaxPayable > 0 ? 'Increase in GST / Tax Payable' : '(Decrease) in GST / Tax Payable',
            amount: changeInTaxPayable
        })
    }

    const netCashFromOperating = operatingActivities.reduce((sum, item) => sum + item.amount, 0)

    const investingActivities: CashFlowLineItem[] = []
    if (changeInFixedAssets !== 0) {
        investingActivities.push({
            description: changeInFixedAssets > 0 ? 'Purchase of Fixed Assets & Equipment' : 'Proceeds from Sale of Fixed Assets',
            amount: -changeInFixedAssets
        })
    }
    const netCashFromInvesting = investingActivities.reduce((sum, item) => sum + item.amount, 0)

    const financingActivities: CashFlowLineItem[] = []
    if (changeInCapital !== 0) {
        financingActivities.push({
            description: changeInCapital > 0 ? 'Capital Introduced by Owner' : 'Drawings / Capital Withdrawn by Owner',
            amount: changeInCapital
        })
    }
    if (changeInLoans !== 0) {
        financingActivities.push({
            description: changeInLoans > 0 ? 'Proceeds from Short Term Loans' : 'Repayment of Short Term Loans',
            amount: changeInLoans
        })
    }
    const netCashFromFinancing = financingActivities.reduce((sum, item) => sum + item.amount, 0)

    const netChangeInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing

    if (closingCashBalance === 0 && openingCashBalance === 0 && netChangeInCash !== 0) {
        closingCashBalance = netChangeInCash
    }

    const bs = await getBalanceSheet({ asOnDate: toDate })
    const reconciledBalanceSheetCash = bs.totalCashAndBank
    const isReconciled = Math.abs(closingCashBalance - reconciledBalanceSheetCash) < 1.0

    return {
        fromDate,
        toDate,
        operatingActivities,
        netCashFromOperating,
        investingActivities,
        netCashFromInvesting,
        financingActivities,
        netCashFromFinancing,
        netChangeInCash,
        openingCashBalance,
        closingCashBalance,
        reconciledBalanceSheetCash,
        isReconciled
    }
}

export async function getGeneralLedger(filters?: { accountId?: string; fromDate?: string; toDate?: string }): Promise<GeneralLedgerReport> {
    const defaults = getDefaultFYDates()
    const fromDate = filters?.fromDate || defaults.fromDate
    const toDate = filters?.toDate || defaults.toDate

    const accounts = await getChartOfAccounts()
    const targetAccount = filters?.accountId 
        ? accounts.find(a => a.id === filters.accountId) || accounts[0]
        : accounts[0]

    if (!targetAccount) {
        return {
            accountId: '',
            accountCode: '',
            accountName: 'No Account Found',
            accountType: 'asset',
            category: '',
            fromDate,
            toDate,
            openingBalance: 0,
            openingBalanceType: 'Dr',
            totalDebit: 0,
            totalCredit: 0,
            closingBalance: 0,
            closingBalanceType: 'Dr',
            lines: []
        }
    }

    const entries = await getJournalEntries()
    const isDrNormal = targetAccount.account_type === 'asset' || targetAccount.account_type === 'expense'

    const sortedEntries = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date))

    let openingDebit = 0
    let openingCredit = 0

    for (const entry of sortedEntries) {
        if (!entry.lines) continue
        if (entry.entry_date < fromDate) {
            for (const l of entry.lines) {
                if (l.account_id === targetAccount.id) {
                    openingDebit += Number(l.debit_amount || 0)
                    openingCredit += Number(l.credit_amount || 0)
                }
            }
        }
    }

    const openingNet = isDrNormal ? (openingDebit - openingCredit) : (openingCredit - openingDebit)
    const openingBalance = Math.abs(openingNet)
    const openingBalanceType: 'Dr' | 'Cr' = isDrNormal 
        ? (openingNet >= 0 ? 'Dr' : 'Cr')
        : (openingNet >= 0 ? 'Cr' : 'Dr')

    let currentBalance = isDrNormal ? openingNet : openingNet
    let totalDebit = 0
    let totalCredit = 0

    const lines: GeneralLedgerLine[] = []

    for (const entry of sortedEntries) {
        if (!entry.lines) continue
        if (entry.entry_date >= fromDate && entry.entry_date <= toDate) {
            const matchingLine = entry.lines.find(l => l.account_id === targetAccount.id)
            if (!matchingLine) continue

            const debit = Number(matchingLine.debit_amount || 0)
            const credit = Number(matchingLine.credit_amount || 0)
            totalDebit += debit
            totalCredit += credit

            if (isDrNormal) {
                currentBalance += (debit - credit)
            } else {
                currentBalance += (credit - debit)
            }

            const otherLines = entry.lines.filter(l => l.account_id !== targetAccount.id)
            const oppositeAccount = otherLines.length === 1 
                ? (otherLines[0].account_name || 'Contra Account')
                : (otherLines.length > 1 ? 'As Per Journal Voucher' : 'Opening/Direct Entry')

            let voucherType = 'Journal Voucher'
            if (entry.source === 'invoice') voucherType = 'Sales Invoice'
            else if (entry.source === 'expense') voucherType = 'Expense Voucher'
            else if (entry.source === 'payroll') voucherType = 'Payroll Payout'
            else if (entry.source === 'payment') voucherType = debit > 0 ? 'Bank Receipt' : 'Bank Payment'

            lines.push({
                id: matchingLine.id || `${entry.id}-${lines.length}`,
                entryDate: entry.entry_date,
                voucherType,
                voucherNo: entry.entry_number || entry.reference || 'JV',
                oppositeAccount,
                description: matchingLine.memo || entry.description,
                debitAmount: debit,
                creditAmount: credit,
                runningBalance: Math.abs(currentBalance),
                balanceType: currentBalance >= 0 ? (isDrNormal ? 'Dr' : 'Cr') : (isDrNormal ? 'Cr' : 'Dr')
            })
        }
    }

    const closingBalance = Math.abs(currentBalance)
    const closingBalanceType: 'Dr' | 'Cr' = currentBalance >= 0 ? (isDrNormal ? 'Dr' : 'Cr') : (isDrNormal ? 'Cr' : 'Dr')

    return {
        accountId: targetAccount.id,
        accountCode: targetAccount.account_code,
        accountName: targetAccount.account_name,
        accountType: targetAccount.account_type,
        category: targetAccount.category,
        fromDate,
        toDate,
        openingBalance,
        openingBalanceType,
        totalDebit,
        totalCredit,
        closingBalance,
        closingBalanceType,
        lines
    }
}

export async function syncInvoicesAndExpensesToLedger(): Promise<{ 
    success: boolean; 
    syncedInvoices: number; 
    syncedExpenses: number; 
    message: string; 
    error?: string 
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, syncedInvoices: 0, syncedExpenses: 0, message: 'Unauthorized' }

    try {
        const coa = await getChartOfAccounts()
        const bankAcc = coa.find(a => a.account_code === '1020') || coa.find(a => a.account_type === 'asset')
        const arAcc = coa.find(a => a.account_code === '1100') || coa.find(a => a.account_type === 'asset')
        const gstAcc = coa.find(a => a.account_code === '2100') || coa.find(a => a.account_type === 'liability')
        const salesAcc = coa.find(a => a.account_code === '4010') || coa.find(a => a.account_type === 'revenue')
        const defaultExpAcc = coa.find(a => a.account_code === '5900') || coa.find(a => a.account_type === 'expense')

        if (!bankAcc || !salesAcc || !defaultExpAcc) {
            return { success: false, syncedInvoices: 0, syncedExpenses: 0, message: 'Default Chart of Accounts required' }
        }

        const { data: invoices } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)

        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)

        const { data: existingEntries } = await supabase
            .from('journal_entries')
            .select('reference')
            .eq('user_id', user.id)

        const existingRefs = new Set((existingEntries || []).map(e => e.reference).filter(Boolean))

        let syncedInvoices = 0
        let syncedExpenses = 0

        if (invoices) {
            for (const inv of invoices) {
                const ref = `INV-${inv.invoice_number || inv.id.slice(0, 8)}`
                if (existingRefs.has(ref)) continue

                const totalAmount = Number(inv.total_amount || 0)
                if (totalAmount <= 0) continue

                const taxAmount = Number(inv.tax_amount || 0)
                const baseAmount = totalAmount - taxAmount
                const debitAccount = inv.status === 'paid' ? bankAcc : (arAcc || bankAcc)

                const lines = [
                    {
                        account_id: debitAccount.id,
                        debit_amount: totalAmount,
                        credit_amount: 0,
                        memo: `Invoice #${inv.invoice_number || ''} ${inv.status === 'paid' ? 'Paid' : 'Receivable'}`
                    },
                    {
                        account_id: salesAcc.id,
                        debit_amount: 0,
                        credit_amount: baseAmount > 0 ? baseAmount : totalAmount,
                        memo: `Sales Revenue #${inv.invoice_number || ''}`
                    }
                ]

                if (taxAmount > 0 && gstAcc) {
                    lines.push({
                        account_id: gstAcc.id,
                        debit_amount: 0,
                        credit_amount: taxAmount,
                        memo: `GST Output on #${inv.invoice_number || ''}`
                    })
                }

                await createJournalEntry({
                    entry_date: inv.invoice_date || new Date().toISOString().slice(0, 10),
                    description: `Sales Invoice #${inv.invoice_number || inv.id.slice(0, 8)}`,
                    reference: ref,
                    source: 'invoice',
                    lines
                })
                existingRefs.add(ref)
                syncedInvoices++
            }
        }

        if (expenses) {
            for (const exp of expenses) {
                const ref = `EXP-${exp.id.slice(0, 8)}`
                if (existingRefs.has(ref)) continue

                const amount = Number(exp.amount || 0)
                if (amount <= 0) continue

                let targetExp = defaultExpAcc
                const desc = (exp.description || '').toLowerCase()
                if (desc.includes('rent')) targetExp = coa.find(a => a.account_code === '5100') || defaultExpAcc
                else if (desc.includes('utilit') || desc.includes('software')) targetExp = coa.find(a => a.account_code === '5200') || defaultExpAcc
                else if (desc.includes('salary') || desc.includes('payroll')) targetExp = coa.find(a => a.account_code === '5300') || defaultExpAcc
                else if (desc.includes('market') || desc.includes('ad') || desc.includes('travel')) targetExp = coa.find(a => a.account_code === '5400') || defaultExpAcc
                else if (desc.includes('cogs') || desc.includes('purchase')) targetExp = coa.find(a => a.account_code === '5010') || defaultExpAcc

                const creditAcc = bankAcc

                await createJournalEntry({
                    entry_date: exp.expense_date || new Date().toISOString().slice(0, 10),
                    description: exp.description || 'Business Expense',
                    reference: ref,
                    source: 'expense',
                    lines: [
                        {
                            account_id: targetExp.id,
                            debit_amount: amount,
                            credit_amount: 0,
                            memo: exp.description || 'Expense'
                        },
                        {
                            account_id: creditAcc.id,
                            debit_amount: 0,
                            credit_amount: amount,
                            memo: `Payment for ${exp.description || 'Expense'}`
                        }
                    ]
                })
                existingRefs.add(ref)
                syncedExpenses++
            }
        }

        revalidatePath('/bookkeeping')
        return {
            success: true,
            syncedInvoices,
            syncedExpenses,
            message: `Successfully synced ${syncedInvoices} invoice(s) and ${syncedExpenses} expense(s) to General Ledger.`
        }
    } catch (e: any) {
        console.error('Error syncing to ledger:', e)
        return { success: false, syncedInvoices: 0, syncedExpenses: 0, message: e.message || 'Sync failed' }
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

