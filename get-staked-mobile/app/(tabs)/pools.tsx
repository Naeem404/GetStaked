import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { useState } from "react";
import { usePools, joinPool } from "@/hooks/use-pools";
import { useAuth } from "@/lib/auth-context";

const categories = ["All", "Fitness", "Education", "Wellness", "Productivity", "Creative"];

export default function PoolsScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();
  const categoryFilter = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
  const { pools, loading, refetch } = usePools(categoryFilter);
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

  return (
    <SafeAreaView style={p.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>
        {/* Header */}
        <View style={p.header}>
          <Text style={p.title}>Browse Pools</Text>
          <Pressable style={p.filterBtn}>
            <Ionicons name="filter" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        {/* Categories */}
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

        {/* Pool Cards */}
        {loading ? (
          <ActivityIndicator color={C.brandFire} style={{ marginTop: 40 }} />
        ) : pools.length === 0 ? (
          <View style={p.emptyState}>
            <Text style={p.emptyTitle}>No pools yet</Text>
            <Text style={p.emptyDesc}>Be the first to create one!</Text>
          </View>
        ) : (
          <View style={p.list}>
            {pools.map((pool) => (
              <Pressable
                key={pool.id}
                style={({ pressed }) => [
                  p.card,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                {/* Top row */}
                <View style={p.cardTop}>
                  <View style={p.cardLeft}>
                    <Text style={p.cardEmoji}>{pool.emoji || '🎯'}</Text>
                    <View>
                      <View style={p.nameRow}>
                        <Text style={p.cardName}>{pool.name}</Text>
                        {pool.is_hot && (
                          <View style={p.hotBadge}>
                            <Text style={p.hotText}>🔥 HOT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={p.cardMeta}>
                        {pool.duration_days}d · {pool.stake_amount} SOL entry
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stats row */}
                <View style={p.statsRow}>
                  <View style={p.stat}>
                    <Ionicons name="people-outline" size={14} color={C.textMuted} />
                    <Text style={p.statText}>
                      {pool.current_players ?? 0}/{pool.max_players}
                    </Text>
                  </View>
                  <View style={p.stat}>
                    <Ionicons name="wallet-outline" size={14} color={C.textMuted} />
                    <Text style={p.statText}>{(pool.pot_size ?? 0).toFixed(1)} SOL</Text>
                  </View>
                </View>

                {/* Players bar */}
                <View style={p.barBg}>
                  <View
                    style={[
                      p.barFill,
                      { width: `${((pool.current_players ?? 0) / pool.max_players) * 100}%` },
                    ]}
                  />
                </View>

                {/* Join button */}
                <Pressable onPress={() => handleJoin(pool.id)} disabled={joining === pool.id}>
                  <LinearGradient
                    colors={[C.brandFire, C.brandGold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[p.joinBtn, joining === pool.id && { opacity: 0.5 }]}
                  >
                    <Text style={p.joinText}>
                      {joining === pool.id ? 'Joining...' : `Join · ${pool.stake_amount} SOL`}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: { fontSize: 24, fontWeight: "800", color: C.textPrimary },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  catRow: { paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.xl },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  catPillActive: {
    backgroundColor: C.fireDim,
    borderColor: C.brandFire,
  },
  catText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  catTextActive: { color: C.brandFire },
  list: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cardEmoji: { fontSize: 32 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  hotBadge: {
    backgroundColor: C.fireDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  hotText: { fontSize: 10, fontWeight: "700", color: C.brandFire },
  cardMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: Spacing.md,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: C.textMuted, fontFamily: Fonts.mono },
  barBg: {
    height: 4,
    backgroundColor: C.bgHover,
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: C.brandFire,
    borderRadius: 2,
  },
  joinBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  joinText: { fontSize: 14, fontWeight: "700", color: C.white },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: C.textSecondary },
});
