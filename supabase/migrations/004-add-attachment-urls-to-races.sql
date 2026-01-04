-- Migration: Add attachment_urls column to races table
-- This allows storing multiple attachments per race

-- Add the new attachment_urls column as a JSON array
ALTER TABLE races ADD COLUMN IF NOT EXISTS attachment_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single attachment_url to the new array format
UPDATE races 
SET attachment_urls = jsonb_build_array(attachment_url)
WHERE attachment_url IS NOT NULL 
  AND attachment_url != ''
  AND (attachment_urls IS NULL OR attachment_urls = '[]'::jsonb);

-- Note: We keep the old attachment_url column for backwards compatibility
-- It can be dropped in a future migration after confirming all data is migrated

