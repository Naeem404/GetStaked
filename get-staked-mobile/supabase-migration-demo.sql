-- ============================================
-- Demo Branch Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Initialize sol_balance for existing users who have NULL
UPDATE profiles SET sol_balance = 10.0 WHERE sol_balance IS NULL;

-- 2. Set default for new users
ALTER TABLE profiles ALTER COLUMN sol_balance SET DEFAULT 10.0;

-- 3. Create proof_reviews table for friend-approval fallback
CREATE TABLE IF NOT EXISTS proof_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id uuid NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  pool_id uuid NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),           -- who submitted the proof
  reviewer_id uuid REFERENCES profiles(id),                -- friend who will review
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_confidence numeric(3,2) DEFAULT 0,
  ai_reasoning text,
  reviewer_note text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- 4. RLS for proof_reviews
ALTER TABLE proof_reviews ENABLE ROW LEVEL SECURITY;

-- Users can see reviews they're involved in (as submitter or reviewer)
CREATE POLICY "Users can view own proof reviews"
  ON proof_reviews FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

-- Users can insert reviews for their own proofs (system creates these)
CREATE POLICY "Users can insert own proof reviews"
  ON proof_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reviewers can update reviews assigned to them
CREATE POLICY "Reviewers can update assigned reviews"
  ON proof_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- 5. Function: get pending reviews for a user (as reviewer)
CREATE OR REPLACE FUNCTION get_pending_reviews(p_reviewer_id uuid)
RETURNS TABLE (
  review_id uuid,
  proof_id uuid,
  pool_name text,
  pool_emoji text,
  proof_description text,
  submitter_name text,
  submitter_avatar text,
  image_url text,
  ai_confidence numeric,
  ai_reasoning text,
  created_at timestamptz
) LANGUAGE sql STABLE AS $$
  SELECT
    pr.id AS review_id,
    pr.proof_id,
    p.name AS pool_name,
    p.emoji AS pool_emoji,
    p.proof_description,
    prof.display_name AS submitter_name,
    prof.avatar_url AS submitter_avatar,
    pf.image_url,
    pr.ai_confidence,
    pr.ai_reasoning,
    pr.created_at
  FROM proof_reviews pr
  JOIN proofs pf ON pf.id = pr.proof_id
  JOIN pools p ON p.id = pr.pool_id
  JOIN profiles prof ON prof.id = pr.user_id
  WHERE pr.reviewer_id = p_reviewer_id
    AND pr.status = 'pending'
  ORDER BY pr.created_at DESC;
$$;

-- 6. Function: resolve a proof review (friend approves/rejects)
CREATE OR REPLACE FUNCTION resolve_proof_review(
  p_review_id uuid,
  p_reviewer_id uuid,
  p_status text,
  p_note text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_proof_id uuid;
  v_user_id uuid;
  v_member_id uuid;
BEGIN
  -- Validate
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Status must be approved or rejected';
  END IF;

  -- Get review details
  SELECT proof_id, user_id INTO v_proof_id, v_user_id
  FROM proof_reviews
  WHERE id = p_review_id AND reviewer_id = p_reviewer_id AND status = 'pending';

  IF v_proof_id IS NULL THEN
    RAISE EXCEPTION 'Review not found or already resolved';
  END IF;

  -- Update review
  UPDATE proof_reviews
  SET status = p_status, reviewer_note = p_note, reviewed_at = now()
  WHERE id = p_review_id;

  -- Update the proof itself
  UPDATE proofs
  SET status = p_status, verified_at = now()
  WHERE id = v_proof_id;

  -- If approved, update streaks/habits
  IF p_status = 'approved' THEN
    -- Get member_id
    SELECT pm.id INTO v_member_id
    FROM proofs pf
    JOIN pool_members pm ON pm.pool_id = pf.pool_id AND pm.user_id = pf.user_id
    WHERE pf.id = v_proof_id;

    IF v_member_id IS NOT NULL THEN
      UPDATE pool_members
      SET last_proof_date = CURRENT_DATE
      WHERE id = v_member_id;
    END IF;

    -- Update daily habits
    INSERT INTO daily_habits (user_id, habit_date, proofs_count)
    VALUES (v_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, habit_date)
    DO UPDATE SET proofs_count = daily_habits.proofs_count + 1;

    -- Update profile stats
    UPDATE profiles
    SET total_proofs_verified = COALESCE(total_proofs_verified, 0) + 1
    WHERE id = v_user_id;
  END IF;
END;
$$;

-- 7. Index for fast reviewer lookups
CREATE INDEX IF NOT EXISTS idx_proof_reviews_reviewer
  ON proof_reviews(reviewer_id, status);

CREATE INDEX IF NOT EXISTS idx_proof_reviews_proof
  ON proof_reviews(proof_id);
