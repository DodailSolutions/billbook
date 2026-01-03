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
    const hasAIAccess = planStatus && ['professional', 'lifetime', 'enterprise'].includes(planStatus.planSlug)

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

    // Get user's business context (only their data)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('business_name, owner_name, business_email, business_phone')
      .eq('id', user.id)
      .single()

    // Get user's invoice statistics
    const { data: invoices, count: invoiceCount } = await supabase
      .from('invoices')
      .select('total, status, due_date, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get user's customer count
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Calculate financial metrics
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
    const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || []
    const unpaidInvoices = invoices?.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue') || []
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    const unpaidRevenue = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

    // Build context for AI
    const systemContext = `You are an AI Accountant assistant for ${profile?.business_name || profile?.owner_name || 'the user'}. 
You have access to their business data and should provide helpful, accurate accounting and bookkeeping advice.

BUSINESS CONTEXT:
- Business Name: ${profile?.business_name || 'Not set'}
- Owner: ${profile?.owner_name || 'Not set'}
- Total Invoices: ${invoiceCount || 0}
- Total Customers: ${customerCount || 0}
- Total Revenue: ₹${totalRevenue.toFixed(2)}
- Paid Revenue: ₹${paidRevenue.toFixed(2)}
- Unpaid Revenue: ₹${unpaidRevenue.toFixed(2)}
- Number of Paid Invoices: ${paidInvoices.length}
- Number of Unpaid/Overdue Invoices: ${unpaidInvoices.length}

IMPORTANT RULES:
1. You can ONLY access and discuss data for THIS user's account
2. Never reference or access other users' data
3. Focus on bookkeeping, cash flow, financial analysis, and accounting questions
4. Provide actionable insights based on the user's actual data
5. Use Indian Rupees (₹) for all monetary values
6. Be professional, helpful, and concise
7. If you don't have enough data, acknowledge it and provide general guidance

When providing advice:
- Reference their actual numbers when relevant
- Suggest practical next steps
- Explain accounting concepts in simple terms
- Help with GST compliance questions (Indian context)
- Assist with cash flow management

Current conversation context:
${history?.map((msg: Message) => `${msg.role}: ${msg.content}`).join('\n') || 'No previous conversation'}

User's question: ${message}`

    // Call OpenAI or another LLM API
    // For now, we'll create a mock response. Replace this with actual OpenAI API call
    const aiResponse = await generateAIResponse(systemContext, message)

    // Save chat history to database (optional - for learning and improvement)
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
      // Ignore errors if table doesn't exist yet
    }

    return NextResponse.json({
      message: aiResponse,
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

// This function would call OpenAI or another LLM
// For now, it provides intelligent mock responses based on context
async function generateAIResponse(context: string, message: string): Promise<string> {
  // Extract key metrics from context
  const revenueMatch = context.match(/Total Revenue: ₹([\d.]+)/)
  const unpaidMatch = context.match(/Unpaid Revenue: ₹([\d.]+)/)
  const invoiceCountMatch = context.match(/Total Invoices: (\d+)/)
  const customerCountMatch = context.match(/Total Customers: (\d+)/)

  const totalRevenue = revenueMatch ? parseFloat(revenueMatch[1]) : 0
  const unpaidRevenue = unpaidMatch ? parseFloat(unpaidMatch[1]) : 0
  const invoiceCount = invoiceCountMatch ? parseInt(invoiceCountMatch[1]) : 0
  const customerCount = customerCountMatch ? parseInt(customerCountMatch[1]) : 0

  const lowerMessage = message.toLowerCase()

  // Cash flow questions
  if (lowerMessage.includes('cash flow') || lowerMessage.includes('cashflow')) {
    return `Based on your current data:\n\n📊 Cash Flow Analysis:\n- Total Revenue Generated: ₹${totalRevenue.toFixed(2)}\n- Outstanding Payments: ₹${unpaidRevenue.toFixed(2)}\n- Collection Rate: ${totalRevenue > 0 ? ((totalRevenue - unpaidRevenue) / totalRevenue * 100).toFixed(1) : 0}%\n\n💡 Recommendations:\n${unpaidRevenue > 0 ? `1. Follow up on ₹${unpaidRevenue.toFixed(2)} in unpaid invoices\n2. Consider offering early payment discounts\n3. Set up automated payment reminders` : '1. Great job! All invoices are paid\n2. Maintain regular invoicing schedules\n3. Consider offering incentives for repeat customers'}`
  }

  // Revenue questions
  if (lowerMessage.includes('revenue') || lowerMessage.includes('income') || lowerMessage.includes('earning')) {
    return `Here's your revenue overview:\n\n💰 Revenue Summary:\n- Total Revenue: ₹${totalRevenue.toFixed(2)}\n- From ${invoiceCount} invoices across ${customerCount} customers\n- Average Invoice Value: ₹${invoiceCount > 0 ? (totalRevenue / invoiceCount).toFixed(2) : 0}\n\n${totalRevenue > 10000 ? '✅ Strong revenue performance!' : '💡 Consider strategies to increase your invoice volume or average ticket size.'}`
  }

  // Invoice questions
  if (lowerMessage.includes('invoice') && (lowerMessage.includes('how many') || lowerMessage.includes('count'))) {
    return `You have created ${invoiceCount} invoices so far for ${customerCount} customers.\n\n📈 Quick Stats:\n- Average invoices per customer: ${customerCount > 0 ? (invoiceCount / customerCount).toFixed(1) : 0}\n- Total value: ₹${totalRevenue.toFixed(2)}\n\nWould you like help analyzing invoice patterns or improving your invoicing process?`
  }

  // Outstanding/unpaid questions
  if (lowerMessage.includes('outstanding') || lowerMessage.includes('unpaid') || lowerMessage.includes('pending') || lowerMessage.includes('due')) {
    if (unpaidRevenue > 0) {
      return `You have ₹${unpaidRevenue.toFixed(2)} in outstanding payments.\n\n⚠️ Action Items:\n1. Review overdue invoices and send reminders\n2. Contact customers with the largest outstanding amounts\n3. Consider implementing late payment fees\n4. Set up automated payment reminders for future invoices\n\nWould you like help setting up a collections process?`
    } else {
      return `Great news! You have no outstanding payments. All your invoices are paid up. 🎉\n\n✅ Best Practices to Maintain:\n1. Continue sending invoices promptly\n2. Keep payment terms clear\n3. Follow up quickly on new invoices\n4. Consider offering early payment incentives`
    }
  }

  // GST questions
  if (lowerMessage.includes('gst') || lowerMessage.includes('tax')) {
    return `Here's what you should know about GST for your business:\n\n📋 GST Compliance:\n1. All your invoices through BillBooky are GST-compliant\n2. They include proper GSTIN formatting\n3. Tax calculations are automated\n\n💡 Key Reminders:\n- File GSTR-1 monthly (or quarterly if eligible)\n- File GSTR-3B monthly\n- Maintain proper records of all invoices\n- Keep track of input tax credit\n\nNeed help with specific GST calculations or filing questions?`
  }

  // Bookkeeping questions
  if (lowerMessage.includes('bookkeep') || lowerMessage.includes('record') || lowerMessage.includes('track')) {
    return `Here's how to maintain good bookkeeping practices:\n\n📚 Bookkeeping Essentials:\n1. Record all transactions promptly (you have ${invoiceCount} invoices recorded)\n2. Categorize expenses properly\n3. Reconcile accounts regularly\n4. Keep digital and physical copies of receipts\n5. Review financial statements monthly\n\n✅ You're already doing well by:\n- Using BillBooky for invoice management\n- Tracking ${customerCount} customers systematically\n- Maintaining GST-compliant records\n\nWhat specific bookkeeping area would you like help with?`
  }

  // Customer questions
  if (lowerMessage.includes('customer') && !lowerMessage.includes('how to')) {
    return `You're managing ${customerCount} customers with ${invoiceCount} invoices.\n\n👥 Customer Insights:\n- Average revenue per customer: ₹${customerCount > 0 ? (totalRevenue / customerCount).toFixed(2) : 0}\n- Average invoices per customer: ${customerCount > 0 ? (invoiceCount / customerCount).toFixed(1) : 0}\n\n💡 Growth Tips:\n1. Focus on repeat business from existing customers\n2. Identify your top-paying customers\n3. Consider customer loyalty programs\n4. Request referrals from satisfied customers\n\nWould you like strategies to improve customer retention?`
  }

  // Profit/profitability questions
  if (lowerMessage.includes('profit') || lowerMessage.includes('margin')) {
    return `To calculate profit, I need to know about your expenses. Currently, I can see:\n\n💰 Revenue: ₹${totalRevenue.toFixed(2)}\n\nFor accurate profit calculation, you'll need to:\n1. Track all business expenses\n2. Account for cost of goods/services\n3. Include operational costs\n4. Consider tax obligations\n\n📊 Profit Formula:\nProfit = Revenue - (Cost of Goods + Operating Expenses + Taxes)\n\nWould you like help setting up an expense tracking system?`
  }

  // General help or greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
    return `I'm here to help with your accounting and bookkeeping needs! I can assist with:\n\n📊 Financial Analysis:\n- Cash flow insights\n- Revenue tracking\n- Outstanding payments\n\n📚 Bookkeeping:\n- Recording best practices\n- Invoice management\n- Record organization\n\n💼 Business Insights:\n- Customer analysis\n- Growth recommendations\n- Financial planning\n\n📋 Compliance:\n- GST guidance\n- Tax considerations\n- Documentation requirements\n\nWhat would you like to know about your business finances?`
  }

  // Default response with context
  return `I understand you're asking about: "${message}"\n\nBased on your current business data:\n- ${invoiceCount} invoices totaling ₹${totalRevenue.toFixed(2)}\n- ${customerCount} customers\n- ₹${unpaidRevenue.toFixed(2)} in outstanding payments\n\nI can help you with bookkeeping, cash flow analysis, GST compliance, financial planning, and business insights.\n\nCould you please rephrase your question or let me know which specific aspect you'd like to explore? For example:\n- "Show me my cash flow"\n- "What are my outstanding payments?"\n- "Help me with GST compliance"\n- "How can I improve my revenue?"`
}
