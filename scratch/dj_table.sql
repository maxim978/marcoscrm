-- Add DJs table

CREATE TABLE djs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  website TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE djs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own djs" ON djs FOR ALL USING (auth.uid() = user_id);
