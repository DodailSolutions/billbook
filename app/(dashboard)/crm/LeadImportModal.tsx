'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/Button"
import { CRMTeamMember, LeadImportFieldMapping, LeadStage, LeadSource } from "@/lib/crm-types"
import { 
    fetchGoogleSheetData, 
    batchImportLeads, 
    saveGoogleSheetIntegration 
} from "@/lib/crm-actions"
import { 
    parseCSV, 
    autoMatchFields, 
    mapRowToLead, 
    generateSampleCRMTemplateCSV 
} from "@/lib/crm-import-utils"
import { 
    X, UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, 
    AlertTriangle, ArrowRight, ArrowLeft, Download, RefreshCw, 
    Link as LinkIcon, Database, Check, Layers
} from "lucide-react"

interface LeadImportModalProps {
    isOpen: boolean
    onClose: () => void
    teamMembers: CRMTeamMember[]
    onSuccess?: () => void
}

type ImportSourceType = 'file' | 'google_sheets'
type Step = 'source' | 'mapping' | 'preview' | 'importing' | 'complete'

export function LeadImportModal({ isOpen, onClose, teamMembers, onSuccess }: LeadImportModalProps) {
    const [step, setStep] = useState<Step>('source')
    const [sourceType, setSourceType] = useState<ImportSourceType>('file')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // File state
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Google Sheets state
    const [googleSheetUrl, setGoogleSheetUrl] = useState('')
    const [sheetIntegrationName, setSheetIntegrationName] = useState('')
    const [saveSheetConfig, setSaveSheetConfig] = useState(false)
    const [sheetMeta, setSheetMeta] = useState<{ sheetId?: string; gid?: string } | null>(null)

    // Parsed Data state
    const [headers, setHeaders] = useState<string[]>([])
    const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
    const [mapping, setMapping] = useState<LeadImportFieldMapping>({
        title: '',
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        value: '',
        stage: '',
        source: '',
        assigned_to: '',
        notes: '',
        tags: ''
    })

    // Import Options & Defaults
    const [defaultStage, setDefaultStage] = useState<LeadStage>('lead')
    const [defaultAssignee, setDefaultAssignee] = useState<string>('')
    const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'create'>('skip')

    // Results state
    const [importResult, setImportResult] = useState<{
        total: number
        imported: number
        duplicates: number
        failed: number
    } | null>(null)

    if (!isOpen) return null

    const resetState = () => {
        setStep('source')
        setFile(null)
        setGoogleSheetUrl('')
        setHeaders([])
        setRawRows([])
        setError(null)
        setImportResult(null)
    }

    const handleDownloadTemplate = () => {
        const csvContent = generateSampleCRMTemplateCSV()
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'billbook_crm_leads_template.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Process uploaded file (CSV or plain text)
    const handleFileUpload = async (uploadedFile: File) => {
        setError(null)
        setFile(uploadedFile)
        setLoading(true)

        try {
            const text = await uploadedFile.text()
            const { headers: parsedHeaders, rows: parsedRows } = parseCSV(text)

            if (parsedHeaders.length === 0 || parsedRows.length === 0) {
                setError('The uploaded file appears to be empty or has an invalid structure.')
                setLoading(false)
                return
            }

            setHeaders(parsedHeaders)
            setRawRows(parsedRows)

            // Auto-match headers
            const initialMapping = autoMatchFields(parsedHeaders)
            setMapping(initialMapping)

            setStep('mapping')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to read file')
        } finally {
            setLoading(false)
        }
    }

    // Connect and fetch from Google Sheets
    const handleConnectGoogleSheet = async () => {
        if (!googleSheetUrl.trim()) {
            setError('Please enter a Google Sheets URL')
            return
        }

        setError(null)
        setLoading(true)

        try {
            const res = await fetchGoogleSheetData(googleSheetUrl)
            if (!res.success || !res.headers || !res.rows) {
                setError(res.error || 'Failed to connect to Google Sheets')
                setLoading(false)
                return
            }

            setHeaders(res.headers)
            setRawRows(res.rows)
            setSheetMeta({ sheetId: res.sheetId, gid: res.gid })
            setSheetIntegrationName(`Sheet Sync - ${new Date().toLocaleDateString('en-IN')}`)

            // Auto match
            const initialMapping = autoMatchFields(res.headers)
            setMapping(initialMapping)

            setStep('mapping')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error connecting to Google Sheets')
        } finally {
            setLoading(false)
        }
    }

    // Execute Import
    const handleExecuteImport = async () => {
        setLoading(true)
        setStep('importing')
        setError(null)

        try {
            // Map rows into CreateLeadInput
            const leadsToImport = rawRows
                .map(r => mapRowToLead(r, mapping, {
                    stage: defaultStage,
                    source: sourceType === 'google_sheets' ? 'google_sheets' : 'excel_import',
                    assigned_member_id: defaultAssignee || undefined
                }))
                .filter(Boolean) as any[]

            if (leadsToImport.length === 0) {
                setError('No valid leads could be derived from the mapped columns.')
                setStep('mapping')
                setLoading(false)
                return
            }

            // Save Google Sheet integration if opted
            if (sourceType === 'google_sheets' && saveSheetConfig && sheetMeta?.sheetId) {
                await saveGoogleSheetIntegration({
                    name: sheetIntegrationName || 'Google Sheet Leads Stream',
                    sheet_url: googleSheetUrl,
                    sheet_id: sheetMeta.sheetId,
                    sheet_gid: sheetMeta.gid || '0',
                    column_mapping: mapping,
                    duplicate_strategy: duplicateStrategy,
                    default_stage: defaultStage,
                    default_assigned_member_id: defaultAssignee || null,
                    auto_sync: false
                })
            }

            // Batch import
            const res = await batchImportLeads(leadsToImport, {
                duplicateStrategy,
                importSource: sourceType === 'google_sheets' ? 'google_sheets' : 'excel_import'
            })

            setImportResult({
                total: leadsToImport.length,
                imported: res.importedCount,
                duplicates: res.skippedDuplicatesCount,
                failed: res.failedCount
            })

            setStep('complete')
            onSuccess?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error importing leads')
            setStep('preview')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-xs overflow-hidden">
            <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/60 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                            <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Import Leads & Deals
                            </h3>
                            <p className="text-xs text-gray-500">
                                Seamlessly import prospects from Excel, CSV, or live Google Sheets
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetState(); onClose(); }}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between px-6 py-2.5 bg-indigo-50/40 border-b border-indigo-100/60 text-xs font-semibold text-gray-600 shrink-0">
                    <div className={`flex items-center gap-1.5 ${step === 'source' ? 'text-indigo-600 font-bold' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'source' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</span>
                        <span>Source</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className={`flex items-center gap-1.5 ${step === 'mapping' ? 'text-indigo-600 font-bold' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'mapping' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</span>
                        <span>Map Fields</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className={`flex items-center gap-1.5 ${step === 'preview' ? 'text-indigo-600 font-bold' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>3</span>
                        <span>Configure</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className={`flex items-center gap-1.5 ${step === 'complete' ? 'text-emerald-600 font-bold' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'complete' ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>4</span>
                        <span>Done</span>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                    {error && (
                        <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* STEP 1: SOURCE SELECTION */}
                    {step === 'source' && (
                        <div className="space-y-5">
                            {/* Tabs */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => { setSourceType('file'); setError(null); }}
                                    className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                                        sourceType === 'file'
                                            ? 'bg-white text-indigo-700 shadow-xs'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Upload Excel / CSV
                                </button>
                                <button
                                    onClick={() => { setSourceType('google_sheets'); setError(null); }}
                                    className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                                        sourceType === 'google_sheets'
                                            ? 'bg-white text-indigo-700 shadow-xs'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    Connect Google Sheets
                                </button>
                            </div>

                            {/* File Upload Mode */}
                            {sourceType === 'file' && (
                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-2xl p-8 text-center cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".csv,.txt,.xlsx,.xls"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0]
                                                if (f) handleFileUpload(f)
                                            }}
                                        />
                                        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl mb-3">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">
                                            Click to upload or drag & drop spreadsheet
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supports CSV, Excel (.xlsx, .xls) up to 10MB
                                        </p>
                                    </div>

                                    {/* Sample Template Helper */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200/80 rounded-xl">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Need a starting format?</p>
                                            <p className="text-[11px] text-gray-500">Download our pre-structured template with example columns.</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadTemplate}
                                            className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Sample CSV
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Google Sheets Mode */}
                            {sourceType === 'google_sheets' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Google Spreadsheet URL
                                        </label>
                                        <input
                                            type="url"
                                            value={googleSheetUrl}
                                            onChange={(e) => setGoogleSheetUrl(e.target.value)}
                                            placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit#gid=0"
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-indigo-600 focus:border-indigo-600 transition-colors"
                                        />
                                    </div>

                                    <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
                                        <p className="font-bold flex items-center gap-1.5 text-blue-800">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                            Zero Setup Direct Sync
                                        </p>
                                        <p className="text-blue-700 leading-relaxed text-[11px]">
                                            Simply set your Google Sheet sharing to <strong>&quot;Anyone with the link can view&quot;</strong>. BillBook will securely fetch and stream your leads without needing complex Google Cloud setup.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleConnectGoogleSheet}
                                        disabled={loading || !googleSheetUrl.trim()}
                                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Connecting to Google Sheet...
                                            </>
                                        ) : (
                                            <>
                                                <LinkIcon className="h-4 w-4" />
                                                Verify & Fetch Columns
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: FIELD MAPPING */}
                    {step === 'mapping' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Map Columns to CRM Fields</h4>
                                    <p className="text-xs text-gray-500">
                                        Detected {headers.length} columns and {rawRows.length} rows. Match them below:
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                                    {rawRows.length} leads detected
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                                {[
                                    { key: 'title', label: 'Deal Title / Opportunity *', required: true },
                                    { key: 'company_name', label: 'Company / Business Name' },
                                    { key: 'contact_name', label: 'Contact Person Name' },
                                    { key: 'email', label: 'Email Address' },
                                    { key: 'phone', label: 'Phone Number' },
                                    { key: 'value', label: 'Deal Value (Amount in INR)' },
                                    { key: 'stage', label: 'Stage (Lead, Contacted, Won...)' },
                                    { key: 'source', label: 'Lead Source (Web, Referral...)' },
                                    { key: 'assigned_to', label: 'Assigned Member Name' },
                                    { key: 'notes', label: 'Notes / Description' },
                                    { key: 'tags', label: 'Tags / Labels' }
                                ].map((field) => (
                                    <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-gray-200/60">
                                        <div className="w-48 shrink-0">
                                            <span className="text-xs font-bold text-gray-800">
                                                {field.label}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={(mapping as any)[field.key] || ''}
                                                onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-indigo-500"
                                            >
                                                <option value="">-- Do Not Import / Not in Sheet --</option>
                                                {headers.map((h) => (
                                                    <option key={h} value={h}>
                                                        Column: {h} {rawRows[0]?.[h] ? `(e.g. "${rawRows[0][h].slice(0, 20)}")` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PREVIEW & CONFIGURE DEFAULTS */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Defaults & Duplicate Rules</h4>
                                <p className="text-xs text-gray-500">Configure how unmapped values and duplicates should be handled.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Default Stage */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700">Default Pipeline Stage</label>
                                    <select
                                        value={defaultStage}
                                        onChange={(e) => setDefaultStage(e.target.value as LeadStage)}
                                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-indigo-500"
                                    >
                                        <option value="lead">New Lead (Default)</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="proposal_sent">Proposal Sent</option>
                                        <option value="negotiation">Negotiation</option>
                                        <option value="won">Won Deal</option>
                                    </select>
                                </div>

                                {/* Default Assignee */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-700">Assign To Team Member</label>
                                    <select
                                        value={defaultAssignee}
                                        onChange={(e) => setDefaultAssignee(e.target.value)}
                                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-indigo-500"
                                    >
                                        <option value="">-- Unassigned (Pool) --</option>
                                        {teamMembers.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Duplicate Policy */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-semibold text-gray-700">Duplicate Handling Strategy</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'skip', title: 'Skip Duplicates', desc: 'Recommended' },
                                        { id: 'create', title: 'Import All', desc: 'Allow duplicates' }
                                    ].map((strat) => (
                                        <button
                                            key={strat.id}
                                            type="button"
                                            onClick={() => setDuplicateStrategy(strat.id as any)}
                                            className={`p-2 text-left rounded-xl border text-xs transition-all ${
                                                duplicateStrategy === strat.id
                                                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="font-semibold">{strat.title}</div>
                                            <div className="text-[10px] text-gray-500">{strat.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Google Sheet Sync Config */}
                            {sourceType === 'google_sheets' && (
                                <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="saveConfig"
                                        checked={saveSheetConfig}
                                        onChange={(e) => setSaveSheetConfig(e.target.checked)}
                                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="saveConfig" className="text-xs text-gray-700 cursor-pointer">
                                        <span className="font-bold block text-gray-900">Save connection for 1-click re-syncing</span>
                                        Keep this Google Sheet linked so you can pull new rows anytime from the CRM toolbar.
                                    </label>
                                </div>
                            )}

                            {/* Data Preview */}
                            <div className="space-y-1.5 pt-2">
                                <span className="text-xs font-bold text-gray-700">First 3 Rows Preview:</span>
                                <div className="border border-gray-200 rounded-xl overflow-x-auto text-[11px]">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100 text-gray-600 border-b border-gray-200 font-semibold">
                                            <tr>
                                                <th className="p-2">Title</th>
                                                <th className="p-2">Company</th>
                                                <th className="p-2">Contact</th>
                                                <th className="p-2">Email</th>
                                                <th className="p-2">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {rawRows.slice(0, 3).map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50">
                                                    <td className="p-2 font-medium text-gray-900">{r[mapping.title] || '(Fallback Title)'}</td>
                                                    <td className="p-2 text-gray-600">{r[mapping.company_name] || '—'}</td>
                                                    <td className="p-2 text-gray-600">{r[mapping.contact_name] || '—'}</td>
                                                    <td className="p-2 text-gray-600">{r[mapping.email] || '—'}</td>
                                                    <td className="p-2 font-semibold text-emerald-600">₹{r[mapping.value] || '0'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: IMPORTING */}
                    {step === 'importing' && (
                        <div className="py-12 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full animate-spin">
                                <RefreshCw className="h-7 w-7" />
                            </div>
                            <h4 className="text-base font-bold text-gray-900">Importing Leads into CRM Pipeline...</h4>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                Processing {rawRows.length} deals, checking duplicates, and indexing pipeline records.
                            </p>
                        </div>
                    )}

                    {/* STEP 5: COMPLETE */}
                    {step === 'complete' && importResult && (
                        <div className="py-8 text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Leads Imported Successfully!</h4>
                                <p className="text-xs text-gray-500 mt-1">Your sales pipeline has been updated.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="text-xl font-bold text-emerald-700">{importResult.imported}</div>
                                    <div className="text-[11px] text-emerald-600 font-medium">Imported</div>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="text-xl font-bold text-amber-700">{importResult.duplicates}</div>
                                    <div className="text-[11px] text-amber-600 font-medium">Skipped Duplicates</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                                    <div className="text-xl font-bold text-gray-700">{importResult.total}</div>
                                    <div className="text-[11px] text-gray-500 font-medium">Total Rows</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/60 shrink-0">
                    {step === 'complete' ? (
                        <Button
                            type="button"
                            onClick={() => { resetState(); onClose(); }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Done & View Pipeline
                        </Button>
                    ) : (
                        <>
                            {step !== 'source' && step !== 'importing' ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (step === 'mapping') setStep('source')
                                        if (step === 'preview') setStep('mapping')
                                    }}
                                    className="gap-1.5 text-xs text-gray-700"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Back
                                </Button>
                            ) : <div />}

                            {step === 'mapping' && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setStep('preview')}
                                    className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Configure & Preview
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            )}

                            {step === 'preview' && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleExecuteImport}
                                    disabled={loading}
                                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Start Import Now
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
