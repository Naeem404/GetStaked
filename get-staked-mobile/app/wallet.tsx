import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useModal, useAccounts, useSolana, useDisconnect } from '@phantom/react-native-sdk';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { saveWalletToProfile, removeWalletFromProfile, getWalletBalance, getSolanaAddress } from '@/lib/wallet';

export default function WalletScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Phantom SDK hooks
  const modal = useModal();
  const { isConnected, addresses } = useAccounts();
  const { disconnect, isDisconnecting } = useDisconnect();

  // Derive the Solana address from Phantom SDK
  const phantomSolAddress = isConnected ? getSolanaAddress(addresses) : null;
  // Use Phantom SDK address if connected, otherwise fall back to profile
  const walletAddress = phantomSolAddress || profile?.wallet_address;

  // Sync Phantom SDK connection to Supabase profile
  useEffect(() => {
    if (phantomSolAddress && user && phantomSolAddress !== profile?.wallet_address) {
      saveWalletToProfile(user.id, phantomSolAddress).then(() => {
        refreshProfile();
      });
    }
  }, [phantomSolAddress, user]);

  useEffect(() => {
    if (walletAddress) fetchBalance(walletAddress);
  }, [walletAddress]);

  async function fetchBalance(addr: string) {
    if (!addr) return;
    setLoadingBalance(true);
    try {
      const bal = await getWalletBalance(addr);
      setBalance(bal);
    } finally {
      setLoadingBalance(false);
    }
  }

  const handleConnect = useCallback(() => {
    modal.open();
  }, [modal]);

  async function handleDisconnect() {
    if (!user) return;
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnect();
              await removeWalletFromProfile(user.id);
              setBalance(null);
              refreshProfile();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to disconnect');
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </Pressable>
          <Text style={s.title}>Wallet</Text>
        </View>

        {/* Connected Wallet */}
        {walletAddress ? (
          <View style={s.connectedCard}>
            <LinearGradient
              colors={[C.bgSurface, C.bgElevated]}
              style={s.connectedGradient}
            >
              <View style={s.connectedHeader}>
                <Ionicons name="wallet" size={24} color={C.accent} />
                <Text style={s.connectedLabel}>Wallet Connected</Text>
                {isConnected && (
                  <View style={s.phantomBadge}>
                    <Text style={s.phantomBadgeText}>PHANTOM</Text>
                  </View>
                )}
              </View>
              <Text style={s.walletAddress}>
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </Text>
              <View style={s.balanceRow}>
                <Text style={s.balanceLabel}>Balance</Text>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color={C.accent} />
                ) : (
                  <Text style={s.balanceValue}>
                    {balance !== null ? `${balance.toFixed(4)} SOL` : '\u2014'}
                  </Text>
                )}
              </View>
              <View style={s.connectedActions}>
                <Pressable style={s.refreshBtn} onPress={() => fetchBalance(walletAddress)}>
                  <Ionicons name="refresh" size={16} color={C.textSecondary} />
                  <Text style={s.refreshText}>Refresh</Text>
                </Pressable>
                <Pressable style={s.manageBtn} onPress={() => modal.open()}>
                  <Ionicons name="settings-outline" size={16} color={C.textSecondary} />
                  <Text style={s.refreshText}>Manage</Text>
                </Pressable>
                <Pressable
                  style={s.disconnectBtn}
                  onPress={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  <Ionicons name="unlink" size={16} color={C.danger} />
                  <Text style={s.disconnectText}>
                    {isDisconnecting ? '...' : 'Disconnect'}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* Info */}
            <View style={s.infoCard}>
              <Ionicons name="shield-checkmark" size={32} color={C.primary} />
              <Text style={s.infoTitle}>Connect Your Wallet</Text>
              <Text style={s.infoDesc}>
                Link a Solana wallet to stake SOL in pools, earn rewards, and manage your funds securely on-chain.
              </Text>
            </View>

            {/* Phantom Connect Button */}
            <Pressable onPress={handleConnect}>
              <LinearGradient
                colors={['#AB9FF2', '#6C63FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.connectBtn}
              >
                <Text style={s.phantomIcon}>👻</Text>
                <Text style={s.connectText}>Connect with Phantom</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}

        {/* How it works */}
        <Text style={[s.sectionLabel, { marginTop: Spacing.xl }]}>HOW IT WORKS</Text>
        <View style={s.stepsCard}>
          {[
            { step: '1', text: 'Tap "Connect with Phantom" to sign in securely' },
            { step: '2', text: 'Authenticate with Google or Apple via Phantom' },
            { step: '3', text: 'Your Solana wallet is linked automatically' },
            { step: '4', text: 'Stake SOL when joining accountability pools' },
          ].map(item => (
            <View key={item.step} style={s.stepRow}>
              <View style={s.stepBadge}>
                <Text style={s.stepNum}>{item.step}</Text>
              </View>
              <Text style={s.stepText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Coming Soon */}
        <Text style={[s.sectionLabel, { marginTop: Spacing.xl }]}>COMING SOON</Text>
        <View style={s.comingSoon}>
          <View style={s.comingSoonRow}>
            <Text style={s.comingSoonEmoji}>💳</Text>
            <View style={s.comingSoonInfo}>
              <Text style={s.comingSoonTitle}>Card Payments via Stripe</Text>
              <Text style={s.comingSoonSubDesc}>Pay with credit/debit card</Text>
            </View>
          </View>
          <View style={s.comingSoonRow}>
            <Text style={s.comingSoonEmoji}>🍎</Text>
            <View style={s.comingSoonInfo}>
              <Text style={s.comingSoonTitle}>Apple Pay / Google Pay</Text>
              <Text style={s.comingSoonSubDesc}>Native mobile payments</Text>
            </View>
          </View>
          <View style={[s.comingSoonRow, { borderBottomWidth: 0 }]}>
            <Text style={s.comingSoonEmoji}>🪙</Text>
            <View style={s.comingSoonInfo}>
              <Text style={s.comingSoonTitle}>USDC Stablecoin</Text>
              <Text style={s.comingSoonSubDesc}>Stake with stable value</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary, paddingHorizontal: Spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: Spacing.md, marginBottom: Spacing.xl,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary },

  connectedCard: { marginBottom: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden' },
  connectedGradient: { padding: Spacing.xl, borderRadius: Radius.xl },
  connectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  connectedLabel: { fontSize: 14, fontWeight: '600', color: C.success },
  phantomBadge: {
    backgroundColor: 'rgba(171,159,242,0.15)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, marginLeft: 'auto',
  },
  phantomBadgeText: { fontSize: 10, fontWeight: '700', color: '#AB9FF2' },
  walletAddress: {
    fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: C.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: Radius.md,
    marginBottom: 16, overflow: 'hidden',
  },
  balanceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceLabel: { fontSize: 14, color: C.textMuted },
  balanceValue: { fontSize: 24, fontWeight: '800', color: C.accent },
  connectedActions: { flexDirection: 'row', gap: 12 },
  refreshBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border,
  },
  refreshText: { fontSize: 12, color: C.textSecondary, fontWeight: '600' },
  manageBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: 'rgba(171,159,242,0.08)', borderWidth: 1, borderColor: 'rgba(171,159,242,0.3)',
  },
  disconnectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: C.dangerDim, borderWidth: 1, borderColor: C.dangerDim,
  },
  disconnectText: { fontSize: 12, color: C.danger, fontWeight: '600' },

  infoCard: {
    alignItems: 'center', padding: Spacing.xl, backgroundColor: C.bgSurface,
    borderRadius: Radius.xl, borderWidth: 1, borderColor: C.border, marginBottom: Spacing.xl,
    gap: 12,
  },
  infoTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  infoDesc: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, marginBottom: Spacing.sm,
  },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: Radius.md, marginBottom: Spacing.lg,
  },
  connectText: { fontSize: 16, fontWeight: '700', color: C.white },
  phantomIcon: { fontSize: 22 },

  stepsCard: {
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border, padding: Spacing.md, gap: 14,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.bgElevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  stepNum: { fontSize: 13, fontWeight: '700', color: C.brandFire },
  stepText: { flex: 1, fontSize: 14, color: C.textSecondary },

  comingSoon: {
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 40,
  },
  comingSoonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  comingSoonEmoji: { fontSize: 24 },
  comingSoonInfo: { flex: 1 },
  comingSoonTitle: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  comingSoonSubDesc: { fontSize: 12, color: C.textMuted },
});
