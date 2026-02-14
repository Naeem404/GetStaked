import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { StreakCounter } from "@/components/streak-counter";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { router } from "expo-router";

const STREAK = 12;
const BEST = 21;

const activePools = [
  { id: "1", emoji: "🏃", name: "Morning Run", streak: 5, total: 7, stake: "0.5 SOL", needsProof: true },
  { id: "2", emoji: "📚", name: "Read 30 Pages", streak: 12, total: 14, stake: "0.5 SOL", needsProof: false },
  { id: "3", emoji: "💪", name: "Gym Session", streak: 3, total: 7, stake: "0.5 SOL", needsProof: false },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={d.dotsRow}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[d.dot, { backgroundColor: i < current ? C.brandFire : C.bgHover }]}
        />
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <SafeAreaView style={d.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={d.scroll}>
        {/* Top bar */}
        <View style={d.topBar}>
          <Text style={d.brandName}>GET STAKED</Text>
          <View style={d.walletPill}>
            <LinearGradient
              colors={[C.brandFire, C.brandGold]}
              style={d.walletDot}
            />
            <Text style={d.walletText}>2.45 SOL</Text>
          </View>
        </View>

        {/* Streak Hero */}
        <View style={d.streakHero}>
          <StreakCounter days={STREAK} size="xl" />
          <Text style={d.streakLabel}>day streak</Text>
          <Text style={d.streakBest}>Best: {BEST} days</Text>
        </View>

        {/* Mini Habit Grid */}
        <View style={d.gridSection}>
          <HabitGrid variant="compact" />
          <HabitGridLegend />
          <Pressable onPress={() => router.push("/stats")} style={d.gridLink}>
            <Text style={d.gridLinkText}>View full history →</Text>
          </Pressable>
        </View>

        {/* Active Pools */}
        <View style={d.poolsSection}>
          <View style={d.poolsHeader}>
            <Text style={d.poolsTitle}>Active</Text>
            <View style={d.poolsBadge}>
              <Text style={d.poolsBadgeText}>{activePools.length}</Text>
            </View>
          </View>

          {activePools.map((pool) => (
            <Pressable
              key={pool.id}
              style={({ pressed }) => [
                d.poolCard,
                pool.needsProof && d.poolCardUrgent,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              {pool.needsProof && <View style={d.urgentDot} />}
              <View style={d.poolRow}>
                <Text style={d.poolEmoji}>{pool.emoji}</Text>
                <View style={d.poolInfo}>
                  <Text style={d.poolName}>{pool.name}</Text>
                  <Text style={d.poolStake}>{pool.stake} staked</Text>
                </View>
                <StreakCounter days={pool.streak} size="sm" />
              </View>
              <View style={d.poolProgress}>
                <ProgressDots current={pool.streak} total={pool.total} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const d = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 100 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  brandName: { fontSize: 18, fontWeight: "800", color: C.brandFire, letterSpacing: 1.5 },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.bgElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: C.border,
  },
  walletDot: { width: 20, height: 20, borderRadius: 10 },
  walletText: { fontSize: 13, fontWeight: "700", color: C.brandGold, fontFamily: Fonts.mono },
  streakHero: { alignItems: "center", paddingVertical: 40 },
  streakLabel: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
  streakBest: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  gridSection: { alignItems: "center", paddingBottom: Spacing.xxl },
  gridLink: { marginTop: 12 },
  gridLinkText: { fontSize: 12, color: C.brandFire, fontWeight: "600" },
  poolsSection: { paddingHorizontal: Spacing.xl },
  poolsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: Spacing.lg },
  poolsTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary },
  poolsBadge: {
    backgroundColor: C.fireLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  poolsBadgeText: { fontSize: 12, fontWeight: "700", color: C.brandFire },
  poolCard: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  poolCardUrgent: { borderLeftWidth: 3, borderLeftColor: C.brandGold },
  urgentDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.brandGold,
  },
  poolRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  poolEmoji: { fontSize: 28 },
  poolInfo: { flex: 1 },
  poolName: { fontSize: 15, fontWeight: "600", color: C.textPrimary },
  poolStake: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  poolProgress: { marginTop: 12 },
  dotsRow: { flexDirection: "row", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
