-- TikTok Ads Dashboard Schema
-- Run this in your Supabase SQL editor

-- Ad Accounts
CREATE TABLE IF NOT EXISTS tiktok_ad_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  timezone TEXT DEFAULT 'Europe/Amsterdam',
  access_token_enc TEXT,
  refresh_token_enc TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, external_id)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS tiktok_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES tiktok_ad_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  objective TEXT,
  budget NUMERIC DEFAULT 0,
  budget_mode TEXT DEFAULT 'DAILY',
  start_date DATE,
  end_date DATE,
  artist_id UUID,
  release_id UUID,
  sound_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, external_id)
);

-- Ad Groups
CREATE TABLE IF NOT EXISTS tiktok_ad_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES tiktok_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  budget NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads
CREATE TABLE IF NOT EXISTS tiktok_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_group_id UUID REFERENCES tiktok_ad_groups(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES tiktok_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  thumbnail_url TEXT,
  video_url TEXT,
  tiktok_video_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Metrics (per entity)
CREATE TABLE IF NOT EXISTS tiktok_daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL, -- 'campaign', 'ad_group', 'ad', 'account'
  entity_id UUID NOT NULL,
  date DATE NOT NULL,
  spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpm NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  video_views_2s INTEGER DEFAULT 0,
  video_views_6s INTEGER DEFAULT 0,
  video_completions INTEGER DEFAULT 0,
  avg_watch_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, date)
);

-- Audience Metrics
CREATE TABLE IF NOT EXISTS tiktok_audience_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES tiktok_ad_accounts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  dimension TEXT NOT NULL, -- 'age', 'gender', 'country', 'device', 'hour', 'dow'
  dimension_value TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, date, dimension, dimension_value)
);

-- AI Insights
CREATE TABLE IF NOT EXISTS tiktok_ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES tiktok_ad_accounts(id) ON DELETE CASCADE,
  insights JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  period_start DATE,
  period_end DATE,
  model TEXT DEFAULT 'claude-sonnet-4-6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS tiktok_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES tiktok_ad_accounts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES tiktok_campaigns(id) ON DELETE SET NULL,
  ad_id UUID REFERENCES tiktok_ads(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  suggested_action TEXT,
  is_read BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Goals
CREATE TABLE IF NOT EXISTS tiktok_dashboard_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES tiktok_ad_accounts(id) ON DELETE CASCADE,
  max_cpm NUMERIC,
  max_cpc NUMERIC,
  max_cost_per_follower NUMERIC,
  min_ctr NUMERIC,
  min_engagement_rate NUMERIC,
  min_completion_rate NUMERIC,
  week_budget NUMERIC,
  month_budget NUMERIC,
  target_followers INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, account_id)
);

-- Sync Logs
CREATE TABLE IF NOT EXISTS tiktok_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES tiktok_ad_accounts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'idle',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tiktok_daily_metrics_entity ON tiktok_daily_metrics(entity_type, entity_id, date);
CREATE INDEX IF NOT EXISTS idx_tiktok_daily_metrics_user_date ON tiktok_daily_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tiktok_campaigns_account ON tiktok_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_alerts_user ON tiktok_alerts(user_id, is_read, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_ad_groups_campaign ON tiktok_ad_groups(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_ads_campaign ON tiktok_ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_audience_account_date ON tiktok_audience_metrics(account_id, date);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tiktok_ad_accounts_updated_at
  BEFORE UPDATE ON tiktok_ad_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiktok_campaigns_updated_at
  BEFORE UPDATE ON tiktok_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiktok_ad_groups_updated_at
  BEFORE UPDATE ON tiktok_ad_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiktok_ads_updated_at
  BEFORE UPDATE ON tiktok_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiktok_dashboard_goals_updated_at
  BEFORE UPDATE ON tiktok_dashboard_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE tiktok_ad_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their ad accounts" ON tiktok_ad_accounts;
CREATE POLICY "Users own their ad accounts" ON tiktok_ad_accounts
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their campaigns" ON tiktok_campaigns;
CREATE POLICY "Users own their campaigns" ON tiktok_campaigns
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_ad_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their ad groups" ON tiktok_ad_groups;
CREATE POLICY "Users own their ad groups" ON tiktok_ad_groups
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their ads" ON tiktok_ads;
CREATE POLICY "Users own their ads" ON tiktok_ads
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_daily_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their metrics" ON tiktok_daily_metrics;
CREATE POLICY "Users own their metrics" ON tiktok_daily_metrics
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_audience_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their audience metrics" ON tiktok_audience_metrics;
CREATE POLICY "Users own their audience metrics" ON tiktok_audience_metrics
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_ai_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their insights" ON tiktok_ai_insights;
CREATE POLICY "Users own their insights" ON tiktok_ai_insights
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their alerts" ON tiktok_alerts;
CREATE POLICY "Users own their alerts" ON tiktok_alerts
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_dashboard_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their goals" ON tiktok_dashboard_goals;
CREATE POLICY "Users own their goals" ON tiktok_dashboard_goals
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tiktok_sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own their sync logs" ON tiktok_sync_logs;
CREATE POLICY "Users own their sync logs" ON tiktok_sync_logs
  FOR ALL USING (auth.uid() = user_id);
