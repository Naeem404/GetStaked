-- ============================================================
-- GetStaked: COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cpkcskwkoafopqfnznkd/sql/new
--
-- This file consolidates ALL migrations + RLS fixes into one.
-- It is safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================


-- ═══════════════════════════════════════════════════════════════
-- PART 1: COLUMNS — ensure all tables have required columns
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  -- proofs
  ALTER TABLE proofs ADD COLUMN IF NOT EXISTS ai_confidence FLOAT;
  ALTER TABLE proofs ADD COLUMN IF NOT EXISTS ai_reasoning TEXT;
  ALTER TABLE proofs ADD COLUMN IF NOT EXISTS ai_flags JSONB DEFAULT '[]'::JSONB;
  ALTER TABLE proofs ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
  ALTER TABLE proofs ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES pool_members(id);

  -- pool_members
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS total_proofs INT DEFAULT 0;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS last_proof_date DATE;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS best_streak INT DEFAULT 0;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS days_completed INT DEFAULT 0;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS stake_tx_signature TEXT;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS payout_tx_signature TEXT;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS staked_amount NUMERIC DEFAULT 0;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS winnings NUMERIC DEFAULT 0;

  -- profiles
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_persona TEXT DEFAULT 'drill_sergeant';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_voice_enabled BOOLEAN DEFAULT true;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sol_staked NUMERIC DEFAULT 0;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sol_earned NUMERIC DEFAULT 0;

  -- pools
  ALTER TABLE pools ADD COLUMN IF NOT EXISTS escrow_address TEXT;
  ALTER TABLE pools ADD COLUMN IF NOT EXISTS treasury_address TEXT;
  ALTER TABLE pools ADD COLUMN IF NOT EXISTS streak_leader INT DEFAULT 0;

  -- pool_invites
  ALTER TABLE pool_invites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
  ALTER TABLE pool_invites ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Unique constraint on daily_habits
DO $$ BEGIN
  ALTER TABLE daily_habits ADD CONSTRAINT daily_habits_user_id_habit_date_key UNIQUE (user_id, habit_date);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Unique constraint on username
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- PART 2: STORAGE — proof-images bucket
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('proof-images', 'proof-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Users can upload proof images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'proof-images' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view proof images"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'proof-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own proof images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'proof-images' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ═══════════════════════════════════════════════════════════════
-- PART 3: RLS POLICIES — clean, non-recursive
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid duplicates/recursion
DO $$
DECLARE pol RECORD; tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'pool_members','proofs','pools','profiles',
    'activity_log','daily_habits','transactions',
    'friendships','pool_invites','coach_messages'
  ]) LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- pool_members
CREATE POLICY "pm_select" ON pool_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "pm_insert" ON pool_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pm_update" ON pool_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pm_delete" ON pool_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- pools
CREATE POLICY "pools_select" ON pools FOR SELECT TO authenticated USING (true);
CREATE POLICY "pools_insert" ON pools FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "pools_update" ON pools FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- proofs
CREATE POLICY "proofs_select_own" ON proofs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "proofs_select_pool" ON proofs FOR SELECT TO authenticated
  USING (pool_id IN (SELECT id FROM pools WHERE status IN ('active','waiting')));
CREATE POLICY "proofs_insert" ON proofs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "proofs_update" ON proofs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- activity_log
CREATE POLICY "al_select" ON activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "al_insert" ON activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- daily_habits
CREATE POLICY "dh_select" ON daily_habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dh_insert" ON daily_habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dh_update" ON daily_habits FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- transactions
CREATE POLICY "tx_select" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tx_insert" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- friendships
CREATE POLICY "fr_select" ON friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "fr_insert" ON friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "fr_update" ON friendships FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "fr_delete" ON friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- pool_invites
CREATE POLICY "pi_select" ON pool_invites FOR SELECT TO authenticated
  USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);
CREATE POLICY "pi_insert" ON pool_invites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = invited_by);
CREATE POLICY "pi_update" ON pool_invites FOR UPDATE TO authenticated
  USING (auth.uid() = invited_user_id);

