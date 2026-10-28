'use server'

import { createClient } from '@/lib/supabase/server'

export interface ReportKPIs {
    totalRevenue: number
    totalTaxable: number
    totalGST: number
    cgst: number
    sgst: number
    igst: number
    totalPaid: number
    totalPending: number
    totalOverdue: number
    totalInvoices: number
    paidCount: number
    pendingCount: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
}

export interface GSTInvoiceRow {
    id: string
    invoiceNumber: string
    date: string
    dueDate?: string
    customerName: string
    customerGstin: string
    customerPhone?: string
    customerEmail?: string
    supplyType: 'intra-state' | 'inter-state'
    subtotal: number
    cgst: number
    sgst: number
    igst: number
    total: number
    reverseCharge: boolean
    status: string
    amountPaid: number
    amountRemaining: number
}

export interface AgingCustomer {
    id: string
    name: string
    phone?: string
    email?: string
    gstin?: string
    invoiceCount: number
    totalBilled: number
    totalPaid: number
    totalPending: number
    oldestDueDays: number
    agingCategory: 'Current' | '1-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days'
}

export interface ItemSalesRow {
    name: string
    hsn: string
    quantity: number
    totalRevenue: number
    avgUnitPrice: number
    taxAmount: number
}

export interface ExpenseCategoryRow {
    categoryName: string
    amount: number
    percentage: number
    count: number
}

export interface ComprehensiveReportsPayload {
    startDate: string
    endDate: string
    kpis: ReportKPIs
    gstSummary: {
        b2b: { count: number; taxable: number; tax: number; total: number }
        b2c: { count: number; taxable: number; tax: number; total: number }
        intraStateTotal: number
        interStateTotal: number
        reverseChargeCount: number
        reverseChargeTotal: number
    }
    invoices: GSTInvoiceRow[]
    aging: {
        buckets: {
            current: number
            days1to30: number
            days31to60: number
            days61to90: number
            days90Plus: number
        }
        customers: AgingCustomer[]
    }
    items: ItemSalesRow[]
    expenses: {
        total: number
        categories: ExpenseCategoryRow[]
    }
    company: {
        name: string
        gstin: string
        address: string
        email: string
        phone: string
    }
}

