import { View, Text, StyleSheet, Pressable, Modal, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C, Spacing, Radius } from "@/constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useCoach } from "@/hooks/use-coach";

type Persona = "drill-sergeant" | "hype-beast" | "gentle-guide";

const personas: Record<Persona, { name: string; icon: string; colors: [string, string]; msg: string }> = {
  "drill-sergeant": {
    name: "Drill Sergeant",
    icon: "⭐",
    colors: [C.danger, '#EF4444'],
    msg: "Day 5! Two people already dropped. Don't be number three.",
  },
  "hype-beast": {
    name: "Hype Beast",
    icon: "⚡",
    colors: [C.accent, '#FFB800'],
    msg: "FIRE STREAK! You're on a roll — keep it going! 🔥",
  },
  "gentle-guide": {
    name: "Gentle Guide",
    icon: "🌿",
    colors: ["#14B8A6", "#06B6D4"],
    msg: "You're doing great. Steady progress wins the race.",
  },
};

const quickActions = [
  { label: "Motivate Me", icon: "flash-outline" as const },
  { label: "How Am I Doing?", icon: "stats-chart-outline" as const },
  { label: "SOS — Need Help", icon: "warning-outline" as const, danger: true },
];

export function CoachBubble() {
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState<Persona>("drill-sergeant");
  const [hasMsg, setHasMsg] = useState(true);
  const { message: coachMsg, loading: coachLoading, playing, getCoachMessage, stopAudio } = useCoach();

  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1200 }),
        withTiming(0.3, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const bubbleAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnim = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const p = personas[persona];

  const handleOpen = () => {
    setHasMsg(false);
    setOpen(true);
    // Fetch a fresh coach message
    getCoachMessage('morning_reminder');
  };

  const handleQuickAction = (action: string) => {
    const triggerMap: Record<string, string> = {
      'Motivate Me': 'morning_reminder',
      'How Am I Doing?': 'milestone_streak',
      'SOS — Need Help': 'streak_broken',
    };
    getCoachMessage((triggerMap[action] || 'morning_reminder') as any);
  };

  return (
    <>
      {/* Floating bubble */}
      <View style={cb.bubbleWrap}>
        <Pressable onPress={handleOpen}>
          <Animated.View style={bubbleAnim}>
            {/* Glow ring */}
            <Animated.View style={[cb.glowRing, glowAnim, { borderColor: p.colors[0] }]} />
            <LinearGradient colors={p.colors} style={cb.bubble}>
              <Ionicons name="mic" size={22} color={C.white} />
            </LinearGradient>
            {hasMsg && <View style={cb.badge} />}
          </Animated.View>
        </Pressable>
      </View>

      {/* Bottom sheet modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={cb.overlay} onPress={() => setOpen(false)} />
        <View style={cb.sheet}>
          <View style={cb.handle} />

          {/* Header */}
          <View style={cb.sheetHeader}>
            <LinearGradient colors={p.colors} style={cb.avatarGrad}>
              <Text style={cb.avatarIcon}>{p.icon}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={cb.personaName}>{p.name}</Text>
              <View style={cb.personaRow}>
                {(Object.keys(personas) as Persona[]).map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => setPersona(k)}
                    style={[cb.personaPill, k === persona && cb.personaPillActive]}
                  >
                    <Text style={cb.personaPillText}>{personas[k].icon}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Message */}
          <View style={cb.msgCard}>
            {coachLoading ? (
              <ActivityIndicator color={C.primary} style={{ paddingVertical: 12 }} />
            ) : (
              <Text style={cb.msgText}>{coachMsg || p.msg}</Text>
            )}
            <View style={cb.waveRow}>
              <Pressable onPress={playing ? stopAudio : () => getCoachMessage('morning_reminder')}>
                <Ionicons name={playing ? "stop" : "play"} size={16} color={playing ? C.primary : C.textMuted} />
              </Pressable>
              {[12, 18, 8, 22, 14, 10, 20, 16, 12].map((h, i) => (
                <View key={i} style={[cb.waveBar, { height: h, backgroundColor: playing ? C.primary : C.textMuted }]} />
              ))}
            </View>
          </View>

          {/* Quick actions */}
          <ScrollView style={cb.actions} showsVerticalScrollIndicator={false}>
            {quickActions.map((a) => (
              <Pressable
                key={a.label}
                style={({ pressed }) => [cb.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => handleQuickAction(a.label)}
              >
                <Ionicons
                  name={a.icon}
                  size={18}
                  color={a.danger ? C.danger : C.textSecondary}
                />
                <Text style={[cb.actionText, a.danger && { color: C.danger }]}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const cb = StyleSheet.create({
  bubbleWrap: {
    position: "absolute",
    bottom: 90,
    right: 16,
    zIndex: 100,
  },
  glowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 30,
    borderWidth: 2,
  },
  bubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.bgPrimary,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: C.bgSurface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.bgHover,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: Spacing.xl,
  },
  avatarGrad: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: { fontSize: 24 },
  personaName: { fontSize: 17, fontWeight: "700", color: C.textPrimary, marginBottom: 6 },
  personaRow: { flexDirection: "row", gap: 6 },
  personaPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  personaPillActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  personaPillText: { fontSize: 14 },

  msgCard: {
    backgroundColor: C.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  msgText: { fontSize: 15, color: C.textPrimary, lineHeight: 22, marginBottom: 12 },
  waveRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: C.textMuted,
  },

  actions: { marginBottom: Spacing.lg },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.bgElevated,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  actionText: { fontSize: 14, fontWeight: "600", color: C.textPrimary },
});
