import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { useUserStats, useHabitGrid } from "@/hooks/use-stats";
import { useRecentActivity } from "@/hooks/use-proofs";
import { useState } from "react";

// Mock leaderboard data (replace with real data from hooks)
const leaderboardData = [
  { rank: 1, name: "0xDrk...7f2a", streak: 47, pools: 12, winnings: 24.5, avatar: "D", status: "active" as const },
  { rank: 2, name: "phantom...9e1b", streak: 42, pools: 9, winnings: 18.3, avatar: "P", status: "active" as const },
  { rank: 3, name: "sol_beast...3c4d", streak: 38, pools: 15, winnings: 15.7, avatar: "S", status: "active" as const },
  { rank: 4, name: "habit_ape...6a8f", streak: 35, pools: 7, winnings: 12.1, avatar: "H", status: "active" as const },
  { rank: 5, name: "staker42...b2e0", streak: 31, pools: 11, winnings: 10.8, avatar: "T", status: "failed" as const },
  { rank: 6, name: "grind_fm...4d7c", streak: 28, pools: 6, winnings: 9.4, avatar: "G", status: "active" as const },
  { rank: 7, name: "iron_will...1f3e", streak: 25, pools: 8, winnings: 8.2, avatar: "I", status: "active" as const },
  { rank: 8, name: "no_quit...5a9b", streak: 22, pools: 5, winnings: 6.7, avatar: "N", status: "failed" as const },
];

