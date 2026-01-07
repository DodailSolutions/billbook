'use server'

/**
 * Voice-to-Invoice Server Actions
 * Backend processing for voice-based invoice creation
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateGSTComponents } from '@/lib/gst-utils'
import { calculateRoundOff } from '@/lib/advanced-gst-utils'
import type { 
  VoiceRecording, 
  VoiceParsedInvoiceData,
  VoiceCommand 
} from './voice-invoice-types'

// ============================================
// VOICE RECORDING MANAGEMENT
// ============================================

export async function createVoiceRecording(data: {
  recording_url?: string
  duration_seconds?: number
  file_size_bytes?: number
  mime_type?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: recording, error } = await supabase
    .from('voice_recordings')
    .insert([{
      user_id: user.id,
      recording_url: data.recording_url,
      duration_seconds: data.duration_seconds,
      file_size_bytes: data.file_size_bytes,
      mime_type: data.mime_type || 'audio/webm',
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, recording }
}

export async function updateVoiceRecordingStatus(
  recordingId: string, 
  status: VoiceRecording['status']
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('voice_recordings')
    .update({ status })
    .eq('id', recordingId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// TRANSCRIPTION
// ============================================

export async function saveTranscription(data: {
  voice_recording_id: string
  raw_transcript: string
  confidence_score?: number
  language?: string
  transcription_service?: string
  processing_time_ms?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify recording belongs to user
  const { data: recording } = await supabase
    .from('voice_recordings')
    .select('id')
    .eq('id', data.voice_recording_id)
    .eq('user_id', user.id)
    .single()

  if (!recording) {
    return { success: false, error: 'Recording not found' }
  }

  const { data: transcription, error } = await supabase
    .from('voice_transcriptions')
    .insert([{
      voice_recording_id: data.voice_recording_id,
      raw_transcript: data.raw_transcript,
      confidence_score: data.confidence_score,
      language: data.language || 'en-IN',
      transcription_service: data.transcription_service || 'web-speech-api',
      processing_time_ms: data.processing_time_ms
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Update recording status
  await updateVoiceRecordingStatus(data.voice_recording_id, 'transcribed')

  return { success: true, transcription }
}

// ============================================
// INVOICE PARSING
// ============================================

export async function parseAndSaveInvoiceData(data: {
  voice_recording_id: string
  transcription_id: string
  parsed_data: VoiceParsedInvoiceData
  confidence_score?: number
  parsing_service?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate parsed data using database function
  const { data: validation } = await supabase.rpc('validate_voice_invoice_data', {
    p_data: data.parsed_data as unknown
  })

  const validationStatus = validation?.is_valid ? 'valid' : 'needs_review'
  const validationErrors = validation?.errors || []

  const { data: parsing, error } = await supabase
    .from('voice_invoice_parsing')
    .insert([{
      voice_recording_id: data.voice_recording_id,
      transcription_id: data.transcription_id,
      parsed_data: data.parsed_data,
      confidence_score: data.confidence_score,
      parsing_service: data.parsing_service || 'custom-nlp',
      validation_status: validationStatus,
      validation_errors: validationErrors
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Update recording status
  await updateVoiceRecordingStatus(data.voice_recording_id, 'parsed')

  return { 
    success: true, 
    parsing,
    validation_status: validationStatus,
    validation_errors: validationErrors
  }
}

// ============================================
// CREATE INVOICE FROM VOICE
// ============================================

export async function createInvoiceFromVoice(data: {
  voice_recording_id: string
  parsed_data: VoiceParsedInvoiceData
  auto_finalize?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Find or create customer
  let customerId = data.parsed_data.customer_id

  if (!customerId && data.parsed_data.customer_name) {
    // Try to find existing customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', data.parsed_data.customer_name)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          user_id: user.id,
          name: data.parsed_data.customer_name,
          gstin: data.parsed_data.customer_gstin
        }])
        .select()
        .single()

      if (customerError) {
        return { success: false, error: `Failed to create customer: ${customerError.message}` }
      }

      customerId = newCustomer.id
    }
  }

  if (!customerId) {
    return { success: false, error: 'Customer ID could not be determined' }
  }

  // Calculate totals
  const subtotal = data.parsed_data.subtotal || 
    data.parsed_data.items.reduce((sum, item) => sum + (item.amount || 0), 0)
  
  const gstPercentage = data.parsed_data.gst_percentage || 18
  const gstComponents = calculateGSTComponents(subtotal, gstPercentage, 'intra-state')
  const roundOff = calculateRoundOff(gstComponents.totalAmount)

  // Generate invoice number
  const { data: invoiceNumber } = await supabase.rpc('get_next_invoice_number_with_series', {
    p_user_id: user.id,
    p_series_id: null
  })

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([{
      user_id: user.id,
      customer_id: customerId,
      invoice_number: invoiceNumber || `VOICE-${Date.now()}`,
      invoice_date: data.parsed_data.invoice_date || new Date().toISOString().split('T')[0],
      due_date: data.parsed_data.due_date,
      subtotal,
      gst_percentage: gstPercentage,
      gst_amount: gstComponents.totalTax,
      cgst_amount: gstComponents.cgst,
      sgst_amount: gstComponents.sgst,
      igst_amount: gstComponents.igst,
      total_before_round_off: gstComponents.totalAmount,
      round_off_amount: roundOff.roundOffAmount,
      total: roundOff.roundedAmount,
      notes: data.parsed_data.notes,
      status: data.auto_finalize ? 'sent' : 'draft',
      created_via_voice: true,
      voice_recording_id: data.voice_recording_id
    }])
    .select()
    .single()

  if (invoiceError) {
    return { success: false, error: invoiceError.message }
  }

  // Add invoice items
  if (data.parsed_data.items && data.parsed_data.items.length > 0) {
    const items = data.parsed_data.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      amount: item.amount || (item.quantity || 1) * (item.unit_price || 0),
      hsn_sac_code: item.hsn_sac_code,
      gst_rate: item.gst_rate || gstPercentage
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(items)

    if (itemsError) {
      console.error('Error creating items:', itemsError)
    }
  }

  // Update voice_invoice_parsing with invoice_id
  await supabase
    .from('voice_invoice_parsing')
    .update({ 
      invoice_id: invoice.id,
      validation_status: 'valid'
    })
    .eq('voice_recording_id', data.voice_recording_id)

  // Update recording status
  await updateVoiceRecordingStatus(data.voice_recording_id, 'completed')

  revalidatePath('/invoices')
  
  return { 
    success: true, 
    invoice,
    invoice_id: invoice.id
  }
}

// ============================================
// VOICE COMMANDS
// ============================================

export async function logVoiceCommand(data: {
  voice_recording_id?: string
  command_type: string
  command_text: string
  extracted_entities?: Record<string, unknown>
  executed?: boolean
  execution_result?: Record<string, unknown>
  error_message?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: command, error } = await supabase
    .from('voice_commands_log')
    .insert([{
      user_id: user.id,
      voice_recording_id: data.voice_recording_id,
      command_type: data.command_type,
      command_text: data.command_text,
      extracted_entities: data.extracted_entities,
      executed: data.executed || false,
      execution_result: data.execution_result,
      error_message: data.error_message
    }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, command }
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

export async function getVoiceRecordings(limit: number = 50): Promise<VoiceRecording[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('voice_recordings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching voice recordings:', error)
    return []
  }

  return data as VoiceRecording[]
}

export async function getVoiceInvoiceSummary(recordingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('voice_invoice_summary')
    .select('*')
    .eq('recording_id', recordingId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching voice invoice summary:', error)
    return null
  }

  return data
}

export async function getVoiceCommands(limit: number = 100): Promise<VoiceCommand[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('voice_commands_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching voice commands:', error)
    return []
  }

  return data as VoiceCommand[]
}

// ============================================
// VOICE TEMPLATES
// ============================================

export async function getVoiceTemplates() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('voice_invoice_templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  if (error) {
    console.error('Error fetching voice templates:', error)
    return []
  }

  return data
}

export async function incrementTemplateUsage(templateId: string) {
  const supabase = await createClient()
  
  // Fetch current count, increment, and update
  const { data: template } = await supabase
    .from('voice_invoice_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()
  
  if (template) {
    await supabase
      .from('voice_invoice_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId)
  }
}
