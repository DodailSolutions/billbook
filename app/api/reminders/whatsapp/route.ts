import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildWhatsAppReminderMessage, type InvoiceReminderPayload, type ReminderStage } from '@/lib/whatsapp-reminders'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId, stage = 'pre_due', customPhone } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })
    }

    // Fetch invoice details
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, customer_phone, total_amount, due_date, user_id')
      .eq('id', invoiceId)
      .single()

    if (invErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Fetch business profile name & UPI details
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('business_name, upi_id')
      .eq('id', invoice.user_id)
      .maybeSingle()

    const phone = customPhone || invoice.customer_phone
    if (!phone) {
      return NextResponse.json({ error: 'Customer phone number is missing' }, { status: 400 })
    }

    const origin = request.nextUrl.origin
    const paymentPortalUrl = `${origin}/invoices/${invoice.id}`

    const payload: InvoiceReminderPayload = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer_name || 'Customer',
      customerPhone: phone,
      totalAmount: Number(invoice.total_amount) || 0,
      dueDate: invoice.due_date || new Date().toISOString(),
      upiVpa: profile?.upi_id || undefined,
      businessName: profile?.business_name || 'BillBook Business',
      paymentPortalUrl
    }

    const { message, waLink, upiUri } = buildWhatsAppReminderMessage(payload, stage as ReminderStage)

    return NextResponse.json({
      success: true,
      message,
      waLink,
      upiUri,
      customerPhone: phone
    })
  } catch (error: any) {
    console.error('Error generating WhatsApp reminder:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
