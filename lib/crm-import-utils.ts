/**
 * BillBook CRM Lead Import Utilities
 * Handles RFC-4180 compliant CSV parsing, Google Sheets URL parsing,
 * header auto-matching, and sample file generation.
 */

import type { CreateLeadInput, LeadImportFieldMapping, LeadSource, LeadStage } from './crm-types'

/**
 * Parses a standard Google Spreadsheet URL to extract the Spreadsheet ID and Sheet GID.
 * Supports standard docs.google.com/spreadsheets/d/{ID}/edit#gid={GID} formats.
 */
export function parseGoogleSheetUrl(url: string): { sheetId: string; gid: string; exportCsvUrl: string } | null {
    try {
        const cleanUrl = url.trim()
        if (!cleanUrl.includes('docs.google.com/spreadsheets')) {
            return null
        }

        // Match spreadsheet ID: /d/([a-zA-Z0-9-_]+)
        const idMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
        if (!idMatch || !idMatch[1]) {
            return null
        }

        const sheetId = idMatch[1]

        // Match gid: gid=([0-9]+)
        const gidMatch = cleanUrl.match(/[#&?]gid=([0-9]+)/)
        const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0'

        // Direct live CSV export endpoint
        const exportCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

        return {
            sheetId,
            gid,
            exportCsvUrl
        }
    } catch {
        return null
    }
}

/**
 * Robust RFC 4180 compliant CSV parser.
 * Properly handles quoted fields, inner commas, escaped quotes (""), and multi-line values.
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
    const cleanText = csvText.replace(/^\uFEFF/, '') // Remove UTF-8 BOM if present
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentCell = ''
    let inQuotes = false

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i]
        const nextChar = cleanText[i + 1]

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote: "" -> "
                currentCell += '"'
                i++
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim())
            currentCell = ''
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++ // Skip LF in CRLF
            }
            currentRow.push(currentCell.trim())
            currentCell = ''

            // Avoid pushing empty trailing lines
            if (currentRow.some(c => c.length > 0)) {
                rows.push(currentRow)
            }
            currentRow = []
        } else {
            currentCell += char
        }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim())
        if (currentRow.some(c => c.length > 0)) {
            rows.push(currentRow)
        }
    }

    if (rows.length === 0) {
        return { headers: [], rows: [] }
    }

    const headers = rows[0].map(h => h.trim())
    const dataRows = rows.slice(1).map(row => {
        const record: Record<string, string> = {}
        headers.forEach((header, index) => {
            record[header] = row[index] !== undefined ? row[index] : ''
        })
        return record
    })

    return { headers, rows: dataRows }
}

/**
 * Intelligent field matcher for spreadsheet column headers.
 * Matches synonyms like "Client", "Organization", "Deal Name", "Mobile" to CRM fields.
 */
export function autoMatchFields(headers: string[]): LeadImportFieldMapping {
    const mapping: LeadImportFieldMapping = {
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
    }

    const lowerHeaders = headers.map(h => ({ raw: h, norm: h.toLowerCase().replace(/[^a-z0-9]/g, '') }))

    for (const h of lowerHeaders) {
        const n = h.norm

        // Title / Deal Name
        if (!mapping.title && (n.includes('title') || n.includes('deal') || n.includes('opportunity') || n.includes('leadname') || n === 'name' && headers.some(other => other.toLowerCase().includes('contact')))) {
            mapping.title = h.raw
        }
        // Contact Name
        else if (!mapping.contact_name && (n.includes('contact') || n.includes('person') || n.includes('fullname') || n.includes('clientname') || (n === 'name' && !mapping.title))) {
            mapping.contact_name = h.raw
        }
        // Company Name
        else if (!mapping.company_name && (n.includes('company') || n.includes('organization') || n.includes('business') || n.includes('firm') || n.includes('account'))) {
            mapping.company_name = h.raw
        }
        // Email
        else if (!mapping.email && (n.includes('email') || n.includes('mail'))) {
            mapping.email = h.raw
        }
        // Phone
        else if (!mapping.phone && (n.includes('phone') || n.includes('mobile') || n.includes('contactno') || n.includes('whatsapp') || n.includes('tel') || n.includes('cell'))) {
            mapping.phone = h.raw
        }
        // Value / Amount
        else if (!mapping.value && (n.includes('value') || n.includes('amount') || n.includes('dealvalue') || n.includes('price') || n.includes('budget') || n.includes('revenue'))) {
            mapping.value = h.raw
        }
        // Stage
        else if (!mapping.stage && (n.includes('stage') || n.includes('status') || n.includes('pipeline') || n.includes('phase'))) {
            mapping.stage = h.raw
        }
        // Source
        else if (!mapping.source && (n.includes('source') || n.includes('channel') || n.includes('origin') || n.includes('campaign'))) {
            mapping.source = h.raw
        }
        // Assignee
        else if (!mapping.assigned_to && (n.includes('assign') || n.includes('owner') || n.includes('rep') || n.includes('salesperson') || n.includes('member'))) {
            mapping.assigned_to = h.raw
        }
        // Notes
        else if (!mapping.notes && (n.includes('note') || n.includes('desc') || n.includes('comment') || n.includes('remark'))) {
            mapping.notes = h.raw
        }
        // Tags
        else if (!mapping.tags && (n.includes('tag') || n.includes('label') || n.includes('category'))) {
            mapping.tags = h.raw
        }
    }

    // Fallback if title still not matched
    if (!mapping.title && headers.length > 0) {
        mapping.title = headers[0]
    }

    return mapping
}

/**
 * Normalizes an imported row according to field mapping into CreateLeadInput.
 */
export function mapRowToLead(
    row: Record<string, string>,
    mapping: LeadImportFieldMapping,
    defaults?: {
        stage?: LeadStage
        source?: LeadSource
        assigned_member_id?: string | null
    }
): CreateLeadInput | null {
    const rawTitle = mapping.title ? row[mapping.title]?.trim() : ''
    const rawCompany = mapping.company_name ? row[mapping.company_name]?.trim() : ''
    const rawContact = mapping.contact_name ? row[mapping.contact_name]?.trim() : ''

    // If title is missing, fallback to Company or Contact Name
    const title = rawTitle || (rawCompany ? `Deal with ${rawCompany}` : (rawContact ? `Deal - ${rawContact}` : ''))
    if (!title) return null

    // Parse numeric value (handles ₹, $, commas, text)
    let value = 0
    if (mapping.value && row[mapping.value]) {
        const cleaned = row[mapping.value].replace(/[^0-9.-]/g, '')
        const num = parseFloat(cleaned)
        if (!isNaN(num)) value = num
    }

    // Normalize Stage
    let stage: LeadStage = defaults?.stage || 'lead'
    if (mapping.stage && row[mapping.stage]) {
        const rawStage = row[mapping.stage].toLowerCase()
        if (rawStage.includes('won') || rawStage.includes('close won') || rawStage.includes('success')) stage = 'won'
        else if (rawStage.includes('lost') || rawStage.includes('drop') || rawStage.includes('dead')) stage = 'lost'
        else if (rawStage.includes('negotiat') || rawStage.includes('contract')) stage = 'negotiation'
        else if (rawStage.includes('propos') || rawStage.includes('quote') || rawStage.includes('pitch')) stage = 'proposal_sent'
        else if (rawStage.includes('contact') || rawStage.includes('call') || rawStage.includes('progress')) stage = 'contacted'
        else if (rawStage.includes('lead') || rawStage.includes('new') || rawStage.includes('open')) stage = 'lead'
    }

    // Normalize Source
    let source: LeadSource = defaults?.source || 'excel_import'
    if (mapping.source && row[mapping.source]) {
        const rawSource = row[mapping.source].toLowerCase()
        if (rawSource.includes('referral')) source = 'referral'
        else if (rawSource.includes('whatsapp')) source = 'whatsapp'
        else if (rawSource.includes('campaign') || rawSource.includes('ad')) source = 'campaign'
        else if (rawSource.includes('phone') || rawSource.includes('call')) source = 'phone'
        else if (rawSource.includes('web') || rawSource.includes('site')) source = 'web'
        else if (rawSource.includes('sheet')) source = 'google_sheets'
        else source = 'other'
    }

    // Tags
    let tags: string[] = []
    if (mapping.tags && row[mapping.tags]) {
        tags = row[mapping.tags].split(/[,;|]/).map(t => t.trim().replace(/^#/, '')).filter(Boolean)
    }

    return {
        title,
        company_name: rawCompany || undefined,
        contact_name: rawContact || undefined,
        email: mapping.email ? row[mapping.email]?.trim() || undefined : undefined,
        phone: mapping.phone ? row[mapping.phone]?.trim() || undefined : undefined,
        value,
        currency: 'INR',
        stage,
        source,
        assigned_to: mapping.assigned_to ? row[mapping.assigned_to]?.trim() || undefined : undefined,
        assigned_member_id: defaults?.assigned_member_id || undefined,
        notes: mapping.notes ? row[mapping.notes]?.trim() || undefined : undefined,
        tags
    }
}

/**
 * Generates ready-to-use CSV template for CRM lead import.
 */
export function generateSampleCRMTemplateCSV(): string {
    const headers = [
        'Deal Title',
        'Company Name',
        'Contact Person',
        'Email Address',
        'Phone Number',
        'Deal Value (INR)',
        'Stage',
        'Source',
        'Assigned Member',
        'Tags',
        'Notes'
    ]

    const sampleRows = [
        [
            'Enterprise Billing ERP Deal',
            'Acme Technologies Pvt Ltd',
            'Vikram Sharma',
            'vikram@acmetech.in',
            '+91 98765 43210',
            '150000',
            'Proposal Sent',
            'Referral',
            'Sales Team',
            'enterprise, urgent',
            'Requires custom GST invoice templates and multi-user login'
        ],
        [
            'Retail POS Software License',
            'Kalyan Jewelers & Retail',
            'Ananya Iyer',
            'ananya@kalyanjewelers.com',
            '+91 98450 11223',
            '75000',
            'Negotiation',
            'Web',
            'Priya Rao',
            'retail, jewelry',
            'Wants barcode scanner integration and daily ledger export'
        ],
        [
            'Annual CA Bookkeeping Retainer',
            'Nexus Logistics Hub',
            'Rajesh Patel',
            'rajesh@nexuslogistics.co.in',
            '+91 97123 45678',
            '45000',
            'Contacted',
            'Campaign',
            'Ravi Teja',
            'logistics, bookkeeping',
            'Scheduled zoom demo for next Tuesday at 3 PM'
        ]
    ]

    const escapeCSV = (val: string) => {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`
        }
        return val
    }

    const csvContent = [
        headers.join(','),
        ...sampleRows.map(row => row.map(escapeCSV).join(','))
    ].join('\n')

    return csvContent
}
