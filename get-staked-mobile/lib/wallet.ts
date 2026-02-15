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
