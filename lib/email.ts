'use server'

import { Resend } from 'resend'

const FROM_EMAIL = 'support@billbooky.com'

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
