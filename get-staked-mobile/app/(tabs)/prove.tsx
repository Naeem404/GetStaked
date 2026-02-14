import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
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

  const btnAnim = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleCapture = async () => {
    btnScale.value = withSequence(
      withSpring(0.9, { damping: 4 }),
      withSpring(1, { damping: 6 })
    );

    // Try camera first, fall back to image picker
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
        // Fallback to gallery
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

  return (
    <SafeAreaView style={pv.safe} edges={["top"]}>
      <View style={pv.container}>
        {/* Header */}
        <Text style={pv.title}>Submit Proof</Text>
        <Text style={pv.subtitle}>Take a photo to verify your habit</Text>

        {/* Pending proofs list */}
        <View style={pv.pendingSection}>
          <Text style={pv.sectionLabel}>PENDING</Text>
          {proofsLoading ? (
            <ActivityIndicator color={C.brandFire} />
          ) : pendingProofs.length === 0 ? (
            <Text style={pv.noPending}>All caught up! No proofs needed today.</Text>
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
                <Text style={pv.proofEmoji}>{proof.pool_emoji}</Text>
                <View style={pv.proofInfo}>
                  <Text style={pv.proofName}>{proof.pool_name}</Text>
                  <Text style={[pv.proofDeadline, proof.urgent && { color: C.danger }]}>
                    {proof.deadline}
                  </Text>
                </View>
                {selectedPoolId === proof.pool_id && (
                  <Ionicons name="checkmark-circle" size={22} color={C.brandFire} />
                )}
                {proof.urgent && selectedPoolId !== proof.pool_id && (
                  <View style={pv.urgentDot} />
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Camera area */}
        <View style={pv.cameraArea}>
          {imageUri ? (
            <Pressable onPress={() => setImageUri(null)} style={pv.imagePreview}>
              <View style={pv.imagePreview}>
                <Ionicons name="checkmark-circle" size={48} color={C.success} />
                <Text style={pv.cameraText}>Photo ready · Tap to clear</Text>
              </View>
            </Pressable>
          ) : (
            <View style={pv.cameraPlaceholder}>
              <Ionicons name="image-outline" size={48} color={C.textMuted} />
              <Text style={pv.cameraText}>Take or select a photo</Text>
            </View>
          )}
        </View>

        {/* Capture button */}
        <View style={pv.captureRow}>
          <Pressable style={pv.galleryBtn} onPress={handleGallery}>
            <Ionicons name="images-outline" size={24} color={C.textSecondary} />
          </Pressable>

          <Pressable onPress={handleCapture}>
            <Animated.View style={btnAnim}>
              <LinearGradient
                colors={[C.brandFire, C.brandGold]}
                style={pv.captureBtn}
              >
                <Ionicons name="camera" size={32} color={C.white} />
              </LinearGradient>
            </Animated.View>
          </Pressable>

          <Pressable style={pv.flipBtn}>
            <Ionicons name="camera-reverse-outline" size={24} color={C.textSecondary} />
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          style={[pv.submitBtn, (!selectedPoolId || !imageUri) && { opacity: 0.4 }]}
          disabled={!selectedPoolId || !imageUri || submitting}
          onPress={handleSubmit}
        >
          <LinearGradient
            colors={selectedPoolId && imageUri ? [C.brandFire, C.brandGold] : [C.bgElevated, C.bgElevated]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={pv.submitGradient}
          >
            <Text style={pv.submitText}>
              {submitting ? 'Submitting...' : 'Submit Proof'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const pv = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  title: { fontSize: 24, fontWeight: "800", color: C.textPrimary, marginTop: Spacing.lg },
  subtitle: { fontSize: 14, color: C.textSecondary, marginTop: 4, marginBottom: Spacing.xl },

  pendingSection: { marginBottom: Spacing.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
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
    borderColor: C.brandFire,
    backgroundColor: C.fireLight,
  },
  proofEmoji: { fontSize: 24 },
  proofInfo: { flex: 1 },
  proofName: { fontSize: 14, fontWeight: "600", color: C.textPrimary },
  proofDeadline: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  urgentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.danger,
  },

  cameraArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  cameraPlaceholder: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraText: { fontSize: 13, color: C.textMuted },

  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginBottom: Spacing.xl,
  },
  galleryBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.brandFire,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  submitBtn: { marginBottom: Spacing.xl },
  submitGradient: {
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontSize: 16, fontWeight: "700", color: C.white },
  noPending: { fontSize: 14, color: C.textMuted, textAlign: "center", paddingVertical: 12 },
  imagePreview: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: C.success,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
