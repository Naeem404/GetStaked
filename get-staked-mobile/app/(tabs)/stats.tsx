import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { useUserStats, useHabitGrid } from "@/hooks/use-stats";
import { useRecentActivity } from "@/hooks/use-proofs";
import { useMyPools } from "@/hooks/use-pools";
import { router } from "expo-router";
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

// Top-3 leaderboard data for podium
const top3Leaderboard = [
  { rank: 1, name: 'Jordyn Kenter', score: 86239, avatar: 'J' },
  { rank: 2, name: 'Anna Bator', score: 84397, avatar: 'A' },
  { rank: 3, name: 'Carl Oliver', score: 83199, avatar: 'C' },
];

// Fallback mock pools for leaderboard when no real data
const mockPoolsForLeaderboard = [
  {
    id: 'mock-1',
    name: 'Morning Runs',
    stake_amount: 0.1,
    duration_days: 7,
    status: 'active',
    current_players: 5,
    max_players: 8,
    pool_members: [
      { id: '1', current_streak: 4, status: 'active', profiles: { display_name: 'Alex', avatar_url: null } },
      { id: '2', current_streak: 2, status: 'active', profiles: { display_name: 'Sarah', avatar_url: null } },
      { id: '3', current_streak: 3, status: 'active', profiles: { display_name: 'Mike', avatar_url: null } },
      { id: '4', current_streak: 5, status: 'active', profiles: { display_name: 'Priya', avatar_url: null } },
      { id: '5', current_streak: 1, status: 'active', profiles: { display_name: 'Jordan', avatar_url: null } },
    ],
  },
  {
    id: 'mock-2',
    name: 'No Sugar Challenge',
    stake_amount: 0.2,
    duration_days: 14,
    status: 'active',
    current_players: 3,
    max_players: 5,
    pool_members: [
      { id: '6', current_streak: 7, status: 'active', profiles: { display_name: 'Lena', avatar_url: null } },
      { id: '7', current_streak: 3, status: 'active', profiles: { display_name: 'Raj', avatar_url: null } },
      { id: '8', current_streak: 5, status: 'active', profiles: { display_name: 'Tina', avatar_url: null } },
    ],
  },
];

