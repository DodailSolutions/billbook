-- Hire CA Feature - Complete Database Schema

-- ============================================
-- CA PROFESSIONALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  profile_image_url TEXT,
  
  -- Professional Details
  icai_membership_number VARCHAR(50) UNIQUE NOT NULL,
  firm_name VARCHAR(255),
  years_of_experience INTEGER NOT NULL,
  specializations TEXT[] NOT NULL, -- ['GST', 'Income Tax', 'Audit', 'Company Law', 'Financial Planning']
  
  -- Address
  office_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  
  -- Professional Info
  bio TEXT,
  education TEXT[],
  certifications TEXT[],
  languages_spoken TEXT[],
  
  -- Availability
  available_for_hire BOOLEAN DEFAULT true,
  consultation_fee DECIMAL(10, 2),
  monthly_retainer_fee DECIMAL(10, 2),
  
  -- Ratings & Reviews
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  
  -- Status
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verification_documents JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_professionals_user ON ca_professionals(user_id);
CREATE INDEX idx_ca_professionals_city ON ca_professionals(city);
CREATE INDEX idx_ca_professionals_state ON ca_professionals(state);
CREATE INDEX idx_ca_professionals_verification ON ca_professionals(verification_status);
CREATE INDEX idx_ca_professionals_available ON ca_professionals(available_for_hire);

-- ============================================
-- CA HIRE REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_hire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE SET NULL,
  
  -- Request Details
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('consultation', 'monthly_retainer', 'project_based', 'gst_filing', 'tax_filing', 'audit', 'general')),
  service_needed TEXT[] NOT NULL, -- ['GST Filing', 'Tax Returns', 'Bookkeeping', 'Audit', 'Financial Planning']
  
  -- Business Details
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  annual_turnover DECIMAL(15, 2),
  number_of_invoices INTEGER,
  
  -- Requirements
  description TEXT NOT NULL,
  preferred_start_date DATE,
  duration_months INTEGER,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  
  -- Location Preferences
  preferred_city VARCHAR(100),
  preferred_state VARCHAR(100),
  remote_ok BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'matched', 'in_discussion', 'hired', 'completed', 'cancelled')),
  
  -- Matching
  matched_ca_ids UUID[], -- Array of CA IDs who showed interest
  proposals_received INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_ca_hire_requests_user ON ca_hire_requests(user_id);
CREATE INDEX idx_ca_hire_requests_ca ON ca_hire_requests(ca_professional_id);
CREATE INDEX idx_ca_hire_requests_status ON ca_hire_requests(status);
CREATE INDEX idx_ca_hire_requests_city ON ca_hire_requests(preferred_city);
CREATE INDEX idx_ca_hire_requests_created ON ca_hire_requests(created_at DESC);

-- ============================================
-- CA PROPOSALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_request_id UUID REFERENCES ca_hire_requests(id) ON DELETE CASCADE NOT NULL,
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE CASCADE NOT NULL,
  
  -- Proposal Details
  cover_letter TEXT NOT NULL,
  proposed_fee DECIMAL(10, 2) NOT NULL,
  fee_structure VARCHAR(50) NOT NULL CHECK (fee_structure IN ('one_time', 'monthly', 'hourly', 'project_based')),
  estimated_duration VARCHAR(100),
  
  -- Additional Info
  relevant_experience TEXT,
  similar_projects_completed INTEGER,
  availability_start_date DATE,
  
  -- Attachments
  attachment_urls TEXT[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Response
  client_response TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_proposals_request ON ca_proposals(hire_request_id);
CREATE INDEX idx_ca_proposals_ca ON ca_proposals(ca_professional_id);
CREATE INDEX idx_ca_proposals_status ON ca_proposals(status);
CREATE INDEX idx_ca_proposals_created ON ca_proposals(created_at DESC);

-- ============================================
-- CA ENGAGEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_request_id UUID REFERENCES ca_hire_requests(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE CASCADE NOT NULL,
  
  -- Engagement Details
  engagement_type VARCHAR(50) NOT NULL CHECK (engagement_type IN ('consultation', 'monthly_retainer', 'project_based', 'gst_filing', 'ongoing')),
  services_included TEXT[] NOT NULL,
  
  -- Terms
  agreed_fee DECIMAL(10, 2) NOT NULL,
  fee_frequency VARCHAR(50) NOT NULL CHECK (fee_frequency IN ('one_time', 'monthly', 'quarterly', 'annually')),
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Contract
  contract_terms TEXT,
  contract_document_url TEXT,
  
  -- Payment Tracking
  total_amount_paid DECIMAL(15, 2) DEFAULT 0,
  last_payment_date DATE,
  next_payment_due DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'terminated')),
  
  -- Satisfaction
  client_rating DECIMAL(3, 2),
  client_review TEXT,
  review_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ca_engagements_user ON ca_engagements(user_id);
