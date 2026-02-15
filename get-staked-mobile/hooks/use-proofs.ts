import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';
import { useAuth } from '@/lib/auth-context';
import { decode } from 'base64-arraybuffer';

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
  imageUri: string,
  base64Data?: string,
) {
  // 1. Upload image to Supabase Storage
  //    Official Supabase RN pattern: use decode() from base64-arraybuffer
  //    See: https://supabase.com/docs/guides/storage/uploads
  const fileName = `${userId}/${poolId}/${Date.now()}.jpg`;

  let imageUrl = '';
  try {
    let uploadBody: ArrayBuffer;

    if (base64Data) {
      // Best path: camera provided base64 directly → decode to ArrayBuffer
      uploadBody = decode(base64Data);
    } else {
      // Fallback: read file via fetch → arrayBuffer (works in Hermes RN)
      const response = await fetch(imageUri);
      uploadBody = await response.arrayBuffer();
    }

    const { error: uploadError } = await supabase.storage
      .from('proof-images')
      .upload(fileName, uploadBody, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return { data: null, error: { message: 'Storage bucket not configured. Run supabase-migrations.sql in SQL Editor.' } as any };
      }
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('proof-images')
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  } catch (uploadErr: any) {
    console.error('Image upload failed:', uploadErr);
    return { data: null, error: { message: `Image upload failed: ${uploadErr.message}` } as any };
  }

  // 2. Insert proof record
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

  if (error) {
    console.error('Proof insert error:', error);
    return { data: null, error: { message: `Failed to save proof: ${error.message}` } as any };
  }

  if (data) {
    // Log activity (non-blocking)
    supabase.from('activity_log').insert({
      user_id: userId,
      pool_id: poolId,
      action: 'proof_submitted',
      description: 'Submitted photo proof',
    }).then(() => {});

    // Get pool info for verification context
    const { data: poolData } = await supabase
      .from('pools')
      .select('name, proof_description')
      .eq('id', poolId)
      .single();

    // Try AI verification via Edge Function, fall back to auto-approve
    await verifyProof(data.id, imageUrl, poolData, userId, memberId);
  }

  return { data, error: null };
}

/**
 * Call AI verification, with graceful fallback to auto-approve
 */
async function verifyProof(
  proofId: string,
  imageUrl: string,
  poolData: { name: string; proof_description: string } | null,
  userId: string,
  memberId: string,
) {
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
          proof_id: proofId,
          image_url: imageUrl,
          proof_description: poolData?.proof_description || 'Complete the required activity',
          pool_name: poolData?.name || 'Pool',
        }),
      }
    );

    if (!verifyResponse.ok) {
      throw new Error(`Verify endpoint returned ${verifyResponse.status}`);
    }
  } catch (aiErr) {
    console.warn('AI verification unavailable, auto-approving:', aiErr);
    // Fallback: auto-approve via RPC (handles streaks, daily_habits, profile stats)
    try {
      await supabase.rpc('process_proof_verification', {
        p_proof_id: proofId,
        p_status: 'approved',
        p_confidence: 0.75,
        p_reasoning: 'Auto-approved: AI verification service unavailable.',
        p_flags: JSON.stringify([]),
      });
    } catch (rpcErr) {
      console.warn('RPC fallback failed, manually updating:', rpcErr);
      // Ultimate fallback: manually update the critical fields
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('proofs').update({ status: 'approved', verified_at: new Date().toISOString() }).eq('id', proofId);
      await supabase.from('pool_members').update({ last_proof_date: today }).eq('id', memberId);
      await supabase.from('daily_habits').upsert(
        { user_id: userId, habit_date: today, proofs_count: 1 },
        { onConflict: 'user_id,habit_date' }
      );
    }
  }
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
