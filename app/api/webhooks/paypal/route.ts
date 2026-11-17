import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function createWebhookSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials for PayPal webhook')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const payload = JSON.parse(rawBody)
    const eventType = payload.event_type

    console.log('PayPal webhook event received:', eventType)
    const supabase = createWebhookSupabaseClient()

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const resource = payload.resource || {}
      const captureId = resource.id
      const customId = resource.custom_id // usually invoice_id
      const amount = resource.amount?.value ? parseFloat(resource.amount.value) : 0

      if (customId) {
        await supabase.from('invoices').update({ status: 'paid' }).eq('id', customId)
        await supabase.from('payments').insert([{
          gateway_order_id: resource.supplementary_data?.related_ids?.order_id || captureId,
          gateway_payment_id: captureId,
          invoice_id: customId,
          amount: amount,
          status: 'completed',
          payment_method: 'paypal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      }
    }

    return NextResponse.json({ status: 'SUCCESS' })
  } catch (error: any) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 400 })
  }
}
