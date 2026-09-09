'use client'

import { useState, useEffect, useTransition } from 'react'
import { 
    TrialBalanceReport, 
    ProfitAndLossReport, 
    BalanceSheetReport, 
    CashFlowStatementReport,
    GeneralLedgerReport,
    ChartOfAccount 
} from "@/lib/bookkeeping-types"
import { 
    getTrialBalanceReport, 
    getProfitAndLoss, 
    getBalanceSheet, 
    getCashFlowStatement,
    getGeneralLedger,
    getChartOfAccounts,
    getDefaultFYDates,
    syncInvoicesAndExpensesToLedger
} from "@/lib/bookkeeping-actions"
import { getInvoiceSettings } from "@/app/(dashboard)/invoices/settings/actions"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
    Scale, 
    FileSpreadsheet, 
    PieChart, 
    CheckCircle, 
    AlertTriangle, 
    Activity, 
    BookOpen, 
    Printer, 
    Download, 
    RefreshCw, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    ExternalLink,
    Building2,
    DatabaseZap
} from "lucide-react"

export function FinancialStatementsView() {
    const defaultDates = getDefaultFYDates()
    const [subTab, setSubTab] = useState<'pnl' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'general_ledger'>('pnl')
    
    // Filters
    const [fromDate, setFromDate] = useState<string>(defaultDates.fromDate)
    const [toDate, setToDate] = useState<string>(defaultDates.toDate)
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('detailed')
    const [hideZero, setHideZero] = useState<boolean>(true)
    const [selectedAccountId, setSelectedAccountId] = useState<string>('')

    // Data States
    const [pnl, setPnl] = useState<ProfitAndLossReport | null>(null)
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null)
    const [trialBalance, setTrialBalance] = useState<TrialBalanceReport | null>(null)
    const [cashFlow, setCashFlow] = useState<CashFlowStatementReport | null>(null)
    const [ledger, setLedger] = useState<GeneralLedgerReport | null>(null)
    const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
    const [companyName, setCompanyName] = useState<string>('Dodail BillBooky')

    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [syncMessage, setSyncMessage] = useState<string | null>(null)

    // Load initial settings & accounts
    useEffect(() => {
        async function init() {
            try {
                const [invSettings, coaData] = await Promise.all([
                    getInvoiceSettings(),
                    getChartOfAccounts()
                ])
                if (invSettings?.company_name) {
                    setCompanyName(invSettings.company_name)
                }
                setAccounts(coaData)
                if (coaData.length > 0 && !selectedAccountId) {
                    setSelectedAccountId(coaData[0].id)
                }
            } catch (err) {
                console.error('Error initializing settings:', err)
            }
        }
        init()
    }, [])

    // Fetch reports based on subTab & filters
    const loadReports = async () => {
        setLoading(true)
        try {
            const filterPayload = { fromDate, toDate, asOnDate: toDate }
            const [pnlData, bsData, tbData, cfData, glData] = await Promise.all([
                getProfitAndLoss(filterPayload),
                getBalanceSheet(filterPayload),
                getTrialBalanceReport(filterPayload),
                getCashFlowStatement(filterPayload),
                getGeneralLedger({ accountId: selectedAccountId, fromDate, toDate })
            ])
            setPnl(pnlData)
            setBalanceSheet(bsData)
            setTrialBalance(tbData)
            setCashFlow(cfData)
            setLedger(glData)
        } catch (e) {
            console.error('Error loading financial statements:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReports()
    }, [fromDate, toDate, selectedAccountId])

    // Quick Date Presets
    const applyDatePreset = (preset: 'this_fy' | 'last_fy' | 'this_month' | 'this_quarter' | 'all_time') => {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        if (preset === 'this_fy') {
            const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1
            setFromDate(`${fyStartYear}-04-01`)
            setToDate(`${fyStartYear + 1}-03-31`)
        } else if (preset === 'last_fy') {
            const fyStartYear = (currentMonth >= 3 ? currentYear : currentYear - 1) - 1
            setFromDate(`${fyStartYear}-04-01`)
            setToDate(`${fyStartYear + 1}-03-31`)
        } else if (preset === 'this_month') {
            const firstDay = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10)
            const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10)
            setFromDate(firstDay)
            setToDate(lastDay)
        } else if (preset === 'this_quarter') {
            const qStartMonth = Math.floor(currentMonth / 3) * 3
            const firstDay = new Date(currentYear, qStartMonth, 1).toISOString().slice(0, 10)
            const lastDay = new Date(currentYear, qStartMonth + 3, 0).toISOString().slice(0, 10)
            setFromDate(firstDay)
            setToDate(lastDay)
        } else if (preset === 'all_time') {
            setFromDate('2020-01-01')
            setToDate(new Date().toISOString().slice(0, 10))
        }
    }

    // Drill down to ledger
    const drillDownToAccount = (accountId: string) => {
        setSelectedAccountId(accountId)
        setSubTab('general_ledger')
    }

    // Sync Invoices & Expenses
    const handleSync = async () => {
        startTransition(async () => {
            const res = await syncInvoicesAndExpensesToLedger()
            setSyncMessage(res.message)
            setTimeout(() => setSyncMessage(null), 6000)
            loadReports()
        })
    }

    // Print
    const handlePrint = () => {
        window.print()
    }

    // Export CSV
    const handleExportCSV = () => {
        let filename = `${companyName.replace(/\s+/g, '_')}_${subTab}_${fromDate}_to_${toDate}.csv`
        let csvContent = 'data:text/csv;charset=utf-8,'

        csvContent += `${companyName}\r\n`
        csvContent += `${subTab.toUpperCase().replace('_', ' ')}\r\n`
        csvContent += `Period: ${fromDate} to ${toDate}\r\n\r\n`

        if (subTab === 'pnl' && pnl) {
            csvContent += `CATEGORY,ACCOUNT CODE,ACCOUNT NAME,AMOUNT (INR)\r\n`
            csvContent += `Direct Income\r\n`
            pnl.directIncomeAccounts.forEach(a => {
                csvContent += `Direct Income,"${a.code}","${a.name}",${a.amount}\r\n`
            })
            csvContent += `Total Direct Income,,,${pnl.totalDirectIncome}\r\n`
            csvContent += `Indirect Income\r\n`
            pnl.indirectIncomeAccounts.forEach(a => {
                csvContent += `Indirect Income,"${a.code}","${a.name}",${a.amount}\r\n`
            })
            csvContent += `Total Indirect Income,,,${pnl.totalIndirectIncome}\r\n`
            csvContent += `TOTAL INCOME,,,${pnl.totalRevenue}\r\n\r\n`
            csvContent += `Direct Expenses\r\n`
            pnl.directExpenseAccounts.forEach(a => {
                csvContent += `Direct Expense,"${a.code}","${a.name}",${a.amount}\r\n`
            })
            csvContent += `Total Direct Expenses,,,${pnl.totalDirectExpenses}\r\n`
            csvContent += `Indirect Expenses\r\n`
            pnl.indirectExpenseAccounts.forEach(a => {
                csvContent += `Indirect Expense,"${a.code}","${a.name}",${a.amount}\r\n`
            })
            csvContent += `Total Indirect Expenses,,,${pnl.totalIndirectExpenses}\r\n`
            csvContent += `TOTAL EXPENSES,,,${pnl.totalExpense}\r\n`
            csvContent += `NET PROFIT / (LOSS),,,${pnl.netProfit}\r\n`
        } else if (subTab === 'balance_sheet' && balanceSheet) {
            csvContent += `LIABILITIES & EQUITY,,,AMOUNT (INR),ASSETS,,,AMOUNT (INR)\r\n`
            csvContent += `Current Liabilities,,,${balanceSheet.totalCurrentLiabilities},Cash & Bank,,,${balanceSheet.totalCashAndBank}\r\n`
            csvContent += `Capital Accounts,,,${balanceSheet.totalCapital},Current Assets,,,${balanceSheet.totalCurrentAssets}\r\n`
            csvContent += `Retained Earnings Prior,,,${balanceSheet.retainedEarningsPrior},Fixed Assets,,,${balanceSheet.totalFixedAssets}\r\n`
            csvContent += `Current Period P&L,,,${balanceSheet.currentPeriodPnL},,,\r\n`
            csvContent += `TOTAL LIABILITIES & EQUITY,,,${balanceSheet.totalLiabilitiesAndEquity},TOTAL ASSETS,,,${balanceSheet.totalAssets}\r\n`
        } else if (subTab === 'trial_balance' && trialBalance) {
            csvContent += `ACCOUNT CODE,ACCOUNT NAME,TYPE,OPENING DR,OPENING CR,PERIOD DR,PERIOD CR,CLOSING DR,CLOSING CR\r\n`
            trialBalance.items.forEach(i => {
                csvContent += `"${i.account_code}","${i.account_name}","${i.account_type}",${i.opening_debit},${i.opening_credit},${i.period_debit},${i.period_credit},${i.closing_debit},${i.closing_credit}\r\n`
            })
            csvContent += `TOTALS,,,,${trialBalance.totalOpeningDebit},${trialBalance.totalOpeningCredit},${trialBalance.totalPeriodDebit},${trialBalance.totalPeriodCredit},${trialBalance.totalClosingDebit},${trialBalance.totalClosingCredit}\r\n`
        } else if (subTab === 'cash_flow' && cashFlow) {
            csvContent += `PARTICULARS,AMOUNT (INR)\r\n`
            csvContent += `Cash Flow from Operating Activities\r\n`
            cashFlow.operatingActivities.forEach(o => {
                csvContent += `"${o.description}",${o.amount}\r\n`
            })
            csvContent += `Net Cash from Operating Activities,${cashFlow.netCashFromOperating}\r\n`
            csvContent += `Cash Flow from Investing Activities\r\n`
            cashFlow.investingActivities.forEach(i => {
                csvContent += `"${i.description}",${i.amount}\r\n`
            })
            csvContent += `Net Cash from Investing Activities,${cashFlow.netCashFromInvesting}\r\n`
            csvContent += `Cash Flow from Financing Activities\r\n`
            cashFlow.financingActivities.forEach(f => {
                csvContent += `"${f.description}",${f.amount}\r\n`
            })
            csvContent += `Net Cash from Financing Activities,${cashFlow.netCashFromFinancing}\r\n`
            csvContent += `Net Increase / (Decrease) in Cash,${cashFlow.netChangeInCash}\r\n`
            csvContent += `Opening Cash & Bank Balance,${cashFlow.openingCashBalance}\r\n`
            csvContent += `Closing Cash & Bank Balance,${cashFlow.closingCashBalance}\r\n`
        } else if (subTab === 'general_ledger' && ledger) {
            csvContent += `Account: ${ledger.accountCode} - ${ledger.accountName}\r\n`
            csvContent += `DATE,VOUCHER TYPE,VOUCHER NO,OPPOSITE ACCOUNT,DESCRIPTION,DEBIT,CREDIT,BALANCE\r\n`
            ledger.lines.forEach(l => {
                csvContent += `"${l.entryDate}","${l.voucherType}","${l.voucherNo}","${l.oppositeAccount}","${l.description}",${l.debitAmount},${l.creditAmount},"${l.runningBalance} ${l.balanceType}"\r\n`
            })
            csvContent += `CLOSING BALANCE,,,,,,${ledger.closingBalance} ${ledger.closingBalanceType}\r\n`
        }

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Enterprise Sub-Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                    <button
                        onClick={() => setSubTab('pnl')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                            subTab === 'pnl' 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <PieChart className="h-4 w-4" />
                        Profit & Loss (P&L)
                    </button>
                    <button
                        onClick={() => setSubTab('balance_sheet')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                            subTab === 'balance_sheet' 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <Scale className="h-4 w-4" />
                        Balance Sheet
                    </button>
                    <button
                        onClick={() => setSubTab('cash_flow')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                            subTab === 'cash_flow' 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <Activity className="h-4 w-4" />
                        Cash Flow Statement
                    </button>
                    <button
                        onClick={() => setSubTab('trial_balance')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                            subTab === 'trial_balance' 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Trial Balance Audit
                    </button>
                    <button
                        onClick={() => setSubTab('general_ledger')}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                            subTab === 'general_ledger' 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <BookOpen className="h-4 w-4" />
                        General Ledger
                    </button>
                </div>
            </div>

            {/* Sync Notification Banner */}
            {syncMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between animate-in fade-in">
                    <span className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        {syncMessage}
                    </span>
                    <button onClick={() => setSyncMessage(null)} className="text-blue-500 hover:text-blue-800 text-xs">Dismiss</button>
                </div>
            )}

            {/* Universal Filter & Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Date Presets and Pickers */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>Period:</span>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-[11px] font-semibold">
                            <button 
                                onClick={() => applyDatePreset('this_fy')} 
                                className="px-2 py-0.5 rounded hover:bg-white transition-colors"
                            >
                                This FY
                            </button>
                            <button 
                                onClick={() => applyDatePreset('last_fy')} 
                                className="px-2 py-0.5 rounded hover:bg-white transition-colors"
                            >
                                Last FY
                            </button>
                            <button 
                                onClick={() => applyDatePreset('this_month')} 
                                className="px-2 py-0.5 rounded hover:bg-white transition-colors"
                            >
                                This Month
                            </button>
                            <button 
                                onClick={() => applyDatePreset('this_quarter')} 
                                className="px-2 py-0.5 rounded hover:bg-white transition-colors"
                            >
                                Qtr
                            </button>
                            <button 
                                onClick={() => applyDatePreset('all_time')} 
                                className="px-2 py-0.5 rounded hover:bg-white transition-colors"
                            >
                                All
                            </button>
                        </div>

                        {/* Explicit Date Inputs */}
                        <div className="flex items-center gap-1.5 text-xs">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-slate-50 font-mono"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-slate-50 font-mono"
                            />
                        </div>

                        {/* Summary vs Detailed Toggle */}
                        {subTab !== 'cash_flow' && subTab !== 'general_ledger' && (
                            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                                <span className="text-[11px] text-gray-500">View:</span>
                                <select
                                    value={viewMode}
                                    onChange={(e) => setViewMode(e.target.value as 'summary' | 'detailed')}
                                    className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
                                >
                                    <option value="detailed">Detailed</option>
                                    <option value="summary">Summary</option>
                                </select>
                            </div>
                        )}

                        {/* Hide Zero Balances Toggle */}
                        <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                            <span className="text-[11px] text-gray-500">Hide Zero:</span>
                            <select
                                value={hideZero ? 'yes' : 'no'}
                                onChange={(e) => setHideZero(e.target.value === 'yes')}
                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-slate-50 font-medium"
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        {/* Account Selector for General Ledger */}
                        {subTab === 'general_ledger' && (
                            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                                <span className="text-[11px] text-gray-500 font-semibold">Account:</span>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => setSelectedAccountId(e.target.value)}
                                    className="px-2.5 py-1 text-xs border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-blue-50/50 font-medium max-w-[200px]"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.account_code} - {acc.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Right: Actions (Print, Export CSV, Refresh, Sync) */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSync}
                            disabled={isPending}
                            className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                            title="Sync posted invoices and expenses directly into double-entry accounting records"
                        >
                            <DatabaseZap className="h-3.5 w-3.5" />
                            {isPending ? 'Syncing...' : 'Sync Invoices/Exp'}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCSV}
                            className="text-xs gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Export Excel
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="text-xs gap-1.5"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            Print
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadReports}
                            className="text-xs p-2"
                            title="Refresh Report Data"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : (
                <div id="financial-statement-print-area" className="space-y-6">

                    {/* ========================================================================= */}
                    {/* TAB 1: PROFIT & LOSS STATEMENT */}
                    {/* ========================================================================= */}
                    {subTab === 'pnl' && pnl && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* KPI Metrics Banner */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Expenses</p>
                                                <h4 className="text-2xl font-extrabold text-amber-600 mt-1">
                                                    ₹{pnl.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Direct + Indirect Costs</p>
                                            </div>
                                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                                <TrendingDown className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Income</p>
                                                <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">
                                                    ₹{pnl.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Sales + Other Incomes</p>
                                            </div>
                                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    {pnl.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                                                </p>
                                                <h4 className={`text-2xl font-extrabold mt-1 ${pnl.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                    ₹{pnl.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    Margin: {pnl.netProfitMargin.toFixed(1)}% | Revenue - Expenses
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-xl ${pnl.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                                <PieChart className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* P&L Statement Report Paper */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                                {/* Company Header */}
                                <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-blue-400" />
                                            <h2 className="text-lg font-bold tracking-tight">{companyName}</h2>
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mt-1">
                                            PROFIT & LOSS STATEMENT
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            For the period {pnl.fromDate} to {pnl.toDate} | Base Currency: INR (₹)
                                        </p>
                                    </div>
                                    <div className="sm:text-right bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Period Result</span>
                                        <span className={`text-lg font-bold ${pnl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {pnl.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}: ₹{pnl.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Dual Column Report (Expenses Dr vs Income Cr) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                                    {/* Left Column: EXPENSES (Dr) */}
                                    <div className="p-5 space-y-6 flex flex-col justify-between">
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between border-b-2 border-amber-500 pb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                                    EXPENSES (Dr)
                                                </h4>
                                                <span className="text-[11px] font-semibold text-gray-500">Debit (₹)</span>
                                            </div>

                                            {/* Direct Expenses */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-amber-50/50 px-2 py-1 rounded">
                                                    <span>DIRECT EXPENSES</span>
                                                    <span>₹{pnl.totalDirectExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {pnl.directExpenseAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No direct expenses recorded</p>
                                                ) : (
                                                    pnl.directExpenseAccounts
                                                        .filter(acc => !hideZero || acc.amount > 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId} 
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                            {/* Indirect Expenses */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-amber-50/50 px-2 py-1 rounded">
                                                    <span>INDIRECT EXPENSES / OPERATING</span>
                                                    <span>₹{pnl.totalIndirectExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {pnl.indirectExpenseAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No indirect expenses recorded</p>
                                                ) : (
                                                    pnl.indirectExpenseAccounts
                                                        .filter(acc => !hideZero || acc.amount > 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId} 
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Total Expenses Row */}
                                        <div className="border-t-2 border-gray-900 pt-3 mt-4 flex items-center justify-between text-xs font-bold text-gray-900">
                                            <span>TOTAL EXPENSES (Dr)</span>
                                            <span className="font-mono text-sm text-amber-700">
                                                ₹{pnl.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column: INCOME (Cr) */}
                                    <div className="p-5 space-y-6 flex flex-col justify-between">
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                    INCOME (Cr)
                                                </h4>
                                                <span className="text-[11px] font-semibold text-gray-500">Credit (₹)</span>
                                            </div>

                                            {/* Direct Income */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-emerald-50/50 px-2 py-1 rounded">
                                                    <span>DIRECT INCOME / SALES</span>
                                                    <span>₹{pnl.totalDirectIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {pnl.directIncomeAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No direct income recorded</p>
                                                ) : (
                                                    pnl.directIncomeAccounts
                                                        .filter(acc => !hideZero || acc.amount > 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId} 
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                            {/* Indirect Income */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-emerald-50/50 px-2 py-1 rounded">
                                                    <span>INDIRECT INCOME / OTHER</span>
                                                    <span>₹{pnl.totalIndirectIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {pnl.indirectIncomeAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No indirect income recorded</p>
                                                ) : (
                                                    pnl.indirectIncomeAccounts
                                                        .filter(acc => !hideZero || acc.amount > 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId} 
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Total Income Row */}
                                        <div className="border-t-2 border-gray-900 pt-3 mt-4 flex items-center justify-between text-xs font-bold text-gray-900">
                                            <span>TOTAL INCOME (Cr)</span>
                                            <span className="font-mono text-sm text-emerald-700">
                                                ₹{pnl.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Grand Bottom Bar */}
                                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-6 text-xs font-semibold">
                                        <span className="text-slate-300">
                                            Gross Profit: <span className="font-mono font-bold text-white">₹{pnl.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                        <span className="text-slate-300">
                                            Total Expenses: <span className="font-mono font-bold text-amber-400">₹{pnl.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                        <span className="text-slate-300">
                                            Total Income: <span className="font-mono font-bold text-emerald-400">₹{pnl.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase font-semibold text-slate-400">
                                            {pnl.netProfit >= 0 ? 'NET PROFIT:' : 'NET LOSS:'}
                                        </span>
                                        <span className={`text-base font-extrabold px-3 py-1 rounded-lg ${pnl.netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                            ₹{pnl.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========================================================================= */}
                    {/* TAB 2: BALANCE SHEET */}
                    {/* ========================================================================= */}
                    {subTab === 'balance_sheet' && balanceSheet && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Cumulative Balance Notice Banner */}
                            <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span>Asset, Liability & Equity balances shown are cumulative as on <strong>{balanceSheet.asOnDate}</strong>. P&L is for the period <strong>{balanceSheet.fromDate}</strong> to <strong>{balanceSheet.toDate}</strong>.</span>
                                </span>
                                <span className="text-[11px] font-semibold bg-white text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                                    Standard Dual Column
                                </span>
                            </div>

                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Assets</p>
                                        <h4 className="text-xl font-extrabold text-emerald-600 mt-1">
                                            ₹{balanceSheet.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Cash + Current + Fixed</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Liabilities</p>
                                        <h4 className="text-xl font-extrabold text-rose-600 mt-1">
                                            ₹{balanceSheet.totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Payables & Obligations</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Equity & Reserves</p>
                                        <h4 className="text-xl font-extrabold text-purple-600 mt-1">
                                            ₹{balanceSheet.totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Capital + Retained P&L</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Audit Status</p>
                                        <div className="mt-1">
                                            {balanceSheet.isBalanced ? (
                                                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                                                    <CheckCircle className="h-3.5 w-3.5" /> Balanced (₹0.00)
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-rose-200">
                                                    <AlertTriangle className="h-3.5 w-3.5" /> Diff: ₹{balanceSheet.difference.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Assets = Liabilities + Equity</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Balance Sheet Document Paper */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                                {/* Header */}
                                <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-blue-400" />
                                            <h2 className="text-lg font-bold tracking-tight">{companyName}</h2>
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mt-1">
                                            BALANCE SHEET
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            As on {balanceSheet.asOnDate} (Cumulative) | Base Currency: INR (₹)
                                        </p>
                                    </div>
                                    <div>
                                        {balanceSheet.isBalanced ? (
                                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-500/30">
                                                <CheckCircle className="h-4 w-4 text-emerald-400" /> Statement Balanced
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-rose-500/30">
                                                <AlertTriangle className="h-4 w-4 text-rose-400" /> Out of Balance (₹{balanceSheet.difference.toFixed(2)})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Dual Column: Liabilities & Equity vs Assets */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                                    {/* Left Column: LIABILITIES & EQUITY */}
                                    <div className="p-5 space-y-6 flex flex-col justify-between">
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between border-b-2 border-rose-500 pb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                                                    LIABILITIES & EQUITY
                                                </h4>
                                                <span className="text-[11px] font-semibold text-gray-500">Amount (₹)</span>
                                            </div>

                                            {/* Capital Accounts */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-purple-50/50 px-2 py-1 rounded">
                                                    <span>CAPITAL ACCOUNTS</span>
                                                    <span>₹{balanceSheet.totalCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {balanceSheet.capitalAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No capital accounts</p>
                                                ) : (
                                                    balanceSheet.capitalAccounts
                                                        .filter(acc => !hideZero || acc.amount !== 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId}
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                            {/* Reserves & Surplus */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-purple-50/50 px-2 py-1 rounded">
                                                    <span>RESERVES & SURPLUS</span>
                                                    <span>₹{balanceSheet.totalReservesAndSurplus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="space-y-1 text-xs px-2">
                                                    <div className="flex items-center justify-between py-1 text-gray-700">
                                                        <span>Retained Earnings (Prior Period)</span>
                                                        <span className="font-mono font-medium">₹{balanceSheet.retainedEarningsPrior.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-1 text-blue-700">
                                                        <span className="font-semibold">Current Period P&L (Net Profit/Loss)</span>
                                                        <span className="font-mono font-bold">₹{balanceSheet.currentPeriodPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Current Liabilities */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-rose-50/50 px-2 py-1 rounded">
                                                    <span>CURRENT LIABILITIES</span>
                                                    <span>₹{balanceSheet.totalCurrentLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {balanceSheet.currentLiabilityAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No current liabilities recorded</p>
                                                ) : (
                                                    balanceSheet.currentLiabilityAccounts
                                                        .filter(acc => !hideZero || acc.amount !== 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId}
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Total Liabilities & Equity */}
                                        <div className="border-t-2 border-gray-900 pt-3 mt-4 flex items-center justify-between text-xs font-bold text-gray-900">
                                            <span>TOTAL LIABILITIES & EQUITY</span>
                                            <span className="font-mono text-sm text-rose-800">
                                                ₹{balanceSheet.totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column: ASSETS */}
                                    <div className="p-5 space-y-6 flex flex-col justify-between">
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                                    ASSETS
                                                </h4>
                                                <span className="text-[11px] font-semibold text-gray-500">Amount (₹)</span>
                                            </div>

                                            {/* Cash & Bank Balances */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-emerald-50/50 px-2 py-1 rounded">
                                                    <span>CASH AND BANK BALANCES</span>
                                                    <span>₹{balanceSheet.totalCashAndBank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {balanceSheet.cashAndBankAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No cash/bank accounts</p>
                                                ) : (
                                                    balanceSheet.cashAndBankAccounts
                                                        .filter(acc => !hideZero || acc.amount !== 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId}
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                            {/* Current Assets */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-emerald-50/50 px-2 py-1 rounded">
                                                    <span>CURRENT ASSETS (RECEIVABLES / INVENTORY)</span>
                                                    <span>₹{balanceSheet.totalCurrentAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {balanceSheet.currentAssetAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No other current assets</p>
                                                ) : (
                                                    balanceSheet.currentAssetAccounts
                                                        .filter(acc => !hideZero || acc.amount !== 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId}
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                            {/* Fixed Assets */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-emerald-50/50 px-2 py-1 rounded">
                                                    <span>FIXED ASSETS / EQUIPMENT</span>
                                                    <span>₹{balanceSheet.totalFixedAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {balanceSheet.fixedAssetAccounts.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic px-2">No fixed assets recorded</p>
                                                ) : (
                                                    balanceSheet.fixedAssetAccounts
                                                        .filter(acc => !hideZero || acc.amount !== 0)
                                                        .map((acc) => (
                                                            <div 
                                                                key={acc.accountId}
                                                                onClick={() => drillDownToAccount(acc.accountId)}
                                                                className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded cursor-pointer group"
                                                            >
                                                                <span className="text-gray-700 group-hover:text-blue-600 flex items-center gap-1.5">
                                                                    <span className="font-mono text-gray-400 group-hover:text-blue-500">{acc.code}</span>
                                                                    {acc.name}
                                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                                                </span>
                                                                <span className="font-mono font-medium text-gray-900">
                                                                    ₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Total Assets Row */}
                                        <div className="border-t-2 border-gray-900 pt-3 mt-4 flex items-center justify-between text-xs font-bold text-gray-900">
                                            <span>TOTAL ASSETS</span>
                                            <span className="font-mono text-sm text-emerald-800">
                                                ₹{balanceSheet.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Bottom Footer */}
                                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-6 text-xs font-semibold">
                                        <span className="text-slate-300">
                                            Liabilities & Equity: <span className="font-mono font-bold text-white">₹{balanceSheet.totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                        <span className="text-slate-300">
                                            Total Assets: <span className="font-mono font-bold text-white">₹{balanceSheet.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                    </div>
                                    <div>
                                        {balanceSheet.isBalanced ? (
                                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                                                <CheckCircle className="h-3.5 w-3.5" /> Statement Reconciled & Balanced
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full flex items-center gap-1.5 border border-rose-500/30">
                                                <AlertTriangle className="h-3.5 w-3.5" /> Difference: ₹{balanceSheet.difference.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========================================================================= */}
                    {/* TAB 3: CASH FLOW STATEMENT */}
                    {/* ========================================================================= */}
                    {subTab === 'cash_flow' && cashFlow && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Operating Cash</p>
                                        <h4 className={`text-xl font-extrabold mt-1 ${cashFlow.netCashFromOperating >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ₹{cashFlow.netCashFromOperating.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Core operations flow</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Investing Cash</p>
                                        <h4 className={`text-xl font-extrabold mt-1 ${cashFlow.netCashFromInvesting >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                            ₹{cashFlow.netCashFromInvesting.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Fixed assets & capex</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Financing Cash</p>
                                        <h4 className={`text-xl font-extrabold mt-1 ${cashFlow.netCashFromFinancing >= 0 ? 'text-purple-600' : 'text-gray-700'}`}>
                                            ₹{cashFlow.netCashFromFinancing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Capital & borrowings</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Closing Cash & Bank</p>
                                        <h4 className="text-xl font-extrabold text-blue-700 mt-1">
                                            ₹{cashFlow.closingCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Reconciled with BS
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cash Flow Document Paper */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                                <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-blue-400" />
                                            <h2 className="text-lg font-bold tracking-tight">{companyName}</h2>
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mt-1">
                                            CASH FLOW STATEMENT (INDIRECT METHOD)
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            For the period {cashFlow.fromDate} to {cashFlow.toDate} | As per AS-3 / Ind AS 7
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Change in Cash</span>
                                        <span className={`text-lg font-bold ${cashFlow.netChangeInCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {cashFlow.netChangeInCash >= 0 ? '+' : ''}₹{cashFlow.netChangeInCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Section A: Operating Activities */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-blue-200 pb-1.5 text-xs font-bold text-blue-900 uppercase">
                                            <span>A. CASH FLOW FROM OPERATING ACTIVITIES</span>
                                            <span>Amount (₹)</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            {cashFlow.operatingActivities.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded">
                                                    <span className="text-gray-700">{item.description}</span>
                                                    <span className={`font-mono font-medium ${item.amount < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                                        {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })})` : `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold bg-blue-50/70 p-2.5 rounded-lg text-blue-900">
                                            <span>Net Cash from Operating Activities (A)</span>
                                            <span className="font-mono text-sm">₹{cashFlow.netCashFromOperating.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    {/* Section B: Investing Activities */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 text-xs font-bold text-amber-900 uppercase">
                                            <span>B. CASH FLOW FROM INVESTING ACTIVITIES</span>
                                            <span>Amount (₹)</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            {cashFlow.investingActivities.length === 0 ? (
                                                <div className="py-1 px-2 text-gray-400 italic">No capital or investment transactions during this period</div>
                                            ) : (
                                                cashFlow.investingActivities.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded">
                                                        <span className="text-gray-700">{item.description}</span>
                                                        <span className={`font-mono font-medium ${item.amount < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                                            {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })})` : `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold bg-amber-50/70 p-2.5 rounded-lg text-amber-900">
                                            <span>Net Cash from Investing Activities (B)</span>
                                            <span className="font-mono text-sm">₹{cashFlow.netCashFromInvesting.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    {/* Section C: Financing Activities */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-purple-200 pb-1.5 text-xs font-bold text-purple-900 uppercase">
                                            <span>C. CASH FLOW FROM FINANCING ACTIVITIES</span>
                                            <span>Amount (₹)</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            {cashFlow.financingActivities.length === 0 ? (
                                                <div className="py-1 px-2 text-gray-400 italic">No capital or debt financing movements recorded</div>
                                            ) : (
                                                cashFlow.financingActivities.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded">
                                                        <span className="text-gray-700">{item.description}</span>
                                                        <span className={`font-mono font-medium ${item.amount < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                                            {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })})` : `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold bg-purple-50/70 p-2.5 rounded-lg text-purple-900">
                                            <span>Net Cash from Financing Activities (C)</span>
                                            <span className="font-mono text-sm">₹{cashFlow.netCashFromFinancing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    {/* Reconciliation Table */}
                                    <div className="border-t-2 border-gray-900 pt-4 space-y-2 text-xs">
                                        <div className="flex items-center justify-between py-1 text-gray-900 font-semibold">
                                            <span>Net Increase / (Decrease) in Cash and Cash Equivalents (A + B + C)</span>
                                            <span className={`font-mono text-sm font-bold ${cashFlow.netChangeInCash >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                ₹{cashFlow.netChangeInCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-1 text-gray-700">
                                            <span>Cash and Cash Equivalents at Beginning of the Period ({cashFlow.fromDate})</span>
                                            <span className="font-mono font-medium">₹{cashFlow.openingCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 text-blue-900 font-extrabold bg-blue-50/80 px-3 rounded-lg border border-blue-100">
                                            <span>Cash and Cash Equivalents at End of the Period ({cashFlow.toDate})</span>
                                            <span className="font-mono text-base">₹{cashFlow.closingCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========================================================================= */}
                    {/* TAB 4: TRIAL BALANCE AUDIT */}
                    {/* ========================================================================= */}
                    {subTab === 'trial_balance' && trialBalance && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Debit (Closing)</p>
                                        <h4 className="text-2xl font-extrabold text-gray-900 mt-1">
                                            ₹{trialBalance.totalClosingDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Asset & Expense Balances</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Credit (Closing)</p>
                                        <h4 className="text-2xl font-extrabold text-gray-900 mt-1">
                                            ₹{trialBalance.totalClosingCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Liability, Equity & Revenue</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Net Difference</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <h4 className={`text-2xl font-extrabold ${trialBalance.isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                ₹{trialBalance.difference.toFixed(2)}
                                            </h4>
                                            {trialBalance.isBalanced ? (
                                                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Balanced
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" /> Unbalanced
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Audited double-entry balance</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Trial Balance Multi-Column Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-sm font-bold">General Ledger Trial Balance</h3>
                                        <p className="text-xs text-slate-400">
                                            Opening, Period Activity, and Closing Balances ({trialBalance.fromDate} to {trialBalance.toDate})
                                        </p>
                                    </div>
                                    <div>
                                        {trialBalance.isBalanced && (
                                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
                                                ✓ Double-Entry Audited
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200">
                                            <tr>
                                                <th rowSpan={2} className="p-3 border-r border-gray-200">Account</th>
                                                <th rowSpan={2} className="p-3 border-r border-gray-200">Type</th>
                                                <th colSpan={2} className="p-2 text-center border-r border-gray-200 bg-slate-100/70">Opening Balance</th>
                                                <th colSpan={2} className="p-2 text-center border-r border-gray-200 bg-slate-50">During the Period</th>
                                                <th colSpan={2} className="p-2 text-center bg-blue-50/50 text-blue-900">Closing Balance</th>
                                            </tr>
                                            <tr className="border-t border-gray-200 bg-slate-50 text-[11px]">
                                                <th className="p-2 text-right border-r border-gray-200">Dr (₹)</th>
                                                <th className="p-2 text-right border-r border-gray-200">Cr (₹)</th>
                                                <th className="p-2 text-right border-r border-gray-200">Dr (₹)</th>
                                                <th className="p-2 text-right border-r border-gray-200">Cr (₹)</th>
                                                <th className="p-2 text-right border-r border-gray-200 bg-blue-50/50">Dr (₹)</th>
                                                <th className="p-2 text-right bg-blue-50/50">Cr (₹)</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {trialBalance.items
                                                .filter(item => !hideZero || item.total_debit > 0 || item.total_credit > 0)
                                                .map((item) => (
                                                    <tr 
                                                        key={item.account_id} 
                                                        onClick={() => drillDownToAccount(item.account_id)}
                                                        className="hover:bg-blue-50/30 cursor-pointer group transition-colors"
                                                    >
                                                        <td className="p-3 border-r border-gray-100">
                                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                                                                <span className="font-mono text-gray-400 group-hover:text-blue-500">{item.account_code}</span>
                                                                {item.account_name}
                                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-500" />
                                                            </div>
                                                            <div className="text-[10px] text-gray-400">{item.category}</div>
                                                        </td>
                                                        <td className="p-3 uppercase text-[10px] font-semibold text-gray-500 border-r border-gray-100">
                                                            {item.account_type}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-gray-600 border-r border-gray-100">
                                                            {item.opening_debit > 0 ? `₹${item.opening_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-gray-600 border-r border-gray-100">
                                                            {item.opening_credit > 0 ? `₹${item.opening_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-gray-700 border-r border-gray-100">
                                                            {item.period_debit > 0 ? `₹${item.period_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-gray-700 border-r border-gray-100">
                                                            {item.period_credit > 0 ? `₹${item.period_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-blue-900 bg-blue-50/20 border-r border-gray-100">
                                                            {item.closing_debit > 0 ? `₹${item.closing_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-blue-900 bg-blue-50/20">
                                                            {item.closing_credit > 0 ? `₹${item.closing_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>

                                        <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-950">
                                            <tr>
                                                <td colSpan={2} className="p-3 uppercase tracking-wider text-xs">
                                                    Grand Totals Audit
                                                </td>
                                                <td className="p-3 text-right font-mono border-r border-slate-800">
                                                    ₹{trialBalance.totalOpeningDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono border-r border-slate-800">
                                                    ₹{trialBalance.totalOpeningCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono border-r border-slate-800">
                                                    ₹{trialBalance.totalPeriodDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono border-r border-slate-800">
                                                    ₹{trialBalance.totalPeriodCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono text-emerald-400 border-r border-slate-800">
                                                    ₹{trialBalance.totalClosingDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono text-emerald-400">
                                                    ₹{trialBalance.totalClosingCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========================================================================= */}
                    {/* TAB 5: GENERAL LEDGER */}
                    {/* ========================================================================= */}
                    {subTab === 'general_ledger' && ledger && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Opening Balance</p>
                                        <h4 className="text-xl font-extrabold text-gray-900 mt-1">
                                            ₹{ledger.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            <span className="text-xs font-bold text-gray-500 ml-1.5">{ledger.openingBalanceType}</span>
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">As on {ledger.fromDate}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Debit</p>
                                        <h4 className="text-xl font-extrabold text-blue-600 mt-1">
                                            ₹{ledger.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Debits in period</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Credit</p>
                                        <h4 className="text-xl font-extrabold text-emerald-600 mt-1">
                                            ₹{ledger.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Credits in period</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-2xs bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Closing Balance</p>
                                        <h4 className="text-xl font-extrabold text-blue-900 mt-1">
                                            ₹{ledger.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            <span className="text-xs font-bold text-blue-600 ml-1.5">{ledger.closingBalanceType}</span>
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5">As on {ledger.toDate}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Ledger Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-blue-400 font-bold">{ledger.accountCode}</span>
                                            <h3 className="text-sm font-bold">{ledger.accountName}</h3>
                                            <span className="uppercase text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
                                                {ledger.accountType}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Statement of Account for {ledger.fromDate} to {ledger.toDate}
                                        </p>
                                    </div>
                                    <div className="text-xs text-slate-300">
                                        <span>Total Transactions: <strong>{ledger.lines.length}</strong></span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Voucher Type</th>
                                                <th className="p-3">Voucher No</th>
                                                <th className="p-3">Particulars / Opposite Account</th>
                                                <th className="p-3">Description / Narration</th>
                                                <th className="p-3 text-right">Debit (₹)</th>
                                                <th className="p-3 text-right">Credit (₹)</th>
                                                <th className="p-3 text-right">Running Balance (₹)</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {/* Opening Balance Row */}
                                            <tr className="bg-slate-50/70 font-semibold text-gray-700">
                                                <td className="p-3 font-mono">{ledger.fromDate}</td>
                                                <td className="p-3">
                                                    <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                                                        Opening
                                                    </span>
                                                </td>
                                                <td className="p-3 font-mono text-gray-400">-</td>
                                                <td className="p-3 font-bold text-gray-900">Opening Balance Brought Forward</td>
                                                <td className="p-3 text-gray-400 italic">Balance as of {ledger.fromDate}</td>
                                                <td className="p-3 text-right font-mono">-</td>
                                                <td className="p-3 text-right font-mono">-</td>
                                                <td className="p-3 text-right font-mono font-bold text-gray-900">
                                                    ₹{ledger.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {ledger.openingBalanceType}
                                                </td>
                                            </tr>

                                            {ledger.lines.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="p-8 text-center text-gray-400 italic">
                                                        No transactions recorded for this account during the selected date range.
                                                    </td>
                                                </tr>
                                            ) : (
                                                ledger.lines.map((line) => (
                                                    <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="p-3 font-mono text-gray-600">{line.entryDate}</td>
                                                        <td className="p-3">
                                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                                                                {line.voucherType}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 font-mono font-bold text-gray-900">{line.voucherNo}</td>
                                                        <td className="p-3 font-medium text-gray-800">{line.oppositeAccount}</td>
                                                        <td className="p-3 text-gray-500 max-w-xs truncate" title={line.description}>
                                                            {line.description}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-semibold text-gray-900">
                                                            {line.debitAmount > 0 ? `₹${line.debitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-semibold text-gray-900">
                                                            {line.creditAmount > 0 ? `₹${line.creditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-blue-900">
                                                            ₹{line.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {line.balanceType}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>

                                        <tfoot className="bg-slate-100 text-gray-900 font-bold border-t-2 border-gray-200">
                                            <tr>
                                                <td colSpan={5} className="p-3 uppercase tracking-wider text-xs">
                                                    Account Totals & Closing Balance
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    ₹{ledger.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    ₹{ledger.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-mono text-blue-900">
                                                    ₹{ledger.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {ledger.closingBalanceType}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
