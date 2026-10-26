import { SupabaseClient } from '@supabase/supabase-js'

export interface BusinessProfileContext {
  businessName: string
  ownerName: string
  businessEmail: string
  businessPhone: string
  gstin: string
  businessType: string
  businessAddress: string
}

export interface DebtorItem {
  customerId: string
  customerName: string
  phone: string
  email: string
  unpaidCount: number
  totalOwed: number
  oldestInvoiceDate: string
}

export interface LowStockItem {
  id: string
  name: string
  sku: string
  currentStock: number
  reorderLevel: number
  unit: string
  purchasePrice: number
  sellingPrice: number
  deficit: number
}

export interface BusinessERPContext {
  profile: BusinessProfileContext
  metrics: {
    totalRevenue: number
    paidRevenue: number
    unpaidRevenue: number
    overdueRevenue: number
    totalExpenses: number
    netOperatingSurplus: number
    operatingMarginPct: number
    collectionEfficiencyPct: number
    invoiceCount: number
    paidInvoiceCount: number
    unpaidInvoiceCount: number
    overdueInvoiceCount: number
    customerCount: number
    activeEmployeeCount: number
    totalInventoryValue: number
    inventorySkuCount: number
    lowStockCount: number
    openPOCount: number
    openPOAmount: number
    crmLeadsCount: number
    crmPipelineValue: number
    gstTaxCollected: {
      cgst: number
      sgst: number
      igst: number
      total: number
    }
  }
  debtors: DebtorItem[]
  lowStockItems: LowStockItem[]
  recentInvoices: Array<{
    invoiceNumber: string
    customerName: string
    total: number
    status: string
    dueDate: string
    createdAt: string
  }>
  recentExpenses: Array<{
    amount: number
    category: string
    expenseType: string
    payeeName: string
    date: string
  }>
  recentPOs: Array<{
    poNumber: string
    vendorName: string
    amount: number
    status: string
    date: string
  }>
  accountsSummary: {
    totalAssets: number
    totalLiabilities: number
    totalEquity: number
    totalRevenueAccounts: number
    totalExpenseAccounts: number
  }
}

/**
 * Robustly fetches and calculates full ERP context unique to the authenticated business tenant
 */
