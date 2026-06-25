-- Salesmachine Schema
-- Voer dit uit in de Supabase SQL editor

-- Projects tabel
CREATE TABLE sm_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  profile JSONB,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE sm_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sm_projects" ON sm_projects FOR ALL USING (auth.uid() = user_id);

-- Leads tabel
CREATE TABLE sm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES sm_projects(id) ON DELETE CASCADE NOT NULL,
  google_place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  website TEXT,
  phone TEXT,
  category TEXT,
  score INTEGER DEFAULT 0,
  phase TEXT DEFAULT 'Nieuw',
  google_types TEXT[] DEFAULT '{}',
  enrichment_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, google_place_id)
);
ALTER TABLE sm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sm_leads" ON sm_leads FOR ALL USING (
  EXISTS (SELECT 1 FROM sm_projects WHERE sm_projects.id = sm_leads.project_id AND sm_projects.user_id = auth.uid())
);
CREATE INDEX sm_leads_project_id ON sm_leads(project_id);
CREATE INDEX sm_leads_phase ON sm_leads(phase);
CREATE INDEX sm_leads_category ON sm_leads(category);

-- Contacts tabel
CREATE TABLE sm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES sm_leads(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES sm_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  title TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE sm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sm_contacts" ON sm_contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM sm_projects WHERE sm_projects.id = sm_contacts.project_id AND sm_projects.user_id = auth.uid())
);
CREATE INDEX sm_contacts_lead_id ON sm_contacts(lead_id);
CREATE INDEX sm_contacts_project_id ON sm_contacts(project_id);

-- Emails tabel
CREATE TABLE sm_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES sm_leads(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES sm_projects(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  body TEXT,
  follow_up TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE sm_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sm_emails" ON sm_emails FOR ALL USING (
  EXISTS (SELECT 1 FROM sm_projects WHERE sm_projects.id = sm_emails.project_id AND sm_projects.user_id = auth.uid())
);

-- Campaigns tabel
CREATE TABLE sm_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES sm_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'actief',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE sm_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sm_campaigns" ON sm_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM sm_projects WHERE sm_projects.id = sm_campaigns.project_id AND sm_projects.user_id = auth.uid())
);
