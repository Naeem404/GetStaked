-- ============================================================
-- GetStaked Migration v11: Friends, Pools, Leaderboard, Streaks, Solana
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. STREAK SYSTEM: Improve calculate_global_streak to persist
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_global_streak(p_user_id uuid)
RETURNS TABLE(current_streak int, best_streak int) AS $$
DECLARE
  v_current int := 0;
  v_best int := 0;
  v_date date;
  v_prev date;
  v_streak int := 0;
BEGIN
  -- Walk backwards through daily_habits with proofs
  FOR v_date IN
    SELECT habit_date
    FROM daily_habits
    WHERE user_id = p_user_id AND proofs_count > 0
    ORDER BY habit_date DESC
  LOOP
    IF v_prev IS NULL THEN
      -- First iteration: check if it's today or yesterday (active streak)
      IF v_date >= CURRENT_DATE - 1 THEN
        v_streak := 1;
      ELSE
        -- Streak is broken (last proof was >1 day ago)
        v_streak := 0;
        -- Still count for best streak calculation below
      END IF;
      v_prev := v_date;
      CONTINUE;
    END IF;

    IF v_prev - v_date = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      -- Gap found, record best and reset
      IF v_streak > v_best THEN v_best := v_streak; END IF;
      v_streak := 0; -- This streak segment ended
    END IF;
    v_prev := v_date;
  END LOOP;

  -- Final comparison
  v_current := v_streak;
  IF v_streak > v_best THEN v_best := v_streak; END IF;

  -- Also check historical best from a full scan
  v_streak := 0;
  v_prev := NULL;
  FOR v_date IN
    SELECT habit_date
    FROM daily_habits
    WHERE user_id = p_user_id AND proofs_count > 0
    ORDER BY habit_date ASC
  LOOP
    IF v_prev IS NULL THEN
      v_streak := 1;
      v_prev := v_date;
      CONTINUE;
    END IF;
    IF v_date - v_prev = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      IF v_streak > v_best THEN v_best := v_streak; END IF;
      v_streak := 1;
    END IF;
    v_prev := v_date;
  END LOOP;
  IF v_streak > v_best THEN v_best := v_streak; END IF;

  -- Persist to profiles
  UPDATE profiles
  SET current_streak = v_current,
      best_streak = GREATEST(COALESCE(profiles.best_streak, 0), v_best),
      updated_at = now()
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_current, v_best;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 2. POOL AUTO-START + PLAYER COUNT TRACKING
-- ─────────────────────────────────────────────────────────────

-- Function to update pool stats when a member joins
CREATE OR REPLACE FUNCTION handle_pool_member_join()
RETURNS TRIGGER AS $$
DECLARE
  v_pool_record RECORD;
BEGIN
  -- Update current_players count and pot_size
  SELECT * INTO v_pool_record FROM pools WHERE id = NEW.pool_id;

  UPDATE pools
  SET current_players = COALESCE(current_players, 0) + 1,
      pot_size = COALESCE(pot_size, 0) + COALESCE(v_pool_record.stake_amount, 0),
      updated_at = now()
  WHERE id = NEW.pool_id;

  -- Auto-activate pool if it has >= 2 players and is still waiting
  IF v_pool_record.status = 'waiting' AND COALESCE(v_pool_record.current_players, 0) + 1 >= 2 THEN
    UPDATE pools
    SET status = 'active',
        starts_at = now(),
        ends_at = now() + (v_pool_record.duration_days || ' days')::interval,
        updated_at = now()
    WHERE id = NEW.pool_id AND status = 'waiting';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_pool_member_join ON pool_members;
CREATE TRIGGER on_pool_member_join
  AFTER INSERT ON pool_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_pool_member_join();

-- Function to handle member leaving/failing
CREATE OR REPLACE FUNCTION handle_pool_member_leave()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'active' AND (NEW.status = 'failed' OR NEW.status = 'withdrawn') THEN
    UPDATE pools
    SET current_players = GREATEST(COALESCE(current_players, 1) - 1, 0),
        updated_at = now()
    WHERE id = NEW.pool_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_pool_member_status_change ON pool_members;
CREATE TRIGGER on_pool_member_status_change
  AFTER UPDATE OF status ON pool_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_pool_member_leave();


