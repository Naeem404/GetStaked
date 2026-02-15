import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// ============================================
// Solana Staking Configuration
// ============================================

// Treasury wallet — all pool stakes get sent here.
// Replace with your actual treasury/escrow wallet public key.
export const TREASURY_WALLET = new PublicKey(
  '4CC2ZMxs77zmT5g9L8bbjJiqKPqHm1oVgtifrKmfbhTy'
);

// Solana RPC endpoint
// Use devnet for testing, mainnet-beta for production
export const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

/**
 * Build a SOL transfer transaction for pool staking.
 *
 * Usage with Phantom SDK (from official docs):
 *   const { solana } = useSolana();
 *   const fromAddress = await solana.getPublicKey();
 *   const { transaction } = await buildStakeTransaction(fromAddress, 0.1);
 *   const result = await solana.signAndSendTransaction(transaction);
 *   // result.hash is the tx signature
 */
export async function buildStakeTransaction(
  fromAddress: string,
  solAmount: number,
): Promise<{ transaction: Transaction; connection: Connection }> {
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const fromPubkey = new PublicKey(fromAddress);
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);

  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  }).add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: TREASURY_WALLET,
      lamports,
    })
  );

  return { transaction, connection };
}

/**
 * Request free devnet SOL via Solana's built-in airdrop.
 * Works only on devnet — no reCAPTCHA or external faucet needed.
 * Max 2 SOL per request (devnet limit).
 */
export async function requestDevnetAirdrop(
  walletAddress: string,
  solAmount: number = 1,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const pubkey = new PublicKey(walletAddress);
    const lamports = Math.round(Math.min(solAmount, 2) * LAMPORTS_PER_SOL);

    const signature = await connection.requestAirdrop(pubkey, lamports);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    return { success: true, signature };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Airdrop failed — devnet may be rate-limited. Try again in a minute.',
    };
  }
}
