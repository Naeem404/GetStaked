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
        query = query.eq('category', category);
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

export async function joinPool(poolId: string, userId: string) {
  const { data, error } = await supabase
    .from('pool_members')
    .insert({ pool_id: poolId, user_id: userId })
    .select()
    .single();

  if (!error) {
    // Update profile stats
    await supabase.rpc('calculate_global_streak', { p_user_id: userId });

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      pool_id: poolId,
      action: 'pool_joined',
      description: 'Joined a stake pool',
    });

    // Update total pools joined
    await supabase
      .from('profiles')
      .update({ total_pools_joined: supabase.rpc as any })
      .eq('id', userId);
  }

  return { data, error };
}

export async function createPool(pool: TablesInsert<'pools'>) {
  const { data, error } = await supabase
    .from('pools')
    .insert(pool)
    .select()
    .single();

  if (data && !error) {
    // Creator auto-joins the pool
    await supabase
      .from('pool_members')
      .insert({ pool_id: data.id, user_id: pool.creator_id });

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
