-- Voer dit uit in de Supabase SQL editor

-- 1. Voeg products kolom toe aan profiles (welke producten heeft de user toegang tot)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '{"salesmachine": false, "marcos_crm": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Geef de hoofd-admin (jouw account) toegang tot alles
-- Vervang het e-mailadres hieronder door jouw eigen e-mailadres
UPDATE profiles
SET
  products = '{"salesmachine": true, "marcos_crm": true}'::jsonb,
  is_admin = true
WHERE email = 'maxim@quompasmarketing.nl';

-- 3. RLS policy zodat admins alle profielen kunnen lezen (voor het admin panel)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Verwijder de bestaande SELECT policy als die conflicteert
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- Bovenstaande regel is uitgecommentarieerd — verwijder alleen als je een duplicate policy error krijgt
