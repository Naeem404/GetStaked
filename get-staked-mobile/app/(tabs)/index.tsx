import { View, Text, StyleSheet, Pressable, Dimensions, Image, Platform, Alert, ActivityIndicator, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useMyPools } from "@/hooks/use-pools";
import { useUserStats } from "@/hooks/use-stats";
import { usePendingProofs, submitProof } from "@/hooks/use-proofs";
import { purchaseLifeline, activateLifeline, requestFriendVouch } from "@/hooks/use-lifelines";
import { useFriendIds } from "@/hooks/use-friends";
import { getDemoBalance } from "@/lib/demo-wallet";
import { useState, useEffect, useRef, useCallback } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function CameraDashboard() {
  const { profile, user } = useAuth();
  const { pools: myPools, loading: poolsLoading, refetch: refetchMyPools } = useMyPools();
  const { stats, loading: statsLoading, refetch: refetchStats } = useUserStats();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("23:59:59");
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { pendingProofs, refetch: refetchProofs } = usePendingProofs();
  const [showPoolSheet, setShowPoolSheet] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLifeline, setShowLifeline] = useState(false);
  const [lifelineLoading, setLifelineLoading] = useState(false);
  const friendIds = useFriendIds();

  const totalPot = myPools.reduce((sum, p) => sum + (p.pot_size ?? 0), 0);
  const activeCount = myPools.length;

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      refetchMyPools();
      refetchProofs();
      refetchStats();
    }, [])
  );

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Countdown timer to midnight
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Capture button animation
  const btnScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const btnAnim = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const pulseAnim = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handleCapture = async () => {
    btnScale.value = withSequence(
      withSpring(0.85, { damping: 4 }),
      withSpring(1, { damping: 6 })
    );

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
        if (photo?.uri) {
          setImageUri(photo.uri);
          setImageBase64(photo.base64 ?? null);
        }
      } catch (e) {
        console.warn('Camera capture failed:', e);
      }
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={d.container}>
      {/* Full-screen live camera or captured preview */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={d.cameraBackground} resizeMode="cover" />
      ) : permission?.granted ? (
        <CameraView
          ref={cameraRef}
          style={d.cameraBackground}
          facing={facing}
        />
      ) : (
        <View style={[d.cameraBackground, d.cameraPlaceholder]}>
          <Ionicons name="camera" size={48} color="rgba(255,255,255,0.15)" />
          <Text style={d.permText}>Tap to enable camera</Text>
          <Pressable onPress={requestPermission} style={d.permBtn}>
            <Text style={d.permBtnText}>Grant Permission</Text>
          </Pressable>
        </View>
      )}

      {/* Top floating bar */}
      <SafeAreaView edges={["top"]} style={d.topOverlay}>
        <View style={d.topBar}>
          {/* Left: Profile avatar */}
          <Pressable onPress={() => router.push('/account')} style={d.avatarBtn}>
            <LinearGradient colors={[C.primary, '#4ADE80']} style={d.avatarGrad}>
              <Text style={d.avatarText}>
                {profile?.display_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Center: Streak + Pot + Timer */}
          <View style={d.topCenter}>
            <View style={d.topPill}>
              <Text style={d.streakIcon}>🔥</Text>
              <Text style={d.streakNum}>{stats.currentStreak}</Text>
            </View>
            <View style={d.topPill}>
              <Text style={d.potIcon}>◎</Text>
              <Text style={d.potNum}>{totalPot.toFixed(1)}</Text>
            </View>
            <View style={d.topPill}>
              <Ionicons name="time-outline" size={12} color={C.accent} />
              <Text style={d.timerText}>{countdown}</Text>
            </View>
          </View>

          {/* Right: Proof Reviews */}
          <Pressable onPress={() => router.push('/proof-reviews')} style={d.avatarBtn}>
            <View style={[d.avatarGrad, { backgroundColor: C.bgSurface, borderWidth: 1, borderColor: C.border }]}>
              <Ionicons name="people" size={18} color={C.primary} />
            </View>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Active pools floating strip */}
      {activeCount > 0 && !poolsLoading && (
        <View style={d.activeStrip}>
          <View style={d.activeStripInner}>
            <View style={d.activeIndicator} />
            <Text style={d.activeText}>
              {activeCount} active pool{activeCount !== 1 ? 's' : ''}
            </Text>
            <Text style={d.activeSol}>{totalPot.toFixed(1)} SOL at stake</Text>
          </View>
        </View>
      )}

      {/* Captured image overlay controls */}
      {imageUri && !showPoolSheet && (
        <View style={d.previewOverlay}>
          <Ionicons name="checkmark-circle" size={64} color={C.primary} />
          <Text style={d.previewText}>Photo captured</Text>
          <View style={d.previewActions}>
            <Pressable onPress={() => { setImageUri(null); setImageBase64(null); }} style={d.retakeBtn}>
              <Text style={d.retakeText}>Retake</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (pendingProofs.length === 0) {
                  Alert.alert('No Pools', 'You have no active pools that need proof today.');
                  return;
                }
                setShowPoolSheet(true);
              }}
              style={d.submitPhotoBtn}
            >
              <LinearGradient colors={[C.primary, '#4ADE80']} style={d.submitPhotoBtnGrad}>
                <Ionicons name="send" size={18} color={C.white} />
                <Text style={d.submitPhotoBtnText}>Submit Proof</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* Pool Selection Sheet */}
      <Modal visible={showPoolSheet} transparent animationType="slide" onRequestClose={() => setShowPoolSheet(false)}>
        <Pressable style={d.sheetOverlay} onPress={() => setShowPoolSheet(false)} />
        <View style={d.sheet}>
          <View style={d.sheetHandle} />
          <Text style={d.sheetTitle}>Select Pool</Text>
          <Text style={d.sheetSub}>Which pool is this proof for?</Text>
          <ScrollView style={d.sheetScroll} showsVerticalScrollIndicator={false}>
            {pendingProofs.map((proof) => (
              <Pressable
                key={proof.pool_id}
                onPress={() => {
                  setSelectedPoolId(proof.pool_id);
                  setSelectedMemberId(proof.member_id);
                }}
                style={[
                  d.poolOption,
                  selectedPoolId === proof.pool_id && d.poolOptionSelected,
                ]}
              >
                <Text style={d.poolEmoji}>{proof.pool_emoji}</Text>
                <View style={d.poolOptionInfo}>
                  <Text style={d.poolOptionName}>{proof.pool_name}</Text>
                  <Text style={d.poolOptionDeadline}>{proof.deadline}</Text>
                </View>
                {selectedPoolId === proof.pool_id ? (
                  <Ionicons name="checkmark-circle" size={24} color={C.primary} />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color={C.textMuted} />
                )}
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            style={[d.sheetSubmitBtn, (!selectedPoolId || submitting) && { opacity: 0.4 }]}
            disabled={!selectedPoolId || submitting}
            onPress={async () => {
              if (!user || !selectedPoolId || !selectedMemberId || !imageUri) return;
              setSubmitting(true);
              try {
                const { error } = await submitProof(selectedPoolId, user.id, selectedMemberId, imageUri, imageBase64 ?? undefined);
                if (error) {
                  Alert.alert('Error', error.message);
                } else {
                  setShowPoolSheet(false);
                  setImageUri(null);
                  setImageBase64(null);
                  setSelectedPoolId(null);
                  setSelectedMemberId(null);
                  refetchProofs();
                  refetchStats();
                  Alert.alert('Verified! ✅', 'Your proof has been submitted and verified.');
                }
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Submission failed');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <LinearGradient colors={[C.primary, '#16A34A']} style={d.sheetSubmitGrad}>
              {submitting ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color={C.white} />
                  <Text style={d.sheetSubmitText}>Submit & Verify</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </Modal>

      {/* Bottom capture area — single button + flip */}
      {!imageUri && (
        <View style={d.captureArea}>
          {/* Flip camera button */}
          <Pressable style={d.sideBtn} onPress={toggleFacing}>
            <Ionicons name="camera-reverse-outline" size={24} color={C.white} />
          </Pressable>

          {/* Main capture button */}
          <Pressable onPress={handleCapture}>
            <Animated.View style={[d.captureOuter, pulseAnim]}>
              <View style={d.captureRingOuter} />
            </Animated.View>
            <Animated.View style={btnAnim}>
              <LinearGradient
                colors={[C.primary, '#4ADE80']}
                style={d.captureBtn}
              >
                <View style={d.captureBtnInner} />
              </LinearGradient>
            </Animated.View>
          </Pressable>

          {/* Lifeline button */}
          <Pressable style={d.sideBtn} onPress={() => {
            if (pendingProofs.length === 0 && myPools.length === 0) {
              Alert.alert('No Pools', 'Join a pool first to use lifelines.');
            } else {
              setShowLifeline(true);
            }
          }}>
            <Ionicons name="heart" size={24} color="#FF6B6B" />
          </Pressable>
        </View>
      )}

      {/* ── Lifeline Modal ── */}
      <Modal visible={showLifeline} transparent animationType="slide" onRequestClose={() => setShowLifeline(false)}>
        <Pressable style={d.sheetOverlay} onPress={() => setShowLifeline(false)} />
        <View style={d.lifelineSheet}>
          <View style={d.sheetHandle} />
          <View style={d.lifelineHeader}>
            <LinearGradient colors={['#FF6B6B', '#EE5A24']} style={d.lifelineIconWrap}>
              <Ionicons name="heart" size={24} color={C.white} />
            </LinearGradient>
            <View>
              <Text style={d.lifelineTitle}>Lifelines</Text>
              <Text style={d.lifelineSub}>Skip a day without breaking your streak</Text>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {/* How it works */}
            <View style={d.lifelineInfo}>
              <View style={d.lifelineInfoRow}>
                <Text style={d.lifelineInfoIcon}>💰</Text>
                <Text style={d.lifelineInfoText}>Buy for 0.5 SOL — instant skip</Text>
              </View>
              <View style={d.lifelineInfoRow}>
                <Text style={d.lifelineInfoIcon}>🤝</Text>
                <Text style={d.lifelineInfoText}>Ask a friend to vouch — free skip</Text>
              </View>
              <View style={d.lifelineInfoRow}>
                <Text style={d.lifelineInfoIcon}>⚡</Text>
                <Text style={d.lifelineInfoText}>Max 3 lifelines per pool</Text>
              </View>
            </View>

            {/* Pool lifeline options */}
            <Text style={d.lifelineSectionLabel}>YOUR POOLS</Text>
            {pendingProofs.length === 0 ? (
              <View style={d.lifelineEmpty}>
                <Text style={d.lifelineEmptyText}>All proofs submitted today!</Text>
              </View>
            ) : (
              pendingProofs.map((proof) => (
                <View key={proof.pool_id} style={d.lifelinePoolCard}>
                  <View style={d.lifelinePoolHeader}>
                    <Text style={d.lifelinePoolEmoji}>{proof.pool_emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={d.lifelinePoolName}>{proof.pool_name}</Text>
                      <Text style={d.lifelinePoolDeadline}>{proof.deadline}</Text>
                    </View>
                  </View>
                  <View style={d.lifelineActions}>
                    <Pressable
                      style={d.lifelineBuyBtn}
                      disabled={lifelineLoading}
                      onPress={async () => {
                        if (!user) return;
                        setLifelineLoading(true);
                        try {
                          const res = await purchaseLifeline(user.id, proof.pool_id);
                          if (!res.success) {
                            Alert.alert('Cannot Purchase', res.error || 'Try again.');
                          } else {
                            // Use it immediately
                            await activateLifeline(user.id, proof.pool_id, proof.member_id);
                            refetchProofs();
                            Alert.alert('Lifeline Used! ❤️', 'Today is covered. Your streak is safe!');
                            setShowLifeline(false);
                          }
                        } finally {
                          setLifelineLoading(false);
                        }
                      }}
                    >
                      <LinearGradient colors={['#FF6B6B', '#EE5A24']} style={d.lifelineBuyGrad}>
                        <Ionicons name="heart" size={14} color={C.white} />
                        <Text style={d.lifelineBuyText}>0.5 SOL</Text>
                      </LinearGradient>
                    </Pressable>
                    {friendIds.length > 0 && (
                      <Pressable
                        style={d.lifelineFriendBtn}
                        disabled={lifelineLoading}
                        onPress={async () => {
                          if (!user) return;
                          setLifelineLoading(true);
                          try {
                            const friendId = friendIds[0];
                            const res = await requestFriendVouch(user.id, proof.pool_id, friendId, 'Friend');
                            if (!res.success) {
                              Alert.alert('Cannot Vouch', res.error || 'Try again.');
                            } else {
                              await activateLifeline(user.id, proof.pool_id, proof.member_id);
                              refetchProofs();
                              Alert.alert('Friend Vouched! 🤝', 'Your friend saved your streak!');
                              setShowLifeline(false);
                            }
                          } finally {
                            setLifelineLoading(false);
                          }
                        }}
                      >
                        <Ionicons name="people" size={14} color={C.primary} />
                        <Text style={d.lifelineFriendText}>Ask Friend</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const d = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
    gap: 12,
  },
  permText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 8,
  },
  permBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: C.primary,
    marginTop: 8,
  },
  permBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 12,
    zIndex: 20,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
  },
  retakeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginTop: 8,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },

  // Top overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  avatarBtn: {},
  avatarGrad: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
  },
  topCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  streakIcon: { fontSize: 12 },
  streakNum: {
    fontSize: 13,
    fontWeight: '800',
    color: C.accent,
  },
  potIcon: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '700',
  },
  potNum: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.accent,
    fontFamily: 'monospace',
  },
  // Active pools strip
  activeStrip: {
    position: 'absolute',
    top: 110,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  activeStripInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  activeText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textPrimary,
    flex: 1,
  },
  activeSol: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
  },

  // Capture area — single capture + flip + flash
  captureArea: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    zIndex: 10,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  captureOuter: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: C.primary,
  },
  captureRingOuter: {
    flex: 1,
    borderRadius: 50,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  captureBtnInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'transparent',
  },

  // Preview actions
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  submitPhotoBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  submitPhotoBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  submitPhotoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },

  // Pool selection sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: C.bgSurface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    maxHeight: '65%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.bgHover,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: Spacing.lg,
  },
  sheetScroll: {
    maxHeight: 240,
    marginBottom: Spacing.lg,
  },
  poolOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    backgroundColor: C.bgElevated,
    borderRadius: Radius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  poolOptionSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  poolEmoji: {
    fontSize: 24,
  },
  poolOptionInfo: {
    flex: 1,
  },
  poolOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  poolOptionDeadline: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  sheetSubmitBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  sheetSubmitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: Radius.md,
  },
  sheetSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },

  // Lifeline modal
  lifelineSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  lifelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  lifelineIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifelineTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
  },
  lifelineSub: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  lifelineInfo: {
    backgroundColor: 'rgba(255,107,107,0.06)',
    borderRadius: Radius.md,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.12)',
  },
  lifelineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lifelineInfoIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  lifelineInfoText: {
    fontSize: 13,
    color: C.textSecondary,
    flex: 1,
  },
  lifelineSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  lifelineEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  lifelineEmptyText: {
    fontSize: 14,
    color: C.textMuted,
  },
  lifelinePoolCard: {
    backgroundColor: C.bgElevated,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  lifelinePoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  lifelinePoolEmoji: {
    fontSize: 24,
  },
  lifelinePoolName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  lifelinePoolDeadline: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  lifelineActions: {
    flexDirection: 'row',
    gap: 10,
  },
  lifelineBuyBtn: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  lifelineBuyGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  lifelineBuyText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
  lifelineFriendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  lifelineFriendText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
});
