import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    // Check authentication & unified super admin access
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isSuperAdmin = await checkSuperAdminAccess()
    if (!isSuperAdmin) {
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
