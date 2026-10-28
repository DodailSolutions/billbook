import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import {
  UserEmailSettings,
  UserEmailTemplate,
  EmailTemplateType,
  DEFAULT_EMAIL_TEMPLATES,
} from './client-email-types'

/**
 * Fetch a tenant's email configuration
 */
export async function getUserEmailSettings(userId: string): Promise<UserEmailSettings> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data && !error) {
      return data as UserEmailSettings
    }
  } catch (err) {
    console.warn('[getUserEmailSettings] Note: user_email_settings table query issue:', err)
  }

  // Fallback defaults from invoice_settings / company details
  let senderName = 'My Business'
  let senderEmail = ''

  try {
    const { data: invSettings } = await supabase
      .from('invoice_settings')
      .select('company_name, company_email')
      .eq('user_id', userId)
      .maybeSingle()

    if (invSettings?.company_name) senderName = invSettings.company_name
    if (invSettings?.company_email) senderEmail = invSettings.company_email
  } catch {
    // Ignore fallback errors
  }

  return {
    user_id: userId,
    sender_name: senderName,
    sender_email: senderEmail,
    reply_to_email: senderEmail,
    provider: 'system',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    is_active: true,
    last_tested_at: null,
    last_test_status: null,
    last_test_message: null,
  }
}

/**
 * Save / Upsert a tenant's email configuration
 */
export async function saveUserEmailSettings(
  userId: string,
  settings: Partial<UserEmailSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const payload = {
      user_id: userId,
      sender_name: settings.sender_name || 'My Business',
      sender_email: settings.sender_email || '',
      reply_to_email: settings.reply_to_email || settings.sender_email || '',
      provider: settings.provider || 'system',
      smtp_host: settings.smtp_host || 'smtp.gmail.com',
      smtp_port: Number(settings.smtp_port) || 587,
      smtp_secure: !!settings.smtp_secure,
      smtp_user: settings.smtp_user || '',
      smtp_password: settings.smtp_password || '',
      is_active: settings.is_active !== false,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('user_email_settings')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) {
      console.error('[saveUserEmailSettings] Error upserting settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save email settings'
    return { success: false, error: msg }
  }
}

/**
 * Test user's custom SMTP configuration
 */
export async function testUserSMTPSettings(
  userId: string,
  settings: UserEmailSettings,
  testRecipient: string
): Promise<{ success: boolean; message: string }> {
  if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
    return {
      success: false,
      message: 'SMTP host, username, and password are required to test connection.',
    }
  }

  const port = Number(settings.smtp_port) || 587
  const isSecure = settings.smtp_secure || port === 465

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port,
    secure: isSecure,
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
  })

  try {
    // 1. Verify connection
    await transporter.verify()

    // 2. Dispatch a test message
    const fromName = settings.sender_name || 'BillBook Client'
    const fromEmail = settings.sender_email || settings.smtp_user

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: testRecipient,
      subject: `Test Email from ${fromName} (BillBook)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981; margin-top: 0;">Connection Successful!</h2>
          <p style="color: #334155; font-size: 15px;">
            Your custom SMTP email server has been verified successfully in your BillBook dashboard.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 13px; margin: 4px 0;"><strong>Host:</strong> ${settings.smtp_host}:${port}</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0;"><strong>Sender Name:</strong> ${fromName}</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0;"><strong>From:</strong> ${fromEmail}</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `,
    })

    // Record test result in DB if available
    try {
      const supabase = await createClient()
      await supabase
        .from('user_email_settings')
        .update({
          last_tested_at: new Date().toISOString(),
          last_test_status: 'success',
          last_test_message: `Verified and sent test email to ${testRecipient}`,
        })
        .eq('user_id', userId)
    } catch {
      // Ignore DB tracking errors
    }

    return {
      success: true,
      message: `Test email sent successfully to ${testRecipient}!`,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'SMTP connection failed'

    // Record failure in DB if available
    try {
      const supabase = await createClient()
      await supabase
        .from('user_email_settings')
        .update({
          last_tested_at: new Date().toISOString(),
          last_test_status: 'failed',
          last_test_message: errorMsg,
        })
        .eq('user_id', userId)
    } catch {
      // Ignore DB tracking errors
    }

    return {
      success: false,
      message: `SMTP Verification Failed: ${errorMsg}`,
    }
  }
}

/**
 * Fetch all email templates for a tenant (merging defaults for any missing)
 */
export async function getUserEmailTemplates(userId: string): Promise<UserEmailTemplate[]> {
  const supabase = await createClient()

  let userTemplates: UserEmailTemplate[] = []
  try {
    const { data, error } = await supabase
      .from('user_email_templates')
      .select('*')
      .eq('user_id', userId)

    if (data && !error) {
      userTemplates = data as UserEmailTemplate[]
    }
  } catch (err) {
    console.warn('[getUserEmailTemplates] Note: user_email_templates table query issue:', err)
  }

  // Merge default templates for types not saved yet
  const templateTypes: EmailTemplateType[] = [
    'invoice_delivery',
    'payment_reminder',
    'payment_receipt',
    'quotation',
  ]

  return templateTypes.map((type) => {
    const existing = userTemplates.find((t) => t.template_type === type)
    if (existing) return existing

    const def = DEFAULT_EMAIL_TEMPLATES[type]
    return {
      user_id: userId,
      template_type: type,
      name: def.name,
      subject: def.subject,
      body_html: def.body_html,
      is_active: true,
    }
  })
}

