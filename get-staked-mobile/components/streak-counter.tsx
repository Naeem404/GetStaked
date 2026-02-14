import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { C, Fonts } from "@/constants/theme";

interface StreakCounterProps {
  days: number;
  size?: "sm" | "xl";
}

export function StreakCounter({ days, size = "sm" }: StreakCounterProps) {
  const flameY = useSharedValue(0);
  const flameOpacity = useSharedValue(1);
  const numScale = useSharedValue(1);

  useEffect(() => {
    if (days > 0) {
      flameY.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(2, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      flameOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 900 }),
          withTiming(1, { duration: 900 })
        ),
        -1,
        true
      );
    }
  }, [days]);

  useEffect(() => {
    numScale.value = withSequence(
      withSpring(1.2, { damping: 6 }),
      withSpring(1, { damping: 8 })
    );
  }, [days]);

  const flameAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: flameY.value }],
    opacity: flameOpacity.value,
  }));

  const numAnim = useAnimatedStyle(() => ({
    transform: [{ scale: numScale.value }],
  }));

  const flameColor = days === 0 ? C.textMuted : C.primary;

  if (size === "xl") {
    return (
      <View style={s.xlContainer}>
        <Animated.View style={flameAnim}>
          <Ionicons name="flame" size={72} color={flameColor} />
        </Animated.View>
        <Animated.View style={numAnim}>
          <Text style={[s.xlNumber, days >= 15 && { color: C.accent }]}>
            {days === 0 ? "—" : days}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.smContainer}>
      <Animated.View style={flameAnim}>
        <Ionicons name="flame" size={18} color={flameColor} />
      </Animated.View>
      <Animated.View style={numAnim}>
        <Text style={s.smNumber}>{days === 0 ? "—" : days}</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  xlContainer: { alignItems: "center", gap: 4 },
  xlNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: C.textPrimary,
    fontFamily: Fonts.mono,
  },
  smContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  smNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
    fontFamily: Fonts.mono,
  },
});
