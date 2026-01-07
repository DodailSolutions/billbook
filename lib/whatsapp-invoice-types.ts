/**
 * WhatsApp Invoice Creation - Type Definitions
 * Allows users to create invoices directly through WhatsApp
 */

export interface WhatsAppInvoiceSession {
  id: string
  user_id: string
  customer_phone: string
  customer_name?: string
  session_status: 'active' | 'completed' | 'cancelled' | 'expired'
  
  // Invoice draft
  draft_data?: Partial<WhatsAppInvoiceDraft>
  
  // Conversation tracking
  messages: WhatsAppMessage[]
  current_step: InvoiceCreationStep
  
  // Metadata
  started_at: string
  completed_at?: string
  expires_at: string
  
  // Results
  invoice_id?: string
  invoice_number?: string
  
  created_at: string
  updated_at: string
}

export interface WhatsAppInvoiceDraft {
  customer_id?: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_gstin?: string
  
  invoice_date: string
  due_date?: string
  
  items: WhatsAppInvoiceItem[]
  
  subtotal: number
  tax_amount: number
  total_amount: number
  
  notes?: string
  payment_terms?: string
}

export interface WhatsAppInvoiceItem {
  description: string
  quantity: number
  unit: string
  unit_price: number
  gst_rate: number
  hsn_sac_code?: string
  amount: number
}

export interface WhatsAppMessage {
  from: 'user' | 'system'
  message: string
  timestamp: string
  message_type: 'text' | 'confirmation' | 'error' | 'invoice_preview'
  data?: Record<string, unknown>
}

export type InvoiceCreationStep = 
  | 'customer_identification'
  | 'customer_details'
  | 'item_entry'
  | 'item_confirmation'
  | 'tax_details'
  | 'review'
  | 'confirmation'
  | 'completed'

export interface WhatsAppInvoiceTemplate {
  id: string
  user_id: string
  template_name: string
  customer_id?: string
  items: WhatsAppInvoiceItem[]
  quick_command: string  // e.g., "/template monthly-consulting"
  is_active: boolean
  use_count: number
  created_at: string
  updated_at: string
}

export interface WhatsAppInvoiceCommand {
  command: string
  description: string
  example: string
  action: 'create_invoice' | 'use_template' | 'add_item' | 'set_customer' | 'send_invoice' | 'cancel'
}

export interface WhatsAppIntegrationSettings {
  id: string
  user_id: string
  
  // WhatsApp Business API
  business_phone_number: string
  whatsapp_business_account_id?: string
  access_token?: string
  webhook_verify_token?: string
  
  // Feature flags
  invoice_creation_enabled: boolean
  payment_reminders_enabled: boolean
  auto_respond_enabled: boolean
  
  // Bot settings
  greeting_message?: string
  help_message?: string
  invoice_completion_message?: string
  
  is_active: boolean
  created_at: string
  updated_at: string
}

// Predefined commands
export const WHATSAPP_INVOICE_COMMANDS: WhatsAppInvoiceCommand[] = [
  {
    command: '/start',
    description: 'Start creating a new invoice',
    example: '/start',
    action: 'create_invoice'
  },
  {
    command: '/template',
    description: 'Use a saved template',
    example: '/template monthly-consulting',
    action: 'use_template'
  },
  {
    command: '/add',
    description: 'Add an item to invoice',
    example: '/add Web Design, 1, service, 50000, 18%',
    action: 'add_item'
  },
  {
    command: '/customer',
    description: 'Set customer details',
    example: '/customer John Doe, 9876543210, john@example.com',
    action: 'set_customer'
  },
  {
    command: '/send',
    description: 'Review and send invoice',
    example: '/send',
    action: 'send_invoice'
  },
  {
    command: '/cancel',
    description: 'Cancel current invoice creation',
    example: '/cancel',
    action: 'cancel'
  }
]

export interface WhatsAppInvoiceWebhook {
  id: string
  user_id: string
  event_type: 'message_received' | 'message_delivered' | 'message_read' | 'status_update'
  phone_number: string
  message_id?: string
  payload: Record<string, unknown>
  processed: boolean
  session_id?: string
  created_at: string
}
