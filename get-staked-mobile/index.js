// Custom entry point — polyfills MUST load before expo-router
// This file runs before ANY other module in the app

// 1. Crypto polyfill — fixes "no PRNG" error from tweetnacl/@solana/web3.js
import "react-native-get-random-values";

// 2. Buffer polyfill — required by @solana/web3.js
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;

// 3. URL polyfill — required by Supabase
import "react-native-url-polyfill/auto";

// 4. Now load Expo Router entry (the normal entry point)
import "expo-router/entry";
