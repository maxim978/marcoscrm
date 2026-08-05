-- Handmatige TikTok Ads invoer per dag
CREATE TABLE tiktok_manual_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  datum DATE NOT NULL,
  spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpm NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, datum)
);

ALTER TABLE tiktok_manual_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their manual entries"
  ON tiktok_manual_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_tiktok_manual_entries_user_datum
  ON tiktok_manual_entries(user_id, datum DESC);
