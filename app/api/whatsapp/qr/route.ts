import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

/**
 * Generate QR code for WhatsApp Web connection
 * GET /api/whatsapp/qr
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate unique session ID
    const session_id = `wa_session_${user.id}_${Date.now()}`
    
    // In production, this would communicate with WhatsApp Web API
    // For now, we'll generate a demo QR code with the session ID
    const qr_data = JSON.stringify({
      session_id,
      user_id: user.id,
      timestamp: Date.now(),
      type: 'whatsapp_connect'
    })
    
    // Generate QR code as base64 data URL
    const qr_code = await QRCode.toDataURL(qr_data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Create connection record
    const expires_at = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    
    const { error: insertError } = await supabase
      .from('whatsapp_connections')
      .insert({
        user_id: user.id,
        session_id,
        status: 'pending',
        qr_code,
        expires_at: expires_at.toISOString()
      })

    if (insertError) {
      console.error('Error creating connection:', insertError)
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
    }

    return NextResponse.json({
      session_id,
      qr_code,
      expires_at: expires_at.toISOString()
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
