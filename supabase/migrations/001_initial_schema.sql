-- =============================================
-- Golf Charity Subscription Platform
-- Initial Database Schema
-- =============================================

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO '';

-- =============================================
-- CHARITIES (must be created first for FK reference)
-- =============================================
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Charities are viewable by everyone" ON public.charities
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert charities" ON public.charities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update charities" ON public.charities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete charities" ON public.charities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  charity_id UUID REFERENCES public.charities(id),
  charity_percentage NUMERIC DEFAULT 10 CHECK (charity_percentage >= 10),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- SCORES
-- =============================================
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.scores
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert own scores" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON public.scores
  FOR DELETE USING (auth.uid() = user_id);

-- Function to maintain max 5 scores per user (rolling window)
CREATE OR REPLACE FUNCTION public.manage_rolling_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_score_id UUID;
BEGIN
  -- Count existing scores for this user
  SELECT COUNT(*) INTO score_count
  FROM public.scores
  WHERE user_id = NEW.user_id;

  -- If user already has 5 scores, delete the oldest
  IF score_count >= 5 THEN
    SELECT id INTO oldest_score_id
    FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY played_date ASC, created_at ASC
    LIMIT 1;

    DELETE FROM public.scores WHERE id = oldest_score_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER before_score_insert
  BEFORE INSERT ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.manage_rolling_scores();

-- =============================================
-- DRAWS
-- =============================================
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  draw_mode TEXT CHECK (draw_mode IN ('random', 'algorithm')),
  total_pool NUMERIC DEFAULT 0,
  jackpot_pool NUMERIC DEFAULT 0,
  four_match_pool NUMERIC DEFAULT 0,
  three_match_pool NUMERIC DEFAULT 0,
  jackpot_rollover NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published draws are viewable by everyone" ON public.draws
  FOR SELECT USING (status = 'published' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can manage draws" ON public.draws
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- DRAW ENTRIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  entry_scores INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own draw entries" ON public.draw_entries
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can create draw entries" ON public.draw_entries
  FOR INSERT WITH CHECK (true);

-- =============================================
-- WINNINGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.winnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES public.draws(id),
  user_id UUID REFERENCES public.profiles(id),
  draw_entry_id UUID REFERENCES public.draw_entries(id),
  match_type TEXT CHECK (match_type IN ('5-match', '4-match', '3-match')),
  amount NUMERIC NOT NULL,
  proof_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own winnings" ON public.winnings
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own winnings (proof upload)" ON public.winnings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all winnings" ON public.winnings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- DONATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  charity_id UUID REFERENCES public.charities(id),
  amount NUMERIC NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donations" ON public.donations
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can create donations" ON public.donations
  FOR INSERT WITH CHECK (true);

-- =============================================
-- ADMIN LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can insert logs" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_scores_played_date ON public.scores(played_date DESC);
CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_draws_date ON public.draws(draw_date DESC);
CREATE INDEX idx_draw_entries_draw_id ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON public.draw_entries(user_id);
CREATE INDEX idx_winnings_user_id ON public.winnings(user_id);
CREATE INDEX idx_winnings_draw_id ON public.winnings(draw_id);
CREATE INDEX idx_winnings_status ON public.winnings(verification_status);
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_charity_id ON public.donations(charity_id);
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);

-- =============================================
-- SEED DATA: Sample Charities
-- =============================================
INSERT INTO public.charities (name, description, category, is_featured, is_active) VALUES
  ('Children First Foundation', 'Providing education and healthcare to underprivileged children worldwide. Every contribution helps build schools, fund scholarships, and deliver essential medical care.', 'Education', true, true),
  ('Green Earth Alliance', 'Fighting climate change through reforestation, ocean conservation, and sustainable development initiatives across 40 countries.', 'Environment', true, true),
  ('Veterans Support Network', 'Supporting military veterans with housing, mental health services, career training, and community reintegration programs.', 'Veterans', false, true),
  ('Local Food Bank Coalition', 'Combating hunger in local communities by distributing fresh food, running nutrition education programs, and supporting urban farming initiatives.', 'Community', true, true),
  ('Medical Research Institute', 'Advancing breakthrough medical research in cancer, rare diseases, and preventive medicine through cutting-edge clinical trials.', 'Healthcare', false, true),
  ('Arts & Culture Foundation', 'Preserving cultural heritage and making arts education accessible to all communities through grants, programs, and public exhibitions.', 'Arts', false, true);
