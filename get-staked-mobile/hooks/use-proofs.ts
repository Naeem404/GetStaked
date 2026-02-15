import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';
import { useAuth } from '@/lib/auth-context';

type Proof = Tables<'proofs'>;

export interface PendingProof {
  pool_id: string;
  member_id: string;
  pool_name: string;
  pool_emoji: string;
  proof_description: string;
  deadline: string;
  urgent: boolean;
  ends_at: string | null;
}

export function usePendingProofs() {
  const { user } = useAuth();
  const [pendingProofs, setPendingProofs] = useState<PendingProof[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingProofs = useCallback(async () => {
    if (!user) {
      setPendingProofs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get active pool memberships
      const { data: memberships, error: memError } = await supabase
        .from('pool_members')
        .select(`
          id,
          pool_id,
          last_proof_date,
          pools (id, name, emoji, proof_description, ends_at, frequency, status)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memError) throw memError;

      const pending: PendingProof[] = [];

      for (const membership of memberships || []) {
        const pool = (membership as any).pools;
        if (!pool || pool.status !== 'active') continue;

        // Check if proof already submitted today
        if (membership.last_proof_date === today) continue;

        // Calculate urgency
        const endsAt = pool.ends_at ? new Date(pool.ends_at) : null;
        const now = new Date();
        const hoursLeft = endsAt ? (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60) : 24;

        let deadline = '';
        if (hoursLeft < 1) deadline = `${Math.max(0, Math.round(hoursLeft * 60))}m left`;
        else if (hoursLeft < 24) deadline = `${Math.round(hoursLeft)}h left`;
        else deadline = `${Math.round(hoursLeft / 24)}d left`;

        pending.push({
          pool_id: membership.pool_id,
          member_id: membership.id,
          pool_name: pool.name,
          pool_emoji: pool.emoji || '🎯',
          proof_description: pool.proof_description,
          deadline,
          urgent: hoursLeft < 6,
          ends_at: pool.ends_at,
        });
      }

      // Sort by urgency
      pending.sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1));
      setPendingProofs(pending);
    } catch (err) {
      console.error('Error fetching pending proofs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingProofs();
  }, [fetchPendingProofs]);

  return { pendingProofs, loading, refetch: fetchPendingProofs };
}

export async function submitProof(
  poolId: string,
  userId: string,
  memberId: string,
  imageUri: string
) {
  // 1. Upload image to Supabase Storage
  const fileName = `${userId}/${poolId}/${Date.now()}.jpg`;
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('proof-images')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) return { data: null, error: uploadError };

  // 2. Get public URL
  const { data: urlData } = supabase.storage
    .from('proof-images')
    .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;

  // 3. Insert proof record
  const { data, error } = await supabase
    .from('proofs')
    .insert({
      pool_id: poolId,
      user_id: userId,
      member_id: memberId,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (!error && data) {
    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      pool_id: poolId,
      action: 'proof_submitted',
      description: 'Submitted photo proof',
    });

    // Get pool info for verification context
    const { data: poolData } = await supabase
      .from('pools')
      .select('name, proof_description')
      .eq('id', poolId)
      .single();

    // Call Gemini AI verification Edge Function
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const verifyResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/verify-proof`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            proof_id: data.id,
            image_url: imageUrl,
            proof_description: poolData?.proof_description || 'Complete the required activity',
            pool_name: poolData?.name || 'Pool',
          }),
        }
      );

      if (!verifyResponse.ok) {
        throw new Error(`Verify endpoint returned ${verifyResponse.status}`);
      }

      const verifyResult = await verifyResponse.json();
      (data as any).ai_result = verifyResult;
    } catch (aiErr) {
      console.warn('AI verification unavailable, auto-approving:', aiErr);
      // Fallback: auto-approve via RPC which handles all side effects
      // (updates pool_members streak, daily_habits, profile stats)
      try {
        await supabase.rpc('process_proof_verification', {
          p_proof_id: data.id,
          p_status: 'approved',
          p_confidence: 0.75,
          p_reasoning: 'Auto-approved: AI verification service unavailable.',
          p_flags: JSON.stringify([]),
        });
      } catch (rpcErr) {
        console.warn('RPC fallback also failed:', rpcErr);
      }
    }
  }

  return { data, error };
}

export function useRecentActivity(limit: number = 10) {
  const { user } = useAuth();
  const [activity, setActivity] = useState<Tables<'activity_log'>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!user) {
      setActivity([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivity(data || []);
    } catch (err) {
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, loading, refetch: fetchActivity };
}
