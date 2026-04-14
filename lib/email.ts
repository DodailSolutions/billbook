'use server'

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

const FALLBACK_SMTP_HOST = process.env.SMTP_HOST || 'smtp-mail.outlook.com'
const FALLBACK_SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const FALLBACK_SMTP_USER = process.env.SMTP_USER
const FALLBACK_SMTP_PASSWORD = process.env.SMTP_PASSWORD
const FALLBACK_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'support@dodail.com'
const FALLBACK_FROM_NAME = process.env.SMTP_FROM_NAME || 'BillBooky Support'

// Get SMTP settings from database or fallback to environment variables
async function getSMTPSettings() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      return {
        host: data.smtp_host,
        port: data.smtp_port,
        user: data.smtp_user,
        pass: data.smtp_password,
        from_email: data.smtp_from_email,
        from_name: data.smtp_from_name,
      }
    }
  } catch (err) {
    console.warn('⚠️ Failed to fetch SMTP settings from database, using environment variables')
  }

  // Fallback to environment variables
  if (!FALLBACK_SMTP_USER || !FALLBACK_SMTP_PASSWORD) {
    console.error('❌ SMTP credentials are not configured')
    throw new Error(
      'SMTP settings not configured. Please configure SMTP settings in Admin > Email Configuration.'
    )
  }

  return {
    host: FALLBACK_SMTP_HOST,
    port: FALLBACK_SMTP_PORT,
    user: FALLBACK_SMTP_USER,
    pass: FALLBACK_SMTP_PASSWORD,
    from_email: FALLBACK_FROM_EMAIL,
    from_name: FALLBACK_FROM_NAME,
  }
}

// Create transporter using database or environment settings
async function getEmailTransporter() {
  const settings = await getSMTPSettings()

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465, // Use secure for port 465
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  })
}

// Helper function to safely send emails with error handling
async function sendEmailSafely(emailParams: any) {
  try {
    const transporter = await getEmailTransporter()
    
    console.log('📧 Sending email to:', emailParams.to)
    console.log('📧 From:', emailParams.from)
    
    const info = await transporter.sendMail(emailParams)

    console.log('✅ Email sent successfully:', info.messageId)
    return { success: true, data: { id: info.messageId } }
  } catch (err) {
    console.error('❌ Error sending email:', err)
    return { success: false, error: err }
  }
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    const transporter = await getEmailTransporter()
    const settings = await getSMTPSettings()
    
    await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: settings.from_email, // Send to support email
      replyTo: email, // Allow replying to the customer
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 0 0 8px 8px;
              }
              .field {
                margin-bottom: 20px;
              }
              .label {
                font-weight: bold;
                color: #374151;
                margin-bottom: 5px;
              }
              .value {
                color: #1f2937;
                padding: 10px;
                background: white;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
              }
              .message-box {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value message-box">${message}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return { success: true, data: { id: 'sent' } }
  } catch (error) {
    console.error('Error in sendContactEmail:', error)
    throw error
  }
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  pdfUrl,
}: {
  to: string
  invoiceNumber: string
  pdfUrl: string
}) {
  try {
    const settings = await getSMTPSettings()
    return await sendEmailSafely({
      to,
      from: `${settings.from_name} <${settings.from_email}>`,
      subject: `Invoice ${invoiceNumber} from BillBooky`,
      html: `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;">Invoice ${invoiceNumber}</h1>
      </div>
      <div style="padding:40px;">
        <p style="color:#374151;font-size:16px;">Hello,</p>
        <p style="color:#374151;font-size:15px;">Please find your invoice <strong>${invoiceNumber}</strong> ready for review.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${pdfUrl}" style="display:inline-block;background:#10b981;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">View Invoice</a>
        </div>
        <p style="color:#374151;font-size:15px;">Thank you for your business!</p>
      </div>
      <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:13px;">Sent from BillBooky &middot; ${settings.from_email}</p>
      </div>
    </div>
  </body>
</html>`,
    })
  } catch (error) {
    console.error('[sendInvoiceEmail] error:', error)
    throw error
  }
}


