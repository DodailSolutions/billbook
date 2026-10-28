'use client'

import { useState, useTransition, useMemo } from 'react'
import {
    FileBarChart,
    Download,
    Calendar,
    Search,
    Printer,
    FileSpreadsheet,
    Shield,
    UserPlus,
    Briefcase,
    TrendingUp,
    Receipt,
    Users,
    Package,
    ArrowUpRight,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Sparkles,
    Building2,
    Clock,
    Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GSTReportGenerator } from './GSTReportGenerator'
import { AccountingReportGenerator } from './AccountingReportGenerator'
import { getComprehensiveReportsData, ComprehensiveReportsPayload } from './actions'
import Link from 'next/link'

interface ReportsDashboardProps {
    initialData: ComprehensiveReportsPayload
}

export function ReportsDashboard({ initialData }: ReportsDashboardProps) {
    const [data, setData] = useState<ComprehensiveReportsPayload>(initialData)
    const [startDate, setStartDate] = useState(initialData.startDate)
    const [endDate, setEndDate] = useState(initialData.endDate)
    const [activeTab, setActiveTab] = useState<'gst' | 'pnl' | 'aging' | 'items' | 'downloads'>('gst')
    const [isPending, startTransition] = useTransition()

    // Filters for GST Table
    const [gstSearch, setGstSearch] = useState('')
    const [supplyTypeFilter, setSupplyTypeFilter] = useState<'all' | 'intra-state' | 'inter-state'>('all')

    // Presets handler
    const applyDatePreset = (preset: 'this_month' | 'last_month' | 'this_quarter' | 'current_fy' | 'last_fy' | 'last_30' | 'all') => {
        const d = new Date()
        const y = d.getFullYear()
        const m = d.getMonth()

        let s = startDate
        let e = endDate

        if (preset === 'this_month') {
            s = new Date(y, m, 1).toISOString().split('T')[0]
            e = new Date(y, m + 1, 0).toISOString().split('T')[0]
        } else if (preset === 'last_month') {
            s = new Date(y, m - 1, 1).toISOString().split('T')[0]
            e = new Date(y, m, 0).toISOString().split('T')[0]
        } else if (preset === 'this_quarter') {
            const q = Math.floor(m / 3)
            s = new Date(y, q * 3, 1).toISOString().split('T')[0]
            e = new Date(y, (q + 1) * 3, 0).toISOString().split('T')[0]
        } else if (preset === 'current_fy') {
            const fyStartYear = m >= 3 ? y : y - 1
            s = `${fyStartYear}-04-01`
            e = `${fyStartYear + 1}-03-31`
        } else if (preset === 'last_fy') {
            const fyStartYear = (m >= 3 ? y : y - 1) - 1
            s = `${fyStartYear}-04-01`
            e = `${fyStartYear + 1}-03-31`
        } else if (preset === 'last_30') {
            const past = new Date()
            past.setDate(past.getDate() - 30)
            s = past.toISOString().split('T')[0]
            e = d.toISOString().split('T')[0]
        } else if (preset === 'all') {
            s = '2020-01-01'
            e = d.toISOString().split('T')[0]
        }

        setStartDate(s)
        setEndDate(e)
        fetchReportData(s, e)
    }

    const fetchReportData = (s: string, e: string) => {
        startTransition(async () => {
            const res = await getComprehensiveReportsData(s, e)
            if (res.success && res.data) {
                setData(res.data)
            } else {
                alert(res.error || 'Failed to refresh reports')
            }
        })
    }

    // Filtered GST Invoices
    const filteredGstInvoices = useMemo(() => {
        return data.invoices.filter(inv => {
            const matchesSearch =
                inv.invoiceNumber.toLowerCase().includes(gstSearch.toLowerCase()) ||
                inv.customerName.toLowerCase().includes(gstSearch.toLowerCase()) ||
                inv.customerGstin.toLowerCase().includes(gstSearch.toLowerCase())

            const matchesSupply =
                supplyTypeFilter === 'all' || inv.supplyType === supplyTypeFilter

            return matchesSearch && matchesSupply
        })
    }, [data.invoices, gstSearch, supplyTypeFilter])

    // Filtered totals for the GST table
    const tableTotals = useMemo(() => {
        return filteredGstInvoices.reduce(
            (acc, inv) => {
                acc.taxable += inv.subtotal
                acc.cgst += inv.cgst
                acc.sgst += inv.sgst
                acc.igst += inv.igst
                acc.total += inv.total
                return acc
            },
            { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
        )
    }, [filteredGstInvoices])

    // Export Master CSV
    const exportMasterCSV = () => {
        let csv = `BILLBOOKY COMPREHENSIVE BUSINESS REPORT\n`
        csv += `Business Name:,"${data.company.name}"\n`
        if (data.company.gstin) csv += `GSTIN:,"${data.company.gstin}"\n`
        csv += `Period:,${startDate} to ${endDate}\n`
        csv += `Generated On:,${new Date().toLocaleDateString('en-IN')}\n\n`

        csv += `1. FINANCIAL & TAX KPIS\n`
        csv += `Total Billed Revenue (INR),${data.kpis.totalRevenue.toFixed(2)}\n`
        csv += `Total Taxable Value (INR),${data.kpis.totalTaxable.toFixed(2)}\n`
        csv += `Total GST Collected (INR),${data.kpis.totalGST.toFixed(2)}\n`
        csv += `CGST (INR),${data.kpis.cgst.toFixed(2)}\n`
        csv += `SGST (INR),${data.kpis.sgst.toFixed(2)}\n`
        csv += `IGST (INR),${data.kpis.igst.toFixed(2)}\n`
        csv += `Total Amount Collected (INR),${data.kpis.totalPaid.toFixed(2)}\n`
        csv += `Outstanding Receivables (INR),${data.kpis.totalPending.toFixed(2)}\n`
        csv += `Overdue Amount (INR),${data.kpis.totalOverdue.toFixed(2)}\n`
        csv += `Total Invoices,${data.kpis.totalInvoices}\n`
        csv += `Total Expenses (INR),${data.kpis.totalExpenses.toFixed(2)}\n`
        csv += `Net Profit (INR),${data.kpis.netProfit.toFixed(2)}\n`
        csv += `Profit Margin (%),${data.kpis.profitMargin.toFixed(1)}%\n\n`

        csv += `2. INVOICE & GST REGISTER\n`
        csv += `Invoice Number,Date,Customer,GSTIN,Supply Type,Taxable Value (INR),CGST (INR),SGST (INR),IGST (INR),Total Amount (INR),Status,Amount Paid (INR),Pending (INR)\n`
        data.invoices.forEach(inv => {
            const safeCust = `"${inv.customerName.replace(/"/g, '""')}"`
            csv += `${inv.invoiceNumber},${inv.date},${safeCust},${inv.customerGstin},${inv.supplyType},${inv.subtotal.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.igst.toFixed(2)},${inv.total.toFixed(2)},${inv.status},${inv.amountPaid.toFixed(2)},${inv.amountRemaining.toFixed(2)}\n`
        })

        csv += `\n3. ACCOUNTS RECEIVABLE & AGING\n`
        csv += `Customer Name,GSTIN,Phone,Total Invoices,Total Billed (INR),Paid (INR),Outstanding Pending (INR),Oldest Due Days,Aging Category\n`
        data.aging.customers.forEach(c => {
            const safeCust = `"${c.name.replace(/"/g, '""')}"`
            csv += `${safeCust},${c.gstin || 'N/A'},"${c.phone || ''}",${c.invoiceCount},${c.totalBilled.toFixed(2)},${c.totalPaid.toFixed(2)},${c.totalPending.toFixed(2)},${c.oldestDueDays},${c.agingCategory}\n`
        })

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `BillBooky-Comprehensive-Report-${startDate}-to-${endDate}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Direct printable view trigger
    const triggerPrintView = () => {
        window.open(`/api/reports/gst`, '_blank')
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Date Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <FileBarChart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        Reports & Financial Statements
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        GST filing compliance (GSTR-1 / 3B), accounts receivable aging, sales performance, and P&L.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportMasterCSV}
                        className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
                        Export Master CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={triggerPrintView}
                        className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
                    >
                        <Printer className="h-4 w-4 mr-1.5 text-blue-600" />
                        Print / PDF
                    </Button>
                    <Link href="/reports/data-access">
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-medium"
                        >
                            <Shield className="h-4 w-4 mr-1.5" />
                            CA Data Access
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Smart Date Range & Preset Filter Bar */}
            <Card className="border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xs">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Presets */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                Period:
                            </span>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('this_month')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                This Month
                            </button>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('last_month')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                Last Month
                            </button>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('this_quarter')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                This Quarter
                            </button>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('current_fy')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 transition-colors cursor-pointer"
                            >
                                Current FY
                            </button>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('last_fy')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                Last FY
                            </button>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('last_30')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                Last 30 Days
                            </button>
                            <button
                                type="button"
                                onClick={() => applyDatePreset('all')}
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                All Time
                            </button>
                        </div>

                        {/* Date Inputs + Apply */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-medium">From:</span>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-8 text-xs w-36"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-medium">To:</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-8 text-xs w-36"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchReportData(startDate, endDate)}
                                disabled={isPending || !startDate || !endDate}
                                className="h-8 text-xs px-3 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer font-semibold"
                            >
                                <RefreshCw className={`h-3 w-3 mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
                                Update
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4 Executive KPI Metric Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Gross Revenue */}
                <Card className="border-slate-200 dark:border-slate-800 bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Gross Billed Sales</span>
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                ₹{data.kpis.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{data.kpis.totalInvoices} Invoices Billed</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    ₹{data.kpis.totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Paid
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Total GST Liability */}
                <Card className="border-slate-200 dark:border-slate-800 bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">GST Tax Collected</span>
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Receipt className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                ₹{data.kpis.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>CGST: ₹{data.kpis.cgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                <span>SGST: ₹{data.kpis.sgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                <span>IGST: ₹{data.kpis.igst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Outstanding Receivables */}
                <Card className="border-slate-200 dark:border-slate-800 bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Receivables</span>
                            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                ₹{data.kpis.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{data.kpis.pendingCount} Pending Invoices</span>
                                {data.kpis.totalOverdue > 0 && (
                                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                        ₹{data.kpis.totalOverdue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Overdue
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Net Operating Margin */}
                <Card className="border-slate-200 dark:border-slate-800 bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 shadow-xs">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Net Income (P&L)</span>
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className={`text-2xl font-bold ${data.kpis.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                ₹{data.kpis.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>Expenses: ₹{data.kpis.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {data.kpis.profitMargin.toFixed(1)}% Margin
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('gst')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'gst'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <Receipt className="h-4 w-4" />
                        GST Compliance (GSTR-1)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('pnl')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'pnl'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <TrendingUp className="h-4 w-4" />
                        Profit & Loss (P&L)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('aging')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'aging'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        Customer Aging & Receivables
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('items')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'items'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <Package className="h-4 w-4" />
                        Products & Items
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('downloads')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'downloads'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <Download className="h-4 w-4" />
                        Export & Generator Hub
                    </button>
                </nav>
            </div>

            {/* TAB CONTENT 1: GST & TAX COMPLIANCE */}
            {activeTab === 'gst' && (
                <div className="space-y-6">
                    {/* GSTR-1 Outward Supplies Summary Cards */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                                Table 4A: B2B Invoices (With GSTIN)
                            </span>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.gstSummary.b2b.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex justify-between">
                                <span>{data.gstSummary.b2b.count} Registered Invoices</span>
                                <span>Tax: ₹{data.gstSummary.b2b.tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                                Table 7: B2C Invoices (Unregistered)
                            </span>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.gstSummary.b2c.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex justify-between">
                                <span>{data.gstSummary.b2c.count} Consumer Invoices</span>
                                <span>Tax: ₹{data.gstSummary.b2c.tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                                Intra-State (CGST + SGST)
                            </span>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.gstSummary.intraStateTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Local supplies within same state
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                                Inter-State (IGST)
                            </span>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.gstSummary.interStateTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Cross-border supplies to other states
                            </div>
                        </div>
                    </div>

                    {/* Invoices Register Table */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        GST Inward & Outward Register
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        Showing {filteredGstInvoices.length} of {data.invoices.length} invoices in selected date range
                                    </CardDescription>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                                        <Input
                                            placeholder="Search customer, invoice, GSTIN..."
                                            value={gstSearch}
                                            onChange={(e) => setGstSearch(e.target.value)}
                                            className="h-8 text-xs pl-8 w-56"
                                        />
                                    </div>
                                    <select
                                        value={supplyTypeFilter}
                                        onChange={(e) => setSupplyTypeFilter(e.target.value as typeof supplyTypeFilter)}
                                        className="h-8 text-xs px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="all">All Supplies</option>
                                        <option value="intra-state">Intra-State</option>
                                        <option value="inter-state">Inter-State</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold">
                                            <th className="p-3">Invoice #</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Customer</th>
                                            <th className="p-3">GSTIN</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Taxable (₹)</th>
                                            <th className="p-3 text-right">CGST (₹)</th>
                                            <th className="p-3 text-right">SGST (₹)</th>
                                            <th className="p-3 text-right">IGST (₹)</th>
                                            <th className="p-3 text-right">Total (₹)</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredGstInvoices.map(inv => (
                                            <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                                                    <Link href={`/invoices/${inv.id}`} className="hover:underline">
                                                        {inv.invoiceNumber}
                                                    </Link>
                                                </td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(inv.date).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="p-3 font-medium text-slate-900 dark:text-slate-100 max-w-[180px] truncate">
                                                    {inv.customerName}
                                                </td>
                                                <td className="p-3 text-slate-500 font-mono text-[11px]">
                                                    {inv.customerGstin}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                        inv.supplyType === 'intra-state'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                                    }`}>
                                                        {inv.supplyType === 'intra-state' ? 'Intra' : 'Inter'}
                                                    </span>
                                                    {inv.reverseCharge && (
                                                        <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                                                            RC
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right text-slate-700 dark:text-slate-300">
                                                    {inv.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                                                    {inv.cgst > 0 ? inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                                                    {inv.sgst > 0 ? inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                                                    {inv.igst > 0 ? inv.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                                    ₹{inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                        inv.status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredGstInvoices.length === 0 && (
                                            <tr>
                                                <td colSpan={11} className="p-8 text-center text-slate-500">
                                                    No invoices match the filter criteria in this date range.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {filteredGstInvoices.length > 0 && (
                                        <tfoot className="bg-slate-100/80 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                                            <tr>
                                                <td colSpan={5} className="p-3 text-slate-900 dark:text-slate-100">
                                                    TOTALS ({filteredGstInvoices.length} Invoices)
                                                </td>
                                                <td className="p-3 text-right">
                                                    ₹{tableTotals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right">
                                                    ₹{tableTotals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right">
                                                    ₹{tableTotals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right">
                                                    ₹{tableTotals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                                                    ₹{tableTotals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB CONTENT 2: PROFIT & LOSS (P&L) */}
            {activeTab === 'pnl' && (
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Income Statement Breakdown */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    Income & Revenue
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Summary of total revenue earned during period
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-600 dark:text-slate-400">Gross Invoiced Revenue</span>
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            ₹{data.kpis.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-600 dark:text-slate-400">Less: GST Collected (Tax Liability)</span>
                                        <span className="text-rose-600 font-medium">
                                            -₹{data.kpis.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-2 rounded font-bold">
                                        <span className="text-slate-900 dark:text-slate-100">Net Taxable Turnover</span>
                                        <span className="text-blue-600 dark:text-blue-400">
                                            ₹{data.kpis.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs py-1 text-slate-500">
                                        <span>Cash Collected (Paid Invoices)</span>
                                        <span>₹{data.kpis.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-xs py-1 text-slate-500">
                                        <span>Outstanding (Accounts Receivable)</span>
                                        <span className="text-amber-600">₹{data.kpis.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expenses Breakdown */}
                        <Card className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-purple-600" />
                                    Operating Expenses
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Summary of recorded business expenses by category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.expenses.categories.length === 0 ? (
                                    <div className="text-center py-6 text-slate-500 text-xs">
                                        No expenses recorded for this date range.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {data.expenses.categories.map(cat => (
                                            <div key={cat.categoryName} className="space-y-1">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-slate-700 dark:text-slate-300">{cat.categoryName} ({cat.count})</span>
                                                    <span className="text-slate-900 dark:text-slate-100">
                                                        ₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({cat.percentage.toFixed(0)}%)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-600 rounded-full"
                                                        style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                                            <span>Total Expenses</span>
                                            <span className="text-rose-600">
                                                ₹{data.expenses.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Net P&L Summary Banner */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                                Net Operating Profit (P&L)
                            </span>
                            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.kpis.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Calculated as Total Revenue (₹{data.kpis.totalRevenue.toFixed(0)}) minus Recorded Expenses (₹{data.kpis.totalExpenses.toFixed(0)})
                            </p>
                        </div>

                        <div className="text-left sm:text-right">
                            <span className="text-xs text-slate-500 uppercase tracking-wider block">Operating Margin</span>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                {data.kpis.profitMargin.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: AGING & ACCOUNTS RECEIVABLE */}
            {activeTab === 'aging' && (
                <div className="space-y-6">
                    {/* Aging Buckets */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <span className="text-xs font-semibold text-emerald-700 uppercase">Current (0-30d)</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.aging.buckets.current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <span className="text-[11px] text-slate-500">Not yet overdue</span>
                        </div>
                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                            <span className="text-xs font-semibold text-amber-700 uppercase">1 - 30 Days</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.aging.buckets.days1to30.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <span className="text-[11px] text-slate-500">Grace period</span>
                        </div>
                        <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
                            <span className="text-xs font-semibold text-orange-700 uppercase">31 - 60 Days</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.aging.buckets.days31to60.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <span className="text-[11px] text-slate-500">Follow-up due</span>
                        </div>
                        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
                            <span className="text-xs font-semibold text-rose-700 uppercase">61 - 90 Days</span>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                                ₹{data.aging.buckets.days61to90.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <span className="text-[11px] text-slate-500">Escalate</span>
                        </div>
                        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900 bg-red-100/50 dark:bg-red-950/40">
                            <span className="text-xs font-bold text-red-800 uppercase">90+ Days (Critical)</span>
                            <div className="text-lg font-bold text-red-700 dark:text-red-400 mt-1">
                                ₹{data.aging.buckets.days90Plus.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <span className="text-[11px] text-red-600">Immediate action</span>
                        </div>
                    </div>

                    {/* Customer Aging Table */}
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Customer Outstanding Balances & Aging Summary
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Ranked by highest outstanding receivables
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold">
                                            <th className="p-3">Customer Name</th>
                                            <th className="p-3">GSTIN</th>
                                            <th className="p-3 text-right">Invoices</th>
                                            <th className="p-3 text-right">Total Billed (₹)</th>
                                            <th className="p-3 text-right">Paid (₹)</th>
                                            <th className="p-3 text-right">Outstanding (₹)</th>
                                            <th className="p-3 text-center">Aging Category</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.aging.customers.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                                                    <div>{c.name}</div>
                                                    {c.phone && <span className="text-[11px] text-slate-500">{c.phone}</span>}
                                                </td>
                                                <td className="p-3 text-slate-500 font-mono text-[11px]">
                                                    {c.gstin || '-'}
                                                </td>
                                                <td className="p-3 text-right">{c.invoiceCount}</td>
                                                <td className="p-3 text-right font-medium">
                                                    ₹{c.totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right text-emerald-600 font-medium">
                                                    ₹{c.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">
                                                    ₹{c.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                        c.agingCategory === 'Current'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : c.agingCategory === '1-30 Days'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : c.agingCategory === '31-60 Days'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-rose-100 text-rose-700 font-bold'
                                                    }`}>
                                                        {c.agingCategory} {c.oldestDueDays > 0 ? `(${c.oldestDueDays}d)` : ''}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {c.phone ? (
                                                        <a
                                                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${c.name}, reminder from ${data.company.name}: You have an outstanding balance of ₹${c.totalPending.toFixed(2)}. Kindly clear at your earliest convenience.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium border border-emerald-200"
                                                        >
                                                            <Send className="h-3 w-3" />
                                                            WhatsApp
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px]">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {data.aging.customers.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-slate-500">
                                                    No customer receivables recorded in this period.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB CONTENT 4: PRODUCT & ITEM PERFORMANCE */}
            {activeTab === 'items' && (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Product & Service Performance
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Sales volume, HSN codes, and revenue breakdown per item
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold">
                                        <th className="p-3">Item / Service Name</th>
                                        <th className="p-3">HSN / SAC</th>
                                        <th className="p-3 text-right">Units Sold</th>
                                        <th className="p-3 text-right">Avg Unit Price (₹)</th>
                                        <th className="p-3 text-right">Total Revenue (₹)</th>
                                        <th className="p-3 text-right">Tax Collected (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                                                {item.name}
                                            </td>
                                            <td className="p-3 text-slate-500 font-mono text-[11px]">
                                                {item.hsn}
                                            </td>
                                            <td className="p-3 text-right font-medium">{item.quantity}</td>
                                            <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                                                ₹{item.avgUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                                ₹{item.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-3 text-right text-indigo-600 font-medium">
                                                ₹{item.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}

                                    {data.items.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                No item details available for invoices in this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* TAB CONTENT 5: EXPORT & GENERATOR HUB */}
            {activeTab === 'downloads' && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* GST Report Card */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
                                <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FileBarChart className="h-5 w-5" />
                                </div>
                                GSTR-1 Tax Return Generator
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Formatted specifically for GST filing portals. Includes CGST, SGST, IGST breakdowns and reverse charge summaries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <GSTReportGenerator />
                        </CardContent>
                    </Card>

                    {/* Accounting Report Card */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
                                <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                Accounting & CA Statement
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Comprehensive financial statements with customer aging, revenue summaries, and expense registers for your Chartered Accountant.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <AccountingReportGenerator />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* CHARTERED ACCOUNTANT & COMPLIANCE CENTER */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            Chartered Accountant & Compliance Collaboration
                        </h2>
                        <p className="text-xs text-slate-500">
                            Collaborate seamlessly with your accountant, hire verified tax professionals, or share audit packages.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* 1. Hire a CA Card */}
                    <Card className="border-blue-200 dark:border-blue-900/70 bg-linear-to-br from-blue-50/50 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xs hover:border-blue-300 transition-colors">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-3">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                                    Hire a Verified CA
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    Get matched with vetted Chartered Accountants for GST return filing, tax audits, ROC filings, and compliance.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/reports/hire-ca" className="flex-1">
                                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 cursor-pointer">
                                        Hire a CA
                                    </Button>
                                </Link>
                                <Link href="/reports/ca-marketplace" className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full text-xs h-8 cursor-pointer">
                                        Browse Directory
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Manage CA Data Access */}
                    <Card className="border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-950 shadow-xs hover:border-slate-300 transition-colors">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center mb-3">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                                    Manage CA Data Access
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    Review and approve data access requests. Control exactly which ledgers, invoices, and tax years your accountant can view.
                                </p>
                            </div>
                            <Link href="/reports/data-access">
                                <Button size="sm" variant="outline" className="w-full text-xs h-8 border-slate-300 dark:border-slate-700 cursor-pointer">
                                    <Shield className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                    Review Access Rights
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* 3. Export CA Audit Bundle */}
                    <Card className="border-emerald-200 dark:border-emerald-900/70 bg-linear-to-br from-emerald-50/50 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xs hover:border-emerald-300 transition-colors">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-3">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                                    Export CA Audit Package
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    Download a combined audit file containing all invoices, tax breakdowns, customer ledgers, and expense records in one spreadsheet.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={exportMasterCSV}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Download Complete Bundle
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
