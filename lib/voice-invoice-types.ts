/**
 * Voice-to-Invoice Types
 * TypeScript interfaces for voice-based invoice creation
 */

export interface VoiceRecording {
  id: string
  user_id: string
  recording_url?: string
  duration_seconds?: number
  file_size_bytes?: number
  mime_type: string
  status: 'pending' | 'processing' | 'transcribed' | 'parsed' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface VoiceTranscription {
  id: string
  voice_recording_id: string
  raw_transcript: string
  confidence_score?: number
  language: string
  transcription_service?: string
  processing_time_ms?: number
  created_at: string
}

export interface VoiceInvoiceParsing {
  id: string
  voice_recording_id: string
  transcription_id: string
  parsed_data: VoiceParsedInvoiceData
  confidence_score?: number
  parsing_service?: string
  validation_status: 'pending' | 'valid' | 'needs_review' | 'invalid'
  validation_errors?: ValidationError[]
  invoice_id?: string
  created_at: string
  updated_at: string
}

export interface VoiceParsedInvoiceData {
  customer_name?: string
  customer_id?: string
  customer_gstin?: string
  invoice_date?: string
  due_date?: string
  items: VoiceParsedInvoiceItem[]
  subtotal?: number
  gst_percentage?: number
  total?: number
  notes?: string
  payment_terms?: string
}

export interface VoiceParsedInvoiceItem {
  description: string
  quantity?: number
  unit_price?: number
  amount?: number
  hsn_sac_code?: string
  gst_rate?: number
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface VoiceCommand {
  id: string
  user_id: string
  voice_recording_id?: string
  command_type: VoiceCommandType
  command_text: string
  extracted_entities?: Record<string, unknown>
  executed: boolean
  execution_result?: Record<string, unknown>
  error_message?: string
  created_at: string
}

export type VoiceCommandType = 
  | 'create_invoice'
  | 'add_item'
  | 'update_customer'
  | 'set_date'
  | 'set_amount'
  | 'add_note'
  | 'apply_discount'
  | 'select_customer'
  | 'finalize_invoice'
  | 'cancel_invoice'

export interface VoiceInvoiceTemplate {
  id: string
  user_id: string
  template_name: string
  template_phrase: string
  expected_entities: Record<string, string>
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VoiceToInvoiceSession {
  recording_id: string
  transcription?: VoiceTranscription
  parsing?: VoiceInvoiceParsing
  commands: VoiceCommand[]
  current_draft?: Partial<VoiceParsedInvoiceData>
  status: 'recording' | 'transcribing' | 'parsing' | 'reviewing' | 'completed' | 'error'
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: Array<{
    transcript: string
    confidence: number
  }>
}

export interface VoiceInvoiceConfig {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  autoSubmit: boolean
  confirmationRequired: boolean
}

export interface EntityExtraction {
  entity_type: string
  value: string
  confidence: number
  position: {
    start: number
    end: number
  }
}
