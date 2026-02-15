import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { C, Spacing, Radius } from "@/constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width: SCREEN_W } = Dimensions.get("window");

export default function CongratulationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    score?: string;
    rank?: string;
  }>();

  const name = params.name ?? "You";
  const score = params.score ?? "0";
  const rank = params.rank ?? "1";

  // Animations
  const crownBounce = useSharedValue(0);
  const avatarScale = useSharedValue(0.5);
  const fireGlow = useSharedValue(0.6);
  const scoreScale = useSharedValue(0);

  useEffect(() => {
    // Crown bounce
    crownBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Avatar pop in
    avatarScale.value = withSequence(
      withTiming(1.1, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );

    // Fire glow pulse
    fireGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.6, { duration: 800 })
      ),
      -1,
      true
    );

    // Score pop
    scoreScale.value = withDelay(
      400,
      withSequence(
        withTiming(1.15, { duration: 300, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 200 })
      )
    );
  }, []);

  const crownAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: crownBounce.value }],
  }));

  const avatarAnim = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const fireAnim = useAnimatedStyle(() => ({
    opacity: fireGlow.value,
    transform: [{ scale: 0.9 + fireGlow.value * 0.15 }],
  }));

  const scoreAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const getRankSuffix = (r: string) => {
    const n = parseInt(r);
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
  };

  return (
    <LinearGradient
      colors={["#1A1035", "#0D0B1A", "#0A0A0A"]}
      style={st.container}
    >
      <SafeAreaView style={st.safe} edges={["top", "bottom"]}>
        {/* Congratulation Title */}
        <Text style={st.congratsTitle}>Congratulation!</Text>

        {/* Crown */}
        <Animated.View style={[st.crownContainer, crownAnim]}>
          <Text style={st.crownEmoji}>👑</Text>
        </Animated.View>

        {/* Avatar */}
        <Animated.View style={[st.avatarSection, avatarAnim]}>
          <LinearGradient
            colors={["#FF6B6B", "#EE5A24"]}
            style={st.avatarCircle}
          >
            <Text style={st.avatarLetter}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Fire Badge */}
        <Animated.View style={[st.fireBadgeContainer, fireAnim]}>
          <LinearGradient
            colors={["#FF8C00", "#FFD700", "#FF6B00"]}
            style={st.fireBadge}
          >
            <View style={st.fireBadgeInner}>
              <Text style={st.fireEmoji}>🔥</Text>
            </View>
            {/* Rank label */}
            <View style={st.rankLabelContainer}>
              <Text style={st.rankNum}>{rank}</Text>
              <Text style={st.rankSuffix}>{getRankSuffix(rank)}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Name */}
        <Text style={st.winnerName}>{name}</Text>

        {/* Score */}
        <Animated.View style={[st.scoreRow, scoreAnim]}>
          <Ionicons name="flame" size={22} color="#FFD700" />
          <Text style={st.scoreText}>
            {parseInt(score).toLocaleString()}
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={st.buttonsContainer}>
          <Pressable
            style={({ pressed }) => [st.btn, pressed && { opacity: 0.85 }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <LinearGradient
              colors={["#2D1B69", "#1A1035"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.btnGradient}
            >
              <Text style={st.btnText}>HOME</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [st.btn, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={["#A855F7", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.btnGradient}
            >
              <Text style={st.btnText}>SHARE</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
  },

  // Title
  congratsTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: C.white,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.5,
  },

  // Crown
  crownContainer: {
    marginBottom: -20,
    zIndex: 10,
  },
  crownEmoji: {
    fontSize: 52,
  },

  // Avatar
  avatarSection: {
    marginBottom: -20,
    zIndex: 5,
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,215,0,0.4)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  avatarLetter: {
    fontSize: 52,
    fontWeight: "900",
    color: C.white,
  },

  // Fire badge
  fireBadgeContainer: {
    zIndex: 15,
    marginBottom: 16,
  },
  fireBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  fireBadgeInner: {
    marginBottom: -4,
  },
  fireEmoji: {
    fontSize: 28,
  },
  rankLabelContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rankNum: {
    fontSize: 20,
    fontWeight: "900",
    color: C.white,
  },
  rankSuffix: {
    fontSize: 10,
    fontWeight: "800",
    color: C.white,
    marginTop: 2,
  },

  // Name
  winnerName: {
    fontSize: 26,
    fontWeight: "800",
    color: C.white,
    textAlign: "center",
    marginBottom: 8,
  },

  // Score
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFD700",
  },

  // Buttons
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  btn: {
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.3)",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 2,
  },
});
