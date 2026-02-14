import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Linking, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import {
  connectPhantom, connectSolflare, isWalletInstalled,
  saveWalletToProfile, getWalletBalance, getWalletStoreUrl,
  WalletProvider,
} from '@/lib/wallet';

const WALLETS: { key: WalletProvider; name: string; icon: string; color: string; description: string }[] = [
  {
    key: 'phantom',
    name: 'Phantom',
    icon: '👻',
    color: '#AB9FF2',
    description: 'Most popular Solana wallet',
  },
  {
    key: 'solflare',
    name: 'Solflare',
    icon: '🔆',
    color: '#FC7227',
    description: 'Feature-rich Solana wallet',
  },
];

export default function WalletScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [connecting, setConnecting] = useState<WalletProvider | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  const walletAddress = profile?.wallet_address;

  useEffect(() => {
    checkInstalledWallets();
    if (walletAddress) fetchBalance();
  }, [walletAddress]);

  async function checkInstalledWallets() {
    const phantomInstalled = await isWalletInstalled('phantom');
    const solflareInstalled = await isWalletInstalled('solflare');
    setInstalled({ phantom: phantomInstalled, solflare: solflareInstalled });
  }

  async function fetchBalance() {
    if (!walletAddress) return;
    setLoadingBalance(true);
    try {
      const bal = await getWalletBalance(walletAddress);
      setBalance(bal);
    } finally {
      setLoadingBalance(false);
    }
  }

  async function handleConnect(provider: WalletProvider) {
    if (!user) return;
    setConnecting(provider);

    try {
      let result: string | null = null;
      if (provider === 'phantom') {
        result = await connectPhantom();
      } else if (provider === 'solflare') {
        result = await connectSolflare();
      }

      if (result === 'connecting') {
        // The wallet app was opened. The actual connection will come back via deep link.
        // For now, show a manual input option as fallback
        Alert.alert(
          'Wallet Opened',
          'After approving the connection in your wallet app, return here. If automatic connection doesn\'t work, you can paste your wallet address manually.',
          [
            { text: 'Paste Address', onPress: () => promptManualAddress(provider) },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else if (result === null) {
        // Wallet not installed
        Alert.alert(
          `${provider === 'phantom' ? 'Phantom' : 'Solflare'} Not Found`,
          'Would you like to install it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Install', onPress: () => Linking.openURL(getWalletStoreUrl(provider)) },
          ]
        );
      }
    } finally {
      setConnecting(null);
    }
  }

  function promptManualAddress(provider: WalletProvider) {
    // Alert.prompt is iOS-only; on Android show a simple alert
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(
        'Enter Wallet Address',
        'Paste your Solana wallet address',
        async (address: string) => {
          if (address && address.length >= 32 && user) {
            const { error } = await saveWalletToProfile(user.id, address.trim(), provider);
            if (error) {
              Alert.alert('Error', 'Failed to save wallet address');
            } else {
              Alert.alert('Connected!', `Wallet ${address.slice(0, 6)}...${address.slice(-4)} linked.`);
              refreshProfile?.();
            }
          } else {
            Alert.alert('Invalid', 'Please enter a valid Solana wallet address');
          }
        },
        'plain-text'
      );
    } else {
      Alert.alert(
        'Enter Address',
        'Please copy your Solana wallet address and use the manual entry below.',
      );
    }
  }

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
            await saveWalletToProfile(user.id, '', 'phantom');
            setBalance(null);
            refreshProfile?.();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
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
              <Text style={s.connectedLabel}>Connected</Text>
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
                  {balance !== null ? `${balance.toFixed(4)} SOL` : '—'}
                </Text>
              )}
            </View>
            <View style={s.connectedActions}>
              <Pressable style={s.refreshBtn} onPress={fetchBalance}>
                <Ionicons name="refresh" size={16} color={C.textSecondary} />
                <Text style={s.refreshText}>Refresh</Text>
              </Pressable>
              <Pressable style={s.disconnectBtn} onPress={handleDisconnect}>
                <Ionicons name="unlink" size={16} color={C.danger} />
                <Text style={s.disconnectText}>Disconnect</Text>
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

          {/* Wallet Options */}
          <Text style={s.sectionLabel}>CHOOSE WALLET</Text>
          {WALLETS.map(w => (
            <Pressable
              key={w.key}
              style={s.walletOption}
              onPress={() => handleConnect(w.key)}
              disabled={connecting !== null}
            >
              <Text style={s.walletIcon}>{w.icon}</Text>
              <View style={s.walletInfo}>
                <Text style={s.walletName}>{w.name}</Text>
                <Text style={s.walletDesc}>
                  {installed[w.key] ? w.description : `Install ${w.name} to connect`}
                </Text>
              </View>
              {connecting === w.key ? (
                <ActivityIndicator size="small" color={w.color} />
              ) : (
                <Ionicons
                  name={installed[w.key] ? 'arrow-forward' : 'download-outline'}
                  size={20}
                  color={w.color}
                />
              )}
            </Pressable>
          ))}

          {/* Alternative Payment Methods Info */}
          <Text style={[s.sectionLabel, { marginTop: Spacing.xl }]}>COMING SOON</Text>
          <View style={s.comingSoon}>
            <View style={s.comingSoonRow}>
              <Text style={s.comingSoonIcon}>💳</Text>
              <View style={s.comingSoonInfo}>
                <Text style={s.comingSoonTitle}>Card Payments via Stripe</Text>
                <Text style={s.comingSoonDesc}>Pay with credit/debit card</Text>
              </View>
            </View>
            <View style={s.comingSoonRow}>
              <Text style={s.comingSoonIcon}>🍎</Text>
              <View style={s.comingSoonInfo}>
                <Text style={s.comingSoonTitle}>Apple Pay / Google Pay</Text>
                <Text style={s.comingSoonDesc}>Native mobile payments</Text>
              </View>
            </View>
            <View style={s.comingSoonRow}>
              <Text style={s.comingSoonIcon}>🪙</Text>
              <View style={s.comingSoonInfo}>
                <Text style={s.comingSoonTitle}>USDC Stablecoin</Text>
                <Text style={s.comingSoonDesc}>Stake with stable value</Text>
              </View>
            </View>
          </View>
        </>
      )}
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
  walletAddress: {
    fontSize: 16, fontFamily: 'monospace', color: C.textPrimary,
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
  refreshText: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  disconnectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: C.dangerDim, borderWidth: 1, borderColor: C.dangerDim,
  },
  disconnectText: { fontSize: 13, color: C.danger, fontWeight: '600' },

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
  walletOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: Spacing.md, backgroundColor: C.bgSurface, borderRadius: Radius.md,
    marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  walletIcon: { fontSize: 28 },
  walletInfo: { flex: 1 },
  walletName: { fontSize: 16, fontWeight: '600', color: C.textPrimary },
  walletDesc: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  comingSoon: {
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  comingSoonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  comingSoonIcon: { fontSize: 24 },
  comingSoonInfo: { flex: 1 },
  comingSoonTitle: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  comingSoonDesc: { fontSize: 12, color: C.textMuted },
});
