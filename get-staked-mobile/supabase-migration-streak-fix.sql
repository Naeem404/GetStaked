-- ============================================================
-- GetStaked: STREAK FIX MIGRATION
-- Run this in Supabase SQL Editor AFTER SETUP-DATABASE.sql
-- https://supabase.com/dashboard/project/cpkcskwkoafopqfnznkd/sql/new
--
-- Fixes:
-- 1. calculate_global_streak: was returning oldest block, now returns current
-- 2. process_proof_verification: streak always +1, now resets on gap days
-- 3. Adds check_missed_proofs: resets streaks for users who missed a day
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. FIX: calculate_global_streak
--    Old bug: iterated DESC but didn't break on first gap,
--    so v_current was the OLDEST consecutive block.
--    New: properly exits after finding first gap from today.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_global_streak(p_user_id uuid)
RETURNS TABLE(current_streak int, best_streak int) AS $$
DECLARE
  v_current int := 0;
  v_best int := 0;
  v_date date;
  v_prev date;
  v_streak int := 0;
  v_done boolean := false;
BEGIN
  -- Pass 1: Current streak (walk backwards from today/yesterday)
  v_prev := NULL;
  v_streak := 0;
  FOR v_date IN
    SELECT habit_date FROM daily_habits
    WHERE user_id = p_user_id AND proofs_count > 0
    ORDER BY habit_date DESC
  LOOP
    IF v_prev IS NULL THEN
      -- First entry: must be today or yesterday to count
      IF v_date >= CURRENT_DATE - 1 THEN
        v_streak := 1;
      ELSE
        -- Most recent activity is older than yesterday → current streak is 0
        EXIT;
      END IF;
      v_prev := v_date;
      CONTINUE;
    END IF;

    IF v_prev - v_date = 1 THEN
      -- Consecutive day
      v_streak := v_streak + 1;
      v_prev := v_date;
    ELSE
      -- Gap found → current streak ends here
      EXIT;
    END IF;
  END LOOP;
  v_current := v_streak;

  -- Pass 2: Best streak (walk forwards through all history)
  v_prev := NULL;
  v_streak := 0;
  v_best := v_current; -- at least as good as current
  FOR v_date IN
    SELECT habit_date FROM daily_habits
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

  -- Persist to profile
  UPDATE profiles
  SET current_streak = v_current,
      best_streak = GREATEST(COALESCE(profiles.best_streak, 0), v_best),
      updated_at = now()
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_current, v_best;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────
-- 2. FIX: process_proof_verification
--    Old bug: always did current_streak + 1, never reset on gap.
--    New: checks if last_proof_date was yesterday (continue streak)
--    or older (reset to 1).
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_proof_verification(
  p_proof_id UUID,
  p_status TEXT,
  p_confidence FLOAT,
  p_reasoning TEXT,
  p_flags JSONB DEFAULT '[]'::JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_pool_id UUID;
  v_member_id UUID;
  v_today DATE := CURRENT_DATE;
  v_last_proof DATE;
  v_new_streak INT;
  v_member_best INT;
BEGIN
  -- Get proof details
  SELECT user_id, pool_id, member_id
  INTO v_user_id, v_pool_id, v_member_id
  FROM proofs
  WHERE id = p_proof_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proof not found: %', p_proof_id;
  END IF;

  -- Update proof record
  UPDATE proofs
  SET
    status = p_status,
    ai_confidence = p_confidence,
    ai_reasoning = p_reasoning,
    ai_flags = p_flags,
    verified_at = NOW()
  WHERE id = p_proof_id;

  -- If approved, update streak and daily habits
  IF p_status = 'approved' THEN
    -- Get the member's last proof date to determine streak continuity
    SELECT last_proof_date, COALESCE(current_streak, 0), COALESCE(best_streak, 0)
    INTO v_last_proof, v_new_streak, v_member_best
    FROM pool_members
    WHERE id = v_member_id;

    -- Determine new streak value
    IF v_last_proof IS NOT NULL AND v_last_proof = v_today THEN
      -- Already submitted today for this pool — don't double-count streak
      v_new_streak := v_new_streak; -- no change
    ELSIF v_last_proof IS NOT NULL AND v_last_proof = v_today - 1 THEN
      -- Yesterday → continue streak
      v_new_streak := v_new_streak + 1;
    ELSE
      -- Gap of 2+ days or first proof → reset to 1
      v_new_streak := 1;
    END IF;

    -- Update pool member
    UPDATE pool_members
    SET
      last_proof_date = v_today,
      current_streak = v_new_streak,
      best_streak = GREATEST(COALESCE(best_streak, 0), v_new_streak),
      days_completed = COALESCE(days_completed, 0) + CASE WHEN v_last_proof = v_today THEN 0 ELSE 1 END,
      total_proofs = COALESCE(total_proofs, 0) + 1
    WHERE id = v_member_id;

    -- Upsert daily_habits
    INSERT INTO daily_habits (user_id, habit_date, proofs_count)
    VALUES (v_user_id, v_today, 1)
    ON CONFLICT (user_id, habit_date)
    DO UPDATE SET proofs_count = daily_habits.proofs_count + 1;

    -- Update profile stats using calculate_global_streak for accuracy
    UPDATE profiles
    SET
      total_proofs_submitted = COALESCE(total_proofs_submitted, 0) + 1
    WHERE id = v_user_id;

    -- Recalculate global streak (across all pools) and persist to profile
    PERFORM calculate_global_streak(v_user_id);

    -- Log activity
    INSERT INTO activity_log (user_id, pool_id, action, description)
    VALUES (v_user_id, v_pool_id, 'proof_verified', 'Proof verified (confidence: ' || ROUND(p_confidence::numeric, 2) || ')');

  ELSIF p_status = 'rejected' THEN
    INSERT INTO activity_log (user_id, pool_id, action, description)
    VALUES (v_user_id, v_pool_id, 'proof_rejected', 'Proof rejected: ' || p_reasoning);
  END IF;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 3. NEW: check_missed_proofs
--    Resets current_streak to 0 for pool_members who missed
--    their proof yesterday (last_proof_date < yesterday).
--    Also updates profile streaks via calculate_global_streak.
--    Should be called daily via a cron job or on app load.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_missed_proofs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_yesterday DATE := CURRENT_DATE - 1;
  v_member RECORD;
  v_user_id UUID;
BEGIN
  -- Find active pool members whose last proof was before yesterday
  FOR v_member IN
    SELECT id, user_id
    FROM pool_members
    WHERE status = 'active'
      AND (last_proof_date IS NULL OR last_proof_date < v_yesterday)
      AND current_streak > 0
  LOOP
    -- Reset their pool-level streak
    UPDATE pool_members
    SET current_streak = 0
    WHERE id = v_member.id;

    -- Recalculate the user's global streak
    PERFORM calculate_global_streak(v_member.user_id);
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 4. Run check_missed_proofs now to fix any stale streaks
-- ─────────────────────────────────────────────────────────────
SELECT check_missed_proofs();


-- ─────────────────────────────────────────────────────────────
-- 5. FIX: friendships unique constraint
--    Prevents duplicate friend requests between same pair
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'friendships_unique_pair') THEN
    ALTER TABLE friendships ADD CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────
