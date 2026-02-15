import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  Alert, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

const PERSONAS = [
  { key: 'drill_sergeant', icon: '⭐', label: 'Drill Sergeant', desc: 'Tough love & accountability' },
  { key: 'hype_beast', icon: '⚡', label: 'Hype Beast', desc: 'Hype & encouragement' },
  { key: 'gentle_guide', icon: '🌿', label: 'Gentle Guide', desc: 'Calm & supportive' },
];

export default function SettingsScreen() {
  const { user, profile, updateProfile, signOut } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState((profile as any)?.username || '');
  const [coachPersona, setCoachPersona] = useState(
    (profile as any)?.coach_persona || 'drill_sergeant'
  );
  const [voiceEnabled, setVoiceEnabled] = useState(
    (profile as any)?.coach_voice_enabled !== false
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }
    setSaving(true);
    try {
      const updates: any = {
        display_name: displayName.trim(),
        coach_persona: coachPersona,
        coach_voice_enabled: voiceEnabled,
      };
      if (username.trim()) {
        updates.username = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
      const { error } = await updateProfile(updates);
      if (error) throw error;
      Alert.alert('Saved', 'Your settings have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </Pressable>
          <Text style={s.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <Text style={s.sectionLabel}>PROFILE</Text>
        <View style={s.card}>
          {/* Avatar */}
          <View style={s.avatarRow}>
            <LinearGradient colors={[C.primary, '#4ADE80']} style={s.avatar}>
              <Text style={s.avatarText}>
                {displayName?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <View style={s.avatarInfo}>
              <Text style={s.avatarName}>{displayName || 'Set your name'}</Text>
              <Text style={s.avatarEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Display Name */}
          <Text style={s.inputLabel}>Display Name</Text>
          <TextInput
            style={s.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
            placeholderTextColor={C.textMuted}
            maxLength={30}
          />

          {/* Username */}
          <Text style={s.inputLabel}>Username</Text>
          <View style={s.usernameRow}>
            <Text style={s.atSign}>@</Text>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              maxLength={20}
            />
          </View>
        </View>

        {/* Wallet Section */}
        <Text style={s.sectionLabel}>WALLET</Text>
        <Pressable style={s.menuItem} onPress={() => router.push('/wallet')}>
          <Ionicons name="wallet-outline" size={20} color={C.accent} />
          <View style={s.menuItemInfo}>
            <Text style={s.menuItemTitle}>Phantom Wallet</Text>
            <Text style={s.menuItemSub}>
              {profile?.wallet_address
                ? `${profile.wallet_address.slice(0, 6)}...${profile.wallet_address.slice(-4)}`
                : 'Not connected'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
        </Pressable>

        {/* Coach Section */}
        <Text style={s.sectionLabel}>AI COACH</Text>
        <View style={s.card}>
          <Text style={s.inputLabel}>Coach Persona</Text>
          {PERSONAS.map((p) => (
            <Pressable
              key={p.key}
              style={[s.personaRow, coachPersona === p.key && s.personaRowActive]}
              onPress={() => setCoachPersona(p.key)}
            >
              <Text style={s.personaIcon}>{p.icon}</Text>
              <View style={s.personaInfo}>
                <Text style={s.personaLabel}>{p.label}</Text>
                <Text style={s.personaDesc}>{p.desc}</Text>
              </View>
              {coachPersona === p.key && (
                <Ionicons name="checkmark-circle" size={22} color={C.primary} />
              )}
            </Pressable>
          ))}

          {/* Voice Toggle */}
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Ionicons name="volume-high-outline" size={20} color={C.textSecondary} />
              <View>
                <Text style={s.toggleTitle}>Voice Messages</Text>
                <Text style={s.toggleSub}>AI coach speaks with ElevenLabs TTS</Text>
              </View>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: C.bgSurface, true: C.primaryDim }}
              thumbColor={voiceEnabled ? C.primary : C.textMuted}
            />
          </View>
        </View>

        {/* Navigation Links */}
        <Text style={s.sectionLabel}>SOCIAL</Text>
        <Pressable style={s.menuItem} onPress={() => router.push('/friends')}>
          <Ionicons name="people-outline" size={20} color={C.primary} />
          <View style={s.menuItemInfo}>
            <Text style={s.menuItemTitle}>Friends</Text>
            <Text style={s.menuItemSub}>Manage friends & requests</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
        </Pressable>

        {/* Save Button */}
        <Pressable style={s.saveBtn} onPress={handleSave} disabled={saving}>
          <LinearGradient
            colors={[C.primary, '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.saveGrad}
          >
            {saving ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <Text style={s.saveText}>Save Changes</Text>
            )}
          </LinearGradient>
        </Pressable>

        {/* Sign Out */}
        <Pressable style={s.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={C.danger} />
          <Text style={s.signOutText}>Sign Out</Text>
        </Pressable>

        {/* App Info */}
        <View style={s.appInfo}>
          <Text style={s.appInfoText}>GetStaked v1.0.0</Text>
          <Text style={s.appInfoText}>Built on Solana · AI-verified proofs</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: Spacing.md, marginBottom: Spacing.xl,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.xl,
  },
  card: {
    backgroundColor: C.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: C.border,
  },

  avatarRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.lg,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: C.white },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  avatarEmail: { fontSize: 13, color: C.textMuted, marginTop: 2 },

  inputLabel: {
    fontSize: 12, fontWeight: '600', color: C.textMuted,
    marginBottom: 6, marginTop: Spacing.md,
  },
  input: {
    backgroundColor: C.bgElevated, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border,
    padding: 14, fontSize: 15, color: C.textPrimary,
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  atSign: {
    fontSize: 15, color: C.textMuted, fontWeight: '600',
    backgroundColor: C.bgElevated, paddingVertical: 14, paddingLeft: 14,
    borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md,
    borderWidth: 1, borderRightWidth: 0, borderColor: C.border,
  },

  personaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderRadius: Radius.md,
    backgroundColor: C.bgElevated, marginTop: 8,
    borderWidth: 1, borderColor: C.border,
  },
  personaRowActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  personaIcon: { fontSize: 24 },
  personaInfo: { flex: 1 },
  personaLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  personaDesc: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  toggleSub: { fontSize: 12, color: C.textMuted, marginTop: 1 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    padding: Spacing.lg, borderWidth: 1, borderColor: C.border,
    marginBottom: 8,
  },
  menuItemInfo: { flex: 1 },
  menuItemTitle: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  menuItemSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  saveBtn: { marginTop: Spacing.xxl },
  saveGrad: {
    paddingVertical: 16, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  saveText: { fontSize: 16, fontWeight: '700', color: C.white },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, marginTop: Spacing.lg,
    backgroundColor: C.dangerDim, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: C.danger },

  appInfo: { alignItems: 'center', marginTop: Spacing.xl, gap: 4, marginBottom: 20 },
  appInfoText: { fontSize: 12, color: C.textMuted },
});
