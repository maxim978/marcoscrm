-- Handmatige campagnes tabel (aparte tabel om conflict met TikTok API schema te vermijden)
CREATE TABLE IF NOT EXISTS tiktok_manual_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tiktok_manual_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their manual campaigns" ON tiktok_manual_campaigns;
CREATE POLICY "Users own their manual campaigns" ON tiktok_manual_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_manual_campaigns_user ON tiktok_manual_campaigns(user_id);

-- Voeg campaign_id toe aan adsets (als die kolom er nog niet is)
ALTER TABLE tiktok_adsets ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES tiktok_manual_campaigns(id) ON DELETE CASCADE;

-- Migreer bestaande adsets naar campagnes
DO $$
DECLARE
  r RECORD;
  new_id UUID;
BEGIN
  FOR r IN
    SELECT DISTINCT user_id, campaign_name FROM tiktok_adsets WHERE campaign_id IS NULL
  LOOP
    INSERT INTO tiktok_manual_campaigns (user_id, name)
    VALUES (r.user_id, r.campaign_name)
    RETURNING id INTO new_id;

    UPDATE tiktok_adsets
    SET campaign_id = new_id
    WHERE user_id = r.user_id AND campaign_name = r.campaign_name AND campaign_id IS NULL;
  END LOOP;
END $$;