export async function fetchBusinessERPContext(
  supabase: SupabaseClient,
  userId: string
): Promise<BusinessERPContext> {
  // 1. Business Profile
  let profile: BusinessProfileContext = {
    businessName: 'My Business',
    ownerName: '',
    businessEmail: '',
    businessPhone: '',
    gstin: '',
    businessType: 'General Enterprise',
    businessAddress: ''
  }

  try {
    const { data: p } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (p) {
      profile = {
        businessName: p.business_name || p.company_name || 'My Business',
        ownerName: p.owner_name || p.full_name || '',
        businessEmail: p.business_email || p.email || '',
        businessPhone: p.business_phone || p.phone || '',
        gstin: p.gstin || '',
        businessType: p.business_type || 'General Enterprise',
        businessAddress: p.business_address || p.address || ''
      }
    }
  } catch (err) {
    console.warn('Error fetching user profile for ERP RAG:', err)
  }

  // 2. Customers
  let customersMap = new Map<string, { name: string; phone: string; email: string }>()
  let customerCount = 0
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, phone, email')
      .eq('user_id', userId)

    if (customers) {
      customerCount = customers.length
      for (const c of customers) {
        customersMap.set(c.id, {
          name: c.name || 'Unnamed Customer',
          phone: c.phone || '',
          email: c.email || ''
        })
      }
    }
  } catch (err) {
    console.warn('Error fetching customers for ERP RAG:', err)
  }

  // 3. Invoices & Receivables
  let totalRevenue = 0
  let paidRevenue = 0
  let unpaidRevenue = 0
  let overdueRevenue = 0
  let paidInvoiceCount = 0
  let unpaidInvoiceCount = 0
  let overdueInvoiceCount = 0
  let invoiceCount = 0

  let cgstTotal = 0
  let sgstTotal = 0
  let igstTotal = 0

  const debtorsMap = new Map<string, {
    customerId: string
    customerName: string
    phone: string
    email: string
    unpaidCount: number
    totalOwed: number
    oldestInvoiceDate: string
  }>()

  let recentInvoices: BusinessERPContext['recentInvoices'] = []

  try {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, total, status, due_date, created_at, customer_id, cgst_amount, sgst_amount, igst_amount')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (invoices) {
      invoiceCount = invoices.length
      const now = new Date()

      for (const inv of invoices) {
        const invTotal = Number(inv.total) || 0
        totalRevenue += invTotal

        cgstTotal += Number(inv.cgst_amount) || 0
        sgstTotal += Number(inv.sgst_amount) || 0
        igstTotal += Number(inv.igst_amount) || 0

        const status = (inv.status || '').toLowerCase()
        const dueDate = inv.due_date ? new Date(inv.due_date) : null
        const isOverdue = status === 'overdue' || (status === 'unpaid' && dueDate && dueDate < now)

        if (status === 'paid') {
          paidRevenue += invTotal
          paidInvoiceCount++
        } else {
          unpaidRevenue += invTotal
          unpaidInvoiceCount++
          if (isOverdue) {
            overdueRevenue += invTotal
            overdueInvoiceCount++
          }

          // Debtor aggregation
          const custId = inv.customer_id || 'unknown'
          const custInfo = customersMap.get(custId) || {
            name: 'Direct Customer',
            phone: '',
            email: ''
          }

          const existing = debtorsMap.get(custId)
          if (existing) {
            existing.unpaidCount++
            existing.totalOwed += invTotal
            if (inv.created_at && (!existing.oldestInvoiceDate || inv.created_at < existing.oldestInvoiceDate)) {
              existing.oldestInvoiceDate = inv.created_at
            }
          } else {
            debtorsMap.set(custId, {
              customerId: custId,
              customerName: custInfo.name,
              phone: custInfo.phone,
              email: custInfo.email,
              unpaidCount: 1,
              totalOwed: invTotal,
              oldestInvoiceDate: inv.created_at || new Date().toISOString()
            })
          }
        }
      }

      recentInvoices = invoices.slice(0, 10).map(inv => {
        const custInfo = customersMap.get(inv.customer_id)
        return {
          invoiceNumber: inv.invoice_number || 'N/A',
          customerName: custInfo?.name || 'Customer',
          total: Number(inv.total) || 0,
          status: inv.status || 'draft',
          dueDate: inv.due_date || '',
          createdAt: inv.created_at || ''
        }
      })
    }
  } catch (err) {
    console.warn('Error fetching invoices for ERP RAG:', err)
  }

  // Sorted debtors by highest owed
  const debtors: DebtorItem[] = Array.from(debtorsMap.values())
    .sort((a, b) => b.totalOwed - a.totalOwed)
    .slice(0, 10)

  // 4. Expenses
  let totalExpenses = 0
  let recentExpenses: BusinessERPContext['recentExpenses'] = []
  try {
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, expense_date, expense_type, payee_name, expense_category_id, category:expense_category_id (name)')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false })

    if (expenses) {
      for (const exp of expenses) {
        totalExpenses += Number(exp.amount) || 0
      }
      recentExpenses = expenses.slice(0, 10).map(exp => ({
        amount: Number(exp.amount) || 0,
        category: (exp.category as any)?.name || 'General Expense',
        expenseType: exp.expense_type || 'other',
        payeeName: exp.payee_name || 'N/A',
        date: exp.expense_date || ''
      }))
    }
  } catch (err) {
    console.warn('Error fetching expenses for ERP RAG:', err)
  }

  // 5. Inventory & Stock Health
  let totalInventoryValue = 0
  let inventorySkuCount = 0
  let lowStockItems: LowStockItem[] = []

  try {
    const { data: items } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)

    if (items) {
      inventorySkuCount = items.length
      for (const item of items) {
        const name = item.name || item.item_name || 'Unnamed Item'
        const sku = item.sku || item.item_code || ''
        const unit = item.unit || item.unit_of_measurement || 'pcs'
        const currentStock = Number(item.current_stock ?? item.quantity_on_hand ?? 0)
        const reorderLevel = Number(item.reorder_level ?? item.reorder_point ?? item.minimum_stock_level ?? 0)
        const purchasePrice = Number(item.purchase_price ?? 0)
        const sellingPrice = Number(item.selling_price ?? 0)

        totalInventoryValue += currentStock * (purchasePrice || sellingPrice)

        if (currentStock <= reorderLevel && reorderLevel > 0) {
          lowStockItems.push({
            id: item.id,
            name,
            sku,
            currentStock,
            reorderLevel,
            unit,
            purchasePrice,
            sellingPrice,
            deficit: reorderLevel - currentStock
          })
        }
      }
      lowStockItems.sort((a, b) => b.deficit - a.deficit)
    }
  } catch (err) {
    console.warn('Error fetching inventory for ERP RAG:', err)
  }

  // 6. Purchase Orders (AP Commitments)
  let openPOCount = 0
  let openPOAmount = 0
  let recentPOs: BusinessERPContext['recentPOs'] = []

  try {
    const { data: pos } = await supabase
      .from('purchase_orders')
      .select('po_number, vendor_name, total_amount, approval_status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (pos) {
      for (const po of pos) {
        const amt = Number(po.total_amount) || 0
        const status = (po.approval_status || '').toLowerCase()
        if (status === 'pending' || status === 'approved' || status === 'issued') {
          openPOCount++
          openPOAmount += amt
        }
      }
      recentPOs = pos.slice(0, 10).map(po => ({
        poNumber: po.po_number || 'N/A',
        vendorName: po.vendor_name || 'Vendor',
        amount: Number(po.total_amount) || 0,
        status: po.approval_status || 'pending',
        date: po.created_at || ''
      }))
    }
  } catch (err) {
    console.warn('Error fetching purchase orders for ERP RAG:', err)
  }

  // 7. Employees / Payroll
  let activeEmployeeCount = 0
  try {
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    activeEmployeeCount = count || 0
  } catch (err) {
    console.warn('Error fetching employees for ERP RAG:', err)
  }

  // 8. CRM Leads
  let crmLeadsCount = 0
  let crmPipelineValue = 0
  try {
    const { data: leads } = await supabase
      .from('crm_leads')
      .select('value, stage')
      .eq('user_id', userId)

    if (leads) {
      crmLeadsCount = leads.length
      for (const lead of leads) {
        if (lead.stage !== 'lost' && lead.stage !== 'won') {
          crmPipelineValue += Number(lead.value) || 0
        }
      }
    }
  } catch {
    // CRM table may be optional
  }

  // 9. Chart of Accounts summary
  let accountsSummary = {
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalRevenueAccounts: 0,
    totalExpenseAccounts: 0
  }

  try {
    const { data: coa } = await supabase
      .from('chart_of_accounts')
      .select('account_type, current_balance')
      .eq('user_id', userId)

    if (coa) {
      for (const acc of coa) {
        const bal = Number(acc.current_balance) || 0
        const type = (acc.account_type || '').toLowerCase()
        if (type === 'asset') accountsSummary.totalAssets += bal
        else if (type === 'liability') accountsSummary.totalLiabilities += bal
        else if (type === 'equity') accountsSummary.totalEquity += bal
        else if (type === 'revenue') accountsSummary.totalRevenueAccounts += bal
        else if (type === 'expense') accountsSummary.totalExpenseAccounts += bal
      }
    }
  } catch {
    // CoA table optional
  }

  // Aggregated KPIs
  const netOperatingSurplus = totalRevenue - totalExpenses
  const operatingMarginPct = totalRevenue > 0 ? (netOperatingSurplus / totalRevenue) * 100 : 0
  const collectionEfficiencyPct = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0

  return {
    profile,
    metrics: {
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      overdueRevenue,
      totalExpenses,
      netOperatingSurplus,
      operatingMarginPct,
      collectionEfficiencyPct,
      invoiceCount,
      paidInvoiceCount,
      unpaidInvoiceCount,
      overdueInvoiceCount,
      customerCount,
      activeEmployeeCount,
      totalInventoryValue,
      inventorySkuCount,
      lowStockCount: lowStockItems.length,
      openPOCount,
      openPOAmount,
      crmLeadsCount,
      crmPipelineValue,
      gstTaxCollected: {
        cgst: cgstTotal,
        sgst: sgstTotal,
        igst: igstTotal,
        total: cgstTotal + sgstTotal + igstTotal
      }
    },
    debtors,
    lowStockItems: lowStockItems.slice(0, 10),
    recentInvoices,
    recentExpenses,
    recentPOs,
    accountsSummary
  }
}

