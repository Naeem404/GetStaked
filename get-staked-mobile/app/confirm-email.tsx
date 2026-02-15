import { useEffect } from 'react';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { C, Spacing } from '@/constants/theme';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token: params.token as string,
          type: 'signup',
          email: params.email as string,
        });

        if (error) {
          console.error('Email confirmation error:', error);
          router.replace('/auth?error=Email confirmation failed. Please try again.');
        } else {
          router.replace('/auth?message=Email confirmed! You can now sign in.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        router.replace('/auth?error=Something went wrong. Please try again.');
      }
    };

    if (params.token) {
      confirmEmail();
    } else {
      router.replace('/auth?error=Invalid confirmation link.');
    }
  }, [params.token, router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.text}>Confirming your email...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bgPrimary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  text: {
    fontSize: 16,
    color: C.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
