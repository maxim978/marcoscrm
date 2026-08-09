CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage their share links" ON share_links;
CREATE POLICY "Owners manage their share links" ON share_links FOR ALL USING (auth.uid() = owner_id);
