'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  WhatsAppConnection, 
  WhatsAppMessage, 
  SendWhatsAppMessageRequest,
  WhatsAppConnectionStatus 
} from './whatsapp-connect-types'

/**
 * Get user's active WhatsApp connection
 */
export async function getWhatsAppConnection(): Promise<WhatsAppConnection | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected')
      .order('connected_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching WhatsApp connection:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getWhatsAppConnection:', error)
    return null
  }
}

/**
 * Create a new WhatsApp connection session
 */
export async function createWhatsAppSession(): Promise<{ success: boolean; session_id?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Generate unique session ID
    const session_id = `wa_session_${user.id}_${Date.now()}`

    // Create connection record
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .insert({
        user_id: user.id,
        session_id,
        status: 'pending',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating WhatsApp session:', error)
      return { success: false, error: error.message }
    }

    return { success: true, session_id: data.session_id }
  } catch (error) {
    console.error('Error in createWhatsAppSession:', error)
    return { success: false, error: 'Failed to create session' }
  }
}

/**
 * Update WhatsApp connection status
 */
export async function updateWhatsAppConnection(
  session_id: string,
  updates: Partial<WhatsAppConnection>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('whatsapp_connections')
      .update(updates)
      .eq('session_id', session_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating WhatsApp connection:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateWhatsAppConnection:', error)
    return { success: false, error: 'Failed to update connection' }
  }
}

/**
 * Disconnect WhatsApp connection
 */
export async function disconnectWhatsApp(session_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('whatsapp_connections')
      .update({
        status: 'disconnected' as WhatsAppConnectionStatus,
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error disconnecting WhatsApp:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in disconnectWhatsApp:', error)
    return { success: false, error: 'Failed to disconnect' }
  }
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(
  request: SendWhatsAppMessageRequest
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get active connection
    const connection = await getWhatsAppConnection()
    if (!connection) {
      return { success: false, error: 'No active WhatsApp connection' }
    }

    // Create message record
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        connection_id: connection.id,
        invoice_id: request.invoice_id,
        recipient_phone: request.recipient_phone,
        recipient_name: request.recipient_name,
        message_text: request.message,
        message_type: request.message_type || 'text',
        attachment_url: request.attachment_url,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating WhatsApp message:', error)
      return { success: false, error: error.message }
    }

    // Here you would integrate with WhatsApp Web API
    // For now, we'll simulate the message being sent
    await supabase
      .from('whatsapp_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', data.id)

    return { success: true, message_id: data.id }
  } catch (error) {
    console.error('Error in sendWhatsAppMessage:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

/**
 * Get WhatsApp messages for user
 */
export async function getWhatsAppMessages(limit = 50): Promise<WhatsAppMessage[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching WhatsApp messages:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getWhatsAppMessages:', error)
    return []
  }
}

/**
 * Get WhatsApp statistics
 */
export async function getWhatsAppStats(): Promise<{
  total_sent: number
  total_delivered: number
  total_read: number
  total_failed: number
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { total_sent: 0, total_delivered: 0, total_read: 0, total_failed: 0 }
    }

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('status')
      .eq('user_id', user.id)

    if (error || !data) {
      return { total_sent: 0, total_delivered: 0, total_read: 0, total_failed: 0 }
    }

    const stats = {
      total_sent: data.filter(m => m.status === 'sent').length,
      total_delivered: data.filter(m => m.status === 'delivered').length,
      total_read: data.filter(m => m.status === 'read').length,
      total_failed: data.filter(m => m.status === 'failed').length
    }

    return stats
  } catch (error) {
    console.error('Error in getWhatsAppStats:', error)
    return { total_sent: 0, total_delivered: 0, total_read: 0, total_failed: 0 }
  }
}
