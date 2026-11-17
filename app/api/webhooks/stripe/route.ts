import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function createWebhookSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials for Stripe webhook')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    // Webhook event parsing
    const event = JSON.parse(rawBody)
    console.log('Stripe webhook event received:', event.type)

    const supabase = createWebhookSupabaseClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const clientReferenceId = session.client_reference_id
        const invoiceId = session.metadata?.invoice_id || clientReferenceId
        const userId = session.metadata?.user_id

        if (invoiceId) {
          await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId)
          await supabase.from('payments').insert([{
            gateway_order_id: session.id,
            gateway_payment_id: session.payment_intent || session.id,
            invoice_id: invoiceId,
            user_id: userId || null,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'completed',
            payment_method: 'stripe',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('Stripe PaymentIntent succeeded:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 400 })
  }
}
