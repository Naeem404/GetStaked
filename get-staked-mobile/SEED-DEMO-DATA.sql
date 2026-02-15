-- ============================================================
-- GetStaked: DEMO SEED DATA
-- Run this in Supabase SQL Editor AFTER running SETUP-DATABASE.sql
-- https://supabase.com/dashboard/project/cpkcskwkoafopqfnznkd/sql/new
--
-- Creates realistic demo data: fake users, pools, streaks,
-- proofs, daily habits, transactions, activity log.
-- Safe to run multiple times (uses ON CONFLICT / IF NOT EXISTS).
-- ============================================================

DO $$
DECLARE
  -- The real user (you)
  v_me UUID;
  v_me_name TEXT;

  -- Fake demo users
  v_u1 UUID := 'aa000000-0001-4000-8000-000000000001';
  v_u2 UUID := 'aa000000-0002-4000-8000-000000000002';
  v_u3 UUID := 'aa000000-0003-4000-8000-000000000003';
  v_u4 UUID := 'aa000000-0004-4000-8000-000000000004';
  v_u5 UUID := 'aa000000-0005-4000-8000-000000000005';
  v_u6 UUID := 'aa000000-0006-4000-8000-000000000006';
  v_u7 UUID := 'aa000000-0007-4000-8000-000000000007';

  -- Pool IDs
  v_p1 UUID := 'bb000000-0001-4000-8000-000000000001';
  v_p2 UUID := 'bb000000-0002-4000-8000-000000000002';
  v_p3 UUID := 'bb000000-0003-4000-8000-000000000003';

  -- Pool member IDs (me)
  v_mm1 UUID := 'cc000000-0001-4000-8000-000000000001';
  v_mm2 UUID := 'cc000000-0002-4000-8000-000000000002';
  v_mm3 UUID := 'cc000000-0003-4000-8000-000000000003';

  -- Pool member IDs (others)
  v_m1  UUID := 'cc000000-0011-4000-8000-000000000011';
  v_m2  UUID := 'cc000000-0012-4000-8000-000000000012';
  v_m3  UUID := 'cc000000-0013-4000-8000-000000000013';
  v_m4  UUID := 'cc000000-0014-4000-8000-000000000014';
  v_m5  UUID := 'cc000000-0015-4000-8000-000000000015';
  v_m6  UUID := 'cc000000-0016-4000-8000-000000000016';
  v_m7  UUID := 'cc000000-0017-4000-8000-000000000017';
  v_m8  UUID := 'cc000000-0018-4000-8000-000000000018';
  v_m9  UUID := 'cc000000-0019-4000-8000-000000000019';
  v_m10 UUID := 'cc000000-0020-4000-8000-000000000020';
  v_m11 UUID := 'cc000000-0021-4000-8000-000000000021';
  v_m12 UUID := 'cc000000-0022-4000-8000-000000000022';

  v_today DATE := CURRENT_DATE;
  v_d DATE;
  v_cnt INT;
  v_proof_id UUID;
  i INT;

