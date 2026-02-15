import { supabase, SUPABASE_URL } from '@/lib/supabase';

// ============================================
// Solana Wallet Helpers
// ============================================
// Wallet connection is handled by @phantom/react-native-sdk.
// This file provides Supabase helpers for saving wallet data
// and fetching balances via the wallet-balance Edge Function.
// ============================================

// Phantom Portal App ID — get yours from https://phantom.com/portal/
// 1. Sign up / log in at https://phantom.com/portal/
// 2. Create an app → expand it → click "Set Up"
// 3. Copy the App ID and paste it below
export const PHANTOM_APP_ID = '0937f4f9-56ea-48c0-8697-973210b43b4f';

/**
 * Save wallet connection to Supabase profile.
 * Called after Phantom SDK connects successfully.
 */
export async function saveWalletToProfile(
  userId: string,
  publicKey: string,
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      wallet_address: publicKey,
    })
    .eq('id', userId);

  if (!error) {
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'wallet_connected',
      description: `Connected Phantom wallet: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
    });
  }

  return { error };
}

/**
 * Remove wallet address from Supabase profile
 */
export async function removeWalletFromProfile(
  userId: string,
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('profiles')
    .update({ wallet_address: null })
    .eq('id', userId);

  if (!error) {
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'wallet_disconnected',
      description: 'Disconnected Phantom wallet',
    });
  }

  return { error };
}

/**
 * Get SOL balance for a wallet address using the Supabase Edge Function
 */
export async function getWalletBalance(publicKey: string): Promise<number> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/wallet-balance`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ public_key: publicKey }),
      }
    );

    const data = await response.json();
    return data.balance || 0;
  } catch {
    return 0;
  }
}

/**
 * Extract Solana address from Phantom SDK addresses array
 */
export function getSolanaAddress(
  addresses: { address: string; addressType: string }[]
): string | null {
  const solAddr = addresses.find((a) => a.addressType === 'solana');
  return solAddr?.address ?? null;
}

/**
 * Record a Solana transaction in the database.
 * Called after an on-chain transaction is confirmed.
 */
export async function recordSolTransaction(
  userId: string,
  poolId: string,
  type: 'stake_deposit' | 'stake_refund' | 'winnings_claim' | 'penalty',
  amount: number,
  txSignature: string,
): Promise<{ txId: string | null; error: any }> {
  // Try the RPC function first
  const { data, error } = await supabase.rpc('record_sol_transaction', {
    p_user_id: userId,
    p_pool_id: poolId,
    p_type: type,
    p_amount: amount,
    p_tx_signature: txSignature,
  });

  if (error) {
    // Fallback: direct insert
    const { data: fallback, error: fbError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        pool_id: poolId,
        type: type as any,
        amount,
        tx_signature: txSignature,
        status: 'confirmed',
      })
      .select('id')
      .single();

    return { txId: fallback?.id || null, error: fbError };
  }

  return { txId: data as string | null, error: null };
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, type, amount, tx_signature, status, created_at,
      pools (id, name, emoji)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Check if a user has staked for a specific pool
 */
export async function hasStakedForPool(userId: string, poolId: string): Promise<boolean> {
  const { data } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('pool_id', poolId)
    .eq('type', 'stake_deposit' as any)
    .eq('status', 'confirmed')
    .maybeSingle();

  return !!data;
}
