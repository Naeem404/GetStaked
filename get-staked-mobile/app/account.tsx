import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { C, Spacing, Radius } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";

export default function AccountScreen() {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.display_name || "User";
  const email = user?.email || "—";
  const initial = displayName[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth");
        },
      },
    ]);
  };

  const menuItems = [
    { icon: "wallet-outline" as const, label: "Wallet", desc: "Manage your Solana wallet", onPress: () => router.push("/wallet") },
    { icon: "people-outline" as const, label: "Friends", desc: "View and manage friends", onPress: () => router.push("/friends") },
    { icon: "notifications-outline" as const, label: "Notifications", desc: "Manage notification preferences", onPress: () => {} },
    { icon: "shield-checkmark-outline" as const, label: "Privacy & Security", desc: "Account security settings", onPress: () => {} },
    { icon: "help-circle-outline" as const, label: "Help & Support", desc: "Get help or report an issue", onPress: () => {} },
    { icon: "information-circle-outline" as const, label: "About", desc: "App version and info", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>Account</Text>
        <Pressable onPress={() => router.push("/wallet")} style={s.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <LinearGradient colors={[C.primary, "#4ADE80"]} style={s.avatarLarge}>
            <Text style={s.avatarLargeText}>{initial}</Text>
          </LinearGradient>
          <Text style={s.displayName}>{displayName}</Text>
          <Text style={s.email}>{email}</Text>

          <Pressable style={s.editProfileBtn}>
            <Ionicons name="create-outline" size={16} color={C.primary} />
            <Text style={s.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Menu Items */}
        <View style={s.menuSection}>
          {menuItems.map((item, i) => (
            <Pressable
              key={item.label}
              style={[s.menuItem, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
            >
              <View style={s.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={C.primary} />
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* Log Out */}
        <Pressable style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={C.danger} />
          <Text style={s.logoutText}>Log Out</Text>
        </Pressable>

        {/* Version */}
        <Text style={s.version}>GetStaked v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingBottom: 60 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textPrimary,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  // Profile card
  profileCard: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: "900",
    color: C.white,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: Spacing.lg,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: C.primaryDim,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.primary,
  },

  // Menu
  menuSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.xl,
    backgroundColor: C.bgSurface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(34,197,94,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuInfo: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: C.textPrimary,
  },
  menuDesc: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: Spacing.xxl,
    marginHorizontal: Spacing.xl,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.danger,
  },

  // Version
  version: {
    textAlign: "center",
    fontSize: 12,
    color: C.textMuted,
    marginTop: Spacing.xl,
  },
});
