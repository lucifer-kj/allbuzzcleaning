-- Set default All Buzz Cleaning settings
-- This migration ensures the app is properly configured for All Buzz Cleaning

-- Update the default app settings for All Buzz Cleaning
UPDATE app_settings SET
  name = 'All Buzz Cleaning',
  description = 'Professional cleaning services for residential and commercial properties globally',
  welcome_message = 'Thank you for choosing All Buzz Cleaning! Please share your cleaning service experience.',
  thank_you_message = 'Thank you for your feedback! Your review helps us improve our cleaning services.',
  brand_color = '#1e40af', -- Professional blue color
  updated_at = NOW()
WHERE id = TRUE;

-- Ensure we have the default settings if none exist
INSERT INTO app_settings (
  id,
  name,
  description,
  welcome_message,
  thank_you_message,
  brand_color
) VALUES (
  TRUE,
  'All Buzz Cleaning',
  'Professional cleaning services for residential and commercial properties globally',
  'Thank you for choosing All Buzz Cleaning! Please share your cleaning service experience.',
  'Thank you for your feedback! Your review helps us improve our cleaning services.',
  '#1e40af'
) ON CONFLICT (id) DO NOTHING;
