import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { useState } from "react";
import { router } from "expo-router";
import { usePools, useMyPools, joinPool } from "@/hooks/use-pools";
import { useAuth } from "@/lib/auth-context";

const filters = ["All", "Active", "Hot", "High Stakes", "New"];

// Mock data matching the reference image — used as fallback when API returns empty
const mockPools = [
  { id: 'm1', name: 'Gym 5x/Week', description: 'Selfie with gym equipment visible', stake_amount: 0.5, pot_size: 3, current_players: 6, max_players: 8, duration_days: 7, streak_leader: 12, frequency: '5x/week', tag: 'ACTIVE' },
  { id: 'm2', name: 'No Sugar Challenge', description: 'Photo of every meal — zero added sugar', stake_amount: 2, pot_size: 16, current_players: 8, max_players: 10, duration_days: 14, streak_leader: 9, frequency: 'Daily', tag: 'HOT' },
  { id: 'm3', name: 'Morning Run 6AM', description: 'GPS-tagged run screenshot before 6:30 AM', stake_amount: 5, pot_size: 20, current_players: 4, max_players: 5, duration_days: 3, streak_leader: 18, frequency: 'Daily', tag: 'HIGH STAKES' },
  { id: 'm4', name: 'Read 30min/Day', description: 'Photo of book with timestamp', stake_amount: 0.2, pot_size: 2, current_players: 10, max_players: 10, duration_days: 21, streak_leader: 6, frequency: 'Daily', tag: 'ACTIVE' },
  { id: 'm5', name: 'Ship Code Daily', description: 'Screenshot of GitHub commit graph', stake_amount: 1, pot_size: 3, current_players: 3, max_players: 6, duration_days: 10, streak_leader: 4, frequency: 'Daily', tag: 'NEW' },
  { id: 'm6', name: 'Cold Plunge', description: 'Video proof of 2-min cold exposure', stake_amount: 3, pot_size: 15, current_players: 5, max_players: 5, duration_days: 5, streak_leader: 15, frequency: 'Daily', tag: 'HOT' },
];

export default function PoolsScreen() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { user } = useAuth();
  const { pools, loading, refetch } = usePools();
  const { pools: myPools, loading: myLoading } = useMyPools();
  const [joining, setJoining] = useState<string | null>(null);

  async function handleJoin(poolId: string) {
    if (!user) {
      Alert.alert("Error", "Please sign in to join a pool");
      return;
    }
    setJoining(poolId);
    try {
      const { error } = await joinPool(poolId, user.id);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "You've joined the pool!");
        refetch();
      }
    } finally {
      setJoining(null);
    }
  }

  // Use real pools if available, otherwise mock data
  const allPools = pools.length > 0 ? pools : mockPools;

  // Filter pools based on active filter
  const displayPools = activeFilter === "All"
    ? allPools
    : allPools.filter((pool: any) => {
        const tag = (pool.tag || '').toUpperCase();
        const filter = activeFilter.toUpperCase();
        if (filter === 'ACTIVE') return tag === 'ACTIVE';
        if (filter === 'HOT') return tag === 'HOT';
        if (filter === 'HIGH STAKES') return tag === 'HIGH STAKES';
        if (filter === 'NEW') return tag === 'NEW';
        return true;
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
              const tag = pool.tag || (pool.is_hot ? 'HOT' : 'ACTIVE');
              const tagStyle = getTagStyle(tag);

              return (
                <View key={pool.id} style={[p.card, tag === 'HOT' && p.cardHot]}>
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
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Create Pool button */}
      <Pressable
        style={p.fab}
        onPress={() => router.push('/create-pool')}
      >
        <LinearGradient colors={[C.primary, '#4ADE80']} style={p.fabGrad}>
          <Ionicons name="add" size={28} color={C.white} />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 120 },

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

  // FAB
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    zIndex: 50,
  },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
