import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { useUserStats, useHabitGrid } from "@/hooks/use-stats";
import { useRecentActivity } from "@/hooks/use-proofs";
import { useState } from "react";

const { width: SCREEN_W } = Dimensions.get("window");

const AVATAR_COLORS = [
  ['#FF6B6B', '#EE5A24'],
  ['#A55EEA', '#8854D0'],
  ['#45AAF2', '#2D98DA'],
  ['#26DE81', '#20BF6B'],
  ['#FD9644', '#F7B731'],
  ['#FC5C65', '#EB3B5A'],
  ['#4B7BEC', '#3867D6'],
  ['#2BCBBA', '#0FB9B1'],
  ['#D980FA', '#BE2EDD'],
];

const leaderboardData = [
  { rank: 1, name: "Jordyn Kenter", score: 96239, avatar: "J" },
  { rank: 2, name: "Anna Bator", score: 84397, avatar: "A" },
  { rank: 3, name: "Carl Oliver", score: 83199, avatar: "C" },
  { rank: 4, name: "Davis Curtis", score: 80007, avatar: "D" },
  { rank: 5, name: "Nisna Ohad", score: 70120, avatar: "N" },
  { rank: 6, name: "Makaena George", score: 71087, avatar: "M" },
  { rank: 7, name: "Kenna Bettta", score: 69439, avatar: "K" },
  { rank: 8, name: "Marth Culep", score: 66800, avatar: "R" },
  { rank: 9, name: "Zein Das", score: 56909, avatar: "Z" },
];

