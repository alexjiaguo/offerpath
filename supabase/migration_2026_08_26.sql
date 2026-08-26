-- ═══════════════════════════════════════════════════
-- OfferPath - Schema Migration (2026-08-26)
-- Fixes schema inconsistencies identified in full database audit:
-- 1. mock_sessions: add question_pool for session continuity
-- 2. resumes: add ats_evaluations to persist ATS scores across devices
-- ═══════════════════════════════════════════════════

-- ── 1. mock_sessions: add question_pool column ──
ALTER TABLE mock_sessions ADD COLUMN IF NOT EXISTS question_pool JSONB DEFAULT '[]';

-- ── 2. resumes: add ats_evaluations column ──────
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS ats_evaluations JSONB DEFAULT '{}';
