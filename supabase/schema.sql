-- ═══════════════════════════════════════════════════
-- OfferPath — Complete Database Schema
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ── Profiles (extends Supabase auth.users) ──────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'team')),
  ai_uses_this_week INTEGER DEFAULT 0,
  week_reset_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Resumes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled Resume',
  data JSONB NOT NULL DEFAULT '{}',
  template TEXT DEFAULT 'classic',
  theme JSONB DEFAULT '{}',
  is_base BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Companies ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  career_url TEXT,
  headquarters TEXT,
  notes TEXT,
  tier INTEGER CHECK (tier BETWEEN 1 AND 3),
  research_brief TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Jobs (Pipeline) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  url TEXT,
  status TEXT DEFAULT 'new'
    CHECK (status IN (
      'new', 'evaluated', 'applied',
      'interviewing', 'offered', 'rejected',
      'discarded', 'archived'
    )),
  score DECIMAL(2,1),
  tier INTEGER CHECK (tier BETWEEN 1 AND 3),
  archetype TEXT,
  evaluation JSONB DEFAULT '{}',
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ,
  interviewed_at TIMESTAMPTZ,
  offered_at TIMESTAMPTZ,
  salary_range TEXT,
  comp_details JSONB DEFAULT '{}',
  kanban_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Interview Preps ─────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_preps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  company_research TEXT,
  role_analysis TEXT,
  questions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ── Mock Interview Sessions ─────────────────────────
CREATE TABLE IF NOT EXISTS mock_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  transcript JSONB DEFAULT '[]',
  score DECIMAL(3,1),
  feedback JSONB DEFAULT '{}',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Story Bank ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  competency TEXT NOT NULL,
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  metrics TEXT,
  tags TEXT[],
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_preps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- All other tables: full CRUD for own data
CREATE POLICY "resumes_all" ON resumes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "companies_all" ON companies
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "jobs_all" ON jobs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "preps_all" ON interview_preps
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "mocks_all" ON mock_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "stories_all" ON stories
  FOR ALL USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════
-- Triggers & Functions
-- ═══════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at auto-trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated   BEFORE UPDATE ON profiles        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_resumes_updated    BEFORE UPDATE ON resumes         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_companies_updated  BEFORE UPDATE ON companies       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_jobs_updated       BEFORE UPDATE ON jobs            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_preps_updated      BEFORE UPDATE ON interview_preps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_stories_updated    BEFORE UPDATE ON stories         FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═══════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════

CREATE INDEX idx_resumes_user       ON resumes(user_id);
CREATE INDEX idx_resumes_updated    ON resumes(updated_at DESC);
CREATE INDEX idx_companies_user     ON companies(user_id);
CREATE INDEX idx_jobs_user          ON jobs(user_id);
CREATE INDEX idx_jobs_status        ON jobs(user_id, status);
CREATE INDEX idx_jobs_company       ON jobs(company_id);
CREATE INDEX idx_jobs_updated       ON jobs(updated_at DESC);
CREATE INDEX idx_preps_job          ON interview_preps(job_id);
CREATE INDEX idx_mocks_job          ON mock_sessions(job_id);
CREATE INDEX idx_stories_user       ON stories(user_id);
CREATE INDEX idx_stories_competency ON stories(user_id, competency);
