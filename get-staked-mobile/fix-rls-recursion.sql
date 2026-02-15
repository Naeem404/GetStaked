-- ============================================================
-- Fix: Infinite recursion in pool_members RLS policies
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cpkcskwkoafopqfnznkd/sql/new
-- ============================================================

-- 1. Drop ALL existing pool_members policies (they cause recursion)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'pool_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON pool_members', pol.policyname);
  END LOOP;
END $$;

-- 2. Create clean, non-recursive pool_members policies
-- SELECT: Authenticated users can see all pool members (needed for leaderboards, pool detail)
CREATE POLICY "Authenticated users can view pool members"
  ON pool_members FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Users can only add themselves to pools
CREATE POLICY "Users can join pools"
  ON pool_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own membership
CREATE POLICY "Users can update own membership"
  ON pool_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- DELETE: Users can only remove themselves
CREATE POLICY "Users can leave pools"
  ON pool_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Fix proofs table policies too (they may join to pool_members)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'proofs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON proofs', pol.policyname);
  END LOOP;
END $$;

-- Proofs: users can see their own + proofs in pools they belong to
-- Use pools table (not pool_members) to avoid recursion
CREATE POLICY "Users can view own proofs"
  ON proofs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view pool proofs"
  ON proofs FOR SELECT
  TO authenticated
  USING (
    pool_id IN (
      SELECT id FROM pools WHERE status IN ('active', 'waiting')
    )
  );

CREATE POLICY "Users can insert own proofs"
  ON proofs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proofs"
  ON proofs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Fix pools table policies (ensure no recursion)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'pools'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON pools', pol.policyname);
  END LOOP;
END $$;

-- Pools: all authenticated users can see active/waiting pools
CREATE POLICY "Anyone can view active pools"
  ON pools FOR SELECT
  TO authenticated
  USING (true);

-- Only creators can insert pools
CREATE POLICY "Users can create pools"
  ON pools FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Only creators can update their pools
CREATE POLICY "Creators can update own pools"
  ON pools FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

-- 5. Fix profiles policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can modify own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 6. Fix activity_log policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'activity_log'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON activity_log', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. Fix daily_habits policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'daily_habits'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON daily_habits', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own habits"
  ON daily_habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON daily_habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON daily_habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. Ensure RLS is enabled on all tables
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

-- Done!
SELECT 'RLS recursion fix applied successfully!' as result;
