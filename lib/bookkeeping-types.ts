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

export interface DateFilterOptions {
    fromDate?: string
    toDate?: string
    asOnDate?: string
}

export interface TrialBalanceItem {
    account_id: string
    account_code: string
    account_name: string
    account_type: AccountType
    category: string
    opening_debit: number
    opening_credit: number
    period_debit: number
    period_credit: number
    closing_debit: number
    closing_credit: number
    total_debit: number
    total_credit: number
    net_balance: number
}

export interface TrialBalanceReport {
    fromDate: string
    toDate: string
    items: TrialBalanceItem[]
    totalOpeningDebit: number
    totalOpeningCredit: number
    totalPeriodDebit: number
    totalPeriodCredit: number
    totalClosingDebit: number
    totalClosingCredit: number
    difference: number
    isBalanced: boolean
}

export interface PnLAccountItem {
    accountId: string
    code: string
    name: string
    category: string
    amount: number
}

export interface ProfitAndLossReport {
    fromDate: string
    toDate: string
    directIncomeAccounts: PnLAccountItem[]
    totalDirectIncome: number
    indirectIncomeAccounts: PnLAccountItem[]
    totalIndirectIncome: number
    totalRevenue: number
    directExpenseAccounts: PnLAccountItem[]
    totalDirectExpenses: number
    indirectExpenseAccounts: PnLAccountItem[]
    totalIndirectExpenses: number
    totalExpense: number
    grossProfit: number
    netProfit: number
    netProfitMargin: number
    revenueAccounts: { code: string; name: string; amount: number }[]
    expenseAccounts: { code: string; name: string; amount: number }[]
}

export interface BalanceSheetAccountItem {
    accountId: string
    code: string
    name: string
    category: string
    amount: number
}

export interface BalanceSheetReport {
    asOnDate: string
    fromDate: string
    toDate: string
    cashAndBankAccounts: BalanceSheetAccountItem[]
    totalCashAndBank: number
    currentAssetAccounts: BalanceSheetAccountItem[]
    totalCurrentAssets: number
    fixedAssetAccounts: BalanceSheetAccountItem[]
    totalFixedAssets: number
    totalAssets: number
    currentLiabilityAccounts: BalanceSheetAccountItem[]
    totalCurrentLiabilities: number
    nonCurrentLiabilityAccounts: BalanceSheetAccountItem[]
    totalNonCurrentLiabilities: number
    totalLiabilities: number
    capitalAccounts: BalanceSheetAccountItem[]
    totalCapital: number
    retainedEarningsPrior: number
    currentPeriodPnL: number
    totalReservesAndSurplus: number
    totalEquity: number
    totalLiabilitiesAndEquity: number
    difference: number
    isBalanced: boolean
    assetAccounts: { code: string; name: string; amount: number }[]
    liabilityAccounts: { code: string; name: string; amount: number }[]
    equityAccounts: { code: string; name: string; amount: number }[]
    retainedEarnings: number
}

export interface CashFlowLineItem {
    description: string
    amount: number
    isSubtotal?: boolean
}

export interface CashFlowStatementReport {
    fromDate: string
    toDate: string
    operatingActivities: CashFlowLineItem[]
    netCashFromOperating: number
    investingActivities: CashFlowLineItem[]
    netCashFromInvesting: number
    financingActivities: CashFlowLineItem[]
    netCashFromFinancing: number
    netChangeInCash: number
    openingCashBalance: number
    closingCashBalance: number
    reconciledBalanceSheetCash: number
    isReconciled: boolean
}

export interface GeneralLedgerLine {
    id: string
    entryDate: string
    voucherType: string
    voucherNo: string
    oppositeAccount: string
    description: string
    debitAmount: number
    creditAmount: number
    runningBalance: number
    balanceType: 'Dr' | 'Cr'
}

export interface GeneralLedgerReport {
    accountId: string
    accountCode: string
    accountName: string
    accountType: AccountType
    category: string
    fromDate: string
    toDate: string
    openingBalance: number
    openingBalanceType: 'Dr' | 'Cr'
    totalDebit: number
    totalCredit: number
    closingBalance: number
    closingBalanceType: 'Dr' | 'Cr'
    lines: GeneralLedgerLine[]
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