-- coach_messages
CREATE POLICY "cm_select" ON coach_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cm_insert" ON coach_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════
-- PART 4: RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- 4a. process_proof_verification
CREATE OR REPLACE FUNCTION process_proof_verification(
  p_proof_id UUID, p_status TEXT, p_confidence FLOAT, p_reasoning TEXT, p_flags JSONB DEFAULT '[]'::JSONB
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID; v_pool_id UUID; v_member_id UUID; v_today DATE := CURRENT_DATE;
BEGIN
  SELECT user_id, pool_id, member_id INTO v_user_id, v_pool_id, v_member_id FROM proofs WHERE id = p_proof_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proof not found: %', p_proof_id; END IF;

  UPDATE proofs SET status = p_status, ai_confidence = p_confidence, ai_reasoning = p_reasoning, ai_flags = p_flags, verified_at = NOW() WHERE id = p_proof_id;

  IF p_status = 'approved' THEN
    UPDATE pool_members SET last_proof_date = v_today, current_streak = current_streak + 1, total_proofs = total_proofs + 1 WHERE id = v_member_id;
    INSERT INTO daily_habits (user_id, habit_date, proofs_count) VALUES (v_user_id, v_today, 1)
      ON CONFLICT (user_id, habit_date) DO UPDATE SET proofs_count = daily_habits.proofs_count + 1;
    UPDATE profiles SET total_proofs_submitted = COALESCE(total_proofs_submitted, 0) + 1,
      current_streak = COALESCE(current_streak, 0) + 1,
      best_streak = GREATEST(COALESCE(best_streak, 0), COALESCE(current_streak, 0) + 1)
    WHERE id = v_user_id;
    INSERT INTO activity_log (user_id, pool_id, action, description)
      VALUES (v_user_id, v_pool_id, 'proof_verified', 'Proof verified (confidence: ' || ROUND(p_confidence::numeric, 2) || ')');
  ELSIF p_status = 'rejected' THEN
    INSERT INTO activity_log (user_id, pool_id, action, description)
      VALUES (v_user_id, v_pool_id, 'proof_rejected', 'Proof rejected: ' || p_reasoning);
  END IF;
END; $$;

-- 4b. calculate_global_streak
CREATE OR REPLACE FUNCTION calculate_global_streak(p_user_id uuid)
RETURNS TABLE(current_streak int, best_streak int) AS $$
DECLARE v_current int := 0; v_best int := 0; v_date date; v_prev date; v_streak int := 0;
BEGIN
  FOR v_date IN SELECT habit_date FROM daily_habits WHERE user_id = p_user_id AND proofs_count > 0 ORDER BY habit_date DESC LOOP
    IF v_prev IS NULL THEN
      IF v_date >= CURRENT_DATE - 1 THEN v_streak := 1; ELSE v_streak := 0; END IF;
      v_prev := v_date; CONTINUE;
    END IF;
    IF v_prev - v_date = 1 THEN v_streak := v_streak + 1; ELSE IF v_streak > v_best THEN v_best := v_streak; END IF; v_streak := 0; END IF;
    v_prev := v_date;
  END LOOP;
  v_current := v_streak; IF v_streak > v_best THEN v_best := v_streak; END IF;
  v_streak := 0; v_prev := NULL;
  FOR v_date IN SELECT habit_date FROM daily_habits WHERE user_id = p_user_id AND proofs_count > 0 ORDER BY habit_date ASC LOOP
    IF v_prev IS NULL THEN v_streak := 1; v_prev := v_date; CONTINUE; END IF;
    IF v_date - v_prev = 1 THEN v_streak := v_streak + 1; ELSE IF v_streak > v_best THEN v_best := v_streak; END IF; v_streak := 1; END IF;
    v_prev := v_date;
  END LOOP;
  IF v_streak > v_best THEN v_best := v_streak; END IF;
  UPDATE profiles SET current_streak = v_current, best_streak = GREATEST(COALESCE(profiles.best_streak, 0), v_best), updated_at = now() WHERE id = p_user_id;
  RETURN QUERY SELECT v_current, v_best;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4c. get_global_leaderboard
CREATE OR REPLACE FUNCTION get_global_leaderboard(p_limit int DEFAULT 50)
RETURNS TABLE(user_id uuid, display_name text, username text, avatar_url text, wallet_address text, current_streak int, best_streak int, total_pools_joined int, total_pools_won int, total_sol_earned numeric, total_proofs_submitted int, rank bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.display_name::text, p.username::text, p.avatar_url::text, p.wallet_address::text,
    COALESCE(p.current_streak,0)::int, COALESCE(p.best_streak,0)::int,
    COALESCE(p.total_pools_joined,0)::int, COALESCE(p.total_pools_won,0)::int,
    COALESCE(p.total_sol_earned,0)::numeric, COALESCE(p.total_proofs_submitted,0)::int,
    ROW_NUMBER() OVER (ORDER BY COALESCE(p.current_streak,0) DESC, COALESCE(p.best_streak,0) DESC, COALESCE(p.total_proofs_submitted,0) DESC)
  FROM profiles p
  WHERE COALESCE(p.current_streak,0) > 0 OR COALESCE(p.total_pools_joined,0) > 0
  ORDER BY ROW_NUMBER() OVER (ORDER BY COALESCE(p.current_streak,0) DESC, COALESCE(p.best_streak,0) DESC, COALESCE(p.total_proofs_submitted,0) DESC)
  LIMIT p_limit;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4d. get_pool_leaderboard
CREATE OR REPLACE FUNCTION get_pool_leaderboard(p_pool_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, current_streak int, best_streak int, days_completed int, total_proofs int, rank bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT pm.user_id, p.display_name::text, p.avatar_url::text,
    COALESCE(pm.current_streak,0)::int, COALESCE(pm.best_streak,0)::int, COALESCE(pm.days_completed,0)::int,
    (SELECT COUNT(*)::int FROM proofs pr WHERE pr.user_id = pm.user_id AND pr.pool_id = p_pool_id AND pr.status = 'approved'),
    ROW_NUMBER() OVER (ORDER BY COALESCE(pm.current_streak,0) DESC, COALESCE(pm.days_completed,0) DESC)
  FROM pool_members pm JOIN profiles p ON p.id = pm.user_id
  WHERE pm.pool_id = p_pool_id AND pm.status = 'active'
  ORDER BY ROW_NUMBER() OVER (ORDER BY COALESCE(pm.current_streak,0) DESC, COALESCE(pm.days_completed,0) DESC);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4e. record_sol_transaction
CREATE OR REPLACE FUNCTION record_sol_transaction(p_user_id uuid, p_pool_id uuid, p_type text, p_amount numeric, p_tx_signature text)
RETURNS uuid AS $$
DECLARE v_tx_id uuid;
BEGIN
  INSERT INTO transactions (user_id, pool_id, type, amount, tx_signature, status)
  VALUES (p_user_id, p_pool_id, p_type::transaction_type, p_amount, p_tx_signature, 'confirmed')
  RETURNING id INTO v_tx_id;
  IF p_type = 'stake_deposit' THEN
    UPDATE pool_members SET stake_tx_signature = p_tx_signature, staked_amount = p_amount WHERE pool_id = p_pool_id AND user_id = p_user_id;
    UPDATE profiles SET total_sol_staked = COALESCE(total_sol_staked, 0) + p_amount WHERE id = p_user_id;
  END IF;
  IF p_type = 'winnings_claim' THEN
    UPDATE pool_members SET payout_tx_signature = p_tx_signature, winnings = p_amount WHERE pool_id = p_pool_id AND user_id = p_user_id;
    UPDATE profiles SET total_sol_earned = COALESCE(total_sol_earned, 0) + p_amount WHERE id = p_user_id;
  END IF;
  RETURN v_tx_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4f. accept_pool_invite
CREATE OR REPLACE FUNCTION accept_pool_invite(p_invite_id uuid, p_user_id uuid)
RETURNS void AS $$
DECLARE v_invite RECORD;
BEGIN
  SELECT * INTO v_invite FROM pool_invites WHERE id = p_invite_id AND invited_user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invite not found'; END IF;
  IF v_invite.status != 'pending' THEN RAISE EXCEPTION 'Invite already responded to'; END IF;
  UPDATE pool_invites SET status = 'accepted', responded_at = now() WHERE id = p_invite_id;
  INSERT INTO pool_members (pool_id, user_id) VALUES (v_invite.pool_id, p_user_id) ON CONFLICT DO NOTHING;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- PART 5: TRIGGERS — auto-update pool stats on join/leave
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_pool_member_join() RETURNS TRIGGER AS $$
DECLARE v_pool RECORD;
BEGIN
  SELECT * INTO v_pool FROM pools WHERE id = NEW.pool_id;
  UPDATE pools SET current_players = COALESCE(current_players,0) + 1, pot_size = COALESCE(pot_size,0) + COALESCE(v_pool.stake_amount,0), updated_at = now() WHERE id = NEW.pool_id;
  IF v_pool.status = 'waiting' AND COALESCE(v_pool.current_players,0) + 1 >= 2 THEN
    UPDATE pools SET status = 'active', starts_at = now(), ends_at = now() + (v_pool.duration_days || ' days')::interval, updated_at = now() WHERE id = NEW.pool_id AND status = 'waiting';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pool_member_join ON pool_members;
CREATE TRIGGER on_pool_member_join AFTER INSERT ON pool_members FOR EACH ROW EXECUTE FUNCTION handle_pool_member_join();

CREATE OR REPLACE FUNCTION handle_pool_member_leave() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'active' AND (NEW.status = 'failed' OR NEW.status = 'withdrawn') THEN
    UPDATE pools SET current_players = GREATEST(COALESCE(current_players,1)-1, 0), updated_at = now() WHERE id = NEW.pool_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pool_member_status_change ON pool_members;
CREATE TRIGGER on_pool_member_status_change AFTER UPDATE OF status ON pool_members FOR EACH ROW EXECUTE FUNCTION handle_pool_member_leave();

CREATE OR REPLACE FUNCTION update_pool_streak_leader() RETURNS TRIGGER AS $$
BEGIN
  UPDATE pools SET streak_leader = (SELECT COALESCE(MAX(current_streak),0) FROM pool_members WHERE pool_id = NEW.pool_id AND status = 'active') WHERE id = NEW.pool_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_streak_update ON pool_members;
CREATE TRIGGER on_member_streak_update AFTER UPDATE OF current_streak ON pool_members FOR EACH ROW EXECUTE FUNCTION update_pool_streak_leader();


-- ═══════════════════════════════════════════════════════════════
-- PART 6: SEED POOLS — pre-made pools for testing
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE v_system_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO profiles (id, display_name, username) VALUES (v_system_id, 'GetStaked Official', 'getstaked') ON CONFLICT (id) DO NOTHING;

  INSERT INTO pools (id, creator_id, name, description, proof_description, emoji, category, stake_amount, duration_days, frequency, max_players, is_hot, status, is_private, current_players, pot_size) VALUES
    ('11111111-1111-1111-1111-111111111001', v_system_id, '30-Day Push-Up Challenge', 'Complete 50 push-ups daily for 30 days.', 'Photo/video of yourself doing push-ups.', '💪', 'fitness', 0.5, 30, 'daily', 20, true, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111002', v_system_id, 'Morning Run Club', 'Run at least 2 miles every morning before 9am.', 'Screenshot of running app showing distance and date.', '🏃', 'fitness', 1.0, 14, 'daily', 15, true, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111003', v_system_id, 'Gym Warrior', 'Hit the gym 5 times per week.', 'Selfie at the gym or photo of workout equipment.', '🏋️', 'fitness', 0.75, 28, '5x_week', 25, false, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111004', v_system_id, 'Clean Eating Challenge', 'Eat a healthy, home-cooked meal every day.', 'Photo of your healthy meal.', '🥗', 'health', 0.5, 21, 'daily', 30, false, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111005', v_system_id, 'Hydration Heroes', 'Drink at least 8 glasses of water daily.', 'Photo of water bottle or tracking app.', '💧', 'health', 0.25, 14, 'daily', 50, true, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111006', v_system_id, 'Code Every Day', 'Write code for at least 1 hour daily.', 'Screenshot of code editor or GitHub contribution.', '💻', 'education', 1.5, 30, 'daily', 20, true, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111007', v_system_id, 'Read 30 Pages', 'Read at least 30 pages of a book every day.', 'Photo of book page or audiobook progress.', '📚', 'education', 0.5, 21, 'daily', 25, false, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111008', v_system_id, 'Meditation Marathon', 'Meditate for at least 10 minutes daily.', 'Screenshot of meditation app timer.', '🧘', 'wellness', 0.5, 21, 'daily', 30, false, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111009', v_system_id, 'Cold Shower Warriors', 'Take a cold shower every morning. Min 2 minutes.', 'Photo after cold shower with visible water/shower.', '🥶', 'wellness', 1.0, 14, 'daily', 15, true, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111010', v_system_id, 'No Phone Before Noon', 'No social media before 12pm.', 'Screenshot of screen time showing no social media before noon.', '📵', 'productivity', 0.75, 14, 'daily', 40, false, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111011', v_system_id, 'Diamond Hands Fitness', 'Ultimate high-stakes fitness challenge. Train every day.', 'Photo/video of any physical exercise.', '💎', 'fitness', 5.0, 30, 'daily', 10, true, 'active', false, 0, 0),
    ('11111111-1111-1111-1111-111111111012', v_system_id, 'Daily Sketch Club', 'Draw or sketch something new every day.', 'Photo of sketch with today''s date written on it.', '🎨', 'creative', 0.25, 30, 'daily', 30, false, 'active', false, 0, 0)
  ON CONFLICT (id) DO NOTHING;

  UPDATE pools SET starts_at = now(), ends_at = now() + (duration_days || ' days')::interval WHERE creator_id = v_system_id AND starts_at IS NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- PART 7: INDEXES — performance
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_pm_pool_status ON pool_members(pool_id, status);
CREATE INDEX IF NOT EXISTS idx_pm_user_status ON pool_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_dh_user_date ON daily_habits(user_id, habit_date);
CREATE INDEX IF NOT EXISTS idx_proofs_user_pool ON proofs(user_id, pool_id);
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_fr_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_fr_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_pi_user ON pool_invites(invited_user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(current_streak DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);


-- ═══════════════════════════════════════════════════════════════
-- DONE!
-- ═══════════════════════════════════════════════════════════════
SELECT '✅ GetStaked database setup complete!' as result;
