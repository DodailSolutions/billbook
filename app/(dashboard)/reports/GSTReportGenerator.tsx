'use client'

import { useState } from 'react'
import { Download, Calendar, Loader2, FileSpreadsheet, Printer, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function GSTReportGenerator() {
    // Default to current month
    const now = new Date()
    const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDayStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const [startDate, setStartDate] = useState(firstDayStr)
    const [endDate, setEndDate] = useState(lastDayStr)
    const [format, setFormat] = useState<'csv' | 'html' | 'json'>('csv')
    const [isGenerating, setIsGenerating] = useState(false)

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
            // Indian FY: Apr 1 - Mar 31
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
            const response = await fetch('/api/reports/gst', {
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
            } else if (format === 'json') {
                const jsonData = await response.json()
                const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `GSTR1-Report-${startDate}-to-${endDate}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } else {
                // CSV download
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `GST-Report-${startDate}-to-${endDate}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Error generating GST report:', error)
            alert('Failed to generate GST report. Please try again.')
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
                        className="text-xs px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 font-medium transition-colors cursor-pointer"
                    >
                        Current FY
                    </button>
                </div>

                {/* Dates */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
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
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormat('csv')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                format === 'csv'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            Excel / CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormat('html')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                format === 'html'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            <Printer className="h-3.5 w-3.5 text-blue-600" />
                            Print / PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormat('json')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                format === 'json'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            <Download className="h-3.5 w-3.5 text-purple-600" />
                            JSON Portal
                        </button>
                    </div>
                </div>

                {/* Clean, readable info container */}
                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-3 rounded-lg text-xs space-y-1.5">
                    <p className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        GSTR-1 Tax Filing Coverage:
                    </p>
                    <ul className="grid grid-cols-2 gap-1 text-blue-800 dark:text-blue-300 text-[11px] pl-1">
                        <li>• CGST, SGST & IGST split</li>
                        <li>• B2B (GSTIN) vs B2C sales</li>
                        <li>• Intra-state & Inter-state</li>
                        <li>• Reverse charge details</li>
                    </ul>
                </div>
            </div>

            <Button
                onClick={handleGenerate}
                disabled={isGenerating || !startDate || !endDate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold h-10 cursor-pointer"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Preparing GST Report...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4 mr-2" />
                        {format === 'html' ? 'Open Printable GST Report' : 'Download GST Report'}
                    </>
                )}
            </Button>
        </div>
    )
}
