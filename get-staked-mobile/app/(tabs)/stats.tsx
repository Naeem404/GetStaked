import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { useUserStats, useHabitGrid } from "@/hooks/use-stats";
import { useRecentActivity } from "@/hooks/use-proofs";

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function getActivityEmoji(action: string): string {
  if (action.includes('verified') || action.includes('proof')) return '✅';
  if (action.includes('failed') || action.includes('missed')) return '❌';
  if (action.includes('joined')) return '🤝';
  if (action.includes('created')) return '🎯';
  if (action.includes('won')) return '🏆';
  return '📋';
}

export default function StatsScreen() {
  const { stats, loading: statsLoading } = useUserStats();
  const { days: habitDays, loading: gridLoading } = useHabitGrid(91);
  const { activity, loading: activityLoading } = useRecentActivity(10);

  const statCards = [
    { label: "Current Streak", value: String(stats.currentStreak), icon: "flame" as const, color: C.brandFire },
    { label: "Best Streak", value: String(stats.bestStreak), icon: "trophy" as const, color: C.brandGold },
    { label: "Total Days", value: String(stats.totalDays), icon: "calendar" as const, color: C.info },
    { label: "Completion", value: `${stats.completionRate}%`, icon: "checkmark-circle" as const, color: C.success },
  ];

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Header */}
        <Text style={st.title}>Your Stats</Text>

        {/* Stats Grid */}
        {statsLoading ? (
          <ActivityIndicator color={C.brandFire} style={{ marginVertical: 20 }} />
        ) : (
          <View style={st.statsGrid}>
            {statCards.map((stat) => (
              <View key={stat.label} style={st.statCard}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={[st.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={st.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Full Habit Grid */}
        <View style={st.gridSection}>
          <Text style={st.sectionTitle}>Activity</Text>
          <View style={st.gridCard}>
            {gridLoading ? (
              <ActivityIndicator color={C.brandFire} />
            ) : (
              <>
                <HabitGrid variant="full" data={habitDays} />
                <HabitGridLegend />
              </>
            )}
          </View>
        </View>

        {/* Insights */}
        <View style={st.insightSection}>
          <Text style={st.sectionTitle}>Insight</Text>
          <View style={st.insightCard}>
            <View style={st.insightIcon}>
              <Ionicons name="bulb" size={20} color={C.brandGold} />
            </View>
            <Text style={st.insightText}>
              {stats.winRate > 70
                ? `Strong win rate at ${stats.winRate}%! You're earning ${stats.totalSolEarned.toFixed(2)} SOL total.`
                : stats.currentStreak > 0
                ? `You're on a ${stats.currentStreak}-day streak. Keep it going to maximize your winnings!`
                : 'Start a streak by submitting your first proof today!'}
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={st.activitySection}>
          <Text style={st.sectionTitle}>Recent</Text>
          {activityLoading ? (
            <ActivityIndicator color={C.brandFire} />
          ) : activity.length === 0 ? (
            <Text style={st.noActivity}>No activity yet. Join a pool to get started!</Text>
          ) : (
            activity.map((item) => (
              <View key={item.id} style={st.activityRow}>
                <Text style={st.activityEmoji}>{getActivityEmoji(item.action)}</Text>
                <View style={st.activityInfo}>
                  <Text style={st.activityAction}>{item.description || item.action}</Text>
                  <Text style={st.activityDate}>{formatTimeAgo(item.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 100 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: C.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },

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
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: Fonts.mono,
  },
  statLabel: { fontSize: 12, color: C.textMuted },

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

  insightSection: { marginBottom: Spacing.xxl },
  insightCard: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.goldDim,
    alignItems: "center",
    justifyContent: "center",
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 20,
  },

  activitySection: { paddingHorizontal: Spacing.xl },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  activityEmoji: { fontSize: 18 },
  activityInfo: { flex: 1 },
  activityAction: { fontSize: 13, color: C.textPrimary },
  activityDate: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  noActivity: { fontSize: 14, color: C.textMuted, textAlign: "center", paddingVertical: 16, paddingHorizontal: Spacing.xl },
});