/**
 * Builds an ERP-ready system instruction prompt grounded in the live business context
 */
export function buildPersonalRAGPrompt(
  ctx: BusinessERPContext,
  query: string,
  history: Array<{ role: string; content: string }>
): string {
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const debtorSection = ctx.debtors.length > 0
    ? ctx.debtors.map((d, i) => `${i + 1}. ${d.customerName} owes ${formatINR(d.totalOwed)} across ${d.unpaidCount} invoice(s) (Contact: ${d.phone || d.email || 'None on file'})`).join('\n')
    : 'No outstanding debtor balances recorded.'

  const lowStockSection = ctx.lowStockItems.length > 0
    ? ctx.lowStockItems.map((item, i) => `${i + 1}. [${item.sku || 'No SKU'}] ${item.name}: In Stock: ${item.currentStock} ${item.unit} (Reorder trigger: ${item.reorderLevel} ${item.unit}, Deficit: -${item.deficit} ${item.unit}, Unit Cost: ${formatINR(item.purchasePrice)})`).join('\n')
    : 'All inventory items are above their minimum reorder thresholds.'

  const recentInvoicesSection = ctx.recentInvoices.length > 0
    ? ctx.recentInvoices.map(inv => `- #${inv.invoiceNumber} | ${inv.customerName} | ${formatINR(inv.total)} | Status: ${inv.status.toUpperCase()} | Due: ${inv.dueDate || 'Immediate'}`).join('\n')
    : 'No recent invoices available.'

  const recentExpensesSection = ctx.recentExpenses.length > 0
    ? ctx.recentExpenses.map(exp => `- ${formatINR(exp.amount)} | Category: ${exp.category} | Payee: ${exp.payeeName} | Mode: ${exp.expenseType} | Date: ${exp.date}`).join('\n')
    : 'No recent expenses recorded.'

  const posSection = ctx.recentPOs.length > 0
    ? ctx.recentPOs.map(po => `- PO #${po.poNumber} | Vendor: ${po.vendorName} | ${formatINR(po.amount)} | Status: ${po.status.toUpperCase()}`).join('\n')
    : 'No active purchase orders.'

  return `You are the dedicated Senior Chief Financial Officer (CFO) and Enterprise AI Controller for "${ctx.profile.businessName}".
Your role is to provide precise, actionable, and executive-level financial analysis, bookkeeping guidance, working capital optimization, and ERP operational support.

ENTERPRISE BUSINESS IDENTITY:
- Business Legal / Operating Name: ${ctx.profile.businessName}
- Principal Owner / Director: ${ctx.profile.ownerName || 'Business Owner'}
- GSTIN: ${ctx.profile.gstin || 'Not configured'}
- Industry / Business Type: ${ctx.profile.businessType}
- Address: ${ctx.profile.businessAddress || 'Not specified'}

LIVE FINANCIAL AUDIT & EXECUTIVE DASHBOARD:
1. Sales & Revenue:
   - Gross Revenue: ${formatINR(ctx.metrics.totalRevenue)} (${ctx.metrics.invoiceCount} invoices)
   - Realized / Paid Revenue: ${formatINR(ctx.metrics.paidRevenue)} (${ctx.metrics.paidInvoiceCount} invoices)
   - Outstanding Receivables (AR): ${formatINR(ctx.metrics.unpaidRevenue)} (${ctx.metrics.unpaidInvoiceCount} pending invoices)
   - Critical Overdue Receivables: ${formatINR(ctx.metrics.overdueRevenue)} (${ctx.metrics.overdueInvoiceCount} invoices past due date)
   - Collection Efficiency: ${ctx.metrics.collectionEfficiencyPct.toFixed(1)}%

2. Outflows & Profitability:
   - Total Recorded Expenses: ${formatINR(ctx.metrics.totalExpenses)}
   - Net Operating Surplus / Cash Margin: ${formatINR(ctx.metrics.netOperatingSurplus)}
   - Operating Margin: ${ctx.metrics.operatingMarginPct.toFixed(1)}%

3. Supply Chain & Inventory:
   - Total Tracked SKUs: ${ctx.metrics.inventorySkuCount}
   - Estimated Inventory Asset Value: ${formatINR(ctx.metrics.totalInventoryValue)}
   - SKUs at or below Reorder Trigger: ${ctx.metrics.lowStockCount}

4. Accounts Payable & Procurement:
   - Open Purchase Orders: ${ctx.metrics.openPOCount} orders totaling ${formatINR(ctx.metrics.openPOAmount)}

5. Tax & GST Compliance:
   - Total CGST Collected: ${formatINR(ctx.metrics.gstTaxCollected.cgst)}
   - Total SGST Collected: ${formatINR(ctx.metrics.gstTaxCollected.sgst)}
   - Total IGST Collected: ${formatINR(ctx.metrics.gstTaxCollected.igst)}
   - Gross Tax Liability Pool: ${formatINR(ctx.metrics.gstTaxCollected.total)}

6. Organization & Human Capital:
   - Active Employees: ${ctx.metrics.activeEmployeeCount}
   - Active Customer Accounts: ${ctx.metrics.customerCount}
   - CRM Pipeline Value: ${formatINR(ctx.metrics.crmPipelineValue)} across ${ctx.metrics.crmLeadsCount} active lead(s)

CRITICAL REAL-TIME ERP LEDGERS & RETRIEVED CHUNKS:
[TOP ACCOUNTS RECEIVABLE DEBTORS]:
${debtorSection}

[INVENTORY REORDER ALERTS]:
${lowStockSection}

[RECENT INVOICE TRANSACTIONS]:
${recentInvoicesSection}

[RECENT EXPENSES]:
${recentExpensesSection}

[RECENT PURCHASE ORDERS]:
${posSection}

OPERATING MANDATES & RULES:
1. Strict Multi-Tenant Isolation: You are speaking STRICTLY and SOLELY about "${ctx.profile.businessName}". Never speculate about other accounts.
2. Grounded Figures: Quote the exact real rupee figures from the retrieved context. Never invent imaginary invoice numbers, customer names, or amounts.
3. Indian Currency: Always format money in Indian Rupees (${formatINR(0).slice(0, 1)}).
4. Direct Executive Insights: Give structured answers with bold headings, bullet points, and prioritized action steps (Immediate, Short-term, Strategic).
5. If user asks for general advice, apply it directly to their specific numbers (e.g. if they ask how to improve cash flow, reference their exact unpaid receivables of ${formatINR(ctx.metrics.unpaidRevenue)} and the specific top debtors).`
}

