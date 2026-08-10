-- ═══════════════════════════════════════════════════
-- OfferPath - Schema Migration (2026-08-10)
-- Brings database in sync with code changes since Apr 10
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ── 1. jobs: add history column ───────────────────
-- Server actions write job history entries on status
-- changes and note additions; column was missing.
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]';

-- ── 2. resumes: add section_order and section_visibility ──
-- Resume type has these as top-level fields; stores
-- persist them; sync code must send them.
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}';

-- ── 3. profiles: add INSERT RLS policy ────────────
-- Original schema only had SELECT and UPDATE policies.
-- Upsert from sync code needs INSERT permission.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert'
  ) THEN
    CREATE POLICY "profiles_insert" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ── 4. updated_at trigger for jobs.history ────────
-- Already have set_jobs_updated trigger; no new trigger needed.
-- history is managed by application code, not a trigger.
