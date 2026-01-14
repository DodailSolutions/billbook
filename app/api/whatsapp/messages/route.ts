import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get WhatsApp messages for a contact
 * GET /api/whatsapp/messages?contact_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contact_id')

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 })
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      throw error
    }

    // Mark messages as read
    await supabase
      .from('whatsapp_messages')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('contact_id', contactId)
      .eq('sent_by_me', false)
      .eq('read', false)

    return NextResponse.json({ 
      messages: messages.map(msg => ({
        id: msg.id,
        contact_id: msg.contact_id,
        message: msg.message,
        timestamp: msg.created_at,
        sent_by_me: msg.sent_by_me,
        status: msg.status,
        media_url: msg.media_url,
        media_type: msg.media_type
      }))
    })
  } catch (error) {
    console.error('Error getting messages:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}
