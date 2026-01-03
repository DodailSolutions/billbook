-- Testimonials table for managing customer testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read active testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_active = true);

-- Admin can manage all testimonials
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_super_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order 
  ON public.testimonials(is_active, display_order);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, company, role, content, rating, display_order, is_active) VALUES
  ('Rajesh Kumar', 'Kumar Enterprises', 'Founder', 'BillBooky has transformed how we handle invoicing. The GST compliance feature is a lifesaver for our business!', 5, 1, true),
  ('Priya Sharma', 'Sharma Consultancy', 'CEO', 'Simple, fast, and reliable. Creating invoices now takes less than a minute. Highly recommend for Indian businesses!', 5, 2, true),
  ('Amit Patel', 'Patel Traders', 'Managing Director', 'The free plan is generous and the paid plans are very affordable. Perfect for small businesses like ours.', 5, 3, true),
  ('Sneha Reddy', 'Reddy Designs', 'Creative Director', 'Love the customization options! Our invoices now match our brand perfectly. Great tool!', 5, 4, true),
  ('Vikram Singh', 'Singh Logistics', 'Operations Manager', 'Payment tracking and automated reminders have improved our cash flow significantly. Worth every rupee!', 5, 5, true),
  ('Meena Iyer', 'Iyer & Co', 'Partner', 'Cloud-based solution means I can create invoices from anywhere. The mobile experience is excellent too!', 5, 6, true),
  ('Arjun Mehta', 'Mehta Electronics', 'Owner', 'Finally found an invoicing tool that understands Indian business needs. GST calculations are spot-on!', 5, 7, true),
  ('Kavita Gupta', 'Gupta Fashion', 'Founder & Designer', 'The recurring invoice feature saves me hours every month. Absolutely fantastic for subscription-based services!', 5, 8, true),
  ('Sanjay Desai', 'Desai Constructions', 'Project Manager', 'Professional invoices with my company logo make such a difference. Clients are impressed!', 5, 9, true),
  ('Neha Kapoor', 'Kapoor Digital Marketing', 'CEO', 'Customer support is outstanding! They helped me set up everything in minutes. Highly satisfied!', 5, 10, true),
  ('Rahul Nair', 'Nair Tech Solutions', 'Director', 'The analytics dashboard helps me track all payments effortlessly. This is exactly what my business needed!', 5, 11, true),
  ('Divya Srinivasan', 'Srinivasan Interiors', 'Interior Designer', 'Beautiful invoice templates and easy customization. My clients love the professional look!', 5, 12, true);
