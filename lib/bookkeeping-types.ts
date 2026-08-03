export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export type JournalEntryStatus = 'draft' | 'posted' | 'void'
export type JournalEntrySource = 'manual' | 'invoice' | 'expense' | 'payment' | 'payroll'

export interface ChartOfAccount {
    id: string
    user_id: string
    account_code: string
    account_name: string
    account_type: AccountType
    category: string
    description?: string | null
    current_balance: number
    is_system: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface JournalEntryLine {
    id?: string
    journal_entry_id?: string
    account_id: string
    debit_amount: number
    credit_amount: number
    memo?: string | null
    account_name?: string
    account_code?: string
}

export interface JournalEntry {
    id: string
    user_id: string
    entry_number: string
    entry_date: string
    description: string
    reference?: string | null
    status: JournalEntryStatus
    source: JournalEntrySource
    created_at: string
    updated_at: string
    lines?: JournalEntryLine[]
    total_debit?: number
    total_credit?: number
}

export interface TrialBalanceItem {
    account_id: string
    account_code: string
    account_name: string
    account_type: AccountType
    category: string
    total_debit: number
    total_credit: number
    net_balance: number
}

export interface ProfitAndLossReport {
    revenueAccounts: { code: string; name: string; amount: number }[]
    totalRevenue: number
    expenseAccounts: { code: string; name: string; amount: number }[]
    totalExpense: number
    netProfit: number
}

export interface BalanceSheetReport {
    assetAccounts: { code: string; name: string; amount: number }[]
    totalAssets: number
    liabilityAccounts: { code: string; name: string; amount: number }[]
    totalLiabilities: number
    equityAccounts: { code: string; name: string; amount: number }[]
    totalEquity: number
    retainedEarnings: number
    isBalanced: boolean
}

export interface BankAccount {
    id: string
    user_id: string
    bank_name: string
    account_name: string
    account_number: string
    ifsc_code?: string | null
    account_type: 'current' | 'savings' | 'credit'
    current_balance: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface BankReconciliation {
    id: string
    user_id: string
    bank_account_id: string
    statement_date: string
    statement_balance: number
    ledger_balance: number
    difference: number
    status: 'draft' | 'reconciled'
    notes?: string | null
    reconciled_at: string
}

export interface CreateAccountInput {
    account_code: string
    account_name: string
    account_type: AccountType
    category: string
    description?: string
}

export interface CreateJournalEntryInput {
    entry_date: string
    description: string
    reference?: string
    source?: JournalEntrySource
    lines: {
        account_id: string
        debit_amount: number
        credit_amount: number
        memo?: string
    }[]
}

export interface CreateBankAccountInput {
    bank_name: string
    account_name: string
    account_number: string
    ifsc_code?: string
    account_type?: 'current' | 'savings' | 'credit'
    initial_balance?: number
}
