import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#06060A" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#06060A" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
