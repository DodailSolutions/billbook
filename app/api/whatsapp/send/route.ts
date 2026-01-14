import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Send WhatsApp message with invoice
 * POST /api/whatsapp/send
 * Body: { recipient_phone, message, invoice_id?, attachment_url? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipient_phone, recipient_name, message, invoice_id, attachment_url, contact_id, phone, media_url, media_type } = body

    // Support both invoice sending and CRM messaging
    const phoneNumber = recipient_phone || phone
    const messageText = message
    
    if (!phoneNumber || !messageText) {
      return NextResponse.json({ 
        error: 'phone number and message are required' 
      }, { status: 400 })
    }

    // Check for active connection
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected')
      .order('connected_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!connection) {
      return NextResponse.json({ 
        error: 'No active WhatsApp connection. Please connect first.' 
      }, { status: 400 })
    }

    // Create message record
    const { data: messageData, error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        connection_id: connection.id,
        contact_id,
        invoice_id,
        phone_number: phoneNumber,
        recipient_name,
        message: messageText,
        message_text: messageText,
        message_type: attachment_url || media_url ? 'document' : 'text',
        attachment_url: attachment_url || media_url,
        media_url: media_url,
        media_type: media_type,
        sent_by_me: true,
        status: 'pending',
        read: false
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ 
        error: 'Failed to create message' 
      }, { status: 500 })
    }

    // In production, this would send via WhatsApp Web API
    // For now, we'll simulate the message being sent
    const { error: updateError } = await supabase
      .from('whatsapp_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', messageData.id)

    if (updateError) {
      console.error('Error updating message status:', updateError)
    }

    // Update connection last activity
    await supabase
      .from('whatsapp_connections')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', connection.id)

    return NextResponse.json({ 
      success: true, 
      message_id: messageData.id,
      message: {
        id: messageData.id,
        contact_id: messageData.contact_id,
        message: messageData.message,
        timestamp: messageData.created_at,
        sent_by_me: true,
        status: 'sent',
        media_url: messageData.media_url,
        media_type: messageData.media_type
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
