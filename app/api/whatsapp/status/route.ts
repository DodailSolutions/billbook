import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get WhatsApp connection status
 * GET /api/whatsapp/status?session_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      // Get active connection
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'connected')
        .order('connected_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching connection:', error)
        return NextResponse.json({ connected: false }, { status: 200 })
      }

      if (!data) {
        return NextResponse.json({ connected: false }, { status: 200 })
      }

      return NextResponse.json({
        connected: true,
        phone_number: data.phone_number,
        status: data.status,
        last_activity: data.last_activity
      })
    }

    // Get specific session
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('session_id', session_id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ connected: false }, { status: 200 })
    }

    return NextResponse.json({
      connected: data.status === 'connected',
      phone_number: data.phone_number,
      status: data.status,
      last_activity: data.last_activity
    })
  } catch (error) {
    console.error('Error checking status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Simulate WhatsApp connection (for demo purposes)
 * POST /api/whatsapp/status
 * Body: { session_id, phone_number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_id, phone_number } = body

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }

    // Update connection to connected status
    const { error } = await supabase
      .from('whatsapp_connections')
      .update({
        status: 'connected',
        phone_number: phone_number || 'Connected',
        connected_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating connection:', error)
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error connecting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
