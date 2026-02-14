import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, Spacing, Radius, Fonts } from "@/constants/theme";

const pools = [
  {
    id: "1",
    emoji: "🏃",
    name: "Morning Run Club",
    duration: "7 days",
    stake: "0.5 SOL",
    players: 12,
    maxPlayers: 20,
    potSize: "6.0 SOL",
    category: "fitness",
    hot: true,
  },
  {
    id: "2",
    emoji: "📚",
    name: "Daily Reader",
    duration: "14 days",
    stake: "0.5 SOL",
    players: 8,
    maxPlayers: 15,
    potSize: "4.0 SOL",
    category: "education",
    hot: false,
  },
  {
    id: "3",
    emoji: "🧘",
    name: "Meditation Master",
    duration: "30 days",
    stake: "1.0 SOL",
    players: 5,
    maxPlayers: 10,
    potSize: "5.0 SOL",
    category: "wellness",
    hot: false,
  },
  {
    id: "4",
    emoji: "💻",
    name: "Ship Code Daily",
    duration: "7 days",
    stake: "1.0 SOL",
    players: 15,
    maxPlayers: 20,
    potSize: "15.0 SOL",
    category: "productivity",
    hot: true,
  },
  {
    id: "5",
    emoji: "🎸",
    name: "Practice Guitar",
    duration: "14 days",
    stake: "0.25 SOL",
    players: 6,
    maxPlayers: 12,
    potSize: "1.5 SOL",
    category: "creative",
    hot: false,
  },
];

const categories = ["All", "Fitness", "Education", "Wellness", "Productivity"];

export default function PoolsScreen() {
  return (
    <SafeAreaView style={p.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={p.scroll}>
        {/* Header */}
        <View style={p.header}>
          <Text style={p.title}>Browse Pools</Text>
          <Pressable style={p.filterBtn}>
            <Ionicons name="filter" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={p.catRow}
        >
          {categories.map((cat, i) => (
            <Pressable
              key={cat}
              style={[p.catPill, i === 0 && p.catPillActive]}
            >
              <Text style={[p.catText, i === 0 && p.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Pool Cards */}
        <View style={p.list}>
          {pools.map((pool) => (
            <Pressable
              key={pool.id}
              style={({ pressed }) => [
                p.card,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              {/* Top row */}
              <View style={p.cardTop}>
                <View style={p.cardLeft}>
                  <Text style={p.cardEmoji}>{pool.emoji}</Text>
                  <View>
                    <View style={p.nameRow}>
                      <Text style={p.cardName}>{pool.name}</Text>
                      {pool.hot && (
                        <View style={p.hotBadge}>
                          <Text style={p.hotText}>🔥 HOT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={p.cardMeta}>{pool.duration} · {pool.stake} entry</Text>
                  </View>
                </View>
              </View>

              {/* Stats row */}
              <View style={p.statsRow}>
                <View style={p.stat}>
                  <Ionicons name="people-outline" size={14} color={C.textMuted} />
                  <Text style={p.statText}>{pool.players}/{pool.maxPlayers}</Text>
                </View>
                <View style={p.stat}>
                  <Ionicons name="wallet-outline" size={14} color={C.textMuted} />
                  <Text style={p.statText}>{pool.potSize}</Text>
                </View>
              </View>

              {/* Players bar */}
              <View style={p.barBg}>
                <View
                  style={[
                    p.barFill,
                    { width: `${(pool.players / pool.maxPlayers) * 100}%` },
                  ]}
                />
              </View>

              {/* Join button */}
              <Pressable>
                <LinearGradient
                  colors={[C.brandFire, C.brandGold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={p.joinBtn}
                >
                  <Text style={p.joinText}>Join · {pool.stake}</Text>
                </LinearGradient>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: { fontSize: 24, fontWeight: "800", color: C.textPrimary },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  catRow: { paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.xl },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  catPillActive: {
    backgroundColor: C.fireDim,
    borderColor: C.brandFire,
  },
  catText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  catTextActive: { color: C.brandFire },
  list: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  card: {
    backgroundColor: C.bgSurface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cardEmoji: { fontSize: 32 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  hotBadge: {
    backgroundColor: C.fireDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  hotText: { fontSize: 10, fontWeight: "700", color: C.brandFire },
  cardMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: Spacing.md,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: C.textMuted, fontFamily: Fonts.mono },
  barBg: {
    height: 4,
    backgroundColor: C.bgHover,
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: C.brandFire,
    borderRadius: 2,
  },
  joinBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  joinText: { fontSize: 14, fontWeight: "700", color: C.white },
});
