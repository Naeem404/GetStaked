import { Redirect } from 'expo-router';

// Explore functionality is handled by the Pools tab.
export default function ExploreScreen() {
  return <Redirect href="/(tabs)/pools" />;
}
