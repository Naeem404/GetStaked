import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export interface FriendProfile {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  current_streak: number | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend: FriendProfile;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Accepted friends where I'm the requester
      const { data: sent } = await supabase
        .from('friendships')
        .select(`
          id, requester_id, addressee_id, status, created_at,
          addressee:profiles!friendships_addressee_id_fkey (id, display_name, username, avatar_url, wallet_address, current_streak)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      // Accepted friends where I'm the addressee
      const { data: received } = await supabase
        .from('friendships')
        .select(`
          id, requester_id, addressee_id, status, created_at,
          requester:profiles!friendships_requester_id_fkey (id, display_name, username, avatar_url, wallet_address, current_streak)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'accepted');

      const allFriends: Friendship[] = [
        ...(sent || []).map((f: any) => ({ ...f, friend: f.addressee })),
        ...(received || []).map((f: any) => ({ ...f, friend: f.requester })),
      ];
      setFriends(allFriends);

      // Pending requests TO me
      const { data: pending } = await supabase
        .from('friendships')
        .select(`
          id, requester_id, addressee_id, status, created_at,
          requester:profiles!friendships_requester_id_fkey (id, display_name, username, avatar_url, wallet_address, current_streak)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      setPendingRequests(
        (pending || []).map((f: any) => ({ ...f, friend: f.requester }))
      );
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return { friends, pendingRequests, loading, refetch: fetchFriends };
}

export function useSearchProfiles() {
  const [results, setResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2 || !user) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, wallet_address, current_streak')
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, [user]);

  return { results, searching, search };
}

export async function sendFriendRequest(requesterId: string, addresseeId: string) {
  // Check if friendship already exists in either direction
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') return { error: { message: 'Already friends' } };
    if (existing.status === 'pending') return { error: { message: 'Request already pending' } };
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId })
    .select()
    .single();

  return { data, error };
}

export async function acceptFriendRequest(friendshipId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .select()
    .single();

  return { data, error };
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  return { error };
}

/**
 * Send pool invites to multiple friends
 */
export async function sendPoolInvites(
  poolId: string,
  invitedBy: string,
  friendIds: string[],
) {
  const invites = friendIds.map(friendId => ({
    pool_id: poolId,
    invited_by: invitedBy,
    invited_user_id: friendId,
  }));

  const { data, error } = await supabase
    .from('pool_invites')
    .insert(invites)
    .select();

  if (!error) {
    // Log activity
    await supabase.from('activity_log').insert({
      user_id: invitedBy,
      pool_id: poolId,
      action: 'pool_invites_sent',
      description: `Invited ${friendIds.length} friend(s) to pool`,
    });
  }

  return { data, error };
}

/**
 * Get friend IDs (useful for pool invite selection)
 */
export function useFriendIds() {
  const { user } = useAuth();
  const [friendIds, setFriendIds] = useState<string[]>([]);

  const fetchIds = useCallback(async () => {
    if (!user) return;

    const { data: sent } = await supabase
      .from('friendships')
      .select('addressee_id')
      .eq('requester_id', user.id)
      .eq('status', 'accepted');

    const { data: received } = await supabase
      .from('friendships')
      .select('requester_id')
      .eq('addressee_id', user.id)
      .eq('status', 'accepted');

    const ids = [
      ...(sent || []).map((f: any) => f.addressee_id),
      ...(received || []).map((f: any) => f.requester_id),
    ];
    setFriendIds(ids);
  }, [user]);

  useEffect(() => {
    fetchIds();
  }, [fetchIds]);

  return friendIds;
}
