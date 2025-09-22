-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  google_business_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('review_submitted', 'google_redirect', 'internal_feedback')),
  value INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_analytics_business_id ON analytics(business_id);
CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for businesses
CREATE POLICY "Users can view their own businesses" ON businesses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses" ON businesses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses" ON businesses
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reviews
CREATE POLICY "Business owners can view their reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reviews.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can update their reviews" ON reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reviews.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can delete their reviews" ON reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reviews.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

-- Create RLS policies for analytics
CREATE POLICY "Business owners can view their analytics" ON analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = analytics.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can insert their analytics" ON analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = analytics.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can update their analytics" ON analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = analytics.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can delete their analytics" ON analytics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = analytics.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

-- Create function to automatically create analytics entries
CREATE OR REPLACE FUNCTION create_review_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert analytics entry for review submission
    INSERT INTO analytics (business_id, metric_type, value, metadata)
    VALUES (
        NEW.business_id,
        'review_submitted',
        1,
        jsonb_build_object(
            'rating', NEW.rating,
            'customer_name', NEW.customer_name,
            'is_public', NEW.is_public
        )
    );
    
    -- If rating >= 4, also create google_redirect analytics
    IF NEW.rating >= 4 THEN
        INSERT INTO analytics (business_id, metric_type, value, metadata)
        VALUES (
            NEW.business_id,
            'google_redirect',
            1,
            jsonb_build_object(
                'rating', NEW.rating,
                'customer_name', NEW.customer_name
            )
        );
    ELSE
        -- If rating < 4, create internal_feedback analytics
        INSERT INTO analytics (business_id, metric_type, value, metadata)
        VALUES (
            NEW.business_id,
            'internal_feedback',
            1,
            jsonb_build_object(
                'rating', NEW.rating,
                'customer_name', NEW.customer_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic analytics creation
CREATE TRIGGER create_review_analytics_trigger
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION create_review_analytics();
