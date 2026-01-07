/**
 * WhatsApp Invoice Creation - Server Actions
 * Create invoices directly through WhatsApp conversations
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  WhatsAppInvoiceSession,
  WhatsAppInvoiceDraft,
  WhatsAppInvoiceItem,
  WhatsAppInvoiceTemplate,
  WhatsAppIntegrationSettings,
  WhatsAppMessage,
  InvoiceCreationStep
} from './whatsapp-invoice-types'
import { WHATSAPP_INVOICE_COMMANDS } from './whatsapp-invoice-types'

/**
 * Start a new WhatsApp invoice creation session
 */
export async function startWhatsAppInvoiceSession(
  customerPhone: string,
  customerName?: string
): Promise<{ success: boolean; session?: WhatsAppInvoiceSession; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check for existing active session
    const { data: existingSession } = await supabase
      .from('whatsapp_invoice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('customer_phone', customerPhone)
      .eq('session_status', 'active')
      .single()

    if (existingSession) {
      return { success: true, session: existingSession }
    }

    // Create new session
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2) // 2 hour expiry

    const newSession: Partial<WhatsAppInvoiceSession> = {
      user_id: user.id,
      customer_phone: customerPhone,
      customer_name: customerName,
      session_status: 'active',
      current_step: 'customer_identification',
      messages: [],
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    }

    const { data, error } = await supabase
      .from('whatsapp_invoice_sessions')
      .insert(newSession)
      .select()
      .single()

    if (error) throw error

    // Add welcome message
    await addSessionMessage(data.id, 'system', 
      `Hi ${customerName || 'there'}! 👋 Let's create an invoice. I'll guide you through it.\n\n` +
      'You can use these commands:\n' +
      WHATSAPP_INVOICE_COMMANDS.map(cmd => `${cmd.command} - ${cmd.description}`).join('\n') +
      '\n\nLet\'s start! Please provide customer details or use /customer command.'
    )

    return { success: true, session: data }
  } catch (error) {
    console.error('Error starting WhatsApp invoice session:', error)
    return { success: false, error: 'Failed to start session' }
  }
}

/**
 * Process WhatsApp message and update invoice draft
 */
export async function processWhatsAppMessage(
  sessionId: string,
  message: string
): Promise<{ success: boolean; response?: string; step?: InvoiceCreationStep; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_invoice_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return { success: false, error: 'Session not found' }
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('whatsapp_invoice_sessions')
        .update({ session_status: 'expired' })
        .eq('id', sessionId)
      
      return { success: false, error: 'Session expired. Please start a new invoice.' }
    }

    // Add user message
    await addSessionMessage(sessionId, 'user', message)

    // Parse command or natural language
    const response = await parseAndExecuteCommand(session, message)

    // Add system response
    await addSessionMessage(sessionId, 'system', response.message)

    return {
      success: true,
      response: response.message,
      step: response.nextStep
    }
  } catch (error) {
    console.error('Error processing WhatsApp message:', error)
    return { success: false, error: 'Failed to process message' }
  }
}

/**
 * Add item to invoice draft
 */
export async function addItemToWhatsAppInvoice(
  sessionId: string,
  item: WhatsAppInvoiceItem
): Promise<{ success: boolean; draft?: WhatsAppInvoiceDraft; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: session } = await supabase
      .from('whatsapp_invoice_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    const draft = session.draft_data || { items: [] }
    draft.items = [...(draft.items || []), item]

    // Recalculate totals
    const subtotal = draft.items.reduce((sum: number, i: WhatsAppInvoiceItem) => sum + i.amount, 0)
    const taxAmount = draft.items.reduce((sum: number, i: WhatsAppInvoiceItem) => sum + (i.amount * i.gst_rate / 100), 0)
    const total = subtotal + taxAmount

    draft.subtotal = subtotal
    draft.tax_amount = taxAmount
    draft.total_amount = total

    const { error } = await supabase
      .from('whatsapp_invoice_sessions')
      .update({ 
        draft_data: draft,
        current_step: 'item_confirmation'
      })
      .eq('id', sessionId)

    if (error) throw error

    return { success: true, draft }
  } catch (error) {
    console.error('Error adding item:', error)
    return { success: false, error: 'Failed to add item' }
  }
}

/**
 * Complete invoice and create in database
 */
