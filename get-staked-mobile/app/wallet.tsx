import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { getDemoBalance, requestDemoAirdrop } from '@/lib/demo-wallet';
import { getTransactionHistory } from '@/lib/wallet';

export default function WalletScreen() {
  const { user, profile } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch demo balance
  useEffect(() => {
    if (user) fetchBalance();
  }, [user]);

  async function fetchBalance() {
    if (!user) return;
    setLoadingBalance(true);
    try {
      const bal = await getDemoBalance(user.id);
      setBalance(bal);
      // Also fetch recent transactions
      const { data } = await getTransactionHistory(user.id, 5);
      setTransactions(data);
    } finally {
      setLoadingBalance(false);
    }
  }

  async function handleAirdrop() {
    if (!user) return;
    setAirdropping(true);
    try {
      const result = await requestDemoAirdrop(user.id);
      if (result.success) {
        Alert.alert('Airdrop Success!', `5 demo SOL added!\nNew balance: ${result.newBalance?.toFixed(2)} SOL`);
        setBalance(result.newBalance ?? null);
      } else {
        Alert.alert('Airdrop Failed', result.error || 'Try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Airdrop request failed');
    } finally {
      setAirdropping(false);
    }
  }

  const txTypeLabel = (type: string) => {
    switch (type) {
      case 'stake_deposit': return { label: 'Staked', icon: 'arrow-up-circle' as const, color: C.danger };
      case 'stake_refund': return { label: 'Refunded', icon: 'arrow-down-circle' as const, color: C.primary };
      case 'winnings_claim': return { label: 'Won', icon: 'trophy' as const, color: C.accent };
      default: return { label: type, icon: 'swap-horizontal' as const, color: C.textMuted };
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </Pressable>
          <Text style={s.title}>Demo Wallet</Text>
        </View>

        {/* Demo Mode Banner */}
        <View style={s.demoBanner}>
          <Ionicons name="flask" size={16} color="#14F195" />
          <Text style={s.demoBannerText}>Demo Mode — This is not real currency</Text>
        </View>

        {/* Balance Card */}
        <View style={s.balanceCard}>
          <LinearGradient
            colors={[C.bgSurface, C.bgElevated]}
            style={s.balanceGradient}
          >
            <View style={s.balanceHeader}>
              <Ionicons name="wallet" size={28} color={C.accent} />
              <View style={s.balanceBadge}>
                <View style={s.balanceDot} />
                <Text style={s.balanceBadgeText}>DEMO</Text>
              </View>
            </View>

            <Text style={s.balanceLabel}>Your Balance</Text>
            {loadingBalance ? (
              <ActivityIndicator size="large" color={C.accent} style={{ marginVertical: 12 }} />
            ) : (
              <Text style={s.balanceValue}>
                {balance !== null ? `${balance.toFixed(2)}` : '0.00'}
                <Text style={s.balanceUnit}> SOL</Text>
              </Text>
            )}

            <Text style={s.balanceSub}>
              {profile?.display_name || 'User'} • {profile?.total_pools_joined ?? 0} pools joined
            </Text>

            {/* Airdrop Button */}
            <Pressable style={s.airdropBtn} onPress={handleAirdrop} disabled={airdropping}>
              <LinearGradient
                colors={['#14F195', '#9945FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.airdropGradient}
              >
                {airdropping ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Ionicons name="add-circle" size={18} color={C.white} />
                )}
                <Text style={s.airdropText}>
                  {airdropping ? 'Adding...' : 'Get 5 Free Demo SOL'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Refresh */}
            <Pressable style={s.refreshBtn} onPress={fetchBalance}>
              <Ionicons name="refresh" size={16} color={C.textSecondary} />
              <Text style={s.refreshText}>Refresh Balance</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Transaction History */}
        <Text style={s.sectionLabel}>RECENT TRANSACTIONS</Text>
        {transactions.length === 0 ? (
          <View style={s.emptyTx}>
            <Ionicons name="receipt-outline" size={32} color={C.textMuted} />
            <Text style={s.emptyTxText}>No transactions yet</Text>
            <Text style={s.emptyTxSub}>Join a pool to make your first stake!</Text>
          </View>
        ) : (
          <View style={s.txList}>
            {transactions.map((tx: any) => {
              const info = txTypeLabel(tx.type);
              return (
                <View key={tx.id} style={s.txRow}>
                  <Ionicons name={info.icon} size={20} color={info.color} />
                  <View style={s.txInfo}>
                    <Text style={s.txLabel}>{info.label}</Text>
                    <Text style={s.txPool}>
                      {tx.pools?.emoji || ''} {tx.pools?.name || 'Pool'}
                    </Text>
                  </View>
                  <Text style={[s.txAmount, { color: info.color }]}>
                    {tx.type === 'stake_deposit' ? '-' : '+'}{tx.amount} SOL
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* How it works */}
        <Text style={[s.sectionLabel, { marginTop: Spacing.xl }]}>HOW DEMO MODE WORKS</Text>
        <View style={s.stepsCard}>
          {[
            { step: '1', text: 'You start with 10 free demo SOL' },
            { step: '2', text: 'Tap "Get 5 Free Demo SOL" anytime for more' },
            { step: '3', text: 'Stake demo SOL when joining pools' },
            { step: '4', text: 'Win demo SOL back by completing challenges!' },
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
            <Text style={s.comingSoonEmoji}>{'🔗'}</Text>
            <View style={s.comingSoonInfo}>
              <Text style={s.comingSoonTitle}>Real Solana Integration</Text>
              <Text style={s.comingSoonSub}>Connect Phantom wallet for real SOL</Text>
            </View>
          </View>
          <View style={s.comingSoonRow}>
            <Text style={s.comingSoonEmoji}>{'💳'}</Text>
            <View style={s.comingSoonInfo}>
              <Text style={s.comingSoonTitle}>Card Payments via Stripe</Text>
              <Text style={s.comingSoonSub}>Pay with credit/debit card</Text>
            </View>
          </View>
          <View style={[s.comingSoonRow, { borderBottomWidth: 0 }]}>
            <Text style={s.comingSoonEmoji}>{'🪙'}</Text>
            <View style={s.comingSoonInfo}>
              <Text style={s.comingSoonTitle}>USDC Stablecoin</Text>
              <Text style={s.comingSoonSub}>Stake with stable value</Text>
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
    marginTop: Spacing.md, marginBottom: Spacing.lg,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary },
  demoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(20,241,149,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(20,241,149,0.2)', marginBottom: Spacing.lg,
  },
  demoBannerText: { fontSize: 12, fontWeight: '600', color: '#14F195' },
  balanceCard: { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.xl },
  balanceGradient: { padding: Spacing.xl, borderRadius: Radius.xl },
  balanceHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  balanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,176,0,0.12)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
  },
  balanceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  balanceBadgeText: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 1 },
  balanceLabel: { fontSize: 14, color: C.textMuted, marginBottom: 4 },
  balanceValue: { fontSize: 42, fontWeight: '900', color: C.textPrimary, marginBottom: 4 },
  balanceUnit: { fontSize: 20, fontWeight: '600', color: C.textMuted },
  balanceSub: { fontSize: 12, color: C.textMuted, marginBottom: 20 },
  airdropBtn: { marginBottom: 12, borderRadius: Radius.md, overflow: 'hidden' },
  airdropGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: Radius.md,
  },
  airdropText: { fontSize: 15, fontWeight: '700', color: C.white },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border,
  },
  refreshText: { fontSize: 12, color: C.textSecondary, fontWeight: '600' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, marginBottom: Spacing.sm,
  },
  emptyTx: {
    alignItems: 'center', padding: Spacing.xl, backgroundColor: C.bgSurface,
    borderRadius: Radius.md, borderWidth: 1, borderColor: C.border, gap: 6, marginBottom: Spacing.xl,
  },
  emptyTxText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  emptyTxSub: { fontSize: 12, color: C.textMuted },
  txList: {
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: Spacing.xl,
  },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  txPool: { fontSize: 11, color: C.textMuted },
  txAmount: { fontSize: 14, fontWeight: '700' },
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
  comingSoonSub: { fontSize: 12, color: C.textMuted },
});
