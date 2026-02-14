import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const steps = [
  { icon: "shield-checkmark" as const, title: "STAKE", desc: "Join a pool & stake SOL on your habit" },
  { icon: "camera" as const, title: "PROVE", desc: "Submit daily photo proof. AI verifies." },
  { icon: "trophy" as const, title: "WIN", desc: "Complete the challenge, win the pot" },
];

export default function LandingPage() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(tabs)");
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={C.brandFire} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.logo}>🔥</Text>
          <Text style={s.title}>GET STAKED</Text>
          <Text style={s.subtitle}>
            Stake SOL on your habits.{"\n"}Win or lose. No excuses.
          </Text>
          <Text style={s.desc}>
            Join competitive pools, submit photo proof, and let AI verify.
            Winners split the pot.
          </Text>

          <Pressable onPress={() => router.push("/auth")}>
            <LinearGradient
              colors={[C.brandFire, C.brandGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Connect Wallet</Text>
              <Ionicons name="arrow-forward" size={20} color={C.white} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* How It Works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How It Works</Text>

          {steps.map((step, i) => (
            <View key={step.title}>
              <View style={s.stepRow}>
                <LinearGradient
                  colors={[C.brandFire, C.brandGold]}
                  style={s.stepIcon}
                >
                  <Ionicons name={step.icon} size={28} color={C.white} />
                </LinearGradient>
                <View style={s.stepText}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepDesc}>{step.desc}</Text>
                </View>
              </View>
              {i < steps.length - 1 && <View style={s.connector} />}
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          Built on Solana · AI-verified · Trustless escrow
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  hero: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: C.brandFire,
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 16,
  },
  desc: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: Radius.xl,
  },
  ctaText: { fontSize: 18, fontWeight: "700", color: C.white },
  section: { paddingTop: 24, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.textPrimary,
    textAlign: "center",
    marginBottom: 32,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: C.textSecondary, lineHeight: 20 },
  connector: {
    width: 2,
    height: 24,
    backgroundColor: C.bgElevated,
    marginLeft: 27,
    marginVertical: 8,
  },
  footer: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    marginTop: 16,
  },
});
