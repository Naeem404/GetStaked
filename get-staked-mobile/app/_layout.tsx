import "react-native-get-random-values"; // MUST be first import for Phantom SDK crypto
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider } from "@/lib/auth-context";
import { PhantomProvider, AddressType, darkTheme } from "@phantom/react-native-sdk";
import { PHANTOM_APP_ID } from "@/lib/wallet";

export default function RootLayout() {
  return (
    <PhantomProvider
      config={{
        providers: ["google", "apple"],
        appId: PHANTOM_APP_ID,
        scheme: "getstaked",
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl: "getstaked://phantom-auth-callback",
        },
      }}
      theme={darkTheme}
      appName="Get Staked"
    >
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0A0A0A" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0A0A0A" },
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
          <Stack.Screen name="congratulations" options={{ presentation: "modal", animation: "fade" }} />
        </Stack>
      </AuthProvider>
    </PhantomProvider>
  );
}
