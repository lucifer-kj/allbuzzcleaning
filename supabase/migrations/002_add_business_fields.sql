-- Add missing fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Thank you for your feedback!',
ADD COLUMN IF NOT EXISTS thank_you_message TEXT DEFAULT 'Thank you for taking the time to share your experience with us.';

-- Add missing fields to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS allow_follow_up BOOLEAN DEFAULT false;

-- Create link_tracking table for sharing analytics
CREATE TABLE IF NOT EXISTS link_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  link_type VARCHAR(20) NOT NULL CHECK (link_type IN ('direct', 'qr_code', 'social', 'email')),
  link_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_email ON reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_link_tracking_business_id ON link_tracking(business_id);
CREATE INDEX IF NOT EXISTS idx_link_tracking_link_type ON link_tracking(link_type);
CREATE INDEX IF NOT EXISTS idx_link_tracking_created_at ON link_tracking(created_at);

-- Enable RLS for link_tracking table
ALTER TABLE link_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for link_tracking
CREATE POLICY "Business owners can view their link tracking" ON link_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = link_tracking.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can insert link tracking" ON link_tracking
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = link_tracking.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

-- Update the updated_at trigger for link_tracking
CREATE TRIGGER update_link_tracking_updated_at BEFORE UPDATE ON link_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
