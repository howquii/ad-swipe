-- Ad Swipe Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ads (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id                       text UNIQUE NOT NULL,
  page_name                   text,
  page_id                     text,
  ad_creative_body            text,
  ad_creative_link_caption    text,
  ad_creative_link_description text,
  ad_creative_link_title      text,
  ad_snapshot_url             text,
  thumbnail_url               text,
  video_url                   text,
  media_type                  text,
  delivery_start_time         text,
  delivery_stop_time          text,
  publisher_platforms         text[],
  country_iso_code            text,
  country_code                text,
  industry                    text,
  creatives_count             int,
  performance_score           int,
  score_label                 text,
  estimated_spend_min         int,
  estimated_spend_max         int,
  is_active                   boolean DEFAULT true,
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scrape_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query       text NOT NULL,
  country     text DEFAULT 'ALL',
  status      text DEFAULT 'pending',
  ads_found   int DEFAULT 0,
  error       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_ads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  ad_id         text REFERENCES ads(ad_id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(collection_id, ad_id)
);

-- Indexes for top performers filters
CREATE INDEX IF NOT EXISTS ads_industry_idx     ON ads(industry);
CREATE INDEX IF NOT EXISTS ads_country_code_idx ON ads(country_code);
CREATE INDEX IF NOT EXISTS ads_score_desc_idx   ON ads(performance_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS ads_media_type_idx   ON ads(media_type);
CREATE INDEX IF NOT EXISTS ads_is_active_idx    ON ads(is_active);

-- Add columns if table already exists
ALTER TABLE ads ADD COLUMN IF NOT EXISTS industry       text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS country_code   text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS creatives_count int;
