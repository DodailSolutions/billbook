export type EmailTemplateType =
  | 'invoice_delivery'
  | 'payment_reminder'
  | 'payment_receipt'
  | 'quotation'

export interface UserEmailSettings {
  id?: string
  user_id?: string
  sender_name?: string
  sender_email?: string
  reply_to_email?: string
  provider: 'system' | 'custom_smtp'
  smtp_host?: string
  smtp_port?: number
  smtp_secure?: boolean
  smtp_user?: string
  smtp_password?: string
  is_active?: boolean
  last_tested_at?: string | null
  last_test_status?: 'success' | 'failed' | 'pending' | null
  last_test_message?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserEmailTemplate {
  id?: string
  user_id?: string
  template_type: EmailTemplateType
  name: string
  subject: string
  body_html: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface TemplateVariableInfo {
  tag: string
  label: string
  example: string
}

export const AVAILABLE_TEMPLATE_VARIABLES: TemplateVariableInfo[] = [
  { tag: '{{customer_name}}', label: 'Client / Customer Name', example: 'Acme Traders' },
  { tag: '{{invoice_number}}', label: 'Invoice / Doc Number', example: 'INV-2026-0042' },
  { tag: '{{total_amount}}', label: 'Total Amount', example: '₹14,500.00' },
  { tag: '{{due_date}}', label: 'Due Date', example: '15 Nov 2026' },
  { tag: '{{issue_date}}', label: 'Issue Date', example: '28 Oct 2026' },
  { tag: '{{company_name}}', label: 'Your Business Name', example: 'Apex Technologies' },
  { tag: '{{company_email}}', label: 'Your Business Email', example: 'billing@apextech.com' },
  { tag: '{{company_phone}}', label: 'Your Business Phone', example: '+91 98765 43210' },
  { tag: '{{invoice_url}}', label: 'View / PDF Link', example: 'https://billbooky.dodail.com/invoices/...' },
  { tag: '{{payment_url}}', label: 'Payment Link', example: 'https://billbooky.dodail.com/invoices/...#pay' },
]

export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateType, { name: string; subject: string; body_html: string }> = {
  invoice_delivery: {
    name: 'Invoice Delivery',
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice {{invoice_number}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
      <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">{{company_name}}</h2>
      <p style="margin: 0; color: #bfdbfe; font-size: 14px;">Tax Invoice &middot; {{invoice_number}}</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">Dear <strong>{{customer_name}}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
        We appreciate your business. Please find below the details for invoice <strong>{{invoice_number}}</strong>.
      </p>

      <!-- Details Card -->
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 28px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Invoice Number:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">{{invoice_number}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Invoice Date:</td>
            <td style="padding: 6px 0; text-align: right; color: #0f172a;">{{issue_date}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Due Date:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #dc2626;">{{due_date}}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="padding: 12px 0 4px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Total Amount Due:</td>
            <td style="padding: 12px 0 4px 0; text-align: right; font-size: 18px; font-weight: 700; color: #2563eb;">{{total_amount}}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="{{invoice_url}}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          View &amp; Pay Invoice &rarr;
        </a>
      </div>

      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b; text-align: center;">
        If you have questions regarding this invoice, reach out to <a href="mailto:{{company_email}}" style="color: #2563eb; text-decoration: none;">{{company_email}}</a> or call {{company_phone}}.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0;">Sent on behalf of <strong>{{company_name}}</strong></p>
      <p style="margin: 0;">Thank you for your prompt payment.</p>
    </div>
  </div>
</body>
</html>`,
  },

  payment_reminder: {
    name: 'Payment Reminder',
    subject: 'Gentle Reminder: Invoice {{invoice_number}} (Due: {{due_date}})',
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
      <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px; font-weight: 600;">{{company_name}}</h2>
      <p style="margin: 0; color: #fef3c7; font-size: 14px;">Friendly Payment Reminder</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">Dear <strong>{{customer_name}}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
        This is a friendly reminder that payment for invoice <strong>{{invoice_number}}</strong> in the amount of <strong>{{total_amount}}</strong> is due on <strong>{{due_date}}</strong>.
      </p>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 18px; margin-bottom: 26px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #92400e; padding: 4px 0;">Invoice #:</td>
            <td style="text-align: right; font-weight: 600; color: #92400e;">{{invoice_number}}</td>
          </tr>
          <tr>
            <td style="color: #92400e; padding: 4px 0;">Due Date:</td>
            <td style="text-align: right; font-weight: 600; color: #b45309;">{{due_date}}</td>
          </tr>
          <tr style="border-top: 1px solid #fef3c7;">
            <td style="color: #92400e; padding: 8px 0 0 0; font-weight: 600;">Outstanding:</td>
            <td style="text-align: right; font-size: 16px; font-weight: 700; color: #b45309;">{{total_amount}}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 26px;">
        <a href="{{payment_url}}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Pay Online Now &rarr;
        </a>
      </div>

      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
        If you have already settled this payment, please disregard this note. Thank you!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      {{company_name}} &middot; {{company_email}} &middot; {{company_phone}}
    </div>
  </div>
</body>
</html>`,
  },

  payment_receipt: {
    name: 'Payment Receipt / Thank You',
    subject: 'Receipt: Payment Received for Invoice {{invoice_number}} - Thank You!',
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
      <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px; font-weight: 600;">{{company_name}}</h2>
      <p style="margin: 0; color: #d1fae5; font-size: 14px;">Payment Received &middot; Thank You!</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">Dear <strong>{{customer_name}}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
        We have successfully received and processed your payment of <strong>{{total_amount}}</strong> for invoice <strong>{{invoice_number}}</strong>.
      </p>

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #065f46; padding: 4px 0;">Invoice Number:</td>
            <td style="text-align: right; font-weight: 600; color: #065f46;">{{invoice_number}}</td>
          </tr>
          <tr>
            <td style="color: #065f46; padding: 4px 0;">Amount Received:</td>
            <td style="text-align: right; font-size: 16px; font-weight: 700; color: #047857;">{{total_amount}}</td>
          </tr>
          <tr>
            <td style="color: #065f46; padding: 4px 0;">Payment Status:</td>
            <td style="text-align: right; font-weight: 600; color: #047857;">PAID &check;</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="{{invoice_url}}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Download Paid Receipt / Invoice
        </a>
      </div>

      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b; text-align: center;">
        Thank you for your partnership and business!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      {{company_name}} &middot; {{company_email}} &middot; {{company_phone}}
    </div>
  </div>
</body>
</html>`,
  },

  quotation: {
    name: 'Quotation / Estimate',
    subject: 'Quotation {{invoice_number}} from {{company_name}}',
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation {{invoice_number}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 32px 24px; text-align: center;">
      <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px; font-weight: 600;">{{company_name}}</h2>
      <p style="margin: 0; color: #e9d5ff; font-size: 14px;">Price Quotation &middot; {{invoice_number}}</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">Dear <strong>{{customer_name}}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
        Thank you for your interest in our products and services. We are pleased to provide the quotation <strong>{{invoice_number}}</strong> for your review.
      </p>

      <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 18px; margin-bottom: 26px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #6d28d9; padding: 4px 0;">Quotation #:</td>
            <td style="text-align: right; font-weight: 600; color: #5b21b6;">{{invoice_number}}</td>
          </tr>
          <tr>
            <td style="color: #6d28d9; padding: 4px 0;">Estimated Total:</td>
            <td style="text-align: right; font-size: 16px; font-weight: 700; color: #6d28d9;">{{total_amount}}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 26px;">
        <a href="{{invoice_url}}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Review Full Quotation &rarr;
        </a>
      </div>

      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
        Feel free to reply directly to this email or call {{company_phone}} to approve or discuss any adjustments.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      {{company_name}} &middot; {{company_email}} &middot; {{company_phone}}
    </div>
  </div>
</body>
</html>`,
  },
}