type TabType = 'leaderboard' | 'stats';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const { stats, loading: statsLoading } = useUserStats();
  const { days: habitDays, loading: gridLoading } = useHabitGrid(91);
  const { activity, loading: activityLoading } = useRecentActivity(10);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [leaderboardData[1], leaderboardData[0], leaderboardData[2]];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    return '🥉';
  };

  const getAvatarColors = (index: number): [string, string] => {
    const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return [c[0], c[1]];
  };

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>
          {activeTab === 'leaderboard' ? 'Leaderboard' : 'Your Stats'}
        </Text>
        <Pressable style={st.headerMenuBtn}>
          <Ionicons name="menu" size={24} color={C.textSecondary} />
        </Pressable>
      </View>

      {/* Tab toggle */}
      <View style={st.tabRow}>
        <Pressable
          onPress={() => setActiveTab('leaderboard')}
          style={[st.tab, activeTab === 'leaderboard' && st.tabActive]}
        >
          <Ionicons name="trophy" size={16} color={activeTab === 'leaderboard' ? '#FFD700' : C.textMuted} />
          <Text style={[st.tabText, activeTab === 'leaderboard' && st.tabTextActive]}>Leaderboard</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('stats')}
          style={[st.tab, activeTab === 'stats' && st.tabActive]}
        >
          <Ionicons name="stats-chart" size={16} color={activeTab === 'stats' ? C.primary : C.textMuted} />
          <Text style={[st.tabText, activeTab === 'stats' && st.tabTextActive]}>My Stats</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {activeTab === 'leaderboard' ? (
          <>
            {/* ── Top 3 Podium ── */}
            <LinearGradient
              colors={['#1A1035', '#0D0B1A', '#0A0A0A']}
              style={st.podiumSection}
            >
              <View style={st.podiumRow}>
                {podiumOrder.map((leader, i) => {
                  const isFirst = leader.rank === 1;
                  const avatarSize = isFirst ? 80 : 60;
                  const medalSize = isFirst ? 28 : 22;

                  return (
                    <View
                      key={leader.rank}
                      style={[st.podiumItem, isFirst && st.podiumItemFirst]}
                    >
                      {/* Avatar with gradient border */}
                      <View style={[
                        st.avatarRing,
                        {
                          width: avatarSize + 8,
                          height: avatarSize + 8,
                          borderRadius: (avatarSize + 8) / 2,
                          borderColor: isFirst ? '#FFD700' : leader.rank === 2 ? '#C0C0C0' : '#CD7F32',
                        },
                      ]}>
                        <LinearGradient
                          colors={getAvatarColors(leader.rank - 1)}
                          style={[
                            st.podiumAvatar,
                            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                          ]}
                        >
                          <Text style={[st.podiumAvatarText, { fontSize: isFirst ? 28 : 22 }]}>
                            {leader.avatar}
                          </Text>
                        </LinearGradient>
                        {/* Medal badge */}
                        <View style={[st.medalBadge, { width: medalSize, height: medalSize, borderRadius: medalSize / 2 }]}>
                          <Text style={{ fontSize: isFirst ? 16 : 12 }}>{getMedalEmoji(leader.rank)}</Text>
                        </View>
                      </View>

                      {/* Name */}
                      <Text style={[st.podiumName, isFirst && st.podiumNameFirst]} numberOfLines={1}>
                        {leader.name}
                      </Text>

                      {/* Score */}
                      <View style={st.podiumScoreRow}>
                        <Ionicons name="flame" size={14} color="#FFD700" />
                        <Text style={st.podiumScore}>
                          {leader.score.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>

            {/* ── Rankings List ── */}
            <View style={st.rankList}>
              {leaderboardData.slice(3).map((leader, idx) => (
                <View key={leader.rank} style={st.rankRow}>
                  {/* Avatar */}
                  <LinearGradient
                    colors={getAvatarColors(leader.rank - 1)}
                    style={st.rankAvatar}
                  >
                    <Text style={st.rankAvatarText}>{leader.avatar}</Text>
                  </LinearGradient>

                  {/* Name + Score */}
                  <View style={st.rankInfo}>
                    <Text style={st.rankName}>{leader.name}</Text>
                    <View style={st.rankScoreRow}>
                      <Ionicons name="flame" size={12} color="#FFD700" />
                      <Text style={st.rankScoreText}>
                        {leader.score.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Rank badge */}
                  <View style={st.rankBadge}>
                    <Text style={st.rankBadgeText}>{leader.rank}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* ── Stats: Colorful Cards Grid ── */}
            {statsLoading ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 40 }} />
            ) : (
              <>
                {/* Progress Card - Full Width - Yellow */}
                <View style={st.statsContainer}>
                  <View style={[st.statCardFull, { backgroundColor: '#FFF3CD' }]}>
                    <View style={st.statCardHeader}>
                      <Text style={[st.statCardLabel, { color: '#856404' }]}>PROGRESS</Text>
                      <View style={[st.statCardIconBg, { backgroundColor: 'rgba(133,100,4,0.15)' }]}>
                        <Ionicons name="book" size={16} color="#856404" />
                      </View>
                    </View>
                    <View style={st.statCardBody}>
                      <Text style={[st.statCardBigNum, { color: '#856404' }]}>
                        {stats.completionRate ?? 0}
                      </Text>
                      <View style={st.statCardDesc}>
                        <Text style={[st.statCardDescText, { color: '#997A00' }]}>
                          Out of {stats.totalDays ?? 0} day{(stats.totalDays ?? 0) !== 1 ? 's' : ''} completed
                        </Text>
                        <Text style={[st.statCardDescSub, { color: '#B8960F' }]}>
                          {stats.completionRate ?? 0}% completion rate
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Time + Stream Row */}
                  <View style={st.statRow}>
                    {/* Time Card - Orange */}
                    <View style={[st.statCardHalf, { backgroundColor: '#FFE0CC' }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: '#CC5500' }]}>TIME</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(204,85,0,0.15)' }]}>
                          <Ionicons name="time" size={14} color="#CC5500" />
                        </View>
                      </View>
                      <Text style={[st.statCardMedNum, { color: '#CC5500' }]}>
                        {stats.currentStreak > 0 ? `${Math.floor(stats.currentStreak * 1.5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '0:00'}
                      </Text>
                      <Text style={[st.statCardSmallText, { color: '#E06600' }]}>
                        Daily avg time spent proving habits
                      </Text>
                    </View>

                    {/* Stream Card - Green */}
                    <View style={[st.statCardHalf, { backgroundColor: '#D4EDDA' }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: '#155724' }]}>STREAK</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(21,87,36,0.15)' }]}>
                          <Ionicons name="flash" size={14} color="#155724" />
                        </View>
                      </View>
                      <Text style={[st.statCardMedNum, { color: '#155724' }]}>
                        {stats.currentStreak ?? 0}
                      </Text>
                      <Text style={[st.statCardSmallText, { color: '#1E7E34' }]}>
                        Day streak! Keep it up to earn 25% more rewards
                      </Text>
                    </View>
                  </View>

                  {/* Level + Badges Row */}
                  <View style={st.statRow}>
                    {/* Level Card - Purple */}
                    <View style={[st.statCardHalf, { backgroundColor: '#E8D5F5' }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: '#6F42C1' }]}>LEVEL</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(111,66,193,0.15)' }]}>
                          <Ionicons name="star" size={14} color="#6F42C1" />
                        </View>
                      </View>
                      <Text style={[st.statCardMedNum, { color: '#6F42C1' }]}>
                        {Math.max(1, Math.floor((stats.bestStreak ?? 0) / 10) + 1)}
                      </Text>
                      <Text style={[st.statCardSmallText, { color: '#7E57C2' }]}>
                        {10 - ((stats.bestStreak ?? 0) % 10)} more points to level up!
                      </Text>
                    </View>

                    {/* Badges Card - Blue */}
                    <View style={[st.statCardHalf, { backgroundColor: '#D1ECF1' }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: '#0C5460' }]}>BADGES</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(12,84,96,0.15)' }]}>
                          <Ionicons name="ribbon" size={14} color="#0C5460" />
                        </View>
                      </View>
                      <View style={st.badgesGrid}>
                        {['🏆', '🔥', '⚡', '💎', '🎯', '🌟', '🏅', '👑'].map((badge, i) => (
                          <View key={i} style={[st.badgeItem, i >= 4 && { opacity: 0.35 }]}>
                            <Text style={st.badgeEmoji}>{badge}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Add More Button */}
                  <Pressable style={st.addMoreBtn}>
                    <Ionicons name="add" size={18} color={C.textSecondary} />
                    <Text style={st.addMoreText}>Add more</Text>
                  </Pressable>

                  {/* ── Streak Dashboard (Reference Image 2) ── */}
                  <View style={st.streakDashboard}>
                    {/* STREAK DASHBOARD badge */}
                    <View style={st.streakBadgeRow}>
                      <View style={st.streakBadge}>
                        <Text style={st.streakBadgeText}>STREAK DASHBOARD</Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={st.streakTitle}>Visualize your discipline</Text>
                    <Text style={st.streakSubtitle}>
                      Every green square is money earned. Every gap is money lost.
                    </Text>

                    {/* Stats row */}
                    <View style={st.streakStatsCard}>
                      <View style={st.streakStatsRow}>
                        <View style={st.streakStatItem}>
                          <View style={st.streakStatIconWrap}>
                            <Ionicons name="flame" size={16} color={C.primary} />
                          </View>
                          <Text style={st.streakStatLabel}>CURRENT STREAK</Text>
                          <Text style={st.streakStatValue}>{stats.currentStreak ?? 0} days</Text>
                        </View>
                        <View style={st.streakStatItem}>
                          <View style={st.streakStatIconWrap}>
                            <Ionicons name="calendar" size={16} color={C.primary} />
                          </View>
                          <Text style={st.streakStatLabel}>TOTAL DAYS</Text>
                          <Text style={st.streakStatValue}>
                            {stats.totalDays ?? 0}/91
                          </Text>
                        </View>
                        <View style={st.streakStatItem}>
                          <View style={st.streakStatIconWrap}>
                            <Ionicons name="trending-up" size={16} color={C.primary} />
                          </View>
                          <Text style={st.streakStatLabel}>COMPLETION</Text>
                          <Text style={st.streakStatValue}>{stats.completionRate ?? 0}%</Text>
                        </View>
                        <View style={st.streakStatItem}>
                          <View style={st.streakStatIconWrap}>
                            <Ionicons name="logo-bitcoin" size={16} color={C.primary} />
                          </View>
                          <Text style={st.streakStatLabel}>EARNINGS</Text>
                          <Text style={[st.streakStatValue, { color: C.primary }]}>
                            +{stats.totalSolEarned?.toFixed(1) ?? '0.0'} SOL
                          </Text>
                        </View>
                      </View>

                      {/* Heatmap grid */}
                      <View style={st.heatmapContainer}>
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
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 120 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: 26, fontWeight: "800", color: C.textPrimary, letterSpacing: -0.5 },
  headerMenuBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.bgSurface,
    alignItems: 'center', justifyContent: 'center',
  },

  // Tab toggle
  tabRow: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
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
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  tabActive: { backgroundColor: C.bgElevated },
  tabText: { fontSize: 14, fontWeight: "600", color: C.textMuted },
  tabTextActive: { color: C.textPrimary },

  // ── Podium Section ──
  podiumSection: {
    paddingTop: 20,
    paddingBottom: 28,
    marginBottom: 4,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 6,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
  },
  podiumItemFirst: {
    marginTop: -16,
  },
  avatarRing: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarText: { fontWeight: '800', color: C.white },
  medalBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: C.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.bgPrimary,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  podiumScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  podiumScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
  },

  // ── Rankings List ──
  rankList: {
    marginHorizontal: Spacing.lg,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  rankAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankAvatarText: { fontSize: 16, fontWeight: '800', color: C.white },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 15, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  rankScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rankScoreText: { fontSize: 13, fontWeight: '700', color: '#FFD700' },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgElevated,
  },
  rankBadgeText: { fontSize: 13, fontWeight: '700', color: C.textSecondary },

  // ── Stats Cards ──
  statsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  statCardFull: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statCardHalf: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statCardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statCardBigNum: {
    fontSize: 48,
    fontWeight: '900',
  },
  statCardDesc: {
    flex: 1,
  },
  statCardDescText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  statCardDescSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statCardMedNum: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 6,
  },
  statCardSmallText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },

  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badgeItem: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(12,84,96,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 14 },

  // Add more
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.xxl,
  },
  addMoreText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },

  // ── Streak Dashboard ──
  streakDashboard: {
    marginTop: Spacing.md,
  },
  streakBadgeRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  streakBadge: {
    backgroundColor: C.primaryDim,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 1,
  },
  streakTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  streakSubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  streakStatsCard: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  streakStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  streakStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  streakStatIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  streakStatLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  streakStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: C.textPrimary,
    textAlign: 'center',
  },
  heatmapContainer: {
    marginTop: 4,
  },
});
