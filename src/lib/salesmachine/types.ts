export type SmPhase =
  | 'Nieuw'
  | 'Onderzoeken'
  | 'Verrijkt'
  | 'Gekwalificeerd'
  | 'Mail klaar'
  | 'Mail verzonden'
  | 'Follow-up'
  | 'Reactie'
  | 'Afspraak'
  | 'Offerte'
  | 'Gewonnen'
  | 'Verloren'

export const SM_PHASES: SmPhase[] = [
  'Nieuw', 'Onderzoeken', 'Verrijkt', 'Gekwalificeerd',
  'Mail klaar', 'Mail verzonden', 'Follow-up', 'Reactie',
  'Afspraak', 'Offerte', 'Gewonnen', 'Verloren',
]

export const PROVINCES = [
  'Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Noord-Brabant',
  'Gelderland', 'Overijssel', 'Friesland', 'Groningen',
  'Drenthe', 'Zeeland', 'Limburg', 'Flevoland',
]

export interface SmProjectProfile {
  businessType: string
  offer: string
  goal: string
  targetAudience: string
  keywords: string[]
  idealCompanyTypes: string[]
  valueProposition: string
  scoringCriteria: string[]
}

export interface SmProject {
  id: string
  user_id: string
  name: string
  description: string | null
  profile: SmProjectProfile | null
  keywords: string[]
  created_at: string
  updated_at: string
}

export interface SmLead {
  id: string
  project_id: string
  google_place_id: string | null
  name: string
  address: string | null
  city: string | null
  province: string | null
  website: string | null
  phone: string | null
  category: string | null
  score: number
  phase: SmPhase
  google_types: string[]
  enrichment_data: Record<string, unknown> | null
  notes: string | null
  created_at: string
}

export interface SmContact {
  id: string
  lead_id: string
  project_id: string
  name: string | null
  title: string | null
  email: string | null
  is_primary: boolean
  created_at: string
}

export interface SmEmail {
  id: string
  lead_id: string
  project_id: string
  subject: string | null
  body: string | null
  follow_up: string | null
  created_at: string
}

export interface SmCampaign {
  id: string
  project_id: string
  name: string
  status: string
  description: string | null
  created_at: string
}
