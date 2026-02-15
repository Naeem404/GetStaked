import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const steps = [
  { icon: "shield-checkmark" as const, title: "STAKE", desc: "Join a pool & stake SOL on your habit" },
  { icon: "camera" as const, title: "PROVE", desc: "Submit daily photo proof. AI verifies." },
  { icon: "trophy" as const, title: "WIN", desc: "Complete the challenge, win the pot" },
];

function useLandingStats() {
  const [stats, setStats] = useState([
    { value: "--", label: "Active Stakers" },
    { value: "--", label: "Live Pools" },
    { value: "--", label: "SOL Staked" },
    { value: "--", label: "Pools Won" },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [membersRes, poolsRes, wonRes] = await Promise.all([
          supabase.from("pool_members").select("user_id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("pools").select("id, pot_size", { count: "exact" }).eq("status", "active"),
          supabase.from("pools").select("id", { count: "exact", head: true }).eq("status", "completed"),
        ]);

        const stakers = membersRes.count ?? 0;
        const livePools = poolsRes.count ?? 0;
        const totalSol = (poolsRes.data ?? []).reduce((sum: number, p: any) => sum + (p.pot_size ?? 0), 0);
        const poolsWon = wonRes.count ?? 0;

        const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
        const fmtSol = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toFixed(1);

        setStats([
          { value: fmt(stakers), label: "Active Stakers" },
          { value: fmt(livePools), label: "Live Pools" },
          { value: fmtSol(totalSol), label: "SOL Staked" },
          { value: fmt(poolsWon), label: "Pools Won" },
        ]);
      } catch {
        // Keep defaults on error
      }
    })();
  }, []);

  return stats;
}

export default function LandingPage() {
  const { session, loading } = useAuth();
  const stats = useLandingStats();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/(tabs)");
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Live badge */}
        <View style={s.badgeRow}>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>Live on Solana Devnet</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroLine}>Stake Money.</Text>
          <Text style={s.heroLine}>Build Habits.</Text>
          <Text style={s.heroLineGreen}>Win Big.</Text>

          <Text style={s.subtitle}>
            Put your money where your mouth is. Stake SOL on your habits,
            get AI-verified, and split the losers' money.
          </Text>

          <Pressable onPress={() => router.push("/auth")}>
            <LinearGradient
              colors={[C.primary, '#4ADE80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Start Staking</Text>
              <Ionicons name="arrow-forward" size={20} color={C.white} />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push("/auth")} style={s.secondaryBtn}>
            <Text style={s.secondaryText}>View Active Pools</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={s.statItem}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How It Works</Text>

          {steps.map((step, i) => (
            <View key={step.title}>
              <View style={s.stepRow}>
                <LinearGradient
                  colors={[C.primary, '#4ADE80']}
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

  badgeRow: { alignItems: 'center', paddingTop: 40, marginBottom: 24 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primaryDim,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  liveText: { fontSize: 13, fontWeight: '600', color: C.primary },

  hero: { alignItems: "center", paddingBottom: 32 },
  heroLine: {
    fontSize: 40,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: -1,
    lineHeight: 48,
  },
  heroLineGreen: {
    fontSize: 40,
    fontWeight: "800",
    color: C.primary,
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: Radius.lg,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: { fontSize: 18, fontWeight: "700", color: C.white },
  secondaryBtn: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.lg,
    backgroundColor: C.bgSurface,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryText: { fontSize: 16, fontWeight: '600', color: C.textPrimary },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', color: C.textPrimary },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  section: { paddingTop: 8, paddingBottom: 32 },
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