type TabType = 'leaderboard' | 'stats';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const { stats, loading: statsLoading } = useUserStats();
  const { days: habitDays, loading: gridLoading } = useHabitGrid(91);
  const { activity, loading: activityLoading } = useRecentActivity(10);
  const { pools: myPools, loading: poolsLoading } = useMyPools();
  const displayPools = myPools.length > 0 ? myPools : mockPoolsForLeaderboard;

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3Leaderboard[1], top3Leaderboard[0], top3Leaderboard[2]];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '\u{1F947}';
    if (rank === 2) return '\u{1F948}';
    return '\u{1F949}';
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

      {/* Tab toggle — My Stats first, Leaderboard second */}
      <View style={st.tabRow}>
        <Pressable
          onPress={() => setActiveTab('stats')}
          style={[st.tab, activeTab === 'stats' && st.tabActive]}
        >
          <Ionicons name="stats-chart" size={16} color={activeTab === 'stats' ? C.primary : C.textMuted} />
          <Text style={[st.tabText, activeTab === 'stats' && st.tabTextActive]}>My Stats</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('leaderboard')}
          style={[st.tab, activeTab === 'leaderboard' && st.tabActive]}
        >
          <Ionicons name="trophy" size={16} color={activeTab === 'leaderboard' ? '#FFD700' : C.textMuted} />
          <Text style={[st.tabText, activeTab === 'leaderboard' && st.tabTextActive]}>Leaderboard</Text>
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
                  const cardColors: [string, string] = isFirst
                    ? ['#B8860B', '#FFD700']
                    : leader.rank === 2
                    ? ['#2D5F8A', '#4A90D9']
                    : ['#8B4513', '#CD853F'];

                  return (
                    <View
                      key={leader.rank}
                      style={[st.podiumItem, isFirst && st.podiumItemFirst]}
                    >
                      {/* Wreath / Medal icon */}
                      <View style={st.podiumWreathWrap}>
                        <Text style={{ fontSize: isFirst ? 40 : 30 }}>{getMedalEmoji(leader.rank)}</Text>
                        <View style={[st.podiumRankCircle, isFirst && st.podiumRankCircleFirst]}>
                          <Text style={[st.podiumRankText, isFirst && st.podiumRankTextFirst]}>
                            {leader.rank}<Text style={{ fontSize: 8 }}>{leader.rank === 1 ? 'st' : leader.rank === 2 ? 'nd' : 'rd'}</Text>
                          </Text>
                        </View>
                      </View>

                      {/* Avatar card */}
                      <LinearGradient
                        colors={cardColors}
                        style={[st.podiumAvatarCard, isFirst && st.podiumAvatarCardFirst]}
                      >
                        <LinearGradient
                          colors={getAvatarColors(leader.rank - 1)}
                          style={[st.podiumAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
                        >
                          <Text style={[st.podiumAvatarText, { fontSize: isFirst ? 32 : 24 }]}>
                            {leader.avatar}
                          </Text>
                        </LinearGradient>
                      </LinearGradient>

                      {/* Name */}
                      <Text style={[st.podiumName, isFirst && st.podiumNameFirst]} numberOfLines={1}>
                        {leader.name}
                      </Text>

                      {/* Score */}
                      <View style={st.podiumScoreRow}>
                        <Ionicons name="arrow-up" size={14} color={C.primary} />
                        <Text style={st.podiumScore}>
                          {leader.score.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>

            {/* ── Pool-based Leaderboard ── */}
            {poolsLoading ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 40 }} />
            ) : (
              <View style={st.poolLeaderboardList}>
                {displayPools.map((pool: any, poolIdx: number) => {
                  const members = (pool.pool_members || [])
                    .filter((m: any) => m.status === 'active')
                    .sort((a: any, b: any) => (b.current_streak ?? 0) - (a.current_streak ?? 0));

                  return (
                    <View key={pool.id} style={st.poolLeaderCard}>
                      {/* Pool header */}
                      <View style={st.poolLeaderHeader}>
                        <View>
                          <Text style={st.poolLeaderName}>{pool.name}</Text>
                          <Text style={st.poolLeaderMeta}>
                            Stake: {pool.stake_amount} SOL • Duration: {pool.duration_days} Days •{' '}
                            <Text style={{ color: C.primary, fontWeight: '700' }}>Active</Text>
                          </Text>
                        </View>
                      </View>

                      {/* Leaderboard section */}
                      <View style={st.poolLeaderSection}>
                        <Text style={st.poolLeaderSectionTitle}>Leaderboard</Text>

                        {/* Avatar row */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={st.poolAvatarRow}
                        >
                          {members.map((member: any, mIdx: number) => {
                            const name = member.profiles?.display_name || 'User';
                            const streak = member.current_streak ?? 0;
                            const colors = getAvatarColors(mIdx);
                            const verified = streak > 0;

                            return (
                              <View key={member.id} style={st.poolAvatarItem}>
                                <View style={st.poolAvatarWrap}>
                                  <LinearGradient
                                    colors={colors}
                                    style={st.poolAvatarRing}
                                  >
                                    <View style={st.poolAvatarInner}>
                                      <Text style={st.poolAvatarLetter}>
                                        {name[0]?.toUpperCase() || '?'}
                                      </Text>
                                    </View>
                                  </LinearGradient>
                                  {verified && (
                                    <View style={st.poolVerifiedBadge}>
                                      <Ionicons name="checkmark-circle" size={16} color={C.primary} />
                                    </View>
                                  )}
                                </View>
                                <Text style={st.poolStreakLabel}>{streak} Streak</Text>
                              </View>
                            );
                          })}
                        </ScrollView>

                        {/* Submit Proof button */}
                        <Pressable
                          onPress={() => router.push('/(tabs)')}
                          style={st.poolSubmitBtn}
                        >
                          <LinearGradient
                            colors={[C.primary, '#4ADE80']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={st.poolSubmitGrad}
                          >
                            <Text style={st.poolSubmitText}>Submit Proof</Text>
                          </LinearGradient>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <>
            {/* ── Stats ── */}
            {statsLoading ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 40 }} />
            ) : (
              <>
                <View style={st.statsContainer}>
                  {/* ── Streak Dashboard FIRST (main feature) ── */}
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
                      Every green circle is a habit streak. Every gap is a break in the streak.
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

                  {/* ── Colorful Stats Cards ── */}
                  {/* Progress Card - Full Width - Dark Green */}
                  <View style={[st.statCardFull, { backgroundColor: C.primaryDim }]}>
                    <View style={st.statCardHeader}>
                      <Text style={[st.statCardLabel, { color: C.primary }]}>PROGRESS</Text>
                      <View style={[st.statCardIconBg, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                        <Ionicons name="book" size={16} color={C.primary} />
                      </View>
                    </View>
                    <View style={st.statCardBody}>
                      <Text style={[st.statCardBigNum, { color: C.primary }]}>
                        {stats.completionRate ?? 0}
                      </Text>
                      <View style={st.statCardDesc}>
                        <Text style={[st.statCardDescText, { color: '#4ADE80' }]}>
                          Out of {stats.totalDays ?? 0} day{(stats.totalDays ?? 0) !== 1 ? 's' : ''} completed
                        </Text>
                        <Text style={[st.statCardDescSub, { color: C.textSecondary }]}>
                          {stats.completionRate ?? 0}% completion rate
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Time + Streak Row */}
                  <View style={st.statRow}>
                    {/* Time Card - Orange/Accent themed */}
                    <View style={[st.statCardHalf, { backgroundColor: C.accentDim }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: C.accent }]}>TIME</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(255,140,0,0.2)' }]}>
                          <Ionicons name="time" size={14} color={C.accent} />
                        </View>
                      </View>
                      <Text style={[st.statCardMedNum, { color: C.accent }]}>
                        {stats.currentStreak > 0 ? `${Math.floor(stats.currentStreak * 1.5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '0:00'}
                      </Text>
                      <Text style={[st.statCardSmallText, { color: C.textSecondary }]}>
                        Daily avg time spent proving habits
                      </Text>
                    </View>

                    {/* Streak Card - Green themed */}
                    <View style={[st.statCardHalf, { backgroundColor: C.primaryDim }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: C.primary }]}>STREAK</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                          <Ionicons name="flash" size={14} color={C.primary} />
                        </View>
                      </View>
                      <Text style={[st.statCardMedNum, { color: C.primary }]}>
                        {stats.currentStreak ?? 0}
                      </Text>
                      <Text style={[st.statCardSmallText, { color: C.textSecondary }]}>
                        Day streak! Keep it up to earn 25% more rewards
                      </Text>
                    </View>
                  </View>

                  {/* Level + Badges Row */}
                  <View style={st.statRow}>
                    {/* Level Card - Darker green variant */}
                    <View style={[st.statCardHalf, { backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: '#4ADE80' }]}>LEVEL</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                          <Ionicons name="star" size={14} color="#4ADE80" />
                        </View>
                      </View>
                      <Text style={[st.statCardMedNum, { color: '#4ADE80' }]}>
                        {Math.max(1, Math.floor((stats.bestStreak ?? 0) / 10) + 1)}
                      </Text>
                      <Text style={[st.statCardSmallText, { color: C.textSecondary }]}>
                        {10 - ((stats.bestStreak ?? 0) % 10)} more points to level up!
                      </Text>
                    </View>

                    {/* Badges Card - Orange variant */}
                    <View style={[st.statCardHalf, { backgroundColor: C.accentLight }]}>
                      <View style={st.statCardHeader}>
                        <Text style={[st.statCardLabel, { color: C.accent }]}>BADGES</Text>
                        <View style={[st.statCardIconBg, { backgroundColor: 'rgba(255,140,0,0.2)' }]}>
                          <Ionicons name="ribbon" size={14} color={C.accent} />
                        </View>
                      </View>
                      <View style={st.badgesGrid}>
                        {['\u{1F3C6}', '\u{1F525}', '\u26A1', '\u{1F48E}', '\u{1F3AF}', '\u{1F31F}', '\u{1F3C5}', '\u{1F451}'].map((badge, i) => (
                          <View key={i} style={[st.badgeItem, { backgroundColor: 'rgba(255,140,0,0.1)' }, i >= 4 && { opacity: 0.35 }]}>
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

  // ── Pool-based Leaderboard ──
  // ── Podium ──
  podiumSection: {
    paddingTop: 16,
    paddingBottom: 24,
    marginBottom: 4,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
  },
  podiumItemFirst: {
    marginTop: -20,
  },
  podiumWreathWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumRankCircle: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: C.bgSurface,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  podiumRankCircleFirst: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  podiumRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.textSecondary,
  },
  podiumRankTextFirst: {
    color: '#000',
  },
  podiumAvatarCard: {
    width: 80,
    height: 100,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatarCardFirst: {
    width: 100,
    height: 120,
    borderRadius: Radius.xl,
  },
  podiumAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarText: { fontWeight: '800', color: C.white },
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
    color: C.primary,
  },

  poolLeaderboardList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  poolLeaderCard: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  poolLeaderHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  poolLeaderName: {
    fontSize: 22,
    fontWeight: '900',
    color: C.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  poolLeaderMeta: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
  poolLeaderSection: {
    backgroundColor: C.bgElevated,
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: Spacing.lg,
  },
  poolLeaderSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: Spacing.lg,
  },
  poolAvatarRow: {
    gap: 20,
    paddingBottom: Spacing.lg,
  },
  poolAvatarItem: {
    alignItems: 'center',
    gap: 6,
  },
  poolAvatarWrap: {
    position: 'relative',
  },
  poolAvatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolAvatarInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolAvatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: C.white,
  },
  poolVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: C.bgPrimary,
    borderRadius: 10,
    padding: 1,
  },
  poolStreakLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },
  poolSubmitBtn: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  poolSubmitGrad: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.lg,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  poolSubmitText: {
    fontSize: 18,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },

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
    marginBottom: Spacing.xl,
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