BEGIN
  -- ════════════════════════════════════════════════════════════
  -- 0. Find the real user
  -- ════════════════════════════════════════════════════════════
  SELECT id, display_name INTO v_me, v_me_name
  FROM profiles
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_me IS NULL THEN
    RAISE EXCEPTION 'No profiles found — please sign up in the app first!';
  END IF;

  RAISE NOTICE 'Seeding demo data for user: % (%)', v_me_name, v_me;

  -- ════════════════════════════════════════════════════════════
  -- 1. Create fake auth users + profiles
  -- ════════════════════════════════════════════════════════════

  -- Disable the pool member join trigger temporarily to avoid double-counting
  ALTER TABLE pool_members DISABLE TRIGGER on_pool_member_join;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new)
  VALUES
    (v_u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alex.chen@demo.getstaked.io',   crypt('DemoPass123!', gen_salt('bf')), now()-interval'45 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Alex Chen"}',     now()-interval'45 days', now(), '', '', ''),
    (v_u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah.kim@demo.getstaked.io',   crypt('DemoPass123!', gen_salt('bf')), now()-interval'40 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Sarah Kim"}',     now()-interval'40 days', now(), '', '', ''),
    (v_u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mike.torres@demo.getstaked.io', crypt('DemoPass123!', gen_salt('bf')), now()-interval'38 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Mike Torres"}',   now()-interval'38 days', now(), '', '', ''),
    (v_u4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.patel@demo.getstaked.io', crypt('DemoPass123!', gen_salt('bf')), now()-interval'35 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Priya Patel"}',   now()-interval'35 days', now(), '', '', ''),
    (v_u5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jordan.wu@demo.getstaked.io',   crypt('DemoPass123!', gen_salt('bf')), now()-interval'30 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Jordan Wu"}',     now()-interval'30 days', now(), '', '', ''),
    (v_u6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lena.berg@demo.getstaked.io',   crypt('DemoPass123!', gen_salt('bf')), now()-interval'28 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Lena Berg"}',     now()-interval'28 days', now(), '', '', ''),
    (v_u7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'raj.sharma@demo.getstaked.io',  crypt('DemoPass123!', gen_salt('bf')), now()-interval'25 days', '{"provider":"email","providers":["email"]}', '{"display_name":"Raj Sharma"}',    now()-interval'25 days', now(), '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, display_name, username, current_streak, best_streak, total_pools_joined, total_pools_won, total_proofs_submitted, total_sol_earned, total_sol_staked, created_at)
  VALUES
    (v_u1, 'Alex Chen',     'alexchen',     9, 14, 3, 1, 22, 0.35, 0.6, now()-interval'45 days'),
    (v_u2, 'Sarah Kim',     'sarahkim',     6, 10, 2, 1, 16, 0.20, 0.4, now()-interval'40 days'),
    (v_u3, 'Mike Torres',   'miketorres',   4,  8, 2, 0, 12, 0.00, 0.4, now()-interval'38 days'),
    (v_u4, 'Priya Patel',   'priyapatel',  11, 11, 3, 2, 28, 0.55, 0.6, now()-interval'35 days'),
    (v_u5, 'Jordan Wu',     'jordanwu',     3,  7, 2, 0,  9, 0.00, 0.4, now()-interval'30 days'),
    (v_u6, 'Lena Berg',     'lenaberg',     7, 12, 2, 1, 18, 0.30, 0.4, now()-interval'28 days'),
    (v_u7, 'Raj Sharma',    'rajsharma',    5,  9, 2, 0, 14, 0.00, 0.4, now()-interval'25 days')
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    username = EXCLUDED.username,
    current_streak = EXCLUDED.current_streak,
    best_streak = EXCLUDED.best_streak,
    total_pools_joined = EXCLUDED.total_pools_joined,
    total_pools_won = EXCLUDED.total_pools_won,
    total_proofs_submitted = EXCLUDED.total_proofs_submitted,
    total_sol_earned = EXCLUDED.total_sol_earned,
    total_sol_staked = EXCLUDED.total_sol_staked;

  -- ════════════════════════════════════════════════════════════
  -- 2. Create pools
  -- ════════════════════════════════════════════════════════════

  INSERT INTO pools (id, name, emoji, description, proof_description, category, stake_amount, duration_days, max_players, current_players, pot_size, frequency, status, is_hot, creator_id, starts_at, ends_at, created_at)
  VALUES
    (v_p1,
     'Morning Runs 🏃',
     '🏃',
     'Wake up and run every morning. Minimum 1 mile. Build the habit that changes everything.',
     'Take a photo of your running app showing today''s run (distance + time) or a selfie during your run.',
     'fitness',
     0.2, 21, 8, 6, 1.2, 'daily', 'active', true, v_me,
     (v_today - 14)::timestamptz,
     (v_today + 7)::timestamptz,
     (v_today - 16)::timestamptz
    ),
    (v_p2,
     'No Sugar Challenge 🍬',
     '🍬',
     'Cut out added sugar for 14 days. Read labels, eat clean, feel amazing.',
     'Photo of your meal or snack showing no added sugar, or a photo of a nutrition label.',
     'health',
     0.15, 14, 6, 5, 0.75, 'daily', 'active', true, v_u1,
     (v_today - 10)::timestamptz,
     (v_today + 4)::timestamptz,
     (v_today - 12)::timestamptz
    ),
    (v_p3,
     'Read 30 Minutes 📚',
     '📚',
     'Read for at least 30 minutes every day. Any book, any genre. Grow your mind.',
     'Photo of the book you''re reading with a timestamp or your reading app showing today''s session.',
     'education',
     0.25, 30, 8, 5, 1.25, 'daily', 'active', false, v_u4,
     (v_today - 12)::timestamptz,
     (v_today + 18)::timestamptz,
     (v_today - 14)::timestamptz
    )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    current_players = EXCLUDED.current_players,
    pot_size = EXCLUDED.pot_size,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at;

  -- ════════════════════════════════════════════════════════════
  -- 3. Create pool members
  -- ════════════════════════════════════════════════════════════

  -- Pool 1: Morning Runs — me + 5 others
  INSERT INTO pool_members (id, pool_id, user_id, status, current_streak, best_streak, days_completed, last_proof_date, joined_at)
  VALUES
    (v_mm1, v_p1, v_me,  'active',  8,  8,  12, v_today - 1, (v_today - 14)::timestamptz),
    (v_m1,  v_p1, v_u1,  'active',  9,  9,  13, v_today,     (v_today - 14)::timestamptz),
    (v_m2,  v_p1, v_u2,  'active',  5,  7,   9, v_today - 1, (v_today - 14)::timestamptz),
    (v_m3,  v_p1, v_u3,  'active',  3,  6,   7, v_today - 2, (v_today - 13)::timestamptz),
    (v_m4,  v_p1, v_u5,  'active',  2,  4,   5, v_today - 3, (v_today - 12)::timestamptz),
    (v_m5,  v_p1, v_u7,  'active',  6,  6,  10, v_today,     (v_today - 14)::timestamptz)
  ON CONFLICT (id) DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    best_streak = EXCLUDED.best_streak,
    days_completed = EXCLUDED.days_completed,
    last_proof_date = EXCLUDED.last_proof_date;

  -- Pool 2: No Sugar — me + 4 others
  INSERT INTO pool_members (id, pool_id, user_id, status, current_streak, best_streak, days_completed, last_proof_date, joined_at)
  VALUES
    (v_mm2, v_p2, v_me,  'active',  7,  7,   9, v_today - 1, (v_today - 10)::timestamptz),
    (v_m6,  v_p2, v_u4,  'active', 10, 10,  10, v_today,     (v_today - 10)::timestamptz),
    (v_m7,  v_p2, v_u2,  'active',  4,  6,   7, v_today - 1, (v_today - 10)::timestamptz),
    (v_m8,  v_p2, v_u6,  'active',  7,  7,   8, v_today,     (v_today - 10)::timestamptz),
    (v_m9,  v_p2, v_u3,  'active',  2,  5,   5, v_today - 4, (v_today -  9)::timestamptz)
  ON CONFLICT (id) DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    best_streak = EXCLUDED.best_streak,
    days_completed = EXCLUDED.days_completed,
    last_proof_date = EXCLUDED.last_proof_date;

  -- Pool 3: Read 30 Min — me + 4 others
  INSERT INTO pool_members (id, pool_id, user_id, status, current_streak, best_streak, days_completed, last_proof_date, joined_at)
  VALUES
    (v_mm3, v_p3, v_me,  'active',  5,  8,   9, v_today - 1, (v_today - 12)::timestamptz),
    (v_m10, v_p3, v_u4,  'active', 11, 11,  11, v_today,     (v_today - 12)::timestamptz),
    (v_m11, v_p3, v_u1,  'active',  8,  8,  10, v_today,     (v_today - 12)::timestamptz),
    (v_m12, v_p3, v_u6,  'active',  6,  9,   8, v_today - 1, (v_today - 11)::timestamptz),
    -- Jordan failed this pool
    (gen_random_uuid(), v_p3, v_u5, 'failed', 0, 3, 3, v_today - 9, (v_today - 12)::timestamptz)
  ON CONFLICT (id) DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    best_streak = EXCLUDED.best_streak,
    days_completed = EXCLUDED.days_completed,
    last_proof_date = EXCLUDED.last_proof_date;

  -- ════════════════════════════════════════════════════════════
  -- 4. Create daily_habits for the real user (rich habit grid)
  --    Pattern: recent = intense, older = sporadic
  -- ════════════════════════════════════════════════════════════

  -- Clear existing demo habits to avoid duplicates
  DELETE FROM daily_habits WHERE user_id = v_me AND habit_date >= v_today - 60;

  FOR i IN 0..30 LOOP
    v_d := v_today - i;
    -- Determine proof count for a nice gradient
    IF i = 0 THEN
      v_cnt := 1;   -- today: 1 proof so far
    ELSIF i <= 3 THEN
      v_cnt := 3;   -- last 3 days: 3 proofs/day (all 3 pools) → darkest green
    ELSIF i <= 7 THEN
      v_cnt := 2;   -- days 4-7: 2 proofs/day → medium green
    ELSIF i <= 12 THEN
      v_cnt := 1;   -- days 8-12: 1 proof/day → light green
    ELSIF i = 13 OR i = 14 THEN
      v_cnt := 0;   -- gap (streak break) → empty
    ELSIF i <= 18 THEN
      v_cnt := 1;   -- earlier streak → light green
    ELSIF i = 19 THEN
      v_cnt := 0;   -- another gap
    ELSIF i <= 23 THEN
      v_cnt := 2;   -- older strong period → medium green
    ELSIF i <= 25 THEN
      v_cnt := 0;   -- gap
    ELSIF i <= 28 THEN
      v_cnt := 1;   -- earliest activity
    ELSE
      v_cnt := 0;
    END IF;

    IF v_cnt > 0 THEN
      INSERT INTO daily_habits (user_id, habit_date, proofs_count, created_at)
      VALUES (v_me, v_d, v_cnt, v_d::timestamptz + interval '8 hours')
      ON CONFLICT (user_id, habit_date) DO UPDATE SET proofs_count = EXCLUDED.proofs_count;
    END IF;
  END LOOP;

  -- Also create some daily_habits for fake users (so calculate_global_streak works for them)
  FOR i IN 0..10 LOOP
    v_d := v_today - i;
    -- Priya: 11-day streak
    INSERT INTO daily_habits (user_id, habit_date, proofs_count) VALUES (v_u4, v_d, 2)
    ON CONFLICT (user_id, habit_date) DO UPDATE SET proofs_count = EXCLUDED.proofs_count;
    -- Alex: 9-day streak
    IF i <= 8 THEN
      INSERT INTO daily_habits (user_id, habit_date, proofs_count) VALUES (v_u1, v_d, 2)
      ON CONFLICT (user_id, habit_date) DO UPDATE SET proofs_count = EXCLUDED.proofs_count;
    END IF;
    -- Lena: 7-day streak
    IF i <= 6 THEN
      INSERT INTO daily_habits (user_id, habit_date, proofs_count) VALUES (v_u6, v_d, 1)
      ON CONFLICT (user_id, habit_date) DO UPDATE SET proofs_count = EXCLUDED.proofs_count;
    END IF;
    -- Sarah: 6-day streak
    IF i <= 5 THEN
      INSERT INTO daily_habits (user_id, habit_date, proofs_count) VALUES (v_u2, v_d, 1)
      ON CONFLICT (user_id, habit_date) DO UPDATE SET proofs_count = EXCLUDED.proofs_count;
    END IF;
  END LOOP;

  -- ════════════════════════════════════════════════════════════
  -- 5. Create approved proofs for the real user
  -- ════════════════════════════════════════════════════════════

  -- Clear old proofs for demo pools
  DELETE FROM proofs WHERE user_id = v_me AND pool_id IN (v_p1, v_p2, v_p3);

  -- Generate proofs for each day with habits (pool 1)
  FOR i IN 0..12 LOOP
    v_d := v_today - i;
    IF i != 13 AND i != 14 THEN
      v_proof_id := gen_random_uuid();
      INSERT INTO proofs (id, pool_id, user_id, member_id, image_url, status, ai_confidence, ai_reasoning, proof_date, verified_at, created_at)
      VALUES (
        v_proof_id, v_p1, v_me, v_mm1,
        'https://demo.getstaked.io/proofs/run_' || i || '.jpg',
        'approved', 0.92 + (random() * 0.07),
        'Running activity confirmed. Distance and time visible in screenshot.',
        v_d,
        v_d::timestamptz + interval '7 hours',
        v_d::timestamptz + interval '6 hours 50 minutes'
      ) ON CONFLICT (pool_id, user_id, proof_date) DO NOTHING;
    END IF;
  END LOOP;

  -- Pool 2 proofs (last 9 days)
  FOR i IN 0..9 LOOP
    v_d := v_today - i;
    v_proof_id := gen_random_uuid();
    INSERT INTO proofs (id, pool_id, user_id, member_id, image_url, status, ai_confidence, ai_reasoning, proof_date, verified_at, created_at)
    VALUES (
      v_proof_id, v_p2, v_me, v_mm2,
      'https://demo.getstaked.io/proofs/meal_' || i || '.jpg',
      'approved', 0.88 + (random() * 0.10),
      'Healthy meal confirmed. No visible added sugars in the photo.',
      v_d,
      v_d::timestamptz + interval '12 hours',
      v_d::timestamptz + interval '11 hours 45 minutes'
    ) ON CONFLICT (pool_id, user_id, proof_date) DO NOTHING;
  END LOOP;

  -- Pool 3 proofs (last 9 days, with a gap at day 5-6)
  FOR i IN 0..9 LOOP
    v_d := v_today - i;
    IF i != 5 AND i != 6 THEN
      v_proof_id := gen_random_uuid();
      INSERT INTO proofs (id, pool_id, user_id, member_id, image_url, status, ai_confidence, ai_reasoning, proof_date, verified_at, created_at)
      VALUES (
        v_proof_id, v_p3, v_me, v_mm3,
        'https://demo.getstaked.io/proofs/book_' || i || '.jpg',
        'approved', 0.90 + (random() * 0.08),
        'Reading activity confirmed. Book and timestamp visible.',
        v_d,
        v_d::timestamptz + interval '21 hours',
        v_d::timestamptz + interval '20 hours 30 minutes'
      ) ON CONFLICT (pool_id, user_id, proof_date) DO NOTHING;
    END IF;
  END LOOP;

  -- ════════════════════════════════════════════════════════════
  -- 6. Update the real user's profile stats
  -- ════════════════════════════════════════════════════════════

  UPDATE profiles SET
    current_streak = 8,
    best_streak = 12,
    total_pools_joined = 3,
    total_pools_won = 1,
    total_proofs_submitted = 28,
    total_proofs_verified = 28,
    total_sol_earned = 0.45,
    total_sol_staked = 0.60,
    sol_balance = 1.25
  WHERE id = v_me;

  -- ════════════════════════════════════════════════════════════
  -- 7. Create transactions
  -- ════════════════════════════════════════════════════════════

  DELETE FROM transactions WHERE user_id = v_me AND tx_signature LIKE 'demo_%';

  INSERT INTO transactions (user_id, pool_id, type, amount, status, tx_signature, created_at)
  VALUES
    -- Stake deposits
    (v_me, v_p1, 'stake_deposit', 0.20, 'confirmed', 'demo_stake_p1_' || v_me, (v_today - 14)::timestamptz),
    (v_me, v_p2, 'stake_deposit', 0.15, 'confirmed', 'demo_stake_p2_' || v_me, (v_today - 10)::timestamptz),
    (v_me, v_p3, 'stake_deposit', 0.25, 'confirmed', 'demo_stake_p3_' || v_me, (v_today - 12)::timestamptz),
    -- Winnings from a completed pool
    (v_me, v_p1, 'winnings_claim', 0.35, 'confirmed', 'demo_win_p1_' || v_me, (v_today - 2)::timestamptz),
    (v_me, v_p2, 'winnings_claim', 0.10, 'confirmed', 'demo_win_p2_' || v_me, (v_today - 1)::timestamptz);

  -- ════════════════════════════════════════════════════════════
  -- 8. Create activity log
  -- ════════════════════════════════════════════════════════════

  DELETE FROM activity_log WHERE user_id = v_me AND description LIKE '%demo%';

  INSERT INTO activity_log (user_id, pool_id, action, description, created_at)
  VALUES
    (v_me, v_p1, 'pool_joined',     'Joined Morning Runs pool (demo)',              (v_today - 14)::timestamptz),
    (v_me, v_p2, 'pool_joined',     'Joined No Sugar Challenge pool (demo)',        (v_today - 10)::timestamptz),
    (v_me, v_p3, 'pool_joined',     'Joined Read 30 Minutes pool (demo)',           (v_today - 12)::timestamptz),
    (v_me, v_p1, 'proof_verified',  'Proof verified by AI (confidence: 0.95) demo', (v_today - 1)::timestamptz + interval '7 hours'),
    (v_me, v_p2, 'proof_verified',  'Proof verified by AI (confidence: 0.92) demo', (v_today - 1)::timestamptz + interval '12 hours'),
    (v_me, v_p3, 'proof_verified',  'Proof verified by AI (confidence: 0.94) demo', (v_today - 1)::timestamptz + interval '21 hours'),
    (v_me, v_p1, 'proof_verified',  'Proof verified by AI (confidence: 0.97) demo', v_today::timestamptz + interval '7 hours'),
    (v_me, NULL, 'streak_milestone','Reached 7-day streak! (demo)',                  (v_today - 1)::timestamptz);

  -- ════════════════════════════════════════════════════════════
  -- 9. Re-enable triggers
  -- ════════════════════════════════════════════════════════════
  ALTER TABLE pool_members ENABLE TRIGGER on_pool_member_join;

  RAISE NOTICE '✅ Demo data seeded successfully for user: % (%)', v_me_name, v_me;
  RAISE NOTICE '   Pools: Morning Runs, No Sugar Challenge, Read 30 Minutes';
  RAISE NOTICE '   Current streak: 8 days | Best streak: 12 days';
  RAISE NOTICE '   Habit grid: 30 days of data with intensity gradient';
  RAISE NOTICE '   Pool members: 7 fake users with realistic streaks';

END $$;
