import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';
import { useAuth } from '@/lib/auth-context';
import { decode } from 'base64-arraybuffer';

type Proof = Tables<'proofs'>;

export interface VerificationResult {
  status: 'approved' | 'rejected' | 'needs_review' | 'unknown';
  confidence: number;
  reasoning: string;
  flags: string[];
  needs_friend_review?: boolean;
}

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

      // Also fetch today's submitted proofs to double-check
      const { data: todaysProofs } = await supabase
        .from('proofs')
        .select('pool_id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const submittedPoolIds = new Set((todaysProofs || []).map(p => p.pool_id));

      const pending: PendingProof[] = [];

      for (const membership of memberships || []) {
        const pool = (membership as any).pools;
        // Only active pools need daily proofs (not waiting/completed/failed)
        if (!pool || pool.status !== 'active') continue;

        // Check if proof already submitted today (check both last_proof_date AND proofs table)
        const lastProofDate = membership.last_proof_date
          ? String(membership.last_proof_date).split('T')[0]
          : null;
        if (lastProofDate === today || submittedPoolIds.has(membership.pool_id)) continue;

        // Calculate urgency based on time until midnight (daily proof deadline)
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const hoursUntilMidnight = (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);

        let deadline = '';
        if (hoursUntilMidnight < 1) deadline = `${Math.max(0, Math.round(hoursUntilMidnight * 60))}m left today`;
        else deadline = `${Math.round(hoursUntilMidnight)}h left today`;

        pending.push({
          pool_id: membership.pool_id,
          member_id: membership.id,
          pool_name: pool.name,
          pool_emoji: pool.emoji || '🎯',
          proof_description: pool.proof_description,
          deadline,
          urgent: hoursUntilMidnight < 6,
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
    const verification = await verifyProof(data.id, imageUrl, poolData, userId, memberId, poolId);
    return { data, error: null, verification };
  }

  return { data, error: null, verification: null };
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
  poolId: string,
): Promise<VerificationResult> {
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
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          proof_id: proofId,
          image_url: imageUrl,
          proof_description: poolData?.proof_description || 'Complete the required activity',
          pool_name: poolData?.name || 'Pool',
          pool_id: poolId,
          user_id: userId,
        }),
      }
    );

    if (!verifyResponse.ok) {
      throw new Error(`Verify endpoint returned ${verifyResponse.status}`);
    }

    const result = await verifyResponse.json();
    return {
      status: result.status || 'approved',
      confidence: result.confidence ?? 0.75,
      reasoning: result.reasoning || 'Verification complete.',
      flags: result.flags || [],
      needs_friend_review: result.needs_friend_review || false,
    };
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
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      await supabase.from('proofs').update({ status: 'approved', verified_at: new Date().toISOString() }).eq('id', proofId);

      // Get current member state to determine streak continuity
      const { data: curMember } = await supabase.from('pool_members').select('current_streak, best_streak, days_completed, last_proof_date').eq('id', memberId).single();
      const lastDate = curMember?.last_proof_date ? String(curMember.last_proof_date).split('T')[0] : null;
      let newPoolStreak: number;
      if (lastDate === today) {
        // Already submitted today — don't double-count
        newPoolStreak = curMember?.current_streak ?? 1;
      } else if (lastDate === yesterday) {
        // Yesterday → continue streak
        newPoolStreak = (curMember?.current_streak ?? 0) + 1;
      } else {
        // Gap or first proof → reset to 1
        newPoolStreak = 1;
      }
      await supabase.from('pool_members').update({
        last_proof_date: today,
        days_completed: (curMember?.days_completed ?? 0) + (lastDate === today ? 0 : 1),
        current_streak: newPoolStreak,
        best_streak: Math.max(curMember?.best_streak ?? 0, newPoolStreak),
      }).eq('id', memberId);

      await supabase.from('daily_habits').upsert(
        { user_id: userId, habit_date: today, proofs_count: 1 },
        { onConflict: 'user_id,habit_date' }
      );
      // Update profile streak — use max streak across all active pools
      const { data: memberData } = await supabase.from('pool_members').select('current_streak').eq('user_id', userId).eq('status', 'active').order('current_streak', { ascending: false }).limit(1).single();
      const globalStreak = memberData?.current_streak ?? 1;
      const { data: profData } = await supabase.from('profiles').select('current_streak, best_streak').eq('id', userId).single();
      await supabase.from('profiles').update({
        current_streak: globalStreak,
        best_streak: Math.max(globalStreak, profData?.best_streak ?? 0),
        total_proofs_submitted: ((profData as any)?.total_proofs_submitted ?? 0) + 1,
      }).eq('id', userId);
    }
    return {
      status: 'approved' as const,
      confidence: 0.75,
      reasoning: 'Auto-approved: AI verification service unavailable.',
      flags: [],
    };
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
