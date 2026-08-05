-- Ad set structuur (campagne + ad sets configuratie)
CREATE TABLE IF NOT EXISTS tiktok_adsets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_name TEXT NOT NULL DEFAULT 'Campagne 1',
  name TEXT NOT NULL,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tiktok_adsets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their adsets" ON tiktok_adsets FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_adsets_user ON tiktok_adsets(user_id, order_num);

-- Dagelijkse metrics per ad set
CREATE TABLE IF NOT EXISTS tiktok_adset_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  adset_id UUID REFERENCES tiktok_adsets(id) ON DELETE CASCADE NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(adset_id, datum)
);
ALTER TABLE tiktok_adset_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their adset entries" ON tiktok_adset_entries FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_adset_entries_user_datum ON tiktok_adset_entries(user_id, datum DESC);
