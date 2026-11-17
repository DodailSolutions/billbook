import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function createWebhookSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials for Cashfree webhook')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function verifyCashfreeSignature(rawBody: string, signature: string, timestamp: string, secretKey: string): boolean {
  try {
    const data = timestamp + rawBody
    const expected = crypto.createHmac('sha256', secretKey).update(data).digest('base64')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch (err) {
    console.warn('Cashfree signature verification failed:', err)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    const timestamp = request.headers.get('x-webhook-timestamp')

    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET

    if (webhookSecret && signature && timestamp) {
      const isValid = verifyCashfreeSignature(rawBody, signature, timestamp, webhookSecret)
      if (!isValid) {
        console.error('Invalid Cashfree webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.type || payload.event

    console.log('Received Cashfree webhook:', eventType)
    const supabase = createWebhookSupabaseClient()

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'ORDER_PAID') {
      const order = payload.data?.order || payload.data
      const payment = payload.data?.payment || {}
      const orderId = order?.order_id
      const referenceId = payment?.cf_payment_id || order?.reference_id

      if (orderId) {
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('*')
          .eq('gateway_order_id', orderId)
          .maybeSingle()

        if (existingPayment) {
          await supabase
            .from('payments')
            .update({
              gateway_payment_id: String(referenceId),
              status: 'completed',
              payment_method: payment?.payment_method || 'cashfree',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPayment.id)

          if (existingPayment.invoice_id) {
            await supabase
              .from('invoices')
              .update({ status: 'paid' })
              .eq('id', existingPayment.invoice_id)
          }
        }
      }
    }

    return NextResponse.json({ received: true, status: 'success' })
  } catch (error: any) {
    console.error('Cashfree webhook error:', error)
    return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 500 })
  }
}
