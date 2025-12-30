-- BillBook Recurring Invoices & Reminders Extension
-- Run this AFTER the main schema (supabase-schema.sql)

-- Recurring Invoices Table
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  template_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  
  -- Recurrence settings
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE NOT NULL,
  
  -- Invoice template data
  gst_percentage DECIMAL(5, 2) DEFAULT 18,
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Invoice Items (template for items to include)
CREATE TABLE IF NOT EXISTS recurring_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE CASCADE,
  
  -- Reminder details
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('due_date', 'overdue', 'recurring_upcoming')),
  reminder_date DATE NOT NULL,
  days_before INTEGER DEFAULT 0,
  
  -- Status
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Message
  message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_invoice_items_recurring_id ON recurring_invoice_items(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_invoice_id ON reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_is_sent ON reminders(is_sent);

-- Enable RLS
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Recurring Invoices Policies
CREATE POLICY "Users can view their own recurring invoices"
  ON recurring_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring invoices"
  ON recurring_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring invoices"
  ON recurring_invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring invoices"
  ON recurring_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Invoice Items Policies
CREATE POLICY "Users can view items for their recurring invoices"
  ON recurring_invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items for their recurring invoices"
  ON recurring_invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items for their recurring invoices"
  ON recurring_invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items for their recurring invoices"
  ON recurring_invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

-- Reminders Policies
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_recurring_invoices_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next invoice date
CREATE OR REPLACE FUNCTION calculate_next_invoice_date(
  p_current_date DATE,
  p_frequency VARCHAR
)
RETURNS DATE AS $$
BEGIN
  IF p_frequency = 'monthly' THEN
    RETURN p_current_date + INTERVAL '1 month';
  ELSIF p_frequency = 'yearly' THEN
    RETURN p_current_date + INTERVAL '1 year';
  ELSE
    RETURN p_current_date + INTERVAL '1 month'; -- default to monthly
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice from recurring template
CREATE OR REPLACE FUNCTION generate_recurring_invoice(p_recurring_invoice_id UUID)
RETURNS UUID AS $$
DECLARE
  v_recurring RECORD;
  v_items RECORD;
  v_new_invoice_id UUID;
  v_invoice_number VARCHAR;
  v_subtotal DECIMAL(10, 2) := 0;
  v_gst_amount DECIMAL(10, 2);
  v_total DECIMAL(10, 2);
BEGIN
  -- Get recurring invoice details
  SELECT * INTO v_recurring
  FROM recurring_invoices
  WHERE id = p_recurring_invoice_id
  AND is_active = true
  AND next_invoice_date <= CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calculate subtotal from items
  FOR v_items IN 
    SELECT * FROM recurring_invoice_items 
    WHERE recurring_invoice_id = p_recurring_invoice_id
  LOOP
    v_subtotal := v_subtotal + (v_items.quantity * v_items.unit_price);
  END LOOP;

  -- Calculate GST and total
  v_gst_amount := (v_subtotal * v_recurring.gst_percentage) / 100;
  v_total := v_subtotal + v_gst_amount;

  -- Generate invoice number
  v_invoice_number := get_next_invoice_number(v_recurring.user_id);

  -- Create the invoice
  INSERT INTO invoices (
    user_id,
    customer_id,
    invoice_number,
    invoice_date,
    due_date,
    subtotal,
    gst_percentage,
    gst_amount,
    total,
    notes,
    status
  ) VALUES (
    v_recurring.user_id,
    v_recurring.customer_id,
    v_invoice_number,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days', -- default 30 days due
    v_subtotal,
    v_recurring.gst_percentage,
    v_gst_amount,
    v_total,
    v_recurring.notes || E'\n\n[Auto-generated from recurring invoice]',
    'draft'
  )
  RETURNING id INTO v_new_invoice_id;

  -- Copy items to new invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
  SELECT 
    v_new_invoice_id,
    description,
    quantity,
    unit_price,
    quantity * unit_price
  FROM recurring_invoice_items
  WHERE recurring_invoice_id = p_recurring_invoice_id;

  -- Update recurring invoice
  UPDATE recurring_invoices
  SET 
    next_invoice_date = calculate_next_invoice_date(next_invoice_date, frequency),
    last_generated_at = NOW(),
    updated_at = NOW()
  WHERE id = p_recurring_invoice_id;

  -- Create reminder for new invoice
  INSERT INTO reminders (
    user_id,
    invoice_id,
    reminder_type,
    reminder_date,
    days_before,
    message
  ) VALUES (
    v_recurring.user_id,
    v_new_invoice_id,
    'due_date',
    CURRENT_DATE + INTERVAL '25 days', -- 5 days before due
    5,
    'Reminder: Invoice ' || v_invoice_number || ' is due soon'
  );

  RETURN v_new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create reminders for upcoming recurring invoices
CREATE OR REPLACE FUNCTION create_recurring_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_recurring RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_recurring IN 
    SELECT * FROM recurring_invoices
    WHERE is_active = true
    AND next_invoice_date <= CURRENT_DATE + INTERVAL '7 days'
    AND next_invoice_date > CURRENT_DATE
  LOOP
    -- Check if reminder already exists
    IF NOT EXISTS (
      SELECT 1 FROM reminders
      WHERE recurring_invoice_id = v_recurring.id
      AND reminder_date = v_recurring.next_invoice_date - INTERVAL '3 days'
      AND is_sent = false
    ) THEN
      INSERT INTO reminders (
        user_id,
        recurring_invoice_id,
        reminder_type,
        reminder_date,
        days_before,
        message
      ) VALUES (
        v_recurring.user_id,
        v_recurring.id,
        'recurring_upcoming',
        v_recurring.next_invoice_date - INTERVAL '3 days',
        3,
        'Upcoming recurring invoice will be generated on ' || v_recurring.next_invoice_date
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
