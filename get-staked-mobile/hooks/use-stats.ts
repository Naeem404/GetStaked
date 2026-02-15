import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';
import { useAuth } from '@/lib/auth-context';

export interface HabitDay {
  date: Date;
  count: number;
  isToday?: boolean;
}

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  completionRate: number;
  totalSolEarned: number;
  winRate: number;
}

export function useHabitGrid(numDays: number = 91) {
  const { user } = useAuth();
  const [days, setDays] = useState<HabitDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabitData = useCallback(async () => {
    if (!user) {
      setDays(generateEmptyDays(numDays));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - numDays);
      const startStr = startDate.toISOString().split('T')[0];

      // Build a map of date -> count
      const habitMap = new Map<string, number>();

      // Method A: daily_habits table
      try {
        const { data, error } = await supabase
          .from('daily_habits')
          .select('habit_date, proofs_count')
          .eq('user_id', user.id)
          .gte('habit_date', startStr)
          .order('habit_date', { ascending: true });

        if (!error && data) {
          data.forEach(d => {
            habitMap.set(d.habit_date, d.proofs_count || 0);
          });
        }
      } catch (e) {
        console.warn('daily_habits query failed:', e);
      }

      // Method B: if daily_habits empty, count approved proofs per day
      if (habitMap.size === 0) {
        try {
          const { data: proofs } = await supabase
            .from('proofs')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .gte('created_at', `${startStr}T00:00:00`);

          if (proofs && proofs.length > 0) {
            proofs.forEach(p => {
              if (!p.created_at) return;
              const dateStr = new Date(p.created_at).toISOString().split('T')[0];
              habitMap.set(dateStr, (habitMap.get(dateStr) || 0) + 1);
            });
          }
        } catch (e) {
          console.warn('proofs habit fallback failed:', e);
        }
      }

      // Generate day array
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const result: HabitDay[] = [];

      for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 86400000);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === todayStr;
        const count = habitMap.get(dateStr) || 0;
        result.push({ date, count, isToday });
      }

      setDays(result);
    } catch (err) {
      console.error('Error fetching habit data:', err);
      setDays(generateEmptyDays(numDays));
    } finally {
      setLoading(false);
    }
  }, [user, numDays]);

  useEffect(() => {
    fetchHabitData();
  }, [fetchHabitData]);

  return { days, loading, refetch: fetchHabitData };
}

export function useUserStats() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    bestStreak: 0,
    totalDays: 0,
    completionRate: 0,
    totalSolEarned: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ── 1. Streak: try RPC, fall back to pool_members, fall back to profile ──
      let currentStreak = 0;
      let bestStreak = 0;

      // Method A: RPC
      try {
        const { data: streakData, error: streakErr } = await supabase.rpc('calculate_global_streak', {
          p_user_id: user.id,
        });
        if (!streakErr && streakData && streakData.length > 0) {
          currentStreak = streakData[0].current_streak ?? 0;
          bestStreak = streakData[0].best_streak ?? 0;
        }
      } catch (rpcErr) {
        console.warn('calculate_global_streak RPC failed:', rpcErr);
      }

      // Method B: if RPC gave zeros, compute from pool_members directly
      if (currentStreak === 0) {
        try {
          const { data: memberStreaks } = await supabase
            .from('pool_members')
            .select('current_streak')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('current_streak', { ascending: false })
            .limit(1);

          if (memberStreaks && memberStreaks.length > 0) {
            currentStreak = memberStreaks[0].current_streak ?? 0;
          }
        } catch (e) {
          console.warn('pool_members streak fallback failed:', e);
        }
      }

      // Method C: profile fallback
      if (currentStreak === 0 && profile) {
        currentStreak = profile.current_streak ?? 0;
      }
      if (bestStreak === 0 && profile) {
        bestStreak = profile.best_streak ?? 0;
      }
      bestStreak = Math.max(bestStreak, currentStreak);

      // ── 2. Total days: try daily_habits, fall back to counting proofs ──
      let totalDays = 0;

      // Method A: daily_habits
      try {
        const { count } = await supabase
          .from('daily_habits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gt('proofs_count', 0);
        totalDays = count || 0;
      } catch (e) {
        console.warn('daily_habits count failed:', e);
      }

      // Method B: if daily_habits empty, count distinct proof dates
      if (totalDays === 0) {
        try {
          const { data: proofDays } = await supabase
            .from('proofs')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('status', 'approved');

          if (proofDays && proofDays.length > 0) {
            const uniqueDates = new Set(
              proofDays.filter(p => p.created_at).map(p => new Date(p.created_at!).toISOString().split('T')[0])
            );
            totalDays = uniqueDates.size;
          }
        } catch (e) {
          console.warn('proofs date count fallback failed:', e);
        }
      }

      // ── 3. Win rate from profile ──
      const totalPoolsJoined = profile?.total_pools_joined || 0;
      const totalPoolsWon = profile?.total_pools_won || 0;
      const winRate = totalPoolsJoined > 0
        ? Math.round((totalPoolsWon / totalPoolsJoined) * 100)
        : 0;

      // ── 4. Completion rate ──
      let completionRate = 0;
      try {
        // Try daily_habits first
        const { data: firstDay } = await supabase
          .from('daily_habits')
          .select('habit_date')
          .eq('user_id', user.id)
          .order('habit_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        let firstDate: Date | null = firstDay ? new Date(firstDay.habit_date) : null;

        // Fallback: first proof date
        if (!firstDate) {
          const { data: firstProof } = await supabase
            .from('proofs')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (firstProof?.created_at) {
            firstDate = new Date(firstProof.created_at);
          }
        }

        if (firstDate) {
          const today = new Date();
          const totalPossibleDays = Math.ceil((today.getTime() - firstDate.getTime()) / 86400000) + 1;
          completionRate = totalPossibleDays > 0
            ? Math.round((totalDays / totalPossibleDays) * 100)
            : 0;
        }
      } catch (e) {
        console.warn('Completion rate calc failed:', e);
      }

      // ── 5. SOL earned ──
      let totalSolEarned = profile?.total_sol_earned || 0;
      try {
        const { data: txData } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'winnings_claim' as any)
          .eq('status', 'confirmed');

        if (txData && txData.length > 0) {
          totalSolEarned = txData.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        }
      } catch (e) {
        console.warn('Transactions query failed:', e);
      }

      setStats({
        currentStreak,
        bestStreak,
        totalDays,
        completionRate,
        totalSolEarned,
        winRate,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

function generateEmptyDays(numDays: number): HabitDay[] {
  const today = new Date();
  const result: HabitDay[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000);
    result.push({ date, count: 0, isToday: i === 0 });
  }
  return result;
}
