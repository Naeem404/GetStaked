import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { StreakCounter } from "@/components/streak-counter";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useMyPools } from "@/hooks/use-pools";
import { useUserStats } from "@/hooks/use-stats";
import { useHabitGrid } from "@/hooks/use-stats";

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
  const { profile, signOut } = useAuth();
  const { pools: myPools, loading: poolsLoading } = useMyPools();
  const { stats, loading: statsLoading } = useUserStats();
  const { days: habitDays } = useHabitGrid(28);

  const solBalance = profile?.sol_balance ?? 0;

  return (
    <SafeAreaView style={d.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={d.scroll}>
        {/* Top bar */}
        <View style={d.topBar}>
          <Text style={d.brandName}>GET STAKED</Text>
          <Pressable onPress={() => signOut()} style={d.walletPill}>
            <LinearGradient
              colors={[C.brandFire, C.brandGold]}
              style={d.walletDot}
            />
            <Text style={d.walletText}>{solBalance.toFixed(2)} SOL</Text>
          </Pressable>
        </View>

        {/* Streak Hero */}
        <View style={d.streakHero}>
          <StreakCounter days={stats.currentStreak} size="xl" />
          <Text style={d.streakLabel}>day streak</Text>
          <Text style={d.streakBest}>Best: {stats.bestStreak} days</Text>
        </View>

        {/* Mini Habit Grid */}
        <View style={d.gridSection}>
          <HabitGrid variant="compact" data={habitDays} />
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
              <Text style={d.poolsBadgeText}>{myPools.length}</Text>
            </View>
          </View>

          {poolsLoading ? (
            <ActivityIndicator color={C.brandFire} style={{ marginTop: 20 }} />
          ) : myPools.length === 0 ? (
            <View style={d.emptyState}>
              <Text style={d.emptyTitle}>No active stakes</Text>
              <Text style={d.emptyDesc}>Put your SOL where your mouth is</Text>
              <Pressable onPress={() => router.push("/pools")}>
                <LinearGradient
                  colors={[C.brandFire, C.brandGold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={d.emptyBtn}
                >
                  <Text style={d.emptyBtnText}>Browse Pools</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            myPools.map((pool) => {
              const membership = pool.my_membership;
              const streak = membership?.current_streak ?? 0;
              const today = new Date().toISOString().split('T')[0];
              const needsProof = membership?.last_proof_date !== today && pool.status === 'active';

              return (
                <Pressable
                  key={pool.id}
                  style={({ pressed }) => [
                    d.poolCard,
                    needsProof && d.poolCardUrgent,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  {needsProof && <View style={d.urgentDot} />}
                  <View style={d.poolRow}>
                    <Text style={d.poolEmoji}>{pool.emoji || '🎯'}</Text>
                    <View style={d.poolInfo}>
                      <Text style={d.poolName}>{pool.name}</Text>
                      <Text style={d.poolStake}>{pool.stake_amount} SOL staked</Text>
                    </View>
                    <StreakCounter days={streak} size="sm" />
                  </View>
                  <View style={d.poolProgress}>
                    <ProgressDots current={membership?.days_completed ?? 0} total={pool.duration_days} />
                  </View>
                </Pressable>
              );
            })
          )}
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
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: C.textSecondary, marginBottom: 20 },
  emptyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  emptyBtnText: { fontSize: 15, fontWeight: "700", color: C.white },
});
