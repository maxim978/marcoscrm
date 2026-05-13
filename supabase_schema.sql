-- Supabase Schema for Marcos CRM MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Artists Table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  genre TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own artists" ON artists FOR ALL USING (auth.uid() = user_id);

-- 3. Releases Table
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  release_date DATE,
  genre TEXT,
  mood TEXT,
  similar_artists TEXT[],
  focus_countries TEXT[],
  links JSONB, -- store spotify/youtube links as json
  status TEXT DEFAULT 'gepland', -- gepland, live, afgerond
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own releases" ON releases FOR ALL USING (
  EXISTS (
    SELECT 1 FROM artists WHERE artists.id = releases.artist_id AND artists.user_id = auth.uid()
  )
);

-- 4. Targets Table (CRM Contacts)
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT, -- playlist, curator, radio, social creator, blog, DJ, label, media, overig
  platform TEXT,
  contact_name TEXT,
  email TEXT,
  social_links JSONB,
  country TEXT,
  city TEXT,
  genres TEXT[],
  moods TEXT[],
  followers INTEGER DEFAULT 0,
  contact_method TEXT,
  relationship_status TEXT DEFAULT 'koud', -- koud, warm, supporter, prioriteit
  score INTEGER DEFAULT 0, -- 1-100
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own targets" ON targets FOR ALL USING (auth.uid() = user_id);

-- 5. Release Targets (Hitlist mapping)
CREATE TABLE release_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES targets(id) ON DELETE CASCADE NOT NULL,
  outreach_status TEXT DEFAULT 'nog niet benaderd', -- nog niet benaderd, benaderd, geopend/gezien, gereageerd, geplaatst, afgewezen, follow-up nodig
  priority_score INTEGER DEFAULT 0,
  contacted_at TIMESTAMP WITH TIME ZONE,
  follow_up_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(release_id, target_id)
);

ALTER TABLE release_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own release targets" ON release_targets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM targets WHERE targets.id = release_targets.target_id AND targets.user_id = auth.uid()
  )
);

-- 6. Support Events
CREATE TABLE support_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  target_id UUID REFERENCES targets(id) ON DELETE CASCADE NOT NULL,
  support_type TEXT, -- playlist add, radio spin, social post, blogpost, repost, DJ support
  date DATE,
  proof_link TEXT,
  estimated_impact TEXT,
  notes TEXT
);

ALTER TABLE support_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own support events" ON support_events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM targets WHERE targets.id = support_events.target_id AND targets.user_id = auth.uid()
  )
);

-- 7. Outreach Messages (AI output)
CREATE TABLE outreach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES targets(id) ON DELETE CASCADE NOT NULL,
  channel TEXT,
  message TEXT,
  tone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own outreach messages" ON outreach_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM targets WHERE targets.id = outreach_messages.target_id AND targets.user_id = auth.uid()
  )
);
