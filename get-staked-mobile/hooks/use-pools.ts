import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables, TablesInsert } from '@/lib/database.types';
import { useAuth } from '@/lib/auth-context';

type Pool = Tables<'pools'>;
type PoolMember = Tables<'pool_members'>;

export interface PoolWithMembers extends Pool {
  pool_members: (PoolMember & { profiles: Tables<'profiles'> | null })[];
  my_membership?: PoolMember | null;
}

export function usePools(category?: string) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('pools')
        .select('*')
        .in('status', ['waiting', 'active'])
        .order('is_hot', { ascending: false })
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPools(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return { pools, loading, error, refetch: fetchPools };
}

export function useMyPools() {
  const { user } = useAuth();
  const [pools, setPools] = useState<PoolWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPools = useCallback(async () => {
    if (!user) {
      setPools([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get pools where user is a member
      const { data: memberships, error: memError } = await supabase
        .from('pool_members')
        .select('pool_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'completed']);

      if (memError) throw memError;

      if (!memberships || memberships.length === 0) {
        setPools([]);
        setLoading(false);
        return;
      }

      const poolIds = memberships.map(m => m.pool_id);

      const { data, error } = await supabase
        .from('pools')
        .select(`
          *,
          pool_members (
            *,
            profiles (id, display_name, avatar_url, wallet_address)
          )
        `)
        .in('id', poolIds)
        .in('status', ['active', 'waiting', 'settling'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add my_membership reference
      const poolsWithMembership = (data || []).map(pool => ({
        ...pool,
        my_membership: pool.pool_members?.find((m: any) => m.user_id === user.id) || null,
      }));

      setPools(poolsWithMembership as PoolWithMembers[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyPools();
  }, [fetchMyPools]);

  return { pools, loading, error, refetch: fetchMyPools };
}

export function usePoolDetail(poolId: string | null) {
  const { user } = useAuth();
  const [pool, setPool] = useState<PoolWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPool = useCallback(async () => {
    if (!poolId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pools')
        .select(`
          *,
          pool_members (
            *,
            profiles (id, display_name, avatar_url, wallet_address)
          )
        `)
        .eq('id', poolId)
        .single();

      if (error) throw error;

      const poolWithMembership = {
        ...data,
        my_membership: data.pool_members?.find((m: any) => m.user_id === user?.id) || null,
      };

      setPool(poolWithMembership as PoolWithMembers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [poolId, user]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return { pool, loading, error, refetch: fetchPool };
}

/**
 * Join a pool. The DB trigger `handle_pool_member_join` automatically:
 *  - increments current_players & pot_size
 *  - auto-activates pool when >= 2 players
 *
 * @param txSignature Optional Solana tx signature if user staked SOL on-chain
 */
export async function joinPool(
  poolId: string,
  userId: string,
  txSignature?: string,
) {
  // Check pool capacity first
  const { data: poolCheck } = await supabase
    .from('pools')
    .select('current_players, max_players, stake_amount, status')
    .eq('id', poolId)
    .single();

  if (poolCheck) {
    if ((poolCheck.current_players ?? 0) >= poolCheck.max_players) {
      return { data: null, error: { message: 'Pool is full' } as any };
    }
    if (poolCheck.status !== 'waiting' && poolCheck.status !== 'active') {
      return { data: null, error: { message: 'Pool is no longer accepting players' } as any };
    }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('pool_members')
    .select('id')
    .eq('pool_id', poolId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { data: null, error: { message: 'Already a member of this pool' } as any };
  }

  const { data, error } = await supabase
    .from('pool_members')
    .insert({
      pool_id: poolId,
      user_id: userId,
      status: 'active' as any,
      stake_tx_signature: txSignature || null,
    })
    .select()
    .single();

  if (error) {
    console.error('joinPool insert error:', error);
    // Provide user-friendly error messages
    if (error.code === '42501') {
      return { data: null, error: { message: 'Permission denied. RLS policies may need to be configured.' } as any };
    }
    if (error.code === '23505') {
      return { data: null, error: { message: 'You are already a member of this pool.' } as any };
    }
    return { data, error };
  }

  // ── Post-join updates (all with fallbacks) ──

  // 1. Manually update pool counts (fallback if trigger doesn't exist)
  try {
    await supabase.rpc('increment_pool_players' as any, { p_pool_id: poolId });
  } catch {
    // If RPC doesn't exist, do it manually
    const { data: currentPool } = await supabase
      .from('pools')
      .select('current_players, pot_size, stake_amount, status')
      .eq('id', poolId)
      .single();
    if (currentPool) {
      const newCount = (currentPool.current_players ?? 0) + 1;
      const newPot = (currentPool.pot_size ?? 0) + (currentPool.stake_amount ?? 0);
      const updates: any = { current_players: newCount, pot_size: newPot };
      // Auto-activate pool when 2+ players
      if (newCount >= 2 && currentPool.status === 'waiting') {
        updates.status = 'active';
        updates.started_at = new Date().toISOString();
      }
      await supabase.from('pools').update(updates).eq('id', poolId);
    }
  }

  // 2. Log activity (non-blocking)
  supabase.from('activity_log').insert({
    user_id: userId,
    pool_id: poolId,
    action: 'pool_joined',
    description: 'Joined a stake pool',
  }).then(() => {});

  // 3. Increment total pools joined on profile
  const { data: prof } = await supabase
    .from('profiles')
    .select('total_pools_joined')
    .eq('id', userId)
    .single();
  await supabase
    .from('profiles')
    .update({ total_pools_joined: (prof?.total_pools_joined ?? 0) + 1 })
    .eq('id', userId);

  // 4. Record Solana transaction if provided
  if (txSignature && poolCheck) {
    try {
      await supabase.rpc('record_sol_transaction', {
        p_user_id: userId,
        p_pool_id: poolId,
        p_type: 'stake_deposit',
        p_amount: poolCheck.stake_amount,
        p_tx_signature: txSignature,
      });
    } catch {
      // Fallback: insert directly
      await supabase.from('transactions').insert({
        user_id: userId,
        pool_id: poolId,
        type: 'stake_deposit' as any,
        amount: poolCheck.stake_amount,
        tx_signature: txSignature,
        status: 'confirmed',
      });
    }
  }

  return { data, error: null };
}

export async function createPool(pool: TablesInsert<'pools'>) {
  const { data, error } = await supabase
    .from('pools')
    .insert(pool)
    .select()
    .single();

  if (data && !error) {
    // Creator auto-joins the pool (trigger handles current_players/pot_size)
    await supabase
      .from('pool_members')
      .insert({ pool_id: data.id, user_id: pool.creator_id, status: 'active' as any });

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: pool.creator_id,
      pool_id: data.id,
      action: 'pool_created',
      description: `Created pool: ${pool.name}`,
    });
  }

  return { data, error };
}

/**
 * Get pending pool invites for the current user
 */
export function usePoolInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user) {
      setInvites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pool_invites')
        .select(`
          id, status, created_at,
          pools (id, name, emoji, stake_amount, duration_days, category),
          inviter:profiles!pool_invites_invited_by_fkey (id, display_name, avatar_url)
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (err) {
      console.error('Error fetching pool invites:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return { invites, loading, refetch: fetchInvites };
}

export async function acceptPoolInvite(inviteId: string, userId: string) {
  // Try RPC first
  const { error: rpcError } = await supabase.rpc('accept_pool_invite', {
    p_invite_id: inviteId,
    p_user_id: userId,
  });

  if (rpcError) {
    // Fallback: manual accept
    const { data: invite } = await supabase
      .from('pool_invites')
      .select('pool_id')
      .eq('id', inviteId)
      .single();

    if (!invite) return { error: { message: 'Invite not found' } as any };

    await supabase
      .from('pool_invites')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', inviteId);

    return joinPool(invite.pool_id, userId);
  }

  return { error: null };
}

export async function declinePoolInvite(inviteId: string) {
  const { error } = await supabase
    .from('pool_invites')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', inviteId);

  return { error };
}
