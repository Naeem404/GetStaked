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

      const { data, error } = await supabase
        .from('daily_habits')
        .select('habit_date, proofs_count')
        .eq('user_id', user.id)
        .gte('habit_date', startStr)
        .order('habit_date', { ascending: true });

      if (error) throw error;

      // Build a map of date -> count
      const habitMap = new Map<string, number>();
      (data || []).forEach(d => {
        habitMap.set(d.habit_date, d.proofs_count || 0);
      });

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
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Calculate global streak from DB — this RPC also persists to profiles table
      const { data: streakData, error: streakErr } = await supabase.rpc('calculate_global_streak', {
        p_user_id: user.id,
      });

      let currentStreak = profile.current_streak ?? 0;
      let bestStreak = profile.best_streak ?? 0;

      if (!streakErr && streakData && streakData.length > 0) {
        currentStreak = streakData[0].current_streak ?? 0;
        bestStreak = streakData[0].best_streak ?? 0;
      }

      // Get total days with proofs
      const { count: totalDays } = await supabase
        .from('daily_habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('proofs_count', 0);

      // Calculate win rate
      const totalPoolsJoined = profile.total_pools_joined || 0;
      const totalPoolsWon = profile.total_pools_won || 0;
      const winRate = totalPoolsJoined > 0
        ? Math.round((totalPoolsWon / totalPoolsJoined) * 100)
        : 0;

      // Calculate completion rate (days with proofs / total days since first proof)
      const { data: firstDay } = await supabase
        .from('daily_habits')
        .select('habit_date')
        .eq('user_id', user.id)
        .order('habit_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      let completionRate = 0;
      if (firstDay) {
        const firstDate = new Date(firstDay.habit_date);
        const today = new Date();
        const totalPossibleDays = Math.ceil((today.getTime() - firstDate.getTime()) / 86400000) + 1;
        completionRate = totalPossibleDays > 0
          ? Math.round(((totalDays || 0) / totalPossibleDays) * 100)
          : 0;
      }

      // Get total SOL earned from transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'winnings_claim' as any)
        .eq('status', 'confirmed');

      const totalSolEarned = txData
        ? txData.reduce((sum, tx) => sum + (tx.amount || 0), 0)
        : (profile.total_sol_earned || 0);

      setStats({
        currentStreak,
        bestStreak,
        totalDays: totalDays || 0,
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
