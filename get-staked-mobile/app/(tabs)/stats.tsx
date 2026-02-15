import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { HabitGrid, HabitGridLegend } from "@/components/habit-grid";
import { useUserStats, useHabitGrid } from "@/hooks/use-stats";
import { useRecentActivity } from "@/hooks/use-proofs";
import { useMyPools } from "@/hooks/use-pools";
import { useGlobalLeaderboard, LeaderboardEntry } from "@/hooks/use-leaderboard";
import { useAuth } from "@/lib/auth-context";
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

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

type TabType = 'leaderboard' | 'stats';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useUserStats();
  const { days: habitDays, loading: gridLoading } = useHabitGrid(91);
  const { activity, loading: activityLoading } = useRecentActivity(10);
  const { pools: myPools, loading: poolsLoading } = useMyPools();
  const { entries: leaderboard, myRank, loading: lbLoading } = useGlobalLeaderboard(50);

  const getAvatarColors = (index: number): [string, string] => {
    const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return [c[0], c[1]];
  };

  const renderLeaderboardRow = (entry: LeaderboardEntry, idx: number) => {
    const isMe = entry.user_id === user?.id;
    const colors = getAvatarColors(idx);
    const name = entry.display_name || 'Anonymous';
    const rankNum = entry.rank || idx + 1;

    return (
      <View key={entry.user_id} style={[lb.row, isMe && lb.rowMe]}>
        {/* Rank */}
        <View style={lb.rankWrap}>
          {rankNum <= 3 ? (
            <Text style={lb.medal}>{RANK_MEDALS[rankNum - 1]}</Text>
          ) : (
            <Text style={lb.rankNum}>#{rankNum}</Text>
          )}
        </View>

        {/* Avatar */}
        <LinearGradient colors={colors as [string, string]} style={lb.avatar}>
          <Text style={lb.avatarText}>{name[0]?.toUpperCase() || '?'}</Text>
        </LinearGradient>

        {/* Info */}
        <View style={lb.info}>
          <Text style={[lb.name, isMe && { color: C.primary }]}>
            {name} {isMe ? '(You)' : ''}
          </Text>
          <View style={lb.metaRow}>
            {entry.current_streak > 0 && (
              <View style={lb.metaItem}>
                <Text style={lb.fireIcon}>🔥</Text>
                <Text style={lb.metaText}>{entry.current_streak}d</Text>
              </View>
            )}
            <View style={lb.metaItem}>
              <Ionicons name="trophy-outline" size={10} color={C.textMuted} />
              <Text style={lb.metaText}>{entry.total_pools_won}W</Text>
            </View>
            {entry.total_sol_earned > 0 && (
              <View style={lb.metaItem}>
                <Text style={[lb.metaText, { color: C.primary }]}>
                  +{entry.total_sol_earned.toFixed(1)} SOL
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Streak badge */}
        <View style={[lb.streakBadge, rankNum <= 3 && lb.streakBadgeTop]}>
          <Text style={lb.streakIcon}>🔥</Text>
          <Text style={[lb.streakValue, rankNum <= 3 && { color: C.primary }]}>
            {entry.current_streak}
          </Text>
        </View>
      </View>
    );
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
            {lbLoading ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 40 }} />
            ) : leaderboard.length === 0 ? (
              <View style={st.emptyLeaderboard}>
                <Ionicons name="trophy-outline" size={48} color={C.textMuted} />
                <Text style={st.emptyLeaderTitle}>No Rankings Yet</Text>
                <Text style={st.emptyLeaderSub}>
                  Join a pool and submit proofs to climb the leaderboard!
                </Text>
                <Pressable style={st.emptyLeaderBtn} onPress={() => router.push('/(tabs)/pools')}>
                  <Text style={st.emptyLeaderBtnText}>Browse Pools</Text>
                </Pressable>
              </View>
            ) : (
              <View style={lb.container}>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <View style={lb.podium}>
                    {/* 2nd place */}
                    <View style={lb.podiumItem}>
                      <LinearGradient
                        colors={getAvatarColors(1)}
                        style={[lb.podiumAvatar, lb.podiumAvatar2nd]}
                      >
                        <Text style={lb.podiumAvatarText}>
                          {(leaderboard[1]?.display_name || '?')[0]?.toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <Text style={lb.podiumMedal}>🥈</Text>
                      <Text style={lb.podiumName} numberOfLines={1}>
                        {leaderboard[1]?.display_name || 'User'}
                      </Text>
                      <Text style={lb.podiumStreak}>
                        🔥 {leaderboard[1]?.current_streak ?? 0}
                      </Text>
                    </View>

                    {/* 1st place */}
                    <View style={[lb.podiumItem, lb.podiumItemFirst]}>
                      <View style={lb.crownWrap}>
                        <Text style={lb.crownEmoji}>👑</Text>
                      </View>
                      <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={[lb.podiumAvatar, lb.podiumAvatar1st]}
                      >
                        <Text style={[lb.podiumAvatarText, { fontSize: 24 }]}>
                          {(leaderboard[0]?.display_name || '?')[0]?.toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <Text style={lb.podiumMedal}>🥇</Text>
                      <Text style={[lb.podiumName, { color: '#FFD700' }]} numberOfLines={1}>
                        {leaderboard[0]?.display_name || 'User'}
                      </Text>
                      <Text style={lb.podiumStreak}>
                        🔥 {leaderboard[0]?.current_streak ?? 0}
                      </Text>
                    </View>

                    {/* 3rd place */}
                    <View style={lb.podiumItem}>
                      <LinearGradient
                        colors={getAvatarColors(2)}
                        style={[lb.podiumAvatar, lb.podiumAvatar3rd]}
                      >
                        <Text style={lb.podiumAvatarText}>
                          {(leaderboard[2]?.display_name || '?')[0]?.toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <Text style={lb.podiumMedal}>🥉</Text>
                      <Text style={lb.podiumName} numberOfLines={1}>
                        {leaderboard[2]?.display_name || 'User'}
                      </Text>
                      <Text style={lb.podiumStreak}>
                        🔥 {leaderboard[2]?.current_streak ?? 0}
                      </Text>
                    </View>
                  </View>
                )}

                {/* My rank card (if not in top list) */}
                {myRank && myRank.rank > 3 && (
                  <View style={lb.myRankCard}>
                    <Text style={lb.myRankLabel}>YOUR RANK</Text>
                    {renderLeaderboardRow(myRank, (myRank.rank || 1) - 1)}
                  </View>
                )}

                {/* Full list */}
                <View style={lb.listCard}>
                  <Text style={lb.listTitle}>GLOBAL RANKINGS</Text>
                  {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((entry, idx) =>
                    renderLeaderboardRow(entry, idx + (leaderboard.length >= 3 ? 3 : 0))
                  )}

                  {/* Show top 3 in list too if less than 3 entries */}
                  {leaderboard.length < 3 && leaderboard.map((entry, idx) =>
                    renderLeaderboardRow(entry, idx)
                  )}
                </View>

                {/* Pool leaderboards for pools user is in */}
                {myPools.length > 0 && (
                  <>
                    <Text style={lb.poolSectionHeader}>YOUR POOLS</Text>
                    {myPools.map((pool: any) => {
                      const members = (pool.pool_members || [])
                        .filter((m: any) => m.status === 'active')
                        .sort((a: any, b: any) => (b.current_streak ?? 0) - (a.current_streak ?? 0));

                      return (
                        <Pressable
                          key={pool.id}
                          style={lb.poolCard}
                          onPress={() => router.push({ pathname: '/pool-detail', params: { id: pool.id } })}
                        >
                          <View style={lb.poolHeader}>
                            <Text style={lb.poolEmoji}>{pool.emoji || '🎯'}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={lb.poolName}>{pool.name}</Text>
                              <Text style={lb.poolMeta}>
                                {pool.stake_amount} SOL • {pool.duration_days}d • {members.length} members
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                          </View>

                          {/* Top 3 avatars */}
                          <View style={lb.poolAvatarRow}>
                            {members.slice(0, 5).map((member: any, mIdx: number) => {
                              const mName = member.profiles?.display_name || 'User';
                              const colors = getAvatarColors(mIdx);
                              const isMe = member.user_id === user?.id;

                              return (
                                <View key={member.id} style={lb.poolAvatarItem}>
                                  <LinearGradient
                                    colors={colors as [string, string]}
                                    style={[lb.poolMiniAvatar, isMe && lb.poolMiniAvatarMe]}
                                  >
                                    <Text style={lb.poolMiniAvatarText}>
                                      {mName[0]?.toUpperCase() || '?'}
                                    </Text>
                                  </LinearGradient>
                                  <Text style={lb.poolMiniStreak}>
                                    🔥{member.current_streak ?? 0}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        </Pressable>
                      );
                    })}
                  </>
                )}
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

const lb = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg },
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingVertical: Spacing.xl, gap: Spacing.md, marginBottom: Spacing.lg,
  },
  podiumItem: { alignItems: 'center', flex: 1, gap: 4 },
  podiumItemFirst: { marginBottom: 16 },
  podiumAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  podiumAvatar1st: { width: 68, height: 68, borderRadius: 34 },
  podiumAvatar2nd: { width: 52, height: 52, borderRadius: 26 },
  podiumAvatar3rd: { width: 48, height: 48, borderRadius: 24 },
  podiumAvatarText: { fontSize: 20, fontWeight: '800', color: C.white },
  podiumMedal: { fontSize: 18 },
  podiumName: { fontSize: 12, fontWeight: '700', color: C.textPrimary, textAlign: 'center', maxWidth: 80 },
  podiumStreak: { fontSize: 11, color: C.accent, fontWeight: '600' },
  crownWrap: { position: 'absolute', top: -18, zIndex: 10 },
  crownEmoji: { fontSize: 20 },
  myRankCard: {
    backgroundColor: C.primaryDim, borderRadius: Radius.xl, padding: Spacing.md,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)',
  },
  myRankLabel: { fontSize: 10, fontWeight: '800', color: C.primary, letterSpacing: 1, marginBottom: 6, marginLeft: 4 },
  listCard: {
    backgroundColor: C.bgSurface, borderRadius: Radius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: C.border, marginBottom: Spacing.lg,
  },
  listTitle: { fontSize: 11, fontWeight: '800', color: C.textMuted, letterSpacing: 1, marginBottom: Spacing.md, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: Radius.md, marginBottom: 4 },
  rowMe: { backgroundColor: C.primaryDim },
  rankWrap: { width: 32, alignItems: 'center' },
  medal: { fontSize: 18 },
  rankNum: { fontSize: 13, fontWeight: '700', color: C.textMuted },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 14, fontWeight: '800', color: C.white },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  fireIcon: { fontSize: 10 },
  metaText: { fontSize: 11, color: C.textMuted, fontWeight: '500' },
  streakBadge: {
    backgroundColor: C.bgElevated, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full, flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  streakBadgeTop: { backgroundColor: C.primaryDim },
  streakIcon: { fontSize: 10 },
  streakValue: { fontSize: 12, fontWeight: '800', color: C.textPrimary },
  poolSectionHeader: { fontSize: 11, fontWeight: '800', color: C.textMuted, letterSpacing: 1, marginBottom: Spacing.md, marginLeft: 4 },
  poolCard: {
    backgroundColor: C.bgSurface, borderRadius: Radius.xl, borderWidth: 1,
    borderColor: C.border, padding: Spacing.lg, marginBottom: Spacing.md,
  },
  poolHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  poolEmoji: { fontSize: 28 },
  poolName: { fontSize: 16, fontWeight: '800', color: C.textPrimary },
  poolMeta: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  poolAvatarRow: { flexDirection: 'row', gap: 12 },
  poolAvatarItem: { alignItems: 'center', gap: 4 },
  poolMiniAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  poolMiniAvatarMe: { borderWidth: 2, borderColor: C.primary },
  poolMiniAvatarText: { fontSize: 14, fontWeight: '800', color: C.white },
  poolMiniStreak: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
});

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

  // Empty leaderboard
  emptyLeaderboard: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  emptyLeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textPrimary,
  },
  emptyLeaderSub: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
  },
  emptyLeaderBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary,
  },
  emptyLeaderBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
  },
});