-- ─────────────────────────────────────────────────────────────
-- 3. GLOBAL LEADERBOARD RPC
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_global_leaderboard(p_limit int DEFAULT 50)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  wallet_address text,
  current_streak int,
  best_streak int,
  total_pools_joined int,
  total_pools_won int,
  total_sol_earned numeric,
  total_proofs_submitted int,
  rank bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.display_name::text,
    p.username::text,
    p.avatar_url::text,
    p.wallet_address::text,
    COALESCE(p.current_streak, 0)::int as current_streak,
    COALESCE(p.best_streak, 0)::int as best_streak,
    COALESCE(p.total_pools_joined, 0)::int as total_pools_joined,
    COALESCE(p.total_pools_won, 0)::int as total_pools_won,
    COALESCE(p.total_sol_earned, 0)::numeric as total_sol_earned,
    COALESCE(p.total_proofs_submitted, 0)::int as total_proofs_submitted,
    ROW_NUMBER() OVER (
      ORDER BY COALESCE(p.current_streak, 0) DESC,
               COALESCE(p.best_streak, 0) DESC,
               COALESCE(p.total_proofs_submitted, 0) DESC
    ) as rank
  FROM profiles p
  WHERE COALESCE(p.current_streak, 0) > 0
     OR COALESCE(p.total_pools_joined, 0) > 0
  ORDER BY rank ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pool-specific leaderboard
CREATE OR REPLACE FUNCTION get_pool_leaderboard(p_pool_id uuid)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  current_streak int,
  best_streak int,
  days_completed int,
  total_proofs int,
  rank bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.user_id,
    p.display_name::text,
    p.avatar_url::text,
    COALESCE(pm.current_streak, 0)::int,
    COALESCE(pm.best_streak, 0)::int,
    COALESCE(pm.days_completed, 0)::int,
    (SELECT COUNT(*)::int FROM proofs pr WHERE pr.user_id = pm.user_id AND pr.pool_id = p_pool_id AND pr.status = 'approved'),
    ROW_NUMBER() OVER (
      ORDER BY COALESCE(pm.current_streak, 0) DESC,
               COALESCE(pm.days_completed, 0) DESC
    ) as rank
  FROM pool_members pm
  JOIN profiles p ON p.id = pm.user_id
  WHERE pm.pool_id = p_pool_id
    AND pm.status = 'active'
  ORDER BY rank ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 4. SOLANA TRANSACTION TRACKING
-- ─────────────────────────────────────────────────────────────

-- Add escrow columns if missing
DO $$ BEGIN
  ALTER TABLE pools ADD COLUMN IF NOT EXISTS escrow_address text;
  ALTER TABLE pools ADD COLUMN IF NOT EXISTS treasury_address text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add sol tracking to pool_members
DO $$ BEGIN
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS stake_tx_signature text;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS payout_tx_signature text;
  ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS staked_amount numeric DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure transaction types cover our needs
-- (transaction_type enum already has: stake_deposit, stake_refund, winnings_claim, penalty)

-- Function to record a Solana transaction
CREATE OR REPLACE FUNCTION record_sol_transaction(
  p_user_id uuid,
  p_pool_id uuid,
  p_type text,
  p_amount numeric,
  p_tx_signature text
) RETURNS uuid AS $$
DECLARE
  v_tx_id uuid;
BEGIN
  INSERT INTO transactions (user_id, pool_id, type, amount, tx_signature, status)
  VALUES (p_user_id, p_pool_id, p_type::transaction_type, p_amount, p_tx_signature, 'confirmed')
  RETURNING id INTO v_tx_id;

  -- Update pool member stake reference
  IF p_type = 'stake_deposit' THEN
    UPDATE pool_members
    SET stake_tx_signature = p_tx_signature,
        staked_amount = p_amount
    WHERE pool_id = p_pool_id AND user_id = p_user_id;

    -- Update profile total staked
    UPDATE profiles
    SET total_sol_staked = COALESCE(total_sol_staked, 0) + p_amount
    WHERE id = p_user_id;
  END IF;

  IF p_type = 'winnings_claim' THEN
    UPDATE pool_members
    SET payout_tx_signature = p_tx_signature,
        winnings = p_amount
    WHERE pool_id = p_pool_id AND user_id = p_user_id;

    UPDATE profiles
    SET total_sol_earned = COALESCE(total_sol_earned, 0) + p_amount
    WHERE id = p_user_id;
  END IF;

  RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 5. FRIEND POOL INVITES: Ensure pool_invites has proper structure
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE pool_invites ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
  ALTER TABLE pool_invites ADD COLUMN IF NOT EXISTS responded_at timestamptz;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Accept pool invite function
