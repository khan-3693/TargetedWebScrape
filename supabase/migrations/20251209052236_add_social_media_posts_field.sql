/*
  # Add Social Media Posts Field

  1. Changes
    - Add `social_media_posts` column to `scrapes` table to store generated social media content
    - This field will store JSON data with comedic and serious posts

  2. Notes
    - The field stores a JSON structure with two arrays: comedic posts and serious posts
    - Each post contains an ID, content, and category
*/

-- Add social_media_posts column to scrapes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'social_media_posts'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN social_media_posts text;
  END IF;
END $$;
