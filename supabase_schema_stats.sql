-- Voer uit in Supabase SQL editor

-- Streams per week (ma t/m zo)
CREATE TABLE release_stream_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  maandag INTEGER DEFAULT 0,
  dinsdag INTEGER DEFAULT 0,
  woensdag INTEGER DEFAULT 0,
  donderdag INTEGER DEFAULT 0,
  vrijdag INTEGER DEFAULT 0,
  zaterdag INTEGER DEFAULT 0,
  zondag INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(release_id, week_number)
);

ALTER TABLE release_stream_weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stream weeks" ON release_stream_weeks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM releases r
    JOIN artists a ON a.id = r.artist_id
    WHERE r.id = release_stream_weeks.release_id AND a.user_id = auth.uid()
  )
);

-- Playlist saves (cumulatief per dag)
CREATE TABLE release_playlist_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE NOT NULL,
  datum DATE NOT NULL,
  aantal INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(release_id, datum)
);

ALTER TABLE release_playlist_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own playlist saves" ON release_playlist_saves FOR ALL USING (
  EXISTS (
    SELECT 1 FROM releases r
    JOIN artists a ON a.id = r.artist_id
    WHERE r.id = release_playlist_saves.release_id AND a.user_id = auth.uid()
  )
);
