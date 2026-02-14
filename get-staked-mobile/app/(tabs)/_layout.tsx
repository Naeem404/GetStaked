import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '@/constants/theme';
import { CoachBubble } from '@/components/coach-bubble';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bgPrimary }}>
    <CoachBubble />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: C.bgElevated,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.tabItem}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? C.brandFire : C.textMuted}
              />
              {focused && <View style={tabStyles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pools"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.tabItem}>
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={22}
                color={focused ? C.brandFire : C.textMuted}
              />
              {focused && <View style={tabStyles.activeDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="prove"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.proveContainer}>
              <LinearGradient
                colors={[C.brandFire, C.brandGold]}
                style={tabStyles.proveBtn}
              >
                <Ionicons name="camera" size={26} color={C.white} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.tabItem}>
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={22}
                color={focused ? C.brandFire : C.textMuted}
              />
              {focused && <View style={tabStyles.activeDot} />}
            </View>
          ),
        }}
      />
      {/* Hide explore from tabs */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.brandFire,
  },
  proveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  proveBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.brandFire,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
