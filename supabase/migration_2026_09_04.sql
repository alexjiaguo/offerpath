-- Migration 2026-09-04: rename weekly quota columns to monthly names.
-- The quota window has always been 30 days (see MONTH_MS in aiQuota.ts);
-- the old _week names were a misnomer. Idempotent for fresh + existing DBs.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ai_uses_this_week'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN ai_uses_this_week TO ai_uses_this_month;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'week_reset_at'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN week_reset_at TO month_reset_at;
  END IF;
END $$;
