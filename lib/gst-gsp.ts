import type { InvoiceWithDetails } from '@/lib/types'

export interface GspConfigStatus {
    configured: boolean
    mode: 'sandbox' | 'production'
    baseUrl: string
}

export interface IrnGenerationResult {
    success: boolean
    configured: boolean
    irn?: string
    ackNo?: string
    ackDate?: string
    signedQrCode?: string
    ewayBillNo?: string
    error?: string
}

export function getGspConfigStatus(): GspConfigStatus {
    const clientId = process.env.GSP_CLIENT_ID
    const clientSecret = process.env.GSP_CLIENT_SECRET
    const mode = process.env.GSP_MODE === 'production' ? 'production' : 'sandbox'
    const baseUrl =
        process.env.GSP_BASE_URL ||
        (mode === 'production' ? 'https://api.mastergst.com' : 'https://sandbox.mastergst.com')

    return {
        configured: Boolean(clientId && clientSecret),
        mode,
        baseUrl,
    }
}

export function isValidGstin(gstin?: string | null): boolean {
    if (!gstin) return false
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase())
}

/**
 * Server-only GSP adapter for IRP E-Invoicing (/eicore/v1.03/Invoice).
 * Requires GSP_CLIENT_ID and GSP_CLIENT_SECRET in server environment variables.
 */
export async function generateIrnForInvoice(
    invoice: InvoiceWithDetails,
    sellerGstin?: string | null
): Promise<IrnGenerationResult> {
    const cfg = getGspConfigStatus()

    if (!isValidGstin(sellerGstin)) {
        return {
            success: false,
            configured: cfg.configured,
            error: 'Valid 15-character Seller GSTIN is required in Invoice Settings before generating an IRN.',
        }
    }

    if (!isValidGstin(invoice.customer?.gstin)) {
        return {
            success: false,
            configured: cfg.configured,
            error: 'Valid 15-character Buyer GSTIN is required on the customer record for B2B E-Invoicing.',
        }
    }

    if (!cfg.configured) {
        return {
            success: false,
            configured: false,
            error: 'GSP API credentials (GSP_CLIENT_ID & GSP_CLIENT_SECRET) are not configured on the server.',
        }
    }

    try {
        const payload = {
            Version: '1.1',
            TranDtls: { TaxSch: 'GST', SupTyp: 'B2B' },
            DocDtls: {
                Typ: 'INV',
                No: invoice.invoice_number,
                Dt: new Date(invoice.invoice_date).toLocaleDateString('en-GB'),
            },
            SellerDtls: { Gstin: sellerGstin!.trim().toUpperCase() },
            BuyerDtls: { Gstin: invoice.customer!.gstin!.trim().toUpperCase() },
            ValDtls: {
                AssVal: Number(invoice.subtotal || 0),
                CgstVal: Number(invoice.cgst_amount || 0),
                SgstVal: Number(invoice.sgst_amount || 0),
                IgstVal: Number(invoice.igst_amount || 0),
                TotInvVal: Number(invoice.total || 0),
            },
        }

        const res = await fetch(`${cfg.baseUrl}/eicore/v1.03/Invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                client_id: process.env.GSP_CLIENT_ID!,
                client_secret: process.env.GSP_CLIENT_SECRET!,
            },
            body: JSON.stringify(payload),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.Irn) {
            return {
                success: false,
                configured: true,
                error: data?.ErrorDetails?.[0]?.ErrorMessage || data?.message || `GSP returned HTTP ${res.status}`,
            }
        }

        return {
            success: true,
            configured: true,
            irn: data.Irn,
            ackNo: String(data.AckNo || ''),
            ackDate: data.AckDt || new Date().toISOString(),
            signedQrCode: data.SignedQRCode || '',
            ewayBillNo: data.EwbNo ? String(data.EwbNo) : undefined,
        }
    } catch (err) {
        return {
            success: false,
            configured: true,
            error: err instanceof Error ? err.message : 'Failed to connect to GSP IRP endpoint',
        }
    }
}
