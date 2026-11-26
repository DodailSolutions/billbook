export type InvoiceCopyType = 'original' | 'duplicate' | 'triplicate'
export type InvoicePrintFormat = 'a4' | 'thermal_80mm'

export const COPY_LABELS: Record<InvoiceCopyType, string> = {
    original: 'ORIGINAL FOR RECIPIENT',
    duplicate: 'DUPLICATE FOR TRANSPORTER',
    triplicate: 'TRIPLICATE FOR SUPPLIER',
}

const ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
]

const TENS = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
]

function twoDigitsToWords(n: number): string {
    if (n < 20) return ONES[n]
    const ten = Math.floor(n / 10)
    const one = n % 10
    return `${TENS[ten]}${one ? ` ${ONES[one]}` : ''}`.trim()
}

function integerToIndianWords(num: number): string {
    if (num === 0) return 'Zero'
    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num % 10000000) / 100000)
    const thousand = Math.floor((num % 100000) / 1000)
    const hundred = Math.floor((num % 1000) / 100)
    const remainder = num % 100

    const parts: string[] = []
    if (crore > 0) parts.push(`${integerToIndianWords(crore)} Crore`)
    if (lakh > 0) parts.push(`${twoDigitsToWords(lakh)} Lakh`)
    if (thousand > 0) parts.push(`${twoDigitsToWords(thousand)} Thousand`)
    if (hundred > 0) parts.push(`${ONES[hundred]} Hundred`)
    if (remainder > 0) parts.push(twoDigitsToWords(remainder))

    return parts.join(' ').trim()
}

/**
 * Converts a numeric INR amount into Indian numbering words
 * e.g. 12345.50 -> "Rupees Twelve Thousand Three Hundred Forty Five and Fifty Paise Only"
 */
export function numberToIndianWords(amount: number): string {
    const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0)
    const rupees = Math.floor(safeAmount)
    const paise = Math.round((safeAmount - rupees) * 100)

    const rupeeWords = `${integerToIndianWords(rupees)} ${rupees === 1 ? 'Rupee' : 'Rupees'}`
    if (paise > 0) {
        return `${rupeeWords} and ${twoDigitsToWords(paise)} Paise Only`
    }
    return `${rupeeWords} Only`
}

export interface HsnTaxRow {
    hsn: string
    gstRate: number
    taxableValue: number
    cgst: number
    sgst: number
    igst: number
    totalTax: number
}

interface HsnItemLike {
    hsn_sac_code?: string | null
    amount?: number | null
    gst_rate?: number | null
    item_tax_amount?: number | null
}

/**
 * Groups invoice line items by HSN/SAC code and GST rate for GST-audit-ready tax summaries.
 */
export function buildHsnTaxSummary(
    items: HsnItemLike[],
    fallbackGstRate: number = 0,
    supplyType: string = 'intra-state'
): HsnTaxRow[] {
    if (!Array.isArray(items) || items.length === 0) return []

    const isIntra = supplyType !== 'inter-state'
    const map = new Map<string, HsnTaxRow>()

    for (const item of items) {
        const hsn = (item.hsn_sac_code || '').trim() || '—'
        const gstRate = Number(item.gst_rate ?? fallbackGstRate ?? 0)
        const taxable = Number(item.amount || 0)
        const itemTax =
            item.item_tax_amount !== undefined && item.item_tax_amount !== null
                ? Number(item.item_tax_amount)
                : Number(((taxable * gstRate) / 100).toFixed(2))

        const key = `${hsn}::${gstRate}`
        const existing = map.get(key) || {
            hsn,
            gstRate,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
        }

        existing.taxableValue += taxable
        existing.totalTax += itemTax
        if (isIntra) {
            existing.cgst += itemTax / 2
            existing.sgst += itemTax / 2
        } else {
            existing.igst += itemTax
        }

        map.set(key, existing)
    }

    return Array.from(map.values())
}
