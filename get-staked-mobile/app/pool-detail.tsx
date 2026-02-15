import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { usePoolDetail, joinPool } from '@/hooks/use-pools';
import { getDemoBalance, stakeDemo } from '@/lib/demo-wallet';

const AVATAR_COLORS = [
  ['#FF6B6B', '#EE5A24'], ['#A55EEA', '#8854D0'], ['#45AAF2', '#2D98DA'],
  ['#26DE81', '#20BF6B'], ['#FD9644', '#F7B731'], ['#FC5C65', '#EB3B5A'],
];

export default function PoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { pool, loading, refetch } = usePoolDetail(id || null);
  const [joining, setJoining] = useState(false);

  const isMember = pool?.my_membership != null;
  const members = (pool?.pool_members || [])
    .filter((m: any) => m.status === 'active')
    .sort((a: any, b: any) => (b.current_streak ?? 0) - (a.current_streak ?? 0));
  const fillPct = pool ? ((pool.current_players ?? 0) / (pool.max_players || 1)) * 100 : 0;

  function handleJoin() {
    if (!user || !pool) return;
    const stakeAmt = pool.stake_amount ?? 0;
    if (stakeAmt > 0) {
      Alert.alert(
        'Stake Required',
        `This pool requires ${stakeAmt} demo SOL.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: `Stake ${stakeAmt} SOL`, onPress: () => executeJoin(stakeAmt) },
        ]
      );
    } else {
      executeJoin(0);
    }
  }

  async function executeJoin(stakeAmt: number) {
    if (!user || !pool) return;
    setJoining(true);
    try {
      let txSignature: string | undefined;

      if (stakeAmt > 0) {
        const result = await stakeDemo(user.id, pool.id, stakeAmt);
        if (!result.success) {
          Alert.alert('Insufficient Balance', result.error || 'Not enough demo SOL.');
          return;
        }
        txSignature = result.txId;
      }

      const { error } = await joinPool(pool.id, user.id, txSignature);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          '\u{1F389} You\'re In!',
          txSignature ? `Staked ${stakeAmt} SOL successfully!` : "You've joined the pool!"
        );
        refetch();
      }
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!pool) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </Pressable>
          <Text style={s.title}>Pool Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </Pressable>
          <Text style={s.title}>Pool Details</Text>
        </View>

        {/* Pool Info Card */}
        <View style={s.card}>
          <View style={s.emojiRow}>
            <Text style={s.emoji}>{pool.emoji || '🎯'}</Text>
            <View style={s.emojiInfo}>
              <Text style={s.poolName}>{pool.name}</Text>
              <Text style={s.poolCategory}>{pool.category || 'General'}</Text>
            </View>
            {pool.status === 'active' && (
              <View style={s.activeBadge}>
                <View style={s.activeDot} />
                <Text style={s.activeText}>Active</Text>
              </View>
            )}
          </View>

          {pool.description && (
            <Text style={s.description}>{pool.description}</Text>
          )}

          {/* Proof requirement */}
          <View style={s.proofReqCard}>
            <Ionicons name="camera-outline" size={18} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.proofReqLabel}>PROOF REQUIRED</Text>
              <Text style={s.proofReqText}>{pool.proof_description || 'Submit daily photo proof'}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statLabel}>STAKE</Text>
              <Text style={s.statValue}>{pool.stake_amount} SOL</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statLabel}>POT</Text>
              <Text style={[s.statValue, { color: C.primary }]}>{pool.pot_size ?? 0} SOL</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statLabel}>DURATION</Text>
              <Text style={s.statValue}>{pool.duration_days}d</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statLabel}>FREQ</Text>
              <Text style={s.statValue}>{pool.frequency || 'Daily'}</Text>
            </View>
          </View>

          {/* Players progress */}
          <View style={s.playersRow}>
            <Ionicons name="people-outline" size={14} color={C.textMuted} />
            <Text style={s.playersText}>
              {pool.current_players ?? members.length}/{pool.max_players} players
            </Text>
          </View>
          <View style={s.barBg}>
            <LinearGradient
              colors={[C.primary, '#4ADE80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.barFill, { width: `${Math.min(fillPct, 100)}%` }]}
            />
          </View>
        </View>

        {/* Members / Leaderboard */}
        <Text style={s.sectionLabel}>LEADERBOARD</Text>
        {members.length === 0 ? (
          <View style={s.emptyMembers}>
            <Ionicons name="people-outline" size={32} color={C.textMuted} />
            <Text style={s.emptyText}>No members yet. Be the first to join!</Text>
          </View>
        ) : (
          members.map((member: any, idx: number) => {
            const name = member.profiles?.display_name || 'User';
            const streak = member.current_streak ?? 0;
            const colors = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isMe = member.user_id === user?.id;

            return (
              <View key={member.id} style={[s.memberRow, isMe && s.memberRowMe]}>
                <Text style={s.memberRank}>#{idx + 1}</Text>
                <LinearGradient colors={colors as [string, string]} style={s.memberAvatar}>
                  <Text style={s.memberAvatarText}>{name[0]?.toUpperCase()}</Text>
                </LinearGradient>
                <View style={s.memberInfo}>
                  <Text style={s.memberName}>
                    {name} {isMe ? '(You)' : ''}
                  </Text>
                  <Text style={s.memberStreak}>
                    {streak} day streak · {member.total_proofs ?? 0} proofs
                  </Text>
                </View>
                {streak > 0 && (
                  <View style={s.streakBadge}>
                    <Text style={s.streakIcon}>🔥</Text>
                    <Text style={s.streakNum}>{streak}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Action Button */}
        {isMember ? (
          <Pressable
            style={s.actionBtn}
            onPress={() => router.push('/(tabs)')}
          >
            <LinearGradient
              colors={[C.primary, '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.actionGrad}
            >
              <Ionicons name="camera" size={20} color={C.white} />
              <Text style={s.actionText}>Submit Proof</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            style={[s.actionBtn, joining && { opacity: 0.5 }]}
            onPress={handleJoin}
            disabled={joining}
          >
            <LinearGradient
              colors={[C.primary, '#4ADE80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.actionGrad}
            >
              <Text style={s.actionText}>
                {joining ? 'Joining...' : `Join Pool · ${pool.stake_amount} SOL`}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: Spacing.md, marginBottom: Spacing.xl,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary },

  card: {
    backgroundColor: C.bgSurface, borderRadius: Radius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: C.border,
    marginBottom: Spacing.xl,
  },
  emojiRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.md,
  },
  emoji: { fontSize: 36 },
  emojiInfo: { flex: 1 },
  poolName: { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  poolCategory: { fontSize: 13, color: C.textMuted, marginTop: 2, textTransform: 'capitalize' },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.primaryDim, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary },
  activeText: { fontSize: 11, fontWeight: '700', color: C.primary },

  description: {
    fontSize: 14, color: C.textSecondary, lineHeight: 20, marginBottom: Spacing.md,
  },
  proofReqCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.primaryLight, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
  },
  proofReqLabel: {
    fontSize: 10, fontWeight: '700', color: C.primary, letterSpacing: 0.5, marginBottom: 2,
  },
  proofReqText: { fontSize: 13, color: C.textPrimary, lineHeight: 18 },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: C.textPrimary },

  playersRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
  },
  playersText: { fontSize: 13, color: C.textMuted },
  barBg: {
    height: 4, backgroundColor: C.bgHover, borderRadius: 2, overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, marginBottom: Spacing.sm,
  },
  emptyMembers: {
    alignItems: 'center', padding: Spacing.xl, gap: 8,
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border, marginBottom: Spacing.xl,
  },
  emptyText: { fontSize: 13, color: C.textMuted, textAlign: 'center' },

  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, backgroundColor: C.bgSurface, borderRadius: Radius.md,
    marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  memberRowMe: { borderColor: C.primary, backgroundColor: C.primaryLight },
  memberRank: { fontSize: 14, fontWeight: '800', color: C.textMuted, width: 28, textAlign: 'center' },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 16, fontWeight: '800', color: C.white },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  memberStreak: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.accentDim, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  streakIcon: { fontSize: 12 },
  streakNum: { fontSize: 13, fontWeight: '700', color: C.accent },

  actionBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  actionGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: Radius.md,
  },
  actionText: { fontSize: 16, fontWeight: '700', color: C.white },
});
