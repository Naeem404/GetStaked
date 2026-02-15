import { Redirect } from 'expo-router';

// Proof submission now lives in the camera tab (index.tsx).
// This screen is kept as a redirect for any lingering references.
export default function ProveScreen() {
  return <Redirect href="/(tabs)" />;
}
