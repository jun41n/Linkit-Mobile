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
          backgroundColor: isIOS ? "transparent" : (isWeb ? "rgba(255,255,255,0.78)" : colors.card),
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 80,
          paddingBottom: isWeb ? 30 : 22,
          paddingTop: 12,
        },
        tabBarBackground: () =>
          isIOS ? (
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={95}
                tint={isDark ? "dark" : "systemUltraThinMaterialLight" as any}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? "rgba(20,18,16,0.18)" : "rgba(255,255,255,0.18)" },
                ]}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.65)",
                }}
              />
            </View>
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isWeb ? "rgba(255,255,255,0.78)" : colors.card, borderTopWidth: 1, borderTopColor: colors.border }]} />
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
