import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { useState } from "react";
import { router } from "expo-router";
import { usePools, useMyPools, joinPool } from "@/hooks/use-pools";
import { useAuth } from "@/lib/auth-context";

const categories = ["All", "Fitness", "Education", "Wellness", "Productivity", "Creative"];

export default function PoolsScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<'active' | 'available'>('active');
  const { user } = useAuth();
  const categoryFilter = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
  const { pools, loading, refetch } = usePools(categoryFilter);
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

  const displayPools = activeTab === 'active' ? myPools : pools;
  const isLoading = activeTab === 'active' ? myLoading : loading;

  return (
    <SafeAreaView style={p.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>
        {/* Header */}
        <View style={p.header}>
          <Text style={p.title}>Pools</Text>
          <View style={p.headerActions}>
            <Pressable style={p.headerBtn} onPress={() => router.push('/friends')}>
              <Ionicons name="people-outline" size={20} color={C.textSecondary} />
            </Pressable>
            <Pressable style={p.headerBtn} onPress={() => router.push('/wallet')}>
              <Ionicons name="wallet-outline" size={20} color={C.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Active / Available toggle */}
        <View style={p.tabRow}>
          <Pressable
            onPress={() => setActiveTab('active')}
            style={[p.tab, activeTab === 'active' && p.tabActive]}
          >
            <Text style={[p.tabText, activeTab === 'active' && p.tabTextActive]}>
              Active Pools
            </Text>
            {myPools.length > 0 && (
              <View style={p.tabBadge}>
                <Text style={p.tabBadgeText}>{myPools.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('available')}
            style={[p.tab, activeTab === 'available' && p.tabActive]}
          >
            <Text style={[p.tabText, activeTab === 'available' && p.tabTextActive]}>
              Available
            </Text>
          </Pressable>
        </View>

        {/* Categories (only for available tab) */}
        {activeTab === 'available' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={p.catRow}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[p.catPill, activeCategory === cat && p.catPillActive]}
              >
                <Text style={[p.catText, activeCategory === cat && p.catTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Pool Cards */}
        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
        ) : displayPools.length === 0 ? (
          <View style={p.emptyState}>
            <Ionicons
              name={activeTab === 'active' ? "layers-outline" : "search-outline"}
              size={48}
              color={C.textMuted}
            />
            <Text style={p.emptyTitle}>
              {activeTab === 'active' ? 'No active pools' : 'No pools found'}
            </Text>
            <Text style={p.emptyDesc}>
              {activeTab === 'active'
                ? 'Join a pool to start staking on your habits'
                : 'Be the first to create one!'}
            </Text>
            {activeTab === 'active' && (
              <Pressable onPress={() => setActiveTab('available')} style={p.emptyBtn}>
                <Text style={p.emptyBtnText}>Browse Available</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={p.list}>
            {displayPools.map((pool: any) => {
              const fillPct = ((pool.current_players ?? 0) / pool.max_players) * 100;
              const isHot = pool.is_hot;

              return (
                <Pressable
                  key={pool.id}
                  style={({ pressed }) => [
                    p.card,
                    isHot && p.cardHot,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  {/* Tag + timer */}
                  <View style={p.cardHeader}>
                    <View style={[p.tag, isHot ? p.tagHot : p.tagActive]}>
                      <Text style={[p.tagText, isHot ? p.tagTextHot : p.tagTextActive]}>
                        {isHot ? 'HOT' : 'ACTIVE'}
                      </Text>
                    </View>
                    <View style={p.timerPill}>
                      <Ionicons name="time-outline" size={12} color={C.textMuted} />
                      <Text style={p.timerText}>{pool.duration_days}d</Text>
                    </View>
                  </View>

                  {/* Title + description */}
                  <View style={p.cardBody}>
                    <Text style={p.cardEmoji}>{pool.emoji || '🎯'}</Text>
                    <View style={p.cardInfo}>
                      <Text style={p.cardName}>{pool.name}</Text>
                      <Text style={p.cardMeta} numberOfLines={1}>
                        {pool.description || `${pool.stake_amount} SOL entry · ${pool.duration_days} days`}
                      </Text>
                    </View>
                  </View>

                  {/* Stake + Pot */}
                  <View style={p.stakeRow}>
                    <View>
                      <Text style={p.stakeLabel}>STAKE</Text>
                      <View style={p.stakeValue}>
                        <Text style={p.stakeNum}>{pool.stake_amount}</Text>
                        <Text style={p.stakeSol}>SOL</Text>
                      </View>
                    </View>
                    <View style={p.stakeRight}>
                      <Text style={p.stakeLabel}>TOTAL POT</Text>
                      <View style={p.stakeValue}>
                        <Text style={[p.stakeNum, { color: C.primary }]}>
                          {(pool.pot_size ?? 0).toFixed(1)}
                        </Text>
                        <Text style={p.stakeSol}>SOL</Text>
                      </View>
                    </View>
                  </View>

                  {/* Players bar */}
                  <View style={p.playersRow}>
                    <View style={p.stat}>
                      <Ionicons name="people-outline" size={13} color={C.textMuted} />
                      <Text style={p.statText}>
                        {pool.current_players ?? 0}/{pool.max_players}
                      </Text>
                    </View>
                    {pool.streak_leader && (
                      <View style={p.stat}>
                        <Text style={p.flameIcon}>🔥</Text>
                        <Text style={p.statText}>{pool.streak_leader}d best</Text>
                      </View>
                    )}
                  </View>
                  <View style={p.barBg}>
                    <LinearGradient
                      colors={[C.primary, '#4ADE80']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[p.barFill, { width: `${fillPct}%` }]}
                    />
                  </View>

                  {/* Action buttons */}
                  <View style={p.actionRow}>
                    {activeTab === 'active' ? (
                      <>
                        <Pressable style={p.actionBtnOutline}>
                          <Ionicons name="share-outline" size={16} color={C.textSecondary} />
                          <Text style={p.actionBtnOutlineText}>Share</Text>
                        </Pressable>
                        <Pressable style={p.actionBtnOutline}>
                          <Ionicons name="exit-outline" size={16} color={C.danger} />
                          <Text style={[p.actionBtnOutlineText, { color: C.danger }]}>Leave</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => handleJoin(pool.id)}
                        disabled={joining === pool.id}
                        style={{ flex: 1 }}
                      >
                        <LinearGradient
                          colors={[C.primary, '#4ADE80']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[p.joinBtn, joining === pool.id && { opacity: 0.5 }]}
                        >
                          <Text style={p.joinText}>
                            {joining === pool.id ? 'Joining...' : `Join Pool · ${pool.stake_amount} SOL`}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>
                </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: 28, fontWeight: "800", color: C.textPrimary, letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.bgSurface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },

  // Tab toggle
  tabRow: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: C.bgElevated,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: C.textMuted },
  tabTextActive: { color: C.textPrimary },
  tabBadge: {
    backgroundColor: C.primaryDim,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tabBadgeText: { fontSize: 11, fontWeight: "700", color: C.primary },

  // Categories
  catRow: { paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.lg },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: C.bgSurface,
    borderWidth: 1,
    borderColor: C.border,
  },
  catPillActive: {
    backgroundColor: C.primaryDim,
    borderColor: C.primary,
  },
  catText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  catTextActive: { color: C.primary },

  // Pool list
  list: { paddingHorizontal: Spacing.xl, gap: Spacing.md },

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
  tagActive: { backgroundColor: C.primaryDim },
  tagHot: { backgroundColor: C.accentDim },
  tagText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  tagTextActive: { color: C.primary },
  tagTextHot: { color: C.accent },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerText: { fontSize: 12, color: C.textMuted },

  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: Spacing.lg,
  },
  cardEmoji: { fontSize: 36 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: "700", color: C.textPrimary, marginBottom: 2 },
  cardMeta: { fontSize: 13, color: C.textMuted },

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
  stakeValue: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  stakeNum: { fontSize: 22, fontWeight: "800", color: C.textPrimary },
  stakeSol: { fontSize: 13, color: C.textMuted },

  // Players
  playersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: C.textMuted },
  flameIcon: { fontSize: 11 },
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

  // Action buttons
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  actionBtnOutlineText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  joinBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: Radius.md,
  },
  joinText: { fontSize: 14, fontWeight: "700", color: C.white },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 14, color: C.textSecondary, textAlign: "center", paddingHorizontal: 32 },
  emptyBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    backgroundColor: C.primaryDim,
    borderWidth: 1,
    borderColor: C.primary,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "600", color: C.primary },

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
