import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#06060A" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#06060A" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" options={{ presentation: "modal" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create-pool" options={{ presentation: "modal" }} />
        <Stack.Screen name="friends" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="confirm-email" options={{ presentation: "modal" }} />
      </Stack>
    </AuthProvider>
  );
}
