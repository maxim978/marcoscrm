-- Team members table: one owner can invite multiple members (read-only access)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, member_id)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage their team" ON team_members;
CREATE POLICY "Owners manage their team" ON team_members FOR ALL USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Members can see their membership" ON team_members;
CREATE POLICY "Members can see their membership" ON team_members FOR SELECT USING (auth.uid() = member_id);

-- Grant team member READ access on all TikTok tables
-- (write access stays restricted to owner via existing policies)

DROP POLICY IF EXISTS "Team members can read campaigns" ON tiktok_manual_campaigns;
CREATE POLICY "Team members can read campaigns" ON tiktok_manual_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE owner_id = tiktok_manual_campaigns.user_id AND member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can read adsets" ON tiktok_adsets;
CREATE POLICY "Team members can read adsets" ON tiktok_adsets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE owner_id = tiktok_adsets.user_id AND member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can read adset entries" ON tiktok_adset_entries;
CREATE POLICY "Team members can read adset entries" ON tiktok_adset_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE owner_id = tiktok_adset_entries.user_id AND member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can read campaign daily" ON tiktok_campaign_daily;
CREATE POLICY "Team members can read campaign daily" ON tiktok_campaign_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE owner_id = tiktok_campaign_daily.user_id AND member_id = auth.uid()
    )
  );
