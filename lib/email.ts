'use server'

import { Resend } from 'resend'

const FROM_EMAIL = 'support@dodail.com'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Please add it to your environment variables.')
  }
  return new Resend(apiKey)
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
    const resend = getResendClient()
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: FROM_EMAIL, // Send to support email
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

    if (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }

    return { success: true, data }
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
    const resend = getResendClient()
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Invoice ${invoiceNumber} from BillBooky`,
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
                padding: 30px;
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
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Invoice ${invoiceNumber}</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
                <p>You can download or view your invoice using the button below:</p>
                <div style="text-align: center;">
                  <a href="${pdfUrl}" class="button">View Invoice</a>
                </div>
                <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us.</p>
                <p>Thank you for your business!</p>
              </div>
              <div class="footer">
                <p>This email was sent from BillBooky</p>
                <p>For support, contact us at ${FROM_EMAIL}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending invoice email:', error)
      throw new Error('Failed to send invoice email')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in sendInvoiceEmail:', error)
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
  try {
    const resend = getResendClient()
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
                <p>Thank you for joining <strong>BillBooky</strong>! We're excited to help you streamline your invoicing and business management.</p>
                
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
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://billbooky.com'}/dashboard" class="button">Go to Dashboard</a>
                </div>
                
                <p style="margin-top: 30px;">Need help getting started? Reply to this email anytime.</p>
                
                <p style="margin-top: 20px;">Happy invoicing! 🚀</p>
                <p style="margin-top: 10px;"><strong>The BillBooky Team</strong></p>
              </div>
              <div class="footer">
                <p>Questions? Contact us at ${FROM_EMAIL}</p>
                <p style="margin-top: 10px;">&copy; 2026 BillBooky. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      throw new Error('Failed to send welcome email')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
    throw error
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
    const resend = getResendClient()
    
    const planName = plan === 'lifetime' ? 'Lifetime Professional' : plan.charAt(0).toUpperCase() + plan.slice(1)
    const isLifetime = plan === 'lifetime'
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://billbooky.com'}/dashboard" class="button">Go to Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
                
                <p style="margin-top: 20px;"><strong>Thank you for choosing BillBooky!</strong></p>
              </div>
              <div class="footer">
                <p>Need help? Contact us at ${FROM_EMAIL}</p>
                <p style="margin-top: 10px;">&copy; 2026 BillBooky. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending purchase confirmation email:', error)
      throw new Error('Failed to send purchase confirmation email')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in sendPurchaseConfirmationEmail:', error)
    throw error
  }
}
