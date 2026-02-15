import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface PendingReview {
  review_id: string;
  proof_id: string;
  pool_name: string;
  pool_emoji: string;
  proof_description: string;
  submitter_name: string;
  submitter_avatar: string | null;
  image_url: string;
  ai_confidence: number;
  ai_reasoning: string;
  created_at: string;
}

export default function ProofReviewsScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pending_reviews', {
        p_reviewer_id: user.id,
      });
      if (error) throw error;
      setReviews((data as PendingReview[]) || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Fallback: direct query
      try {
        const { data } = await supabase
          .from('proof_reviews')
          .select(`
            id,
            proof_id,
            ai_confidence,
            ai_reasoning,
            created_at,
            proofs (image_url),
            pools (name, emoji, proof_description),
            profiles!proof_reviews_user_id_fkey (display_name, avatar_url)
          `)
          .eq('reviewer_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (data) {
          setReviews(data.map((r: any) => ({
            review_id: r.id,
            proof_id: r.proof_id,
            pool_name: r.pools?.name || 'Pool',
            pool_emoji: r.pools?.emoji || '',
            proof_description: r.pools?.proof_description || '',
            submitter_name: r.profiles?.display_name || 'Someone',
            submitter_avatar: r.profiles?.avatar_url,
            image_url: r.proofs?.image_url || '',
            ai_confidence: r.ai_confidence,
            ai_reasoning: r.ai_reasoning,
            created_at: r.created_at,
          })));
        }
      } catch {
        // silent
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleReview(reviewId: string, approved: boolean) {
    if (!user) return;
    setActing(reviewId);
    try {
      const { error } = await supabase.rpc('resolve_proof_review', {
        p_review_id: reviewId,
        p_reviewer_id: user.id,
        p_status: approved ? 'approved' : 'rejected',
        p_note: approved ? 'Approved by friend' : 'Rejected by friend',
      });

      if (error) {
        // Fallback: direct update
        await supabase
          .from('proof_reviews')
          .update({
            status: approved ? 'approved' : 'rejected',
            reviewer_note: approved ? 'Approved by friend' : 'Rejected by friend',
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reviewId);

        // Also update the proof itself
        const review = reviews.find(r => r.review_id === reviewId);
        if (review) {
          await supabase
            .from('proofs')
            .update({ status: approved ? 'approved' : 'rejected', verified_at: new Date().toISOString() })
            .eq('id', review.proof_id);
        }
      }

      Alert.alert(
        approved ? 'Approved!' : 'Rejected',
        approved ? 'You approved your friend\'s proof!' : 'You rejected the proof.',
      );
      setReviews(prev => prev.filter(r => r.review_id !== reviewId));
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit review');
    } finally {
      setActing(null);
    }
  }

  const confidenceColor = (c: number) => {
    if (c >= 0.6) return C.accent;
    if (c >= 0.4) return '#FF8C00';
    return C.danger;
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={st.header}>
          <Pressable onPress={() => router.back()} style={st.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
          </Pressable>
          <Text style={st.title}>Proof Reviews</Text>
          <View style={st.badge}>
            <Text style={st.badgeText}>{reviews.length}</Text>
          </View>
        </View>

        <Text style={st.subtitle}>
          Your friends need your help verifying their proofs. The AI wasn't sure — you make the call.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
        ) : reviews.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="checkmark-done-circle" size={48} color={C.primary} />
            <Text style={st.emptyTitle}>All caught up!</Text>
            <Text style={st.emptyDesc}>No proofs waiting for your review.</Text>
          </View>
        ) : (
          reviews.map(review => (
            <View key={review.review_id} style={st.card}>
              {/* Card header */}
              <View style={st.cardHeader}>
                <Text style={st.cardEmoji}>{review.pool_emoji}</Text>
                <View style={st.cardHeaderInfo}>
                  <Text style={st.cardPool}>{review.pool_name}</Text>
                  <Text style={st.cardSubmitter}>by {review.submitter_name}</Text>
                </View>
                <View style={[st.confidenceBadge, { backgroundColor: `${confidenceColor(review.ai_confidence)}15` }]}>
                  <Text style={[st.confidenceText, { color: confidenceColor(review.ai_confidence) }]}>
                    AI: {Math.round(review.ai_confidence * 100)}%
                  </Text>
                </View>
              </View>

              {/* Task description */}
              <View style={st.taskBox}>
                <Ionicons name="document-text-outline" size={14} color={C.textMuted} />
                <Text style={st.taskText}>Task: {review.proof_description}</Text>
              </View>

              {/* Proof image */}
              {review.image_url ? (
                <Image source={{ uri: review.image_url }} style={st.proofImage} resizeMode="cover" />
              ) : (
                <View style={[st.proofImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgElevated }]}>
                  <Ionicons name="image-outline" size={32} color={C.textMuted} />
                </View>
              )}

              {/* AI reasoning */}
              <View style={st.reasoningBox}>
                <Ionicons name="sparkles" size={14} color={C.accent} />
                <Text style={st.reasoningText}>{review.ai_reasoning}</Text>
              </View>

              {/* Action buttons */}
              <View style={st.actions}>
                <Pressable
                  style={st.rejectBtn}
                  onPress={() => handleReview(review.review_id, false)}
                  disabled={acting === review.review_id}
                >
                  {acting === review.review_id ? (
                    <ActivityIndicator size="small" color={C.danger} />
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={18} color={C.danger} />
                      <Text style={st.rejectText}>Reject</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={st.approveBtn}
                  onPress={() => handleReview(review.review_id, true)}
                  disabled={acting === review.review_id}
                >
                  <LinearGradient
                    colors={[C.primary, '#14B8A6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={st.approveGradient}
                  >
                    {acting === review.review_id ? (
                      <ActivityIndicator size="small" color={C.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color={C.white} />
                        <Text style={st.approveText}>Approve</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary, paddingHorizontal: Spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: Spacing.md, marginBottom: Spacing.sm,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, flex: 1 },
  badge: {
    backgroundColor: C.danger, borderRadius: 12, minWidth: 24, height: 24,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: C.white },
  subtitle: { fontSize: 13, color: C.textMuted, lineHeight: 18, marginBottom: Spacing.xl },
  empty: {
    alignItems: 'center', padding: Spacing.xl * 2, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  emptyDesc: { fontSize: 14, color: C.textMuted },
  card: {
    backgroundColor: C.bgSurface, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: C.border, marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.md,
  },
  cardEmoji: { fontSize: 28 },
  cardHeaderInfo: { flex: 1 },
  cardPool: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  cardSubmitter: { fontSize: 12, color: C.textMuted },
  confidenceBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  confidenceText: { fontSize: 11, fontWeight: '700' },
  taskBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: C.bgElevated, borderRadius: Radius.sm,
  },
  taskText: { fontSize: 12, color: C.textSecondary, flex: 1 },
  proofImage: {
    width: '100%', height: 220, backgroundColor: C.bgElevated,
  },
  reasoningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,176,0,0.05)',
  },
  reasoningText: { fontSize: 12, color: C.textSecondary, flex: 1, lineHeight: 16 },
  actions: {
    flexDirection: 'row', gap: 10, padding: Spacing.md, paddingTop: 0,
  },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: Radius.md,
    backgroundColor: C.dangerDim, borderWidth: 1, borderColor: C.danger,
  },
  rejectText: { fontSize: 14, fontWeight: '700', color: C.danger },
  approveBtn: { flex: 2, borderRadius: Radius.md, overflow: 'hidden' },
  approveGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: Radius.md,
  },
  approveText: { fontSize: 14, fontWeight: '700', color: C.white },
});
