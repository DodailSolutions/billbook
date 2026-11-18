'use server'

import { createClient } from '@/lib/supabase/server'
import { getChartOfAccounts } from './bookkeeping-actions'

function sanitizeXml(str: string | null | undefined): string {
    if (!str) return ''
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function formatTallyDate(dateStr: string | null | undefined): string {
    if (!dateStr) {
        const d = new Date()
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    }
    const clean = dateStr.slice(0, 10).replace(/-/g, '')
    return clean.length === 8 ? clean : new Date(dateStr).toISOString().slice(0, 10).replace(/-/g, '')
}

/**
 * Maps standard Chart of Account codes and types to Tally Prime parent group names
 */
function getTallyParentGroup(accountType: string, category: string, code: string): string {
    if (code === '1010') return 'Cash-in-Hand'
    if (code === '1020' || category.toLowerCase().includes('bank')) return 'Bank Accounts'
    if (code === '1100' || category.toLowerCase().includes('receivable')) return 'Sundry Debtors'
    if (code === '1200' || category.toLowerCase().includes('inventory')) return 'Stock-in-Hand'
    if (code === '2010' || category.toLowerCase().includes('payable')) return 'Sundry Creditors'
    if (code === '2020' || category.toLowerCase().includes('tax') || category.toLowerCase().includes('gst')) return 'Duties & Taxes'
    if (code.startsWith('4') || accountType === 'revenue') return 'Sales Accounts'
    if (code === '5010' || category.toLowerCase().includes('direct')) return 'Direct Expenses'
    if (code.startsWith('5') || accountType === 'expense') return 'Indirect Expenses'
    if (accountType === 'equity') return 'Capital Account'
    if (accountType === 'liability') return 'Current Liabilities'
    return 'Current Assets'
}

export interface TallyExportOptions {
    fromDate?: string
    toDate?: string
    includeMasters?: boolean
    includeVouchers?: boolean
}

/**
 * Generates official Tally XML Daybook & Master Envelope compatible with Tally Prime and Tally.ERP 9
 */
export async function generateTallyXml(options: TallyExportOptions = {}): Promise<string> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const {
        fromDate,
        toDate,
        includeMasters = true,
        includeVouchers = true
    } = options

    // 1. Fetch Chart of Accounts
    const accounts = await getChartOfAccounts()

    // 2. Fetch Invoices (Sales Vouchers)
    let invoiceQuery = supabase
        .from('invoices')
        .select(`
            id,
            invoice_number,
            issue_date,
            due_date,
            status,
            total,
            subtotal,
            tax_amount,
            customer:customers(id, name, gstin, state),
            items:invoice_items(id, description, quantity, unit_price, total, tax_rate)
        `)
        .eq('user_id', user.id)

    if (fromDate) invoiceQuery = invoiceQuery.gte('issue_date', fromDate)
    if (toDate) invoiceQuery = invoiceQuery.lte('issue_date', toDate)
    const { data: invoices } = await invoiceQuery.order('issue_date', { ascending: true })

    // 3. Fetch Expenses (Payment Vouchers)
    let expenseQuery = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)

    if (fromDate) expenseQuery = expenseQuery.gte('date', fromDate)
    if (toDate) expenseQuery = expenseQuery.lte('date', toDate)
    const { data: expenses } = await expenseQuery.order('date', { ascending: true })

    // 4. Fetch Purchase Orders (Purchase Vouchers)
    let poQuery = supabase
        .from('purchase_orders')
        .select(`
            id,
            po_number,
            po_date,
            total_amount,
            status,
            vendor:vendors(id, name, gstin)
        `)
        .eq('user_id', user.id)

    if (fromDate) poQuery = poQuery.gte('po_date', fromDate)
    if (toDate) poQuery = poQuery.lte('po_date', toDate)
    const { data: purchaseOrders } = await poQuery.order('po_date', { ascending: true })

    // Build Tally XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters and Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Company</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`

    // ==========================================
    // SECTION 1: MASTERS (Ledgers)
    // ==========================================
    if (includeMasters) {
        // Standard Chart of Account Ledgers
        for (const acc of accounts) {
            const parent = getTallyParentGroup(acc.account_type, acc.category, acc.account_code)
            xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${sanitizeXml(acc.account_name)}" RESERVEDNAME="">
            <NAME.LIST>
              <NAME>${sanitizeXml(acc.account_name)}</NAME>
            </NAME.LIST>
            <PARENT>${sanitizeXml(parent)}</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <AFFECTSSTOCK>No</AFFECTSSTOCK>
            <OPENINGBALANCE>${Number(acc.current_balance || 0).toFixed(2)}</OPENINGBALANCE>
          </LEDGER>
        </TALLYMESSAGE>
`
        }

        // Customer Ledgers (Sundry Debtors)
        const customerNames = new Set<string>()
        if (invoices) {
            for (const inv of invoices) {
                const custName = (inv.customer as any)?.name
                if (custName && !customerNames.has(custName)) {
                    customerNames.add(custName)
                    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${sanitizeXml(custName)}" RESERVEDNAME="">
            <NAME.LIST>
              <NAME>${sanitizeXml(custName)}</NAME>
            </NAME.LIST>
            <PARENT>Sundry Debtors</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <PARTYGSTIN>${sanitizeXml((inv.customer as any)?.gstin || '')}</PARTYGSTIN>
          </LEDGER>
        </TALLYMESSAGE>
`
                }
            }
        }

        // Vendor Ledgers (Sundry Creditors)
        const vendorNames = new Set<string>()
        if (purchaseOrders) {
            for (const po of purchaseOrders) {
                const vendName = (po.vendor as any)?.name
                if (vendName && !vendorNames.has(vendName)) {
                    vendorNames.add(vendName)
                    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${sanitizeXml(vendName)}" RESERVEDNAME="">
            <NAME.LIST>
              <NAME>${sanitizeXml(vendName)}</NAME>
            </NAME.LIST>
            <PARENT>Sundry Creditors</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <PARTYGSTIN>${sanitizeXml((po.vendor as any)?.gstin || '')}</PARTYGSTIN>
          </LEDGER>
        </TALLYMESSAGE>
`
                }
            }
        }
    }

    // ==========================================
    // SECTION 2: VOUCHERS (Sales, Purchases, Payments)
    // ==========================================
    if (includeVouchers) {
        // 1. Sales Vouchers (Invoices)
        if (invoices) {
            for (const inv of invoices) {
                const date = formatTallyDate(inv.issue_date)
                const custName = (inv.customer as any)?.name || 'Cash Sales'
                const total = Number(inv.total || 0)
                const subtotal = Number(inv.subtotal || total)
                const tax = Number(inv.tax_amount || 0)

                xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${date}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${sanitizeXml(inv.invoice_number || inv.id.slice(0, 8))}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${sanitizeXml(custName)}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Invoice View</PERSISTEDVIEW>
            
            <!-- Debit: Customer Account (Gross Total) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${sanitizeXml(custName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Sales Revenue (Subtotal) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Revenue</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${subtotal.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`
                // Credit: GST Payable (if applicable)
                if (tax > 0) {
                    xml += `            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>GST Payable</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tax.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`
                }

                xml += `          </VOUCHER>
        </TALLYMESSAGE>
`
            }
        }

        // 2. Purchase Vouchers (Purchase Orders)
        if (purchaseOrders) {
            for (const po of purchaseOrders) {
                const date = formatTallyDate(po.po_date)
                const vendName = (po.vendor as any)?.name || 'Cash Purchase'
                const total = Number(po.total_amount || 0)

                if (total > 0) {
                    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create">
            <DATE>${date}</DATE>
            <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${sanitizeXml(po.po_number || po.id.slice(0, 8))}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${sanitizeXml(vendName)}</PARTYLEDGERNAME>
            
            <!-- Debit: Inventory Asset / Cost of Goods Sold -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Merchandise Inventory</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Accounts Payable (Vendor) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${sanitizeXml(vendName)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${total.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`
                }
            }
        }

        // 3. Payment Vouchers (Expenses)
        if (expenses) {
            for (const exp of expenses) {
                const date = formatTallyDate(exp.date)
                const amount = Number(exp.amount || 0)
                const category = exp.category || 'Miscellaneous Expense'
                const paymentMethod = exp.payment_method?.toLowerCase().includes('cash') ? 'Cash on Hand' : 'Bank Operating Account'

                if (amount > 0) {
                    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Payment" ACTION="Create">
            <DATE>${date}</DATE>
            <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
            <NARRATION>${sanitizeXml(exp.description || category)}</NARRATION>
            
            <!-- Debit: Expense Account -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${sanitizeXml(category)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Bank / Cash -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${sanitizeXml(paymentMethod)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`
                }
            }
        }
    }

    xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`

    return xml
}
