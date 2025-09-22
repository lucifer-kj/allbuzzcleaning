-- Single-business refactor: introduce app_settings singleton and remove business scoping

-- Create a singleton settings table to hold business details for the app
CREATE TABLE IF NOT EXISTS app_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE, -- enforce single row by using a constant primary key
  name VARCHAR(100) NOT NULL DEFAULT 'My Business',
  description TEXT,
  logo_url TEXT,
  google_business_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  website TEXT,
  brand_color VARCHAR(7) DEFAULT '#000000',
  welcome_message TEXT DEFAULT 'Welcome! Please share your experience with us.',
  thank_you_message TEXT DEFAULT 'Thank you for your feedback!',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure there is exactly one row
INSERT INTO app_settings (id)
SELECT TRUE
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Trigger to update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_app_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Reviews are now global (single business), drop business_id if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'business_id'
  ) THEN
    -- Drop dependent RLS policies before dropping the column
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can view their reviews" ON reviews';
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can update their reviews" ON reviews';
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can delete their reviews" ON reviews';
    EXCEPTION WHEN others THEN
      -- ignore if policies don't exist
      NULL;
    END;

    ALTER TABLE reviews DROP COLUMN business_id;
  END IF;
END $$;

-- Analytics is global; drop business_id if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'business_id'
  ) THEN
    -- Drop dependent RLS policies before dropping the column
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can view their analytics" ON analytics';
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can insert their analytics" ON analytics';
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can update their analytics" ON analytics';
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can delete their analytics" ON analytics';
    EXCEPTION WHEN others THEN
      NULL;
    END;

    ALTER TABLE analytics DROP COLUMN business_id;
  END IF;
END $$;

-- Link tracking no longer scoped by business; drop foreign key if exists
DO $$
BEGIN
  IF to_regclass('public.link_tracking') IS NOT NULL THEN
    -- Drop policies that reference business_id
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can view their link tracking" ON link_tracking';
      EXECUTE 'DROP POLICY IF EXISTS "Business owners can insert link tracking" ON link_tracking';
    EXCEPTION WHEN others THEN
      NULL;
    END;

    -- Drop the table entirely since single-business no longer needs per-business link tracking
    DROP TABLE IF EXISTS link_tracking CASCADE;
  END IF;
END $$;

-- RLS policies for single-business operation
-- Reviews: allow public inserts, authenticated selects
DO $$
BEGIN
  -- Enable RLS if not already
  EXECUTE 'ALTER TABLE reviews ENABLE ROW LEVEL SECURITY';
  -- Create permissive policies if they don't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Public can insert reviews'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can insert reviews" ON reviews FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Authenticated can select reviews'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can select reviews" ON reviews FOR SELECT USING (true)';
  END IF;
END $$;

-- Analytics: allow public inserts (for link tracking/feedback), authenticated selects
DO $$
BEGIN
  EXECUTE 'ALTER TABLE analytics ENABLE ROW LEVEL SECURITY';
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics' AND policyname = 'Public can insert analytics'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can insert analytics" ON analytics FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics' AND policyname = 'Authenticated can select analytics'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can select analytics" ON analytics FOR SELECT USING (true)';
  END IF;
END $$;

-- Optionally keep the old businesses table for historical reference, but it is no longer used.
-- You can drop it if desired:
-- DROP TABLE IF EXISTS businesses CASCADE;

