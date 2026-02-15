-- ============================================
-- GetStaked Database Migrations
-- Run these in the Supabase SQL Editor
-- ============================================

-- 1. Create proof-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-images',
  'proof-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS policies for proof-images bucket
DO $$
BEGIN
  CREATE POLICY "Users can upload proof images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'proof-images' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can view proof images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'proof-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete own proof images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'proof-images' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create process_proof_verification RPC function
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
    -- Update pool member last_proof_date and streak
    UPDATE pool_members
    SET
      last_proof_date = v_today,
      current_streak = current_streak + 1,
      total_proofs = total_proofs + 1
    WHERE id = v_member_id;

    -- Upsert daily_habits
    INSERT INTO daily_habits (user_id, habit_date, proofs_count)
    VALUES (v_user_id, v_today, 1)
    ON CONFLICT (user_id, habit_date)
    DO UPDATE SET proofs_count = daily_habits.proofs_count + 1;

    -- Update profile stats
    UPDATE profiles
    SET
      total_proofs_submitted = COALESCE(total_proofs_submitted, 0) + 1,
      current_streak = COALESCE(current_streak, 0) + 1,
      best_streak = GREATEST(COALESCE(best_streak, 0), COALESCE(current_streak, 0) + 1)
    WHERE id = v_user_id;

    -- Log activity
    INSERT INTO activity_log (user_id, pool_id, action, description)
    VALUES (v_user_id, v_pool_id, 'proof_verified', 'Proof verified by AI (confidence: ' || ROUND(p_confidence::numeric, 2) || ')');
  ELSIF p_status = 'rejected' THEN
    -- Log rejection
    INSERT INTO activity_log (user_id, pool_id, action, description)
    VALUES (v_user_id, v_pool_id, 'proof_rejected', 'Proof rejected: ' || p_reasoning);
  END IF;
END;
$$;

-- 4. Add missing columns to proofs table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proofs' AND column_name = 'ai_confidence') THEN
    ALTER TABLE proofs ADD COLUMN ai_confidence FLOAT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proofs' AND column_name = 'ai_reasoning') THEN
    ALTER TABLE proofs ADD COLUMN ai_reasoning TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proofs' AND column_name = 'ai_flags') THEN
    ALTER TABLE proofs ADD COLUMN ai_flags JSONB DEFAULT '[]'::JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proofs' AND column_name = 'verified_at') THEN
    ALTER TABLE proofs ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proofs' AND column_name = 'member_id') THEN
    ALTER TABLE proofs ADD COLUMN member_id UUID REFERENCES pool_members(id);
  END IF;
END $$;

-- 5. Add missing columns to pool_members if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_members' AND column_name = 'total_proofs') THEN
    ALTER TABLE pool_members ADD COLUMN total_proofs INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_members' AND column_name = 'last_proof_date') THEN
    ALTER TABLE pool_members ADD COLUMN last_proof_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pool_members' AND column_name = 'current_streak') THEN
    ALTER TABLE pool_members ADD COLUMN current_streak INT DEFAULT 0;
  END IF;
END $$;

-- 6. Add coach_persona and coach_voice_enabled to profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coach_persona') THEN
    ALTER TABLE profiles ADD COLUMN coach_persona TEXT DEFAULT 'drill_sergeant';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coach_voice_enabled') THEN
    ALTER TABLE profiles ADD COLUMN coach_voice_enabled BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- 7. Ensure daily_habits has proper unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'daily_habits_user_id_habit_date_key'
  ) THEN
    ALTER TABLE daily_habits ADD CONSTRAINT daily_habits_user_id_habit_date_key UNIQUE (user_id, habit_date);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 8. Create calculate_global_streak function if not exists
CREATE OR REPLACE FUNCTION calculate_global_streak(p_user_id UUID)
RETURNS TABLE(current_streak INT, best_streak INT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current INT := 0;
  v_best INT := 0;
  v_prev_date DATE := NULL;
  v_streak INT := 0;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT habit_date
    FROM daily_habits
    WHERE user_id = p_user_id AND proofs_count > 0
    ORDER BY habit_date DESC
  LOOP
    IF v_prev_date IS NULL THEN
      -- First row: check if it's today or yesterday
      IF rec.habit_date >= CURRENT_DATE - 1 THEN
        v_streak := 1;
      ELSE
        v_streak := 0;
        EXIT;
      END IF;
    ELSIF v_prev_date - rec.habit_date = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      EXIT;
    END IF;
    v_prev_date := rec.habit_date;
  END LOOP;

  v_current := v_streak;

  -- Calculate best streak
  v_streak := 0;
  v_prev_date := NULL;
  FOR rec IN
    SELECT habit_date
    FROM daily_habits
    WHERE user_id = p_user_id AND proofs_count > 0
    ORDER BY habit_date ASC
  LOOP
    IF v_prev_date IS NULL OR rec.habit_date - v_prev_date = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      v_streak := 1;
    END IF;
    IF v_streak > v_best THEN
      v_best := v_streak;
    END IF;
    v_prev_date := rec.habit_date;
  END LOOP;

  -- Update profile
  UPDATE profiles
  SET current_streak = v_current, best_streak = GREATEST(COALESCE(best_streak, 0), v_best)
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_current, v_best;
END;
$$;
