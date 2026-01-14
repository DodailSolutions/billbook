import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Disconnect WhatsApp connection
 * POST /api/whatsapp/disconnect
 * Body: { session_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_id } = body

    let query = supabase
      .from('whatsapp_connections')
      .update({
        status: 'disconnected',
        last_activity: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (session_id) {
      query = query.eq('session_id', session_id)
    } else {
      // Disconnect all active connections
      query = query.eq('status', 'connected')
    }

    const { error } = await query

    if (error) {
      console.error('Error disconnecting:', error)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
