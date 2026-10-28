'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getUserEmailSettings,
  saveUserEmailSettings,
  testUserSMTPSettings,
  getUserEmailTemplates,
  saveUserEmailTemplate,
  resetUserEmailTemplate,
  sendClientEmailWithSettings,
} from '@/lib/client-email'
import {
  UserEmailSettings,
  UserEmailTemplate,
  EmailTemplateType,
} from '@/lib/client-email-types'

/**
 * Fetch initial email settings, templates, and company metadata for the logged in user
 */
export async function getEmailSettingsAndTemplates(): Promise<{
  settings: UserEmailSettings
  templates: UserEmailTemplate[]
  companyInfo: {
    name: string
    email: string
    phone: string
  }
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch company details from invoice_settings
  let companyInfo = {
    name: 'My Business',
    email: user.email || '',
    phone: '',
  }

  try {
    const { data: invSettings } = await supabase
      .from('invoice_settings')
      .select('company_name, company_email, company_phone')
      .eq('user_id', user.id)
      .maybeSingle()

    if (invSettings) {
      if (invSettings.company_name) companyInfo.name = invSettings.company_name
      if (invSettings.company_email) companyInfo.email = invSettings.company_email
      if (invSettings.company_phone) companyInfo.phone = invSettings.company_phone
    }
  } catch {
    // Ignore error
  }

  const [settings, templates] = await Promise.all([
    getUserEmailSettings(user.id),
    getUserEmailTemplates(user.id),
  ])

  // Ensure default sender info has company details if empty
  if (!settings.sender_name && companyInfo.name) {
    settings.sender_name = companyInfo.name
  }
  if (!settings.sender_email && companyInfo.email) {
    settings.sender_email = companyInfo.email
  }

  return {
    settings,
    templates,
    companyInfo,
  }
}

/**
 * Update user email settings
 */
export async function updateEmailSettingsAction(
  settings: Partial<UserEmailSettings>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const res = await saveUserEmailSettings(user.id, settings)
  if (res.success) {
    revalidatePath('/settings/email')
  }
  return res
}

/**
 * Test user SMTP settings
 */
export async function testEmailSettingsAction(
  settings: UserEmailSettings,
  testRecipient: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Unauthorized' }
  }

  const to = testRecipient.trim() || user.email || ''
  if (!to) {
    return { success: false, message: 'Please provide a valid recipient email to send the test.' }
  }

  return await testUserSMTPSettings(user.id, settings, to)
}

/**
 * Update a user email template
 */
export async function updateEmailTemplateAction(template: {
  template_type: EmailTemplateType
  name: string
  subject: string
  body_html: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const res = await saveUserEmailTemplate(user.id, template)
  if (res.success) {
    revalidatePath('/settings/email')
  }
  return res
}

/**
 * Reset an email template back to default
 */
export async function resetEmailTemplateAction(
  templateType: EmailTemplateType
): Promise<{ success: boolean; template?: UserEmailTemplate; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const res = await resetUserEmailTemplate(user.id, templateType)
  if (res.success) {
    revalidatePath('/settings/email')
  }
  return res
}

/**
 * Fetch customer list and recent invoices for quick email sending
 */
export async function getCustomersAndInvoicesForEmail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { customers: [], invoices: [] }

  const [customersRes, invoicesRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, name, email, phone')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('invoices')
      .select('id, invoice_number, total, due_date, date, status, customer_id, customer:customers(name, email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return {
    customers: customersRes.data || [],
    invoices: invoicesRes.data || [],
  }
}

/**
 * Send an email directly to a client from dashboard
 */
export async function sendDirectClientEmailAction({
  toEmail,
  templateType,
  invoiceId,
  customerName,
  customSubject,
  customBody,
}: {
  toEmail: string
  templateType: EmailTemplateType
  invoiceId?: string
  customerName?: string
  customSubject?: string
  customBody?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!toEmail) {
    return { success: false, error: 'Recipient email is required' }
  }

  // Fetch company details
  const { data: companySettings } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://billbooky.dodail.com'

  let variables: Record<string, string> = {
    customer_name: customerName || 'Valued Client',
    company_name: companySettings?.company_name || 'My Business',
    company_email: companySettings?.company_email || user.email || '',
    company_phone: companySettings?.company_phone || '',
    invoice_number: 'N/A',
    total_amount: '₹0.00',
    due_date: new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-IN'),
    issue_date: new Date().toLocaleDateString('en-IN'),
    invoice_url: `${siteUrl}/invoices`,
    payment_url: `${siteUrl}/invoices`,
  }

  if (invoiceId) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, customer:customers(name, email)')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (invoice) {
      const cust = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer
      const totalFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(Number(invoice.total) || 0)

      variables = {
        ...variables,
        customer_name: cust?.name || customerName || 'Valued Client',
        invoice_number: invoice.invoice_number || 'INV-001',
        total_amount: totalFormatted,
        due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : variables.due_date,
        issue_date: invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : variables.issue_date,
        invoice_url: `${siteUrl}/invoices/${invoice.id}`,
        payment_url: `${siteUrl}/invoices/${invoice.id}`,
      }
    }
  }

  return await sendClientEmailWithSettings({
    userId: user.id,
    to: toEmail,
    templateType,
    variables,
    customSubject,
    customBody,
  })
}