export async function completeWhatsAppInvoice(
  sessionId: string
): Promise<{ success: boolean; invoiceId?: string; invoiceNumber?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: session } = await supabase
      .from('whatsapp_invoice_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session || !session.draft_data) {
      return { success: false, error: 'Invalid session or draft' }
    }

    const draft = session.draft_data

    // Validate draft
    if (!draft.customer_name || !draft.items || draft.items.length === 0) {
      return { success: false, error: 'Incomplete invoice data' }
    }

    // Create customer if needed
    let customerId = draft.customer_id
    if (!customerId) {
      const { data: customer } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          name: draft.customer_name,
          phone: draft.customer_phone,
          email: draft.customer_email,
          gstin: draft.customer_gstin
        })
        .select()
        .single()

      customerId = customer?.id
    }

    // Generate invoice number
    const { data: invoiceNumber } = await supabase
      .rpc('get_next_invoice_number', { p_user_id: user.id })

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        invoice_number: invoiceNumber,
        invoice_date: draft.invoice_date || new Date().toISOString().split('T')[0],
        due_date: draft.due_date,
        subtotal: draft.subtotal,
        tax_amount: draft.tax_amount,
        total_amount: draft.total_amount,
        notes: draft.notes || 'Created via WhatsApp',
        payment_terms: draft.payment_terms,
        status: 'draft',
        created_via: 'whatsapp'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items
    const itemsToInsert = draft.items.map((item: WhatsAppInvoiceItem) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      amount: item.amount,
      gst_rate: item.gst_rate,
      hsn_sac_code: item.hsn_sac_code
    }))

    await supabase.from('invoice_items').insert(itemsToInsert)

    // Update session
    const { error: sessionError } = await supabase
      .from('whatsapp_invoice_sessions')
      .update({
        session_status: 'completed',
        completed_at: new Date().toISOString(),
        invoice_id: invoice.id,
        invoice_number: invoiceNumber,
        current_step: 'completed'
      })
      .eq('id', sessionId)

    if (sessionError) throw sessionError

    return {
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoiceNumber
    }
  } catch (error) {
    console.error('Error completing invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

/**
 * Save WhatsApp invoice template
 */
export async function saveWhatsAppInvoiceTemplate(
  template: Omit<WhatsAppInvoiceTemplate, 'id' | 'user_id' | 'use_count' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; template?: WhatsAppInvoiceTemplate; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('whatsapp_invoice_templates')
      .insert({
        ...template,
        user_id: user.id,
        use_count: 0
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, template: data }
  } catch (error) {
    console.error('Error saving template:', error)
    return { success: false, error: 'Failed to save template' }
  }
}

/**
 * Get WhatsApp invoice templates
 */
export async function getWhatsAppInvoiceTemplates(): Promise<{
  success: boolean
  templates?: WhatsAppInvoiceTemplate[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('whatsapp_invoice_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('use_count', { ascending: false })

    if (error) throw error

    return { success: true, templates: data }
  } catch (error) {
    console.error('Error fetching templates:', error)
    return { success: false, error: 'Failed to fetch templates' }
  }
}

/**
 * Configure WhatsApp integration settings
 */
export async function saveWhatsAppIntegrationSettings(
  settings: Omit<WhatsAppIntegrationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; settings?: WhatsAppIntegrationSettings; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('whatsapp_integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let data, error

    if (existing) {
      ({ data, error } = await supabase
        .from('whatsapp_integration_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single())
    } else {
      ({ data, error } = await supabase
        .from('whatsapp_integration_settings')
        .insert({ ...settings, user_id: user.id })
        .select()
        .single())
    }

    if (error) throw error

    return { success: true, settings: data }
  } catch (error) {
    console.error('Error saving WhatsApp settings:', error)
    return { success: false, error: 'Failed to save settings' }
  }
}

/**
 * Get WhatsApp integration settings
 */
export async function getWhatsAppIntegrationSettings(): Promise<{
  success: boolean
  settings?: WhatsAppIntegrationSettings
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('whatsapp_integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, settings: data || undefined }
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error)
    return { success: false, error: 'Failed to fetch settings' }
  }
}

// Helper functions

async function addSessionMessage(
  sessionId: string,
  from: 'user' | 'system',
  message: string
): Promise<void> {
  const supabase = await createClient()
  
  const { data: session } = await supabase
    .from('whatsapp_invoice_sessions')
    .select('messages')
    .eq('id', sessionId)
    .single()

  const messages = session?.messages || []
  const newMessage: WhatsAppMessage = {
    from,
    message,
    timestamp: new Date().toISOString(),
    message_type: 'text'
  }

  messages.push(newMessage)

  await supabase
    .from('whatsapp_invoice_sessions')
    .update({ messages })
    .eq('id', sessionId)
}

async function parseAndExecuteCommand(
  session: WhatsAppInvoiceSession,
  message: string
): Promise<{ message: string; nextStep: InvoiceCreationStep }> {
  // Check for commands
  if (message.startsWith('/')) {
    return await handleCommand(session, message)
  }

  // Natural language processing based on current step
  return await handleNaturalLanguage(session, message)
}

async function handleCommand(
  session: WhatsAppInvoiceSession,
  command: string
): Promise<{ message: string; nextStep: InvoiceCreationStep }> {
  const [cmd] = command.split(' ')

  switch (cmd.toLowerCase()) {
    case '/customer':
      return {
        message: 'Customer details saved! Now add items using /add or describe them naturally.',
        nextStep: 'item_entry'
      }

    case '/add':
      return {
        message: 'Item added successfully! Add more items or use /send to review.',
        nextStep: 'item_confirmation'
      }

    case '/send':
      return {
        message: 'Invoice is ready for review. Confirm to create?',
        nextStep: 'confirmation'
      }

    case '/cancel':
      return {
        message: 'Invoice creation cancelled.',
        nextStep: 'completed'
      }

    default:
      return {
        message: 'Unknown command. Type /start to begin or see available commands.',
        nextStep: session.current_step
      }
  }
}

async function handleNaturalLanguage(
  session: WhatsAppInvoiceSession,
  message: string
): Promise<{ message: string; nextStep: InvoiceCreationStep }> {
  // Simple NLP - in production, use OpenAI/Gemini for better parsing
  const step = session.current_step

  switch (step) {
    case 'customer_identification':
      return {
        message: 'Got it! Please provide:\n- Customer name\n- Phone number\n- Email (optional)\n- GSTIN (optional)',
        nextStep: 'customer_details'
      }

    case 'item_entry':
      return {
        message: 'Item added! Describe next item or use /send to review invoice.',
        nextStep: 'item_confirmation'
      }

    case 'review':
      if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('confirm')) {
        return {
          message: 'Creating your invoice...',
          nextStep: 'confirmation'
        }
      }
      return {
        message: 'What would you like to change?',
        nextStep: 'review'
      }

    default:
      return {
        message: 'I didn\'t understand that. Use commands like /add, /customer, /send',
        nextStep: step
      }
  }
}
