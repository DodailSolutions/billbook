'use client'

import { useState } from 'react'
import { Download, Calendar, Loader2, FileSpreadsheet, Printer, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AccountingReportGenerator() {
    // Default to current month
    const now = new Date()
    const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDayStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [startDate, setStartDate] = useState(firstDayStr)
    const [endDate, setEndDate] = useState(lastDayStr)
    const [isGenerating, setIsGenerating] = useState(false)
    const [format, setFormat] = useState<'csv' | 'html'>('csv')

    const applyPreset = (preset: 'this_month' | 'last_month' | 'this_quarter' | 'current_fy') => {
        const d = new Date()
        const y = d.getFullYear()
        const m = d.getMonth()

        if (preset === 'this_month') {
            const start = new Date(y, m, 1).toISOString().split('T')[0]
            const end = new Date(y, m + 1, 0).toISOString().split('T')[0]
            setStartDate(start)
            setEndDate(end)
        } else if (preset === 'last_month') {
            const start = new Date(y, m - 1, 1).toISOString().split('T')[0]
            const end = new Date(y, m, 0).toISOString().split('T')[0]
            setStartDate(start)
            setEndDate(end)
        } else if (preset === 'this_quarter') {
            const q = Math.floor(m / 3)
            const start = new Date(y, q * 3, 1).toISOString().split('T')[0]
            const end = new Date(y, (q + 1) * 3, 0).toISOString().split('T')[0]
            setStartDate(start)
            setEndDate(end)
        } else if (preset === 'current_fy') {
            const fyStartYear = m >= 3 ? y : y - 1
            const start = `${fyStartYear}-04-01`
            const end = `${fyStartYear + 1}-03-31`
            setStartDate(start)
            setEndDate(end)
        }
    }

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates')
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/reports/accounting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate, format })
            })

            if (!response.ok) {
                throw new Error('Failed to generate report')
            }

            if (format === 'html') {
                const htmlText = await response.text()
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                    printWindow.document.write(htmlText)
                    printWindow.document.close()
                } else {
                    alert('Popup blocked. Please allow popups to view and print the report.')
                }
            } else {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `Accounting-Report-${startDate}-to-${endDate}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Error generating accounting report:', error)
            alert('Failed to generate accounting report. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Presets:</span>
                    <button
                        type="button"
                        onClick={() => applyPreset('this_month')}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                        This Month
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset('last_month')}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                        Last Month
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset('this_quarter')}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                        This Quarter
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset('current_fy')}
                        className="text-xs px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 font-medium transition-colors cursor-pointer"
                    >
                        Current FY
                    </button>
                </div>

                {/* Dates */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        Report Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Format selection */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormat('csv')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                format === 'csv'
                                    ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-950/60 dark:border-purple-500 dark:text-purple-300 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            Excel / CSV Ledger
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormat('html')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                format === 'html'
                                    ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-950/60 dark:border-purple-500 dark:text-purple-300 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            <Printer className="h-3.5 w-3.5 text-purple-600" />
                            Print / PDF Statement
                        </button>
                    </div>
                </div>

                {/* Clean, readable info container */}
                <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 p-3 rounded-lg text-xs space-y-1.5">
                    <p className="font-semibold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        Comprehensive CA Package Includes:
                    </p>
                    <ul className="grid grid-cols-2 gap-1 text-purple-800 dark:text-purple-300 text-[11px] pl-1">
                        <li>• Total revenue & income</li>
                        <li>• Customer billing breakdown</li>
                        <li>• Paid vs Pending receivables</li>
                        <li>• Invoice payment register</li>
                    </ul>
                </div>
            </div>

            <Button
                onClick={handleGenerate}
                disabled={isGenerating || !startDate || !endDate}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-xs font-semibold h-10 cursor-pointer"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Preparing Statement...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4 mr-2" />
                        {format === 'html' ? 'Open Printable Statement' : 'Download Accounting Report'}
                    </>
                )}
            </Button>
        </div>
    )
}
