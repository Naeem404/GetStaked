import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { creditDemo } from '@/lib/demo-wallet';

export interface Lifeline {
  id: string;
  pool_id: string;
  user_id: string;
  type: 'skip_day' | 'friend_vouch';
  friend_id: string | null;
  friend_name: string | null;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  used_at: string | null;
}

export interface LifelineState {
  available: number;     // How many lifelines available
  used: number;          // How many used
  maxPerPool: number;    // Max lifelines per pool
}

const MAX_LIFELINES_PER_POOL = 3;
const LIFELINE_COST = 0.5; // Demo SOL cost to buy a lifeline

/**
 * Hook to manage lifelines for a specific pool membership
 */
export function useLifelines(poolId: string | null) {
  const { user } = useAuth();
  const [state, setState] = useState<LifelineState>({
    available: 0,
    used: 0,
    maxPerPool: MAX_LIFELINES_PER_POOL,
  });
  const [lifelines, setLifelines] = useState<Lifeline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLifelines = useCallback(async () => {
    if (!user || !poolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Try to get lifelines from activity_log (using it as a lightweight store)
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('pool_id', poolId)
        .in('action', ['lifeline_purchased', 'lifeline_friend_vouch', 'lifeline_used']);

      if (error) throw error;

      const purchased = (data || []).filter(
        (a: any) => a.action === 'lifeline_purchased' || a.action === 'lifeline_friend_vouch'
      ).length;
      const used = (data || []).filter((a: any) => a.action === 'lifeline_used').length;

      setState({
        available: Math.min(purchased - used, MAX_LIFELINES_PER_POOL),
        used,
        maxPerPool: MAX_LIFELINES_PER_POOL,
      });
    } catch (err) {
      console.error('Error fetching lifelines:', err);
    } finally {
      setLoading(false);
    }
  }, [user, poolId]);

  useEffect(() => {
    fetchLifelines();
  }, [fetchLifelines]);

  return { state, lifelines, loading, refetch: fetchLifelines };
}

/**
 * Purchase a lifeline with demo SOL
 */
export async function purchaseLifeline(
  userId: string,
  poolId: string,
): Promise<{ success: boolean; error?: string }> {
  // Check current lifeline count
  const { data: existing } = await supabase
    .from('activity_log')
    .select('id, action')
    .eq('user_id', userId)
    .eq('pool_id', poolId)
    .in('action', ['lifeline_purchased', 'lifeline_friend_vouch', 'lifeline_used']);

  const purchased = (existing || []).filter(
    (a: any) => a.action === 'lifeline_purchased' || a.action === 'lifeline_friend_vouch'
  ).length;
  const used = (existing || []).filter((a: any) => a.action === 'lifeline_used').length;
  const available = purchased - used;

  if (available >= MAX_LIFELINES_PER_POOL) {
    return { success: false, error: `Max ${MAX_LIFELINES_PER_POOL} lifelines per pool` };
  }

  // Deduct demo SOL
  const { data: profile } = await supabase
    .from('profiles')
    .select('sol_balance')
    .eq('id', userId)
    .single();

  const balance = profile?.sol_balance ?? 0;
  if (balance < LIFELINE_COST) {
    return { success: false, error: `Need ${LIFELINE_COST} SOL. You have ${balance.toFixed(2)}.` };
  }

  // Deduct balance
  await supabase
    .from('profiles')
    .update({ sol_balance: Math.round((balance - LIFELINE_COST) * 1e6) / 1e6 })
    .eq('id', userId);

  // Log the purchase
  await supabase.from('activity_log').insert({
    user_id: userId,
    pool_id: poolId,
    action: 'lifeline_purchased',
    description: `Purchased lifeline for ${LIFELINE_COST} SOL`,
  });

  return { success: true };
}

/**
 * Request a friend vouch (gives a free lifeline)
 */
export async function requestFriendVouch(
  userId: string,
  poolId: string,
  friendId: string,
  friendName: string,
): Promise<{ success: boolean; error?: string }> {
  // Check current lifeline count
  const { data: existing } = await supabase
    .from('activity_log')
    .select('id, action')
    .eq('user_id', userId)
    .eq('pool_id', poolId)
    .in('action', ['lifeline_purchased', 'lifeline_friend_vouch', 'lifeline_used']);

  const purchased = (existing || []).filter(
    (a: any) => a.action === 'lifeline_purchased' || a.action === 'lifeline_friend_vouch'
  ).length;
  const used = (existing || []).filter((a: any) => a.action === 'lifeline_used').length;

  if (purchased - used >= MAX_LIFELINES_PER_POOL) {
    return { success: false, error: `Max ${MAX_LIFELINES_PER_POOL} lifelines per pool` };
  }

  // Log the friend vouch
  await supabase.from('activity_log').insert({
    user_id: userId,
    pool_id: poolId,
    action: 'lifeline_friend_vouch',
    description: `${friendName} vouched — free lifeline granted`,
  });

  return { success: true };
}

/**
 * Use a lifeline to skip a day without breaking streak
 */
export async function activateLifeline(
  userId: string,
  poolId: string,
  memberId: string,
): Promise<{ success: boolean; error?: string }> {
  // Check availability
  const { data: existing } = await supabase
    .from('activity_log')
    .select('id, action')
    .eq('user_id', userId)
    .eq('pool_id', poolId)
    .in('action', ['lifeline_purchased', 'lifeline_friend_vouch', 'lifeline_used']);

  const purchased = (existing || []).filter(
    (a: any) => a.action === 'lifeline_purchased' || a.action === 'lifeline_friend_vouch'
  ).length;
  const used = (existing || []).filter((a: any) => a.action === 'lifeline_used').length;

  if (purchased - used <= 0) {
    return { success: false, error: 'No lifelines available' };
  }

  const today = new Date().toISOString().split('T')[0];

  // Mark today's proof as "covered" by setting last_proof_date
  await supabase
    .from('pool_members')
    .update({ last_proof_date: today })
    .eq('id', memberId);

  // Update daily_habits
  await supabase.from('daily_habits').upsert(
    { user_id: userId, habit_date: today, proofs_count: 1 },
    { onConflict: 'user_id,habit_date' }
  );

  // Log the usage
  await supabase.from('activity_log').insert({
    user_id: userId,
    pool_id: poolId,
    action: 'lifeline_used',
    description: 'Used lifeline to skip proof for today',
  });

  return { success: true };
}