CREATE INDEX idx_ca_engagements_ca ON ca_engagements(ca_professional_id);
CREATE INDEX idx_ca_engagements_status ON ca_engagements(status);
CREATE INDEX idx_ca_engagements_dates ON ca_engagements(start_date, end_date);

-- ============================================
-- CA REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engagement_id UUID REFERENCES ca_engagements(id) ON DELETE SET NULL,
  
  -- Review Details
  rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(255),
  review_text TEXT NOT NULL,
  
  -- Specific Ratings
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  
  -- Response
  ca_response TEXT,
  ca_responded_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_reviews_ca ON ca_reviews(ca_professional_id);
CREATE INDEX idx_ca_reviews_user ON ca_reviews(user_id);
CREATE INDEX idx_ca_reviews_rating ON ca_reviews(rating);
CREATE INDEX idx_ca_reviews_created ON ca_reviews(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- CA Professionals
ALTER TABLE ca_professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CA professionals are viewable by everyone" ON ca_professionals FOR SELECT USING (true);
CREATE POLICY "Users can create their CA profile" ON ca_professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "CAs can update own profile" ON ca_professionals FOR UPDATE USING (auth.uid() = user_id);

-- CA Hire Requests
ALTER TABLE ca_hire_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own hire requests" ON ca_hire_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CAs view open requests" ON ca_hire_requests FOR SELECT USING (status = 'open' OR ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid()));
CREATE POLICY "Users create own hire requests" ON ca_hire_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own hire requests" ON ca_hire_requests FOR UPDATE USING (auth.uid() = user_id);

-- CA Proposals
ALTER TABLE ca_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view proposals for their requests" ON ca_proposals FOR SELECT USING (
  hire_request_id IN (SELECT id FROM ca_hire_requests WHERE user_id = auth.uid())
);
CREATE POLICY "CAs view own proposals" ON ca_proposals FOR SELECT USING (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);
CREATE POLICY "CAs create proposals" ON ca_proposals FOR INSERT WITH CHECK (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);
CREATE POLICY "CAs update own proposals" ON ca_proposals FOR UPDATE USING (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);

-- CA Engagements
ALTER TABLE ca_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own engagements" ON ca_engagements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CAs view their engagements" ON ca_engagements FOR SELECT USING (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);
CREATE POLICY "Users create engagements" ON ca_engagements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Engagement parties can update" ON ca_engagements FOR UPDATE USING (
  auth.uid() = user_id OR ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);

-- CA Reviews
ALTER TABLE ca_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON ca_reviews FOR SELECT USING (true);
CREATE POLICY "Users create own reviews" ON ca_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON ca_reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update CA average rating
CREATE OR REPLACE FUNCTION update_ca_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ca_professionals
  SET 
    average_rating = (
      SELECT AVG(rating)
      FROM ca_reviews
      WHERE ca_professional_id = NEW.ca_professional_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM ca_reviews
      WHERE ca_professional_id = NEW.ca_professional_id
    ),
    updated_at = NOW()
  WHERE id = NEW.ca_professional_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ca_rating
AFTER INSERT OR UPDATE OF rating ON ca_reviews
FOR EACH ROW
EXECUTE FUNCTION update_ca_average_rating();

-- Function to update proposal count
CREATE OR REPLACE FUNCTION update_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ca_hire_requests
  SET 
    proposals_received = (
      SELECT COUNT(*)
      FROM ca_proposals
      WHERE hire_request_id = NEW.hire_request_id
    ),
    updated_at = NOW()
  WHERE id = NEW.hire_request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_proposal_count
AFTER INSERT ON ca_proposals
FOR EACH ROW
EXECUTE FUNCTION update_proposal_count();

COMMENT ON TABLE ca_professionals IS 'Chartered Accountant professionals offering services';
COMMENT ON TABLE ca_hire_requests IS 'Client requests to hire CA services';
COMMENT ON TABLE ca_proposals IS 'CA proposals for hire requests';
COMMENT ON TABLE ca_engagements IS 'Active/completed CA-client engagements';
COMMENT ON TABLE ca_reviews IS 'Client reviews and ratings for CAs';
