import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 })
    }

    // Get SMTP settings from request
    const { smtp_host, smtp_port, smtp_user, smtp_password } =
      await request.json()

    // Validate required fields
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password) {
      return NextResponse.json(
        { error: 'Missing required SMTP fields' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_port === 465, // Use secure for port 465
      auth: {
        user: smtp_user,
        pass: smtp_password,
      },
    })

    // Test the connection
    await transporter.verify()

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful!',
    })
  } catch (error) {
    console.error('SMTP test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'SMTP connection failed'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    )
  }
}
