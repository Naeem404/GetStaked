import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';

/**
 * Phantom SDK auth callback handler.
 * 
 * When Phantom completes OAuth (Google/Apple), it redirects to:
 *   getstaked://phantom-auth-callback?response_type=success&wallet_id=...&session_id=...
 *
 * The Phantom SDK's PhantomProvider intercepts this automatically
 * and processes the auth result. This route just needs to exist
 * so Expo Router doesn't show "Unmatched Route", and then
 * redirect the user back to the main app.
 */
export default function PhantomAuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    // The Phantom SDK handles the actual auth processing via the PhantomProvider.
    // We just need to redirect the user back to the app after a brief moment.
    const timer = setTimeout(() => {
      if (params.response_type === 'success') {
        // Auth succeeded — go to wallet screen to see connected wallet
        router.replace('/wallet');
      } else {
        // Auth failed or was cancelled — go back
        router.replace('/(tabs)');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={C.primary} />
      <Text style={s.text}>Connecting wallet...</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    color: C.textSecondary,
    fontSize: 16,
  },
});
