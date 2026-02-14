import { View, Text, StyleSheet, Pressable } from "react-native";
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

const pendingProofs = [
  { id: "1", emoji: "🏃", name: "Morning Run", deadline: "2h left", urgent: true },
  { id: "2", emoji: "📚", name: "Read 30 Pages", deadline: "8h left", urgent: false },
];

export default function ProveScreen() {
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const btnScale = useSharedValue(1);

  const btnAnim = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleCapture = () => {
    btnScale.value = withSequence(
      withSpring(0.9, { damping: 4 }),
      withSpring(1, { damping: 6 })
    );
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
          {pendingProofs.map((proof) => (
            <Pressable
              key={proof.id}
              onPress={() => setSelectedPool(proof.id)}
              style={[
                pv.proofCard,
                selectedPool === proof.id && pv.proofCardSelected,
              ]}
            >
              <Text style={pv.proofEmoji}>{proof.emoji}</Text>
              <View style={pv.proofInfo}>
                <Text style={pv.proofName}>{proof.name}</Text>
                <Text style={[pv.proofDeadline, proof.urgent && { color: C.danger }]}>
                  {proof.deadline}
                </Text>
              </View>
              {selectedPool === proof.id && (
                <Ionicons name="checkmark-circle" size={22} color={C.brandFire} />
              )}
              {proof.urgent && selectedPool !== proof.id && (
                <View style={pv.urgentDot} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Camera area */}
        <View style={pv.cameraArea}>
          <View style={pv.cameraPlaceholder}>
            <Ionicons name="image-outline" size={48} color={C.textMuted} />
            <Text style={pv.cameraText}>Photo preview</Text>
          </View>
        </View>

        {/* Capture button */}
        <View style={pv.captureRow}>
          <Pressable style={pv.galleryBtn}>
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
          style={[pv.submitBtn, !selectedPool && { opacity: 0.4 }]}
          disabled={!selectedPool}
        >
          <LinearGradient
            colors={selectedPool ? [C.brandFire, C.brandGold] : [C.bgElevated, C.bgElevated]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={pv.submitGradient}
          >
            <Text style={pv.submitText}>Submit Proof</Text>
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
});
