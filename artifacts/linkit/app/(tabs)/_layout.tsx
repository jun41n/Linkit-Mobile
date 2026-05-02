import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 76,
          paddingBottom: isWeb ? 30 : 20,
          paddingTop: 12,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={70} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "happy" : "happy-outline"} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
