-- Migration: Add proof_reviews table for friend-review flow
-- Run this in Supabase SQL Editor

-- Create proof_reviews table for when AI confidence is 40-70%
CREATE TABLE IF NOT EXISTS public.proof_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID NOT NULL REFERENCES public.proofs(id) ON DELETE CASCADE,
  pool_id UUID REFERENCES public.pools(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_confidence NUMERIC(4,3),
  ai_reasoning TEXT,
  reviewer_note TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proof_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own proof reviews"
  ON public.proof_reviews FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

CREATE POLICY "Users can insert proof reviews"
  ON public.proof_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Reviewers can update proof reviews"
  ON public.proof_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_proof_reviews_proof_id ON public.proof_reviews(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_reviews_reviewer ON public.proof_reviews(reviewer_id, status);
CREATE INDEX IF NOT EXISTS idx_proof_reviews_user ON public.proof_reviews(user_id, status);

-- Function to handle friend review approval
CREATE OR REPLACE FUNCTION public.approve_proof_review(
  p_review_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_proof_id UUID;
  v_user_id UUID;
  v_pool_id UUID;
BEGIN
  -- Get the review
  SELECT proof_id, user_id, pool_id INTO v_proof_id, v_user_id, v_pool_id
  FROM public.proof_reviews WHERE id = p_review_id AND reviewer_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found or not authorized';
  END IF;

  -- Update review
  UPDATE public.proof_reviews
  SET status = 'approved', reviewer_note = p_note, reviewed_at = now()
  WHERE id = p_review_id;

  -- Process the proof as approved via existing RPC
  PERFORM public.process_proof_verification(
    v_proof_id, 'approved', 0.65, 'Approved by friend review', '[]'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_proof_review(
  p_review_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update review
  UPDATE public.proof_reviews
  SET status = 'rejected', reviewer_note = p_note, reviewed_at = now()
  WHERE id = p_review_id AND reviewer_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found or not authorized';
  END IF;

  -- Update proof status to rejected
  UPDATE public.proofs SET status = 'rejected', verified_at = now()
  WHERE id = (SELECT proof_id FROM public.proof_reviews WHERE id = p_review_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
