-- Additive-only migration for Phases 25, 26, and 27 (Zero-Breakage)
-- Safe to run multiple times (idempotent)

-- Phase 25 & 27: Extended Billing Documents & Multi-Currency FX on invoices
ALTER TABLE IF EXISTS invoices
  ADD COLUMN IF NOT EXISTS document_type text DEFAULT 'invoice',
  ADD COLUMN IF NOT EXISTS linked_invoice_id uuid NULL,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_invoices_document_type ON invoices(document_type);
CREATE INDEX IF NOT EXISTS idx_invoices_linked_invoice_id ON invoices(linked_invoice_id);

-- Phase 26: Live GST Compliance (IRP E-Invoicing & E-Way Bills)
CREATE TABLE IF NOT EXISTS invoice_einvoice_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  user_id uuid NOT NULL,
  irn text,
  ack_no text,
  ack_date timestamptz,
  signed_qr_code text,
  eway_bill_no text,
  status text DEFAULT 'pending',
  raw_response jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_einvoice_invoice_id ON invoice_einvoice_records(invoice_id);

-- Phase 27: CRM Automation & 2-Way Email Sync Communications Log
CREATE TABLE IF NOT EXISTS crm_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lead_id uuid NULL,
  invoice_id uuid NULL,
  customer_id uuid NULL,
  channel text NOT NULL DEFAULT 'email',
  direction text NOT NULL DEFAULT 'outbound',
  recipient text,
  subject text,
  body_preview text,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_comms_user_id ON crm_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_comms_invoice_id ON crm_communications(invoice_id);
