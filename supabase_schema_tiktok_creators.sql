-- Voer uit in Supabase SQL editor

CREATE TABLE tiktok_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sound_id UUID REFERENCES tiktok_sounds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  status TEXT DEFAULT 'wachten', -- 'wachten' | 'gedaan'
  video_url TEXT,
  reminded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tiktok_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tiktok_creators"
  ON tiktok_creators FOR ALL USING (auth.uid() = user_id);

CREATE INDEX tiktok_creators_sound_id ON tiktok_creators(sound_id);