/**
 * Built-in Local ERP RAG Reasoning Engine.
 * Executes offline/deterministic financial calculations and contextual reasoning
 * when external cloud LLM APIs are not configured or are unreachable.
 */
export function executeLocalERPRAGReasoning(
  ctx: BusinessERPContext,
  query: string
): string {
  const q = query.toLowerCase()
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // 1. Receivables & Debtors / Unpaid Invoices
  if (
    q.includes('debtor') ||
    q.includes('who owes') ||
    q.includes('unpaid') ||
    q.includes('receivable') ||
    q.includes('pending payment') ||
    q.includes('overdue') ||
    q.includes('collect')
  ) {
    if (ctx.metrics.unpaidRevenue === 0) {
      return `### 🟢 Accounts Receivable Health: Pristine

**${ctx.profile.businessName}** currently has **zero outstanding invoices**.

- **Total Invoices**: ${ctx.metrics.invoiceCount}
- **Realized Collections**: ${formatINR(ctx.metrics.paidRevenue)} (100% collection efficiency)
- **Overdue Risk**: ₹0.00

#### 💡 CFO Recommendations:
1. **Maintain Momentum**: Continue prompt invoicing right after fulfillment.
2. **Early Payment Incentives**: For new clients, maintain standard terms (e.g., Net 15).
3. **Working Capital Utilization**: Surplus collections can be deployed into fast-moving inventory or short-term yield accounts.`
    }

    const debtorList = ctx.debtors.length > 0
      ? ctx.debtors.map((d, i) => `| ${i + 1} | **${d.customerName}** | ${formatINR(d.totalOwed)} | ${d.unpaidCount} | ${d.phone || d.email || 'N/A'} |`).join('\n')
      : 'No detailed debtor rows found.'

    return `### ⚠️ Accounts Receivable (AR) & Debtors Audit for ${ctx.profile.businessName}

Your business currently has **${formatINR(ctx.metrics.unpaidRevenue)}** locked in unpaid invoices across **${ctx.metrics.unpaidInvoiceCount} pending invoice(s)**.
${ctx.metrics.overdueRevenue > 0 ? `🚨 **Critical Alert:** ${formatINR(ctx.metrics.overdueRevenue)} is already past due date!` : '✅ No invoices have breached their final due date yet.'}

#### 📋 Top Outstanding Debtors Breakdown:
| # | Customer Name | Amount Owed | Pending Bills | Contact |
|---|---|---|---|---|
${debtorList}

#### 🎯 Action Plan to Accelerate Cash Flow:
1. **Immediate Demand Notice**: Contact the top debtor (**${ctx.debtors[0]?.customerName || 'Top Customer'}**) regarding **${formatINR(ctx.debtors[0]?.totalOwed || 0)}**.
2. **Automated WhatsApp / Email Follow-ups**: Send payment links directly via BillBooky's invoice delivery.
3. **Hold Credit Terms**: Temporarily pause issuing credit or new deliverables to accounts with overdue balances until accounts are normalized.`
  }

  // 2. Inventory / Stock / Reorder alerts
  if (
    q.includes('stock') ||
    q.includes('inventory') ||
    q.includes('reorder') ||
    q.includes('item') ||
    q.includes('sku') ||
    q.includes('warehouse') ||
    q.includes('supply')
  ) {
    if (ctx.metrics.inventorySkuCount === 0) {
      return `### 📦 Inventory Status for ${ctx.profile.businessName}

No inventory items are currently tracked in your BillBooky ERP catalog.

#### 🚀 Getting Started:
1. Navigate to **Inventory** in the sidebar.
2. Add your product items, SKUs, initial stock quantities, and minimum reorder triggers.
3. Once configured, I will automatically monitor your warehouse levels and alert you before stock runs out.`
    }

    if (ctx.lowStockItems.length === 0) {
      return `### 🟢 Inventory & Stock Health: Optimal

All **${ctx.metrics.inventorySkuCount} SKU(s)** in your catalog are currently stocked above their minimum safety thresholds.

- **Total Catalog SKUs**: ${ctx.metrics.inventorySkuCount}
- **Total Estimated Stock Valuation**: ${formatINR(ctx.metrics.totalInventoryValue)}
- **Low Stock Alerts**: 0 items

#### 💡 Inventory Best Practices:
- Keep reorder points updated as sales velocity shifts during high seasons.
- Review slow-moving SKUs quarterly to avoid working capital stagnation.`
    }

    const lowStockTable = ctx.lowStockItems.map((item, i) => {
      const estimatedCost = item.deficit * item.purchasePrice
      return `| ${i + 1} | **${item.name}** | \`${item.sku || 'N/A'}\` | ${item.currentStock} ${item.unit} | ${item.reorderLevel} ${item.unit} | **-${item.deficit} ${item.unit}** | ${formatINR(estimatedCost)} |`
    }).join('\n')

    const totalDeficitCost = ctx.lowStockItems.reduce((acc, item) => acc + (item.deficit * item.purchasePrice), 0)

    return `### 🚨 Inventory Reorder Alert for ${ctx.profile.businessName}

There are **${ctx.lowStockItems.length} SKU(s)** that have hit or fallen below their configured minimum safety reorder thresholds:

| # | Item Name | SKU | Current Stock | Reorder Level | Shortfall | Est. Restock Cost |
|---|---|---|---|---|---|---|
${lowStockTable}

- **Total Inventory Value on Hand**: ${formatINR(ctx.metrics.totalInventoryValue)} across ${ctx.metrics.inventorySkuCount} SKUs.
- **Estimated Capital Needed to Replenish**: ${formatINR(totalDeficitCost)}

#### 📦 Recommended Procurement Actions:
1. **Generate Purchase Orders**: Create POs for critical shortfall items (**${ctx.lowStockItems[0]?.name}**).
2. **Vendor Price Verification**: Verify latest vendor quotes against previous purchase rates to safeguard product gross margins.`
  }

  // 3. Profit & Loss / Cash Flow / Financial Snapshot
  if (
    q.includes('profit') ||
    q.includes('loss') ||
    q.includes('p&l') ||
    q.includes('cash flow') ||
    q.includes('cashflow') ||
    q.includes('financial') ||
    q.includes('revenue') ||
    q.includes('margin') ||
    q.includes('overview') ||
    q.includes('summary') ||
    q.includes('status') ||
    q.includes('health')
  ) {
    const isSurplus = ctx.metrics.netOperatingSurplus >= 0

    return `### 📊 Financial & Executive P&L Overview: ${ctx.profile.businessName}

Here is the real-time financial health audit synthesized from your ERP records:

#### 1. Revenue & Billing
- **Gross Invoiced Revenue**: ${formatINR(ctx.metrics.totalRevenue)} (${ctx.metrics.invoiceCount} invoices)
- **Cash Inflow (Collected)**: ${formatINR(ctx.metrics.paidRevenue)} (${ctx.metrics.paidInvoiceCount} paid invoices)
- **Outstanding Invoices (AR)**: ${formatINR(ctx.metrics.unpaidRevenue)} (${ctx.metrics.unpaidInvoiceCount} pending)
- **Collection Efficiency**: ${ctx.metrics.collectionEfficiencyPct.toFixed(1)}%

#### 2. Cost & Expenditure
- **Total Recorded Expenses**: ${formatINR(ctx.metrics.totalExpenses)}
- **Open Purchase Orders (AP Commitments)**: ${formatINR(ctx.metrics.openPOAmount)} (${ctx.metrics.openPOCount} open POs)

#### 3. Bottom Line Performance
- **Net Operating Surplus**: **${formatINR(ctx.metrics.netOperatingSurplus)}** ${isSurplus ? '🟢 (Profitable)' : '🔴 (Deficit)'}
- **Operating Margin**: **${ctx.metrics.operatingMarginPct.toFixed(1)}%**
- **Inventory Asset Value**: ${formatINR(ctx.metrics.totalInventoryValue)} (${ctx.metrics.inventorySkuCount} items)

#### 📈 Strategic CFO Recommendations:
1. **Cash Conversion**: Focus immediate collection efforts on **${formatINR(ctx.metrics.unpaidRevenue)}** in unpaid receivables to maximize liquidity.
2. **Expense Monitoring**: Review top operational overheads to maintain your operating margin above 25%.
3. **Working Capital Coverage**: Your collected cash of ${formatINR(ctx.metrics.paidRevenue)} currently provides ${ctx.metrics.totalExpenses > 0 ? (ctx.metrics.paidRevenue / ctx.metrics.totalExpenses).toFixed(1) : '∞'}x coverage over historical expenses.`
  }

  // 4. Tax & GST Compliance
  if (
    q.includes('gst') ||
    q.includes('tax') ||
    q.includes('cgst') ||
    q.includes('sgst') ||
    q.includes('igst') ||
    q.includes('hsn') ||
    q.includes('compliance') ||
    q.includes('return')
  ) {
    const totalTax = ctx.metrics.gstTaxCollected.total

    return `### 🧾 GST & Tax Compliance Report: ${ctx.profile.businessName}

- **Registered GSTIN**: ${ctx.profile.gstin || '⚠️ Not configured in Settings'}
- **Business Constitution**: ${ctx.profile.businessType}

#### 📊 Output Tax Breakdown (Collected via Sales Invoices):
- **CGST (Central Tax)**: ${formatINR(ctx.metrics.gstTaxCollected.cgst)}
- **SGST (State Tax)**: ${formatINR(ctx.metrics.gstTaxCollected.sgst)}
- **IGST (Integrated Interstate Tax)**: ${formatINR(ctx.metrics.gstTaxCollected.igst)}
- **Total Output Tax Liability Pool**: **${formatINR(totalTax)}**

#### 🗓️ Key GST Compliance Deadlines to Remember:
1. **GSTR-1 (Outward Supplies)**: Due by the **11th** of every month (or quarterly if opted for QRMP).
2. **GSTR-3B (Summary & Tax Payment)**: Due by the **20th** of every month.
3. **Input Tax Credit (ITC) Reconciliation**: Reconcile your purchase invoices against GSTR-2B before remitting the final net cash liability.

#### 💡 Action Item:
Ensure all purchase bills and vendor GST numbers are recorded in BillBooky to claim maximum eligible Input Tax Credit against the **${formatINR(totalTax)}** output tax pool.`
  }

  // 5. Vendor & Purchase Orders / Payables
  if (
    q.includes('vendor') ||
    q.includes('supplier') ||
    q.includes('purchase order') ||
    q.includes('po') ||
    q.includes('payable') ||
    q.includes('procurement')
  ) {
    const poList = ctx.recentPOs.length > 0
      ? ctx.recentPOs.map((p, i) => `| ${i + 1} | **#${p.poNumber}** | ${p.vendorName} | ${formatINR(p.amount)} | \`${p.status.toUpperCase()}\` |`).join('\n')
      : 'No purchase orders found.'

    return `### 🏢 Vendor Relations & Accounts Payable (AP) for ${ctx.profile.businessName}

- **Total Open Purchase Commitments**: ${formatINR(ctx.metrics.openPOAmount)} across ${ctx.metrics.openPOCount} open order(s).
- **Recent Purchase Activity**:

| # | PO Number | Vendor | Amount | Status |
|---|---|---|---|---|
${poList}

#### 💡 Procurement Best Practices:
1. Verify delivered quantities against purchase orders before approving vendor payouts.
2. Negotiate 30-day payment windows with major suppliers to synchronize with customer collection cycles.`
  }

  // 6. Employees & Payroll
  if (
    q.includes('employee') ||
    q.includes('payroll') ||
    q.includes('salary') ||
    q.includes('staff') ||
    q.includes('worker') ||
    q.includes('team')
  ) {
    return `### 👥 Human Resources & Payroll Overview for ${ctx.profile.businessName}

- **Active Headcount**: ${ctx.metrics.activeEmployeeCount} employee(s) registered.
- **HR & Payroll Integration**: Enabled.

#### 💡 Payroll Controls:
1. **Monthly Attendance & Payslips**: Verify that attendance and leave deductions are locked in before generating monthly payslips.
2. **Statutory Deductions**: Ensure PF, ESI, and Professional Tax compliance where applicable.
3. **Direct Salary Records**: Record payroll runs under your Chart of Accounts *Operating Expenses: Salaries & Wages*.`
  }

  // 7. General ERP Executive Briefing (Default Fallback)
  return `### 💼 Executive ERP Briefing for ${ctx.profile.businessName}

Hello! As your dedicated **AI ERP Controller and Accountant**, I have synthesized your real-time business health indicators:

#### 📊 Instant Snapshot:
- **Revenue**: ${formatINR(ctx.metrics.totalRevenue)} (${ctx.metrics.invoiceCount} invoices, ${formatINR(ctx.metrics.paidRevenue)} collected)
- **Unpaid Receivables**: **${formatINR(ctx.metrics.unpaidRevenue)}** ${ctx.metrics.overdueRevenue > 0 ? `(⚠️ ${formatINR(ctx.metrics.overdueRevenue)} overdue)` : ''}
- **Recorded Expenses**: ${formatINR(ctx.metrics.totalExpenses)}
- **Operating Surplus**: **${formatINR(ctx.metrics.netOperatingSurplus)}** (${ctx.metrics.operatingMarginPct.toFixed(1)}% margin)
- **Inventory Status**: ${ctx.metrics.inventorySkuCount} SKUs (${formatINR(ctx.metrics.totalInventoryValue)} total valuation; **${ctx.metrics.lowStockCount} items** need reorder)

---
#### 💬 You can ask me specific questions such as:
- *"Who owes me money and what are their contact details?"*
- *"Which inventory items are running low on stock?"*
- *"What is my cash flow and profit margin this month?"*
- *"Break down my GST output tax liability (CGST/SGST/IGST)"*
- *"What are my active vendor commitments and purchase orders?"*`
}
