// WhatsApp Web Connect Types

export type WhatsAppConnectionStatus = 'pending' | 'connected' | 'disconnected' | 'error'
export type WhatsAppMessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
export type WhatsAppMessageType = 'text' | 'document' | 'image'

export interface WhatsAppConnection {
  id: string
  user_id: string
  session_id: string
  phone_number?: string
  status: WhatsAppConnectionStatus
  qr_code?: string
  connected_at?: string
  last_activity?: string
  expires_at?: string
  device_info?: {
    platform?: string
    browser?: string
    version?: string
  }
  created_at: string
  updated_at: string
}

export interface WhatsAppMessage {
  id: string
  user_id: string
  connection_id?: string
  invoice_id?: string
  recipient_phone: string
  recipient_name?: string
  message_text: string
  message_type: WhatsAppMessageType
  attachment_url?: string
  status: WhatsAppMessageStatus
  sent_at?: string
  delivered_at?: string
  read_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface SendWhatsAppMessageRequest {
  recipient_phone: string
  recipient_name?: string
  message: string
  invoice_id?: string
  attachment_url?: string
  message_type?: WhatsAppMessageType
}

export interface WhatsAppQRResponse {
  session_id: string
  qr_code: string
  expires_at: string
}

export interface WhatsAppSessionInfo {
  connected: boolean
  phone_number?: string
  status: WhatsAppConnectionStatus
  last_activity?: string
}
