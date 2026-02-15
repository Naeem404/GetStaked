import { View, Text, StyleSheet, Pressable, Dimensions, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useMyPools } from "@/hooks/use-pools";
import { useUserStats } from "@/hooks/use-stats";
import { useState, useEffect, useRef } from "react";
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
  const { profile } = useAuth();
  const { pools: myPools, loading: poolsLoading } = useMyPools();
  const { stats, loading: statsLoading } = useUserStats();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("23:59:59");
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const totalPot = myPools.reduce((sum, p) => sum + (p.pot_size ?? 0), 0);
  const activeCount = myPools.length;

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
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
          setImageUri(photo.uri);
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

          {/* Spacer to keep center aligned */}
          <View style={{ width: 38 }} />
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
      {imageUri && (
        <View style={d.previewOverlay}>
          <Ionicons name="checkmark-circle" size={64} color={C.primary} />
          <Text style={d.previewText}>Photo captured</Text>
          <Pressable onPress={() => setImageUri(null)} style={d.retakeBtn}>
            <Text style={d.retakeText}>Retake</Text>
          </Pressable>
        </View>
      )}

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

          {/* Flash toggle */}
          <Pressable style={d.sideBtn}>
            <Ionicons name="flash-outline" size={24} color={C.white} />
          </Pressable>
        </View>
      )}

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

});
