import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, Spacing } from '@/constants/theme';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bgPrimary }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: 'rgba(10,10,10,0.95)',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: StyleSheet.hairlineWidth,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 6,
            elevation: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarActiveTintColor: C.primary,
          tabBarInactiveTintColor: C.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        {/* Left: Pools */}
        <Tabs.Screen
          name="pools"
          options={{
            title: 'Pools',
            tabBarIcon: ({ focused }) => (
              <View style={tabStyles.tabItem}>
                <Ionicons
                  name={focused ? "layers" : "layers-outline"}
                  size={22}
                  color={focused ? C.primary : C.textMuted}
                />
              </View>
            ),
          }}
        />

        {/* Center: Camera (main screen) */}
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={tabStyles.captureContainer}>
                <View style={[tabStyles.captureRing, focused && tabStyles.captureRingActive]}>
                  <LinearGradient
                    colors={[C.primary, '#4ADE80']}
                    style={tabStyles.captureBtn}
                  >
                    <Ionicons name="camera" size={28} color={C.white} />
                  </LinearGradient>
                </View>
              </View>
            ),
          }}
        />

        {/* Right: Leaderboard */}
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Leaderboard',
            tabBarIcon: ({ focused }) => (
              <View style={tabStyles.tabItem}>
                <Ionicons
                  name={focused ? "trophy" : "trophy-outline"}
                  size={22}
                  color={focused ? C.primary : C.textMuted}
                />
              </View>
            ),
          }}
        />

        {/* Hidden screens */}
        <Tabs.Screen name="prove" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  captureRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  captureRingActive: {
    borderColor: C.primary,
  },
  captureBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
});
