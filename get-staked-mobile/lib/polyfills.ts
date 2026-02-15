// ============================================
// Crypto & URL polyfills for React Native
// MUST be imported before any other module that uses crypto
// (Phantom SDK, @solana/web3.js, tweetnacl, etc.)
// ============================================

// Provides crypto.getRandomValues() — fixes "no PRNG" error
// from tweetnacl (used by @solana/web3.js and Phantom SDK)
import 'react-native-get-random-values';

// Provides URL/URLSearchParams polyfill for Supabase + fetch
import 'react-native-url-polyfill/auto';

// Provides global Buffer — required by @solana/web3.js
import { Buffer } from 'buffer';
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;
