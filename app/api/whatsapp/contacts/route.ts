import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get WhatsApp contacts for CRM
 * GET /api/whatsapp/contacts
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get contacts from customers table
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, phone, email')
      .eq('user_id', user.id)
      .not('phone', 'is', null)
      .order('name')

    if (error) {
      throw error
    }

    // Get last messages for each contact
    const { data: lastMessages } = await supabase
      .from('whatsapp_messages')
      .select('contact_id, message, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Create a map of last messages
    const lastMessageMap = new Map()
    lastMessages?.forEach((msg) => {
      if (!lastMessageMap.has(msg.contact_id)) {
        lastMessageMap.set(msg.contact_id, {
          message: msg.message,
          time: msg.created_at
        })
      }
    })

    // Get unread counts
    const { data: unreadCounts } = await supabase
      .from('whatsapp_messages')
      .select('contact_id, id')
      .eq('user_id', user.id)
      .eq('sent_by_me', false)
      .eq('read', false)

    const unreadMap = new Map()
    unreadCounts?.forEach((msg) => {
      unreadMap.set(msg.contact_id, (unreadMap.get(msg.contact_id) || 0) + 1)
    })

    // Format contacts
    const contacts = customers.map((customer) => {
      const lastMsg = lastMessageMap.get(customer.id)
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        avatar: null,
        last_message: lastMsg?.message,
        last_message_time: lastMsg?.time,
        unread_count: unreadMap.get(customer.id) || 0,
        online: false
      }
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error getting contacts:', error)
    return NextResponse.json(
      { error: 'Failed to get contacts' },
      { status: 500 }
    )
  }
}
