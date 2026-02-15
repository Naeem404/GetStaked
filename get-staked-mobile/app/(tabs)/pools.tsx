import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { useState } from "react";
import { router } from "expo-router";
import { usePools, useMyPools, joinPool } from "@/hooks/use-pools";
import { useAuth } from "@/lib/auth-context";
import { useCoach, CoachPersona } from "@/hooks/use-coach";
import { useSolana, useAccounts } from "@phantom/react-native-sdk";
import { buildStakeTransaction } from "@/lib/solana-staking";

const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'];

type Persona = 'drill-sergeant' | 'hype-beast' | 'gentle-guide';
const personas: Record<Persona, { name: string; icon: string; colors: [string, string]; msg: string }> = {
  'drill-sergeant': { name: 'Drill Sergeant', icon: '\u2B50', colors: [C.danger, '#EF4444'], msg: "Day 5! Two people already dropped. Don't be number three." },
  'hype-beast': { name: 'Hype Beast', icon: '\u26A1', colors: [C.accent, '#FFB800'], msg: "FIRE STREAK! You're on a roll \u2014 keep it going! \u{1F525}" },
  'gentle-guide': { name: 'Gentle Guide', icon: '\u{1F33F}', colors: ['#14B8A6', '#06B6D4'], msg: "You're doing great. Steady progress wins the race." },
};
const quickActions = [
  { label: 'Motivate Me', icon: 'flash-outline' as const },
  { label: 'How Am I Doing?', icon: 'stats-chart-outline' as const },
  { label: 'SOS \u2014 Need Help', icon: 'warning-outline' as const, danger: true },
];

const filters = ["All", "Active", "Hot", "High Stakes", "New"];

function getPoolTag(pool: any): string {
  if (pool.is_hot) return 'HOT';
  if ((pool.stake_amount ?? 0) >= 3) return 'HIGH STAKES';
  const created = new Date(pool.created_at);
  const daysSinceCreated = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 3) return 'NEW';
  return 'ACTIVE';
}

