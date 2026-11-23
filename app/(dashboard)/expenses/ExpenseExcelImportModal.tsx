'use client'

import React, { useState, useRef } from 'react'
import { X, UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { bulkImportExpensesAction } from './actions'

interface ExpenseExcelImportModalProps {
  onClose: () => void
  onSuccess: (count: number) => void
}

interface ParsedExpenseRow {
  date: string
  payeeName: string
  categoryName: string
  amount: number
  taxAmount: number
  paymentMethod: string
  recurrence: string
}

export function ExpenseExcelImportModal({ onClose, onSuccess }: ExpenseExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedExpenseRow[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Download Sample CSV
  const handleDownloadTemplate = () => {
    const csvContent = 
`Date,Payee / Description,Category,Amount,Tax Amount,Payment Method,Recurrence
${new Date().toISOString().slice(0, 10)},Amazon Web Services,Software & SaaS,14500,2610,card,monthly
${new Date().toISOString().slice(0, 10)},Corporate Office Lease,Rent & Rates,65000,0,bank_transfer,monthly
${new Date().toISOString().slice(0, 10)},Vehicle Fleet Fuel & Diesel,Vehicle & Fleet Expenses,4800,0,cash,one_time
${new Date().toISOString().slice(0, 10)},Car Servicing & Fastag,Vehicle & Fleet Expenses,8500,1530,card,one_time
${new Date().toISOString().slice(0, 10)},Google Ads Media Spend,Marketing & Advertising,35000,6300,card,monthly
`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `BillBook_Expense_Import_Template.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse CSV or Text
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsParsing(true)
    setErrorMessage(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (!text) {
          setErrorMessage('Empty file uploaded')
          setIsParsing(false)
          return
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
        if (lines.length <= 1) {
          setErrorMessage('File contains no expense records')
          setIsParsing(false)
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const rows: ParsedExpenseRow[] = []

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
          if (cols.length < 2) continue

          const date = cols[0] || new Date().toISOString().slice(0, 10)
          const payeeName = cols[1] || 'Expense'
          const categoryName = cols[2] || 'Office Supplies'
          const amount = parseFloat(cols[3]) || 0
          const taxAmount = parseFloat(cols[4]) || 0
          const paymentMethod = cols[5] || 'bank_transfer'
          const recurrence = cols[6]?.toLowerCase() || 'one_time'

          if (amount > 0) {
            rows.push({
              date,
              payeeName,
              categoryName,
              amount,
              taxAmount,
              paymentMethod,
              recurrence
            })
          }
        }

        if (rows.length === 0) {
          setErrorMessage('Could not extract valid expense rows. Please check format.')
        } else {
          setParsedRows(rows)
        }
      } catch (err) {
        setErrorMessage('Failed to parse file. Please use standard CSV format.')
      } finally {
        setIsParsing(false)
      }
    }

    reader.onerror = () => {
      setErrorMessage('Failed to read file.')
      setIsParsing(false)
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (parsedRows.length === 0) return
    setIsImporting(true)
    setErrorMessage(null)

    try {
      const res = await bulkImportExpensesAction(parsedRows)
      if (res.success) {
        onSuccess(res.importedCount)
        onClose()
      } else {
        setErrorMessage(res.error || 'Failed to import expense records')
      }
    } catch {
      setErrorMessage('An unexpected error occurred during import')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Import Expense Report (Excel / CSV)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload past expense spreadsheets to populate your business ledger automatically.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dropzone & Template Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-center cursor-pointer hover:bg-emerald-50/60 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            <p className="font-semibold text-xs text-slate-900 dark:text-white">
              {fileName || 'Choose Excel or CSV File'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click to browse your device</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div>
              <p className="font-semibold text-xs text-slate-900 dark:text-white">Excel Template</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download pre-configured columns: Date, Payee, Category, Amount, Recurrence.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs h-8 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 mt-2 w-fit"
            >
              <Download className="w-3.5 h-3.5" /> Download Template (.csv)
            </Button>
          </div>
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                Preview Rows ({parsedRows.length} valid expenses found)
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Total: ₹{parsedRows.reduce((sum, r) => sum + r.amount + r.taxAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Description / Payee</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Recurrence</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-[11px]">{row.date}</td>
                      <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{row.payeeName}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.categoryName}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.recurrence !== 'one_time' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.recurrence}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white text-right">
                        ₹{(row.amount + row.taxAmount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 15 && (
              <p className="text-[11px] text-slate-400 text-center italic">
                Showing first 15 of {parsedRows.length} rows
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || isParsing || parsedRows.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing Records...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Import {parsedRows.length} Expenses
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