export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  console.log('🔍 sendWelcomeEmail called for:', to)
  
  try {
    if (!to || !name) {
      console.error('❌ Missing required parameters:', { to, name })
      throw new Error('Missing required parameters: to and name')
    }

    const transporter = await getEmailTransporter()
    const settings = await getSMTPSettings()

    await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to,
      subject: 'Welcome to BillBooky! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 40px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 40px;
                border: 1px solid #e5e7eb;
                border-radius: 0 0 8px 8px;
              }
              .button {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: bold;
              }
              .feature-list {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .feature-item {
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .feature-item:last-child {
                border-bottom: none;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 32px;">Welcome to BillBooky!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Start creating professional invoices today</p>
              </div>
              <div class="content">
                <p style="font-size: 18px;">Hi ${name},</p>
                <p>Thank you for joining <strong>BillBooky</strong>! We&apos;re excited to help you streamline your invoicing and business management.</p>
                
                <div class="feature-list">
                  <h3 style="margin-top: 0; color: #10b981;">✨ What you can do now:</h3>
                  <div class="feature-item">
                    <strong>📄 Create Professional Invoices</strong><br>
                    <span style="color: #6b7280;">Generate beautiful, customizable invoices in minutes</span>
                  </div>
                  <div class="feature-item">
                    <strong>🎨 Custom Branding</strong><br>
                    <span style="color: #6b7280;">Add your logo and customize invoice templates</span>
                  </div>
                  <div class="feature-item">
                    <strong>💰 Payment Tracking</strong><br>
                    <span style="color: #6b7280;">Monitor paid and pending invoices easily</span>
                  </div>
                  <div class="feature-item">
                    <strong>📊 Business Insights</strong><br>
                    <span style="color: #6b7280;">Get analytics and reports on your revenue</span>
                  </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://billbooky.dodail.com'}/dashboard" class="button">Go to Dashboard</a>
                </div>
                
                <p style="margin-top: 30px;">Need help getting started? Reply to this email anytime.</p>
                
                <p style="margin-top: 20px;">Happy invoicing! 🚀</p>
                <p style="margin-top: 10px;"><strong>The BillBooky Team</strong></p>
              </div>
              <div class="footer">
                <p>Questions? Contact us at ${settings.from_email}</p>
                <p style="margin-top: 10px;">&copy; 2026 BillBooky. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('✅ Welcome email sent successfully to:', to)
    return { success: true }
  } catch (error) {
    console.error('❌ Error in sendWelcomeEmail:', error)
    // Don't throw - email failures should not block signup
    return { success: false, error }
  }
}

export async function sendPurchaseConfirmationEmail({
  to,
  name,
  plan,
  amount,
  paymentId,
}: {
  to: string
  name: string
  plan: string
  amount: number
  paymentId: string
}) {
  try {
    const transporter = await getEmailTransporter()
    const settings = await getSMTPSettings()
    
    const planName = plan === 'lifetime' ? 'Lifetime Professional' : plan.charAt(0).toUpperCase() + plan.slice(1)
    const isLifetime = plan === 'lifetime'
    
    await transporter.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to,
      subject: `Payment Successful - ${planName} Plan 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                color: white;
                padding: 40px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 40px;
                border: 1px solid #e5e7eb;
                border-radius: 0 0 8px 8px;
              }
              .success-badge {
                background: #10b981;
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                display: inline-block;
                font-weight: bold;
                margin-bottom: 20px;
              }
              .invoice-box {
                background: white;
                padding: 25px;
                border-radius: 8px;
                margin: 25px 0;
                border: 2px solid #10b981;
              }
              .invoice-row {
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .invoice-row:last-child {
                border-bottom: none;
                font-weight: bold;
                font-size: 18px;
                padding-top: 15px;
              }
              .button {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
                <h1 style="margin: 0; font-size: 28px;">Payment Successful!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase</p>
              </div>
              <div class="content">
                <div class="success-badge">✓ Payment Confirmed</div>
                
                <p style="font-size: 18px;">Hi ${name},</p>
                <p>Your payment has been successfully processed! ${isLifetime ? 'You now have lifetime access to all professional features.' : 'Your subscription is now active.'}</p>
                
                <div class="invoice-box">
                  <h3 style="margin-top: 0; color: #10b981;">Payment Details</h3>
                  <div class="invoice-row">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Plan:</span>
                      <span style="font-weight: 600;">${planName}</span>
                    </div>
                  </div>
                  <div class="invoice-row">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Amount:</span>
                      <span style="font-weight: 600;">₹${amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div class="invoice-row">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Payment ID:</span>
                      <span style="font-family: monospace; font-size: 12px;">${paymentId}</span>
                    </div>
                  </div>
                  <div class="invoice-row">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280;">Status:</span>
                      <span style="color: #10b981; font-weight: 600;">✓ Paid</span>
                    </div>
                  </div>
                </div>
                
                ${isLifetime ? `
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <strong style="color: #92400e;">🎉 Lifetime Access Activated!</strong><br>
                    <span style="color: #78350f;">You have lifetime access to all professional features including unlimited invoices, custom branding, recurring invoices, and more.</span>
                  </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://billbooky.dodail.com'}/dashboard" class="button">Go to Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
                
                <p style="margin-top: 20px;"><strong>Thank you for choosing BillBooky!</strong></p>
              </div>
              <div class="footer">
                <p>Need help? Contact us at ${settings.from_email}</p>
                <p style="margin-top: 10px;">&copy; 2026 BillBooky. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error in sendPurchaseConfirmationEmail:', error)
    throw error
  }
}
