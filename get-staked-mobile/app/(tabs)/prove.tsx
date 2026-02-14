import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { usePendingProofs, submitProof } from "@/hooks/use-proofs";
import { useAuth } from "@/lib/auth-context";
import * as ImagePicker from 'expo-image-picker';

export default function ProveScreen() {
  const { user } = useAuth();
  const { pendingProofs, loading: proofsLoading, refetch } = usePendingProofs();
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const btnScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  const btnAnim = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const pulseAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  useState(() => {
    pulseScale.value = withRepeat(
      withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  });

  const handleCapture = async () => {
    btnScale.value = withSequence(
      withSpring(0.85, { damping: 4 }),
      withSpring(1, { damping: 6 })
    );

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });
        if (!result.canceled && result.assets[0]) {
          setImageUri(result.assets[0].uri);
        }
      } else {
        handleGallery();
      }
    } catch {
      handleGallery();
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedPoolId || !selectedMemberId || !imageUri) {
      Alert.alert("Error", "Please select a pool and take a photo first");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await submitProof(selectedPoolId, user.id, selectedMemberId, imageUri);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Verified! ✅", "Your proof has been submitted and verified.", [
          { text: "Nice!", onPress: () => {
            setImageUri(null);
            setSelectedPoolId(null);
            setSelectedMemberId(null);
            refetch();
          }},
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = pendingProofs.length;
  const canSubmit = selectedPoolId && imageUri && !submitting;

  return (
    <SafeAreaView style={pv.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pv.scroll}>
        {/* Header */}
        <View style={pv.headerRow}>
          <View>
            <Text style={pv.title}>Submit Proof</Text>
            <Text style={pv.subtitle}>Verify your habit completion</Text>
          </View>
          {pendingCount > 0 && (
            <View style={pv.pendingBadge}>
              <Text style={pv.pendingBadgeText}>{pendingCount}</Text>
              <Text style={pv.pendingBadgeLabel}>pending</Text>
            </View>
          )}
        </View>

        {/* Camera / Photo Area */}
        <View style={pv.cameraCard}>
          {imageUri ? (
            <Pressable onPress={() => setImageUri(null)} style={pv.imagePreview}>
              <LinearGradient
                colors={['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.05)']}
                style={pv.imagePreviewInner}
              >
                <View style={pv.checkCircle}>
                  <Ionicons name="checkmark" size={32} color={C.primary} />
                </View>
                <Text style={pv.photoReadyText}>Photo Ready</Text>
                <Text style={pv.photoReadySub}>Tap to retake</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <View style={pv.cameraPlaceholder}>
              <View style={pv.cameraIconWrap}>
                <Ionicons name="camera-outline" size={40} color={C.textMuted} />
              </View>
              <Text style={pv.cameraTitle}>Capture Your Proof</Text>
              <Text style={pv.cameraSub}>Take a photo or select from gallery</Text>
            </View>
          )}

          {/* Capture Controls */}
          <View style={pv.captureRow}>
            <Pressable style={pv.sideBtn} onPress={handleGallery}>
              <Ionicons name="images-outline" size={22} color={C.textSecondary} />
              <Text style={pv.sideBtnLabel}>Gallery</Text>
            </Pressable>

            <Pressable onPress={handleCapture}>
              <Animated.View style={[pv.captureOuter, btnAnim]}>
                <Animated.View style={[pv.capturePulse, pulseAnim]} />
                <LinearGradient
                  colors={[C.primary, '#16A34A']}
                  style={pv.captureBtn}
                >
                  <Ionicons name="camera" size={28} color={C.white} />
                </LinearGradient>
              </Animated.View>
            </Pressable>

            <Pressable style={pv.sideBtn}>
              <Ionicons name="camera-reverse-outline" size={22} color={C.textSecondary} />
              <Text style={pv.sideBtnLabel}>Flip</Text>
            </Pressable>
          </View>
        </View>

        {/* Select Pool */}
        <Text style={pv.sectionLabel}>SELECT POOL</Text>
        {proofsLoading ? (
          <View style={pv.loadingWrap}>
            <ActivityIndicator color={C.primary} />
          </View>
        ) : pendingCount === 0 ? (
          <View style={pv.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={36} color={C.primary} />
            <Text style={pv.emptyTitle}>All Caught Up!</Text>
            <Text style={pv.emptySub}>No proofs needed today. Keep it up! 🎉</Text>
          </View>
        ) : (
          pendingProofs.map((proof) => (
            <Pressable
              key={proof.pool_id}
              onPress={() => {
                setSelectedPoolId(proof.pool_id);
                setSelectedMemberId(proof.member_id);
              }}
              style={[
                pv.proofCard,
                selectedPoolId === proof.pool_id && pv.proofCardSelected,
              ]}
            >
              <View style={pv.proofEmojiWrap}>
                <Text style={pv.proofEmoji}>{proof.pool_emoji}</Text>
              </View>
              <View style={pv.proofInfo}>
                <Text style={pv.proofName}>{proof.pool_name}</Text>
                <View style={pv.proofMeta}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={proof.urgent ? C.danger : C.textMuted}
                  />
                  <Text style={[pv.proofDeadline, proof.urgent && { color: C.danger }]}>
                    {proof.deadline}
                  </Text>
                </View>
              </View>
              {selectedPoolId === proof.pool_id ? (
                <View style={pv.selectedCheck}>
                  <Ionicons name="checkmark" size={16} color={C.white} />
                </View>
              ) : proof.urgent ? (
                <View style={pv.urgentBadge}>
                  <Text style={pv.urgentText}>URGENT</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              )}
            </Pressable>
          ))
        )}

        {/* Submit Button */}
        <Pressable
          style={[pv.submitBtn, !canSubmit && { opacity: 0.4 }]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <LinearGradient
            colors={canSubmit ? [C.primary, '#16A34A'] : [C.bgElevated, C.bgElevated]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={pv.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color={C.white} />
                <Text style={pv.submitText}>Submit Proof</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const pv = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: { fontSize: 26, fontWeight: "800", color: C.textPrimary },
  subtitle: { fontSize: 14, color: C.textSecondary, marginTop: 2 },
  pendingBadge: {
    alignItems: "center",
    backgroundColor: C.primaryDim,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.primary,
  },
  pendingBadgeText: { fontSize: 20, fontWeight: "800", color: C.primary, fontFamily: Fonts.mono },
  pendingBadgeLabel: { fontSize: 10, fontWeight: "600", color: C.primary, letterSpacing: 0.5 },

  cameraCard: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  cameraPlaceholder: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cameraTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  cameraSub: { fontSize: 13, color: C.textMuted },

  imagePreview: { width: "100%" },
  imagePreviewInner: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primaryDim,
    borderWidth: 2,
    borderColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  photoReadyText: { fontSize: 18, fontWeight: "700", color: C.primary },
  photoReadySub: { fontSize: 13, color: C.textMuted },

  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  sideBtn: { alignItems: "center", gap: 4 },
  sideBtnLabel: { fontSize: 10, color: C.textMuted, fontWeight: "600" },
  captureOuter: { alignItems: "center", justifyContent: "center" },
  capturePulse: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: C.primary,
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  loadingWrap: { paddingVertical: 32 },

  emptyCard: {
    alignItems: "center",
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: Spacing.xl,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: "center" },

  proofCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.bgSurface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  proofCardSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  proofEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  proofEmoji: { fontSize: 22 },
  proofInfo: { flex: 1 },
  proofName: { fontSize: 15, fontWeight: "600", color: C.textPrimary },
  proofMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  proofDeadline: { fontSize: 12, color: C.textMuted },
  selectedCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  urgentBadge: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  urgentText: { fontSize: 10, fontWeight: "700", color: C.danger, letterSpacing: 0.5 },

  submitBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: Radius.md,
  },
  submitText: { fontSize: 16, fontWeight: "700", color: C.white },
});