type TabType = 'leaderboard' | 'analytics';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const { stats, loading: statsLoading } = useUserStats();
  const { days: habitDays, loading: gridLoading } = useHabitGrid(91);
  const { activity, loading: activityLoading } = useRecentActivity(10);

  const totalPot = 156.8;

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Header */}
        <View style={st.header}>
          <Text style={st.title}>
            {activeTab === 'leaderboard' ? 'Leaderboard' : 'Analytics'}
          </Text>
        </View>

        {/* Tab toggle */}
        <View style={st.tabRow}>
          <Pressable
            onPress={() => setActiveTab('leaderboard')}
            style={[st.tab, activeTab === 'leaderboard' && st.tabActive]}
          >
            <Ionicons name="trophy-outline" size={16} color={activeTab === 'leaderboard' ? C.primary : C.textMuted} />
            <Text style={[st.tabText, activeTab === 'leaderboard' && st.tabTextActive]}>Rankings</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('analytics')}
            style={[st.tab, activeTab === 'analytics' && st.tabActive]}
          >
            <Ionicons name="analytics-outline" size={16} color={activeTab === 'analytics' ? C.primary : C.textMuted} />
            <Text style={[st.tabText, activeTab === 'analytics' && st.tabTextActive]}>Analytics</Text>
          </Pressable>
        </View>

        {activeTab === 'leaderboard' ? (
          <>
            {/* Pot amount */}
            <View style={st.potCard}>
              <LinearGradient
                colors={['rgba(34,197,94,0.08)', 'rgba(34,197,94,0.02)']}
                style={st.potGrad}
              >
                <Text style={st.potLabel}>TOTAL POT</Text>
                <View style={st.potRow}>
                  <Text style={st.potAmount}>{totalPot.toFixed(1)}</Text>
                  <Text style={st.potSol}>SOL</Text>
                </View>
                <Text style={st.potSub}>{leaderboardData.length} stakers competing</Text>
              </LinearGradient>
            </View>

            {/* Top 3 podium */}
            <View style={st.podium}>
              {leaderboardData.slice(0, 3).map((leader, i) => {
                const isFirst = i === 0;
                const colors: [string, string] = isFirst
                  ? [C.accent, '#FFB800']
                  : i === 1
                  ? [C.primary, '#4ADE80']
                  : [C.info, '#60A5FA'];

                return (
                  <View key={leader.rank} style={[st.podiumItem, isFirst && st.podiumFirst]}>
                    <LinearGradient colors={colors} style={[st.podiumAvatar, isFirst && st.podiumAvatarFirst]}>
                      <Text style={[st.podiumAvatarText, isFirst && { fontSize: 20 }]}>
                        {leader.avatar}
                      </Text>
                    </LinearGradient>
                    {isFirst && <Text style={st.crownIcon}>👑</Text>}
                    <Text style={st.podiumRank}>#{leader.rank}</Text>
                    <Text style={st.podiumName} numberOfLines={1}>{leader.name}</Text>
                    <View style={st.podiumStreakRow}>
                      <Text style={st.podiumFlame}>🔥</Text>
                      <Text style={st.podiumStreak}>{leader.streak}d</Text>
                    </View>
                    <Text style={st.podiumWinnings}>{leader.winnings} SOL</Text>
                  </View>
                );
              })}
            </View>

            {/* Full rankings list */}
            <View style={st.rankList}>
              <View style={st.rankHeader}>
                <Text style={[st.rankHeaderText, { flex: 0.5 }]}>#</Text>
                <Text style={[st.rankHeaderText, { flex: 2 }]}>Wallet</Text>
                <Text style={[st.rankHeaderText, { flex: 1, textAlign: 'center' }]}>Streak</Text>
                <Text style={[st.rankHeaderText, { flex: 1, textAlign: 'right' }]}>Won</Text>
              </View>

              {leaderboardData.slice(3).map((leader) => (
                <View key={leader.rank} style={st.rankRow}>
                  <Text style={[st.rankNum, { flex: 0.5 }]}>{leader.rank}</Text>
                  <View style={[st.rankWallet, { flex: 2 }]}>
                    <View style={st.rankAvatar}>
                      <Text style={st.rankAvatarText}>{leader.avatar}</Text>
                    </View>
                    <View>
                      <Text style={st.rankName}>{leader.name}</Text>
                      <View style={st.statusRow}>
                        <View style={[st.statusDot, leader.status === 'failed' && st.statusDotFailed]} />
                        <Text style={[st.statusText, leader.status === 'failed' && { color: C.danger }]}>
                          {leader.status === 'active' ? 'Active' : 'Failed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[st.rankStreakCol, { flex: 1 }]}>
                    <Text style={st.rankFlame}>🔥</Text>
                    <Text style={st.rankStreakText}>{leader.streak}d</Text>
                  </View>
                  <Text style={[st.rankWinText, { flex: 1 }]}>{leader.winnings}</Text>
                </View>
              ))}
            </View>

            {/* Action buttons */}
            <View style={st.actionRow}>
              <Pressable style={st.actionBtn}>
                <Ionicons name="eye-outline" size={18} color={C.primary} />
                <Text style={st.actionBtnText}>View Proofs</Text>
              </Pressable>
              <Pressable style={st.actionBtn}>
                <Ionicons name="notifications-outline" size={18} color={C.accent} />
                <Text style={[st.actionBtnText, { color: C.accent }]}>Nudge</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {/* Analytics: Stats Grid */}
            {statsLoading ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 20 }} />
            ) : (
              <View style={st.statsGrid}>
                {[
                  { label: "Current Streak", value: String(stats.currentStreak), icon: "flame" as const, color: C.accent },
                  { label: "Best Streak", value: String(stats.bestStreak), icon: "trophy" as const, color: C.primary },
                  { label: "Win Rate", value: `${stats.winRate}%`, icon: "trending-up" as const, color: C.info },
                  { label: "Completion", value: `${stats.completionRate}%`, icon: "checkmark-circle" as const, color: C.primary },
                ].map((stat) => (
                  <View key={stat.label} style={st.statCard}>
                    <View style={[st.statIconBg, { backgroundColor: stat.color + '15' }]}>
                      <Ionicons name={stat.icon} size={18} color={stat.color} />
                    </View>
                    <Text style={[st.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={st.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Heatmap */}
            <View style={st.gridSection}>
              <Text style={st.sectionTitle}>Activity Heatmap</Text>
              <View style={st.gridCard}>
                {gridLoading ? (
                  <ActivityIndicator color={C.primary} />
                ) : (
                  <>
                    <HabitGrid variant="full" data={habitDays} />
                    <HabitGridLegend />
                  </>
                )}
              </View>
            </View>

            {/* Earnings + Risk */}
            <View style={st.metricsRow}>
              <View style={st.metricCard}>
                <Text style={st.metricLabel}>EARNINGS</Text>
                <Text style={st.metricValue}>+{stats.totalSolEarned?.toFixed(2) ?? '0.00'}</Text>
                <Text style={st.metricUnit}>SOL</Text>
              </View>
              <View style={st.metricCard}>
                <Text style={st.metricLabel}>RISK LEVEL</Text>
                <Text style={[st.metricValue, { color: stats.winRate > 60 ? C.primary : C.danger }]}>
                  {stats.winRate > 80 ? 'Low' : stats.winRate > 60 ? 'Medium' : 'High'}
                </Text>
                <View style={st.riskBar}>
                  <View style={[st.riskFill, {
                    width: `${Math.min(stats.winRate, 100)}%`,
                    backgroundColor: stats.winRate > 60 ? C.primary : C.danger,
                  }]} />
                </View>
              </View>
            </View>

            {/* Join recommended */}
            <Pressable style={st.recommendBtn}>
              <LinearGradient
                colors={[C.primary, '#4ADE80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={st.recommendGrad}
              >
                <Ionicons name="sparkles" size={20} color={C.white} />
                <Text style={st.recommendText}>Join Recommended Pool</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 120 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: 28, fontWeight: "800", color: C.textPrimary, letterSpacing: -0.5 },

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
  tabActive: { backgroundColor: C.bgElevated },
  tabText: { fontSize: 14, fontWeight: "600", color: C.textMuted },
  tabTextActive: { color: C.textPrimary },

  // Pot card
  potCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.15)',
  },
  potGrad: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  potLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  potRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  potAmount: { fontSize: 42, fontWeight: '800', color: C.primary },
  potSol: { fontSize: 18, fontWeight: '600', color: C.textMuted },
  potSub: { fontSize: 13, color: C.textSecondary, marginTop: 4 },

  // Podium
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: 10,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  podiumFirst: {
    paddingVertical: Spacing.lg,
    borderColor: 'rgba(255,140,0,0.3)',
  },
  podiumAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumAvatarFirst: { width: 52, height: 52, borderRadius: 26 },
  podiumAvatarText: { fontSize: 16, fontWeight: '800', color: C.white },
  crownIcon: { fontSize: 16, marginTop: -4, marginBottom: 2 },
  podiumRank: { fontSize: 11, fontWeight: '700', color: C.textMuted },
  podiumName: { fontSize: 11, fontWeight: '600', color: C.textPrimary, marginTop: 2 },
  podiumStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  podiumFlame: { fontSize: 10 },
  podiumStreak: { fontSize: 12, fontWeight: '700', color: C.accent },
  podiumWinnings: { fontSize: 13, fontWeight: '800', color: C.primary, marginTop: 4 },

  // Rank list
  rankList: {
    marginHorizontal: Spacing.xl,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: C.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rankHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  rankNum: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  rankWallet: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarText: { fontSize: 13, fontWeight: '700', color: C.textSecondary },
  rankName: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary },
  statusDotFailed: { backgroundColor: C.danger },
  statusText: { fontSize: 10, fontWeight: '600', color: C.primary },
  rankStreakCol: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  rankFlame: { fontSize: 11 },
  rankStreakText: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  rankWinText: { fontSize: 14, fontWeight: '700', color: C.primary, textAlign: 'right' },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: 10,
    marginBottom: Spacing.xxl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: C.bgSurface,
    borderWidth: 1,
    borderColor: C.border,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: C.primary },

  // Analytics: Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    width: "47%",
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: { fontSize: 12, color: C.textMuted },

  // Heatmap
  gridSection: { marginBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  gridCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: { fontSize: 24, fontWeight: '800', color: C.primary },
  metricUnit: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  riskBar: {
    height: 4,
    backgroundColor: C.bgHover,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  riskFill: { height: 4, borderRadius: 2 },

  // Recommend button
  recommendBtn: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  recommendGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Radius.md,
  },
  recommendText: { fontSize: 16, fontWeight: '700', color: C.white },
});