export async function getComprehensiveReportsData(
    startDate: string,
    endDate: string
): Promise<{ success: boolean; data?: ComprehensiveReportsPayload; error?: string }> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Fetch company settings
        const { data: settings } = await supabase
            .from('invoice_settings')
            .select('company_name, company_gstin, company_address, company_phone, company_email')
            .eq('user_id', user.id)
            .maybeSingle()

        // Fetch invoices in date range
        const { data: rawInvoices, error: invError } = await supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(*),
                invoice_items(*)
            `)
            .eq('user_id', user.id)
            .gte('invoice_date', startDate)
            .lte('invoice_date', endDate)
            .order('invoice_date', { ascending: false })

        if (invError) {
            console.error('Error fetching invoices for report:', invError)
            return { success: false, error: 'Failed to fetch invoices' }
        }

        // Fetch expenses in date range
        let rawExpenses: Array<{
            id: string
            amount: number
            tax_amount?: number
            expense_categories?: { category_name?: string } | null
        }> = []

        try {
            const { data: expensesData } = await supabase
                .from('expenses')
                .select(`
                    id,
                    amount,
                    tax_amount,
                    expense_categories(category_name)
                `)
                .eq('user_id', user.id)
                .gte('expense_date', startDate)
                .lte('expense_date', endDate)

            if (expensesData) {
                rawExpenses = expensesData as unknown as typeof rawExpenses
            }
        } catch {
            // Expenses table might be optional or have no records
            rawExpenses = []
        }

        const invoicesList = rawInvoices || []

        // KPIs calculation
        let totalRevenue = 0
        let totalTaxable = 0
        let totalGST = 0
        let cgst = 0
        let sgst = 0
        let igst = 0
        let totalPaid = 0
        let totalPending = 0
        let totalOverdue = 0
        let paidCount = 0
        let pendingCount = 0

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // GST summary accumulators
        let b2bCount = 0
        let b2bTaxable = 0
        let b2bTax = 0
        let b2bTotal = 0

        let b2cCount = 0
        let b2cTaxable = 0
        let b2cTax = 0
        let b2cTotal = 0

        let intraStateTotal = 0
        let interStateTotal = 0
        let reverseChargeCount = 0
        let reverseChargeTotal = 0

        // Customers map for Aging & Receivables
        const customerMap = new Map<string, {
            id: string
            name: string
            phone?: string
            email?: string
            gstin?: string
            invoiceCount: number
            totalBilled: number
            totalPaid: number
            totalPending: number
            oldestDueDays: number
        }>()

        // Items map
        const itemMap = new Map<string, {
            name: string
            hsn: string
            quantity: number
            totalRevenue: number
            taxAmount: number
        }>()

        // Aging buckets
        let bucketCurrent = 0
        let bucket1to30 = 0
        let bucket31to60 = 0
        let bucket61to90 = 0
        let bucket90Plus = 0

        const mappedInvoices: GSTInvoiceRow[] = invoicesList.map(inv => {
            const invTotal = Number(inv.total || 0)
            const invSubtotal = Number(inv.subtotal || 0)
            const invCgst = Number(inv.cgst_amount || 0)
            const invSgst = Number(inv.sgst_amount || 0)
            const invIgst = Number(inv.igst_amount || 0)
            const invGst = invCgst + invSgst + invIgst || Number(inv.gst_amount || 0)

            totalRevenue += invTotal
            totalTaxable += invSubtotal
            totalGST += invGst
            cgst += invCgst
            sgst += invSgst
            igst += invIgst

            const isPaid = inv.status === 'paid'
            const isPartial = inv.status === 'partial'
            const isPending = inv.status === 'pending' || inv.status === 'sent' || isPartial

            const paidAmt = isPaid ? invTotal : Number(inv.amount_paid || 0)
            const remAmt = isPaid ? 0 : (inv.amount_remaining !== undefined && inv.amount_remaining !== null ? Number(inv.amount_remaining) : (invTotal - paidAmt))

            totalPaid += paidAmt
            totalPending += remAmt

            if (isPaid) {
                paidCount++
            } else {
                pendingCount++
            }

            // Check if overdue
            let daysOverdue = 0
            if (inv.due_date && isPending) {
                const dueDate = new Date(inv.due_date)
                dueDate.setHours(0, 0, 0, 0)
                if (today > dueDate) {
                    const diffTime = Math.abs(today.getTime() - dueDate.getTime())
                    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    totalOverdue += remAmt

                    if (daysOverdue <= 30) bucket1to30 += remAmt
                    else if (daysOverdue <= 60) bucket31to60 += remAmt
                    else if (daysOverdue <= 90) bucket61to90 += remAmt
                    else bucket90Plus += remAmt
                } else {
                    bucketCurrent += remAmt
                }
            } else if (isPending) {
                bucketCurrent += remAmt
            }

            // Supply Type & GST classification
            const supplyType: 'intra-state' | 'inter-state' = inv.supply_type || (invIgst > 0 ? 'inter-state' : 'intra-state')

            if (supplyType === 'intra-state') {
                intraStateTotal += invTotal
            } else {
                interStateTotal += invTotal
            }

            const hasGstin = Boolean(inv.customer?.gstin && inv.customer.gstin.trim() !== '')

            if (hasGstin) {
                b2bCount++
                b2bTaxable += invSubtotal
                b2bTax += invGst
                b2bTotal += invTotal
            } else {
                b2cCount++
                b2cTaxable += invSubtotal
                b2cTax += invGst
                b2cTotal += invTotal
            }

            if (inv.reverse_charge_applicable) {
                reverseChargeCount++
                reverseChargeTotal += invTotal
            }

            // Customer aggregation
            const custId = inv.customer_id || 'unknown'
            const custName = inv.customer?.name || 'Walk-in Customer'

            if (!customerMap.has(custId)) {
                customerMap.set(custId, {
                    id: custId,
                    name: custName,
                    phone: inv.customer?.phone || undefined,
                    email: inv.customer?.email || undefined,
                    gstin: inv.customer?.gstin || undefined,
                    invoiceCount: 0,
                    totalBilled: 0,
                    totalPaid: 0,
                    totalPending: 0,
                    oldestDueDays: 0
                })
            }

            const cData = customerMap.get(custId)!
            cData.invoiceCount++
            cData.totalBilled += invTotal
            cData.totalPaid += paidAmt
            cData.totalPending += remAmt
            if (daysOverdue > cData.oldestDueDays) {
                cData.oldestDueDays = daysOverdue
            }

            // Items aggregation
            if (Array.isArray(inv.invoice_items)) {
                inv.invoice_items.forEach((item: {
                    description?: string
                    hsn_sac_code?: string
                    quantity?: number
                    amount?: number
                    item_tax_amount?: number
                }) => {
                    const itemName = item.description?.trim() || 'General Item / Service'
                    const hsn = item.hsn_sac_code || 'N/A'
                    const key = `${itemName}__${hsn}`
                    const qty = Number(item.quantity || 1)
                    const amt = Number(item.amount || 0)
                    const tax = Number(item.item_tax_amount || 0)

                    if (!itemMap.has(key)) {
                        itemMap.set(key, {
                            name: itemName,
                            hsn: hsn,
                            quantity: 0,
                            totalRevenue: 0,
                            taxAmount: 0
                        })
                    }

                    const itemData = itemMap.get(key)!
                    itemData.quantity += qty
                    itemData.totalRevenue += amt
                    itemData.taxAmount += tax
                })
            }

            return {
                id: inv.id,
                invoiceNumber: inv.invoice_number,
                date: inv.invoice_date,
                dueDate: inv.due_date,
                customerName: custName,
                customerGstin: inv.customer?.gstin || 'Unregistered',
                customerPhone: inv.customer?.phone,
                customerEmail: inv.customer?.email,
                supplyType: supplyType,
                subtotal: invSubtotal,
                cgst: invCgst,
                sgst: invSgst,
                igst: invIgst,
                total: invTotal,
                reverseCharge: Boolean(inv.reverse_charge_applicable),
                status: inv.status,
                amountPaid: paidAmt,
                amountRemaining: remAmt
            }
        })

        // Process customer aging list
        const agingCustomers: AgingCustomer[] = Array.from(customerMap.values())
            .map(c => {
                let category: AgingCustomer['agingCategory'] = 'Current'
                if (c.oldestDueDays > 90) category = '90+ Days'
                else if (c.oldestDueDays > 60) category = '61-90 Days'
                else if (c.oldestDueDays > 30) category = '31-60 Days'
                else if (c.oldestDueDays > 0) category = '1-30 Days'

                return {
                    ...c,
                    agingCategory: category
                }
            })
            .sort((a, b) => b.totalPending - a.totalPending)

        // Process items list
        const itemsList: ItemSalesRow[] = Array.from(itemMap.values())
            .map(it => ({
                ...it,
                avgUnitPrice: it.quantity > 0 ? it.totalRevenue / it.quantity : it.totalRevenue
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)

        // Process expenses
        let totalExpenses = 0
        const expenseCategoryMap = new Map<string, { amount: number; count: number }>()

        rawExpenses.forEach(exp => {
            const amt = Number(exp.amount || 0)
            totalExpenses += amt
            const catName = exp.expense_categories?.category_name || 'General Operations'

            const current = expenseCategoryMap.get(catName) || { amount: 0, count: 0 }
            expenseCategoryMap.set(catName, {
                amount: current.amount + amt,
                count: current.count + 1
            })
        })

        const expenseCategories: ExpenseCategoryRow[] = Array.from(expenseCategoryMap.entries())
            .map(([categoryName, stats]) => ({
                categoryName,
                amount: stats.amount,
                count: stats.count,
                percentage: totalExpenses > 0 ? (stats.amount / totalExpenses) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount)

        const netProfit = totalRevenue - totalExpenses
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

        const kpis: ReportKPIs = {
            totalRevenue,
            totalTaxable,
            totalGST,
            cgst,
            sgst,
            igst,
            totalPaid,
            totalPending,
            totalOverdue,
            totalInvoices: invoicesList.length,
            paidCount,
            pendingCount,
            totalExpenses,
            netProfit,
            profitMargin
        }

        const payload: ComprehensiveReportsPayload = {
            startDate,
            endDate,
            kpis,
            gstSummary: {
                b2b: { count: b2bCount, taxable: b2bTaxable, tax: b2bTax, total: b2bTotal },
                b2c: { count: b2cCount, taxable: b2cTaxable, tax: b2cTax, total: b2cTotal },
                intraStateTotal,
                interStateTotal,
                reverseChargeCount,
                reverseChargeTotal
            },
            invoices: mappedInvoices,
            aging: {
                buckets: {
                    current: bucketCurrent,
                    days1to30: bucket1to30,
                    days31to60: bucket31to60,
                    days61to90: bucket61to90,
                    days90Plus: bucket90Plus
                },
                customers: agingCustomers
            },
            items: itemsList,
            expenses: {
                total: totalExpenses,
                categories: expenseCategories
            },
            company: {
                name: settings?.company_name || 'My Business',
                gstin: settings?.company_gstin || '',
                address: settings?.company_address || '',
                email: settings?.company_email || user.email || '',
                phone: settings?.company_phone || ''
            }
        }

        return { success: true, data: payload }
    } catch (err: unknown) {
        console.error('getComprehensiveReportsData error:', err)
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error generating report' }
    }
}
