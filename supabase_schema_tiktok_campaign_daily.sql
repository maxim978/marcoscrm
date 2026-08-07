CREATE TABLE IF NOT EXISTS tiktok_campaign_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES tiktok_manual_campaigns(id) ON DELETE CASCADE NOT NULL,
  datum DATE NOT NULL,
  streams INTEGER DEFAULT 0,
  playlist_saves INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, datum)
);
ALTER TABLE tiktok_campaign_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their campaign daily" ON tiktok_campaign_daily;
CREATE POLICY "Users own their campaign daily" ON tiktok_campaign_daily FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_campaign_daily_campaign_datum ON tiktok_campaign_daily(campaign_id, datum DESC);
