-- Add Radiostations and Radio Contacts tables

CREATE TABLE radio_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE radio_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES radio_stations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  instagram TEXT,
  tiktok TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own radio stations" ON radio_stations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage contacts for own stations" ON radio_contacts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM radio_stations 
    WHERE radio_stations.id = radio_contacts.station_id 
    AND radio_stations.user_id = auth.uid()
  )
);
