import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useMyPools } from "@/hooks/use-pools";
import { useUserStats } from "@/hooks/use-stats";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
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
  const { profile } = useAuth();
  const { pools: myPools, loading: poolsLoading } = useMyPools();
  const { stats, loading: statsLoading } = useUserStats();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("23:59:59");

  const solBalance = profile?.sol_balance ?? 0;
  const totalPot = myPools.reduce((sum, p) => sum + (p.pot_size ?? 0), 0);
  const activeCount = myPools.length;

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
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          setImageUri(result.assets[0].uri);
        }
      }
    } catch {}
  };

  return (
    <View style={d.container}>
      {/* Full-screen camera background placeholder */}
      <View style={d.cameraBackground}>
        {imageUri ? (
          <View style={d.previewOverlay}>
            <Ionicons name="checkmark-circle" size={64} color={C.primary} />
            <Text style={d.previewText}>Photo captured</Text>
            <Pressable onPress={() => setImageUri(null)} style={d.retakeBtn}>
              <Text style={d.retakeText}>Retake</Text>
            </Pressable>
          </View>
        ) : (
          <View style={d.cameraPlaceholder}>
            <Ionicons name="camera" size={48} color="rgba(255,255,255,0.15)" />
          </View>
        )}
      </View>

      {/* Top floating bar */}
      <SafeAreaView edges={["top"]} style={d.topOverlay}>
        <View style={d.topBar}>
          {/* Left: Profile avatar */}
          <Pressable onPress={() => router.push('/wallet')} style={d.avatarBtn}>
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

          {/* Right: Settings */}
          <Pressable onPress={() => router.push('/wallet')} style={d.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color={C.white} />
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

      {/* Center capture button area */}
      <View style={d.captureArea}>
        {/* Gallery button */}
        <Pressable
          style={d.sideBtn}
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setImageUri(result.assets[0].uri);
            }
          }}
        >
          <Ionicons name="images-outline" size={24} color={C.white} />
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
              <View style={d.captureBtnInner}>
                <Ionicons name="camera" size={32} color={C.white} />
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        {/* Flip camera button */}
        <Pressable style={d.sideBtn}>
          <Ionicons name="camera-reverse-outline" size={24} color={C.white} />
        </Pressable>
      </View>

      {/* Swipe hints */}
      <View style={d.swipeHints}>
        <View style={d.swipeHint}>
          <Ionicons name="chevron-back" size={14} color={C.textMuted} />
          <Text style={d.swipeText}>Pools</Text>
        </View>
        <View style={d.swipeHint}>
          <Text style={d.swipeText}>Leaderboard</Text>
          <Ionicons name="chevron-forward" size={14} color={C.textMuted} />
        </View>
      </View>
    </View>
  );
}

const d = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bgPrimary,
  },
  cameraBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D0D',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
  },
  previewOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,10,0.85)',
    gap: 12,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
  },
  retakeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 8,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
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
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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

  // Capture area
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
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Swipe hints
  swipeHints: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeText: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
  },
});