/**
 * Save / Update a specific email template
 */
export async function saveUserEmailTemplate(
  userId: string,
  template: {
    template_type: EmailTemplateType
    name: string
    subject: string
    body_html: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const payload = {
      user_id: userId,
      template_type: template.template_type,
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('user_email_templates')
      .upsert(payload, { onConflict: 'user_id,template_type' })

    if (error) {
      console.error('[saveUserEmailTemplate] Error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save email template',
    }
  }
}

/**
 * Reset a template to its system default
 */
export async function resetUserEmailTemplate(
  userId: string,
  templateType: EmailTemplateType
): Promise<{ success: boolean; template: UserEmailTemplate; error?: string }> {
  const supabase = await createClient()
  const def = DEFAULT_EMAIL_TEMPLATES[templateType]

  try {
    await supabase
      .from('user_email_templates')
      .delete()
      .eq('user_id', userId)
      .eq('template_type', templateType)

    return {
      success: true,
      template: {
        user_id: userId,
        template_type: templateType,
        name: def.name,
        subject: def.subject,
        body_html: def.body_html,
        is_active: true,
      },
    }
  } catch (err: unknown) {
    return {
      success: false,
      template: {
        user_id: userId,
        template_type: templateType,
        name: def.name,
        subject: def.subject,
        body_html: def.body_html,
        is_active: true,
      },
      error: err instanceof Error ? err.message : 'Failed to reset template',
    }
  }
}

/**
 * Helper to substitute dynamic variables into subject and html
 */
export function substituteTemplateVariables(
  text: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let result = text
  for (const [key, val] of Object.entries(variables)) {
    const safeVal = val !== undefined && val !== null ? String(val) : ''
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, safeVal)
  }
  return result
}

/**
 * Dispatch an email to a client using the tenant's configuration and template
 */
export async function sendClientEmailWithSettings({
  userId,
  to,
  templateType,
  variables,
  customSubject,
  customBody,
  replyTo,
}: {
  userId: string
  to: string
  templateType?: EmailTemplateType
  variables: Record<string, string | number | undefined | null>
  customSubject?: string
  customBody?: string
  replyTo?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // 1. Get user email settings
    const settings = await getUserEmailSettings(userId)

    // 2. Resolve template
    let subject = customSubject
    let bodyHtml = customBody

    if (!subject || !bodyHtml) {
      const type = templateType || 'invoice_delivery'
      const templates = await getUserEmailTemplates(userId)
      const t = templates.find((item) => item.template_type === type) || DEFAULT_EMAIL_TEMPLATES[type]

      if (!subject) subject = t.subject
      if (!bodyHtml) bodyHtml = t.body_html
    }

    // 3. Substitute variables
    const finalSubject = substituteTemplateVariables(subject, variables)
    const finalHtml = substituteTemplateVariables(bodyHtml, variables)

    const fromName = settings.sender_name || (variables.company_name as string) || 'BillBook'
    const fromAddress = settings.sender_email || 'noreply@billbooky.dodail.com'
    const effectiveReplyTo =
      replyTo || settings.reply_to_email || settings.sender_email || (variables.company_email as string)

    // 4. Send via Custom SMTP if configured and active
    if (
      settings.provider === 'custom_smtp' &&
      settings.is_active &&
      settings.smtp_host &&
      settings.smtp_user &&
      settings.smtp_password
    ) {
      const port = Number(settings.smtp_port) || 587
      const isSecure = settings.smtp_secure || port === 465

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host,
        port,
        secure: isSecure,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        replyTo: effectiveReplyTo,
        subject: finalSubject,
        html: finalHtml,
      })

      return { success: true, messageId: info.messageId }
    }

    // 5. Fallback to System Emailer
    // Import dynamically from lib/email to prevent circular dependencies
    const { sendEmailSafely } = await import('@/lib/email')
    const result = await sendEmailSafely({
      to,
      from: `"${fromName}" <${fromAddress}>`,
      replyTo: effectiveReplyTo,
      subject: finalSubject,
      html: finalHtml,
    })

    if (!result.success) {
      const errObj = 'error' in result ? result.error : undefined
      const errMsg = errObj instanceof Error ? errObj.message : String(errObj ?? 'Failed to send email')
      return { success: false, error: errMsg }
    }

    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error dispatching client email'
    console.error('[sendClientEmailWithSettings] caught error:', errorMsg)
    return { success: false, error: errorMsg }
  }
}
