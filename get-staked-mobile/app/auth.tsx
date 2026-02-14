import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { C, Spacing, Radius, Fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
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
          Alert.alert('Success', 'Check your email to confirm your account, then sign in.', [
            { text: 'OK', onPress: () => setIsSignUp(false) },
          ]);
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
        style={a.container}
      >
        {/* Header */}
        <View style={a.header}>
          <Text style={a.logo}>🔥</Text>
          <Text style={a.title}>GET STAKED</Text>
          <Text style={a.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

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
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Pressable onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={[C.brandFire, C.brandGold]}
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
          <Text style={a.walletHint}>
            You can link your Solana wallet after signing in
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  container: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.brandFire,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: C.textSecondary },

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

  btn: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: C.white },

  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  toggleText: { fontSize: 14, color: C.textSecondary },
  toggleLink: { fontSize: 14, fontWeight: '700', color: C.brandFire },

  walletSection: { marginTop: 40, alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.textMuted, marginHorizontal: 12 },
  walletHint: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
});
