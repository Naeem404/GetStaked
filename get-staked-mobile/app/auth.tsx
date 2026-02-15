import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { C, Spacing, Radius, Fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function AuthScreen() {
  const params = useLocalSearchParams();
  const message = params.message as string | undefined;
  const errorParam = params.error as string | undefined;
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName || undefined);
        if (error) {
          Alert.alert('Sign Up Error', error.message);
        } else {
          // Email confirmation is disabled — user is signed in automatically
          router.replace('/(tabs)');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Sign In Error', error.message);
        } else {
          router.replace('/(tabs)');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={a.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={a.flex}
      >
        <ScrollView
          contentContainerStyle={a.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={a.header}>
            <View style={a.logoWrap}>
              <LinearGradient
                colors={[C.primary, '#16A34A']}
                style={a.logoGradient}
              >
                <Ionicons name="flash" size={32} color={C.white} />
              </LinearGradient>
            </View>
            <Text style={a.title}>GET STAKED</Text>
            <Text style={a.subtitle}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
          </View>

          {/* Alerts */}
          {message && (
            <View style={a.successBox}>
              <Ionicons name="checkmark-circle" size={20} color={C.success} />
              <Text style={a.successText}>{message}</Text>
            </View>
          )}

          {errorParam && (
            <View style={a.errorBox}>
              <Ionicons name="alert-circle" size={20} color={C.danger} />
              <Text style={a.errorText}>{errorParam}</Text>
            </View>
          )}

          {/* Info box removed — email confirmation is disabled */}

          {/* Form */}
          <View style={a.form}>
            {isSignUp && (
              <View style={a.inputWrap}>
                <Ionicons name="person-outline" size={18} color={C.textMuted} style={a.inputIcon} />
                <TextInput
                  style={a.input}
                  placeholder="Display Name"
                  placeholderTextColor={C.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={a.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={C.textMuted} style={a.inputIcon} />
              <TextInput
                style={a.input}
                placeholder="Email"
                placeholderTextColor={C.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={a.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} style={a.inputIcon} />
              <TextInput
                style={a.input}
                placeholder="Password"
                placeholderTextColor={C.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={a.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={C.textMuted}
                />
              </Pressable>
            </View>

            <Pressable onPress={handleSubmit} disabled={loading}>
              <LinearGradient
                colors={[C.primary, '#16A34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[a.btn, loading && { opacity: 0.5 }]}
              >
                <Text style={a.btnText}>
                  {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => setIsSignUp(!isSignUp)} style={a.toggleRow}>
              <Text style={a.toggleText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <Text style={a.toggleLink}>
                {isSignUp ? ' Sign In' : ' Sign Up'}
              </Text>
            </Pressable>
          </View>

          {/* Wallet option */}
          <View style={a.walletSection}>
            <View style={a.divider}>
              <View style={a.dividerLine} />
              <Text style={a.dividerText}>or connect later</Text>
              <View style={a.dividerLine} />
            </View>
            <View style={a.walletHintRow}>
              <Ionicons name="wallet-outline" size={16} color={C.textMuted} />
              <Text style={a.walletHint}>
                Link your Solana wallet after signing in
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center', paddingVertical: 40 },

  header: { alignItems: 'center', marginBottom: 32 },
  logoWrap: { marginBottom: 16 },
  logoGradient: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: Fonts.mono,
  },
  subtitle: { fontSize: 16, color: C.textSecondary },

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.primary,
    gap: 8,
  },
  successText: { fontSize: 14, color: C.primary, flex: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.10)',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.danger,
    gap: 8,
  },
  errorText: { fontSize: 14, color: C.danger, flex: 1 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.bgSurface,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoContent: { flex: 1, marginLeft: 8 },
  infoText: { fontSize: 14, color: C.textPrimary, marginBottom: 2 },
  infoSubText: { fontSize: 12, color: C.textMuted },

  form: { gap: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: C.textPrimary,
  },
  eyeBtn: { padding: 8 },

  btn: {
    height: 54,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: C.white },

  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  toggleText: { fontSize: 14, color: C.textSecondary },
  toggleLink: { fontSize: 14, fontWeight: '700', color: C.primary },

  walletSection: { marginTop: 40, alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.textMuted, marginHorizontal: 12 },
  walletHintRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletHint: { fontSize: 13, color: C.textMuted },
});
