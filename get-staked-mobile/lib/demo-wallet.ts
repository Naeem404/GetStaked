import { supabase } from '@/lib/supabase';

// ============================================
// Demo Wallet — Fake Currency System
// ============================================
// Uses Supabase profiles.sol_balance as the source of truth.
// No real blockchain, no Phantom wallet needed.
// Every new user starts with DEFAULT_BALANCE demo SOL.
// ============================================

const DEFAULT_BALANCE = 10.0; // Free demo SOL on first load

/**
 * Get the user's demo SOL balance from Supabase.
 * If the user has never had a balance set, initialize to DEFAULT_BALANCE.
 */
export async function getDemoBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('sol_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getDemoBalance error:', error);
    return 0;
  }

  // First-time user: initialize balance
  if (data.sol_balance === null || data.sol_balance === undefined) {
    await supabase
      .from('profiles')
      .update({ sol_balance: DEFAULT_BALANCE })
      .eq('id', userId);
    return DEFAULT_BALANCE;
  }

  return data.sol_balance;
}

/**
 * Deduct demo SOL for a pool stake.
 * Returns { success, newBalance, txId } or { success: false, error }.
 */
export async function stakeDemo(
  userId: string,
  poolId: string,
  amount: number,
): Promise<{ success: boolean; newBalance?: number; txId?: string; error?: string }> {
  // Get current balance
  const balance = await getDemoBalance(userId);

  if (balance < amount) {
    return {
      success: false,
      error: `Insufficient balance. You have ${balance.toFixed(2)} demo SOL but need ${amount.toFixed(2)}.`,
    };
  }

  const newBalance = Math.round((balance - amount) * 1e6) / 1e6;
  const fakeTxSig = `demo_tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Deduct balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      sol_balance: newBalance,
      total_sol_staked: (await getProfileField(userId, 'total_sol_staked') ?? 0) + amount,
    })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: `Balance update failed: ${updateError.message}` };
  }

  // Record transaction
  await supabase.from('transactions').insert({
    user_id: userId,
    pool_id: poolId,
    type: 'stake_deposit' as any,
    amount,
    tx_signature: fakeTxSig,
    status: 'confirmed',
  }).then(() => {});

  return { success: true, newBalance, txId: fakeTxSig };
}

/**
 * Credit demo SOL (winnings, refund, or airdrop).
 */
export async function creditDemo(
  userId: string,
  amount: number,
  reason: 'airdrop' | 'winnings' | 'refund',
  poolId?: string,
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const balance = await getDemoBalance(userId);
  const newBalance = Math.round((balance + amount) * 1e6) / 1e6;

  const updates: any = { sol_balance: newBalance };
  if (reason === 'winnings') {
    updates.total_sol_earned = (await getProfileField(userId, 'total_sol_earned') ?? 0) + amount;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Record transaction for winnings/refund
  if (reason !== 'airdrop') {
    const txType = reason === 'winnings' ? 'winnings_claim' : 'stake_refund';
    await supabase.from('transactions').insert({
      user_id: userId,
      pool_id: poolId || null,
      type: txType as any,
      amount,
      tx_signature: `demo_${reason}_${Date.now()}`,
      status: 'confirmed',
    }).then(() => {});
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: userId,
    action: reason === 'airdrop' ? 'demo_airdrop' : `demo_${reason}`,
    description: `${reason === 'airdrop' ? 'Received' : 'Earned'} ${amount} demo SOL`,
  }).then(() => {});

  return { success: true, newBalance };
}

/**
 * Request a free demo airdrop (5 SOL).
 */
export async function requestDemoAirdrop(
  userId: string,
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  return creditDemo(userId, 5.0, 'airdrop');
}

// Helper to read a single profile field
async function getProfileField(userId: string, field: string): Promise<number | null> {
  const { data } = await supabase
    .from('profiles')
    .select(field)
    .eq('id', userId)
    .single();
  return data ? (data as any)[field] : null;
}
