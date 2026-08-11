import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserPlanStatus } from '@/lib/plan-utils'

// Use Node.js runtime for this API route
export const runtime = 'nodejs'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has access to AI Accountant
    const planStatus = await getUserPlanStatus()
    const hasAIAccess = planStatus && (
      planStatus.planSlug === 'professional' ||
      planStatus.planSlug === 'enterprise' ||
      planStatus.isLifetime
    )

    if (!hasAIAccess) {
      return NextResponse.json(
        { error: 'AI Accountant is only available for Professional, Lifetime, and Enterprise plans' },
        { status: 403 }
      )
    }

    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // ==========================================
    // RAG: Retrieve Business Context
    // ==========================================

    // 1. Get user's business profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('business_name, owner_name, business_email, business_phone')
      .eq('id', user.id)
      .single()

    // 2. Get user's invoices
    const { data: invoices, count: invoiceCount } = await supabase
      .from('invoices')
      .select('total, status, due_date, created_at', { count: 'exact' })
      .eq('user_id', user.id)

    // 3. Get recent 10 invoices with customer details
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select(`
        invoice_number,
        total,
        status,
        created_at,
        customer:customer_id (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // 4. Get recent expenses
    const { data: recentExpenses } = await supabase
      .from('expenses')
      .select(`
        amount,
        expense_date,
        expense_type,
        payee_name,
        category:expense_category_id (name)
      `)
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })
      .limit(10)

    // 5. Get recent purchase orders
    const { data: recentPOs } = await supabase
      .from('purchase_orders')
      .select('po_number, total_amount, approval_status, created_at, vendor_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // 6. Get active employees
    const { data: employees } = await supabase
      .from('employees')
      .select('name, designation, department, status')
      .eq('user_id', user.id)

    // 7. Get user's customer count
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Calculate aggregated metrics
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) || 0
    const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || []
    const unpaidInvoices = invoices?.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue') || []
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
    const unpaidRevenue = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)

    // Format lists for prompt context
    const invoicesContext = recentInvoices && recentInvoices.length > 0
      ? recentInvoices.map(inv => `- Invoice #${inv.invoice_number} to ${(inv.customer as any)?.name || 'Customer'}: ₹${Number(inv.total).toFixed(2)} (${inv.status}, created ${new Date(inv.created_at).toLocaleDateString('en-IN')})`).join('\n')
      : 'No recent invoices found.'

    const expensesContext = recentExpenses && recentExpenses.length > 0
      ? recentExpenses.map(exp => `- Expense of ₹${Number(exp.amount).toFixed(2)} for ${(exp.category as any)?.name || 'Uncategorized'} paid via ${exp.expense_type} to ${exp.payee_name || 'N/A'} on ${new Date(exp.expense_date).toLocaleDateString('en-IN')}`).join('\n')
      : 'No recent expenses found.'

    const posContext = recentPOs && recentPOs.length > 0
      ? recentPOs.map(po => `- PO #${po.po_number} to ${po.vendor_name || 'Vendor'}: ₹${Number(po.total_amount).toFixed(2)} (Status: ${po.approval_status}, created ${new Date(po.created_at).toLocaleDateString('en-IN')})`).join('\n')
      : 'No recent purchase orders found.'

    const employeesContext = employees && employees.length > 0
      ? employees.map(emp => `- ${emp.name} (${emp.designation || 'Staff'}, Department: ${emp.department || 'N/A'}, Status: ${emp.status})`).join('\n')
      : 'No active employees registered.'

    // ==========================================
    // System Prompt Construction
    // ==========================================
    const systemContext = `You are an AI Accountant assistant for ${profile?.business_name || profile?.owner_name || 'the user'}. 
You have access to their business data and should provide helpful, accurate accounting, compliance, and bookkeeping advice.

BUSINESS PROFILE:
- Business Name: ${profile?.business_name || 'Not set'}
- Owner: ${profile?.owner_name || 'Not set'}
- Contact Email: ${profile?.business_email || 'Not set'}
- Contact Phone: ${profile?.business_phone || 'Not set'}

AGGREGATED FINANCIAL KPIs:
- Total Invoices Count: ${invoiceCount || 0}
- Total Customers Count: ${customerCount || 0}
- Total Revenue: ₹${totalRevenue.toFixed(2)}
- Paid Revenue: ₹${paidRevenue.toFixed(2)}
- Unpaid Revenue: ₹${unpaidRevenue.toFixed(2)}
- Paid Invoices Count: ${paidInvoices.length}
- Unpaid/Overdue Invoices Count: ${unpaidInvoices.length}

RECENT INVOICES (Retrieved Context):
${invoicesContext}

RECENT EXPENSES (Retrieved Context):
${expensesContext}

RECENT PURCHASE ORDERS (Retrieved Context):
${posContext}

REGISTERED EMPLOYEES (Retrieved Context):
${employeesContext}

IMPORTANT RULES:
1. You can ONLY access and discuss data for THIS user's account.
2. Never reference or access other users' data.
3. Focus on bookkeeping, cash flow, financial analysis, and accounting questions.
4. Provide actionable insights based on the user's actual data.
5. Use Indian Rupees (₹) for all monetary values.
6. Be professional, helpful, and concise.
7. If you don't have enough data, acknowledge it and provide general guidance.

Current conversation history:
${history?.map((msg: Message) => `${msg.role}: ${msg.content}`).join('\n') || 'No previous conversation'}

User's query: ${message}`

    // ==========================================
    // Call LLM API (Ollama, Gemini, or OpenAI)
    // ==========================================
    let aiResponse = ''
    let isDemoMode = true
    let usedProvider = ''

    // 1. Connect to local Ollama server if available
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3'

    try {
      const messagesPayload = [
        { role: 'system', content: systemContext },
        ...(history || []).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ]

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages: messagesPayload,
          stream: false
        }),
        signal: AbortSignal.timeout(5000) // 5s timeout
      })

      if (response.ok) {
        const data = await response.json()
        aiResponse = data.message?.content || ''
        isDemoMode = false
        usedProvider = `Ollama (${ollamaModel})`
      }
    } catch (e) {
      // Ollama not running locally, try fallback providers
      console.log('Ollama local server not responding, trying cloud LLM fallback...')
    }

    // 2. Fallback to Gemini Cloud API
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!aiResponse && geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemContext}\n\nUser Question: ${message}` }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          isDemoMode = false
          usedProvider = 'Gemini API'
        }
      } catch (e) {
        console.error("Gemini API call failed:", e)
      }
    }

    // 3. Fallback to OpenAI Cloud API
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!aiResponse && openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemContext },
              { role: 'user', content: message }
            ],
            temperature: 0.2
          })
        })

        if (response.ok) {
          const data = await response.json()
          aiResponse = data.choices?.[0]?.message?.content || ''
          isDemoMode = false
          usedProvider = 'OpenAI GPT API'
        }
      } catch (e) {
        console.error("OpenAI API call failed:", e)
      }
    }

    // Fallback to structured heuristics engine if no live API model responded
    if (!aiResponse) {
      aiResponse = generateDemoResponse(message, totalRevenue, unpaidRevenue, invoiceCount || 0, customerCount || 0)
      usedProvider = 'Demo Rules Engine'
    }

    // Save history to database
    try {
      await supabase
        .from('ai_chat_history')
        .insert({
          user_id: user.id,
          user_message: message,
          ai_response: aiResponse,
          created_at: new Date().toISOString()
        })
    } catch {
      // Ignore if table/permissions not set up
    }

    return NextResponse.json({
      message: aiResponse,
      isDemoMode,
      provider: usedProvider,
      success: true
    })

  } catch (error) {
    console.error('AI Accountant error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Structured Heuristics engine for demonstration mode
function generateDemoResponse(message: string, totalRevenue: number, unpaidRevenue: number, invoiceCount: number, customerCount: number): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('cash flow') || lowerMessage.includes('cashflow')) {
    return `Based on your current data:\n\n📊 Cash Flow Analysis:\n- Total Revenue Generated: ₹${totalRevenue.toFixed(2)}\n- Outstanding Payments: ₹${unpaidRevenue.toFixed(2)}\n- Collection Rate: ${totalRevenue > 0 ? ((totalRevenue - unpaidRevenue) / totalRevenue * 100).toFixed(1) : 0}%\n\n💡 Recommendations:\n${unpaidRevenue > 0 ? `1. Follow up on ₹${unpaidRevenue.toFixed(2)} in unpaid invoices\n2. Consider offering early payment discounts\n3. Set up automated payment reminders` : '1. Great job! All invoices are paid\n2. Maintain regular invoicing schedules\n3. Consider offering incentives for repeat customers'}`
  }

  if (lowerMessage.includes('revenue') || lowerMessage.includes('income') || lowerMessage.includes('earning')) {
    return `Here's your revenue overview:\n\n💰 Revenue Summary:\n- Total Revenue: ₹${totalRevenue.toFixed(2)}\n- From ${invoiceCount} invoices across ${customerCount} customers\n- Average Invoice Value: ₹${invoiceCount > 0 ? (totalRevenue / invoiceCount).toFixed(2) : 0}\n\n${totalRevenue > 10000 ? '✅ Strong revenue performance!' : '💡 Consider strategies to increase your invoice volume or average ticket size.'}`
  }

  if (lowerMessage.includes('outstanding') || lowerMessage.includes('unpaid') || lowerMessage.includes('pending') || lowerMessage.includes('due')) {
    if (unpaidRevenue > 0) {
      return `You have ₹${unpaidRevenue.toFixed(2)} in outstanding payments.\n\n⚠️ Action Items:\n1. Review overdue invoices and send reminders\n2. Contact customers with the largest outstanding amounts\n3. Consider implementing late payment fees\n4. Set up automated payment reminders for future invoices\n\nWould you like help setting up a collections process?`
    } else {
      return `Great news! You have no outstanding payments. All your invoices are paid up. 🎉\n\n✅ Best Practices to Maintain:\n1. Continue sending invoices promptly\n2. Keep payment terms clear\n3. Follow up quickly on new invoices\n4. Consider offering early payment incentives`
    }
  }

  if (lowerMessage.includes('gst') || lowerMessage.includes('tax')) {
    return `Here's what you should know about GST for your business:\n\n📋 GST Compliance:\n1. All your invoices through BillBooky are GST-compliant\n2. They include proper GSTIN formatting\n3. Tax calculations are automated\n\n💡 Key Reminders:\n- File GSTR-1 monthly (or quarterly if eligible)\n- File GSTR-3B monthly\n- Maintain proper records of all invoices\n- Keep track of input tax credit`
  }

  return `I understand you're asking about: "${message}"\n\nBased on your current business data:\n- ${invoiceCount} invoices totaling ₹${totalRevenue.toFixed(2)}\n- ${customerCount} customers\n- ₹${unpaidRevenue.toFixed(2)} in outstanding payments\n\nI can help you with bookkeeping, cash flow analysis, GST compliance, financial planning, and business insights.\n\nCould you please rephrase your question or let me know which specific aspect you'd like to explore? For example:\n- "Show me my cash flow"\n- "What are my outstanding payments?"\n- "Help me with GST compliance"\n- "How can I improve my revenue?"`
}