-- 6. FIX: Ensure RLS policies exist for friendships, pool_invites, coach_messages
--    Re-creates them if they were dropped or never created
-- ─────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

-- friendships
DO $$ BEGIN
  CREATE POLICY "fr_select" ON friendships FOR SELECT TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "fr_insert" ON friendships FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = requester_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "fr_update" ON friendships FOR UPDATE TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "fr_delete" ON friendships FOR DELETE TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- pool_invites
DO $$ BEGIN
  CREATE POLICY "pi_select" ON pool_invites FOR SELECT TO authenticated
    USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pi_insert" ON pool_invites FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = invited_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pi_update" ON pool_invites FOR UPDATE TO authenticated
    USING (auth.uid() = invited_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- coach_messages (edge function uses service role, but client reads need RLS)
DO $$ BEGIN
  CREATE POLICY "cm_select" ON coach_messages FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "cm_insert" ON coach_messages FOR INSERT TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- proof_reviews table (if it doesn't exist — needed by verify-proof edge function)
CREATE TABLE IF NOT EXISTS proof_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID NOT NULL,
  pool_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  ai_confidence FLOAT,
  ai_reasoning TEXT,
  reviewer_decision TEXT,
  reviewer_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE proof_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "pr_select" ON proof_reviews FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = reviewer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pr_insert" ON proof_reviews FOR INSERT TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "pr_update" ON proof_reviews FOR UPDATE TO authenticated
    USING (auth.uid() = reviewer_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


SELECT '✅ All fixes applied (streaks, friends, pool invites, coach)!' as result;
