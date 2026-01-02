-- Add payment QR code field to invoice_settings table
-- This allows users to upload QR codes for GPay, PhonePe, Paytm, etc.

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS payment_qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS show_qr_code BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN invoice_settings.payment_qr_code_url IS 'URL to payment QR code image (GPay, PhonePe, Paytm, etc.)';
COMMENT ON COLUMN invoice_settings.show_qr_code IS 'Whether to display QR code on invoices';

-- Create storage bucket for QR codes (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-qr-codes', 'invoice-qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for QR codes
CREATE POLICY "Users can upload their own QR codes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoice-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own QR codes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'invoice-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own QR codes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoice-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "QR codes are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoice-qr-codes');
