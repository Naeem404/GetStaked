import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";

const stats = [
  { label: "Current Streak", value: "12", icon: "flame" as const, color: C.brandFire },
  { label: "Best Streak", value: "21", icon: "trophy" as const, color: C.brandGold },
  { label: "Total Days", value: "87", icon: "calendar" as const, color: C.info },
  { label: "Completion", value: "91%", icon: "checkmark-circle" as const, color: C.success },
];

const recentActivity = [
  { date: "Today", action: "Morning Run proof submitted", status: "verified", emoji: "✅" },
  { date: "Yesterday", action: "Read 30 Pages verified", status: "verified", emoji: "✅" },
  { date: "2 days ago", action: "Gym Session missed", status: "missed", emoji: "❌" },
  { date: "3 days ago", action: "Morning Run proof submitted", status: "verified", emoji: "✅" },
  { date: "3 days ago", action: "Read 30 Pages verified", status: "verified", emoji: "✅" },
];

export default function StatsScreen() {
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Header */}
        <Text style={st.title}>Your Stats</Text>

        {/* Stats Grid */}
        <View style={st.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={st.statCard}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[st.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={st.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Full Habit Grid */}
        <View style={st.gridSection}>
          <Text style={st.sectionTitle}>Activity</Text>
          <View style={st.gridCard}>
            <HabitGrid variant="full" />
            <HabitGridLegend />
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
              You're most consistent on Tuesdays and Wednesdays. Your weakest day is Sunday — consider adjusting your schedule.
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={st.activitySection}>
          <Text style={st.sectionTitle}>Recent</Text>
          {recentActivity.map((item, i) => (
            <View key={i} style={st.activityRow}>
              <Text style={st.activityEmoji}>{item.emoji}</Text>
              <View style={st.activityInfo}>
                <Text style={st.activityAction}>{item.action}</Text>
                <Text style={st.activityDate}>{item.date}</Text>
              </View>
            </View>
          ))}
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
});
