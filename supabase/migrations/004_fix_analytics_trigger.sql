-- Fix analytics trigger for single-business model
-- Drop the old trigger and function that reference business_id

-- Drop the old trigger first
DROP TRIGGER IF EXISTS create_review_analytics_trigger ON reviews;

-- Drop the old function
DROP FUNCTION IF EXISTS create_review_analytics();

-- Create new function for single-business analytics (no business_id needed)
CREATE OR REPLACE FUNCTION create_review_analytics_single()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert analytics entry for review submission (no business_id needed)
    INSERT INTO analytics (metric_type, value, metadata)
    VALUES (
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
        INSERT INTO analytics (metric_type, value, metadata)
        VALUES (
            'google_redirect',
            1,
            jsonb_build_object(
                'rating', NEW.rating,
                'customer_name', NEW.customer_name
            )
        );
    ELSE
        -- If rating < 4, create internal_feedback analytics
        INSERT INTO analytics (metric_type, value, metadata)
        VALUES (
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

-- Create new trigger for single-business analytics
CREATE TRIGGER create_review_analytics_single_trigger
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION create_review_analytics_single();
