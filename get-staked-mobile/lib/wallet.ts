import { Linking, Platform } from 'react-native';
import { supabase, SUPABASE_URL } from '@/lib/supabase';
import * as Crypto from 'expo-crypto';

// ============================================
// Solana Wallet Integration
// ============================================
// Supports deep-linking to Phantom, Solflare, and other Solana wallets.
// For production: Use Phantom Embedded SDK with a custom dev build.
// For Expo Go: Use deep-link connection flow (works with installed wallets).
// ============================================

const APP_SCHEME = 'getstaked';

// Phantom deep link base URLs
const PHANTOM_BROWSE = 'https://phantom.app/ul/browse';
const PHANTOM_CONNECT = 'https://phantom.app/ul/v1/connect';
const PHANTOM_SIGN_MESSAGE = 'https://phantom.app/ul/v1/signMessage';
const PHANTOM_SIGN_TRANSACTION = 'https://phantom.app/ul/v1/signAndSendTransaction';

// Solflare deep link base URLs
const SOLFLARE_CONNECT = 'https://solflare.com/ul/v1/connect';

export type WalletProvider = 'phantom' | 'solflare';

export interface WalletConnection {
  provider: WalletProvider;
  publicKey: string;
  session?: string;
}

/**
 * Check if a wallet app is installed on the device
 */
export async function isWalletInstalled(provider: WalletProvider): Promise<boolean> {
  try {
    if (provider === 'phantom') {
      return await Linking.canOpenURL('phantom://');
    }
    if (provider === 'solflare') {
      return await Linking.canOpenURL('solflare://');
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the app store URL for a wallet
 */
export function getWalletStoreUrl(provider: WalletProvider): string {
  if (provider === 'phantom') {
    return Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977'
      : 'https://play.google.com/store/apps/details?id=app.phantom';
  }
  if (provider === 'solflare') {
    return Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717'
      : 'https://play.google.com/store/apps/details?id=com.solflare.mobile';
  }
  return '';
}

/**
 * Connect to Phantom wallet via deep link
 */
export async function connectPhantom(): Promise<string | null> {
  const params = new URLSearchParams({
    app_url: 'https://getstaked.app',
    dapp_encryption_public_key: await generateDappKeyPair(),
    redirect_link: `${APP_SCHEME}://wallet-callback`,
    cluster: 'mainnet-beta',
  });

  const url = `${PHANTOM_CONNECT}?${params.toString()}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return 'connecting'; // The actual public key comes back via deep link callback
    } else {
      // Phantom not installed, open store
      await Linking.openURL(getWalletStoreUrl('phantom'));
      return null;
    }
  } catch (err) {
    console.error('Phantom connect error:', err);
    return null;
  }
}

/**
 * Connect to Solflare wallet via deep link
 */
export async function connectSolflare(): Promise<string | null> {
  const params = new URLSearchParams({
    app_url: 'https://getstaked.app',
    redirect_link: `${APP_SCHEME}://wallet-callback`,
    cluster: 'mainnet-beta',
  });

  const url = `${SOLFLARE_CONNECT}?${params.toString()}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return 'connecting';
    } else {
      await Linking.openURL(getWalletStoreUrl('solflare'));
      return null;
    }
  } catch (err) {
    console.error('Solflare connect error:', err);
    return null;
  }
}

/**
 * Save wallet connection to Supabase profile
 */
export async function saveWalletToProfile(
  userId: string,
  publicKey: string,
  provider: WalletProvider
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
      description: `Connected ${provider} wallet: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
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
 * Generate a temporary keypair for dapp encryption (Phantom requires this)
 */
async function generateDappKeyPair(): Promise<string> {
  // Generate random bytes for a basic encryption key
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  // Convert to hex string as a simple public key representation
  return Array.from(new Uint8Array(randomBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