export default function PoolsScreen() {
  const [activeFilter, setActiveFilter] = useState("Active");
  const { user } = useAuth();
  const { pools, loading, refetch } = usePools();
  const { pools: myPools, loading: myLoading } = useMyPools();
  const [joining, setJoining] = useState<string | null>(null);

  // Add Stake modal state
  const [showAddStake, setShowAddStake] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDescription, setStakeDescription] = useState('');
  const [stakeDays, setStakeDays] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('Daily');
  const [friendEmail, setFriendEmail] = useState('');

  // Coach / Speaker modal state
  const [showCoach, setShowCoach] = useState(false);
  const [persona, setPersona] = useState<Persona>('drill-sergeant');
  const { message: coachMsg, loading: coachLoading, playing, getCoachMessage, stopAudio } = useCoach();
  const personaMapDB: Record<Persona, CoachPersona> = { 'drill-sergeant': 'drill_sergeant', 'hype-beast': 'hype_beast', 'gentle-guide': 'gentle_guide' };
  const handleOpenCoach = () => { setShowCoach(true); getCoachMessage('morning_reminder'); };
  const handleQuickAction = (action: string) => {
    const triggerMap: Record<string, string> = { 'Motivate Me': 'morning_reminder', 'How Am I Doing?': 'milestone_streak', 'SOS \u2014 Need Help': 'streak_broken' };
    getCoachMessage((triggerMap[action] || 'morning_reminder') as any);
  };
  const cp = personas[persona];

  // Phantom SDK hooks for SOL staking
  const { solana } = useSolana();
  const { isConnected: walletConnected } = useAccounts();

  async function handleJoin(poolId: string) {
    if (!user) {
      Alert.alert("Error", "Please sign in to join a pool");
      return;
    }

    // Find pool to get stake amount
    const pool = pools.find((p: any) => p.id === poolId);
    const stakeAmount = pool?.stake_amount ?? 0;

    // If pool has a stake, confirm with user first
    if (stakeAmount > 0) {
      Alert.alert(
        "Stake Required",
        `This pool requires a ${stakeAmount} SOL stake. You'll be prompted to approve the transaction in Phantom.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: `Stake ${stakeAmount} SOL`,
            onPress: () => executeJoin(poolId, stakeAmount),
          },
        ]
      );
    } else {
      // Free pool — join directly
      executeJoin(poolId, 0);
    }
  }

  async function executeJoin(poolId: string, stakeAmount: number) {
    if (!user) return;
    setJoining(poolId);
    try {
      let txSignature: string | undefined;

      // If stake required AND wallet connected → do on-chain SOL transfer
      if (stakeAmount > 0 && walletConnected) {
        try {
          const fromAddress = await solana.getPublicKey();
          if (!fromAddress) throw new Error('Could not get wallet address');
          const { transaction } = await buildStakeTransaction(fromAddress as string, stakeAmount);
          const result: any = await solana.signAndSendTransaction(transaction);
          txSignature = result.hash || result.signature;
        } catch (txErr: any) {
          // User rejected or tx failed
          if (txErr?.message?.includes('rejected') || txErr?.message?.includes('cancelled')) {
            Alert.alert("Cancelled", "Transaction was cancelled.");
            return;
          }
          Alert.alert("Transaction Failed", txErr?.message || "Could not complete the SOL transfer.");
          return;
        }
      } else if (stakeAmount > 0 && !walletConnected) {
        Alert.alert(
          "Wallet Required",
          "Please connect your Phantom wallet first to stake SOL.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Connect Wallet", onPress: () => router.push('/wallet') },
          ]
        );
        return;
      }

      // Join pool in database (with tx signature if staked)
      const { error } = await joinPool(poolId, user.id, txSignature);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "🎉 You're In!",
          txSignature
            ? `Staked ${stakeAmount} SOL successfully. Good luck!`
            : "You've joined the pool! Good luck!"
        );
        refetch();
      }
    } finally {
      setJoining(null);
    }
  }

  // Filter pools based on active filter using real DB fields
  const displayPools = activeFilter === "All"
    ? pools
    : pools.filter((pool: any) => {
        const tag = getPoolTag(pool);
        return tag === activeFilter.toUpperCase();
      });

  const getTagStyle = (tag: string) => {
    switch (tag?.toUpperCase()) {
      case 'HOT': return { bg: 'rgba(255,140,0,0.15)', color: '#FF8C00' };
      case 'HIGH STAKES': return { bg: 'rgba(220,38,38,0.15)', color: '#EF4444' };
      case 'NEW': return { bg: 'rgba(34,197,94,0.15)', color: C.primary };
      default: return { bg: C.primaryDim, color: C.primary };
    }
  };

  return (
    <SafeAreaView style={p.safe} edges={["top"]}>
      {/* Header with speaker + title + add button */}
      <View style={p.headerRow}>
        <Pressable style={p.headerBtn} onPress={handleOpenCoach}>
          <Ionicons name="volume-high" size={22} color={C.textSecondary} />
        </Pressable>
        <Text style={p.headerTitle}>Pools</Text>
        <Pressable style={p.headerBtn} onPress={() => setShowAddStake(true)}>
          <Ionicons name="add" size={24} color={C.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>
        {/* LIVE POOLS badge */}
        <View style={p.liveBadgeRow}>
          <View style={p.liveBadge}>
            <View style={p.liveDot} />
            <Text style={p.liveBadgeText}>LIVE POOLS</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={p.title}>Active Stake Pools</Text>
        <Text style={p.subtitle}>
          Real money. Real competition. Pick your challenge and put your SOL on the line.
        </Text>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={p.filterRow}
        >
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[p.filterPill, activeFilter === f && p.filterPillActive]}
            >
              <Text style={[p.filterText, activeFilter === f && p.filterTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Pool Cards */}
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
        ) : displayPools.length === 0 ? (
          <View style={p.emptyState}>
            <Ionicons name="search-outline" size={48} color={C.textMuted} />
            <Text style={p.emptyTitle}>No pools found</Text>
            <Text style={p.emptyDesc}>Try a different filter or create your own pool!</Text>
          </View>
        ) : (
          <View style={p.list}>
            {displayPools.map((pool: any) => {
              const fillPct = ((pool.current_players ?? 0) / (pool.max_players || 1)) * 100;
              const tag = getPoolTag(pool);
              const tagStyle = getTagStyle(tag);

              return (
                <Pressable key={pool.id} style={[p.card, tag === 'HOT' && p.cardHot]} onPress={() => router.push({ pathname: '/pool-detail', params: { id: pool.id } })}>
                  {/* Tag + time left */}
                  <View style={p.cardHeader}>
                    <View style={[p.tag, { backgroundColor: tagStyle.bg }]}>
                      <Text style={[p.tagText, { color: tagStyle.color }]}>{tag}</Text>
                    </View>
                    <View style={p.timerRow}>
                      <Ionicons name="time-outline" size={12} color={C.textMuted} />
                      <Text style={p.timerText}>{pool.duration_days}d left</Text>
                    </View>
                  </View>

                  {/* Pool name + description */}
                  <Text style={p.cardName}>{pool.name}</Text>
                  <Text style={p.cardDesc} numberOfLines={1}>
                    {pool.description || `${pool.stake_amount} SOL entry · ${pool.duration_days} days`}
                  </Text>

                  {/* Stake + Total Pot */}
                  <View style={p.stakeRow}>
                    <View>
                      <Text style={p.stakeLabel}>STAKE</Text>
                      <View style={p.stakeValueRow}>
                        <Text style={p.stakeNum}>{pool.stake_amount}</Text>
                        <Text style={p.stakeSol}>SOL</Text>
                      </View>
                    </View>
                    <View style={p.stakeRight}>
                      <Text style={p.stakeLabel}>TOTAL POT</Text>
                      <View style={p.stakeValueRow}>
                        <Text style={[p.stakeNum, { color: C.primary }]}>
                          {typeof pool.pot_size === 'number' ? pool.pot_size : 0}
                        </Text>
                        <Text style={[p.stakeSol, { color: C.primary }]}>SOL</Text>
                      </View>
                    </View>
                  </View>

                  {/* Players + Best Streak */}
                  <View style={p.metaRow}>
                    <View style={p.metaItem}>
                      <Ionicons name="people-outline" size={13} color={C.textMuted} />
                      <Text style={p.metaText}>
                        {pool.current_players ?? 0}/{pool.max_players} players
                      </Text>
                    </View>
                    {pool.streak_leader && (
                      <View style={p.metaItem}>
                        <Ionicons name="flame" size={13} color={C.accent} />
                        <Text style={p.metaText}>{pool.streak_leader}d best streak</Text>
                      </View>
                    )}
                  </View>

                  {/* Progress bar */}
                  <View style={p.barBg}>
                    <LinearGradient
                      colors={[C.primary, '#4ADE80']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[p.barFill, { width: `${Math.min(fillPct, 100)}%` }]}
                    />
                  </View>

                  {/* Frequency tag */}
                  {pool.frequency && (
                    <View style={p.freqRow}>
                      <Ionicons name="flash" size={12} color={C.primary} />
                      <Text style={p.freqText}>{pool.frequency}</Text>
                    </View>
                  )}

                  {/* Join Pool button */}
                  <Pressable
                    onPress={() => handleJoin(pool.id)}
                    disabled={joining === pool.id}
                  >
                    <LinearGradient
                      colors={[C.primary, '#4ADE80']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[p.joinBtn, joining === pool.id && { opacity: 0.5 }]}
                    >
                      <Text style={p.joinText}>
                        {joining === pool.id ? 'Joining...' : 'Join Pool'}
                      </Text>
                      <Ionicons name="open-outline" size={16} color={C.white} />
                    </LinearGradient>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Coach / Speaker Modal ── */}
      <Modal visible={showCoach} transparent animationType="slide" onRequestClose={() => setShowCoach(false)}>
        <Pressable style={p.coachOverlay} onPress={() => setShowCoach(false)} />
        <View style={p.coachSheet}>
          <View style={p.coachHandle} />
          {/* Header */}
          <View style={p.coachSheetHeader}>
            <LinearGradient colors={cp.colors} style={p.coachAvatarGrad}>
              <Text style={{ fontSize: 24 }}>{cp.icon}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={p.coachPersonaName}>{cp.name}</Text>
              <View style={p.coachPersonaRow}>
                {(Object.keys(personas) as Persona[]).map((k) => (
                  <Pressable key={k} onPress={() => setPersona(k)} style={[p.coachPersonaPill, k === persona && p.coachPersonaPillActive]}>
                    <Text style={{ fontSize: 14 }}>{personas[k].icon}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          {/* Message */}
          <View style={p.coachMsgCard}>
            {coachLoading ? (
              <ActivityIndicator color={C.primary} style={{ paddingVertical: 12 }} />
            ) : (
              <Text style={p.coachMsgText}>{coachMsg || cp.msg}</Text>
            )}
            <View style={p.coachWaveRow}>
              <Pressable onPress={playing ? stopAudio : () => getCoachMessage('morning_reminder')}>
                <Ionicons name={playing ? 'stop' : 'play'} size={16} color={playing ? C.primary : C.textMuted} />
              </Pressable>
              {[12, 18, 8, 22, 14, 10, 20, 16, 12].map((h, i) => (
                <View key={i} style={[p.coachWaveBar, { height: h, backgroundColor: playing ? C.primary : C.textMuted }]} />
              ))}
            </View>
          </View>
          {/* Quick actions */}
          <View>
            {quickActions.map((a) => (
              <Pressable key={a.label} style={p.coachActionBtn} onPress={() => handleQuickAction(a.label)}>
                <Ionicons name={a.icon} size={18} color={a.danger ? C.danger : C.textSecondary} />
                <Text style={[p.coachActionText, a.danger && { color: C.danger }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── Add Stake Modal ── */}
      <Modal visible={showAddStake} animationType="slide" transparent onRequestClose={() => setShowAddStake(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={p.modalOverlay}>
          <View style={p.modalContent}>
            <View style={p.modalHeader}>
              <Text style={p.modalTitle}>Add New Stake</Text>
              <Pressable onPress={() => setShowAddStake(false)} style={p.modalCloseBtn}>
                <Ionicons name="close" size={22} color={C.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <Text style={p.modalLabel}>Stake Amount (SOL)</Text>
              <View style={p.modalInputWrap}>
                <Ionicons name="logo-bitcoin" size={18} color={C.primary} />
                <TextInput style={p.modalInput} placeholder="0.00" placeholderTextColor={C.textMuted} keyboardType="decimal-pad" value={stakeAmount} onChangeText={setStakeAmount} />
              </View>
              <Text style={p.modalLabel}>What is the stake on?</Text>
              <View style={p.modalInputWrap}>
                <Ionicons name="flag" size={18} color={C.accent} />
                <TextInput style={p.modalInput} placeholder="e.g. Morning runs, No sugar, Read daily..." placeholderTextColor={C.textMuted} value={stakeDescription} onChangeText={setStakeDescription} />
              </View>
              <Text style={p.modalLabel}>Duration (days)</Text>
              <View style={p.modalInputWrap}>
                <Ionicons name="calendar" size={18} color={C.primary} />
                <TextInput style={p.modalInput} placeholder="7" placeholderTextColor={C.textMuted} keyboardType="number-pad" value={stakeDays} onChangeText={setStakeDays} />
              </View>
              <Text style={p.modalLabel}>Frequency</Text>
              <View style={p.freqModalRow}>
                {FREQUENCY_OPTIONS.map((freq) => (
                  <Pressable key={freq} onPress={() => setSelectedFrequency(freq)} style={[p.freqModalPill, selectedFrequency === freq && p.freqModalPillActive]}>
                    <Text style={[p.freqModalPillText, selectedFrequency === freq && p.freqModalPillTextActive]}>{freq}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={p.modalLabel}>Add Friend to Stake</Text>
              <View style={p.modalInputWrap}>
                <Ionicons name="person-add" size={18} color={C.primary} />
                <TextInput style={p.modalInput} placeholder="Friend's email or username" placeholderTextColor={C.textMuted} value={friendEmail} onChangeText={setFriendEmail} />
              </View>
              <Pressable onPress={() => { setShowAddStake(false); router.push('/create-pool'); }} style={p.modalCreateBtn}>
                <LinearGradient colors={[C.primary, '#4ADE80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={p.modalCreateGrad}>
                  <Ionicons name="add-circle" size={20} color={C.white} />
                  <Text style={p.modalCreateText}>Create Stake</Text>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 120 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  // LIVE POOLS badge
  liveBadgeRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: C.primaryDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 1,
  },

  // Title
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: C.textPrimary,
    letterSpacing: -0.5,
    paddingHorizontal: Spacing.xl,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  // Filter pills
  filterRow: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
    marginBottom: Spacing.xl,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: C.bgSurface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterPillActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  filterTextActive: { color: C.white },

  // Pool list
  list: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },

  // Card
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHot: {
    borderColor: 'rgba(255,140,0,0.3)',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerText: { fontSize: 12, color: C.textMuted },

  cardName: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },

  // Stake row
  stakeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  stakeRight: { alignItems: "flex-end" },
  stakeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stakeValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  stakeNum: { fontSize: 24, fontWeight: "900", color: C.textPrimary },
  stakeSol: { fontSize: 13, fontWeight: '600', color: C.textMuted },

  // Meta row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: C.textMuted },

  // Progress bar
  barBg: {
    height: 4,
    backgroundColor: C.bgHover,
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },

  // Frequency
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  freqText: { fontSize: 12, fontWeight: '600', color: C.primary },

  // Join button
  joinBtn: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  joinText: { fontSize: 15, fontWeight: "700", color: C.white },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 14, color: C.textSecondary, textAlign: "center", paddingHorizontal: 32 },

  // Coach modal
  coachOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  coachSheet: {
    backgroundColor: C.bgSurface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  coachHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.bgHover, alignSelf: 'center', marginTop: 10, marginBottom: 16 },
  coachSheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.xl },
  coachAvatarGrad: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  coachPersonaName: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
  coachPersonaRow: { flexDirection: 'row', gap: 6 },
  coachPersonaPill: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  coachPersonaPillActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  coachMsgCard: { backgroundColor: C.bgElevated, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.xl },
  coachMsgText: { fontSize: 15, color: C.textPrimary, lineHeight: 22, marginBottom: 12 },
  coachWaveRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  coachWaveBar: { width: 3, borderRadius: 1.5 },
  coachActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgElevated, paddingVertical: 14, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: C.border },
  coachActionText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },

  // Add Stake modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.bgSurface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, paddingTop: Spacing.xl, paddingHorizontal: Spacing.xl, paddingBottom: 40, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  modalTitle: { fontSize: 22, fontWeight: '900', color: C.textPrimary, letterSpacing: -0.3 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center' },
  modalLabel: { fontSize: 13, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: Spacing.lg },
  modalInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.border, paddingHorizontal: Spacing.lg, gap: 10 },
  modalInput: { flex: 1, fontSize: 16, color: C.textPrimary, paddingVertical: 14 },
  freqModalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqModalPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  freqModalPillActive: { backgroundColor: C.primaryDim, borderColor: C.primary },
  freqModalPillText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  freqModalPillTextActive: { color: C.primary },
  modalCreateBtn: { marginTop: Spacing.xxl, borderRadius: Radius.lg, overflow: 'hidden' },
  modalCreateGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: Radius.lg },
  modalCreateText: { fontSize: 18, fontWeight: '800', color: C.white },
});