CREATE OR REPLACE FUNCTION accept_pool_invite(p_invite_id uuid, p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_invite RECORD;
BEGIN
  SELECT * INTO v_invite FROM pool_invites WHERE id = p_invite_id AND invited_user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF v_invite.status != 'pending' THEN
    RAISE EXCEPTION 'Invite already responded to';
  END IF;

  -- Update invite
  UPDATE pool_invites SET status = 'accepted', responded_at = now() WHERE id = p_invite_id;

  -- Add user to pool
  INSERT INTO pool_members (pool_id, user_id)
  VALUES (v_invite.pool_id, p_user_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 6. STREAK LEADER COLUMN ON POOLS (for display)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE pools ADD COLUMN IF NOT EXISTS streak_leader int DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Update streak_leader whenever a pool member's streak changes
CREATE OR REPLACE FUNCTION update_pool_streak_leader()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pools
  SET streak_leader = (
    SELECT COALESCE(MAX(current_streak), 0)
    FROM pool_members
    WHERE pool_id = NEW.pool_id AND status = 'active'
  )
  WHERE id = NEW.pool_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_streak_update ON pool_members;
CREATE TRIGGER on_member_streak_update
  AFTER UPDATE OF current_streak ON pool_members
  FOR EACH ROW
  EXECUTE FUNCTION update_pool_streak_leader();


-- ─────────────────────────────────────────────────────────────
-- 7. SEED PRE-MADE POOLS
-- ─────────────────────────────────────────────────────────────

-- We use a system user ID. First, create a system profile if not exists.
DO $$
DECLARE
  v_system_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Create system user profile for seeded pools
  INSERT INTO profiles (id, display_name, username)
  VALUES (v_system_id, 'GetStaked Official', 'getstaked')
  ON CONFLICT (id) DO NOTHING;

  -- Seed pools (only if they don't exist yet)
  INSERT INTO pools (id, creator_id, name, description, proof_description, emoji, category, stake_amount, duration_days, frequency, max_players, is_hot, status, is_private, current_players, pot_size)
  VALUES
    -- FITNESS POOLS
    ('11111111-1111-1111-1111-111111111001', v_system_id,
     '30-Day Push-Up Challenge', 'Complete 50 push-ups daily for 30 days. Build discipline and strength.',
     'Take a video or photo of yourself doing push-ups. Must show at least 10 consecutive reps.',
     '💪', 'fitness', 0.5, 30, 'daily', 20, true, 'active', false, 0, 0),

    ('11111111-1111-1111-1111-111111111002', v_system_id,
     'Morning Run Club', 'Run at least 2 miles every morning before 9am. GPS proof required.',
     'Screenshot your running app (Strava, Nike Run, etc.) showing distance and time with today''s date.',
     '🏃', 'fitness', 1.0, 14, 'daily', 15, true, 'active', false, 0, 0),

    ('11111111-1111-1111-1111-111111111003', v_system_id,
     'Gym Warrior', 'Hit the gym 5 times per week. Any workout counts.',
     'Take a selfie at the gym or photo of your workout equipment in use.',
     '🏋️', 'fitness', 0.75, 28, '5x_week', 25, false, 'active', false, 0, 0),

    -- HEALTH POOLS
    ('11111111-1111-1111-1111-111111111004', v_system_id,
     'Clean Eating Challenge', 'Eat a healthy, home-cooked meal every day. No fast food!',
     'Photo of your healthy meal. Must be clearly home-prepared with visible vegetables/protein.',
     '🥗', 'health', 0.5, 21, 'daily', 30, false, 'active', false, 0, 0),

    ('11111111-1111-1111-1111-111111111005', v_system_id,
     'Hydration Heroes', 'Drink at least 8 glasses of water daily. Track with a water bottle.',
     'Photo of your water bottle or tracking app showing daily water intake.',
     '💧', 'health', 0.25, 14, 'daily', 50, true, 'active', false, 0, 0),

    -- EDUCATION POOLS
    ('11111111-1111-1111-1111-111111111006', v_system_id,
     'Code Every Day', 'Write code for at least 1 hour daily. Any language, any project.',
     'Screenshot of your code editor, GitHub contribution, or terminal showing today''s work.',
     '💻', 'education', 1.5, 30, 'daily', 20, true, 'active', false, 0, 0),

    ('11111111-1111-1111-1111-111111111007', v_system_id,
     'Read 30 Pages', 'Read at least 30 pages of a book every day. Audiobooks count!',
     'Photo of the book page you''re on, or screenshot of audiobook progress.',
     '📚', 'education', 0.5, 21, 'daily', 25, false, 'active', false, 0, 0),

    -- WELLNESS POOLS
    ('11111111-1111-1111-1111-111111111008', v_system_id,
     'Meditation Marathon', 'Meditate for at least 10 minutes daily. Find your inner peace.',
     'Screenshot of meditation app timer (Headspace, Calm, etc.) or photo of your meditation setup.',
     '🧘', 'wellness', 0.5, 21, 'daily', 30, false, 'active', false, 0, 0),

    ('11111111-1111-1111-1111-111111111009', v_system_id,
     'Cold Shower Warriors', 'Take a cold shower every morning. Minimum 2 minutes.',
     'Video screenshot or photo of you after cold shower with visible water/shower. Timestamp visible.',
     '🥶', 'wellness', 1.0, 14, 'daily', 15, true, 'active', false, 0, 0),

    -- PRODUCTIVITY POOLS
    ('11111111-1111-1111-1111-111111111010', v_system_id,
     'No Phone Before Noon', 'Don''t use social media before 12pm. Digital detox challenge.',
     'Screenshot of your screen time showing no social media usage before noon.',
     '📵', 'productivity', 0.75, 14, 'daily', 40, false, 'active', false, 0, 0),

    -- HIGH STAKES POOL
    ('11111111-1111-1111-1111-111111111011', v_system_id,
     'Diamond Hands Fitness', 'The ultimate high-stakes fitness challenge. Train every single day.',
     'Photo/video proof of any physical exercise. Running, lifting, yoga, swimming all count.',
     '💎', 'fitness', 5.0, 30, 'daily', 10, true, 'active', false, 0, 0),

    -- CREATIVE POOL
    ('11111111-1111-1111-1111-111111111012', v_system_id,
     'Daily Sketch Club', 'Draw or sketch something new every day. Any medium, any skill level.',
     'Photo of your sketch/drawing with today''s date written on it.',
     '🎨', 'creative', 0.25, 30, 'daily', 30, false, 'active', false, 0, 0)

  ON CONFLICT (id) DO NOTHING;

  -- Set starts_at and ends_at for seeded pools
  UPDATE pools
  SET starts_at = now(),
      ends_at = now() + (duration_days || ' days')::interval
  WHERE creator_id = v_system_id
    AND starts_at IS NULL;

END $$;


-- ─────────────────────────────────────────────────────────────
-- 8. RLS POLICIES for new functions
-- ─────────────────────────────────────────────────────────────

-- Ensure pool_invites RLS
ALTER TABLE pool_invites ENABLE ROW LEVEL SECURITY;

-- Users can see invites sent to them
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own invites" ON pool_invites;
  CREATE POLICY "Users can view their own invites" ON pool_invites
    FOR SELECT USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Users can insert invites for pools they created
DO $$ BEGIN
  DROP POLICY IF EXISTS "Pool creators can invite" ON pool_invites;
  CREATE POLICY "Pool creators can invite" ON pool_invites
    FOR INSERT WITH CHECK (
      auth.uid() = invited_by
      AND EXISTS (SELECT 1 FROM pools WHERE id = pool_id AND creator_id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Users can update their own invites (accept/decline)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can respond to invites" ON pool_invites;
  CREATE POLICY "Users can respond to invites" ON pool_invites
    FOR UPDATE USING (auth.uid() = invited_user_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure transactions RLS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
  CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
  CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────
-- 9. INDEXES for performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pool_members_pool_status ON pool_members(pool_id, status);
CREATE INDEX IF NOT EXISTS idx_pool_members_user_status ON pool_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_date ON daily_habits(user_id, habit_date);
CREATE INDEX IF NOT EXISTS idx_proofs_user_pool ON proofs(user_id, pool_id);
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_pool_invites_user ON pool_invites(invited_user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(current_streak DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- Done!
SELECT 'Migration v11 complete!' as result;
