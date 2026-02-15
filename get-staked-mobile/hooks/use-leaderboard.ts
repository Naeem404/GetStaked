import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  current_streak: number;
  best_streak: number;
  total_pools_joined: number;
  total_pools_won: number;
  total_sol_earned: number;
  total_proofs_submitted: number;
  rank: number;
}

export interface PoolLeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_streak: number;
  best_streak: number;
  days_completed: number;
  total_proofs: number;
  rank: number;
}

export function useGlobalLeaderboard(limit: number = 50) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      // Try RPC first (preferred — uses the get_global_leaderboard function)
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_global_leaderboard',
        { p_limit: limit }
      );

      if (!rpcError && rpcData && rpcData.length > 0) {
        setEntries(rpcData);
        if (user) {
          const me = rpcData.find((e: any) => e.user_id === user.id);
          setMyRank(me || null);
        }
      } else {
        // Fallback: query profiles directly
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url, wallet_address, current_streak, best_streak, total_pools_joined, total_pools_won, total_sol_earned, total_proofs_submitted')
          .or('current_streak.gt.0,total_pools_joined.gt.0,total_proofs_submitted.gt.0,best_streak.gt.0')
          .order('current_streak', { ascending: false, nullsFirst: false })
          .order('total_pools_joined', { ascending: false, nullsFirst: false })
          .order('total_proofs_submitted', { ascending: false, nullsFirst: false })
          .limit(limit);

        if (error) throw error;

        const ranked: LeaderboardEntry[] = (data || []).map((p: any, idx: number) => ({
          user_id: p.id,
          display_name: p.display_name,
          username: p.username,
          avatar_url: p.avatar_url,
          wallet_address: p.wallet_address,
          current_streak: p.current_streak ?? 0,
          best_streak: p.best_streak ?? 0,
          total_pools_joined: p.total_pools_joined ?? 0,
          total_pools_won: p.total_pools_won ?? 0,
          total_sol_earned: p.total_sol_earned ?? 0,
          total_proofs_submitted: p.total_proofs_submitted ?? 0,
          rank: idx + 1,
        }));

        setEntries(ranked);
        if (user) {
          const me = ranked.find(e => e.user_id === user.id);
          if (me) {
            setMyRank(me);
          } else {
            // Fetch current user's stats separately
            const { data: myData } = await supabase
              .from('profiles')
              .select('id, display_name, username, avatar_url, wallet_address, current_streak, best_streak, total_pools_joined, total_pools_won, total_sol_earned, total_proofs_submitted')
              .eq('id', user.id)
              .single();

            if (myData) {
              setMyRank({
                user_id: myData.id,
                display_name: myData.display_name,
                username: myData.username,
                avatar_url: myData.avatar_url,
                wallet_address: myData.wallet_address,
                current_streak: myData.current_streak ?? 0,
                best_streak: myData.best_streak ?? 0,
                total_pools_joined: myData.total_pools_joined ?? 0,
                total_pools_won: myData.total_pools_won ?? 0,
                total_sol_earned: myData.total_sol_earned ?? 0,
                total_proofs_submitted: myData.total_proofs_submitted ?? 0,
                rank: ranked.length + 1,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, myRank, loading, refetch: fetchLeaderboard };
}

export function usePoolLeaderboard(poolId: string | null) {
  const [entries, setEntries] = useState<PoolLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    if (!poolId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_pool_leaderboard',
        { p_pool_id: poolId }
      );

      if (!rpcError && rpcData) {
        setEntries(rpcData);
      } else {
        // Fallback: query pool_members directly
        const { data, error } = await supabase
          .from('pool_members')
          .select(`
            user_id, current_streak, best_streak, days_completed,
            profiles (display_name, avatar_url)
          `)
          .eq('pool_id', poolId)
          .eq('status', 'active')
          .order('current_streak', { ascending: false, nullsFirst: false });

        if (error) throw error;

        const ranked: PoolLeaderboardEntry[] = (data || []).map((m: any, idx: number) => ({
          user_id: m.user_id,
          display_name: m.profiles?.display_name || null,
          avatar_url: m.profiles?.avatar_url || null,
          current_streak: m.current_streak ?? 0,
          best_streak: m.best_streak ?? 0,
          days_completed: m.days_completed ?? 0,
          total_proofs: 0,
          rank: idx + 1,
        }));

        setEntries(ranked);
      }
    } catch (err) {
      console.error('Error fetching pool leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, refetch: fetchLeaderboard };
}
